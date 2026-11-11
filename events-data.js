/* ---------------------------------------------------------------
   Siroko events: the single place to add or edit events.

   To add a new event:
   1) add an entry at the TOP of the list below
   2) copy srk-005.html to a new page (srk-006.html) and edit the text
   3) put its photos/flyer in /assets and point `imageClass` or `image` at them
   4) once it has a photo gallery, add `gallery`, `galleryTitle`, `gallerySub`, `photoCount`, `cover`
      (and a matching entry in gallery-event.js) and it shows up on the Gallery page

   `ctaLabel` sets the text on the floating bottom-right button (default "Next Event: <date>").
   `featured: true` makes an upcoming event the "next event" even if another one is sooner.
   `hideWhenPast: true` removes a small event from the site once it is over (no recap page).
   Events switch from "upcoming" to "past" on their own once `end` has passed.
   Cards, the countdown and the floating "Next Event" button all read from here.
---------------------------------------------------------------- */
window.SIROKO_EVENTS = [
  {
    code: "SRK-005",
    title: "SRK-005: The White Affair",
    page: "srk-005.html",
    start: "2026-11-21T00:00:00+01:00",
    end: "2026-11-21T06:00:00+01:00",
    dateLabel: "20 Nov",
    place: "Sala Bikini · Friday night · Barcelona",
    chip: "Siroko × Zaylune · Tickets from €8",
    tag: "The White Affair",
    category: "nightlife",
    imageClass: "srk005-flyer",
    featured: true,
    ctaLabel: "NEXT EVENT: THE WHITE PARTY",
    ticketUrl: "https://www.fourvenues.com/adam-bacsa1/events/the-white-affair-by-zaylune-x-toca-rouge-x-siroko-x-esade-events-20-11-2026-FCZY"
  },
  {
    code: "SRK-004",
    title: "SRK-004: Hip-Hop × House",
    page: "srk-004.html",
    start: "2026-11-12T23:00:00+01:00",
    end: "2026-11-13T06:00:00+01:00",
    dateLabel: "12 Nov",
    place: "Boris · Thursday night · Barcelona",
    chip: "Jauset · HRTNGS · Tony",
    tag: "Hip-hop × House",
    category: "nightlife",
    imageClass: "srk004-flyer",
    ticketUrl: "https://www.fourvenues.com/siroko-null/events/1211-jauset-x-siroko-12-11-2026-V836"
  },
  {
    code: "SRK-003",
    title: "SRK-003: Halloween Party",
    page: "srk-003.html",
    start: "2026-10-31T23:00:00+01:00",
    end: "2026-11-01T06:00:00+01:00",
    dateLabel: "31 Oct",
    place: "Mambo Jambo · Fully private · Halloween night",
    chip: "Completed · 500 capacity · 3 DJs",
    tag: "Halloween",
    category: "nightlife",
    imageClass: "srk003-flyer",
    gallery: "srk-003",
    galleryTitle: "Halloween Party",
    gallerySub: "Mambo Jambo",
    photoCount: 24,
    cover: "assets/srk-003-recap/srk-003-recap-05.jpg",
    coverPosition: "center 40%"
  },
  {
    code: "SRK-002",
    title: "SRK-002: Student Social",
    page: "srk-002.html",
    start: "2026-10-09T20:00:00+02:00",
    end: "2026-10-10T06:00:00+02:00",
    dateLabel: "9 Oct",
    place: "D9 Aribau · Twenties Club Night",
    chip: "Completed · Student social + after-club",
    tag: "D9 x Twenties",
    category: "social",
    imageClass: "srk002-community-card",
    gallery: "srk-002",
    galleryTitle: "Student Social",
    gallerySub: "D9 Aribau · Twenties",
    photoCount: 20,
    cover: "assets/srk-002-recap/srk-002-recap-16.jpg",
    coverPosition: "center 30%"
  },
  {
    code: "SRK-001",
    title: "SRK-001: DEPARTURE",
    page: "srk-001.html",
    start: "2026-09-26T18:00:00+02:00",
    end: "2026-09-27T03:00:00+02:00",
    dateLabel: "26 Sep",
    place: "Sunset Boat Party · Barcelona",
    chip: "Completed · First Siroko drop",
    tag: "Boat Party",
    category: "nightlife",
    imageClass: "srk001-community-card",
    gallery: "srk-001",
    galleryTitle: "Departure",
    gallerySub: "Sunset boat party",
    photoCount: 20,
    cover: "assets/srk-001-recap/srk-001-recap-15.jpg",
    coverPosition: "center 40%"
  }
];

