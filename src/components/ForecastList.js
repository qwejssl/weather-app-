import { subscribe } from '../store/store.js'
import { fmtDateShort, fmtTemp, iconPathFor } from '../utils/format.js'

export function ForecastList(root) {
	root.innerHTML = `
    <div class="title-row"><h3>Forecasts</h3></div>
    <div class="list" role="list"></div>
  `
	const list = root.querySelector('.list')

	subscribe(
		s => ({ daily: s.weather?.daily, unit: s.unit, tz: s.location?.tz }),
		({ daily, unit, tz }) => {
			if (!daily) {
				list.innerHTML = `<div class="skeleton h120"></div>`
				return
			}
			list.innerHTML = daily
				.slice(0, 7)
				.map(
					d => `
        <div class="f-item" role="listitem">
          <div class="f-left">
            <img class="f-ico" src="${iconPathFor(d.code)}" alt="" />
            <span class="f-temp">${fmtTemp(d.max, unit)} / ${fmtTemp(
						d.min,
						unit
					)}</span>
          </div>
          <div class="f-date">${fmtDateShort(d.date, tz)}</div>
        </div>`
				)
				.join('')
		}
	)
}
