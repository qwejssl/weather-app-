import { subscribe } from '../store/store.js'

export function MapPanel(root) {
	root.innerHTML = `
    <div class="map-static">
      <img id="mapImg" alt="City location map" />
      <div class="center-pin" aria-hidden="true">
        <!-- простая «галочка»-пин -->
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="8" fill="white" opacity="0.9"/>
          <path d="M7 13l3.2 3.2L19 7.5" stroke="#0ea5e9" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <button class="icon-btn expand" aria-label="Open map" title="Open in OpenStreetMap">↗</button>
    </div>
  `
	const img = root.querySelector('#mapImg')
	const btn = root.querySelector('.expand')

	const buildSrc = (lat, lon, z = 10, w = 640, h = 320) =>
		// центр — это и есть lat,lon; пин рисуем сами по центру
		`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${z}&size=${w}x${h}`

	subscribe(
		s => ({ loc: s.location }),
		({ loc }) => {
			if (!loc) return
			img.width = 640
			img.height = 320
			img.src = buildSrc(loc.lat, loc.lon, 10)
			img.onerror = () => {
				img.src = buildSrc(loc.lat, loc.lon, 9)
			}
			btn.onclick = () =>
				window.open(
					`https://www.openstreetmap.org/#map=12/${loc.lat}/${loc.lon}`,
					'_blank'
				)
		}
	)
}
