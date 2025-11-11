let state = {
	location: null,
	weather: null,
	unit: 'metric',
	overviewTab: 'humidity',
	forecastRange: '3d',
	theme: 'dark',
}
const listeners = new Set()

export const getState = () => state
export function setState(patch) {
	const prev = state
	state = { ...state, ...patch }
	for (const fn of listeners) fn(state, prev)
}
export function subscribe(selector, cb) {
	let prev = selector(state)
	const handler = s => {
		const next = selector(s)
		if (JSON.stringify(next) !== JSON.stringify(prev)) {
			prev = next
			cb(next)
		}
	}
	listeners.add(handler)
	return () => listeners.delete(handler)
}
