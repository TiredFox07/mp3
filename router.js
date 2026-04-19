const routes = {
	'/': '/pages/home.html',
	'/what-is-go': '/pages/what-is-go.html',
	'/where-is-go-used': '/pages/where-is-go-used.html',
	'/developer-tooling': '/pages/developer-tooling.html',
};

async function navigate(path) {
	const file = routes[path];

	if (!file) {
		document.querySelector('.title-bar').innerHTML = '';
		document.querySelector('.main-container').innerHTML = '<p>Page not found.</p>';
		return;
	}

	const res = await fetch(file);

	if (!res.ok) {
		document.querySelector('.main-container').innerHTML = '<p>Failed to load page.</p>';
		return;
	}

	const html = await res.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	document.querySelector('.title-bar').innerHTML = doc.querySelector('.title-bar').innerHTML;
	document.querySelector('.main-container').innerHTML = doc.querySelector('.main-container').innerHTML;

	document.querySelectorAll('a[data-route]').forEach(a => {
		a.classList.toggle('active', a.getAttribute('href') === path);
	});

	window.scrollTo(0, 0);
}

document.querySelectorAll('a[data-route]').forEach(a => {
	a.addEventListener('click', e => {
		e.preventDefault();
		const path = a.getAttribute('href');
		history.pushState({}, '', path);
		navigate(path);
	});
});

window.addEventListener('popstate', () => navigate(location.pathname));

const params = new URLSearchParams(location.search);
const redirect = params.get('redirect');

if (redirect) {
	history.replaceState({}, '', redirect);
	navigate(redirect);
} else {
	navigate(location.pathname);
}
