// Sticky Header
window.addEventListener("scroll", () => {
	const header = document.querySelector("header")
	const offset = header.offsetTop
	if (window.pageYOffset > offset) {
		header.className = "scrolled"
	} else {
		header.className = ""
	}
})