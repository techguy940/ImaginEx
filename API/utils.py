import requests

TMDB_API_KEY = ""

headers = {"TRN-Api-Key": ""}
platforms = {"psn": "Playstation Network", "origin": "Origin", "xbl": "XBOX Live"}

def get_movie_id(name):
	url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&language=en-US&query={name}&page=1&include_adult=true"
	r = requests.get(url)
	res = r.json()
	if not res['results']:
		return None
	movie_id = res['results'][0]['id']
	return movie_id


def get_recommended_movies(movie_ids):
	recommendations = []
	for i in movie_ids:
		url = f"https://api.themoviedb.org/3/movie/{i}/recommendations?api_key={TMDB_API_KEY}&language=en-US&page=1"
		r = requests.get(url)
		res = r.json()
		if not res.get('results'):
			break
		results = res['results']
		for j in results:
			data = {}
			data['adult'] = j['adult']
			data['title'] = j['original_title']
			data['description'] = j['overview']
			data['img'] = 'https://www.themoviedb.org//t/p/w300_and_h450_bestv2' + j['poster_path']
			data['releaseDate'] = "/".join(j['release_date'].split("-")[::-1])
			data['movieUrl'] = f"https://www.themoviedb.org/movie/{j['id']}"
			recommendations.append(data)
	return recommendations
# this website allows scraping
def get_courses():
    lim = 250 # can be less sometimes
    courses = {}
    start = 1
    url = "https://www.discudemy.com/language/English/"
    while len(courses) < lim:
        data = requests.get(url + str(start)).text
        soup = BeautifulSoup(data, "html.parser")
        cards = soup.find_all("section", class_="card")
        cards = [i for i in cards if i.find("label").text == "Free"]
        for i in cards:
            img = i.find("div", class_="image")
            img = img.find("amp-img")
            src = img["src"].strip().replace("img-a", "img-c")
            desc = i.find("div", class_="description")
            desc = desc.text.strip()
            anchor = i.find("a")
            anchor_url = anchor["href"]
            name = anchor.text.strip()
            coupon = anchor_url.split("/")[-1]
            coupon_url = "https://discudemy.com/go/" + coupon
            res = requests.get(coupon_url).text
            coupon_soup = BeautifulSoup(res, "html.parser")
            ui_element = coupon_soup.find("div", class_="ui segment")
            coupon_final = ui_element.find("a")["href"].strip()
            courses[name] = {
                "name": name,
                "img": src,
                "description": desc,
                "url": coupon_final,
            }
        start += 1
    return courses
