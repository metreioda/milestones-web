// ── ASCENDANT CALCULATION ─────────────────────────────────────────────────────
function computeAscendant(birthHour, month, day, city) {
  const signs = ['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'];
  const signEmojis = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const dayOfYear = Math.floor((new Date(2000, month - 1, day) - new Date(2000, 0, 0)) / 864e5);
  const lstBase = (dayOfYear / 365.25) * 24;
  const localLST = (lstBase + birthHour + (city.lon / 15) + 24) % 24;
  const latFactor = 1 + Math.abs(city.lat) / 180;
  const ascIdx = Math.floor((localLST * latFactor) % 12);
  return {
    sign: signs[ascIdx],
    emoji: signEmojis[ascIdx],
    city: city.name,
    hemisphere: city.lat >= 0 ? 'nord' : 'sud'
  };
}

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
//
// Taux par phase de vie (par jour sauf heartbeats/breaths en /seconde)
// Sources : pédiatrie, moyennes OMS, études comportementales
const LIFE_PHASES = [
  //        âge max  heart/s  breath/s  blinks/j  meals/j  sleep h/j  dream h/j  words/j   coffee/j  laughs/j  hair cm/j
  { maxY:1,  heart:2.0, breath:0.5, blinks:4800,  meals:6, sleep:16, dream:8,  words:0,     coffee:0,   laughs:50,  hair:0.02 },  // bébé
  { maxY:3,  heart:1.7, breath:0.4, blinks:7200,  meals:5, sleep:13, dream:5,  words:300,   coffee:0,   laughs:40,  hair:0.25 },  // bambin
  { maxY:6,  heart:1.5, breath:0.35,blinks:10000, meals:4, sleep:11, dream:3.5,words:5000,  coffee:0,   laughs:30,  hair:0.30 },  // petit enfant
  { maxY:12, heart:1.3, breath:0.3, blinks:12000, meals:3, sleep:10, dream:2.5,words:10000, coffee:0,   laughs:20,  hair:0.33 },  // enfant
  { maxY:16, heart:1.2, breath:0.27,blinks:14000, meals:3, sleep:9,  dream:2,  words:14000, coffee:0.2, laughs:17,  hair:0.35 },  // ado
  { maxY:999,heart:1.1, breath:0.25,blinks:14400, meals:3, sleep:7.5,dream:1.5,words:16000, coffee:2.5, laughs:15,  hair:0.35 },  // adulte
];

function computeLifeStats(ageMs) {
  const ageDays = ageMs / 864e5;
  const ageYears = ageDays / 365.25;

  // Accumulateurs
  let heartbeats = 0, breaths = 0, blinks = 0, meals = 0;
  let sleepHours = 0, dreamHours = 0, wordsSpoken = 0;
  let coffeeEquiv = 0, laughsLived = 0, hairGrown_cm = 0;

  let prevMaxY = 0;
  for (const p of LIFE_PHASES) {
    const startY = prevMaxY;
    const endY = Math.min(p.maxY, ageYears);
    if (startY >= ageYears) break;
    const days = (endY - startY) * 365.25;
    const secs = days * 86400;

    heartbeats  += secs * p.heart;
    breaths     += secs * p.breath;
    blinks      += days * p.blinks;
    meals       += days * p.meals;
    sleepHours  += days * p.sleep;
    dreamHours  += days * p.dream;
    wordsSpoken += days * p.words;
    coffeeEquiv += days * p.coffee;
    laughsLived += days * p.laughs;
    hairGrown_cm+= days * p.hair;

    prevMaxY = p.maxY;
  }

  return {
    heartbeats:    Math.round(heartbeats),
    breaths:       Math.round(breaths),
    blinks:        Math.round(blinks),
    meals:         Math.round(meals),
    sleepHours:    Math.round(sleepHours),
    dreamHours:    Math.round(dreamHours),
    kmSun:         Math.round(ageYears * 940e6),
    sunrisesLived: Math.round(ageDays),
    hairGrown_cm:  Math.round(hairGrown_cm),
    wordsSpoken:   Math.round(wordsSpoken),
    coffeeEquiv:   Math.round(coffeeEquiv),
    laughsLived:   Math.round(laughsLived),
    ageDays:       Math.round(ageDays),
  };
}

