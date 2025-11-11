export const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v))
export const getJSON = (k, d) => {
	try {
		return JSON.parse(localStorage.getItem(k)) ?? d
	} catch {
		return d
	}
}
