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
