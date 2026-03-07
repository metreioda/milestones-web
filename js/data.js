// ── DATA ──────────────────────────────────────────────────────────────────────
const MS = { s: 1e3, m: 6e4, h: 36e5, d: 864e5, w: 6048e5 };

// ── HELPERS (déclarés tôt car utilisés par PASSION_FACTS) ─────────────────────
// fmt doit être global et déclaré avant PASSION_FACTS qui l'utilise dans ses valeurs
const fmt = n => n.toLocaleString('fr-FR');

// ── CITIES LOOKUP TABLE ────────────────────────────────────────────────────────
const CITIES = [
  // FRANCE
  { name: 'Paris',         country: 'France',       flag: '🇫🇷', lat:  48.8566, lon:   2.3522, tz: 'Europe/Paris' },
  { name: 'Lyon',          country: 'France',       flag: '🇫🇷', lat:  45.7640, lon:   4.8357, tz: 'Europe/Paris' },
  { name: 'Marseille',     country: 'France',       flag: '🇫🇷', lat:  43.2965, lon:   5.3698, tz: 'Europe/Paris' },
  { name: 'Toulouse',      country: 'France',       flag: '🇫🇷', lat:  43.6047, lon:   1.4442, tz: 'Europe/Paris' },
  { name: 'Bordeaux',      country: 'France',       flag: '🇫🇷', lat:  44.8378, lon:  -0.5792, tz: 'Europe/Paris' },
  { name: 'Nice',          country: 'France',       flag: '🇫🇷', lat:  43.7102, lon:   7.2620, tz: 'Europe/Paris' },
  { name: 'Nantes',        country: 'France',       flag: '🇫🇷', lat:  47.2184, lon:  -1.5536, tz: 'Europe/Paris' },
  { name: 'Strasbourg',    country: 'France',       flag: '🇫🇷', lat:  48.5734, lon:   7.7521, tz: 'Europe/Paris' },
  { name: 'Montpellier',   country: 'France',       flag: '🇫🇷', lat:  43.6108, lon:   3.8767, tz: 'Europe/Paris' },
  { name: 'Rennes',        country: 'France',       flag: '🇫🇷', lat:  48.1173, lon:  -1.6778, tz: 'Europe/Paris' },
  { name: 'Lille',         country: 'France',       flag: '🇫🇷', lat:  50.6292, lon:   3.0573, tz: 'Europe/Paris' },
  { name: 'Grenoble',      country: 'France',       flag: '🇫🇷', lat:  45.1885, lon:   5.7245, tz: 'Europe/Paris' },
  { name: 'Rouen',         country: 'France',       flag: '🇫🇷', lat:  49.4432, lon:   1.0993, tz: 'Europe/Paris' },
  { name: 'Toulon',        country: 'France',       flag: '🇫🇷', lat:  43.1242, lon:   5.9280, tz: 'Europe/Paris' },
  { name: 'Dijon',         country: 'France',       flag: '🇫🇷', lat:  47.3220, lon:   5.0415, tz: 'Europe/Paris' },
  { name: 'Angers',        country: 'France',       flag: '🇫🇷', lat:  47.4784, lon:  -0.5632, tz: 'Europe/Paris' },
  { name: 'Reims',         country: 'France',       flag: '🇫🇷', lat:  49.2583, lon:   4.0317, tz: 'Europe/Paris' },
  { name: 'Le Havre',      country: 'France',       flag: '🇫🇷', lat:  49.4938, lon:   0.1077, tz: 'Europe/Paris' },
  { name: 'Saint-Étienne', country: 'France',       flag: '🇫🇷', lat:  45.4397, lon:   4.3872, tz: 'Europe/Paris' },
  { name: 'Metz',          country: 'France',       flag: '🇫🇷', lat:  49.1193, lon:   6.1757, tz: 'Europe/Paris' },
  // BELGIQUE
  { name: 'Bruxelles',     country: 'Belgique',     flag: '🇧🇪', lat:  50.8503, lon:   4.3517, tz: 'Europe/Brussels' },
  { name: 'Liège',         country: 'Belgique',     flag: '🇧🇪', lat:  50.6326, lon:   5.5797, tz: 'Europe/Brussels' },
  { name: 'Charleroi',     country: 'Belgique',     flag: '🇧🇪', lat:  50.4108, lon:   4.4446, tz: 'Europe/Brussels' },
  { name: 'Namur',         country: 'Belgique',     flag: '🇧🇪', lat:  50.4674, lon:   4.8720, tz: 'Europe/Brussels' },
  // SUISSE
  { name: 'Genève',        country: 'Suisse',       flag: '🇨🇭', lat:  46.2044, lon:   6.1432, tz: 'Europe/Zurich' },
  { name: 'Lausanne',      country: 'Suisse',       flag: '🇨🇭', lat:  46.5197, lon:   6.6323, tz: 'Europe/Zurich' },
  { name: 'Berne',         country: 'Suisse',       flag: '🇨🇭', lat:  46.9481, lon:   7.4474, tz: 'Europe/Zurich' },
  { name: 'Zurich',        country: 'Suisse',       flag: '🇨🇭', lat:  47.3769, lon:   8.5417, tz: 'Europe/Zurich' },
  { name: 'Fribourg',      country: 'Suisse',       flag: '🇨🇭', lat:  46.8065, lon:   7.1621, tz: 'Europe/Zurich' },
  // CANADA FRANCOPHONE
  { name: 'Montréal',      country: 'Canada',       flag: '🇨🇦', lat:  45.5017, lon: -73.5673, tz: 'America/Montreal' },
  { name: 'Québec',        country: 'Canada',       flag: '🇨🇦', lat:  46.8139, lon: -71.2080, tz: 'America/Toronto' },
  { name: 'Ottawa',        country: 'Canada',       flag: '🇨🇦', lat:  45.4215, lon: -75.6972, tz: 'America/Toronto' },
  { name: 'Gatineau',      country: 'Canada',       flag: '🇨🇦', lat:  45.4765, lon: -75.7013, tz: 'America/Toronto' },
  { name: 'Sherbrooke',    country: 'Canada',       flag: '🇨🇦', lat:  45.4042, lon: -71.8929, tz: 'America/Toronto' },
  { name: 'Moncton',       country: 'Canada',       flag: '🇨🇦', lat:  46.0878, lon: -64.7782, tz: 'America/Moncton' },
  // MAGHREB
  { name: 'Casablanca',    country: 'Maroc',        flag: '🇲🇦', lat:  33.5731, lon:  -7.5898, tz: 'Africa/Casablanca' },
  { name: 'Rabat',         country: 'Maroc',        flag: '🇲🇦', lat:  34.0209, lon:  -6.8416, tz: 'Africa/Casablanca' },
  { name: 'Marrakech',     country: 'Maroc',        flag: '🇲🇦', lat:  31.6295, lon:  -7.9811, tz: 'Africa/Casablanca' },
  { name: 'Fès',           country: 'Maroc',        flag: '🇲🇦', lat:  34.0331, lon:  -5.0003, tz: 'Africa/Casablanca' },
  { name: 'Alger',         country: 'Algérie',      flag: '🇩🇿', lat:  36.7538, lon:   3.0588, tz: 'Africa/Algiers' },
  { name: 'Oran',          country: 'Algérie',      flag: '🇩🇿', lat:  35.6911, lon:  -0.6417, tz: 'Africa/Algiers' },
  { name: 'Tunis',         country: 'Tunisie',      flag: '🇹🇳', lat:  36.8190, lon:  10.1658, tz: 'Africa/Tunis' },
  { name: 'Sfax',          country: 'Tunisie',      flag: '🇹🇳', lat:  34.7406, lon:  10.7603, tz: 'Africa/Tunis' },
  // AFRIQUE SUBSAHARIENNE FRANCOPHONE
  { name: 'Dakar',         country: 'Sénégal',      flag: '🇸🇳', lat:  14.7167, lon: -17.4677, tz: 'Africa/Dakar' },
  { name: 'Abidjan',       country: "Côte d'Ivoire", flag: '🇨🇮', lat:   5.3600, lon:  -4.0083, tz: 'Africa/Abidjan' },
  { name: 'Douala',        country: 'Cameroun',     flag: '🇨🇲', lat:   4.0511, lon:   9.7679, tz: 'Africa/Douala' },
  { name: 'Yaoundé',       country: 'Cameroun',     flag: '🇨🇲', lat:   3.8480, lon:  11.5021, tz: 'Africa/Douala' },
  { name: 'Kinshasa',      country: 'Congo (RDC)',  flag: '🇨🇩', lat:  -4.3317, lon:  15.3214, tz: 'Africa/Kinshasa' },
  { name: 'Brazzaville',   country: 'Congo',        flag: '🇨🇬', lat:  -4.2634, lon:  15.2429, tz: 'Africa/Brazzaville' },
  { name: 'Bamako',        country: 'Mali',         flag: '🇲🇱', lat:  12.6392, lon:  -8.0029, tz: 'Africa/Bamako' },
  { name: 'Ouagadougou',   country: 'Burkina Faso', flag: '🇧🇫', lat:  12.3569, lon:  -1.5352, tz: 'Africa/Ouagadougou' },
  { name: 'Lomé',          country: 'Togo',         flag: '🇹🇬', lat:   6.1375, lon:   1.2123, tz: 'Africa/Lome' },
  { name: 'Cotonou',       country: 'Bénin',        flag: '🇧🇯', lat:   6.3654, lon:   2.4183, tz: 'Africa/Porto-Novo' },
  { name: 'Conakry',       country: 'Guinée',       flag: '🇬🇳', lat:   9.5370, lon: -13.6773, tz: 'Africa/Conakry' },
  { name: 'Antananarivo',  country: 'Madagascar',   flag: '🇲🇬', lat: -18.8792, lon:  47.5079, tz: 'Indian/Antananarivo' },
  { name: 'Libreville',    country: 'Gabon',        flag: '🇬🇦', lat:   0.3901, lon:   9.4544, tz: 'Africa/Libreville' },
  { name: 'Niamey',        country: 'Niger',        flag: '🇳🇪', lat:  13.5137, lon:   2.1098, tz: 'Africa/Niamey' },
  { name: "N'Djamena",     country: 'Tchad',        flag: '🇹🇩', lat:  12.1048, lon:  15.0445, tz: 'Africa/Ndjamena' },
  { name: 'Bangui',        country: 'RCA',          flag: '🇨🇫', lat:   4.3612, lon:  18.5550, tz: 'Africa/Bangui' },
  { name: 'Bujumbura',     country: 'Burundi',      flag: '🇧🇮', lat:  -3.3822, lon:  29.3644, tz: 'Africa/Bujumbura' },
  { name: 'Kigali',        country: 'Rwanda',       flag: '🇷🇼', lat:  -1.9441, lon:  30.0619, tz: 'Africa/Kigali' },
  { name: 'Djibouti',      country: 'Djibouti',     flag: '🇩🇯', lat:  11.5720, lon:  43.1456, tz: 'Africa/Djibouti' },
  { name: 'Port-Louis',    country: 'Maurice',      flag: '🇲🇺', lat: -20.1654, lon:  57.4896, tz: 'Indian/Mauritius' },
  // DOM-TOM
  { name: 'Fort-de-France', country: 'Martinique',  flag: '🇲🇶', lat:  14.6037, lon: -61.0750, tz: 'America/Martinique' },
  { name: 'Pointe-à-Pitre', country: 'Guadeloupe',  flag: '🇬🇵', lat:  16.2418, lon: -61.5330, tz: 'America/Guadeloupe' },
  { name: 'Saint-Denis',    country: 'La Réunion',  flag: '🇷🇪', lat: -20.8823, lon:  55.4504, tz: 'Indian/Reunion' },
  { name: 'Nouméa',         country: 'Nouvelle-Calédonie', flag: '🇳🇨', lat: -22.2763, lon: 166.4572, tz: 'Pacific/Noumea' },
  { name: 'Papeete',        country: 'Polynésie française', flag: '🇵🇫', lat: -17.5334, lon: -149.5667, tz: 'Pacific/Tahiti' },
  // GRANDES MÉTROPOLES MONDIALES
  { name: 'New York',       country: 'États-Unis',   flag: '🇺🇸', lat:  40.7128, lon: -74.0060, tz: 'America/New_York' },
  { name: 'Los Angeles',    country: 'États-Unis',   flag: '🇺🇸', lat:  34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'Chicago',        country: 'États-Unis',   flag: '🇺🇸', lat:  41.8781, lon: -87.6298, tz: 'America/Chicago' },
  { name: 'Londres',        country: 'Royaume-Uni',  flag: '🇬🇧', lat:  51.5074, lon:  -0.1278, tz: 'Europe/London' },
  { name: 'Madrid',         country: 'Espagne',      flag: '🇪🇸', lat:  40.4168, lon:  -3.7038, tz: 'Europe/Madrid' },
  { name: 'Rome',           country: 'Italie',       flag: '🇮🇹', lat:  41.9028, lon:  12.4964, tz: 'Europe/Rome' },
  { name: 'Berlin',         country: 'Allemagne',    flag: '🇩🇪', lat:  52.5200, lon:  13.4050, tz: 'Europe/Berlin' },
  { name: 'Amsterdam',      country: 'Pays-Bas',     flag: '🇳🇱', lat:  52.3676, lon:   4.9041, tz: 'Europe/Amsterdam' },
  { name: 'Moscou',         country: 'Russie',       flag: '🇷🇺', lat:  55.7558, lon:  37.6173, tz: 'Europe/Moscow' },
  { name: 'Istanbul',       country: 'Turquie',      flag: '🇹🇷', lat:  41.0082, lon:  28.9784, tz: 'Europe/Istanbul' },
  { name: 'Dubai',          country: 'Émirats arabes unis', flag: '🇦🇪', lat:  25.2048, lon:  55.2708, tz: 'Asia/Dubai' },
  { name: 'Mumbai',         country: 'Inde',         flag: '🇮🇳', lat:  19.0760, lon:  72.8777, tz: 'Asia/Kolkata' },
  { name: 'Delhi',          country: 'Inde',         flag: '🇮🇳', lat:  28.7041, lon:  77.1025, tz: 'Asia/Kolkata' },
  { name: 'Pékin',          country: 'Chine',        flag: '🇨🇳', lat:  39.9042, lon: 116.4074, tz: 'Asia/Shanghai' },
  { name: 'Shanghai',       country: 'Chine',        flag: '🇨🇳', lat:  31.2304, lon: 121.4737, tz: 'Asia/Shanghai' },
  { name: 'Tokyo',          country: 'Japon',        flag: '🇯🇵', lat:  35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { name: 'Séoul',          country: 'Corée du Sud', flag: '🇰🇷', lat:  37.5665, lon: 126.9780, tz: 'Asia/Seoul' },
  { name: 'Singapour',      country: 'Singapour',    flag: '🇸🇬', lat:   1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { name: 'Sydney',         country: 'Australie',    flag: '🇦🇺', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' },
  { name: 'São Paulo',      country: 'Brésil',       flag: '🇧🇷', lat: -23.5505, lon: -46.6333, tz: 'America/Sao_Paulo' },
  { name: 'Buenos Aires',   country: 'Argentine',    flag: '🇦🇷', lat: -34.6037, lon: -58.3816, tz: 'America/Argentina/Buenos_Aires' },
  { name: 'Le Caire',       country: 'Égypte',       flag: '🇪🇬', lat:  30.0444, lon:  31.2357, tz: 'Africa/Cairo' },
  { name: 'Lagos',          country: 'Nigeria',      flag: '🇳🇬', lat:   6.5244, lon:   3.3792, tz: 'Africa/Lagos' },
  { name: 'Nairobi',        country: 'Kenya',        flag: '🇰🇪', lat:  -1.2921, lon:  36.8219, tz: 'Africa/Nairobi' },
  { name: 'Johannesburg',   country: 'Afrique du Sud', flag: '🇿🇦', lat: -26.2041, lon:  28.0473, tz: 'Africa/Johannesburg' },
  { name: 'Mexico',         country: 'Mexique',      flag: '🇲🇽', lat:  19.4326, lon: -99.1332, tz: 'America/Mexico_City' },
];

const MILESTONES = [
  // ── SECONDES ──
  { v: 1e8,        u:'s', e:'⚡', n:'100 000 000 secondes',     t:'Cent millions de secondes !' },
  { v: 111111111,  u:'s', e:'🔮', n:'111 111 111 secondes',     t:'Le chiffre miroir' },
  { v: 2e8,        u:'s', e:'✨', n:'200 000 000 secondes',     t:'Deux cents millions !' },
  { v: 222222222,  u:'s', e:'👯', n:'222 222 222 secondes',     t:'La paire parfaite' },
  { v: 3e8,        u:'s', e:'🎯', n:'300 000 000 secondes',     t:'Trois cents millions !' },
  { v: 333333333,  u:'s', e:'🎲', n:'333 333 333 secondes',     t:'Triple répétition magique' },
  { v: 4e8,        u:'s', e:'💪', n:'400 000 000 secondes',     t:'Quatre cents millions !' },
  { v: 444444444,  u:'s', e:'🏠', n:'444 444 444 secondes',     t:'Les quatre alignés' },
  { v: 5e8,        u:'s', e:'🏆', n:'500 000 000 secondes',     t:'Le demi-milliard !' },
  { v: 555555555,  u:'s', e:'🎰', n:'555 555 555 secondes',     t:'Full house de cinq' },
  { v: 666666666,  u:'s', e:'😈', n:'666 666 666 secondes',     t:'Vilain numéro...' },
  { v: 777777777,  u:'s', e:'🍀', n:'777 777 777 secondes',     t:'JACKPOT ! Triple sept !' },
  { v: 888888888,  u:'s', e:'♾️', n:'888 888 888 secondes',     t:'Prospérité infinie' },
  { v: 999999999,  u:'s', e:'😱', n:'999 999 999 secondes',     t:'Juste avant le milliard !' },
  { v: 1e9,        u:'s', e:'🚀', n:'1 000 000 000 secondes',   t:'LE GIGASECONDE — ~31.7 ans 🔥' },
  { v: 1111111111, u:'s', e:'🌟', n:'1 111 111 111 secondes',   t:'Milliard aux chiffres magiques' },
  { v: 2e9,        u:'s', e:'👑', n:'2 000 000 000 secondes',   t:'Double Gigaseconde. Légende.' },

  // ── MINUTES ──
  { v: 5e5,        u:'m', e:'⏱️', n:'500 000 minutes',          t:'Demi-million de minutes !' },
  { v: 1e6,        u:'m', e:'💎', n:'1 000 000 minutes',        t:'UN MILLION DE MINUTES !' },
  { v: 1111111,    u:'m', e:'🔮', n:'1 111 111 minutes',        t:'Répétition magique' },
  { v: 2e6,        u:'m', e:'🎊', n:'2 000 000 minutes',        t:'Deux millions de minutes !' },
  { v: 2222222,    u:'m', e:'🦢', n:'2 222 222 minutes',        t:'Cygnes en série' },
  { v: 3e6,        u:'m', e:'🌈', n:'3 000 000 minutes',        t:'Trois millions de minutes' },
  { v: 5e6,        u:'m', e:'🔥', n:'5 000 000 minutes',        t:'Cinq millions de minutes !' },

  // ── HEURES ──
  { v: 1e5,        u:'h', e:'⏰', n:'100 000 heures',           t:'Cent mille heures sur Terre' },
  { v: 111111,     u:'h', e:'🔮', n:'111 111 heures',           t:'Répétition dorée en heures' },
  { v: 2e5,        u:'h', e:'⭐', n:'200 000 heures',           t:'Deux cent mille heures !' },
  { v: 222222,     u:'h', e:'🌙', n:'222 222 heures',           t:'Paires de deux' },
  { v: 333333,     u:'h', e:'🎲', n:'333 333 heures',           t:'Triple répétition horaire' },
  { v: 444444,     u:'h', e:'🏠', n:'444 444 heures',           t:'Quatres alignés en heures' },
  { v: 5e5,        u:'h', e:'🏅', n:'500 000 heures',           t:'Demi-million d\'heures !' },

  // ── JOURS ──
  { v: 1e3,        u:'d', e:'🌱', n:'1 000 jours',              t:'Mille jours sur Terre' },
  { v: 2e3,        u:'d', e:'🌿', n:'2 000 jours',              t:'Deux mille jours !' },
  { v: 3e3,        u:'d', e:'🌳', n:'3 000 jours',              t:'Trois mille jours !' },
  { v: 4e3,        u:'d', e:'🌲', n:'4 000 jours',              t:'Quatre mille jours !' },
  { v: 5e3,        u:'d', e:'🎋', n:'5 000 jours',              t:'Cinq mille jours !' },
  { v: 5555,       u:'d', e:'🔮', n:'5 555 jours',              t:'Répétition de cinq' },
  { v: 6e3,        u:'d', e:'🌊', n:'6 000 jours',              t:'Six mille jours !' },
  { v: 6666,       u:'d', e:'😈', n:'6 666 jours',              t:'Le côté obscur...' },
  { v: 7e3,        u:'d', e:'🌟', n:'7 000 jours',              t:'Sept mille jours !' },
  { v: 7777,       u:'d', e:'🎰', n:'7 777 jours',              t:'Septettes de chance !' },
  { v: 8e3,        u:'d', e:'🎸', n:'8 000 jours',              t:'Huit mille jours !' },
  { v: 8888,       u:'d', e:'♾️', n:'8 888 jours',              t:'L\'infini en jours' },
  { v: 9e3,        u:'d', e:'🌌', n:'9 000 jours',              t:'Neuf mille jours !' },
  { v: 9999,       u:'d', e:'😱', n:'9 999 jours',              t:'Juste avant 10K !' },
  { v: 1e4,        u:'d', e:'🎆', n:'10 000 jours',             t:'DIX MILLE JOURS ! Le classique.' },
  { v: 11111,      u:'d', e:'🔮', n:'11 111 jours',             t:'Cinq uns de suite !' },
  { v: 12e3,       u:'d', e:'🏆', n:'12 000 jours',             t:'Douze mille jours !' },
  { v: 12345,      u:'d', e:'🎯', n:'12 345 jours',             t:'Le comptage parfait !' },
  { v: 15e3,       u:'d', e:'💫', n:'15 000 jours',             t:'Quinze mille jours' },
  { v: 2e4,        u:'d', e:'👑', n:'20 000 jours',             t:'Vingt mille jours. Légende.' },
  { v: 22222,      u:'d', e:'🔮', n:'22 222 jours',             t:'Répétition de 2 en jours' },
  { v: 25e3,       u:'d', e:'🌟', n:'25 000 jours',             t:'Vingt-cinq mille jours' },
  { v: 3e4,        u:'d', e:'🏆', n:'30 000 jours',             t:'Trente mille jours. Immortel.' },
  { v: 33333,      u:'d', e:'🔮', n:'33 333 jours',             t:'Répétition de 3 en jours' },

  // ── SEMAINES ──
  { v: 1e3,        u:'w', e:'📅', n:'1 000 semaines',           t:'Mille semaines de vie !' },
  { v: 1111,       u:'w', e:'🔮', n:'1 111 semaines',           t:'Répétition hebdomadaire' },
  { v: 1234,       u:'w', e:'🎯', n:'1 234 semaines',           t:'Compte parfait en semaines' },
  { v: 2e3,        u:'w', e:'🎊', n:'2 000 semaines',           t:'Deux mille semaines !' },
  { v: 2222,       u:'w', e:'🌙', n:'2 222 semaines',           t:'Paires de 2 en semaines' },
  { v: 3e3,        u:'w', e:'👑', n:'3 000 semaines',           t:'Trois mille semaines. Sage.' },
];

// ── PASSION FACTS (utilise fmt — doit être déclaré après fmt) ─────────────────
const PASSION_FACTS = {
  musique:  { emoji: '🎵', label: 'musique',  fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 3))} concerts de 3h — sans les rappels.` },
  sport:    { emoji: '⚽', label: 'sport',    fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 1.5))} matchs de foot complets.` },
  voyage:   { emoji: '✈️', label: 'voyage',   fact: (h) => `Avec tes heures de sommeil, tu aurais fait ${fmt(Math.round(h / 11))} fois Paris–New York en avion.` },
  lecture:  { emoji: '📚', label: 'lecture',  fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 6))} romans de 300 pages lus à voix haute.` },
  gaming:   { emoji: '🎮', label: 'gaming',   fact: (h) => `Tes heures de sommeil = ${fmt(Math.round(h / 50))} parties complètes d'un RPG de 50h.` },
  cuisine:  { emoji: '🍳', label: 'cuisine',  fact: (h) => `Tu as dormi le temps de préparer ${fmt(Math.round(h / 0.75))} recettes de 45 minutes.` },
  art:      { emoji: '🎨', label: 'art',      fact: (h) => `Tes heures de sommeil = ${fmt(Math.round(h / 20))} tableaux peints à 20h chacun.` },
  science:  { emoji: '🔬', label: 'science',  fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 3))} expériences scientifiques de 3h.` },
  nature:   { emoji: '🌿', label: 'nature',   fact: (h) => `Pendant ton sommeil total, un arbre a grandi de ${fmt(Math.round(h / 8760 * 50))} cm.` },
  cinema:   { emoji: '🎬', label: 'cinéma',   fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 2))} films de 2h — sans les pubs.` },
  autre:    { emoji: '✨', label: 'passion',   fact: (h) => `Tes ${fmt(Math.round(h))} heures de sommeil auraient suffi pour quelque chose d'extraordinaire.` },
};

