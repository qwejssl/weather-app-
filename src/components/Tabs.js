import { setState } from '../store/store.js'

export function Tabs(root) {
	const wrap = document.createElement('div')
	wrap.className = 'tabs'
	wrap.innerHTML = `
    <button class="tab active" data-t="humidity">Humidity</button>
    <button class="tab" data-t="uv">UV Index</button>
    <button class="tab" data-t="rain">Rainfall</button>
    <button class="tab" data-t="pressure">Pressure</button>
  `
	root.append(wrap)
	wrap.addEventListener('click', e => {
		const btn = e.target.closest('.tab')
		if (!btn) return
		wrap.querySelectorAll('.tab').forEach(b => b.classList.remove('active'))
		btn.classList.add('active')
		setState({ overviewTab: btn.dataset.t })
	})
}
