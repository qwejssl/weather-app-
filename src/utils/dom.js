export const qs = (s, p = document) => p.querySelector(s)
export const qsa = (s, p = document) => [...p.querySelectorAll(s)]
export function el(tag, cls) {
	const e = document.createElement(tag)
	if (cls) e.className = cls
	return e
}
export function mount(parent, html) {
	parent.innerHTML = html
	return parent.firstElementChild
}