const PLANETS = [
  { name: 'Mercure', emoji: '☿', days: 87.97  },
  { name: 'Vénus',   emoji: '♀', days: 224.7  },
  { name: 'Mars',    emoji: '♂', days: 686.97 },
  { name: 'Jupiter', emoji: '♃', days: 4332.6 },
  { name: 'Saturne', emoji: '♄', days: 10759  },
  { name: 'Uranus',  emoji: '⛢', days: 30687  },
  { name: 'Neptune', emoji: '♆', days: 60190  },
];

const ZODIAC_TRAITS = {
  'Bélier':      { core: 'un fonceur impulsif qui agit avant de réfléchir', shadow: 'une patience à peu près aussi longue qu\'un feu rouge', style: 'toujours premier, même dans la file d\'attente du boulanger', love: 'tombe amoureux en 30 secondes et repart en 31 si ça l\'ennuie' },
  'Taureau':     { core: 'un épicurien têtu qui aime le bon vin, le bon fromage et sa couette', shadow: 'une résistance au changement digne d\'un monument historique', style: 'refuse de bouger une fois installé dans son canapé favori', love: 'loyal comme un golden retriever, possessif comme un chien de garde' },
  'Gémeaux':     { core: 'un esprit brillant et volage, capable de tenir deux conversations simultanément', shadow: 'une constance à géométrie très variable', style: 'change d\'avis entre le début et la fin de cette phrase', love: 'adore la séduction mais a peur des longs week-ends en tête-à-tête' },
  'Cancer':      { core: 'un être hypersensible qui ressent tout à fond, vraiment tout', shadow: 'une tendance à transformer chaque petite déception en opéra tragique', style: 'accumule des couvertures, des animaux de compagnie et des rancunes', love: 'dévouement maternel total, avec un côté "je me souviens de tout ce que tu as dit en 2017"' },
  'Lion':        { core: 'un ego royal qui entre dans une pièce et attend les applaudissements', shadow: 'une modestie inversement proportionnelle à la taille de sa crinière', style: 'ne fait jamais rien à moitié, surtout pas son look', love: 'aime être adoré, cajolé et filmé en train d\'être adoré et cajolé' },
  'Vierge':      { core: 'un perfectionniste analytique qui a refait la to-do list trois fois ce matin', shadow: 'une capacité critique qui transforme tout repas en inspection sanitaire', style: 'range ses épices par ordre alphabétique et par date de péremption', love: 'exprime son affection en corrigeant les fautes d\'orthographe de tes textos' },
  'Balance':     { core: 'un diplomate charmeur incapable de choisir entre deux menus identiques', shadow: 'une indécision qui ferait rater un TGV à l\'heure', style: 'redécore son intérieur deux fois par an pour des raisons "d\'harmonie"', love: 'romantique invétéré qui tombe amoureux de l\'idée de l\'amour' },
  'Scorpion':    { core: 'un être magnétique et intense qui voit clair dans le jeu de tout le monde', shadow: 'une rancune conservée avec soin, comme un grand cru millésimé', style: 'observe en silence, note tout, oublie rien', love: 'passion absolue ou silence radio, pas de demi-mesure possible' },
  'Sagittaire':  { core: 'un aventurier philosophe qui a toujours un billet d\'avion dans la poche', shadow: 'une tact comparable à un éléphant dans un magasin de porcelaine', style: 'planifie cinq voyages simultanément depuis son canapé', love: 'liberté à tout prix — "je t\'aime mais ne m\'enferme pas"' },
  'Capricorne':  { core: 'un ambitieux discipliné qui travaille pendant que les autres dorment', shadow: 'un sens de l\'humour activé uniquement le week-end, après 21h', style: 'a un plan à cinq ans depuis l\'âge de huit ans', love: 'met autant de sérieux dans une relation qu\'un rapport trimestriel' },
  'Verseau':     { core: 'un visionnaire excentrique convaincu d\'avoir cinq ans d\'avance sur l\'humanité', shadow: 'une proximité émotionnelle qui frise le zéro absolu', style: 'explique ses opinions à tout le monde, qu\'on lui demande ou non', love: 'ami idéal de l\'humanité, partenaire qui a besoin "d\'espace"' },
  'Poissons':    { core: 'un rêveur empathique qui vit à mi-chemin entre le réel et l\'imaginaire', shadow: 'une relation au temps et aux délais assez créative', style: 'commence cinq projets par semaine et en finit un par trimestre', love: 'romantisme total et fusion émotionnelle, jusqu\'à se perdre dans l\'autre' },
};

