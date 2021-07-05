// constraints for pagination
const moviesForm = document.getElementById("moviesForm")
var cardsData = []
var currentPage = 1
var maxPage = 0
const lim = 4
const pagination = document.getElementById("pagination")

// make card / div from given data
makeCards = (data) => {
	const cards = document.getElementById("cards")
	const resultText = document.getElementById("resultText")
	resultText.className = resultText.className.replace(" active", "") + " active"
	cards.innerHTML = ""
	data.forEach(i => {
		const adult = i.adult ? "Adult" : "Not Adult"
		const date = i.releaseDate
		const title = i.title
		if (title.length > 40) {
			return
		}
		var description
		if (title.length > 15) {
			description = i.description.slice(0, 50) + " ..."
		} else {
			description = i.description.slice(0, 70) + " ..."
		}
		const imgUrl = i.img
		const card = document.createElement("div")
		card.className = "card"
		const movieImg = document.createElement("img")
		movieImg.className = "movieImg"
		movieImg.src = imgUrl
		const movieTitle = document.createElement("h2")
		movieTitle.className = "movieTitle"
		movieTitle.innerText = title
		const movieText = document.createElement("p")
		movieText.className = "movieText"
		movieText.innerText = description
		const section = document.createElement("section")
		const movieDate = document.createElement("span")
		movieDate.className = "movieDate"
		movieDate.innerText = date
		const movieAdult = document.createElement("span")
		movieAdult.className = "movieAdult"
		movieAdult.innerText = adult
		section.appendChild(movieDate)
		section.appendChild(movieAdult)
		card.appendChild(movieImg)
		card.appendChild(movieTitle)
		card.appendChild(movieText)
		card.appendChild(section)
		card.addEventListener("click", () => {
			location.href = i.movieUrl
		})
		cards.appendChild(card)
		cardsData.push(card)
	})
}

// get data from api as required
handleSubmit = (e) => {
	const movies = e.target.moviesInput.value.trim()
	fetch("https://imaginexapi.root.sx/movies", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({movies: movies})
	})
		.then(data => data.json())
		.then(data => {
			makeCards(data)
			maxPage = parseInt(cardsData.length / lim)
			move(currentPage)
			pagination.className = pagination.className.replace(" active", "") + " active"
		})
}

// prevent default actions when the form is submitted
moviesForm.addEventListener("submit", (e) => {
	e.preventDefault()
	handleSubmit(e)
})

// move to nth page
const move = (pageNo) => {
  currentPage = pageNo
  const from = (currentPage - 1) * lim
  const to = currentPage * lim
  const cards = document.getElementById("cards")
  cards.innerHTML = ""
  const add = cardsData.slice(from, to)
  add.forEach(i => {
    i.className = i.className.replace(" active", "") + " active"
    cards.appendChild(i)
  })
  const prevB = document.getElementById("prev")
  const nextB = document.getElementById("next")
  if (currentPage <= 1) {
    prevB.setAttribute("disabled", "disabled")// = true
  } else {
    prevB.removeAttribute("disabled")// = false
  }
  if (currentPage >= maxPage) {
    nextB.setAttribute("disabled", "disabled")// = true
  } else {
    nextB.removeAttribute("disabled")// = false
  }
  pagination.className = pagination.className.replace(" active", "") + " active"

}

// helper function that moves to the previous page
const previous = () => {
  move(currentPage - 1)
}

// helper function that moves to the next page

const next = () => {
  move(currentPage + 1)
}