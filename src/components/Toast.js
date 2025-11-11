export function Toast(root) {
	window.showToast = msg => {
		const div = document.createElement('div')
		div.className = 'toast'
		div.textContent = msg
		root.append(div)
		setTimeout(() => div.remove(), 3000)
	}
}
