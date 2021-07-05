# imports
from flask import Flask, request, jsonify
from flask_cors import CORS
from pypfopt.efficient_frontier import EfficientFrontier
from pypfopt import risk_models
from pypfopt import expected_returns
from pypfopt.discrete_allocation import DiscreteAllocation, get_latest_prices
from bs4 import BeautifulSoup
from abbreviations import abbrs
from utils import TMDB_API_KEY, headers, platforms, get_movie_id, get_recommended_movies, get_courses
import requests
import pandas as pd
from threading import Thread
import time
import json
import random

app = Flask(__name__)
CORS(app)

# read the stocks data
df = pd.read_csv("combined.csv")
df = df.set_index(pd.DatetimeIndex(df["Date"].values))
df.drop(columns=["Date"], axis=1, inplace=True)

# build the model
mu = expected_returns.mean_historical_return(df)
S = risk_models.sample_cov(df)

class CoursesData:
  courses = get_courses()

# every 15 minutes
def fetch_courses():
    while True:
        time.sleep(900)
        # print("Running")
        CoursesData.courses = get_courses()

# returns link to be used for showing past websites
@app.route("/wayback", methods=["POST", "GET"])
def wayback():
    data = request.json
    url = data.get("url", None)
    year = data.get("year", 2015)
    month = data.get("month", 1)
    day = data.get("day", 1)
    timestamp = f"{year}{month}{day}"
    r = requests.get(
        f"http://archive.org/wayback/available?url={url}&timestamp={timestamp}"
    )
    r = r.json()
    if r["archived_snapshots"]:
        return jsonify(
            {"error": False, "url": r["archived_snapshots"]["closest"]["url"]}
        )
    return jsonify({"error": True})

# returns allocated stocks, leftover amount, CAGR, Volatility and Max Sharpe Ratio
@app.route("/portfolio", methods=["POST", "GET"])
def portfolio():
    data = request.json
    portfolio_value = int(data.get("amt", 0))
    if portfolio_value < 100 or portfolio_value >= 999999:
        return jsonify({"error": "`portfolio_value` must be between 100 to 999999"})
    diverse = data.get("diversify", False)
    weight_bounds = (0, 0.1) if diverse else (0, 1)
    ef = EfficientFrontier(mu, S, weight_bounds=weight_bounds)
    weights = ef.max_sharpe()
    cleaned_weights = ef.clean_weights()
    annual, risk, sharpe = ef.portfolio_performance()
    annual *= 100
    risk *= 100
    annual, risk, sharpe = round(annual, 2), round(risk, 2), round(sharpe, 5)
    latest_prices = get_latest_prices(df)
    weights = cleaned_weights
    da = DiscreteAllocation(
        weights, latest_prices, total_portfolio_value=portfolio_value
    )
    allocation, leftover = da.greedy_portfolio()
    allocation = {
        k: v for (k, v) in sorted(allocation.items(), key=lambda x: x[1], reverse=True)
    }
    for i in allocation:
        allocation[i] = {"name": abbrs[i], "value": allocation[i]}
    return jsonify(
        {
            "allocated": allocation,
            "leftover": leftover,
            "meta": {"annualReturns": annual, "risk": risk, "sharpeRatio": sharpe},
        }
    )

# returns the discounted Udemy Course
@app.route("/courses")
def get_courses():
    return jsonify(CoursesData.courses)

# returns the stats for the given CSGO username
@app.route("/csgo", methods=["POST", "GET"])
def csgo():
    data = request.json
    identifier = data.get("identifier", "")
    r = requests.get(
        f"https://public-api.tracker.gg/v2/csgo/standard/profile/steam/{identifier}",
        headers=headers,
    )
    res = r.json()
    if res.get("errors"):
        return jsonify({"error": "Username is invalid"})
    cats = {}
    data = res["data"]["segments"][0]["stats"]
    for i in data:
        cats[data[i]["displayCategory"]] = {}
    for i in data:
        cats[data[i]["displayCategory"]][data[i]["displayName"]] = data[i][
            "displayValue"
        ]
    cats["Combat"] = {
        k: v
        for (k, v) in list(cats["Combat"].items())
        if k
        in (
            "Kills",
            "Deaths",
            "K/D",
            "Headshots",
            "Shots Fired",
            "Headshot %",
            "Dominations",
        )
    }
    cats["avatarData"] = {
        "username": res["data"]["platformInfo"]["platformUserHandle"],
        "platform": "Steam",
        "avatarUrl": res["data"]["platformInfo"]["avatarUrl"],
    }
    return jsonify(cats)