function renderLifeStats(stats, persona = {}) {
  const { name, genre, passion } = persona;
  const ageY = stats.ageDays / 365.25;
  const items = [
    { e: '❤️', v: fmt(stats.heartbeats),            l: ageY < 1 ? 'petits battements de cœur' : 'battements de cœur' },
    { e: '🌬️', v: fmt(stats.breaths),               l: 'respirations' },
    { e: '👁️', v: fmt(stats.blinks),               l: ageY < 1 ? 'clignements de petites paupières' : 'clignements de paupières' },
    { e: '🍼', v: fmt(stats.meals),                  l: ageY < 1 ? 'tétées et biberons' : ageY < 3 ? 'repas et biberons' : 'repas avalés', e2: ageY >= 3 ? '🍽️' : '🍼' },
    { e: '😴', v: fmt(stats.sleepHours) + ' h',     l: ageY < 1 ? 'de sommeil (les bébés dorment beaucoup !)' : 'de sommeil' },
    { e: '💭', v: fmt(stats.dreamHours) + ' h',     l: ageY < 3 ? 'de rêves (les bébés rêvent énormément !)' : 'de rêves' },
    { e: '☀️', v: fmt(stats.sunrisesLived),         l: 'levers de soleil vécus' },
    { e: '💇', v: fmt(stats.hairGrown_cm) + ' cm',  l: 'de cheveux poussés' },
    { e: '🌍', v: fmt(stats.kmSun) + ' km',         l: 'parcourus autour du Soleil' },
    ...(ageY >= 1 ? [{ e: '💬', v: fmt(stats.wordsSpoken), l: ageY < 3 ? 'premiers mots balbutiés' : 'mots prononcés (estimation)' }] : []),
    ...(stats.coffeeEquiv > 0 ? [{ e: '☕', v: fmt(stats.coffeeEquiv), l: 'cafés bus (depuis l\'adolescence)' }] : []),
    { e: '😂', v: fmt(stats.laughsLived),            l: ageY < 3 ? 'éclats de rire (les bébés rient ~50x/jour !)' : 'éclats de rire vécus' },
  ];
  // Override emoji for meals based on age
  items.forEach(item => { if (item.e2) { item.e = item.e2; delete item.e2; } });

  let passionCard = '';
  if (passion && PASSION_FACTS[passion]) {
    const pf = PASSION_FACTS[passion];
    const fact2HTML = pf.fact2 ? `<div class="ls-label" style="opacity:0.8;font-style:italic;margin-top:6px;">${pf.fact2(stats.ageDays)}</div>` : '';
    passionCard = `
      <div class="lifestats-card passion-card" style="border-color:rgba(99,102,241,0.3);background:linear-gradient(140deg,rgba(99,102,241,0.08),var(--surface2));grid-column:span 2;">
        <div class="ls-emoji">${pf.emoji}</div>
        <div class="ls-value" style="font-size:0.88rem;line-height:1.4;color:var(--text2);">Passionné·e de ${pf.label}</div>
        <div class="ls-label">${pf.fact(stats.sleepHours)}</div>
        ${fact2HTML}
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

  const strengthHTML = lp.strength ? `
    <div class="numerology-insight">
      <div class="numerology-sub-label">✦ Ton atout principal</div>
      <p class="numerology-desc-small">${lp.strength}</p>
    </div>` : '';

  const challengeHTML = lp.challenge ? `
    <div class="numerology-insight">
      <div class="numerology-sub-label">◎ Ton défi de vie</div>
      <p class="numerology-desc-small">${lp.challenge}</p>
    </div>` : '';

  const famousHTML = lp.famous ? `
    <div class="numerology-insight">
      <div class="numerology-sub-label">Personnalités chemin ${lifePathNum}</div>
      <div class="numerology-famous-list">${lp.famous.map(f => `<span class="numerology-famous-name">${f}</span>`).join('')}</div>
    </div>` : '';

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
        ${strengthHTML}
        ${challengeHTML}
        ${famousHTML}
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
    .slice(0, 7);

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

// ── TIMELINE ──────────────────────────────────────────────────────────────────
// Dépend de : MS (data.js), UNIT_LABELS (data.js), fmtDate, fmtCountdown, fmtAgo (app.js)
// Génère une frise chronologique verticale de tous les milestones (passés + futurs)
// triés par date, espacés de manière égale.
//
// @param {Array}  items          — tableau "all" de { m, date, diff, isPast }
// @param {Date}   birth          — date de naissance
// @param {Date}   now            — moment présent
// @param {Array}  futureItemsRef — référence à futureItems[] pour les countdowns
function renderTimeline(items, birth, now, futureItemsRef, maxItems) {
  const MAX_ITEMS = maxItems || 50;

  // S'assurer d'être triés par date croissante
  const sorted = [...items].sort((a, b) => a.date - b.date);

  const hasMore = sorted.length > MAX_ITEMS;
  const shown   = hasMore ? sorted.slice(0, MAX_ITEMS) : sorted;

  // ── Position du marqueur "Tu es ici" ──────────────────────────────────────
  // Index du premier item futur (transition passé → futur)
  let nowInsertIdx = shown.findIndex(x => !x.isPast);
  if (nowInsertIdx === -1) nowInsertIdx = shown.length;

  // ── Map date → index futur (pour retrouver l'id countdown) ───────────────
  const futureIdxMap = new Map();
  (futureItemsRef || []).forEach((fi, i) => {
    futureIdxMap.set(fi.date.getTime(), i);
  });

  // ── Labels d'affichage des unités ─────────────────────────────────────────
  const UNIT_DISPLAY = { s: 'Secondes', m: 'Minutes', h: 'Heures', d: 'Jours', w: 'Semaines' };

  // ── Construire la liste de rows (year markers + now marker + items) ────────
  const yearsSeen = new Set();
  const rows = [];

  shown.forEach((item, idx) => {
    const yr = item.date.getFullYear();

    // Marqueur "Tu es ici" avant le premier futur
    if (idx === nowInsertIdx) {
      rows.push({ type: 'now' });
    }

    // Marqueur d'année si nouvelle année
    if (!yearsSeen.has(yr)) {
      yearsSeen.add(yr);
      rows.push({ type: 'year', year: yr });
    }

    rows.push({ type: 'item', item, idx });
  });

  // Si tout est passé, "now" va en fin
  if (nowInsertIdx === shown.length) {
    rows.push({ type: 'now' });
  }

  // ── Générer le HTML de chaque row ─────────────────────────────────────────
  let itemCounter = 0;
  let rowsHTML = '';

  rows.forEach(row => {
    if (row.type === 'now') {
      rowsHTML += `
        <div class="timeline-item is-now-row" aria-label="Position actuelle">
          <div></div>
          <div class="timeline-dot-wrap">
            <div class="timeline-now-ring"></div>
          </div>
          <div style="padding-left:12px;display:flex;align-items:center;">
            <span class="timeline-now-label">Tu es ici</span>
          </div>
        </div>`;
      return;
    }

    if (row.type === 'year') {
      rowsHTML += `
        <div class="timeline-item tl-year-row tl-visible" aria-hidden="true">
          <div></div>
          <div class="timeline-dot-wrap">
            <div style="width:1px;height:24px;background:var(--border2);margin:auto;"></div>
          </div>
          <div style="padding-left:10px;display:flex;align-items:center;">
            <span class="timeline-year-label">${row.year}</span>
          </div>
        </div>`;
      return;
    }

    // Item normal
    const { item } = row;
    const { m, date, diff, isPast } = item;
    const unitClass = `u-${m.u}`;
    const cardClass = isPast ? 'past' : 'future';

    // Contenu d'état : countdown pour futur, "accompli" pour passé
    let statusHTML;
    if (isPast) {
      statusHTML = `<div class="tl-past-done">Accompli — <span style="font-weight:400;color:var(--muted)">${fmtAgo(diff)}</span></div>`;
    } else {
      const fIdx = futureIdxMap.get(date.getTime());
      const cdId = fIdx !== undefined ? `tl-cd-${fIdx}` : '';
      const hotClass = diff > 0 && diff < 864e5 * 7 ? ' hot' : '';
      statusHTML = `<div class="tl-countdown${hotClass}"${cdId ? ` id="${cdId}"` : ''}>${fmtCountdown(diff)}</div>`;
    }

    // Alternance gauche / droite selon l'index parmi les items (pas les rows)
    const isLeft = (itemCounter % 2 === 0);
    itemCounter++;

    const cardHTML = `
      <div class="timeline-card ${cardClass}">
        <div class="tl-unit-tag ${unitClass}">${UNIT_DISPLAY[m.u]}</div>
        <div class="tl-card-top">
          <span class="tl-emoji" aria-hidden="true">${m.e}</span>
          <div class="tl-card-titles">
            <div class="tl-name">${m.n}</div>
            <div class="tl-tagline">${m.t}</div>
          </div>
        </div>
        <div class="tl-date"><strong>${fmtDate(date)}</strong></div>
        ${statusHTML}
      </div>`;

    rowsHTML += `
      <div class="timeline-item" data-tl-item>
        <div class="timeline-card-left">${isLeft  ? cardHTML : ''}</div>
        <div class="timeline-dot-wrap">
          <div class="timeline-dot ${unitClass}"></div>
        </div>
        <div class="timeline-card-right">${!isLeft ? cardHTML : ''}</div>
      </div>`;
  });

  // ── "Voir plus" si tronqué ─────────────────────────────────────────────────
  // Si tronqué, stocker tous les items dans une variable globale pour l'expansion
  if (hasMore) {
    window._tlAllItems = sorted;
    window._tlBirth    = birth;
    window._tlNow      = now;
    window._tlFuture   = futureItemsRef;
  }

  const voirPlusHTML = hasMore ? `
    <div class="timeline-voir-plus">
      <button class="btn-tl-voir-plus" id="btn-tl-voir-plus" onclick="expandTimeline()">
        + ${sorted.length - MAX_ITEMS} milestones supplémentaires
      </button>
    </div>` : '';

  return `
    <h2 class="section-head">Ma frise chronologique</h2>
    <div class="timeline-wrap">
      <div class="timeline-spine" aria-hidden="true"></div>
      ${rowsHTML}
    </div>
    ${voirPlusHTML}
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
