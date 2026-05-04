const setupCode = () => {
	document.querySelectorAll("pre.code-block").forEach(async pre => {
		const src = pre.getAttribute("data-src");
		const res = await fetch(src);
		const text = await res.text();

		const block = document.createElement("code");
		block.className = "language-go";
		block.textContent = text;
		pre.appendChild(block);
		hljs.highlightElement(block);
	});
};

document.addEventListener("new-page", setupCode);
