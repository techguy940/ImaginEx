// pagination constraints
var cardsData = []
var currentPage = 1
var maxPage = 0
const lim = 12
const pagination = document.getElementById("pagination")

// make a card from given data
makeCard = (data, key) => {
	const course = data[key]
	const name = course.name
	const img = course.img
	const description = course.description
	const url = course.url
	const card = document.createElement("div")
	card.className = "card"
	const cardTitle = document.createElement("p")
	cardTitle.className = "cardTitle"
	cardTitle.innerText = name
	const cardDesc = document.createElement("p")
	cardDesc.className = "cardDesc"
	cardDesc.innerText = description
	const cardImg = document.createElement("img")
	cardImg.src = img
	cardImg.className = "cardImg"
	const cardUrl = document.createElement("a")
	cardUrl.className = "cardUrl"
	cardUrl.innerText = "Enroll in the course"
	cardUrl.href = url
	card.appendChild(cardTitle)
	card.appendChild(cardDesc)
	card.appendChild(cardImg)
	card.appendChild(cardUrl)
	return card
}

// update cards in the results
setCards = (data) => {
	const cardsDiv = document.getElementById("cardsDiv")
	const keys = Object.keys(data)
	keys.forEach(key => {
		const card = makeCard(data, key)
		cardsDiv.appendChild(card)
		cardsData.push(card)
	})
}

// fetch courses data from the API
fetch("https://imaginexapi.root.sx/courses")
	.then(data => data.json())
	.then(data => {
		setCards(data)
		maxPage = parseInt(cardsData.length / lim)
		move(currentPage)
		pagination.className = pagination.className.replace(" active", "") + " active"
	}
)

// update the cards when a word is pressed / erase if the card contains that word
const searchInp = document.getElementById("searchInp")
searchInp.addEventListener("keyup", (e) => {
	if (e.target.value.trim().length <= 0) {
		move(1)
		return
	}
	pagination.className = pagination.className.replace(" active", "")
	const cardsDiv = document.getElementById("cardsDiv")
	const term = e.target.value.trim()
	const _cards = cardsData
	const cards = Array.from(_cards)
	cards.forEach(card => {
		const cardTitle = card.querySelector(".cardTitle")
		if (cardTitle.innerText.toLowerCase().includes(term.toLowerCase())) {
			card.className = card.className.replace(" active", "") + " active"
			cardsDiv.appendChild(card)
		} else if (!cardTitle.innerText.toLowerCase().includes(term.toLowerCase()) && card.className.includes("active")) {
			card.className = card.className.replace(" active", "")
		}
	})
})

// move to nth page
const move = (pageNo) => {
  currentPage = pageNo
  const from = (currentPage - 1) * lim
  const to = currentPage * lim
  const cards = document.getElementById("cardsDiv")
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