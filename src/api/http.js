export async function fetchJSON(
	url,
	{ signal, timeout = 8000, retries = 1 } = {}
) {
	for (let i = 0; i <= retries; i++) {
		try {
			const ctrl = new AbortController()
			const t = setTimeout(() => ctrl.abort(), timeout)
			const res = await fetch(url, { signal: signal || ctrl.signal })
			clearTimeout(t)
			if (res.status === 429) {
				const e = new Error('rate-limit')
				e.code = 429
				throw e
			}
			if (!res.ok) throw new Error(String(res.status))
			return await res.json()
		} catch (err) {
			if (i === retries) throw err
			await new Promise(r => setTimeout(r, 200 * Math.pow(2, i)))
		}
	}
}
