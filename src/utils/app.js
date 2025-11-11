import { getWeather } from '../api/openmeteo.js'
import { CurrentHourly } from '../components/CurrentHourly.js'
import { ForecastList } from '../components/ForecastList.js'
import { HeaderBar } from '../components/HeaderBar.js'
import { MapPanel } from '../components/MapPanel.js'
import { OverviewChart } from '../components/OverviewChart.js'
import { Tabs } from '../components/Tabs.js'
import { Toast } from '../components/Toast.js'
import { setState, subscribe } from '../store/store.js'

// your file is named storege.js right now
import { getJSON, setJSON } from './storege.js'

const root = document.getElementById('root')
root.innerHTML = `
  <div class="app-grid">
    <header id="hdr"></header>
    <section class="card current-hourly" id="current"></section>
    <section class="card map" id="map"></section>
    <section class="card overview" id="overview"></section>
    <section class="card forecasts" id="forecasts"></section>
    <div id="toasts"></div>
  </div>
`

HeaderBar(document.getElementById('hdr'))
CurrentHourly(document.getElementById('current'))
MapPanel(document.getElementById('map'))
Tabs(document.getElementById('overview'))
OverviewChart(document.getElementById('overview'))
ForecastList(document.getElementById('forecasts'))
Toast(document.getElementById('toasts'))

// prefs
;(function bootPrefs() {
	const theme = getJSON('theme', 'dark')
	const unit = getJSON('unit', 'metric')
	document.documentElement.dataset.theme = theme
	setState({ theme, unit })
})()
subscribe(
	s => ({ theme: s.theme, unit: s.unit }),
	({ theme, unit }) => {
		document.documentElement.dataset.theme = theme
		setJSON('theme', theme)
		setJSON('unit', unit)
	}
)

// initial data
;(async function init() {
	const savedLoc = getJSON('lastLocation', null)
	const loc = savedLoc ?? {
		name: 'Varna',
		country: 'Bulgaria',
		lat: 43.2141,
		lon: 27.9147,
		tz: 'Europe/Sofia',
	}
	setState({ location: loc })
	try {
		const weather = await getWeather(loc)
		setState({ weather })
		setJSON('lastLocation', loc)
	} catch {
		window.showToast?.('Failed to load weather')
	}
})()
