// ── STATE ─────────────────────────────────────────────────────────────────────
let futureItems = [];
let intervals = [];
let allMilestones = [];       // référence globale pour la timeline
let currentView = 'grid';     // 'grid' | 'timeline'
let _posterData = null;       // données pour generatePoster()

// ── CITIES ────────────────────────────────────────────────────────────────────
function buildCitiesDatalist() {
  const dl = document.getElementById('cities-list');
  if (!dl) return;
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
  const passion = document.getElementById('passion')?.value || '';
  // genre is reserved for future use (m/f/n gender agreement in French)
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
  if (genre === 'f' || genre === 'F') return fem;
  if (genre === 'n' || genre === 'N') return neutre || masc;
  return masc; // default: masculine (also when genre is '' or undefined)
}

// ── HTML ESCAPING (XSS prevention) ───────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const ANIMATION_DELAY_CAP    = 400;   // max stagger delay for card animations (ms)
const ANIMATION_DELAY_STEP   = 40;    // per-card stagger step (ms)
const CONFETTI_COUNT         = 90;    // number of confetti pieces (standard)
const CONFETTI_BURST_COUNT   = 120;   // number of confetti pieces (burst)
const CONFETTI_CLEANUP_MS    = 6000;  // auto-remove confetti after (ms)
const TOAST_DURATION_MS      = 6500;  // milestone toast display time
const TOAST_EXIT_MS          = 420;   // toast exit animation duration
const TOAST_MAX_STACKED      = 3;     // maximum simultaneous toasts
const CELEBRATION_DELAY_MS   = 200;   // delay before confetti burst
const HOT_THRESHOLD_MS       = 864e5 * 7; // 7 days — countdown "hot" threshold
const FUTURE_PREVIEW_COUNT   = 3;     // visible future cards before "show more"
const PAST_PREVIEW_COUNT     = 3;     // visible past cards before "show more"
const SCROLL_REVEAL_DELAY    = 80;    // ms before smooth scroll to results
const FRIEND_WINDOW_CLOSE_MS = 30 * 864e5; // 30 days — friend comparison window
const FRIEND_WINDOW_SYNC_MS  = 7 * 864e5;  // 7 days — "simultaneous" threshold

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
  for (let i = 0; i < CONFETTI_COUNT; i++) {
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
      setTimeout(() => p.remove(), CONFETTI_CLEANUP_MS);
    }, i * 22);
  }
}

