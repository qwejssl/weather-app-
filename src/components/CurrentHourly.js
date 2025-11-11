import { subscribe } from '../store/store.js'
import { fmtTemp, iconPathFor } from '../utils/format.js'

export function CurrentHourly(root) {
	root.innerHTML = `
    <div class="headline">
      <div class="city" id="city">—</div>
      <div class="metrics">
        <div class="metric big" id="temp">—</div>
        <div class="metric"><span id="humidity">—</span> <span class="muted">Humidity</span></div>
        <div class="metric"><span id="wind">—</span> <span class="muted">Wind</span></div>
      </div>
    </div>

    <div class="hours-scroll" id="hours"></div>
  `

	const city = root.querySelector('#city')
	const temp = root.querySelector('#temp')
	const hum = root.querySelector('#humidity')
	const wind = root.querySelector('#wind')
	const hours = root.querySelector('#hours')

	subscribe(
		s => ({ loc: s.location, w: s.weather, unit: s.unit }),
		({ loc, w, unit }) => {
			if (loc) city.textContent = loc.name
			if (!w) {
				hours.innerHTML = `<div class="skeleton h120"></div>`
				return
			}

			temp.textContent = fmtTemp(w.current.temp, unit)
			hum.textContent = `${w.current.humidity ?? '—'}%`
			wind.textContent =
				unit === 'metric'
					? `${Math.round(w.current.wind)} km/h`
					: `${Math.round(w.current.wind / 1.609)} mph`

			hours.innerHTML = (w.hourly || [])
				.map(
					h => `
      <div class="hour">
        <div class="time">${new Date(h.ts).toLocaleTimeString('en', {
					hour: '2-digit',
				})}</div>
        <img class="ico" src="${iconPathFor(h.code)}" alt="">
        <div class="t">${fmtTemp(h.temp, unit)}</div>
      </div>
    `
				)
				.join('')
		}
	)
}
