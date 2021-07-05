// constraints for pagination
var apisArr = []
var cardsData = []
var currentPage = 1
var maxPage = 0
const lim = 12
const pagination = document.getElementById("pagination")

// to make the first character of the given string capital
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// returns an HTML object (card) with all details of an API 
const makeCard = (i) => {
	const card = document.createElement("div")
	card.className = `card ${i.Category.toLowerCase()}`
	const apiTitle = document.createElement("h2")
	apiTitle.className = "apiTitle"
	apiTitle.innerText = i.API
	const apiDescription = document.createElement("p")
	apiDescription.className = "apiDescription"
	apiDescription.innerText = i.Description
	const apiMeta = document.createElement("section")
	apiMeta.className = "apiMeta"
	const apiCategory = document.createElement("p")
	apiCategory.className = "apiCategory"
	apiCategory.innerText = "Category: " + i.Category
	const apiAuth = document.createElement("p")
	apiAuth.className = "apiAuth"
	if (i.Auth == "apiKey") {
		apiAuth.innerText = "Auth: API Key"
	} else {
		apiAuth.innerText = "Auth: " + (i.Auth ? i.Auth : "None")
	}
	const apiHttps = document.createElement("p")
	apiHttps.className = "apiHttps"
	apiHttps.innerHTML = "HTTPS: " + (i.HTTPS ? "Yes" : "No")
	const apiCors = document.createElement("p")
	apiCors.className = "apiCors"
	apiCors.innerText = "CORS: " + i.Cors.capitalize()
	apiMeta.appendChild(apiCategory)
	apiMeta.appendChild(apiAuth)
	apiMeta.appendChild(apiHttps)
	apiMeta.appendChild(apiCors)
	const apiUrl = document.createElement("a")
	apiUrl.className = "apiUrl"
	apiUrl.href = i.Link
	apiUrl.innerText = "Visit the API"
	card.appendChild(apiTitle)
	card.appendChild(apiDescription)
	card.appendChild(apiMeta)
	card.appendChild(apiUrl)
	return card
}

// constructs cards for all APIs
const editApis = () => {
	const cards = document.getElementById("cards")
	cards.innerHTML = ""
	apisArr.forEach(i => {
		const card = makeCard(i)
		cards.appendChild(card)
		cardsData.push(card)
	})
}


// prevent default actions when the form is submitted
const handleSubmit = (e) => {
	e.preventDefault()
}

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

// to prevent default actions
const apisForm = document.getElementById("apisForm")
apisForm.addEventListener("submit", handleSubmit)

// fetch data from api as soon as the page loads and edit the pagination constraints
fetch("https://imaginexapi.root.sx/apilist")
	.then(data => data.json())
	.then(data => {
		apisArr = data
		editApis()
		maxPage = parseInt(cardsData.length / lim)
		move(currentPage)
		pagination.className = pagination.className.replace(" active", "") + " active"
	})

// whenever a letter is typed / erased update the cards accordingly that has the current word
const searchInp = document.getElementById("keywordInp")
searchInp.addEventListener("keyup", (e) => {
	const _category = document.getElementById("categoryInp").value
	const category = _category == "all" ? "" : _category
	if (e.target.value.trim().length <= 0) {
		move(1)
		return
	}
	pagination.className = pagination.className.replace(" active", "")
	const cardsDiv = document.getElementById("cards")
	const term = e.target.value.trim()
	const _cards = cardsData
	const cards = Array.from(_cards)
	cards.forEach(card => {
		const cardTitle = card.querySelector(".apiTitle")
		const cardDesc = card.querySelector(".apiDescription")
		if (((cardTitle.innerText.toLowerCase().includes(term.toLowerCase()))) && (card.className.toLowerCase().includes(category.toLowerCase()))) {
			card.className = card.className.replace(" active", "") + " active"
			cardsDiv.appendChild(card)
		} else if (!(((cardTitle.innerText.toLowerCase().includes(term.toLowerCase()))) && (card.className.toLowerCase().includes(category.toLowerCase()))) && card.className.includes("active")) {
			card.className = card.className.replace(" active", "")
		}
	})
})

// whenever the category is changed update the cards accordingly that is of the changed category
const categoryInp = document.getElementById("categoryInp")
categoryInp.addEventListener("change", (e) => {
	const _category = e.target.value
	const category = _category == "all" ? "" : _category
	const term = document.getElementById("keywordInp").value.trim()
	const _cards = cardsData
	const cards = Array.from(_cards)
	const cardsDiv = document.getElementById("cards")
	cards.forEach(card => {
		const cardTitle = card.querySelector(".apiTitle")
		const cardDesc = card.querySelector(".apiDescription")
		if (((cardTitle.innerText.toLowerCase().includes(term.toLowerCase()))) && (card.className.toLowerCase().includes(category.toLowerCase()))) {
			card.className = card.className.replace(" active", "") + " active"
			cardsDiv.appendChild(card)
		} else if (!(((cardTitle.innerText.toLowerCase().includes(term.toLowerCase()))) && (card.className.toLowerCase().includes(category.toLowerCase()))) && card.className.includes("active")) {
			card.className = card.className.replace(" active", "")
		}
	})
})