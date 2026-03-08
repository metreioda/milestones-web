# SEO — MilestoneMe (statsme)

> Derniere mise a jour : 2026-03-08
> Domaine : statsme.org
> Deploiement : GitHub → Cloudflare Pages
> Repo : github.com/metreioda/milestones-web

---

## Etat actuel — Audit initial

### Pages du site
| Page | URL | Indexable | Meta desc | OG tags | Structured data | Canonical |
|------|-----|-----------|-----------|---------|-----------------|-----------|
| App principale | `/index.html` | Partiellement (contenu JS) | Oui | Oui | Oui (WebApp) | Oui |
| Blog index | `/blog/index.html` | Oui | Oui | Oui | Non | Oui |
| Article 1 — Milliardieme seconde | `/blog/milliardieme-seconde.html` | Oui | Oui | Oui | Non | Oui |
| Article 2 — Profil astral | `/blog/profil-astral.html` | Oui | Oui | Oui | Non | Oui |
| Article 3 — 30 milliards km | `/blog/30-milliards-km.html` | Oui | Oui | Oui | Non | Oui |
| Article 4 — 5 calendriers | `/blog/5-calendriers.html` | Oui | Oui | Oui | Non | Oui |

---

## Taches SEO — Priorisees par impact

### P0 — Critique (a faire en premier)

- [x] **Meta description sur index.html** (2026-03-08) — Actuellement absente. Ajouter une description de 150-160 caracteres.
  ```html
  <meta name="description" content="Decouvre tes anniversaires secrets : 10 000 jours, 1 milliard de secondes et des dizaines d'autres milestones de vie. Entre ta date de naissance et celebre chaque instant.">
  ```

- [x] **Balises Open Graph sur toutes les pages** (2026-03-08) — Indispensable pour le partage sur les reseaux sociaux (Facebook, LinkedIn, WhatsApp).
  ```html
  <!-- index.html -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="MilestoneMe — Celebre chaque instant">
  <meta property="og:description" content="Decouvre tes anniversaires secrets : 10 000 jours, 1 milliard de secondes et des dizaines d'autres milestones de vie.">
  <meta property="og:url" content="https://statsme.org/">
  <meta property="og:image" content="https://statsme.org/og-image.png">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="MilestoneMe">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="MilestoneMe — Celebre chaque instant">
  <meta name="twitter:description" content="Decouvre tes anniversaires secrets : 10 000 jours, 1 milliard de secondes...">
  <meta name="twitter:image" content="https://statsme.org/og-image.png">
  ```

- [ ] **Creer une image OG (og-image.png)** — 1200x630px, avec le logo/titre MilestoneMe. Essentielle pour le partage social.

- [x] **Favicon SVG** (2026-03-08) — favicon.svg cree + link tags ajoutes sur toutes les pages — Aucun favicon actuellement. Ajouter :
  ```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  ```

- [x] **robots.txt** (2026-03-08) — Inexistant. Creer a la racine :
  ```
  User-agent: *
  Allow: /
  Sitemap: https://statsme.org/sitemap.xml
  ```

- [x] **sitemap.xml** (2026-03-08) — Inexistant. Creer a la racine :
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://statsme.org/</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>
    <url><loc>https://statsme.org/blog/</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
    <url><loc>https://statsme.org/blog/milliardieme-seconde.html</loc><priority>0.7</priority></url>
    <url><loc>https://statsme.org/blog/profil-astral.html</loc><priority>0.7</priority></url>
    <url><loc>https://statsme.org/blog/30-milliards-km.html</loc><priority>0.7</priority></url>
    <url><loc>https://statsme.org/blog/5-calendriers.html</loc><priority>0.7</priority></url>
  </urlset>
  ```

### P1 — Important

- [x] **Canonical URLs sur chaque page** (2026-03-08) — Evite le contenu duplique.
  ```html
  <link rel="canonical" href="https://statsme.org/">
  ```

- [x] **Structured data JSON-LD — WebApplication** (2026-03-08)
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MilestoneMe",
    "url": "https://statsme.org",
    "description": "Decouvre tes anniversaires secrets et milestones de vie",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "inLanguage": "fr"
  }
  </script>
  ```

- [ ] **Structured data JSON-LD — Article** (chaque article de blog)
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Titre de l'article",
    "description": "Description",
    "author": { "@type": "Organization", "name": "MilestoneMe" },
    "publisher": { "@type": "Organization", "name": "MilestoneMe" },
    "datePublished": "2026-03-08",
    "inLanguage": "fr"
  }
  </script>
  ```

- [ ] **Structured data JSON-LD — BreadcrumbList** (pages blog)
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "MilestoneMe", "item": "https://statsme.org/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://statsme.org/blog/" },
      { "@type": "ListItem", "position": 3, "name": "Titre article" }
    ]
  }
  </script>
  ```

- [ ] **Balise `<main>` semantique** — Envelopper le contenu principal dans `<main>` sur toutes les pages (actuellement absent).

- [ ] **Navigation `<nav>`** — Ajouter un `<nav>` dans le header pour le maillage interne (Accueil, Blog).

- [ ] **Liens internes blog → app** — Chaque article devrait avoir un CTA "Decouvre tes milestones" qui renvoie vers l'app principale.

### P2 — Moyen

