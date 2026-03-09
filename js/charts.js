// ── CHARTS — Hit du jour de naissance ─────────────────────────────────────────
// Charge les classements musicaux FR/US en lazy, met en cache en mémoire.
// Tous les chemins sont absolus (/data/…) pour fonctionner depuis n'importe
// quelle sous-page du site (/, /boutique, /timeline…).

const CHARTS_CACHE = {};

/**
 * Retourne le #1 musical d'un pays pour une date donnée, ou null si absent.
 * @param {string} dateStr  - format "YYYY-MM-DD"
 * @param {string} country  - 'fr' ou 'us'
 * @returns {Promise<{artist: string, title: string}|null>}
 */
async function getChartHit(dateStr, country = 'fr') {
  const file = `/data/charts-${country}.json`;

  if (!CHARTS_CACHE[country]) {
    try {
      const r = await fetch(file);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      CHARTS_CACHE[country] = await r.json();
    } catch {
      CHARTS_CACHE[country] = {};
    }
  }

  return CHARTS_CACHE[country][dateStr] || null;
}

/**
 * Construit le HTML de la carte pour un pays.
 * @param {string} flag      - emoji drapeau
 * @param {string} label     - nom du pays affiché
 * @param {string} country   - 'fr' | 'us'
 * @param {{artist:string,title:string}|null} hit
 * @returns {string}
 */
function _chartHitCard(flag, label, country, hit) {
  if (!hit) {
    return `
      <div class="chart-hit-card chart-hit-card--empty">
        <div class="chart-hit-flag">${flag}</div>
        <div class="chart-hit-country">${label}</div>
        <p class="chart-hit-unavailable">Données non disponibles pour cette période</p>
      </div>`;
  }

  const query  = encodeURIComponent(`${hit.artist} ${hit.title}`);
  const ytUrl  = `https://www.youtube.com/results?search_query=${query}`;
  // Couleur d'accentuation par pays
  const accent = country === 'fr' ? 'var(--indigo)' : 'var(--rose)';

  return `
    <div class="chart-hit-card" style="--chart-accent:${accent}">
      <div class="chart-hit-flag">${flag}</div>
      <div class="chart-hit-country">${label}</div>
      <div class="chart-hit-artist">${_escHtml(hit.artist)}</div>
      <div class="chart-hit-title">"${_escHtml(hit.title)}"</div>
      <a class="chart-hit-listen"
         href="${ytUrl}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Ecouter ${_escHtml(hit.artist)} - ${_escHtml(hit.title)} sur YouTube">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Ecouter sur YouTube
      </a>
    </div>`;
}

/** Echappe les caractères HTML pour éviter tout XSS avec les données JSON. */
function _escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Charge les deux charts en parallèle, injecte le HTML et affiche la section.
 * Appelée depuis calculate() dans app.js.
 * @param {Date} birth - date de naissance de l'utilisateur
 */
async function loadChartHit(birth) {
  const section  = document.getElementById('chart-hit-section');
  const content  = document.getElementById('chart-hit-content');
  if (!section || !content) return;

  // Format YYYY-MM-DD local (pas UTC) pour coller à la date réelle de naissance
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${birth.getFullYear()}-${pad(birth.getMonth() + 1)}-${pad(birth.getDate())}`;

  // Fetch FR + US en parallèle
  const [hitFr, hitUs] = await Promise.all([
    getChartHit(dateStr, 'fr'),
    getChartHit(dateStr, 'us'),
  ]);

  // Si aucune donnée disponible — masquer la section silencieusement
  if (!hitFr && !hitUs) {
    section.style.display = 'none';
    return;
  }

  content.innerHTML = `
    <div class="chart-hit-grid">
      ${_chartHitCard('🇫🇷', 'Top Singles France', 'fr', hitFr)}
      ${_chartHitCard('🇺🇸', 'Billboard Hot 100', 'us', hitUs)}
    </div>`;

  section.style.display = '';
}
