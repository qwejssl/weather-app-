import { geocode, getWeather } from '../api/openmeteo.js'
import { getState, setState } from '../store/store.js'
import { setJSON } from '../utils/storege.js'

export function HeaderBar(root) {
	root.innerHTML = `
    <div class="header">
      <div class="h-left">
        <div class="avatar" aria-hidden="true"></div>
        <div class="today" id="today" aria-live="polite"></div>
      </div>
      <div class="h-right">
        <div class="search" role="search">
          <input id="search" class="input" type="text" placeholder="Search city" aria-label="Search city" autocomplete="off">
          <button class="icon-btn" id="searchBtn" aria-label="Search">🔎</button>
          <ul class="typeahead" id="typeahead" role="listbox" hidden></ul>
        </div>
        <button class="pill ghost" id="themeBtn" aria-label="Toggle theme">Theme</button>
        <button class="pill" id="unitBtn" aria-pressed="true" aria-label="Units">°C</button>
      </div>
    </div>
  `

	const today = root.querySelector('#today')
	today.textContent = new Intl.DateTimeFormat('en', {
		dateStyle: 'full',
	}).format(new Date())

	const search = root.querySelector('#search')
	const list = root.querySelector('#typeahead')
	const unitBtn = root.querySelector('#unitBtn')
	const themeBtn = root.querySelector('#themeBtn')

	unitBtn.textContent = getState().unit === 'metric' ? '°C' : '°F'

	themeBtn.addEventListener('click', () => {
		const cur = getState().theme
		const next = cur === 'dark' ? 'light' : 'dark'
		setState({ theme: next })
	})

	unitBtn.addEventListener('click', () => {
		const next = getState().unit === 'metric' ? 'imperial' : 'metric'
		setState({ unit: next })
		unitBtn.textContent = next === 'metric' ? '°C' : '°F'
	})

	let timer
	let ctrl
	async function runSearch() {
		const q = search.value.trim()
		if (!q) {
			list.hidden = true
			list.innerHTML = ''
			return
		}
		clearTimeout(timer)
		timer = setTimeout(async () => {
			try {
				if (ctrl) ctrl.abort()
				ctrl = new AbortController()
				const res = await geocode(q, { signal: ctrl.signal })
				list.innerHTML = res
					.map(
						(r, i) =>
							`<li role="option" data-i="${i}" tabindex="0">${r.name}, ${r.country}</li>`
					)
					.join('')
				list.hidden = res.length === 0

				const onPick = async li => {
					const idx = Number(li.dataset.i)
					const loc = res[idx]
					list.hidden = true
					list.innerHTML = ''
					search.value = `${loc.name}, ${loc.country}`
					setState({ location: loc })
					try {
						const weather = await getWeather(loc)
						setState({ weather })
						setJSON('lastLocation', loc)
						window.showToast?.(`Loaded: ${loc.name}`)
					} catch {
						window.showToast?.('Failed to load weather')
					}
				}

				list.onclick = e => {
					const li = e.target.closest('[data-i]')
					if (li) onPick(li)
				}
				list.onkeydown = e => {
					if (e.key === 'Enter') {
						const li = e.target.closest('[data-i]')
						if (li) onPick(li)
					}
				}
			} catch {}
		}, 300)
	}

	search.addEventListener('input', runSearch)
	root.querySelector('#searchBtn').addEventListener('click', runSearch)
}