// ── MILESTONE CELEBRATION — triggered when a countdown hits zero ───────────────
function confettiBurst() {
  // Denser, gold-biased burst for the milestone moment
  const cols = ['#fbbf24','#f59e0b','#6366f1','#8b5cf6','#ffffff','#34d399','#fbbf24'];
  for (let i = 0; i < CONFETTI_BURST_COUNT; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'c-piece';
      const size = 6 + Math.random() * 10;
      // Bias origin toward the center of the viewport
      const leftPct = 20 + Math.random() * 60;
      p.style.cssText = `
        left:${leftPct}vw;
        width:${size}px; height:${size}px;
        background:${cols[Math.floor(Math.random() * cols.length)]};
        border-radius:${Math.random() > 0.4 ? '50%' : '3px'};
        animation-duration:${1.8 + Math.random() * 2.8}s;
        animation-delay:${Math.random() * 0.6}s;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), CONFETTI_CLEANUP_MS);
    }, i * 14);
  }
}

function showMilestoneFlash() {
  const el = document.getElementById('milestone-flash');
  if (!el) return;
  el.classList.remove('active');
  // Force reflow so the animation restarts cleanly if called multiple times
  void el.offsetWidth;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 2000);
}

function showMilestoneToast(milestone) {
  const container = document.getElementById('milestone-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'milestone-toast';
  toast.setAttribute('role', 'alert');
  toast.style.setProperty('--toast-duration', `${TOAST_DURATION_MS / 1000}s`);

  toast.innerHTML = `
    <div class="toast-icon" aria-hidden="true">${escapeHtml(milestone.e)}</div>
    <div class="toast-body">
      <div class="toast-title">Milestone atteint !</div>
      <div class="toast-name">${escapeHtml(milestone.n)}</div>
      <div class="toast-tagline">${escapeHtml(milestone.t)}</div>
    </div>
    <button class="toast-close" aria-label="Fermer">✕</button>
    <div class="toast-progress" aria-hidden="true"></div>
  `;

  // Use addEventListener instead of inline onclick
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.dispatchEvent(new Event('dismiss'));
  });

  const dismiss = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), TOAST_EXIT_MS);
  };

  toast.addEventListener('dismiss', dismiss);

  // Limit stacked toasts — remove oldest if needed
  while (container.children.length >= TOAST_MAX_STACKED) {
    container.firstElementChild.remove();
  }

  container.appendChild(toast);
  setTimeout(dismiss, TOAST_DURATION_MS);
}

function celebrateMilestone(item, cardEl) {
  // Respect reduced motion — only run confetti/flash if animations are welcome
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Update countdown text
  ['cd', 'cd-top', 'tl-cd'].forEach(prefix => {
    const el = document.getElementById(`${prefix}-${item.idx}`);
    if (el) {
      el.textContent = 'Atteint maintenant !';
      el.classList.remove('hot');
      el.classList.add('achieved');
    }
  });

  // 2. Restyle the milestone card
  if (cardEl) {
    cardEl.classList.add('milestone-achieved');

    // Replace "Prochain !" badge if present
    const nextTag = cardEl.querySelector('.next-tag');
    if (nextTag) nextTag.remove();

    // Inject "Atteint !" badge if not already there
    if (!cardEl.querySelector('.achieved-badge')) {
      const badge = document.createElement('div');
      badge.className = 'achieved-badge';
      badge.textContent = 'Atteint !';
      cardEl.appendChild(badge);
    }
  }

  if (!reducedMotion) {
    // 3. Screen flash
    showMilestoneFlash();

    // 4. Confetti burst (staggered slightly after flash)
    setTimeout(confettiBurst, CELEBRATION_DELAY_MS);
  }

  // 5. Toast notification — always shown, CSS handles reduced-motion appearance
  showMilestoneToast(item.m);
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

  // Paramètres ami (optionnels)
  const fd = document.getElementById('friend-bd');
  const ft = document.getElementById('friend-bt');
  const fn = document.getElementById('friend-name');
  if (fd && fd.value) {
    params.set('friend_d', fd.value);
    if (ft && ft.value) params.set('friend_t', ft.value);
    if (fn && fn.value.trim()) params.set('friend_name', fn.value.trim());
  }

  history.replaceState(null, '', '?' + params.toString());
}

// ── MILESTONE SUGGESTION CHIPS — pre-fill helper ──────────────────────────────
// Called by hero chip buttons. Fills #bd with the given ISO date string,
// briefly animates the form card to draw attention, then focuses the input.
function prefillMilestone(isoDate) {
  const input = document.getElementById('bd');
  if (!input) return;

  input.value = isoDate;

  // Sync segmented inputs if available
  if (window._setSegDate) {
    window._setSegDate(isoDate);
  }

  // Trigger native change event so any listeners pick up the new value
  input.dispatchEvent(new Event('change', { bubbles: true }));

  // Briefly highlight the form card
  const card = input.closest('.form-card');
  if (card) {
    card.classList.add('focus-glow');
    // Scroll the card into view smoothly (mobile)
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Give the scroll time to complete, then focus the input
  setTimeout(() => {
    input.focus();
    input.select && input.select();
  }, 120);

  // Remove the manual focus-glow class after a beat — CSS :has() handles the rest
  setTimeout(() => {
    if (card) card.classList.remove('focus-glow');
  }, 2000);
}

// ── MAIN CALCULATE ────────────────────────────────────────────────────────────
function calculate() {
  try { _calculate(); } catch (err) {
    console.error('[MilestoneMe] Erreur dans calculate():', err);
  }
}

function _calculate() {
  let val = document.getElementById('bd').value;
  // Fallback : reconstruire depuis les segments visibles si #bd est vide
  if (!val) {
    const d = (document.getElementById('seg-day')?.value || '').trim();
    const m = (document.getElementById('seg-month')?.value || '').trim();
    const y = (document.getElementById('seg-year')?.value || '').trim();
    if (d && m && y && y.length === 4) {
      val = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      document.getElementById('bd').value = val;
    }
  }
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
  const ageValEl = document.getElementById('age-val');
  if (ageValEl) ageValEl.textContent = fmtAge(ageMs);
  const ageLbl = document.querySelector('.age-box .lbl');
  if (ageLbl) ageLbl.textContent = name ? `Bonjour ${name} ! Tu as vécu` : 'Tu as vécu'; // textContent is safe

  // ── Geo origin tag in age-box ──
  const ageBox = document.querySelector('.age-box');
  const existingGeoTag = ageBox && ageBox.querySelector('.geo-origin-tag');
  if (existingGeoTag) existingGeoTag.remove();
  if (detectedCity && ageBox) {
    const tag = document.createElement('div');
    tag.className = 'geo-origin-tag';
    tag.textContent = `${detectedCity.flag} ${detectedCity.name}, ${detectedCity.country}`;
    tag.style.cssText = 'font-size:0.82rem;color:var(--muted);margin-top:10px;font-weight:600;letter-spacing:0.02em;';
    ageBox.appendChild(tag);
  }

  // ── Stats ──
  const statsRow = document.getElementById('stats-row');
  if (!statsRow) return;
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
  const icsBtn = document.getElementById('ics-all-btn');
  if (icsBtn) {
    icsBtn.textContent =
      `📅 Ajouter mes ${Math.min(future.length, 10)} prochains milestones au calendrier`;
    icsBtn.onclick = () =>
      downloadICS(future.slice(0,10).map(x => ({ m: x.m, date: x.date })));
  }

  // ── Future cards (collapsed by default) ──
  const FUTURE_PREVIEW = FUTURE_PREVIEW_COUNT;
  const futureTitle = name
    ? `⏳ Les prochains milestones de ${escapeHtml(name)} (${future.length})`
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
  const PAST_PREVIEW = PAST_PREVIEW_COUNT;
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

    // Track whether this milestone has already triggered a celebration
    // to avoid firing multiple times (the interval keeps running briefly)
    let celebrated = false;

    const tick = () => {
      const d = item.date - new Date();

      // ── Milestone reached in real-time ───────────────────────────────────
      if (d <= 0 && !celebrated) {
        celebrated = true;

        // Find the card element for this milestone (grid view)
        // Cards are identified by the countdown element's closest .card ancestor
        const cardEl = el ? el.closest('.card') : null;

        celebrateMilestone(item, cardEl);
        return; // celebration function handles all countdown text updates
      }

      // ── Normal countdown tick ────────────────────────────────────────────
      if (celebrated) return; // don't overwrite "Atteint maintenant !" text

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
      if (el.id === 'timeline-section' || el.id === 'view-toggle-wrap' || el.id === 'friend-compare-section' || el.id === 'chart-hit-section') return;
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

  // ── Données poster ──
  // Stocker les données utiles pour la génération du poster PNG
  _posterData = {
    name,
    birth,
    ageMs,
    zodiacEmoji: zodiac.emoji,
    zodiacName:  zodiac.name,
    nextMilestone: future.length > 0 ? future[0] : null,
  };
  // Afficher le bouton poster
  const posterWrap = document.getElementById('poster-wrap');
  if (posterWrap) posterWrap.style.display = 'flex';

  updateURL();

  // Update "Ma Timeline" link with current URL params
  const tlLink = document.getElementById('btn-timeline-page');
  if (tlLink) {
    const currentParams = new URLSearchParams(location.search);
    tlLink.href = 'timeline.html?' + currentParams.toString();
    tlLink.style.display = 'inline-flex';
  }

  confetti();

  // ── Brevo modal — alerte milestone (8s après résultats) ──
  if (typeof window.triggerBrevoModal === 'function') window.triggerBrevoModal();

  // ── Section "Hit du jour de ta naissance" ──
  if (typeof loadChartHit === 'function') {
    loadChartHit(birth);
  }

  // ── Section "Ils sont nés comme toi" ──
  const blySection = document.getElementById('born-like-you-section');
  if (blySection && typeof renderBornLikeYou === 'function') {
    blySection.innerHTML = renderBornLikeYou(birth);
  }

  // ── Section "Comparer avec un ami" ──
  // On ne réinitialise le formulaire que s'il n'a jamais été injecté
  // pour ne pas effacer une comparaison déjà en cours.
  const fcs = document.getElementById('friend-compare-section');
  if (fcs && !document.getElementById('friend-bd')) {
    fcs.innerHTML = `
      <h2 class="section-head">Comparer avec un ami</h2>
      <p style="font-size:0.88rem;color:var(--muted);margin-bottom:18px;line-height:1.6;">
        Entre la date de naissance d'un ami pour voir vos milestones communs.
        Les milestones distants de moins de 30 jours sont mis en valeur.
      </p>
      <div class="friend-form-card">
        <div class="friend-form-field">
          <label for="friend-bd">Date de naissance de ton ami</label>
          <input type="date" id="friend-bd" max="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="friend-form-field friend-form-field--time">
          <label for="friend-bt">Heure <span class="field-optional">(optionnel)</span></label>
          <input type="time" id="friend-bt">
        </div>
        <div class="friend-form-field friend-form-field--name">
          <label for="friend-name">Prénom <span class="field-optional">(optionnel)</span></label>
          <input type="text" id="friend-name" placeholder="Alex, Sarah…" maxlength="30" autocomplete="off" spellcheck="false">
        </div>
        <button class="btn-compare" onclick="compareFriend(false)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/>
            <circle cx="17" cy="11" r="3"/><path d="M21 21v-1.5a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3V21"/>
          </svg>
          Comparer
        </button>
      </div>
      <div id="friend-compare-result" class="friend-compare-result"></div>
    `;
  }
}

// ── COMPARAISON AMI ───────────────────────────────────────────────────────────

// Calcule les milestones futurs pour une date de naissance donnée
// (même logique que calculate(), mais sans rendu — renvoie un tableau)
function _computeFutureMilestones(birth) {
  const now = new Date();
  return MILESTONES.map(m => {
    const date = new Date(birth.getTime() + m.v * MS[m.u]);
    const diff  = date - now;
    return { m, date, diff };
  }).filter(x => x.diff > 0).sort((a, b) => a.date - b.date);
}

// Formate une date en forme courte pour les cards de comparaison
function _fmtShortDate(dt) {
  return dt.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
}

// Rendu d'une card de comparaison
function _renderFriendCard(pair, userName, friendName, cardIdx) {
  const { userItem, friendItem, deltaDays, isSimultaneous } = pair;
  const cardClass = isSimultaneous ? 'friend-compare-card is-simultaneous' : 'friend-compare-card';
  const badgeClass = isSimultaneous ? 'fcard-badge fcard-badge--simultaneous' : 'fcard-badge fcard-badge--close';
  const badgeLabel = isSimultaneous ? 'Simultané !' : 'Proches';
  const deltaText  = deltaDays === 0
    ? 'Le même jour !'
    : `${deltaDays} jour${deltaDays > 1 ? 's' : ''} d\'écart`;

  const uName = userName  || 'Toi';
  const fName = friendName || 'Ton ami·e';

  return `
    <div class="${cardClass}" style="animation-delay:${Math.min(cardIdx * 60, 360)}ms">
      <div class="${badgeClass}">${badgeLabel}</div>
      <div class="fcard-emoji">${userItem.m.e}</div>
      <div class="fcard-label">${userItem.m.n}</div>
      <div class="fcard-tagline">${userItem.m.t}</div>
      <div class="fcard-rows">
        <div class="fcard-row is-user">
          <span class="fcard-row-who">${uName}</span>
          <span class="fcard-row-date">${_fmtShortDate(userItem.date)}</span>
        </div>
        <div class="fcard-row is-friend">
          <span class="fcard-row-who">${fName}</span>
          <span class="fcard-row-date">${_fmtShortDate(friendItem.date)}</span>
        </div>
      </div>
      <div class="fcard-delta">
        <span>Ecart :</span>
        <span class="fcard-delta-val">${deltaText}</span>
      </div>
    </div>`;
}

// Limite d'affichage avant "voir plus"
const FRIEND_PREVIEW_MAX = 6;

// Rendu de la section complète avec toutes les pairs (appelé par compareFriend et "voir plus")
function _renderFriendResults(pairs, userName, friendName, showAll) {
  if (pairs.length === 0) {
    return `
      <div class="friend-compare-empty">
        <div class="empty-icon">🔭</div>
        Aucun milestone commun dans les 30 prochains jours entre les deux dates.<br>
        Vos milestones ne se croisent pas dans cette fenêtre de temps.
      </div>`;
  }

  const simultaneous = pairs.filter(p => p.isSimultaneous);
  const close        = pairs.filter(p => !p.isSimultaneous);
  const total        = pairs.length;

  const fName = friendName || 'ton ami·e';
  const uName = userName  || 'toi';

  // Libellé du résumé
  const summaryParts = [];
  if (simultaneous.length > 0)
    summaryParts.push(`<strong>${simultaneous.length} simultané${simultaneous.length > 1 ? 's' : ''}</strong>`);
  if (close.length > 0)
    summaryParts.push(`<strong>${close.length} proche${close.length > 1 ? 's' : ''}</strong>`);
  const summaryStr = summaryParts.join(' et ') + ` milestone${total > 1 ? 's' : ''} partagé${total > 1 ? 's' : ''}`;

  // Trier : simultanés en premier, puis proches par delta croissant
  const sorted = [
    ...simultaneous.sort((a, b) => a.deltaDays - b.deltaDays),
    ...close.sort((a, b) => a.deltaDays - b.deltaDays),
  ];

  const visible = showAll ? sorted : sorted.slice(0, FRIEND_PREVIEW_MAX);
  const hasMore = !showAll && sorted.length > FRIEND_PREVIEW_MAX;

  const cardsHTML = visible.map((p, i) => _renderFriendCard(p, uName, fName, i)).join('');
  const moreBtn   = hasMore
    ? `<button class="btn-show-all-pairs" onclick="compareFriend(true)">Voir les ${sorted.length - FRIEND_PREVIEW_MAX} autres milestones partagés</button>`
    : '';

  return `
    <div class="friend-compare-summary">
      <span class="friend-summary-icon">✨</span>
      <span>${uName} et ${fName} partagent ${summaryStr} dans les 30 prochains jours.</span>
    </div>
    <div class="friend-compare-grid">${cardsHTML}</div>
    ${moreBtn}`;
}

// Fonction principale — appelée par le bouton "Comparer"
// showAll : true si l'utilisateur a cliqué sur "voir plus"
function compareFriend(showAll) {
  const fdVal  = document.getElementById('friend-bd').value;
  const ftVal  = document.getElementById('friend-bt').value || '12:00';
  const fnVal  = (document.getElementById('friend-name').value || '').trim();
  const resultEl = document.getElementById('friend-compare-result');

  if (!fdVal) {
    document.getElementById('friend-bd').focus();
    return;
  }

  const friendBirth = new Date(fdVal + 'T' + ftVal + ':00');
  if (isNaN(friendBirth)) return;

  const now = new Date();
  if (friendBirth > now) {
    alert('La date de l\'ami doit être dans le passé !');
    return;
  }

  // Récupérer la date utilisateur depuis les futureItems déjà calculés
  if (!futureItems || futureItems.length === 0) {
    alert('Entre d\'abord ta propre date de naissance et calcule tes milestones.');
    return;
  }

  const friendFuture = _computeFutureMilestones(friendBirth);

  // Fenêtres de comparaison (en ms) — defined as top-level constants
  const WINDOW_CLOSE = FRIEND_WINDOW_CLOSE_MS;
  const WINDOW_SYNC  = FRIEND_WINDOW_SYNC_MS;

  // Construire les paires de milestones proches
  // On parcourt les futures de l'utilisateur et on cherche des correspondances
  // sur le MÊME milestone (même m.v + m.u) chez l'ami.
  const pairs = [];
  const seen  = new Set(); // éviter les doublons (même clé milestone)

  for (const userItem of futureItems) {
    const key = `${userItem.m.u}-${userItem.m.v}`;
    if (seen.has(key)) continue;

    const friendMatch = friendFuture.find(fi => fi.m.u === userItem.m.u && fi.m.v === userItem.m.v);
    if (!friendMatch) continue;

    const delta = Math.abs(userItem.date - friendMatch.date);
    if (delta > WINDOW_CLOSE) continue;

    const deltaDays     = Math.round(delta / 864e5);
    const isSimultaneous = delta <= WINDOW_SYNC;

    seen.add(key);
    pairs.push({ userItem, friendItem: friendMatch, deltaDays, isSimultaneous });
  }

  // Stocker pour le partage URL
  const uName = (getPersonalization && getPersonalization().name) || '';
  const fName = fnVal;

  if (resultEl) {
    resultEl.innerHTML = _renderFriendResults(pairs, uName, fName, !!showAll);
  }

  // Mettre à jour l'URL avec les paramètres ami
  updateURL();
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

// ── POSTER GENERATION ─────────────────────────────────────────────────────────
function generatePoster() {
  if (!_posterData) return;

  const { name, birth, ageMs, zodiacEmoji, zodiacName, nextMilestone } = _posterData;

  const W = 1024, H = 1536;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Helpers Canvas ─────────────────────────────────────────────────────────

  // Dessine du texte centré avec retour à la ligne automatique si trop long
  function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = word;
        curY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, curY);
    return curY; // retourne la dernière Y utilisée
  }

  // Tracé d'une ligne décorative dorée
  function drawGoldLine(y, width) {
    const grad = ctx.createLinearGradient(W / 2 - width / 2, y, W / 2 + width / 2, y);
    grad.addColorStop(0,   'rgba(212,175,55,0)');
    grad.addColorStop(0.3, 'rgba(212,175,55,0.85)');
    grad.addColorStop(0.7, 'rgba(212,175,55,0.85)');
    grad.addColorStop(1,   'rgba(212,175,55,0)');
    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - width / 2, y);
    ctx.lineTo(W / 2 + width / 2, y);
    ctx.stroke();
    ctx.restore();
  }

  // ── Données à afficher ─────────────────────────────────────────────────────

  const displayName = name || 'Toi';

  // Milestone le plus proche
  let milestoneLabel = '';
  let milestoneValue = '';
  let milestoneDate  = '';
  if (nextMilestone) {
    const m = nextMilestone.m;
    milestoneLabel = m.n;     // ex : "1 000 000 000 secondes"
    milestoneValue = m.e;     // emoji
    // Date courte lisible
    milestoneDate = nextMilestone.date.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    // Heure
    const hh  = String(nextMilestone.date.getHours()).padStart(2, '0');
    const min = String(nextMilestone.date.getMinutes()).padStart(2, '0');
    milestoneDate += ` à ${hh}h${min}`;
  }

  // Age
  const totalYears = Math.floor(ageMs / (365.25 * 864e5));
  const ageLabel   = `${totalYears} an${totalYears > 1 ? 's' : ''}`;

  // ── Rendu texte (appelé après que le fond a été placé) ────────────────────
  const renderText = () => {
    // ── Contenu textuel ────────────────────────────────────────────────────
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';

    // — Étiquette haute — "MES MILESTONES"
    ctx.fillStyle = 'rgba(212,175,55,0.7)';
    ctx.font      = '500 22px "Space Grotesk", Georgia, serif';
    ctx.letterSpacing = '0.22em';
    ctx.fillText('MES MILESTONES', W / 2, 310);
    ctx.letterSpacing = '0';

    // — Prénom —
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 96px Georgia, serif';
    // Réduire si trop long
    let nameSize = 96;
    while (ctx.measureText(displayName).width > W - 120 && nameSize > 48) {
      nameSize -= 4;
      ctx.font = `bold ${nameSize}px Georgia, serif`;
    }
    ctx.fillText(displayName, W / 2, 410);

    // — Séparateur doré —
    drawGoldLine(450, 420);

    // — Ornement étoile —
    ctx.fillStyle = '#d4af37';
    ctx.font      = '28px serif';
    ctx.fillText('✦', W / 2, 500);

    // — Milestone : valeur et libellé —
    if (nextMilestone) {
      // Nombre (ex: "1 000 000 000")
      const numberPart = nextMilestone.m.n.replace(/[^\d\s]/g, '').trim();
      const unitPart   = nextMilestone.m.n.replace(/[\d\s]/g, '').trim();

      ctx.fillStyle = '#d4af37';
      ctx.font      = 'bold 72px Georgia, serif';
      // Si le nombre est très long, on réduit
      let numSize = 72;
      while (ctx.measureText(numberPart).width > W - 80 && numSize > 36) {
        numSize -= 4;
        ctx.font = `bold ${numSize}px Georgia, serif`;
      }
      ctx.fillText(numberPart, W / 2, 600);

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font      = '40px Georgia, serif';
      ctx.fillText(unitPart || 'de vie', W / 2, 658);

      // — Tagline —
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font      = 'italic 26px Georgia, serif';
      wrapText(nextMilestone.m.t, W / 2, 718, W - 160, 36);
    }

    // — Séparateur —
    drawGoldLine(780, 340);

    // — Date du milestone —
    if (milestoneDate) {
      ctx.fillStyle = 'rgba(255,255,255,0.80)';
      ctx.font      = '32px Georgia, serif';
      const firstCapDate = milestoneDate.charAt(0).toUpperCase() + milestoneDate.slice(1);
      wrapText(firstCapDate, W / 2, 840, W - 120, 44);
    }

    // — Signe astrologique & âge —
    ctx.fillStyle = '#d4af37';
    ctx.font      = '500 30px "Space Grotesk", Georgia, serif';
    ctx.fillText(`${zodiacEmoji} ${zodiacName}  ·  ${ageLabel}`, W / 2, 970);

    // — Second séparateur —
    drawGoldLine(1010, 280);

    // — Branding statsme.org —
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font      = '500 24px "Space Grotesk", Georgia, serif';
    ctx.letterSpacing = '0.06em';
    ctx.fillText('statsme.org', W / 2, 1460);
    ctx.letterSpacing = '0';

    // ── 4. Téléchargement ──────────────────────────────────────────────────
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `milestone-${(name || 'statsme').toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      // Retour visuel sur le bouton
      const btn = document.getElementById('btn-poster');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>Téléchargement en cours…</span>';
        btn.disabled = true;
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2200);
      }
    }, 'image/png');
  };

  // Chargement de l'image de fond
  const bg = new Image();
  bg.crossOrigin = 'anonymous';
  bg.onload = () => {
    // ── 1. Fond image ───────────────────────────────────────────────────
    ctx.drawImage(bg, 0, 0, W, H);
    // ── 2. Overlay sombre centré pour lisibilité ─────────────────────────
    const overlay = ctx.createLinearGradient(0, 0, 0, H);
    overlay.addColorStop(0,    'rgba(3,7,18,0.20)');
    overlay.addColorStop(0.18, 'rgba(3,7,18,0.60)');
    overlay.addColorStop(0.82, 'rgba(3,7,18,0.60)');
    overlay.addColorStop(1,    'rgba(3,7,18,0.20)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, W, H);
    renderText();
  };
  bg.onerror = () => {
    // Fallback : fond dégradé si l'image ne charge pas (mode file://)
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   '#030711');
    grad.addColorStop(0.5, '#0f0a2a');
    grad.addColorStop(1,   '#030711');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // Petites étoiles décoratives
    ctx.fillStyle = 'rgba(212,175,55,0.25)';
    for (let i = 0; i < 120; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H;
      const sr = 0.4 + Math.random() * 1.8;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    renderText();
  };
  // En local file:// le chemin relatif suffit ; en prod HTTPS la même origin évite les CORS
  bg.src = 'img/poster-bg.webp';
}

// ── SEGMENTED DATE/TIME INPUT ─────────────────────────────────────────────────
// Remplace le wheel picker — chaque segment est un <input text> inline.
// Les inputs cachés #bd et #bt restent la source de vérité pour calculate().
//
// Algorithme inspiré de timescape : chaque segment accumule les chiffres dans
// un buffer local. Quand le buffer est plein, ou que le prochain chiffre ne
// pourrait plus former un nombre valide (ex. "2" en mois → 2*10=20 > 12),
// on commite et on avance au segment suivant.
// opts est un objet muable passé par référence : nextSeg / prevSeg peuvent
// être assignés après la création du segment (chaînage tardif).

function createSegment(inputEl, opts) {
  // opts : { min, max, digits, onCommit, nextSeg?, prevSeg? }
  let buffer = '';

  function display(val) {
    if (val === null || val === undefined || val === '') {
      inputEl.value = '';
      return;
    }
    inputEl.value = String(val).padStart(opts.digits, '0');
  }

  function commit(numStr) {
    const num = Math.max(opts.min, Math.min(opts.max, parseInt(numStr, 10)));
    buffer = '';
    display(num);
    opts.onCommit(num);
    if (opts.nextSeg) {
      opts.nextSeg.el.focus();
      opts.nextSeg.el.select();
    }
  }

  function handleKey(e) {
    // ── Chiffres ────────────────────────────────────────────────────────────
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const newBuffer = buffer + e.key;
      const num = parseInt(newBuffer, 10);

      // Buffer plein → commit immédiat
      if (newBuffer.length === opts.digits) {
        commit(newBuffer);
        return;
      }

      // Si multiplier par 10 dépasse le max, aucun chiffre suivant ne sera
      // valide → on commite tout de suite (ex. mois "2" : 2×10=20 > 12)
      if (num * 10 > opts.max) {
        commit(newBuffer);
        return;
      }

      // Accumulation normale
      buffer = newBuffer;
      inputEl.value = buffer;
      opts.onCommit(num); // sync partiel (pas bloquant)
      return;
    }

    // ── Backspace ────────────────────────────────────────────────────────────
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (buffer.length > 0) {
        buffer = buffer.slice(0, -1);
        inputEl.value = buffer;
        if (buffer === '') opts.onCommit(null);
      } else if (opts.prevSeg) {
        opts.prevSeg.el.focus();
        opts.prevSeg.el.select();
      }
      return;
    }

    // ── ArrowUp : incrémenter ────────────────────────────────────────────────
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cur = parseInt(inputEl.value, 10);
      const next = isNaN(cur) ? opts.min : (cur >= opts.max ? opts.min : cur + 1);
      buffer = '';
      display(next);
      opts.onCommit(next);
      return;
    }

    // ── ArrowDown : décrémenter ──────────────────────────────────────────────
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cur = parseInt(inputEl.value, 10);
      const prev = isNaN(cur) ? opts.max : (cur <= opts.min ? opts.max : cur - 1);
      buffer = '';
      display(prev);
      opts.onCommit(prev);
      return;
    }

    // ── Navigation horizontale ───────────────────────────────────────────────
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (opts.prevSeg) { opts.prevSeg.el.focus(); opts.prevSeg.el.select(); }
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (opts.nextSeg) { opts.nextSeg.el.focus(); opts.nextSeg.el.select(); }
      return;
    }

    // ── Enter : déclencher le calcul ─────────────────────────────────────────
    if (e.key === 'Enter') { calculate(); return; }

    // ── Tab : navigation native ───────────────────────────────────────────────
    if (e.key === 'Tab') return;

    // ── Bloquer tout le reste (lettres, symboles…) ───────────────────────────
    if (!e.metaKey && !e.ctrlKey) e.preventDefault();
  }

  inputEl.addEventListener('keydown', handleKey);
  // Focus/clic → sélectionner tout le contenu
  inputEl.addEventListener('focus', () => inputEl.select());
  inputEl.addEventListener('click', () => inputEl.select());
  // Fallback mobile : certains claviers virtuels passent par `input` pas `keydown`
  inputEl.addEventListener('input', () => {
    const digits = inputEl.value.replace(/\D/g, '');
    if (!digits) { inputEl.value = ''; return; }
    // Rejouer chaque chiffre via la même logique que keydown
    inputEl.value = '';
    buffer = '';
    for (const ch of digits) {
      const fakeKey = { key: ch, preventDefault: () => {}, metaKey: false, ctrlKey: false };
      handleKey(fakeKey);
    }
  });

  return { el: inputEl, display, opts, reset: () => { buffer = ''; inputEl.value = ''; } };
}

function initSegmentedDate() {
  const dayEl   = document.getElementById('seg-day');
  const monthEl = document.getElementById('seg-month');
  const yearEl  = document.getElementById('seg-year');
  const hourEl  = document.getElementById('seg-hour');
  // Support des deux nommages possibles du champ minute
  const minEl   = document.getElementById('seg-minute') || document.getElementById('seg-min');
  const bdEl    = document.getElementById('bd');
  const btEl    = document.getElementById('bt');

  if (!dayEl || !monthEl || !yearEl) return;

  // État partagé — source de vérité côté JS
  const state = { day: null, month: null, year: null, hour: null, min: null };

  function syncDate() {
    if (state.day && state.month && state.year && String(state.year).length === 4) {
      const iso = `${state.year}-${String(state.month).padStart(2,'0')}-${String(state.day).padStart(2,'0')}`;
      const date = new Date(iso + 'T12:00:00');
      if (!isNaN(date.getTime())) bdEl.value = iso;
    }
  }

  function syncTime() {
    if (state.hour !== null && state.min !== null) {
      btEl.value = `${String(state.hour).padStart(2,'0')}:${String(state.min).padStart(2,'0')}`;
    }
  }

  // Création des segments — opts muables pour le chaînage tardif
  const day = createSegment(dayEl, {
    min: 1, max: 31, digits: 2,
    onCommit: v => { state.day = v; syncDate(); }
  });
  const month = createSegment(monthEl, {
    min: 1, max: 12, digits: 2,
    onCommit: v => { state.month = v; syncDate(); }
  });
  const year = createSegment(yearEl, {
    min: 1900, max: new Date().getFullYear(), digits: 4,
    onCommit: v => { state.year = v; syncDate(); }
  });

  // Chaînage date : JJ → MM → AAAA
  day.opts.nextSeg   = month;
  month.opts.prevSeg = day;
  month.opts.nextSeg = year;
  year.opts.prevSeg  = month;

  // Segments heure (optionnels) — déclarés en dehors du if pour rester
  // accessibles dans l'API publique _setSegTime ci-dessous.
  let hourSeg = null;
  let minSeg  = null;

  if (hourEl && minEl) {
    hourSeg = createSegment(hourEl, {
      min: 0, max: 23, digits: 2,
      onCommit: v => { state.hour = v; syncTime(); }
    });
    minSeg = createSegment(minEl, {
      min: 0, max: 59, digits: 2,
      onCommit: v => { state.min = v; syncTime(); }
    });

    // Chaînage heure : AAAA → HH → mm
    year.opts.nextSeg      = hourSeg;
    hourSeg.opts.prevSeg   = year;
    hourSeg.opts.nextSeg   = minSeg;
    minSeg.opts.prevSeg    = hourSeg;
  }

  // Clic sur le conteneur → focus premier segment
  document.getElementById('seg-date')?.addEventListener('click', e => {
    if (!e.target.classList.contains('seg-input__field')) dayEl.focus();
  });
  document.getElementById('seg-time')?.addEventListener('click', e => {
    if (!e.target.classList.contains('seg-input__field')) hourEl?.focus();
  });

  // ── API publique ─────────────────────────────────────────────────────────────
  // Utilisée par prefillMilestone() et la restauration des paramètres URL
  window._setSegDate = function(isoDate) {
    if (!isoDate) return;
    const [y, m, d] = isoDate.split('-');
    state.year  = parseInt(y, 10);
    state.month = parseInt(m, 10);
    state.day   = parseInt(d, 10);
    day.display(state.day);
    month.display(state.month);
    year.display(state.year);
    syncDate();
  };

  window._setSegTime = function(hhmm) {
    if (!hhmm || !hourSeg || !minSeg) return;
    const [h, mn] = hhmm.split(':');
    state.hour = parseInt(h, 10);
    state.min  = parseInt(mn, 10);
    hourSeg.display(state.hour);
    minSeg.display(state.min);
    syncTime();
  };
}

// ── EVENT DELEGATION — replaces inline onclick handlers ──────────────────────
// Handles data-action="share", data-action="download-ics", data-action="share-past"
document.addEventListener('click', function(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;

  if (action === 'share') {
    const idx = parseInt(btn.dataset.idx, 10);
    if (!isNaN(idx)) shareIdx(idx);
  }

  else if (action === 'download-ics') {
    const idx = parseInt(btn.dataset.idx, 10);
    if (!isNaN(idx) && futureItems[idx]) {
      downloadICS([{ m: futureItems[idx].m, date: futureItems[idx].date }]);
    }
  }

  else if (action === 'share-past') {
    try {
      const milestoneJson = decodeURIComponent(escape(atob(btn.dataset.milestone)));
      const dateStr = btn.dataset.date;
      sharePast(milestoneJson, dateStr);
    } catch (err) {
      console.warn('Failed to parse past milestone data:', err);
    }
  }

  else if (action === 'expand-timeline') {
    if (typeof expandTimeline === 'function') expandTimeline();
  }
});

// ── INIT ──────────────────────────────────────────────────────────────────────
// Set max date to today
const bdEl = document.getElementById('bd');
if (bdEl) bdEl.max = new Date().toISOString().split('T')[0];

// Allow Enter key on friend date field (event delegation — l'input est injecté dynamiquement par calculate())
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target && e.target.id === 'friend-bd') compareFriend(false);
});

// ── URL DÉCODAGE AU CHARGEMENT ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Initialiser le segmented date/time input
  initSegmentedDate();

  const p = new URLSearchParams(location.search);
  if (p.get('l'))       document.getElementById('bplace').value  = p.get('l');
  if (p.get('name'))    document.getElementById('pname').value   = p.get('name');
  if (p.get('passion')) document.getElementById('passion').value = p.get('passion');
  buildCitiesDatalist(); // populate datalist on every load
  if (p.get('d')) {
    document.getElementById('bd').value = p.get('d');
    if (p.get('t')) document.getElementById('bt').value = p.get('t');
    // Sync segmented inputs to URL-restored values
    if (window._setSegDate) {
      window._setSegDate(p.get('d'));
      if (p.get('t')) window._setSegTime(p.get('t'));
    }
    calculate();

    // Restaurer les paramètres ami et relancer la comparaison si présents
    const fd = p.get('friend_d');
    if (fd) {
      const elFd = document.getElementById('friend-bd');
      const elFt = document.getElementById('friend-bt');
      const elFn = document.getElementById('friend-name');
      if (elFd) elFd.value = fd;
      if (elFt && p.get('friend_t')) elFt.value = p.get('friend_t');
      if (elFn && p.get('friend_name')) elFn.value = p.get('friend_name');
      // Lancer la comparaison après un court délai (calculate() est synchrone mais le scroll reveal peut interférer)
      setTimeout(() => compareFriend(false), 120);
    }
  }
});
