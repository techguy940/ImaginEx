// sleep x ms without blocking the whole code
sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// update the IFrame's source url
setIframe = (data) => {
	const iframe = document.getElementById("waybackMain")
	const loader = document.getElementById("loader")
	if (data.error) return alert("Can't find given webpage's data")
	iframe.src = data.url
	iframe.className = iframe.className.replace(" active", "") + " active"
	loader.className = loader.className.replace(" active", "") + " active"
	sleep(5000)
	    .then(() => {
	    	loader.className = loader.className.replace(" active", "")
	    })
}

// prevent default action when the form is submitted and fetch data from API using the user inputs
handleSubmit = (e) => {
	e.preventDefault()
	const url = e.target.waybackUrl.value
	const date = e.target.waybackDate.value.split("-")
	const year = date[0]
	const month = date[1]
	const day = date[2]
	fetch("https://imaginexapi.root.sx/wayback", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({url: url, year: year, month: month, day: day})
	})
		.then(data => data.json())
		.then(data => setIframe(data))
}

// set onSubmit to the function that handles submit
const form = document.getElementsByClassName("waybackInner")[0]
form.addEventListener("submit", handleSubmit)