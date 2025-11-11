export function formatTime(ts, tz) {
	return new Intl.DateTimeFormat('en', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: tz,
	}).format(new Date(ts))
}
