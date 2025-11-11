export const fmtTemp = (t, unit = 'metric') =>
	unit === 'metric' ? `${Math.round(t)}°C` : `${Math.round((t * 9) / 5 + 32)}°F`

export const fmtWind = (w, unit = 'metric') =>
	unit === 'metric' ? `${Math.round(w)} km/h` : `${Math.round(w / 1.609)} mph`

export const fmtDateShort = (d, tz) =>
	new Date(d).toLocaleDateString('en', {
		day: '2-digit',
		month: 'short',
		weekday: 'short',
		timeZone: tz || 'UTC',
	})

export function iconPathFor(code) {
	// Map Open-Meteo WMO codes -> your svg set
	if (code === 0) return './public/icons/sun.svg'
	if ([1, 2, 3].includes(code)) return './public/icons/cloud.svg'
	if ([45, 48].includes(code)) return './public/icons/cloud.svg'
	if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code))
		return './public/icons/rain.svg'
	if ([71, 73, 75, 77].includes(code)) return './public/icons/cloud.svg'
	if ([95, 96, 99].includes(code)) return './public/icons/rain.svg'
	return './public/icons/cloud.svg'
}

// (оставь iconFor, если используешь эмодзи в других местах)
export function iconFor(code) {
	return '☁️'
}
