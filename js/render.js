// ── UNIT BAND ─────────────────────────────────────────────────────────────────
// Dépend de UNIT_LABELS (data.js)
function unitBand(u) {
  return `<div class="card-unit-band"><span class="unit-tag ${u}">${UNIT_LABELS[u]}</span></div>`;
}

// ── TOP 3 MILESTONE CARD ──────────────────────────────────────────────────────
// Utilisé par calculate() dans app.js pour la section vedette
// Dépend de : MS (data.js), fmtDate, fmtCountdown (app.js)
function renderTopMilestone(item, rank) {
  const { m, date, diff, idx } = item;
  const total   = MS[m.u] * m.v;
  const elapsed = total - diff;
  const pct     = Math.min(99, Math.max(1, Math.round(elapsed / total * 100)));

  const rankLabels = ['Prochain', '2e', '3e'];

  return `
    <div class="top-milestone-card" style="animation-delay:${rank * 80}ms">
      <div class="top-milestone-rank">${rankLabels[rank]}</div>
      <div class="top-milestone-emoji">${m.e}</div>
      <div class="top-milestone-label">${m.n}</div>
      <div class="top-milestone-tagline">${m.t}</div>
      <div class="top-milestone-date">${fmtDate(date, true)}</div>
      <div class="top-milestone-countdown${diff < 864e5 * 7 ? ' hot' : ''}" id="cd-top-${idx}">${fmtCountdown(diff)}</div>
      <div class="prog-wrap">
        <div class="prog-meta"><span>Progression</span><span>${pct}%</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
}

// ── MILESTONE CARDS ───────────────────────────────────────────────────────────
// Dépend de : MS (data.js), fmtDate, fmtCountdown, fmtAgo (app.js)
// futureItems est une variable globale de app.js, accessible via les onclick inline
function renderFutureCard(item, isFirst) {
  const { m, date, diff, idx } = item;
  const total = MS[m.u] * m.v;
  const elapsed = total - diff;
  const pct = Math.min(99, Math.max(1, Math.round(elapsed / total * 100)));

  const delay = Math.min(idx * 40, 400);
  return `
    <div class="card ${isFirst ? 'next' : 'future'}" style="animation-delay:${delay}ms">
      ${isFirst ? '<div class="next-tag">Prochain !</div>' : ''}
      <div class="card-emoji">${m.e}</div>
      ${unitBand(m.u)}
      <div class="card-label">${m.n}</div>
      <div class="card-tagline">${m.t}</div>
      <div class="card-date">📅 <strong>${fmtDate(date, true)}</strong></div>
      <div class="countdown${diff < 864e5*7 ? ' hot' : ''}" id="cd-${idx}">${fmtCountdown(diff)}</div>
      <div class="prog-wrap">
        <div class="prog-meta"><span>Progression</span><span>${pct}%</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="card-btns">
        <button class="btn-sm btn-share" onclick="shareIdx(${idx})">📤 Partager</button>
        <button class="btn-sm btn-cal"   onclick="downloadICS([{m:futureItems[${idx}].m, date:futureItems[${idx}].date}])">📅 Calendrier</button>
      </div>
    </div>`;
}

function renderPastCard(item, cardIdx) {
  const { m, date, diff } = item;
  const mj = JSON.stringify(m).replace(/'/g,"\\'");
  const delay = Math.min((cardIdx || 0) * 40, 400);
  return `
    <div class="card past" style="animation-delay:${delay}ms">
      <div class="card-emoji">${m.e}</div>
      ${unitBand(m.u)}
      <div class="card-label">${m.n}</div>
      <div class="card-tagline">${m.t}</div>
      <div class="card-date">📅 <strong>${fmtDate(date, true)}</strong></div>
      <div class="past-done">✅ Accompli — <span class="past-ago">${fmtAgo(diff)}</span></div>
      <div class="card-btns">
        <button class="btn-sm btn-share" onclick="sharePast('${mj.replace(/"/g,"&quot;")}', '${date.toISOString()}')">📤 Partager</button>
      </div>
    </div>`;
}

// ── GEO SECTION ───────────────────────────────────────────────────────────────
// Dépend de : fmt (data.js), accord (app.js)
function computeGeoFacts(city, ageMs) {
  const ageYears = ageMs / (365.25 * 864e5);
  const ageDays  = ageMs / 864e5;
  const kmSun = Math.round(ageYears * 940e6);
  const latRad = city.lat * Math.PI / 180;
  const orbitRadiusKm = 6371 * Math.cos(latRad);
  const kmPerDay = 2 * Math.PI * orbitRadiusKm;
  const kmAxisTotal = Math.round(kmPerDay * ageDays);
  return { kmSun, kmAxisTotal, kmPerDay: Math.round(kmPerDay), hemisphere: city.lat >= 0 ? 'nord' : 'sud' };
}

function renderGeoSection(city, ageMs, genre = '') {
  const facts = computeGeoFacts(city, ageMs);
  const hemisphereNote = facts.hemisphere === 'sud'
    ? `<div class="geo-hemisphere-note">🌏 Hémisphère Sud : tes saisons sont inversées — tu fêtes Noël en été !</div>`
    : '';
  return `
    <div class="geo-card">
      <div class="geo-header">
        <div class="geo-flag">${city.flag}</div>
        <div>
          <div class="geo-city-name">${accord(genre, 'Né', 'Née', 'Né·e')} à ${city.name}</div>
          <div class="geo-country">${city.country}</div>
        </div>
      </div>
      <div class="geo-facts-grid">
        <div class="geo-fact-item">
          <div class="geo-fact-emoji">🌍</div>
          <div class="geo-fact-value">${fmt(facts.kmAxisTotal)} km</div>
          <div class="geo-fact-label">Parcourus autour de l'axe terrestre depuis ta naissance (à ${Math.abs(city.lat).toFixed(1)}° de latitude)</div>
        </div>
        <div class="geo-fact-item">
          <div class="geo-fact-emoji">🔄</div>
          <div class="geo-fact-value">${fmt(facts.kmPerDay)} km/j</div>
          <div class="geo-fact-label">Vitesse de rotation de ${city.name} autour de l'axe terrestre</div>
        </div>
        <div class="geo-fact-item">
          <div class="geo-fact-emoji">☀️</div>
          <div class="geo-fact-value">${fmt(facts.kmSun)} km</div>
          <div class="geo-fact-label">Parcourus autour du Soleil avec ${city.name} depuis ta naissance</div>
        </div>
      </div>
      ${hemisphereNote}
    </div>
  `;
}

// ── LIFE STATS ────────────────────────────────────────────────────────────────
// Dépend de : fmt (data.js), accord (app.js), PASSION_FACTS (data.js)
function computeLifeStats(ageMs) {
  const ageS = ageMs / 1000;
  const ageDays = ageMs / 864e5;
  const ageYears = ageDays / 365.25;
  return {
    heartbeats:    Math.round(ageS * 1.1),
    breaths:       Math.round(ageS * 0.25),
    blinks:        Math.round(ageDays * 14400),
    meals:         Math.round(ageDays * 3),
    sleepHours:    Math.round(ageDays * 8),
    dreamHours:    Math.round(ageDays * 2),
    kmSun:         Math.round(ageYears * 940e6),
    sunrisesLived: Math.round(ageDays),
    hairGrown_cm:  Math.round(ageDays * 0.35),
  };
}

function renderLifeStats(stats, persona = {}) {
  const { name, genre, passion } = persona;
  const items = [
    { e: '❤️', v: fmt(stats.heartbeats),            l: 'battements de cœur' },
    { e: '🌬️', v: fmt(stats.breaths),               l: 'respirations' },
    { e: '👁️', v: fmt(stats.blinks),               l: 'clignements de paupières' },
    { e: '🍽️', v: fmt(stats.meals),                l: 'repas avalés' },
    { e: '😴', v: fmt(stats.sleepHours) + ' h',     l: 'de sommeil' },
    { e: '💭', v: fmt(stats.dreamHours) + ' h',     l: 'de rêves' },
    { e: '☀️', v: fmt(stats.sunrisesLived),         l: 'levers de soleil vécus' },
    { e: '💇', v: fmt(stats.hairGrown_cm) + ' cm',  l: 'de cheveux poussés' },
    { e: '🌍', v: fmt(stats.kmSun) + ' km',         l: 'parcourus autour du Soleil' },
  ];

  let passionCard = '';
  if (passion && PASSION_FACTS[passion]) {
    const pf = PASSION_FACTS[passion];
    const passionAccord = accord(genre, 'passionné', 'passionnée', 'passionné·e');
    passionCard = `
      <div class="lifestats-card" style="border-color:rgba(155,89,255,0.3);background:linear-gradient(140deg,rgba(155,89,255,0.08),var(--surface2));">
        <div class="ls-emoji">${pf.emoji}</div>
        <div class="ls-value" style="font-size:0.85rem;line-height:1.4;">En tant que ${passionAccord} de ${pf.label}</div>
        <div class="ls-label">${pf.fact(stats.sleepHours)}</div>
      </div>`;
  }

  const subLabel = name
    ? `Estimations pour ${name} — tes vrais chiffres sont encore plus fous.`
    : `Estimations basées sur des moyennes — tes vrais chiffres sont encore plus fous.`;

  return `
    <h2 class="section-head">🧬 Le savais-tu ?</h2>
    <p class="section-sub">${subLabel}</p>
    <div class="lifestats-grid">
      ${items.map(i => `<div class="lifestats-card"><div class="ls-emoji">${i.e}</div><div class="ls-value">${i.v}</div><div class="ls-label">${i.l}</div></div>`).join('')}
      ${passionCard}
    </div>
  `;
}

// ── PLANET AGES ───────────────────────────────────────────────────────────────
// Dépend de PLANETS (data.js)
function renderPlanetAges(ageMs) {
  const ageDays = ageMs / 864e5;
  return `
    <h2 class="section-head">🪐 Ton âge dans le système solaire</h2>
    <div class="planet-grid">
      ${PLANETS.map(p => {
        const age = ageDays / p.days;
        const display = age < 1
          ? `${(age * 12).toFixed(1)} mois`
          : age < 2
          ? `${age.toFixed(2)} an`
          : `${age.toFixed(2)} ans`;
        return `
          <div class="planet-card">
            <div class="planet-emoji">${p.emoji}</div>
            <div class="planet-name">${p.name}</div>
            <div class="planet-age">${display}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── NUMÉROLOGIE ───────────────────────────────────────────────────────────────
function renderNumerologyCard(lifePathNum, expressionNum) {
  const lp = NUMEROLOGY_DATA[lifePathNum];
  if (!lp) return '';
  const masterBadge = lp.master ? '<span class="astro-master-badge">Nombre maître</span>' : '';
  const expressionLine = expressionNum !== null
    ? `<div class="astro-sub">Expression : ${expressionNum} · ${NUMEROLOGY_DATA[expressionNum]?.name || ''}</div>`
    : `<div class="astro-sub">Ajoute ton prénom pour le nombre d'expression</div>`;
  return `
    <div class="astro-card numerology">
      <div class="astro-emoji">${lp.emoji}</div>
      <div class="astro-type">Chemin de vie</div>
      <div class="astro-name">${lifePathNum} — ${lp.name}</div>
      ${masterBadge}
      ${expressionLine}
    </div>`;
}

function renderNumerologyProfileBlock(lifePathNum, expressionNum, firstName) {
  const lp = NUMEROLOGY_DATA[lifePathNum];
  if (!lp) return '';
  const masterLabel = lp.master
    ? `<span class="numerology-master-label">✦ Nombre maître ${lifePathNum}</span>`
    : `<span class="numerology-label">Chemin de vie ${lifePathNum}</span>`;
  const traitsHTML = lp.traits.map(t => `<span class="numerology-trait">${t}</span>`).join('');

  let expressionHTML = '';
  if (expressionNum !== null) {
    const exp = NUMEROLOGY_DATA[expressionNum];
    const expMaster = exp?.master
      ? `<span class="numerology-master-label">✦ Nombre maître ${expressionNum}</span>`
      : `<span class="numerology-label">Nombre d'expression ${expressionNum}</span>`;
    const expTraitsHTML = (exp?.traits || []).map(t => `<span class="numerology-trait">${t}</span>`).join('');
    expressionHTML = `
      <div class="numerology-block">
        ${expMaster}
        <div class="numerology-title">${expressionNum} — ${exp?.name || ''} ${exp?.emoji || ''}</div>
        <p class="numerology-desc">${exp?.description || ''}</p>
        <div class="numerology-traits">${expTraitsHTML}</div>
        <div class="numerology-method">Calculé à partir du prénom <strong>${firstName}</strong> — table de Pythagore</div>
      </div>`;
  }

  return `
    <div class="numerology-section">
      <div class="numerology-divider">🔢 Numérologie</div>
      <div class="numerology-block">
        ${masterLabel}
        <div class="numerology-title">${lifePathNum} — ${lp.name} ${lp.emoji}</div>
        <p class="numerology-desc">${lp.description}</p>
        <div class="numerology-traits">${traitsHTML}</div>
        <div class="numerology-method">Somme des chiffres de ta date de naissance, réduite selon la tradition pythagoricienne</div>
      </div>
      ${expressionHTML}
    </div>`;
}

// ── SAISONS & ÉVÉNEMENTS ──────────────────────────────────────────────────────
// Dépend de : SEASONS_NORTH, getSeasonNorth, WEEKDAYS, HISTORICAL_EVENTS (data.js)
function renderSeasonAndEvents(birthDate, genre) {
  const month = birthDate.getMonth();   // 0-11
  const day   = birthDate.getDate();    // 1-31
  const dow   = birthDate.getDay();     // 0=dim, 6=sam

  const seasonIdx = getSeasonNorth(month, day);
  const season    = SEASONS_NORTH[seasonIdx];
  const weekday   = WEEKDAYS[dow];

  // Catégories emoji map
  const catEmoji = {
    science:   '🔬',
    art:       '🎨',
    politics:  '🏛️',
    discovery: '🧭',
    sport:     '🏆',
    culture:   '🎭',
    history:   '📜',
  };

  // Filter events matching birth month/day, shuffle deterministically, take max 5
  const events = HISTORICAL_EVENTS
    .filter(e => e.month === month && e.day === day)
    .sort((a, b) => Math.abs(a.year) - Math.abs(b.year))
    .slice(0, 5);

  const eventsHTML = events.length > 0
    ? events.map(ev => {
        const yearDisplay = ev.year < 0 ? `${Math.abs(ev.year)} av. J.-C.` : `${ev.year}`;
        return `
          <div class="event-item">
            <div class="event-year">${yearDisplay}</div>
            <div class="event-cat-emoji">${catEmoji[ev.category] || '📌'}</div>
            <div class="event-content">
              <div class="event-title">${ev.title}</div>
              <div class="event-desc">${ev.description}</div>
            </div>
          </div>`;
      }).join('')
    : `<div class="events-empty">Aucun grand événement historique recensé pour ce jour — peut-être que ta naissance est le plus grand événement de cette date !</div>`;

  return `
    <div class="season-events-wrap">
      <h2 class="section-head">🌿 Ta naissance dans le temps</h2>
      <div class="season-events-grid">

        <div class="season-card">
          <div class="season-emoji">${season.emoji}</div>
          <div class="season-body">
            <div class="season-label">Saison de naissance</div>
            <div class="season-name">${season.name}</div>
            <div class="season-desc">${season.desc}</div>
          </div>
        </div>

        <div class="weekday-card">
          <div class="weekday-emoji">${weekday.emoji}</div>
          <div class="weekday-body">
            <div class="weekday-label">Jour de naissance</div>
            <div class="weekday-name">${weekday.name}</div>
            <div class="weekday-desc">${weekday.desc}</div>
          </div>
        </div>

      </div>

      <div class="events-box">
        <div class="events-box-header">
          <span class="events-box-title">📜 Ce jour dans l'histoire</span>
          <span class="events-box-date">${day} ${birthDate.toLocaleDateString('fr-FR', { month: 'long' })}</span>
        </div>
        <div class="events-list">
          ${eventsHTML}
        </div>
      </div>
    </div>
  `;
}

// ── TOGGLE ASTRAL PROFILE ─────────────────────────────────────────────────────
function toggleAstralProfile() {
  const btn   = document.getElementById('astro-profile-btn');
  const label = document.getElementById('astro-profile-btn-label');
  const panel = document.getElementById('astro-profile-panel');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  label.textContent = isOpen ? '🔮 En savoir plus sur mon profil astral' : '✨ Masquer mon profil astral';
}
