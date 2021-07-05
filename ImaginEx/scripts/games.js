// helper variables
const _btns = document.getElementById("gamesOuter").querySelector("section").querySelectorAll("button")
const btns = Array.from(_btns)
const [csgo, apex, fortnite] = btns
const arr = {"csgo": [apex, fortnite, csgo], "apex": [csgo, fortnite, apex], "fortnite": [csgo, apex, fortnite]}
const names = {"csgo": "CS:GO", "apex": "Apex Legends", "fortnite": "Fortnite"}
const identifiers = {"CS:GO": "Black_Star1337", "Apex Legends": "Yukimra_JPN", "Fortnite": "Ninja"}
const label = document.getElementsByClassName("gamesSelectLabel")[0]
var current = "CS:GO"

// change the stats text whenever the game is changed
activate = (name) => {
	const gamesUsername = document.getElementById("gamesUsername")
	gamesUsername.value = ""
	const chosen = arr[name]
	for (var i = 0; i < 2; i++) {
		chosen[i].className = chosen[i].className.replace("active", "")
	}
	chosen[2].className = chosen[2].className.replace("active", "") + " active"
	current = names[name]
	document.getElementById("edit").innerText = current
	document.getElementById("gamesUsername").placeholder = identifiers[current]
	if (current == "Apex Legends") {
		label.className = label.className.replace(" active", "") + " active"
	} else {
		label.className = label.className.replace(" active", "")
	}
	const avatarOuter = document.getElementById("avatarOuter")
	const cards = document.getElementById("cards")
	avatarOuter.innerHTML = ""
	cards.innerHTML = ""
}

// make a card / div with name avatar 
makeAvatarCard = (data) => {
	var usernameText = ""
	if (current == "Fortnite") {
		usernameText = "Epic Username: "
	} else {
		usernameText = "Username: "
	}

	var bioText = ""
	if (current == "Fortnite") {
		bioText = "Score: "
	} else {
		bioText = "Platform: "
	}

	const avatar = document.createElement("div")
	avatar.className = "avatar"
	const img = document.createElement("img")
	img.src = data.avatarUrl
	const section = document.createElement("section")
	section.className = "avatarSection"
	const avatarName = document.createElement("p")
	avatarName.className = "avatarName"
	avatarName.innerText = usernameText
	const span = document.createElement("span")
	span.className = "blue"
	span.innerText = data.username
	avatarName.appendChild(span)
	const avatarScore = document.createElement("p")
	avatarScore.className = "avatarScore"
	avatarScore.innerText = bioText
	const span2 = document.createElement("span")
	span2.className = "blue"
	span2.innerText = data.score || data.platform
	avatarScore.appendChild(span2)
	section.appendChild(avatarName)
	section.appendChild(avatarScore)
	avatar.appendChild(img)
	avatar.appendChild(section)
	const avatarOuter = document.getElementById("avatarOuter")
	avatarOuter.innerHTML = ""
	avatarOuter.appendChild(avatar)
	avatarOuter.className = avatarOuter.className.replace(" active", "") + " active"
}

// make cards from data of player
makeCards = (data) => {
	if (data.error) {
		alert(`${data.error}`)
		return
	}
	const cards = document.getElementById("cards")
	cards.innerHTML = ""
	const keys = Object.keys(data)
	keys.forEach(key => {
		if (key == "avatarData") {
			makeAvatarCard(data[key])
			return
		}
		const card = document.createElement("div")
		card.className = "card"
		const section = document.createElement("section")
		const p = document.createElement("p")
		p.innerText = key
		section.appendChild(p)
		card.appendChild(section)
		const innerCard = document.createElement("div")
		innerCard.className = "innerCard"
		const catKeys = Object.keys(data[key])
		catKeys.forEach(catKey => {
			const ul = document.createElement("ul")
			const liTitle = document.createElement("li")
			const liText = document.createElement("li")
			liTitle.className = "liTitle"
			liTitle.innerText = catKey
			liText.className = "liText"
			liText.innerText = data[key][catKey]
			ul.appendChild(liTitle)
			ul.appendChild(liText)
			innerCard.appendChild(ul)
		})
		card.appendChild(innerCard)
		cards.appendChild(card)
	})
	cards.className = cards.className.replace(" active", "") + " active"
	const loader = document.getElementById("loader")
	loader.className = loader.className.replace(" active", "")
}

// pass in necessary details to the functions as per the user inputs
manageSubmit = (game, e) => {
	if (game == "CS:GO") {
		const identifier = e.target.gamesUsername.value
		fetch("https://imaginexapi.root.sx/csgo", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({identifier: identifier})
		})
			.then(data => data.json())
			.then(data => makeCards(data))
	} else if (game == "Apex Legends") {
		const identifier = e.target.gamesUsername.value
		const platform = e.target.gamesSelect.value
		fetch("https://imaginexapi.root.sx/apex", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({identifier: identifier, platform: platform})
		})
			.then(data => data.json())
			.then(data => makeCards(data))
	} else if (game == "Fortnite") {
		const identifier = e.target.gamesUsername.value
		const platform = "kbm"
		fetch("https://imaginexapi.root.sx/fortnite", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({identifier: identifier, platform: platform})
		})
			.then(data => data.json())
			.then(data => makeCards(data))
	}
}

// prevent default actions when the form is submitted
const gamesInput = document.getElementById("gamesInput")
gamesInput.addEventListener("submit", (e) => {
	const loader = document.getElementById("loader")
	loader.className = loader.className.replace(" active", "") + " active"
	e.preventDefault()
	manageSubmit(current, e)
})