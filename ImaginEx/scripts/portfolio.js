// function to return a random colour for pie chart
randomRGBA = () => {
	const o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + "1" + ')';
}

// edit the stocks, details and graphs with the data
editTables = (data, val) => {
	if (data.error) {
		alert("Portfolio Amount must be between 100 to 999999")
		return
	}
	const results = document.getElementById("results")
	results.className = results.className.replace(" active", "") + " active"
	const loader = document.getElementById("loader")
	loader.className = loader.className.replace(" active", "")
	const resultsTable = document.getElementById("resultsTable")
	var rowsLength = resultsTable.rows.length
	while (rowsLength > 1) {
		resultsTable.deleteRow(-1)
		rowsLength = document.getElementById("resultsTable").rows.length
	}
	const allocated = data.allocated
	const keys = Object.keys(allocated)
	keys.forEach(i => {
		const tr = resultsTable.insertRow(-1)
		const name = tr.insertCell(0)
		const symbol = tr.insertCell(1)
		const number = tr.insertCell(2)
		name.innerHTML = i
		symbol.innerHTML = allocated[i].name
		number.innerHTML = allocated[i].value
	})
	const resultsMetaTable = document.getElementById("resultsMetaTable")
	const meta = data.meta
	const annualReturns = meta.annualReturns
	const risk = meta.risk
	const sharpeRatio = meta.sharpeRatio
	const leftover = "$" + parseInt(data.leftover)
	const invested = "$" + parseInt(parseInt(val) - parseInt(data.leftover))

	const cagrTd = document.getElementById("cagrTd")
	const riskTd = document.getElementById("riskTd")
	const sharpeTd = document.getElementById("sharpeTd")
	const investedTd = document.getElementById("investedTd")
	const leftoverTd = document.getElementById("leftoverTd")
	cagrTd.innerText = annualReturns + "%"
	riskTd.innerText = risk + "%"
	sharpeTd.innerText = sharpeRatio
	investedTd.innerText = invested
	leftoverTd.innerText = leftover

	const values = keys.map(key => allocated[key].value)
	const label = "Portfolio"
	const bgs = []
	keys.forEach(i => {
		bgs.push(randomRGBA())
	})

	const dataset = [{"label": label, "data": values, "fill": false, "backgroundColor": bgs, "lineTension": 0.1}]
	const pieData = {"type": "doughnut", "data": {"labels": keys, "datasets": dataset, "options": {}}}
	const chartjs0 = document.getElementById("chartjs-0")
	console.log(chartjs0)
	if (chartjs0) chartjs0.remove()
	const pie = document.createElement("canvas")
	pie.id = "chartjs-0"
	pie.className = "chartjs"
	const graphs = document.getElementsByClassName("graphs")[0]
	graphs.appendChild(pie)
	new Chart(pie, pieData)
}

// prevent default action when the form is submitted and fetch data from API using the user inputs
handleSubmit = (e) => {
	e.preventDefault()
	const loader = document.getElementById("loader")
	loader.className = loader.className.replace(" active", "") + " active"
	const val = e.target.portfolioVal.value
	const diversify = e.target.portfolioDiversify.checked
	fetch("https://imaginexapi.root.sx/portfolio", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({amt: val, diversify: diversify})
	})
		.then(data => data.json())
		.then(data => editTables(data, val))
}

// set onSubmit to the function that handles submit
const form = document.getElementsByClassName("portfolioInner")[0]
form.addEventListener("submit", handleSubmit)