const MOON_TRAITS = {
  'Bélier':      { core: 'réagit avant d\'avoir fini de penser', shadow: 'les émotions partent comme des feux d\'artifice — vite et fort', love: 'besoin d\'excitation permanente, s\'ennuie au calme plat' },
  'Taureau':     { core: 'cherche la sécurité et le confort en toutes choses', shadow: 'digère les émotions lentement, très lentement', love: 'rassure par les gestes concrets plutôt que les grands discours' },
  'Gémeaux':     { core: 'traite ses émotions par la parole et l\'analyse', shadow: 'les sentiments changent aussi vite que les sujets de conversation', love: 'préfère discuter des sentiments plutôt que les vivre pleinement' },
  'Cancer':      { core: 'une sensibilité émotionnelle hors du commun', shadow: 'garde tout en mémoire, les blessures incluses', love: 'a besoin de se sentir protégé pour s\'ouvrir vraiment' },
  'Lion':        { core: 'exprime ses émotions avec théâtre et grandeur', shadow: 'l\'ego blessé est une catastrophe internationale', love: 'généreux et chaud, mais attend beaucoup de reconnaissance en retour' },
  'Vierge':      { core: 'analyse chaque émotion sous toutes ses coutures', shadow: 'l\'anxiété silencieuse comme mode de vie par défaut', love: 'soigne plutôt qu\'il ne déclare — attention = amour' },
  'Balance':     { core: 'a besoin d\'harmonie autour de soi pour être bien dans sa tête', shadow: 'évite les conflits même quand il faudrait en avoir un', love: 'l\'équilibre émotionnel dépend entièrement de la qualité de la relation' },
  'Scorpion':    { core: 'ressent tout à une profondeur que la plupart ne soupçonnent pas', shadow: 'jalousie et intensité à doses industrielles', love: 'tout ou rien — pas de zone grise possible' },
  'Sagittaire':  { core: 'optimisme naturel et besoin d\'espace intérieur', shadow: 'fuit les émotions lourdes vers de nouveaux horizons', love: 'genereux et joyeux, tant que personne n\'essaie de le retenir' },
  'Capricorne':  { core: 'contrôle ses émotions avec la rigueur d\'un directeur financier', shadow: 'exprime ses vulnérabilités uniquement dans l\'obscurité totale', love: 'montre son amour par des actes durables, pas des mots' },
  'Verseau':     { core: 'émotions vécues de façon détachée, presque intellectuelle', shadow: 'a du mal à distinguer ce qu\'il ressent de ce qu\'il analyse', love: 'aime l\'humanité en général, l\'individu en particulier c\'est plus compliqué' },
  'Poissons':    { core: 'éponge émotionnelle qui absorbe l\'humeur de toute une salle', shadow: 'se noie parfois dans des sentiments qui ne lui appartiennent pas', love: 'fusion totale, dissolution des frontières, poésie et larmes mélangées' },
};

