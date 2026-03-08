/* ═══════════════════════════════════════════════════════════════════════════
   MilestoneMe — Service Worker
   Cache-first pour les assets statiques, network-first pour les polices.
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'v3';
const CACHE_NAME    = `milestoneme-${CACHE_VERSION}`;

/* Assets précachés à l'installation — liste exhaustive des fichiers statiques */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/timeline.html',
  '/boutique.html',
  '/css/style.css',
  '/js/app.js',
  '/js/data.js',
  '/js/render.js',
  '/js/calendars.js',
  '/favicon.svg',
  '/manifest.json',
  '/blog/',
  '/blog/index.html',
  '/blog/style.css',
  '/blog/milliardieme-seconde.html',
  '/blog/30-milliards-km.html',
  '/blog/5-calendriers.html',
  '/blog/profil-astral.html',
];

/* ── INSTALL : précacher tous les assets critiques ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // active immédiatement sans attendre les onglets fermés
  );
});

/* ── ACTIVATE : purger les anciens caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('milestoneme-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim()) // prend le contrôle immédiatement
  );
});

/* ── FETCH : stratégie hybride ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET (POST, etc.)
  if (request.method !== 'GET') return;

  // Ignorer les extensions Chrome et autres schémas non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Google Fonts → Network-first avec fallback cache
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(networkFirstWithCache(request, 'milestoneme-fonts'));
    return;
  }

  // Assets du même domaine → Cache-first avec fallback réseau
  if (url.origin === self.location.origin) {
    // Pour les navigations (HTML), on ne redirige jamais vers index.html
    const isNavigation = request.mode === 'navigate';
    event.respondWith(cacheFirst(request, isNavigation));
    return;
  }
});

/* ── STRATÉGIE : Cache-first ────────────────────────────────────────────────
   1. Cherche dans le cache (avec fallback /index.html → /blog/index.html)
   2. Sinon fetch réseau → met en cache → renvoie
   3. Si les deux échouent (hors ligne + pas en cache) :
      - Navigation HTML : laisse le navigateur afficher l'erreur (pas de redirect)
      - Assets (CSS/JS/img) : réponse vide 503
*/
async function cacheFirst(request, isNavigation = false) {
  // Cherche dans le cache — essaie aussi la variante index.html pour les répertoires
  let cached = await caches.match(request);
  if (!cached && isNavigation) {
    // /blog/ → essaie /blog/index.html
    const urlObj = new URL(request.url);
    if (urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
      cached = await caches.match(urlObj.pathname + 'index.html');
    }
  }
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (isNavigation) {
      // Pour les navigations hors ligne, affiche l'index app uniquement pour la racine
      // Pour toute autre page (blog, boutique...), laisse le navigateur gérer l'erreur
      const urlObj = new URL(request.url);
      if (urlObj.pathname === '/' || urlObj.pathname === '/index.html') {
        const fallback = await caches.match('/index.html');
        if (fallback) return fallback;
      }
      return new Response('Hors ligne — cette page n\'est pas disponible sans connexion.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    // Assets (CSS/JS/img) : réponse vide 503
    return new Response('', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

/* ── STRATÉGIE : Network-first ──────────────────────────────────────────────
   1. Tente le réseau → met en cache si ok → renvoie
   2. Si réseau KO → fallback cache
*/
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Polices manquantes non bloquantes — renvoie 204
    return new Response('', { status: 204 });
  }
}
