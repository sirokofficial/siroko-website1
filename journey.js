/* Events page "Our Barcelona": a timeline of every Siroko event next to a map of the city.
   It reads events-data.js. An event appears on the map when it has `lat` and `lng`. */
(function () {
  const list = document.getElementById('journeyList');
  const mapBox = document.getElementById('journeyMap');
  const playButton = document.getElementById('journeyPlay');
  if (!list || !mapBox || !window.SIROKO_EVENTS) return;

  const now = Date.now();
  const stops = window.SIROKO_EVENTS
    .map((e) => ({ ...e, isPast: Date.parse(e.end || e.start) < now }))
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const nextCode = (stops.find((e) => !e.isPast) || {}).code;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const name = (e) => e.title.replace(/^SRK-\d+:\s*/, '');
  const picture = (e) => e.thumb || e.cover || '';

  // ---- timeline ----
  list.innerHTML = stops.map((e, i) =>
    `<li><button class="journey-stop${e.isPast ? '' : ' is-upcoming'}" data-index="${i}" type="button">` +
    `<span class="journey-dot" aria-hidden="true">${i + 1}</span>` +
    (picture(e) ? `<img alt="" class="journey-thumb" loading="lazy" src="${esc(picture(e))}"/>` : '') +
    `<span class="journey-text"><span class="journey-date">${esc(e.code)} · ${esc(e.dateLabel)}${e.code === nextCode ? ' · Next' : ''}</span>` +
    `<strong>${esc(name(e))}</strong><span class="journey-venue">${esc(e.venue || e.place)}</span></span></button></li>`
  ).join('');
  const buttons = Array.from(list.querySelectorAll('.journey-stop'));

  let map = null;
  let markers = [];
  let active = -1;
  let playTimer = null;

  function popupHtml(e) {
    return `<div class="journey-pop">` +
      (picture(e) ? `<img alt="" src="${esc(picture(e))}"/>` : '') +
      `<div><span>${esc(e.code)} · ${esc(e.dateLabel)}</span><strong>${esc(name(e))}</strong>` +
      `<em>${esc(e.venue || '')}${e.area ? ' · ' + esc(e.area) : ''}</em>` +
      `<a href="${esc(e.page)}">${e.isPast ? (e.gallery ? 'View recap' : 'View event') : 'Get tickets'} →</a></div></div>`;
  }

  function select(index, fly) {
    active = index;
    buttons.forEach((b, i) => b.classList.toggle('is-active', i === index));
    markers.forEach((m, i) => { if (m) m.getElement() && m.getElement().classList.toggle('is-active', i === index); });
    const marker = markers[index];
    if (map && marker) {
      if (fly) {
        // aim a little above the pin so its card fits inside the map
        const zoom = 15;
        const point = map.project(marker.getLatLng(), zoom).subtract([0, 110]);
        map.flyTo(map.unproject(point, zoom), zoom, { duration: 1.1 });
      }
      marker.openPopup();
    } else if (map) {
      map.closePopup();
    } else {
      start();
    }
    const button = buttons[index];
    if (button && list.scrollWidth > list.clientWidth) button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  function stopPlaying() {
    clearTimeout(playTimer);
    playTimer = null;
    if (playButton) playButton.innerHTML = '<span aria-hidden="true">▶</span> Play the journey';
  }

  function play() {
    if (playTimer) { stopPlaying(); return; }
    if (playButton) playButton.innerHTML = '<span aria-hidden="true">■</span> Stop';
    let i = 0;
    const step = () => {
      select(i, true);
      i += 1;
      playTimer = i < stops.length ? setTimeout(step, 2600) : setTimeout(stopPlaying, 2600);
    };
    step();
  }

  buttons.forEach((b) => b.addEventListener('click', () => { stopPlaying(); select(Number(b.dataset.index), true); }));
  if (playButton) playButton.addEventListener('click', play);

  // ---- map (loaded only when the section is near the screen) ----
  function loadLeaflet() {
    return new Promise((resolve, reject) => {
      if (window.L) return resolve();
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.append(css);
      const js = document.createElement('script');
      js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      js.onload = resolve;
      js.onerror = reject;
      document.head.append(js);
    });
  }

  function buildMap() {
    const L = window.L;
    const placed = stops.filter((e) => typeof e.lat === 'number' && typeof e.lng === 'number');
    if (!placed.length) { mapBox.parentElement.style.display = 'none'; return; }

    // on phones a one-finger drag scrolls the page instead of the map; the stops below move the map
    map = L.map(mapBox, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, dragging: !L.Browser.mobile });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noreferrer" target="_blank">OpenStreetMap</a>'
    }).addTo(map);

    const points = placed.map((e) => [e.lat, e.lng]);
    L.polyline(points, { color: '#f84f12', weight: 2, opacity: 0.75, dashArray: '6 8' }).addTo(map);

    markers = stops.map((e, i) => {
      if (typeof e.lat !== 'number' || typeof e.lng !== 'number') return null;
      const icon = L.divIcon({
        className: 'journey-pin' + (e.isPast ? '' : ' is-upcoming'),
        html: `<span>${i + 1}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -16]
      });
      const marker = L.marker([e.lat, e.lng], { icon, title: e.title, keyboard: true }).addTo(map);
      marker.bindPopup(popupHtml(e), { closeButton: false, className: 'journey-popup', maxWidth: 240, minWidth: 240, autoPan: false });
      marker.on('click', () => { stopPlaying(); select(i, false); });
      return marker;
    });

    map.fitBounds(L.latLngBounds(points).pad(0.22));
    map.on('click', () => stopPlaying());
    if (active >= 0) select(active, true);   // a stop was picked before the map was ready
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    loadLeaflet().then(buildMap).catch(() => { mapBox.parentElement.style.display = 'none'; });
  }
  if ('IntersectionObserver' in window) {
    const watcher = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { watcher.disconnect(); start(); }
    }, { rootMargin: '600px 0px' });
    watcher.observe(mapBox);
  } else {
    start();
  }
})();
