/* ═══════════════════════════════════════════════════════════════════════════
   MilestoneMe — Service Worker
   Stratégie par type de ressource :
     - HTML (navigations) → Network-first  : toujours du contenu frais
     - JS / CSS           → Stale-while-revalidate : rapide + mise à jour fond
     - Fonts / SVG / JSON → Cache-first    : immuables, changent rarement
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'v9';
const CACHE_STATIC  = `milestoneme-static-${CACHE_VERSION}`;
const CACHE_PAGES   = `milestoneme-pages-${CACHE_VERSION}`;
const CACHE_FONTS   = `milestoneme-fonts-${CACHE_VERSION}`;

/* Assets précachés à l'installation (hors HTML) */
const PRECACHE_ASSETS = [
  '/css/style.css',
  '/js/app.js',
  '/js/data.js',
  '/js/render.js',
  '/js/calendars.js',
  '/favicon.svg',
  '/manifest.json',
];

/* Pages HTML mises en cache pour le mode offline uniquement */
const PRECACHE_PAGES = [
  '/index.html',
  '/timeline/',
  '/boutique/',
  '/blog/index.html',
  '/blog/milliardieme-seconde.html',
  '/blog/30-milliards-km.html',
  '/blog/5-calendriers.html',
  '/blog/profil-astral.html',
];

/* ── INSTALL : précacher assets + pages offline ─────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_STATIC).then(c => c.addAll(PRECACHE_ASSETS)),
      caches.open(CACHE_PAGES).then(c => c.addAll(PRECACHE_PAGES)),
    ]).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE : purger TOUS les anciens caches ───────────────────────────── */
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_STATIC, CACHE_PAGES, CACHE_FONTS];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('milestoneme-') && !currentCaches.includes(k))
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH : routage par type de ressource ──────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  /* Google Fonts → Network-first avec fallback cache */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(networkFirst(request, CACHE_FONTS));
    return;
  }

  /* Même domaine uniquement */
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isNavigation = request.mode === 'navigate';
  const isHTML  = isNavigation || path.endsWith('.html') || path.endsWith('/');
  const isAsset = path.endsWith('.js') || path.endsWith('.css');
  const isStatic = path.endsWith('.svg') || path.endsWith('.json') ||
                   path.endsWith('.png') || path.endsWith('.webp') ||
                   path.endsWith('.ico') || path.endsWith('.txt') ||
                   path.endsWith('.xml');

  if (isHTML) {
    /* HTML → Network-first : les nouvelles features sont toujours visibles */
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  if (isAsset) {
    /* JS/CSS → Stale-while-revalidate : rapide ET toujours à jour */
    event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
    return;
  }

  if (isStatic) {
    /* Fonts locale, SVG, JSON, images → Cache-first */
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  /* Tout le reste → réseau direct */
});

/* ── Network-first (HTML) avec fallback offline ─────────────────────────── */
async function networkFirstWithOfflineFallback(request) {
  const cache = await caches.open(CACHE_PAGES);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()); // mettre à jour le cache offline
    }
    return response;
  } catch {
    /* Hors ligne : sert la version en cache ou une page de fallback */
    const cached = await cache.match(request);
    if (cached) return cached;

    /* Fallback vers index.html pour les navigations sans cache */
    const fallback = await cache.match('/index.html');
    if (fallback) return fallback;

    return new Response(
      '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Hors ligne</title>' +
      '<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;' +
      'height:100vh;margin:0;background:#08080f;color:#fff;text-align:center}' +
      'h1{font-size:2rem}p{color:#aaa}a{color:#818cf8}</style></head>' +
      '<body><div><h1>🌌 Hors ligne</h1>' +
      '<p>Cette page n\'est pas disponible sans connexion.</p>' +
      '<a href="/">Retour à l\'accueil</a></div></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

/* ── Network-first générique ────────────────────────────────────────────── */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('', { status: 204 });
  }
}

/* ── Stale-while-revalidate (JS/CSS) ────────────────────────────────────── */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  /* Lance la mise à jour réseau en arrière-plan */
  const networkFetch = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  /* Sert depuis le cache immédiatement (si dispo), sinon attend le réseau */
  return cached || networkFetch;
}

/* ── Cache-first (assets statiques immuables) ───────────────────────────── */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}
