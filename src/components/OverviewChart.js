import { subscribe } from '../store/store.js'

export function OverviewChart(root) {
	root.innerHTML = `
    <div class="title-row" style="margin-bottom:10px">
      <div class="tabs">
        <button class="tab active" data-t="humidity">Humidity</button>
        <button class="tab" data-t="uv">UV Index</button>
        <button class="tab" data-t="rain">Rainfall</button>
        <button class="tab" data-t="pressure">Pressure</button>
      </div>
    </div>
    <div class="chart"><div class="chart-inner">
      <svg id="ov-svg" viewBox="0 0 760 260" aria-label="Overview chart"></svg>
      <div id="ov-tip" class="chart-tip" hidden></div>
    </div></div>
  `

	const svg = root.querySelector('#ov-svg')
	const tip = root.querySelector('#ov-tip')
	const tabs = root.querySelector('.tabs')

	let series = null,
		metric = 'humidity'
	const w = 760,
		h = 260,
		pad = 36
	let x, y

	tabs.onclick = e => {
		const b = e.target.closest('.tab')
		if (!b) return
		tabs.querySelectorAll('.tab').forEach(x => x.classList.remove('active'))
		b.classList.add('active')
		metric = b.dataset.t
		draw()
	}

	subscribe(
		s => ({ ser: s.weather?.series }),
		({ ser }) => {
			series = ser
			draw()
		}
	)

	function draw() {
		svg.innerHTML = ''
		if (!series || !series.months?.length) {
			svg.innerHTML = `<foreignObject x="0" y="0" width="760" height="260"><div xmlns="http://www.w3.org/1999/xhtml" class="skeleton h260"></div></foreignObject>`
			return
		}
		// гарантируем 12 месяцев — если меньше, дополним пустыми слева
		let months = series.months.slice(-12)
		let vals = (series[metric] || []).slice(-12)
		if (months.length < 12) {
			const need = 12 - months.length
			const tail = months[0] ? new Date(`${months[0]}-01`) : new Date()
			const padMonths = []
			for (let i = need; i > 0; i--) {
				const d = new Date(tail)
				d.setMonth(d.getMonth() - i)
				padMonths.push(d.toISOString().slice(0, 7))
			}
			months = padMonths.concat(months)
			vals = Array(need).fill(null).concat(vals)
		}

		const clean = vals.filter(v => Number.isFinite(v))
		const min = clean.length ? Math.min(...clean) : 0
		const max = clean.length ? Math.max(...clean) : 1
		const step = metric === 'pressure' ? 50 : 5
		const yMin = Math.floor(min / step) * step,
			yMax = Math.ceil(max / step) * step || step

		const n = months.length - 1
		x = i => pad + (i * (w - 2 * pad)) / Math.max(1, n)
		y = v => h - pad - ((v - yMin) / (yMax - yMin || 1)) * (h - 2 * pad)

		// grid + Y labels
		for (let i = 0; i <= 4; i++) {
			const yy = pad + i * ((h - 2 * pad) / 4)
			const val = Math.round(yMax - i * ((yMax - yMin) / 4))
			svg.insertAdjacentHTML(
				'beforeend',
				`<line x1="${pad}" y1="${yy}" x2="${
					w - pad
				}" y2="${yy}" stroke="rgba(0,0,0,.08)"/>`
			)
			svg.insertAdjacentHTML(
				'beforeend',
				`<text x="${pad - 8}" y="${
					yy + 4
				}" text-anchor="end" class="chart-tick">${val}</text>`
			)
		}
		// X: Jan..Dec
		months.forEach((m, i) => {
			const label = new Date(`${m}-01`).toLocaleString('en', { month: 'short' })
			svg.insertAdjacentHTML(
				'beforeend',
				`<text x="${x(i)}" y="${
					h - 8
				}" text-anchor="middle" class="chart-tick">${label}</text>`
			)
		})

		// path (пропускаем null)
		let d = ''
		vals.forEach((v, i) => {
			if (!Number.isFinite(v)) {
				d += ''
				return
			}
			d += (d && d.endsWith('Z') ? 'M' : d ? 'L' : 'M') + x(i) + ',' + y(v)
		})
		svg.insertAdjacentHTML(
			'beforeend',
			`<path d="${d}" fill="none" stroke="currentColor" stroke-width="2.5"/>`
		)
		// точка конца
		for (let i = vals.length - 1; i >= 0; i--) {
			if (Number.isFinite(vals[i])) {
				svg.insertAdjacentHTML(
					'beforeend',
					`<circle cx="${x(i)}" cy="${y(vals[i])}" r="4" fill="currentColor"/>`
				)
				break
			}
		}

		// hover
		svg.onmousemove = e => {
			const rect = svg.getBoundingClientRect()
			const idx = Math.max(
				0,
				Math.min(
					vals.length - 1,
					Math.round(((e.clientX - rect.left) / rect.width) * n)
				)
			)
			const v = vals[idx]
			if (!Number.isFinite(v)) {
				tip.hidden = true
				return
			}
			tip.hidden = false
			tip.style.left = `${(x(idx) / w) * 100}%`
			const lab = new Date(`${months[idx]}-01`).toLocaleString('en', {
				month: 'short',
				year: '2-digit',
			})
			tip.textContent = `${lab}: ${v}`
		}
		svg.onmouseleave = () => (tip.hidden = true)
	}
}