- [ ] **Optimiser les titres `<title>` pour le CTR** — Format recommande : `Mot-cle principal — MilestoneMe`
  - index.html : `Tes anniversaires secrets | 10 000 jours, 1 milliard de secondes — MilestoneMe`
  - blog/index.html : `Blog — MilestoneMe | Milestones de vie et curiosites`

- [ ] **Attribut `lang` sur `<html>`** — Deja present (`fr`). OK.

- [ ] **Preload des fonts critiques** — Accelerer le First Contentful Paint :
  ```html
  <link rel="preload" href="https://fonts.gstatic.com/s/spacegrotesk/..." as="font" type="font/woff2" crossorigin>
  ```

- [ ] **Lazy loading** — Ajouter `loading="lazy"` sur les images non-critiques (si images ajoutees au blog).

- [ ] **Page 404 personnalisee** — Creer une page 404.html avec navigation vers l'accueil et le blog.

- [ ] **Fil d'Ariane visible** (breadcrumbs) sur les pages blog — Aide la navigation et le SEO.

- [ ] **Temps de lecture** sur les articles — Signal d'engagement pour Google.

### P3 — Nice to have

- [ ] **Web App Manifest (manifest.json)** — Pour le PWA et le mobile :
  ```json
  {
    "name": "MilestoneMe",
    "short_name": "MilestoneMe",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#6366f1",
    "background_color": "#0a0a0f",
    "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }]
  }
  ```

- [ ] **Hreflang** — Si le site est traduit en anglais un jour :
  ```html
  <link rel="alternate" hreflang="fr" href="https://statsme.org/">
  ```

- [ ] **Schema.org FAQ** — Ajouter des FAQ structurees sur la page principale pour apparaitre en rich snippets.

- [ ] **Google Search Console** — Soumettre le sitemap et verifier l'indexation.

- [ ] **Google Analytics / Plausible** — Tracker le trafic organique.

- [ ] **Vitesse : minifier CSS/JS** — Les fichiers sont petits, mais la minification aide. Peut etre fait manuellement ou via un script shell.

- [ ] **Meta theme-color** — Pour la barre d'adresse mobile :
  ```html
  <meta name="theme-color" content="#6366f1" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  ```

---

## Mots-cles cibles (FR)

### Principaux
- anniversaire secret
- milliard de secondes
- 10000 jours de vie
- milestone de vie
- calculer son age en jours / secondes / heures

### Longue traine
- quand est mon milliardieme seconde
- combien de jours j'ai vecu
- anniversaire 10000 jours
- profil astral date de naissance
- age en secondes calculateur
- date de naissance calendrier chinois / hebreu / republicain

### Blog
- milliardieme seconde anniversaire
- profil astral complet gratuit
- distance parcourue dans l'espace
- calendrier republicain date de naissance

---

## Strategie de contenu (blog)

### Articles existants (4)
1. Pourquoi ton milliardieme seconde est plus important que ton anniversaire
2. Ton profil astral decrypte
3. Tu as parcouru 30 milliards de km
4. Ta date de naissance dans 5 calendriers

### Articles proposes (prochains)
- "Combien de jours as-tu vecu ? Le guide complet des milestones temporels"
- "10 000 jours : l'anniversaire que personne ne celebre (mais qui change tout)"
- "Numerologie : ton chemin de vie explique simplement"
- "Les anniversaires secrets que les astronautes celebrent dans l'espace"
- "Ton age sur Mars, Jupiter et les autres planetes"

---

## Performance SEO (a mesurer)

| Metrique | Cible | Actuel |
|----------|-------|--------|
| Lighthouse Performance | > 90 | A mesurer |
| Lighthouse SEO | > 95 | A mesurer |
| First Contentful Paint | < 1.5s | A mesurer |
| Largest Contentful Paint | < 2.5s | A mesurer |
| Cumulative Layout Shift | < 0.1 | A mesurer |
| Mobile-friendly | Oui | Oui (responsive) |

---

## Infos deploiement

- **Domaine** : statsme.org
- **Hebergement** : Cloudflare Pages (deploy automatique depuis GitHub)
- **Repo GitHub** : metreioda/milestones-web
- **Branche de deploy** : main
- **HTTPS** : Gere automatiquement par Cloudflare (pas besoin de Let's Encrypt)
- **CDN** : Cloudflare (cache global, compression automatique)

> Note : Cloudflare Pages sert les fichiers statiques directement. Pas de serveur, pas de build command necessaire. Le push sur `main` declenche le deploy.

## Checklist deploiement

Avant de mettre en ligne sur statsme.org :
- [ ] Remplacer tous les `[tld]` par le vrai TLD dans ce fichier
- [ ] Generer favicon.svg, favicon-32x32.png, apple-touch-icon.png
- [ ] Generer og-image.png (1200x630)
- [ ] Creer robots.txt
- [ ] Creer sitemap.xml
- [ ] HTTPS actif via Cloudflare (verifier SSL/TLS full)
- [ ] Soumettre sitemap a Google Search Console
- [ ] Verifier l'indexation apres 48h
- [ ] Tester les balises OG avec https://developers.facebook.com/tools/debug/
- [ ] Tester les Twitter Cards avec https://cards-dev.twitter.com/validator

---

## Complete

_(Aucune tache completee pour l'instant)_
