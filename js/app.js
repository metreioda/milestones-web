// ── STATE ─────────────────────────────────────────────────────────────────────
let futureItems = [];
let intervals = [];

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
  const genre   = document.querySelector('.genre-btn.selected')?.dataset.genre ?? '';
  const passion = document.getElementById('passion').value;
  return { name, genre, passion };
}

function togglePersonalize() {
  const btn   = document.getElementById('personalize-toggle');
  const panel = document.getElementById('personalize-panel');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

function selectGenre(el) {
  document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

function accord(genre, masc, fem, neutre) {
  if (genre === 'f') return fem;
  if (genre === 'n') return neutre !== undefined ? neutre : masc + '·e';
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
  futureItems = future;

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

  // ── Future cards ──
  const futureTitle = name
    ? `⏳ Les prochains milestones de ${name} (${future.length})`
    : `⏳ Prochains milestones (${future.length})`;
  const fSec = document.getElementById('future-section');
  fSec.innerHTML = future.length ? `
    <h2 class="section-head">${futureTitle}</h2>
    <div class="grid">${future.map((x,i) => renderFutureCard(x, i===0)).join('')}</div>
  ` : '';

  // ── Past cards ──
  const pSec = document.getElementById('past-section');
  pSec.innerHTML = past.length ? `
    <h2 class="section-head">🏅 Milestones accomplis (${past.length})</h2>
    <div class="grid">${past.map((x, i) => renderPastCard(x, i)).join('')}</div>
  ` : '';

  // show
  const res = document.getElementById('results');
  res.classList.add('show');
  setTimeout(() => res.scrollIntoView({ behavior:'smooth', block:'start' }), 80);

  // ── Live countdowns ──
  future.forEach(item => {
    const el = document.getElementById(`cd-${item.idx}`);
    if (!el) return;
    const tick = () => {
      const d = item.date - new Date();
      el.textContent = fmtCountdown(d);
      el.classList.toggle('hot', d > 0 && d < 864e5 * 7);
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

  updateURL();
  confetti();
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