const CHINESE_TRAITS = {
  'Rat':     { core: 'malin comme un singe et charmant comme un renard', shadow: 'thésauriseur compulsif, y compris des informations utiles qu\'il garde pour lui', love: 'séducteur efficace qui sait exactement quoi dire et quand' },
  'Bœuf':    { core: 'travailleur acharné, fiable comme une montre suisse', shadow: 'entêtement légendaire — changer d\'avis lui coûte un effort physique', love: 'lent à s\'engager mais bétonné une fois que c\'est fait' },
  'Tigre':   { core: 'magnétique et audacieux, entre dans les pièces comme une rockstar', shadow: 'imprévisible et incontrôlable, même pour lui-même', love: 'passion intense qui dévore tout sur son passage' },
  'Lapin':   { core: 'diplomate raffiné qui fait les choses avec élégance ou pas du tout', shadow: 'fuit les situations inconfortables avec une agilité déconcertante', love: 'tendre et attentionné, mais besoin d\'une bulle de sécurité totale' },
  'Dragon':  { core: 'flamboyant, ambitieux, convaincu d\'être exceptionnel — et souvent raison', shadow: 'l\'humilité est son angle mort le plus flagrant', love: 'conquérant en amour aussi, veut impressionner à chaque rendez-vous' },
  'Serpent': { core: 'intuitif et mystérieux, sait des choses sans savoir comment il les sait', shadow: 'méfiance et possessivité en fond de tableau', love: 'séducteur subtil, envoûtant, difficile à oublier une fois rencontré' },
  'Cheval':  { core: 'libre comme l\'air, énergique et toujours en mouvement', shadow: 'l\'engagement long terme lui donne des sueurs froides', love: 'romantique fougueux, mais la routine le fait s\'évaporer' },
  'Chèvre':  { core: 'créatif et sensible, vit dans un monde d\'intuitions et d\'esthétique', shadow: 'tendance à dépendre des autres pour les décisions pratiques', love: 'besoin de tendresse et de sécurité émotionnelle avant tout' },
  'Singe':   { core: 'brillant, inventif et capable de résoudre n\'importe quel problème en riant', shadow: 's\'ennuie à une vitesse stupéfiante et le fait savoir', love: 'jeux de séduction permanents, même en couple stable depuis dix ans' },
  'Coq':     { core: 'organisé, perfectionniste, et ne rate jamais l\'occasion de le dire', shadow: 'critique naturel qui voit d\'abord ce qui ne va pas', love: 'prend soin de l\'autre avec méthode et un cahier de suivi imaginaire' },
  'Chien':   { core: 'loyal et honnête jusqu\'à en être maladroit parfois', shadow: 'anxiété chronique sur l\'état du monde et des gens qu\'il aime', love: 'fidèle absolument, s\'oublie souvent pour les autres' },
  'Cochon':  { core: 'généreux, jovial, et sincère avec une désarmante naïveté', shadow: 'une confiance en l\'humanité que les déceptions n\'arrivent pas à entamer', love: 'tout-ou-rien dans la générosité affective' },
};

