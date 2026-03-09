# Roadmap -- MilestoneMe (milestones-web)

> Derniere mise a jour : 2026-03-10 (Hero section + Segmented date/time + Boutique mockup complétés)

## Complete

- [2026-03] **Milestones temporels** -- Calcul et affichage des milestones en secondes, minutes, heures, jours, semaines avec compteurs live
- [2026-03] **Profil astral** -- Zodiaque occidental, signe lunaire, zodiaque chinois avec descriptions humoristiques detaillees
- [2026-03] **Calendriers alternatifs** -- Naissance affichee en calendrier Hijri, Republicain, Ethiopien, Persan, Julien
- [2026-03] **Export calendrier ICS** -- Telechargement .ics pour les prochains milestones avec rappel J-1
- [2026-03] **Partage social** -- Boutons partager (Web Share API / copie presse-papier) pour chaque milestone
- [2026-03] **Animation confettis** -- Confettis CSS/JS au lancement du calcul
- [2026-03] **Compteur live de secondes** -- Mise a jour en temps reel du compteur de secondes vecues
- [2026-03] **Design dark mode** -- Interface sombre avec gradients, animations et design soigne
- [2026-03-07] **Champ heure de naissance** -- Input time optionnel avec fallback 12:00, fmtDate etendu avec showTime. Ameliore la precision de tous les milestones.
- [2026-03-07] **Fun facts biometriques ("Le savais-tu ?")** -- Battements de coeur, respirations, clignements, repas, sommeil, reves, levers de soleil, cheveux pousses, km autour du Soleil
- [2026-03-07] **URL partageable** -- Query params ?d=&t= avec auto-calculate au chargement. Permet de partager sa page complete de resultats.
- [2026-03-07] **Age sur d'autres planetes** -- Age en annees de Mercure, Venus, Mars, Jupiter, Saturne, Uranus, Neptune
- [2026-03-07] **Champ lieu de naissance** -- Input texte avec datalist autocomplete (97 villes mondiales), lookup table CITIES (lat/lon/flag/pays), fun facts geo (km autour de l'axe terrestre, vitesse de rotation, km autour du Soleil contextualise), note hemisphere Sud, drapeau+ville dans l'age-box, URL partageable avec ?l=
- [2026-03-07] **Questions personnelles enrichies** -- Accordeon "Personnalise ton experience" (ferme par defaut) avec prenom (message d'accueil et titre personnalises), boutons genre (Elle/Il/Iel/Passer) avec accords grammaticaux, select passion (10 options) avec fun fact dedie, persistance URL (?name=&passion=)
- [2026-03-07] **Refactoring multi-fichiers** -- Split de index.html en css/style.css + js/data.js + js/calendars.js + js/render.js + js/app.js. Structure modulaire plus maintenable.
- [2026-03-07] **Numerologie** -- Chemin de vie (somme des chiffres, maitres 11/22/33 preserves), nombre d'expression depuis le prenom (table de Pythagore), 13 archetypes avec descriptions et traits, 4eme carte dans le profil astral, bloc detaille dans "En savoir plus".
- [2026-03-08] **Saisons et événements** -- Saison de naissance (hémisphère Nord), jour de la semaine de naissance, 118 événements historiques hardcodés du même jour/mois
- [2026-03-08] **Mode clair / toggle theme** -- Switch light/dark mode avec toggle visuel. Améliore l'accessibilité et l'expérience utilisateur.
- [2026-03-08] **Blog (4 articles + listing + showcase)** -- Section blog intégrée avec 4 articles détaillés, page listing, et showcase sur page principale. Enrichit le contenu éditorial.
- [2026-03-08] **SEO complet** -- Meta tags, OpenGraph, Twitter Cards, canonical, favicon, robots.txt, sitemap.xml, JSON-LD, agent SEO. App indexable et optimisée pour partage social.
- [2026-03-08] **Collapsible milestones** -- Bouton "découvrir plus" pour révéler les détails de chaque milestone. Améliore l'UX sans surcharger l'interface.
- [2026-03-08] **Cosmic background** -- Animation background avec étoiles, planètes, étoiles filantes, et nébuleuses. Design immersif et thématique.
- [2026-03-08] **Timeline view (toggle grille/frise)** -- Visualisation chronologique avec bouton toggle entre vue grille et frise temporelle. Navigation des milestones plus fluide.
- [2026-03-08] **Sous-page "Ma Timeline"** -- Page dédiée timeline.html avec frise chronologique verticale, cards alternées gauche/droite, marqueur "Vous êtes ici", compteurs live, navigation flottante, fond cosmique. Accessible via CTA depuis la page principale.
- [2026-03-08] **PWA / mode hors-ligne** -- manifest.json + service-worker.js (cache-first static, network-first fonts), bannière "Installer l'app" dismissible, registration dans index.html et timeline.html. Dégradation gracieuse sur file://.
- [2026-03-09] **Animations milestone atteint** -- Célébration en temps réel quand un compteur atteint zéro : flash écran or/indigo, confetti burst doré (120 pièces, palette or+indigo), toast glassmorphism avec barre de progression auto-dismiss 6.5s, transformation visuelle de la card (glow pulsé or/indigo, badge "Atteint !"). Gestion `prefers-reduced-motion`, compatible dark/light mode.
- [2026-03-09] **Comparaison avec un ami** -- Section en bas des résultats : input date/heure/prénom de l'ami, calcul des milestones proches (≤30j) et simultanés (≤7j), cards triées, bouton "voir plus", URL partageable avec `?friend_d=&friend_t=&friend_name=`, compatible dark/light mode.
- [2026-03-09] **Export image / poster PNG personnalisé** -- Bouton "Générer mon poster" générant un canvas 1024×1536 (format portrait 2:3) avec fond img/poster-bg.webp (constellations dorées sur bleu marine), contenu personnalisé (prénom, milestone le plus proche avec chiffre doré, date exacte, signe astrologique, branding statsme.org), téléchargement PNG via canvas.toBlob(), bouton doré avec effet shimmer, fallback dégradé si image non disponible.
- [2026-03-09] **Ils sont nés comme toi** -- Stats anniversaire : 585 célébrités indexées par jour de naissance (Jan-Dec, min 3-5/jour, mix historique/contemporain), 115 journées mondiales (WORLD_DAYS) couvrant 12 mois (fêtes ONU, célébrations françaises), affichage de célé grille + badge journée mondiale quand applicable, badge glassmorphisme (gradient ambre), 0 fetch nécessaire.
- [2026-03-09] **Music chart hit feature** -- Affichage du #1 du hit-parade le jour de naissance : 15,335 jours FR (1984-2025) + 24,610 jours US (1958-2025) via data/charts-fr.json + data/charts-us.json, lazy fetch avec cache mémoire, card 2-col (FR/US side-by-side), bouton YouTube "écouter", fallback gracieux pour données manquantes (gaps 2017-2021 FR).
- [2026-03-10] **Hero section améliorations visuelles** -- Badge hero avec glow pulsant, 3 chips de suggestion cliquables (10k jours, 1M de secondes, 1k semaines) pré-remplissent la date, form card glassmorphism renforcé (blur 48px, ligne de lumière, glow focus indigo), streaks diagonales animées (2 ellipses blurées, dérive lente).
- [2026-03-10] **Segmented date/time input** -- Inputs segmentés JJ/MM/AAAA + HH:MM style timescape remplaçant les inputs natifs, algorithme d'accumulation buffer avec auto-avance intelligente, ArrowUp/Down incrémente/décrémente, Backspace, navigation clavier complète, CSS glassmorphism width 2rem, placeholder visible.
- [2026-03-10] **Boutique LemonSqueezy (mockup statique)** -- js/cart.js avec état panier localStorage, 3 produits (mug 19,90€, poster 34,90€, premium 9€/an), boutique.html redesign complet avec product cards et "Comment ça marche", FAB flottant panier + drawer glassmorphism (index + boutique), gift trigger banner (hidden, prêt pour activation), modal checkout mockup "bientôt disponible".

## En cours

(rien en cours)

## A faire (priorise)

### Priorite haute
- **LemonSqueezy intégration réelle** -- Remplir les product IDs, connecter checkout overlay, tester flux d'achat complet
- **Gift trigger activation** -- Logique JS pour détecter milestone dans les 60 jours et afficher la banner
- **Segmented input polish** -- Tests cross-browser, cas edge (paste, mobile autocomplete), refinements UX

## Idees / Backlog

- **Biorhythmes** -- Cycles physique (23j), emotionnel (28j), intellectuel (33j) avec graphique
- **Carte du ciel a la naissance** -- Representation visuelle simplifiee des positions planetaires
- **Notifications push** -- Rappel le jour d'un milestone (necessite PWA + permission)
- **Multi-langue** -- Support anglais/espagnol en plus du francais
- **Mode sombre/clair avancé** -- Préférence persistante localStorage, scheme détection système
- **Gamification avancée** -- Badges, achievements, leaderboards (share-able)
- **Intégrations reseaux sociaux** -- Shareable milestones vers Instagram Stories, TikTok (via deeplinks)

## Abandonne / Deprioritise

(rien pour le moment)