/* ---- renderer: you should not need to edit anything below ---- */
(function () {
  const now = Date.now();
  const all = (window.SIROKO_EVENTS || []).map((e) => ({ ...e, isPast: Date.parse(e.end || e.start) < now })).filter((e) => !(e.isPast && e.hideWhenPast));
  const upcoming = all.filter((e) => !e.isPast).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || Date.parse(a.start) - Date.parse(b.start));
  const past = all.filter((e) => e.isPast).sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
  const next = upcoming[0] || null;
  window.SirokoNextEvent = next;

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function card(e, featured) {
    const style = e.image ? ` style="background-image:url('${esc(e.image)}')"` : "";
    const cls = ["event-card", featured ? "event-card-featured" : "", e.isPast ? "event-card-past" : "", "tilt"].filter(Boolean).join(" ");
    const ticket = !e.isPast && e.ticketUrl
      ? `<a class="mini-btn mini-btn-primary buy-ticket-btn" href="${esc(e.ticketUrl)}" rel="noreferrer" target="_blank">Buy Tickets</a>`
      : "";
    return `<article class="${cls}" data-category="${esc(e.category || "nightlife")}">` +
      `<div class="event-image ${esc(e.imageClass || "")}"${style}></div>` +
      `<div class="event-content"><span class="date-chip${e.isPast ? " muted" : ""}">${esc(e.dateLabel)}${e.isPast ? " · Past" : ""}</span>` +
      `<h3>${esc(e.title)}</h3><p>${esc(e.place)}</p><span class="capacity-chip">${esc(e.chip)}</span>` +
      `<div class="event-bottom event-bottom-split"><span>${esc(e.tag)}</span><div class="event-card-actions">` +
      `<a class="mini-btn" href="${esc(e.page)}">${e.isPast ? (e.gallery ? "View recap +" : "View event +") : "More info +"}</a>${ticket}</div></div></div></article>`;
  }

  // Events page: everything, upcoming first
  const grid = document.getElementById("eventGrid");
  const pastGrid = document.getElementById("pastEventGrid");
  if (grid && all.length) {
    if (pastGrid) {
      // Events page: upcoming on top, in date order, past events in their own section below
      grid.innerHTML = upcoming.length
        ? upcoming.slice().sort((a, b) => Date.parse(a.start) - Date.parse(b.start)).map((e) => card(e, true)).join("")
        : '<p class="events-empty">New events are coming soon. Join the community chat to hear first.</p>';
      pastGrid.innerHTML = past.map((e) => card(e, false)).join("");
      const pastSection = document.getElementById("past-events");
      if (pastSection && !past.length) pastSection.style.display = "none";
    } else {
      grid.innerHTML = upcoming.map((e, i) => card(e, i === 0)).join("") + past.map((e) => card(e, false)).join("");
    }
  }

  // Home page preview: next event featured, then the latest three past ones
  const preview = document.querySelector(".home-preview .preview-grid");
  if (preview && all.length) {
    preview.innerHTML = (next ? card(next, true) : "") + past.slice(0, next ? 3 : 3).map((e) => card(e, false)).join("");
    const code = document.querySelector("[data-next-code]");
    if (code) code.textContent = next ? next.code : "Recent drops";
    const eyebrow = document.querySelector(".home-preview .eyebrow");
    if (eyebrow && !next) eyebrow.innerHTML = "<span></span> Latest drops";
  }

  // Countdown card on the events page
  const cd = document.querySelector(".events-countdown");
  if (cd) {
    if (next) {
      cd.dataset.countdown = next.start;
      cd.setAttribute("aria-label", "Countdown to " + next.code);
      const label = cd.querySelector(".countdown-label");
      if (label) label.textContent = next.code + " " + next.tag + " in";
    } else {
      cd.style.display = "none";
    }
  }

  // Floating button on every page
  const cta = document.querySelector(".mobile-ticket-cta");
  if (cta) {
    if (next) {
      cta.setAttribute("href", next.page);
      cta.innerHTML = (next.ctaLabel ? esc(next.ctaLabel) : "Next Event: " + esc(next.dateLabel)) + " <span>↗</span>";
    } else {
      cta.setAttribute("href", "events.html");
      cta.innerHTML = "View Events <span>↗</span>";
    }
  }
  // Gallery page: past events that have a photo gallery, newest first, latest one featured
  const archive = document.getElementById("archiveGrid");
  if (archive) {
    const withGallery = past.filter((e) => e.gallery);
    if (withGallery.length) {
      archive.innerHTML = withGallery.map((e, i) =>
        `<a aria-label="Open ${esc(e.code)} ${esc(e.galleryTitle || e.title)} gallery" class="archive-tile${i === 0 ? " archive-tile-featured" : ""}" href="gallery-event.html?event=${esc(e.gallery)}">` +
        `<span class="archive-tile-img" style="background-image:url('${esc(e.cover)}');background-position:${esc(e.coverPosition || "center")}"></span>` +
        `<span class="archive-tile-body"><span class="archive-tile-code">${esc(e.code)} · ${esc(e.dateLabel)}</span>` +
        `<strong class="archive-tile-title">${esc(e.galleryTitle || e.title)}</strong>` +
        `<span class="archive-tile-meta">${esc(e.gallerySub || "")}${e.photoCount ? " · " + e.photoCount + " photos" : ""}</span>` +
        `<span class="archive-tile-cta">Open gallery →</span></span></a>`
      ).join("");
    }
  }
})();