const UNIT_LABELS = { s: '⚡ Secondes', m: '⏰ Minutes', h: '🕰️ Heures', d: '📅 Jours', w: '📆 Semaines' };

// ── NUMÉROLOGIE ────────────────────────────────────────────────────────────────
const NUMEROLOGY_DATA = {
  1:  { name: 'Le Leader',           emoji: '🔥', description: "Tu es né·e pour ouvrir des chemins. Pionnier·ère dans l'âme, tu avances là où les autres hésitent.",                              traits: ['Indépendant·e', 'Ambitieux·se', 'Courageux·se', 'Parfois autoritaire'] },
  2:  { name: 'Le Médiateur',        emoji: '🕊️', description: 'Tu es le pont entre les êtres. Diplomate instinctif·ve, tu sens les tensions avant qu\'elles éclatent.',                         traits: ['Sensible', 'Coopératif·ve', 'Intuitif·ve', 'Parfois hésitant·e'] },
  3:  { name: 'Le Créatif',          emoji: '✨', description: 'La vie est ton terrain de jeu. Tu exprimes, tu crées, tu inspires — le monde est plus coloré avec toi.',                         traits: ['Expressif·ve', 'Optimiste', 'Sociable', 'Parfois dispersé·e'] },
  4:  { name: 'Le Bâtisseur',        emoji: '🏗️', description: 'Tu construis sur du solide. Là où les autres voient des rêves, tu vois des plans de construction.',                              traits: ['Rigoureux·se', 'Fiable', 'Méthodique', 'Parfois rigide'] },
  5:  { name: "L'Aventurier",        emoji: '🌍', description: "La liberté est ton oxygène. Chaque routine te semble une cage — tu vis pour explorer et changer.",                                traits: ['Adaptable', 'Curieux·se', 'Dynamique', 'Parfois instable'] },
  6:  { name: 'Le Protecteur',       emoji: '💛', description: 'Ton cœur est une maison ouverte. Responsable et généreux·se, tu portes les autres avec naturel.',                                traits: ['Attentionné·e', 'Loyal·e', 'Harmonieux·se', "Parfois envahissant·e"] },
  7:  { name: 'Le Sage',             emoji: '🔭', description: 'Tu cherches ce qui se cache derrière les apparences. L\'analyse et la contemplation sont tes territoires.',                      traits: ['Intellectuel·le', 'Introspectif·ve', 'Analytique', 'Parfois distant·e'] },
  8:  { name: 'Le Manifeste',        emoji: '💎', description: 'Tu es câblé·e pour réussir dans le monde matériel. Ambition et sens des affaires sont tes outils.',                              traits: ['Ambitieux·se', 'Organisé·e', 'Efficace', 'Parfois autoritaire'] },
  9:  { name: "L'Humaniste",         emoji: '🌟', description: "Tu portes l'humanité dans le cœur. Empathique et universel·le, tu vois au-delà des frontières.",                                 traits: ['Compatissant·e', 'Idéaliste', 'Généreux·se', "Parfois trop idéaliste"] },
  11: { name: "L'Illuminé",          emoji: '⚡', description: "Nombre maître : tu portes une sensibilité et une intuition hors du commun. Inspirateur·rice né·e.",                              traits: ['Intuitif·ve', 'Idéaliste', 'Inspirant·e', 'Parfois hypersensible'], master: true },
  22: { name: 'Le Grand Bâtisseur',  emoji: '🏛️', description: 'Nombre maître : tu as la capacité de transformer les grandes idées en réalisations concrètes et durables.',                     traits: ['Visionnaire', 'Pragmatique', 'Ambitieux·se', 'Parfois perfectionniste'], master: true },
  33: { name: 'Le Maître Enseignant',emoji: '🕯️', description: "Nombre maître rare : tu incarnes l'amour et la sagesse dans leur forme la plus pure. Un don à partager.",                        traits: ['Altruiste', 'Sage', 'Inspirant·e', "Parfois trop exigeant·e envers soi-même"], master: true },
};

const PYTHAGOREAN_TABLE = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
};
