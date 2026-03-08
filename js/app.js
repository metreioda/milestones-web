// ── STATE ─────────────────────────────────────────────────────────────────────
let futureItems = [];
let intervals = [];
let allMilestones = [];       // référence globale pour la timeline
let currentView = 'grid';     // 'grid' | 'timeline'

// ── CITIES ────────────────────────────────────────────────────────────────────
function buildCitiesDatalist() {
  const dl = document.getElementById('cities-list');
  CITIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.label = `${c.flag} ${c.country}`;
    dl.appendChild(opt);
  });
}

function findCity(input) {
  if (!input || input.trim().length < 2) return null;
  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const needle = normalize(input);
  return CITIES.find(c => normalize(c.name) === needle)
      || CITIES.find(c => normalize(c.name).startsWith(needle))
      || CITIES.find(c => normalize(c.name).includes(needle))
      || null;
}

// ── PERSONNALISATION ──────────────────────────────────────────────────────────
function getPersonalization() {
  const name    = (document.getElementById('pname').value || '').trim();
  const passion = document.getElementById('passion').value;
  return { name, genre: '', passion };
}

function togglePersonalize() {
  const btn   = document.getElementById('personalize-toggle');
  const panel = document.getElementById('personalize-panel');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

function accord(genre, masc, fem, neutre) {
  return masc;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmtAge(ms) {
  const d = Math.floor(ms / 864e5);
  const y = Math.floor(d / 365.25);
  const mo = Math.floor((d % 365.25) / 30.44);
  const dd = Math.floor(d % 30.44);
  const parts = [];
  if (y)  parts.push(`${y} an${y>1?'s':''}`);
  if (mo) parts.push(`${mo} mois`);
  if (dd) parts.push(`${dd} jour${dd>1?'s':''}`);
  return parts.join(', ');
}

function fmtCountdown(ms) {
  if (ms <= 0) return '🎉 C\'est aujourd\'hui !';
  const d = Math.floor(ms / 864e5);
  const h = Math.floor((ms % 864e5)  / 36e5);
  const m = Math.floor((ms % 36e5)   / 6e4);
  const s = Math.floor((ms % 6e4)    / 1e3);
  if (d > 365) return `${Math.floor(d/365)}a ${d%365}j ${h}h ${m}m ${s}s`;
  if (d > 0)   return `${d}j ${h}h ${m}m ${s}s`;
  if (h > 0)   return `${h}h ${m}m ${s}s`;
  if (m > 0)   return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtAgo(ms) {
  const a = Math.abs(ms);
  const d = Math.floor(a / 864e5);
  if (d > 365) return `Il y a ${Math.floor(d/365)} an${Math.floor(d/365)>1?'s':''}`;
  if (d > 0)   return `Il y a ${d} jour${d>1?'s':''}`;
  const h = Math.floor(a / 36e5);
  if (h > 0)   return `Il y a ${h}h`;
  const m = Math.floor(a / 6e4);
  return `Il y a ${m}m`;
}

function fmtDate(dt, showTime = false) {
  const datePart = dt.toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  if (!showTime) return datePart;
  const h = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${datePart} à ${h}h${min}`;
}

// ── ICS EXPORT ────────────────────────────────────────────────────────────────
function makeICS(events) {
  const pad2 = n => String(n).padStart(2,'0');
  const dateStr = d => `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}`;
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MilestoneMe//FR','CALSCALE:GREGORIAN'];
  events.forEach((ev, i) => {
    const ds = dateStr(ev.date);
    lines.push(
      'BEGIN:VEVENT',
      `UID:mm-${i}-${ds}@milestoneme.app`,
      `DTSTART;VALUE=DATE:${ds}`,
      `DTEND;VALUE=DATE:${ds}`,
      `SUMMARY:${ev.m.e} ${ev.m.n} de vie !`,
      `DESCRIPTION:${ev.m.t} — MilestoneMe`,
      'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY',
      `DESCRIPTION:Demain : ${ev.m.n} de vie !`,
      'END:VALARM','END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICS(events) {
  const blob = new Blob([makeICS(events)], { type:'text/calendar;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob), download: 'mes-milestones.ics'
  });
  a.click(); URL.revokeObjectURL(a.href);
}

// ── TOGGLE MILESTONE SECTIONS ─────────────────────────────────────────────
function toggleMilestoneSection(section) {
  const hidden = document.getElementById(`${section}-hidden`);
  const btn = document.getElementById(`btn-show-${section}`);
  if (!hidden || !btn) return;
  const isOpen = hidden.style.display !== 'none';
  hidden.style.display = isOpen ? 'none' : '';
  btn.textContent = isOpen
    ? btn.dataset.showLabel
    : (section === 'future' ? 'Masquer les milestones' : 'Masquer les milestones accomplis');
  if (!isOpen) {
    // Animate newly visible cards
    hidden.querySelectorAll('.card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
      el.style.transition = `opacity 0.35s ease ${i * 40}ms, transform 0.35s ease ${i * 40}ms`;
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    });
  }
}

// ── TOGGLE MILESTONE VIEW — grid ↔ timeline ───────────────────────────────────
function toggleMilestoneView(view) {
  currentView = view;

  const btnGrid     = document.getElementById('btn-view-grid');
  const btnTimeline = document.getElementById('btn-view-timeline');
  const futSec      = document.getElementById('future-section');
  const pastSec     = document.getElementById('past-section');
  const tlSec       = document.getElementById('timeline-section');

  if (!btnGrid || !btnTimeline || !futSec || !pastSec || !tlSec) return;

  if (view === 'grid') {
    // Activer grille
    btnGrid.classList.add('active');
    btnGrid.setAttribute('aria-pressed', 'true');
    btnTimeline.classList.remove('active');
    btnTimeline.setAttribute('aria-pressed', 'false');

    futSec.style.display = '';
    pastSec.style.display = '';
    tlSec.style.display = 'none';

  } else {
    // Activer timeline
    btnTimeline.classList.add('active');
    btnTimeline.setAttribute('aria-pressed', 'true');
    btnGrid.classList.remove('active');
    btnGrid.setAttribute('aria-pressed', 'false');

    futSec.style.display = 'none';
    pastSec.style.display = 'none';
    tlSec.style.display = '';

    // Déclencher le scroll reveal des items de la timeline
    _observeTimelineItems();
  }
}

// IntersectionObserver pour les items de la timeline
function _observeTimelineItems() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Pas d'animation : tout visible immédiatement
    document.querySelectorAll('#timeline-section .timeline-item[data-tl-item]').forEach(el => {
      el.classList.add('tl-visible');
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('tl-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('#timeline-section .timeline-item[data-tl-item]').forEach(el => {
    obs.observe(el);
  });
}

// ── SHARE ─────────────────────────────────────────────────────────────────────
function shareIdx(idx) {
  const item = futureItems[idx];
  const { name } = getPersonalization();
  const who = name ? `${name} va` : 'Je vais';
  const text = `${who} atteindre ${item.m.n} le ${fmtDate(item.date)} ! ${item.m.e}\nCalcule tes milestones → milestoneme.app`;
  if (navigator.share) navigator.share({ text });
  else navigator.clipboard.writeText(text).then(() => alert('Copié ! 📋'));
}

function sharePast(milestoneJson, dateStr) {
  const m = JSON.parse(milestoneJson);
  const { name } = getPersonalization();
  const who = name ? `${name} a` : "J'ai";
  const text = `${who} atteint ${m.n} le ${fmtDate(new Date(dateStr), true)} ! ${m.e}\nCalcule tes milestones → milestoneme.app`;
  if (navigator.share) navigator.share({ text });
  else navigator.clipboard.writeText(text).then(() => alert('Copié ! 📋'));
}

// ── CONFETTI ──────────────────────────────────────────────────────────────────
function confetti() {
  const cols = ['#f5c842','#9b59ff','#3fffaa','#ff4eb8','#ffffff','#ff6b6b'];
  for (let i = 0; i < 90; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'c-piece';
      const size = 5 + Math.random() * 8;
      p.style.cssText = `
        left:${Math.random()*100}vw;
        width:${size}px; height:${size}px;
        background:${cols[Math.floor(Math.random()*cols.length)]};
        border-radius:${Math.random()>.5?'50%':'3px'};
        animation-duration:${2.2+Math.random()*3}s;
        animation-delay:${Math.random()*0.4}s;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 6000);
    }, i * 22);
  }
}

