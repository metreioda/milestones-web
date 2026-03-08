# Roadmap -- MilestoneMe (milestones-web)

> Derniere mise a jour : 2026-03-08

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

## En cours

(rien en cours)

## A faire (priorise)

### Priorite haute
1. **Sous-page "Ma timeline"** -- Vue chronologique verticale de tous les milestones (passes et futurs) sur une frise temporelle visuelle

### Priorite moyenne
2. **PWA / mode hors-ligne** -- Manifest + service worker pour installer l'app sur mobile et l'utiliser offline

### Priorite basse
3. **Animations milestone atteint** -- Animation speciale quand un milestone est atteint en temps reel (le compteur passe a zero)
4. **Comparaison avec un ami** -- Entrer deux dates de naissance et voir les milestones communs ou proches

## Idees / Backlog

- **Biorhythmes** -- Cycles physique (23j), emotionnel (28j), intellectuel (33j) avec graphique
- **Carte du ciel a la naissance** -- Representation visuelle simplifiee des positions planetaires
- **Notifications push** -- Rappel le jour d'un milestone (necessite PWA + permission)
- **Export image/story** -- Generer une belle image (canvas) d'un milestone pour Instagram/stories
- **Soundtrack personnalisee** -- Jouer la chanson numero 1 le jour de ta naissance (via API externe)
- **Multi-langue** -- Support anglais/espagnol en plus du francais

## Abandonne / Deprioritise

(rien pour le moment)
