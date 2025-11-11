// src/api/openmeteo.js
import { fetchJSON } from './http.js'

/* ---------- Geocoding ---------- */
export async function geocode(q, opts = {}) {
	if (!q) return []
	const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
		q
	)}&count=5&language=en`
	const data = await fetchJSON(url, { signal: opts.signal })
	return (data.results || []).map(r => ({
		name: r.name,
		country: r.country,
		lat: r.latitude,
		lon: r.longitude,
		tz: r.timezone,
	}))
}

/* ---------- Weather ---------- */
export async function getWeather({
	lat,
	lon /* tz не нужен: используем auto */,
}) {
	const params = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lon),
		timezone: 'auto',
		temperature_unit: 'celsius',
		windspeed_unit: 'kmh',
		precipitation_unit: 'mm',
		current_weather: 'true',
		past_days: '90', // <= 92 — иначе 400
		timeformat: 'iso8601',
	})

	// Имена полей — строго как в API
	params.append(
		'hourly',
		[
			'temperature_2m',
			'relativehumidity_2m',
			'precipitation',
			'pressure_msl',
			'weathercode',
		].join(',')
	)

	params.append(
		'daily',
		[
			'weathercode',
			'temperature_2m_max',
			'temperature_2m_min',
			'precipitation_sum',
			'uv_index_max',
		].join(',')
	)

	const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`
	const j = await fetchJSON(url)

	/* ---- HOURLY: текущий час → +24 ---- */
	const Ht = j.hourly?.time || []
	const H = {
		t: j.hourly?.temperature_2m || [],
		h: j.hourly?.relativehumidity_2m || [],
		r: j.hourly?.precipitation || [],
		p: j.hourly?.pressure_msl || [],
		c: j.hourly?.weathercode || [],
	}

	const curIso = j.current_weather?.time
	let curIdx = Ht.findIndex(t => t === curIso)
	if (curIdx < 0) curIdx = 0

	const hourly24 = Array.from({ length: 24 }, (_, k) => curIdx + k)
		.filter(i => i < Ht.length)
		.map(i => ({
			ts: Ht[i],
			temp: H.t[i],
			humidity: H.h[i],
			precip: H.r[i],
			pressure: H.p[i],
			code: H.c[i],
		}))

	/* ---- CURRENT ---- */
	const current = {
		temp: j.current_weather?.temperature ?? null,
		wind: j.current_weather?.windspeed ?? null,
		code: j.current_weather?.weathercode ?? null,
		humidity: Number.isFinite(H.h[curIdx]) ? H.h[curIdx] : null,
	}

	/* ---- 7-дневный прогноз: сегодня → +6 ---- */
	const todayISO = new Date().toISOString().slice(0, 10)
	const Dt = j.daily?.time || []
	const dailyAll = Dt.map((d, i) => ({
		date: d,
		max: j.daily.temperature_2m_max?.[i],
		min: j.daily.temperature_2m_min?.[i],
		code: j.daily.weathercode?.[i],
		precip: j.daily.precipitation_sum?.[i] ?? 0,
		uvmax: j.daily.uv_index_max?.[i] ?? 0,
	}))
	const daily = dailyAll.filter(d => d.date >= todayISO).slice(0, 7)

	/* ---- Серии по месяцам (12 последних) ---- */
	const toYM = s => s.slice(0, 7)
	const bucket = new Map() // key -> {h[], p[], rSum, uvMax}

	Ht.forEach((ts, i) => {
		const k = toYM(ts)
		let b = bucket.get(k)
		if (!b) {
			b = { h: [], p: [], rSum: 0, uvMax: 0 }
			bucket.set(k, b)
		}
		if (Number.isFinite(H.h[i])) b.h.push(H.h[i])
		if (Number.isFinite(H.p[i])) b.p.push(H.p[i])
		if (Number.isFinite(H.r[i])) b.rSum += H.r[i]
	})

	// UV берём из daily (максимум по месяцу)
	dailyAll.forEach(d => {
		const k = toYM(d.date)
		let b = bucket.get(k)
		if (!b) {
			b = { h: [], p: [], rSum: 0, uvMax: 0 }
			bucket.set(k, b)
		}
		b.uvMax = Math.max(b.uvMax, Number(d.uvmax || 0))
	})

	const months = Array.from(bucket.keys()).sort().slice(-12)
	const avg = a =>
		a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : null

	const series = {
		months,
		humidity: months.map(k => avg(bucket.get(k).h)),
		pressure: months.map(k => avg(bucket.get(k).p)),
		rain: months.map(k => Math.round(bucket.get(k).rSum)),
		uv: months.map(k => Math.round(bucket.get(k).uvMax)),
	}

	return {
		current,
		hourly: hourly24,
		daily,
		series,
		fetchedAt: new Date().toISOString(),
	}
}