# returns the stats for the given Apex Legends username
@app.route("/apex", methods=["POST", "GET"])
def apex():
    data = request.json
    identifier = data.get("identifier", "Yukimra_JPN")
    platform = data.get("platform", "origin")
    r = requests.get(
        f"https://public-api.tracker.gg/v2/apex/standard/profile/{platform}/{identifier}",
        headers=headers,
    )
    res = r.json()
    if res.get("errors"):
        print(res["errors"])
        return jsonify({"error": "Username is invalid"})
    cats = {}
    data = res["data"]["segments"][0]["stats"]
    for i in data:
        cats[data[i]["displayCategory"]] = {}
    for i in data:
        cats[data[i]["displayCategory"]][data[i]["displayName"]] = data[i][
            "displayValue"
        ]
    legend = res["data"]["segments"][1]["stats"]
    cats["Selected Legend"] = {"Name": res["data"]["segments"][1]["metadata"]["name"]}
    for i in legend:
        cats["Selected Legend"][legend[i]["displayName"]] = legend[i]["displayValue"]
    cats["Kills Per Legend"] = {}
    legends_data = res["data"]["segments"][1:]
    for i in legends_data:
        if i["stats"].get("kills"):
            cats["Kills Per Legend"][i["metadata"]["name"]] = i["stats"]["kills"][
                "displayValue"
            ]
    cats["avatarData"] = {
        "username": res["data"]["platformInfo"]["platformUserHandle"],
        "platform": platforms[platform],
        "avatarUrl": res["data"]["platformInfo"]["avatarUrl"],
    }
    del cats["Weapons"]
    return jsonify(cats)

# returns the stats for the given Fortnite username
@app.route("/fortnite", methods=["POST", "GET"])
def fortnite():
    data = request.json
    identifier = data.get("identifier", "Ninja")
    platform = data.get("platform", "kbm")
    r = requests.get(
        f"https://api.fortnitetracker.com/v1/profile/{platform}/{identifier}",
        headers=headers,
    )
    res = r.json()
    if res.get("errors"):
        return jsonify({"error": "Username is invalid"})
    cats = {}
    try:
        lifetime = res["lifeTimeStats"]
    except:
        return jsonify({"error": "Username is invalid"})
    score = [i["value"] for i in lifetime if i["key"] == "Score"][0]
    cats["Lifetime"] = {}
    for i in lifetime:
        if i["key"] in ("Top 10", "Matches Played", "Wins", "Win%", "Kills", "K/d"):
            key = i["key"]
            value = i["value"]
            if key == "Win%":
                key = "Win %"
            elif key not in ("Win%", "Win %", "K/d"):
                value = f"{int(value):,}"
            cats["Lifetime"][key] = value
    stats = res["stats"]
    solo = stats["p2"]
    cats["Solo"] = {}
    for i in solo:
        if i in ("top1", "top10", "kills", "kd", "winRatio", "matches"):
            label = solo[i]["label"]
            value = solo[i]["displayValue"]
            if label == "Matches":
                label = "Matches Played"
            elif label == "Win %":
                value += "%"

            cats["Solo"][label] = solo[i]["displayValue"]

    duos = stats["p10"]
    cats["Duos"] = {}
    for i in duos:
        if i in ("top1", "top10", "kills", "kd", "winRatio", "matches"):
            label = duos[i]["label"]
            value = duos[i]["displayValue"]
            if label == "Matches":
                label = "Matches Played"
            elif label == "Win %":
                value += "%"
            cats["Duos"][label] = value

    squads = stats["p9"]
    cats["Squads"] = {}
    for i in squads:
        if i in ("top1", "top10", "kills", "kd", "winRatio", "matches"):
            label = squads[i]["label"]
            value = squads[i]["displayValue"]
            if label == "Matches":
                label = "Matches Played"
            elif label == "Win %":
                value += "%"
            cats["Squads"][label] = value
    cats["avatarData"] = {
        "username": res["epicUserHandle"],
        "score": score,
        "avatarUrl": res["avatar"],
    }
    return jsonify(cats)

# returns a list of recommended movies based on given inputs
@app.route("/movies", methods=["POST", "GET"])
def movies():
    data = request.json
    movies = data["movies"].replace(", ", ",").split(",")
    movie_ids = [get_movie_id(name) for name in movies]
    recommendations = get_recommended_movies(movie_ids)
    random.shuffle(recommendations)
    return jsonify(recommendations)

# returns a list of free public APIs
@app.route("/apilist")
def apilist():
    r = requests.get("https://api.publicapis.org/entries")
    res = r.json()
    return jsonify(res["entries"])

# start the app and thread
Thread(target=fetch_courses).start()
# replace with waitress.serve() to publish in production
app.run(debug=True)