// ── URL PARTAGE ────────────────────────────────────────────────────────────────
function updateURL() {
  const d = document.getElementById('bd').value;
  const t = document.getElementById('bt').value;
  if (!d) return;
  const params = new URLSearchParams({ d });
  if (t) params.set('t', t);
  const l = document.getElementById('bplace').value.trim();
  if (l) params.set('l', l);
  const n = document.getElementById('pname').value.trim();
  if (n) params.set('name', n);
  const pas = document.getElementById('passion').value;
  if (pas) params.set('passion', pas);
  history.replaceState(null, '', '?' + params.toString());
}

// ── MAIN CALCULATE ────────────────────────────────────────────────────────────
function calculate() {
  const val = document.getElementById('bd').value;
  if (!val) { alert('Entre ta date de naissance 🎂'); return; }

  const timeVal = document.getElementById('bt').value || '12:00';
  const birth = new Date(val + 'T' + timeVal + ':00');
  if (isNaN(birth)) { alert('Date invalide'); return; }

  const now = new Date();
  if (birth > now) { alert('La date doit être dans le passé ! 😅'); return; }

  // cleanup
  intervals.forEach(clearInterval);
  intervals = [];
  futureItems = [];

  const ageMs = now - birth;
  const { name, genre, passion } = getPersonalization();
  const cityInput = document.getElementById('bplace').value;
  const detectedCity = findCity(cityInput);

  // compute all
  const all = MILESTONES.map(m => {
    const date = new Date(birth.getTime() + m.v * MS[m.u]);
    const diff = date - now;
    return { m, date, diff, isPast: diff < 0 };
  }).sort((a,b) => a.date - b.date);

  const past   = all.filter(x =>  x.isPast).reverse();
  const future = all.filter(x => !x.isPast).map((x,i) => ({ ...x, idx: i }));
  futureItems  = future;
  allMilestones = all;  // stocké globalement pour la timeline

  // ── Top 3 milestones ──
  const topSection = document.getElementById('top-milestones-section');
  if (topSection && future.length > 0) {
    const top3 = future.slice(0, 3);
    topSection.innerHTML = `
      <h2 class="section-head">Tes prochains rendez-vous</h2>
      <div class="top-milestones-grid">
        ${top3.map((item, i) => renderTopMilestone(item, i)).join('')}
      </div>
    `;
  } else if (topSection) {
    topSection.innerHTML = '';
  }

  // ── Age ──
  document.getElementById('age-val').textContent = fmtAge(ageMs);
  const ageLbl = document.querySelector('.age-box .lbl');
  if (ageLbl) ageLbl.textContent = name ? `Bonjour ${name} ! Tu as vécu` : 'Tu as vécu';

  // ── Geo origin tag in age-box ──
  const ageBox = document.querySelector('.age-box');
  const existingGeoTag = ageBox && ageBox.querySelector('.geo-origin-tag');
  if (existingGeoTag) existingGeoTag.remove();
  if (detectedCity && ageBox) {
    const tag = document.createElement('div');
    tag.className = 'geo-origin-tag';
    tag.innerHTML = `${detectedCity.flag} ${detectedCity.name}, ${detectedCity.country}`;
    tag.style.cssText = 'font-size:0.82rem;color:var(--muted);margin-top:10px;font-weight:600;letter-spacing:0.02em;';
    ageBox.appendChild(tag);
  }

  // ── Stats ──
  const statsRow = document.getElementById('stats-row');
  const totalS = Math.floor(ageMs/1e3);
  statsRow.innerHTML = `
    <div class="stat-pill s-pill"><strong id="live-s">${fmt(totalS)}</strong><span>⚡ secondes</span></div>
    <div class="stat-pill m-pill"><strong>${fmt(Math.floor(ageMs/6e4))}</strong><span>⏰ minutes</span></div>
    <div class="stat-pill h-pill"><strong>${fmt(Math.floor(ageMs/36e5))}</strong><span>🕰️ heures</span></div>
    <div class="stat-pill d-pill"><strong>${fmt(Math.floor(ageMs/864e5))}</strong><span>📅 jours</span></div>
    <div class="stat-pill w-pill"><strong>${fmt(Math.floor(ageMs/6048e5))}</strong><span>📆 semaines</span></div>
  `;

  // ── Life stats ──
  let lifestatsHTML = renderLifeStats(computeLifeStats(ageMs), { name, genre, passion });
  if (detectedCity) lifestatsHTML += renderGeoSection(detectedCity, ageMs, genre);
  document.getElementById('lifestats-section').innerHTML = lifestatsHTML;

  // ── Planet ages ──
  document.getElementById('planet-section').innerHTML = renderPlanetAges(ageMs);

  // ── Profil astral ──
  const birthMonth = birth.getMonth() + 1;
  const birthDay   = birth.getDate();
  const zodiac  = getZodiacSign(birthMonth, birthDay);
  const moon    = getMoonPhase(birth);
  const chinese = getChineseZodiac(birth);
  const astroDescription = generateAstralDescription(zodiac.name, moon.moonSign.name, chinese.name);

  // Numérologie
  const lifePathNum   = getLifePathNumber(birth);
  const expressionNum = name ? getExpressionNumber(name) : null;

  // Ascendant estimé (basé sur heure + lieu)
  const birthHour = parseFloat(timeVal.split(':')[0]) + parseFloat(timeVal.split(':')[1]) / 60;
  const ascendant = detectedCity ? computeAscendant(birthHour, birthMonth, birthDay, detectedCity) : null;
  const ascendantCard = ascendant ? `
    <div class="astro-card ascendant">
      <div class="astro-emoji">${ascendant.emoji}</div>
      <div class="astro-type">Ascendant estimé</div>
      <div class="astro-name">Ascendant ${ascendant.sign}</div>
      <div class="astro-sub">Basé sur ${ascendant.city} · hémisphère ${ascendant.hemisphere}</div>
    </div>` : '';

  document.getElementById('astro-section').innerHTML = `
    <h2 class="section-head">🔮 Ton profil astral</h2>
    <div class="astro-box">
      <div class="astro-card western">
        <div class="astro-emoji">${zodiac.emoji}</div>
        <div class="astro-type">Signe occidental</div>
        <div class="astro-name">${zodiac.name}</div>
        <div class="astro-sub">Zodiaque tropical</div>
      </div>
      <div class="astro-card moon">
        <div class="astro-emoji">${moon.phaseEmoji} ${moon.moonSign.emoji}</div>
        <div class="astro-type">Signe lunaire</div>
        <div class="astro-name">Lune en ${moon.moonSign.name}</div>
        <div class="astro-sub">${moon.phaseName} à ta naissance</div>
      </div>
      <div class="astro-card chinese">
        <div class="astro-emoji">${chinese.emoji}</div>
        <div class="astro-type">Zodiaque chinois</div>
        <div class="astro-name">${chinese.name}</div>
        <div class="astro-sub">Élément : ${chinese.element} · ${chinese.year}</div>
      </div>
      ${ascendantCard}
      ${renderNumerologyCard(lifePathNum, expressionNum)}
    </div>
    <button class="astro-profile-btn" id="astro-profile-btn" onclick="toggleAstralProfile()">
      <span id="astro-profile-btn-label">🔮 En savoir plus sur mon profil astral</span>
    </button>
    <div class="astro-profile-panel" id="astro-profile-panel">
      <div class="astro-profile-inner">
        <div class="astro-profile-header">
          <div class="astro-profile-sigils">${zodiac.emoji} ${moon.moonSign.emoji} ${chinese.emoji} ${NUMEROLOGY_DATA[lifePathNum]?.emoji || ''}</div>
          <div>
            <div class="astro-profile-title">${zodiac.name} · Lune en ${moon.moonSign.name} · ${chinese.name} · Chemin ${lifePathNum}</div>
            <div class="astro-profile-subtitle">Analyse astrologique non certifiée par les étoiles</div>
          </div>
        </div>
        <div class="astro-profile-body">
          ${astroDescription}
          ${renderNumerologyProfileBlock(lifePathNum, expressionNum, name)}
        </div>
        <div class="astro-profile-disclaimer">
          * Ceci est de l'astrologie de magazine. Les astres déclinent toute responsabilité.
        </div>
      </div>
    </div>
  `;

  // ── Saisons & Événements ──
  document.getElementById('season-events-section').innerHTML = renderSeasonAndEvents(birth, genre);

  // ── Calendriers alternatifs ──
  const y = birth.getFullYear(), mo = birth.getMonth() + 1, da = birth.getDate();
  const hijri    = jdToHijri(gregorianToJD(y, mo, da));
  const french   = gregorianToFrenchRevolutionary(y, mo, da);
  const ethiopian = gregorianToEthiopian(y, mo, da);
  const jalali   = gregorianToJalali(y, mo, da);
  const julian   = gregorianToJulian(y, mo, da);
  document.getElementById('calendars-section').innerHTML = `
    <h2 class="section-head">🗓️ Ta naissance dans d'autres calendriers</h2>
    <div class="calendars-grid">
      <div class="cal-card">
        <div class="cal-flag">☪️</div>
        <div class="cal-body">
          <div class="cal-type">Calendrier Hijri</div>
          <div class="cal-date">${hijri.day} ${hijri.monthName} ${hijri.year} H</div>
          <div class="cal-note">Calendrier lunaire islamique</div>
        </div>
      </div>
      <div class="cal-card">
        <div class="cal-flag">🇫🇷</div>
        <div class="cal-body">
          <div class="cal-type">Calendrier Républicain</div>
          <div class="cal-date">${french.display}</div>
          <div class="cal-note">Révolution française · An I = 1792</div>
        </div>
      </div>
      <div class="cal-card">
        <div class="cal-flag">🇪🇹</div>
        <div class="cal-body">
          <div class="cal-type">Calendrier Éthiopien</div>
          <div class="cal-date">${ethiopian.display}</div>
          <div class="cal-note">7-8 ans de décalage avec le grégorien</div>
        </div>
      </div>
      <div class="cal-card">
        <div class="cal-flag">🇮🇷</div>
        <div class="cal-body">
          <div class="cal-type">Calendrier Persan (Jalali)</div>
          <div class="cal-date">${jalali.display}</div>
          <div class="cal-note">Le calendrier solaire le plus précis</div>
        </div>
      </div>
      <div class="cal-card">
        <div class="cal-flag">🏛️</div>
        <div class="cal-body">
          <div class="cal-type">Calendrier Julien</div>
          <div class="cal-date">${julian.display}</div>
          <div class="cal-note">13 jours de décalage (actuel)</div>
        </div>
      </div>
    </div>
  `;

  // ── ICS all ──
  document.getElementById('ics-all-btn').textContent =
    `📅 Ajouter mes ${Math.min(future.length, 10)} prochains milestones au calendrier`;
  document.getElementById('ics-all-btn').onclick = () =>
    downloadICS(future.slice(0,10).map(x => ({ m: x.m, date: x.date })));

  // ── Future cards (collapsed by default) ──
  const FUTURE_PREVIEW = 3;
  const futureTitle = name
    ? `⏳ Les prochains milestones de ${name} (${future.length})`
    : `⏳ Prochains milestones (${future.length})`;
  const fSec = document.getElementById('future-section');
  if (future.length) {
    const futureCards = future.map((x,i) => renderFutureCard(x, i===0));
    const visibleFuture = futureCards.slice(0, FUTURE_PREVIEW).join('');
    const hiddenFuture = futureCards.slice(FUTURE_PREVIEW).join('');
    const hasMoreFuture = future.length > FUTURE_PREVIEW;
    fSec.innerHTML = `
      <h2 class="section-head">${futureTitle}</h2>
      <div class="grid">${visibleFuture}</div>
      ${hasMoreFuture ? `
        <div class="milestone-hidden-grid grid" id="future-hidden" style="display:none">${hiddenFuture}</div>
        <button class="btn-show-more" id="btn-show-future" data-show-label="Découvrir ${future.length - FUTURE_PREVIEW} milestones de plus" onclick="toggleMilestoneSection('future')">
          Découvrir ${future.length - FUTURE_PREVIEW} milestones de plus
        </button>
      ` : ''}
    `;
  } else {
    fSec.innerHTML = '';
  }

  // ── Past cards (collapsed by default) ──
  const PAST_PREVIEW = 3;
  const pSec = document.getElementById('past-section');
  if (past.length) {
    const pastCards = past.map((x, i) => renderPastCard(x, i));
    const visiblePast = pastCards.slice(0, PAST_PREVIEW).join('');
    const hiddenPast = pastCards.slice(PAST_PREVIEW).join('');
    const hasMorePast = past.length > PAST_PREVIEW;
    pSec.innerHTML = `
      <h2 class="section-head">🏅 Milestones accomplis (${past.length})</h2>
      <div class="grid">${visiblePast}</div>
      ${hasMorePast ? `
        <div class="milestone-hidden-grid grid" id="past-hidden" style="display:none">${hiddenPast}</div>
        <button class="btn-show-more" id="btn-show-past" data-show-label="Découvrir ${past.length - PAST_PREVIEW} milestones accomplis de plus" onclick="toggleMilestoneSection('past')">
          Découvrir ${past.length - PAST_PREVIEW} milestones accomplis de plus
        </button>
      ` : ''}
    `;
  } else {
    pSec.innerHTML = '';
  }

  // ── Timeline ──
  const tlSec = document.getElementById('timeline-section');
  if (tlSec && typeof renderTimeline === 'function') {
    tlSec.innerHTML = renderTimeline(all, birth, now, future);
  }

  // ── Afficher / masquer les sections selon la vue actuelle ──
  // Reset la vue sur 'grid' à chaque nouveau calcul
  currentView = 'grid';
  const vToggle = document.getElementById('view-toggle-wrap');
  if (vToggle) vToggle.style.display = 'flex';

  // S'assurer que la vue grille est l'état par défaut
  const btnG = document.getElementById('btn-view-grid');
  const btnT = document.getElementById('btn-view-timeline');
  if (btnG) { btnG.classList.add('active'); btnG.setAttribute('aria-pressed', 'true'); }
  if (btnT) { btnT.classList.remove('active'); btnT.setAttribute('aria-pressed', 'false'); }
  if (tlSec) tlSec.style.display = 'none';
  const fSec2 = document.getElementById('future-section');
  const pSec2 = document.getElementById('past-section');
  if (fSec2) fSec2.style.display = '';
  if (pSec2) pSec2.style.display = '';

  // show
  const res = document.getElementById('results');
  res.classList.add('show');
  setTimeout(() => res.scrollIntoView({ behavior:'smooth', block:'start' }), 80);

  // ── Live countdowns (cards + top 3 + timeline) ──
  future.forEach(item => {
    const el    = document.getElementById(`cd-${item.idx}`);
    const elTop = document.getElementById(`cd-top-${item.idx}`);
    const elTl  = document.getElementById(`tl-cd-${item.idx}`);
    const tick = () => {
      const d = item.date - new Date();
      const str = fmtCountdown(d);
      const isHot = d > 0 && d < 864e5 * 7;
      if (el) {
        el.textContent = str;
        el.classList.toggle('hot', isHot);
      }
      if (elTop) {
        elTop.textContent = str;
        elTop.classList.toggle('hot', isHot);
      }
      if (elTl) {
        elTl.textContent = str;
        elTl.classList.toggle('hot', isHot);
      }
    };
    tick();
    intervals.push(setInterval(tick, 1000));
  });

  // ── Live seconds counter ──
  intervals.push(setInterval(() => {
    const el = document.getElementById('live-s');
    if (!el) return;
    el.textContent = fmt(Math.floor((new Date() - birth) / 1e3));
  }, 1000));

  // ── Masquer le canvas WebGL hero ──
  if (typeof window._hideHeroCanvas === 'function') {
    window._hideHeroCanvas();
  }

  // ── Scroll reveal — stagger animé des sections ──
  setTimeout(() => {
    document.querySelectorAll('#results > div').forEach((el, i) => {
      // Exclure la timeline (hidden par défaut) et le toggle wrapper
      // pour éviter de perturber l'animation au moment du switch de vue
      if (el.id === 'timeline-section' || el.id === 'view-toggle-wrap') return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
      // Forcer le reflow pour que la transition soit effective
      void el.offsetHeight;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    });
    // Activer les sections IntersectionObserver
    if (typeof window.observeRevealSections === 'function') {
      window.observeRevealSections();
    }
  }, 10);

  // Activer le theming dynamique par section
  if (typeof window.observeThemeSections === 'function') {
    setTimeout(window.observeThemeSections, 100);
  }

  updateURL();

  // Update "Ma Timeline" link with current URL params
  const tlLink = document.getElementById('btn-timeline-page');
  if (tlLink) {
    const currentParams = new URLSearchParams(location.search);
    tlLink.href = 'timeline.html?' + currentParams.toString();
    tlLink.style.display = 'inline-flex';
  }

  confetti();
}

// ── EXPAND TIMELINE (voir plus) ────────────────────────────────────────────────
function expandTimeline() {
  if (!window._tlAllItems) return;
  const tlSec = document.getElementById('timeline-section');
  if (!tlSec) return;

  // Régénérer sans limite (9999 = tout afficher)
  tlSec.innerHTML = renderTimeline(
    window._tlAllItems,
    window._tlBirth,
    window._tlNow,
    window._tlFuture,
    9999
  );

  // Re-déclencher le scroll reveal des nouveaux items
  _observeTimelineItems();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
// Set max date to today
document.getElementById('bd').max = new Date().toISOString().split('T')[0];

// Allow Enter key
document.getElementById('bd').addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });

// ── URL DÉCODAGE AU CHARGEMENT ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const p = new URLSearchParams(location.search);
  if (p.get('l'))       document.getElementById('bplace').value  = p.get('l');
  if (p.get('name'))    document.getElementById('pname').value   = p.get('name');
  if (p.get('passion')) document.getElementById('passion').value = p.get('passion');
  buildCitiesDatalist(); // populate datalist on every load
  if (p.get('d')) {
    document.getElementById('bd').value = p.get('d');
    if (p.get('t')) document.getElementById('bt').value = p.get('t');
    calculate();
  }
});
