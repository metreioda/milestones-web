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
  musique:  { emoji: '🎵', label: 'musique',  fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 3))} concerts de 3h — sans les rappels.`, fact2: (d) => `En ${fmt(d)} jours de vie, la Terre a produit l'équivalent de ${fmt(Math.round(d * 8))} chansons inédites.` },
  sport:    { emoji: '⚽', label: 'sport',    fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 1.5))} matchs de foot complets.`, fact2: (d) => `Depuis ta naissance, environ ${fmt(Math.round(d / 4))} marathons ont été courus dans le monde chaque jour.` },
  voyage:   { emoji: '✈️', label: 'voyage',   fact: (h) => `Avec tes heures de sommeil, tu aurais fait ${fmt(Math.round(h / 11))} fois Paris–New York en avion.`, fact2: (d) => `En ${fmt(d)} jours, tu aurais pu faire ${fmt(Math.round(d * 24 / 80))} fois le tour du monde à la vitesse de Jules Verne.` },
  lecture:  { emoji: '📚', label: 'lecture',  fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 6))} romans de 300 pages lus à voix haute.`, fact2: (d) => `Depuis ta naissance, environ ${fmt(Math.round(d * 4000))} nouveaux livres ont été publiés dans le monde (4 000/jour).` },
  gaming:   { emoji: '🎮', label: 'gaming',   fact: (h) => `Tes heures de sommeil = ${fmt(Math.round(h / 50))} parties complètes d'un RPG de 50h.`, fact2: (d) => `Le gaming mondial a généré des milliards de parties en ${fmt(d)} jours — tu n'es pas seul·e.` },
  cuisine:  { emoji: '🍳', label: 'cuisine',  fact: (h) => `Tu as dormi le temps de préparer ${fmt(Math.round(h / 0.75))} recettes de 45 minutes.`, fact2: (d) => `En ${fmt(d)} jours, les chefs du monde ont cuisiné environ ${fmt(Math.round(d * 3.5))} milliards de repas.` },
  art:      { emoji: '🎨', label: 'art',      fact: (h) => `Tes heures de sommeil = ${fmt(Math.round(h / 20))} tableaux peints à 20h chacun.`, fact2: (d) => `Depuis ta naissance, les musées du monde ont accueilli des milliards de visiteurs.` },
  science:  { emoji: '🔬', label: 'science',  fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 3))} expériences scientifiques de 3h.`, fact2: (d) => `En ${fmt(d)} jours, la science mondiale a publié environ ${fmt(Math.round(d * 5000))} nouveaux articles scientifiques.` },
  nature:   { emoji: '🌿', label: 'nature',   fact: (h) => `Pendant ton sommeil total, un arbre a grandi de ${fmt(Math.round(h / 8760 * 50))} cm.`, fact2: (d) => `Depuis ta naissance, la Terre a tourné ${fmt(Math.round(d))} fois sur elle-même et ${fmt(Math.round(d / 365.25))} fois autour du Soleil.` },
  cinema:   { emoji: '🎬', label: 'cinéma',   fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 2))} films de 2h — sans les pubs.`, fact2: (d) => `En ${fmt(d)} jours, Hollywood et le monde ont produit environ ${fmt(Math.round(d * 20))} films.` },
  photo:    { emoji: '📷', label: 'photographie', fact: (h) => `Avec tes heures de sommeil, tu aurais shooté ${fmt(Math.round(h * 60))} photos (1 photo/minute en balade).`, fact2: (d) => `Depuis ta naissance, l'humanité a pris des milliards de photos — 1,4 milliard par jour rien qu'en 2024.` },
  mode:     { emoji: '👗', label: 'mode',     fact: (h) => `Ton temps de sommeil total représente ${fmt(Math.round(h / 2))} défilés de mode complets de 2h.`, fact2: (d) => `En ${fmt(d)} jours, l'industrie de la mode a produit l'équivalent de ${fmt(Math.round(d * 8000))} km de tissu.` },
  yoga:     { emoji: '🧘', label: 'yoga',     fact: (h) => `Tu as dormi l'équivalent de ${fmt(Math.round(h / 1.25))} séances de yoga de 75 min. Namaste.`, fact2: (d) => `Depuis ta naissance, le nombre de pratiquants de yoga dans le monde a dépassé 300 millions.` },
  autre:    { emoji: '✨', label: 'passion',   fact: (h) => `Tes ${fmt(Math.round(h))} heures de sommeil auraient suffi pour quelque chose d'extraordinaire.`, fact2: (d) => `En ${fmt(d)} jours d'existence, tu as vécu ${fmt(Math.round(d * 86400))} secondes d'histoire.` },
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
  1:  { name: 'Le Leader', emoji: '🔥', description: "Tu es né·e pour ouvrir des chemins. Pionnier·ère dans l'âme, tu avances là où les autres hésitent. Ton énergie est celle du commencement — la première flamme.", strength: "Ta capacité à agir sans attendre l'approbation des autres est ton atout le plus précieux.", challenge: "Apprendre à écouter sans couper la parole, et à voir la contribution des autres comme une force.", famous: ['Napoléon Bonaparte', 'Martin Luther King', 'Steve Jobs'], traits: ['Indépendant·e', 'Ambitieux·se', 'Courageux·se', 'Parfois autoritaire'] },
  2:  { name: 'Le Médiateur', emoji: '🕊️', description: "Tu es le pont entre les êtres. Diplomate instinctif·ve, tu sens les tensions avant qu'elles éclatent. Ta présence apaise, ta sensibilité comprend là où les mots manquent.", strength: "Ta capacité à entendre ce qui n'est pas dit et à créer des espaces de réconciliation est un don rare.", challenge: "Ne pas te perdre dans les besoins des autres. Apprendre à dire non sans culpabilité.", famous: ['Mahatma Gandhi', 'Nelson Mandela', 'Barack Obama'], traits: ['Sensible', 'Coopératif·ve', 'Intuitif·ve', 'Parfois hésitant·e'] },
  3:  { name: 'Le Créatif', emoji: '✨', description: "La vie est ton terrain de jeu. Tu exprimes, tu crées, tu inspires — le monde est plus coloré avec toi. Ta joie est contagieuse, ton imagination débordante.", strength: "Ta capacité à trouver la beauté partout et à la communiquer est un cadeau pour ceux qui t'entourent.", challenge: "Canaliser ton énergie créative vers des projets qui durent. La discipline est ton ennemie préférée — et ta meilleure alliée.", famous: ['Pablo Picasso', 'Salvador Dalí', 'Freddie Mercury'], traits: ['Expressif·ve', 'Optimiste', 'Sociable', 'Parfois dispersé·e'] },
  4:  { name: 'Le Bâtisseur', emoji: '🏗️', description: "Tu construis sur du solide. Là où les autres voient des rêves, tu vois des plans de construction. Ta vie est une cathédrale bâtie pierre par pierre.", strength: "Ta fiabilité et ton sens de l'organisation créent la confiance autour de toi. Si tu dis que c'est fait, c'est fait.", challenge: "Accepter l'imprévu et lâcher le contrôle sans que tout s'effondre dans ta tête.", famous: ['Albert Einstein', 'Isaac Newton', 'Marie Curie'], traits: ['Rigoureux·se', 'Fiable', 'Méthodique', 'Parfois rigide'] },
  5:  { name: "L'Aventurier", emoji: '🌍', description: "La liberté est ton oxygène. Chaque routine te semble une cage — tu vis pour explorer et changer. Ta vie est un roman d'aventures écrit au fil du vent.", strength: "Ta capacité d'adaptation est phénoménale. Là où les autres craignent le changement, tu t'y jettes avec appétit.", challenge: "L'instabilité peut devenir ta marque involontaire. Apprendre à rester quand ça compte vraiment.", famous: ['Vincent van Gogh', 'Jack Kerouac', 'Joséphine Baker'], traits: ['Adaptable', 'Curieux·se', 'Dynamique', 'Parfois instable'] },
  6:  { name: 'Le Protecteur', emoji: '💛', description: "Ton cœur est une maison ouverte. Responsable et généreux·se, tu portes les autres avec naturel. Ta vie gravite autour du soin, de la famille.", strength: "Tu crées des environnements où les gens se sentent en sécurité et aimés. Cette capacité à nourrir est rare et précieuse.", challenge: "Distinguer l'aide sincère du sacrifice qui épuise. Tu peux donner jusqu'à l'oubli de toi-même.", famous: ['Mère Teresa', 'Albert Schweitzer', 'Coluche'], traits: ['Attentionné·e', 'Loyal·e', 'Harmonieux·se', "Parfois envahissant·e"] },
  7:  { name: 'Le Sage', emoji: '🔭', description: "Tu cherches ce qui se cache derrière les apparences. L'analyse et la contemplation sont tes territoires. Tu poses les questions que les autres n'osent pas formuler.", strength: "Ton intelligence pénétrante te permet de voir des vérités que d'autres manquent. Tu es un chercheur né.", challenge: "Sortir de ta tête pour habiter pleinement ta vie. La connaissance sans l'expérience est une bibliothèque fermée.", famous: ['Platon', 'Carl Jung', 'Stephen Hawking'], traits: ['Intellectuel·le', 'Introspectif·ve', 'Analytique', 'Parfois distant·e'] },
  8:  { name: 'Le Manifeste', emoji: '💎', description: "Tu es câblé·e pour réussir dans le monde matériel. Ambition et sens des affaires sont tes outils. Tu transformes les idées en réalités concrètes et mesurables.", strength: "Ta vision stratégique et ton énergie pour construire te permettent d'atteindre des niveaux de réussite que peu imaginent.", challenge: "Ne pas confondre succès matériel et bonheur. L'argent et le pouvoir peuvent devenir des masques.", famous: ['Oprah Winfrey', 'Elon Musk', 'Sandra Bullock'], traits: ['Ambitieux·se', 'Organisé·e', 'Efficace', 'Parfois autoritaire'] },
  9:  { name: "L'Humaniste", emoji: '🌟', description: "Tu portes l'humanité dans le cœur. Empathique et universel·le, tu vois au-delà des frontières. Ta vie a souvent un sens de mission — contribuer à quelque chose de plus grand.", strength: "Ton altruisme et ta compassion universelle peuvent littéralement changer des vies.", challenge: "Ne pas te perdre dans l'idéal au point d'ignorer ta propre vie. Les blessures non cicatrisées peuvent alimenter une fuite.", famous: ['Leonardo DiCaprio', 'Gandhi', 'Princesse Diana'], traits: ['Compatissant·e', 'Idéaliste', 'Généreux·se', "Parfois trop idéaliste"] },
  11: { name: "L'Illuminé", emoji: '⚡', description: "Nombre maître : tu portes une sensibilité et une intuition hors du commun. Inspirateur·rice né·e, tu captes des fréquences que peu perçoivent. Ta vie est une quête de sens profonde.", strength: "Ton intuition est une boussole extraordinaire. Tu inspires sans effort, tu touches les âmes sans les chercher.", challenge: "Gérer l'hypersensibilité et ne pas être submergé·e par les énergies des autres. Apprendre à t'ancrer dans le concret.", famous: ['Bill Clinton', 'Edgar Allan Poe', 'Wolfgang A. Mozart'], traits: ['Intuitif·ve', 'Idéaliste', 'Inspirant·e', 'Parfois hypersensible'], master: true },
  22: { name: 'Le Grand Bâtisseur', emoji: '🏛️', description: "Nombre maître : tu as la capacité de transformer les grandes idées en réalisations concrètes et durables. Ta vision est monumentale — tu construis pour les générations futures.", strength: "Tu combines la vision du 11 et la rigueur du 4 : tu rêves grand ET tu sais comment construire. Combinaison la plus puissante de la numérologie.", challenge: "La pression de ta propre ambition peut devenir écrasante. Apprendre à avancer par étapes.", famous: ['Dalí', 'Bill Gates', 'Frank Lloyd Wright'], traits: ['Visionnaire', 'Pragmatique', 'Ambitieux·se', 'Parfois perfectionniste'], master: true },
  33: { name: 'Le Maître Enseignant', emoji: '🕯️', description: "Nombre maître rare : tu incarnes l'amour et la sagesse dans leur forme la plus pure. Un don à partager. Ta vie est souvent consacrée à élever les autres.", strength: "Ta capacité à enseigner, guérir et inspirer transcende les frontières. Quand tu parles, les gens changent.", challenge: "Porter le fardeau du maître sans t'oublier toi-même. La générosité totale sans limites mène à l'épuisement.", famous: ['Amma', 'Thich Nhat Hanh', 'Albert Schweitzer'], traits: ['Altruiste', 'Sage', 'Inspirant·e', "Parfois trop exigeant·e envers soi-même"], master: true },
};

const PYTHAGOREAN_TABLE = {
  A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
  J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
  S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
};

// ── SAISONS ────────────────────────────────────────────────────────────────────
const SEASONS_NORTH = {
  0: { name: 'Hiver',    emoji: '❄️',  color: '#38d9f5', desc: 'Tu es né·e sous le signe du silence et de l\'intériorité. L\'hiver est la saison des grandes pensées, des feux de cheminée et des rêves qui germent dans le froid.' },
  1: { name: 'Printemps',emoji: '🌸',  color: '#3fffaa', desc: 'Tu es né·e avec le renouveau. Le printemps est la saison de l\'élan, des premiers bourgeons et de l\'énergie qui explose après un long repos.' },
  2: { name: 'Été',      emoji: '☀️',  color: '#f5c842', desc: 'Tu es né·e dans la plénitude de l\'année. L\'été est la saison de la lumière, de la vie à son apogée, des journées sans fin et de l\'insouciance.' },
  3: { name: 'Automne',  emoji: '🍂',  color: '#ff9f1c', desc: 'Tu es né·e dans la splendeur de la métamorphose. L\'automne est la saison de la maturité, des couleurs flamboyantes et de la sagesse qui vient avec le temps.' },
};

// month: 0-11, day: 1-31
function getSeasonNorth(month, day) {
  // Printemps : 21 mars (mois 2) – 20 juin (mois 5)
  if (month === 2 && day >= 21) return 1;
  if (month > 2 && month < 5) return 1;
  if (month === 5 && day <= 20) return 1;
  // Été : 21 juin (mois 5) – 22 septembre (mois 8)
  if (month === 5 && day >= 21) return 2;
  if (month > 5 && month < 8) return 2;
  if (month === 8 && day <= 22) return 2;
  // Automne : 23 septembre (mois 8) – 20 décembre (mois 11)
  if (month === 8 && day >= 23) return 3;
  if (month > 8 && month < 11) return 3;
  if (month === 11 && day <= 20) return 3;
  // Hiver : reste
  return 0;
}

// ── JOURS DE LA SEMAINE ────────────────────────────────────────────────────────
const WEEKDAYS = [
  { name: 'Dimanche', emoji: '☀️', fr: 'un dimanche', color: '#f5c842',  desc: 'Le jour du soleil — tu es né·e pour rayonner et illuminer ceux qui t\'entourent.' },
  { name: 'Lundi',    emoji: '🌙', fr: 'un lundi',    color: '#38d9f5',  desc: 'Le jour de la lune — intuition, cycles et une sensibilité émotionnelle hors du commun.' },
  { name: 'Mardi',    emoji: '🔥', fr: 'un mardi',    color: '#ff4eb8',  desc: 'Le jour de Mars — énergie, courage et une volonté de fer pour surmonter tous les obstacles.' },
  { name: 'Mercredi', emoji: '💨', fr: 'un mercredi', color: '#9b59ff',  desc: 'Le jour de Mercure — communication, agilité d\'esprit et une curiosité qui ne s\'éteint jamais.' },
  { name: 'Jeudi',    emoji: '⚡', fr: 'un jeudi',    color: '#3fffaa',  desc: 'Le jour de Jupiter — expansion, chance et un optimisme naturel qui attire les opportunités.' },
  { name: 'Vendredi', emoji: '💚', fr: 'un vendredi', color: '#ff9f1c',  desc: 'Le jour de Vénus — beauté, harmonie et une capacité innée à créer des liens profonds.' },
  { name: 'Samedi',   emoji: '🪐', fr: 'un samedi',   color: '#c459ff',  desc: 'Le jour de Saturne — discipline, persévérance et une ambition qui construit des choses durables.' },
];

// ── ÉVÉNEMENTS HISTORIQUES ─────────────────────────────────────────────────────
const HISTORICAL_EVENTS = [
  // Janvier
  { month: 0, day: 1,  year: 1801, title: 'Unification de l\'Italie du Royaume de Naples', description: 'Le traité de Naples marque une étape vers l\'unification italienne.', category: 'history' },
  { month: 0, day: 1,  year: 1993, title: 'Naissance de la République tchèque et de la Slovaquie', description: 'La Tchécoslovaquie se sépare pacifiquement en deux États souverains — la "Révolution de velours".',  category: 'history' },
  { month: 0, day: 6,  year: 1412, title: 'Naissance de Jeanne d\'Arc', description: 'Jeanne d\'Arc naît à Domrémy. Elle deviendra l\'héroïne nationale française, menant l\'armée royale contre les Anglais pendant la guerre de Cent Ans.', category: 'history' },
  { month: 0, day: 8,  year: 1815, title: 'Bataille de La Nouvelle-Orléans', description: 'Dernière grande bataille de la Guerre de 1812 — les Américains repoussent les Britanniques.', category: 'history' },
  { month: 0, day: 10, year: 1863, title: 'Ouverture du métro de Londres', description: 'Le Metropolitan Railway inaugure le premier chemin de fer souterrain du monde, révolutionnant les transports urbains.', category: 'science' },
  { month: 0, day: 14, year: 1954, title: 'Mariage de Joe DiMaggio et Marilyn Monroe', description: 'Le champion de baseball et l\'icône du cinéma se marient à San Francisco dans une union qui fera les manchettes mondiales.', category: 'culture' },
  { month: 0, day: 17, year: 1706, title: 'Naissance de Benjamin Franklin', description: 'Père fondateur américain, inventeur du paratonnerre et du bifocal, Benjamin Franklin incarne l\'idéal des Lumières.', category: 'science' },
  { month: 0, day: 20, year: 1961, title: 'Investiture de John F. Kennedy', description: 'Le plus jeune président élu des États-Unis prononce son discours historique : "Ne demandez pas ce que votre pays peut faire pour vous…"', category: 'politics' },
  { month: 0, day: 22, year: 1973, title: 'Arrêt Roe v. Wade', description: 'La Cour Suprême américaine reconnaît le droit à l\'avortement, décision qui restera au cœur des débats politiques pendant des décennies.', category: 'politics' },
  { month: 0, day: 25, year: 1945, title: 'Libération des survivants d\'Auschwitz', description: 'L\'Armée rouge libère le camp d\'extermination d\'Auschwitz-Birkenau, révélant au monde l\'ampleur de la Shoah.', category: 'history' },
  { month: 0, day: 27, year: 1756, title: 'Naissance de Mozart', description: 'Wolfgang Amadeus Mozart naît à Salzbourg. Enfant prodige, il composera plus de 600 œuvres qui resteront des piliers de la musique classique.', category: 'art' },
  { month: 0, day: 28, year: 1986, title: 'Catastrophe de la navette Challenger', description: 'La navette spatiale Challenger explose 73 secondes après son décollage, causant la mort de sept astronautes et marquant un tournant dans la conquête spatiale.', category: 'science' },

  // Février
  { month: 1, day: 2,  year: 1848, title: 'Traité de Guadalupe Hidalgo', description: 'Le Mexique cède d\'immenses territoires aux États-Unis, redessinant la carte de l\'Amérique du Nord.', category: 'history' },
  { month: 1, day: 3,  year: 1959, title: 'Le "Jour où la musique est morte"', description: 'Buddy Holly, Ritchie Valens et The Big Bopper meurent dans un crash d\'avion au-dessus de l\'Iowa.', category: 'art' },
  { month: 1, day: 5,  year: 1974, title: 'Patty Hearst est kidnappée', description: 'L\'héritière de la presse américaine est enlevée par l\'Armée Symbionaise de Libération, déclenchant une affaire qui fascine le monde.', category: 'history' },
  { month: 1, day: 7,  year: 1964, title: 'Les Beatles débarquent en Amérique', description: 'John, Paul, George et Ringo atterrissent à New York, déclenchant la "Beatlemania" et une révolution culturelle sans précédent.', category: 'art' },
  { month: 1, day: 10, year: 2010, title: 'Naissance de l\'iPad', description: 'Apple présente l\'iPad, révolutionnant notre rapport aux écrans tactiles et transformant les usages numériques du quotidien.', category: 'science' },
  { month: 1, day: 11, year: 1990, title: 'Libération de Nelson Mandela', description: 'Après 27 ans d\'emprisonnement, Nelson Mandela sort de la prison Victor Verster, ouvrant la voie à la fin de l\'apartheid en Afrique du Sud.', category: 'politics' },
  { month: 1, day: 14, year: 270,  title: 'Saint Valentin, patron des amoureux', description: 'Valentin de Terni est martyrisé à Rome. Sa légende de protecteur des amoureux traversera les siècles pour devenir la fête universelle du 14 février.', category: 'culture' },
  { month: 1, day: 15, year: 1564, title: 'Naissance de Galilée', description: 'Galileo Galilei naît à Pise. Son soutien du modèle héliocentrique le mènera devant l\'Inquisition, mais il aura changé à jamais notre vision de l\'univers.', category: 'science' },
  { month: 1, day: 19, year: 1473, title: 'Naissance de Copernic', description: 'Nicolas Copernic naît en Prusse royale. Il démontrera que la Terre tourne autour du Soleil — révolution scientifique fondatrice.', category: 'science' },
  { month: 1, day: 24, year: 1582, title: 'Réforme du calendrier grégorien', description: 'Le pape Grégoire XIII annonce le futur calendrier grégorien, qui remplacera le calendrier julien et est encore utilisé aujourd\'hui.', category: 'history' },
  { month: 1, day: 28, year: 1953, title: 'Découverte de la structure de l\'ADN', description: 'Watson et Crick annoncent qu\'ils ont découvert la structure en double hélice de l\'ADN, l\'une des plus grandes découvertes scientifiques du XXe siècle.', category: 'science' },

  // Mars
  { month: 2, day: 3,  year: 1847, title: 'Naissance de Alexander Graham Bell', description: 'Inventeur du téléphone, Bell transformera les communications humaines à l\'échelle mondiale.', category: 'science' },
  { month: 2, day: 5,  year: 1953, title: 'Mort de Staline', description: 'Joseph Staline, dirigeant soviétique pendant près de 30 ans, décède à Moscou. Sa mort marque la fin d\'une ère de terreur et ouvre une période de déstalinisation.', category: 'history' },
  { month: 2, day: 8,  year: 1917, title: 'Révolution de Février en Russie', description: 'Des manifestations à Petrograd déclenchent la révolution qui renversera le tsar Nicolas II et ouvrira la voie à la révolution bolchévique.', category: 'history' },
  { month: 2, day: 14, year: 1879, title: 'Naissance d\'Albert Einstein', description: 'Albert Einstein naît à Ulm en Allemagne. Sa théorie de la relativité révolutionnera la physique et notre compréhension du temps, de l\'espace et de la matière.', category: 'science' },
  { month: 2, day: 15, year: 44,   title: 'Assassinat de Jules César', description: 'Julius Caesar est poignardé aux pieds de la statue de Pompée au Sénat romain. "Et tu, Bruté ?" — la trahison la plus célèbre de l\'Antiquité.', category: 'history' },
  { month: 2, day: 18, year: 1871, title: 'Proclamation de la Commune de Paris', description: 'Les Parisiens insurgés proclament la Commune, première expérience de gouvernement ouvrier, qui durera 72 jours avant d\'être écrasée dans le sang.', category: 'history' },
  { month: 2, day: 20, year: 1413, title: 'Avènement d\'Henri V d\'Angleterre', description: 'Henri V monte sur le trône d\'Angleterre. Il mènera la célèbre victoire d\'Azincourt contre les Français en 1415.', category: 'history' },
  { month: 2, day: 25, year: 1807, title: 'Abolition de la traite des esclaves dans l\'Empire britannique', description: 'Le Parlement britannique vote l\'abolition de la traite transatlantique des esclaves, première grande victoire du mouvement abolitionniste.', category: 'politics' },
  { month: 2, day: 25, year: 1957, title: 'Signature du Traité de Rome', description: 'Six nations européennes signent le traité fondateur de la Communauté économique européenne, première pierre de ce qui deviendra l\'Union européenne.', category: 'politics' },
  { month: 2, day: 28, year: 1979, title: 'Accident nucléaire de Three Mile Island', description: 'La fusion partielle d\'un réacteur en Pennsylvanie provoque la plus grave catastrophe nucléaire civile des États-Unis et remet en question le nucléaire civil.', category: 'science' },

  // Avril
  { month: 3, day: 3,  year: 1948, title: 'Plan Marshall signé par Truman', description: 'Le président Truman signe l\'European Recovery Program, permettant à l\'Europe occidentale de se reconstruire après la Seconde Guerre mondiale.', category: 'politics' },
  { month: 3, day: 6,  year: 1896, title: 'Premiers Jeux Olympiques modernes', description: 'Les Jeux Olympiques modernes s\'ouvrent à Athènes, à l\'initiative de Pierre de Coubertin, réunissant 241 athlètes de 14 nations.', category: 'sport' },
  { month: 3, day: 10, year: 1912, title: 'Départ du Titanic de Southampton', description: 'Le RMS Titanic, présenté comme insubmersible, quitte le port de Southampton pour son voyage inaugural… et fatal vers New York.', category: 'history' },
  { month: 3, day: 12, year: 1961, title: 'Premier vol habité dans l\'espace', description: 'Youri Gagarine, cosmonaute soviétique, devient le premier être humain à voyager dans l\'espace à bord de Vostok 1. Il effectue une orbite complète en 108 minutes.', category: 'science' },
  { month: 3, day: 14, year: 1912, title: 'Naufrage du Titanic', description: 'Le Titanic percute un iceberg dans l\'Atlantique Nord. Le naufrage causera la mort de plus de 1 500 personnes et restera l\'une des plus grandes catastrophes maritimes.', category: 'history' },
  { month: 3, day: 15, year: 1452, title: 'Naissance de Léonard de Vinci', description: 'Léonard de Vinci naît près de Vinci, en Toscane. Peintre, sculpteur, architecte, ingénieur et savant, il incarne le génie universel de la Renaissance.', category: 'art' },
  { month: 3, day: 22, year: 1970, title: 'Premier Jour de la Terre', description: 'Vingt millions d\'Américains descendent dans la rue pour la première Journée de la Terre, donnant naissance au mouvement environnemental moderne.', category: 'history' },
  { month: 3, day: 23, year: 1616, title: 'Mort de Shakespeare et Cervantes', description: 'William Shakespeare et Miguel de Cervantes meurent le même jour — ou presque — les deux plus grands écrivains de leur époque disparaissant quasi simultanément.', category: 'art' },
  { month: 3, day: 26, year: 1937, title: 'Bombardement de Guernica', description: 'L\'aviation nazie bombarde la ville basque de Guernica lors de la Guerre civile espagnole. Picasso immortalisera ce crime de guerre dans un tableau iconique.', category: 'history' },
  { month: 3, day: 30, year: 1789, title: 'Première investiture de George Washington', description: 'George Washington prête serment comme premier président des États-Unis à New York, posant les bases de la République américaine.', category: 'politics' },

  // Mai
  { month: 4, day: 3,  year: 1469, title: 'Naissance de Machiavel', description: 'Nicolas Machiavel naît à Florence. Son œuvre "Le Prince" fondera la science politique moderne et fera de son nom un synonyme de ruse politique.', category: 'history' },
  { month: 4, day: 5,  year: 1821, title: 'Mort de Napoléon Bonaparte', description: 'Napoléon Ier meurt en exil sur l\'île de Sainte-Hélène. Son legs — le Code civil, la réorganisation de l\'Europe — façonne encore notre monde.', category: 'history' },
  { month: 4, day: 8,  year: 1945, title: 'Victoire en Europe — Fin de la Seconde Guerre mondiale', description: 'L\'Allemagne nazie capitule sans conditions. Le 8 mai 1945 marque la fin de la Seconde Guerre mondiale en Europe et reste jour de fête nationale en France.', category: 'history' },
  { month: 4, day: 10, year: 1994, title: 'Inauguration de Nelson Mandela', description: 'Nelson Mandela devient le premier président noir d\'Afrique du Sud, clôturant des décennies d\'apartheid dans une émotion planétaire.', category: 'politics' },
  { month: 4, day: 13, year: 1958, title: 'Coup d\'État du 13 mai en Algérie', description: 'Des généraux et colons français insurrectionnels prennent le pouvoir à Alger, précipitant le retour de De Gaulle et la naissance de la Ve République.', category: 'history' },
  { month: 4, day: 18, year: 1974, title: 'Première bombe atomique indienne', description: 'L\'Inde procède à son premier essai nucléaire, baptisé "Bouddha souriant", devenant la sixième puissance nucléaire mondiale.', category: 'science' },
  { month: 4, day: 22, year: 1455, title: 'Première Bible imprimée par Gutenberg', description: 'Johannes Gutenberg achève l\'impression de la première Bible avec des caractères mobiles, révolution qui va démocratiser l\'accès au savoir.', category: 'discovery' },
  { month: 4, day: 29, year: 1968, title: 'Nuit des barricades — Mai 68', description: 'La nuit du 10 au 11 mai, étudiants et ouvriers dressent des barricades dans le Quartier Latin à Paris. Mai 68 entre dans la légende et transforme la société française.', category: 'history' },
  { month: 4, day: 31, year: 1902, title: 'Ouverture du musée du Louvre comme musée public', description: 'Fondé sous la Révolution, le Louvre s\'impose comme le plus grand musée du monde et le premier lieu touristique mondial.', category: 'art' },

  // Juin
  { month: 5, day: 4,  year: 1989, title: 'Massacre de Tiananmen', description: 'L\'armée chinoise réprime violemment les manifestations pro-démocratie sur la place Tiananmen à Pékin. La photo du "Homme de Tiananmen" devient symbole universel de résistance.', category: 'history' },
  { month: 5, day: 6,  year: 1944, title: 'Débarquement de Normandie — Jour J', description: 'Les forces alliées débarquent sur les plages normandes dans la plus grande opération militaire amphibie de l\'histoire, ouvrant un second front contre l\'Allemagne nazie.', category: 'history' },
  { month: 5, day: 8,  year: 1949, title: 'Publication de "1984" de George Orwell', description: 'George Orwell publie son roman dystopique, inventant les notions de Big Brother, de novlangue et de doublepensée qui marqueront la littérature et le langage politique.', category: 'art' },
  { month: 5, day: 12, year: 1987, title: 'Reagan à Berlin : "Abattez ce mur !"', description: 'Le président Reagan prononce son discours historique devant la Porte de Brandebourg, exhortant Gorbatchev à démanteler le Mur de Berlin.', category: 'politics' },
  { month: 5, day: 14, year: 1940, title: 'Capitulation des Pays-Bas devant l\'Allemagne', description: 'Après le bombardement de Rotterdam, les Pays-Bas capitulent face à l\'Allemagne nazie, laissant la France seule face à l\'invasion.', category: 'history' },
  { month: 5, day: 16, year: 1963, title: 'Valentina Terechkova, première femme dans l\'espace', description: 'La cosmonaute soviétique Valentina Terechkova orbite autour de la Terre 48 fois à bord de Vostok 6, devenant la première femme à voyager dans l\'espace.', category: 'science' },
  { month: 5, day: 18, year: 1815, title: 'Bataille de Waterloo', description: 'Napoléon Bonaparte subit sa défaite décisive face aux armées coalisées menées par Wellington et Blücher, mettant fin définitivement à l\'Empire napoléonien.', category: 'history' },
  { month: 5, day: 21, year: 1905, title: 'Einstein publie la théorie de la relativité restreinte', description: 'Albert Einstein soumet son article "Zur Elektrodynamik bewegter Körper" (De l\'électrodynamique des corps en mouvement) — E=mc² va changer le monde.', category: 'science' },
  { month: 5, day: 25, year: 1963, title: 'Fondation de l\'Organisation de l\'Unité africaine', description: 'Trente-deux nations africaines fondent l\'OUA au Caire, premier grand pas vers l\'unité du continent africain.', category: 'politics' },
  { month: 5, day: 28, year: 1914, title: 'Assassinat de François-Ferdinand à Sarajevo', description: 'L\'archiduc héritier d\'Autriche est assassiné par Gavrilo Princip. Cet acte déclenche la Première Guerre mondiale qui fera 17 millions de morts.', category: 'history' },

  // Juillet
  { month: 6, day: 2,  year: 1964, title: 'Loi sur les droits civiques aux États-Unis', description: 'Le président Johnson signe le Civil Rights Act, mettant fin à la ségrégation légale et aux discriminations raciales aux États-Unis.', category: 'politics' },
  { month: 6, day: 4,  year: 1776, title: 'Déclaration d\'Indépendance américaine', description: 'Les treize colonies américaines proclament leur indépendance vis-à-vis de la Grande-Bretagne. "Nous tenons ces vérités pour évidentes…" — naissance des États-Unis.', category: 'politics' },
  { month: 6, day: 7,  year: 1930, title: 'Naissance de Arthur Conan Doyle', description: 'Le créateur de Sherlock Holmes s\'éteint, laissant derrière lui l\'un des personnages de fiction les plus célèbres de l\'histoire de la littérature.', category: 'art' },
  { month: 6, day: 9,  year: 1868, title: 'Ratification du 14e amendement américain', description: 'L\'amendement accordant la citoyenneté aux anciens esclaves est ratifié, pierre angulaire de l\'égalité civique américaine.', category: 'politics' },
  { month: 6, day: 14, year: 1789, title: 'Prise de la Bastille', description: 'Le peuple de Paris prend d\'assaut la forteresse-prison de la Bastille, libérant ses prisonniers. Ce geste symbolique marque le début de la Révolution française et reste la fête nationale française.', category: 'history' },
  { month: 6, day: 16, year: 1969, title: 'Lancement d\'Apollo 11', description: 'La fusée Saturn V décolle de Cap Canaveral avec Neil Armstrong, Buzz Aldrin et Michael Collins à son bord, en route pour la Lune.', category: 'science' },
  { month: 6, day: 18, year: 1969, title: 'Festival de Woodstock annoncé', description: 'L\'affiche du festival de Woodstock est dévoilée, annonçant trois jours de paix, d\'amour et de musique qui deviendront le symbole d\'une génération.', category: 'art' },
  { month: 6, day: 20, year: 1969, title: 'Premier pas sur la Lune', description: 'Neil Armstrong pose le pied sur la Lune à 02h56 UTC. "C\'est un petit pas pour l\'Homme, mais un bond de géant pour l\'Humanité." 600 millions de téléspectateurs regardent en direct.', category: 'science' },
  { month: 6, day: 22, year: 1940, title: 'Armistice franco-allemand', description: 'La France signe l\'armistice avec l\'Allemagne nazie dans le wagon de Rethondes. La France est coupée en deux : zone occupée et zone libre.', category: 'history' },
  { month: 6, day: 28, year: 1919, title: 'Signature du Traité de Versailles', description: 'Le Traité de Versailles met officiellement fin à la Première Guerre mondiale. Ses conditions humiliantes pour l\'Allemagne contribueront à l\'essor du nazisme.', category: 'history' },

  // Août
  { month: 7, day: 1,  year: 1944, title: 'Anne Frank écrit sa dernière entrée de journal', description: 'Anne Frank écrit sa dernière entrée dans son journal avant d\'être découverte par les Nazis et déportée. Son journal deviendra l\'un des témoignages les plus bouleversants de la Shoah.', category: 'history' },
  { month: 7, day: 4,  year: 1914, title: 'La Grande-Bretagne entre dans la Première Guerre mondiale', description: 'L\'Allemagne envahissant la Belgique neutre, la Grande-Bretagne lui déclare la guerre, transformant un conflit européen en guerre mondiale.', category: 'history' },
  { month: 7, day: 6,  year: 1945, title: 'Bombe atomique sur Hiroshima', description: 'Le B-29 Enola Gay lâche "Little Boy" sur Hiroshima. 70 000 personnes meurent instantanément, ouvrant l\'ère nucléaire et précipitant la fin de la Seconde Guerre mondiale.', category: 'history' },
  { month: 7, day: 13, year: 1961, title: 'Début de la construction du Mur de Berlin', description: 'La RDA commence à ériger le "mur de la honte" qui divisera Berlin pendant 28 ans, symbole de la Guerre Froide et de la division de l\'Europe.', category: 'history' },
  { month: 7, day: 15, year: 1769, title: 'Naissance de Napoléon Bonaparte', description: 'Napoléon Bonaparte naît à Ajaccio, en Corse, quelques semaines après le rattachement de l\'île à la France. Il deviendra Consul puis Empereur des Français.', category: 'history' },
  { month: 7, day: 18, year: 1920, title: 'Ratification du 19e amendement — Droit de vote des femmes', description: 'Les États-Unis accordent le droit de vote aux femmes après des décennies de lutte suffragiste, victoire majeure pour l\'égalité des droits.', category: 'politics' },
  { month: 7, day: 24, year: 79,   title: 'Éruption du Vésuve — Destruction de Pompéi', description: 'Le Vésuve entre en éruption, ensevelissant les villes de Pompéi et Herculanum sous les cendres. Ce désastre préservera intactes ces cités romaines pendant 1700 ans.', category: 'history' },
  { month: 7, day: 26, year: 1920, title: 'Naissance de la femme moderne — Coco Chanel lance le N°5', description: 'Coco Chanel présente son légendaire parfum N°5, révolutionnant la parfumerie et la mode féminine. Il restera le parfum le plus vendu au monde.', category: 'art' },
  { month: 7, day: 28, year: 1963, title: 'Discours "I Have a Dream" de Martin Luther King', description: 'Devant 250 000 personnes à Washington, Martin Luther King prononce son discours historique pour l\'égalité raciale — l\'un des plus importants de l\'histoire américaine.', category: 'politics' },

  // Septembre
  { month: 8, day: 1,  year: 1939, title: 'Invasion de la Pologne — Début de la Seconde Guerre mondiale', description: 'L\'Allemagne nazie envahit la Pologne à l\'aube. La France et la Grande-Bretagne déclarent la guerre deux jours plus tard, déclenchant le conflit le plus meurtrier de l\'histoire.', category: 'history' },
  { month: 8, day: 3,  year: 1967, title: 'La Suède passe à la conduite à droite', description: 'La Suède change brutalement du côté gauche au côté droit de la route, opération logistique titanesque surnommée "Dagen H".', category: 'history' },
  { month: 8, day: 7,  year: 1533, title: 'Naissance d\'Élisabeth Ière d\'Angleterre', description: 'Élisabeth Ière naît au palais de Greenwich. Son règne de 44 ans sera l\'un des plus glorieux de l\'histoire anglaise — l\'ère élisabéthaine.', category: 'history' },
  { month: 8, day: 11, year: 2001, title: 'Attentats du 11 Septembre', description: 'Dix-neuf terroristes détournent quatre avions et frappent les Tours Jumelles et le Pentagone. 2 977 victimes. Le monde bascule dans une nouvelle ère géopolitique.', category: 'history' },
  { month: 8, day: 12, year: 1977, title: 'Premier vol du Space Shuttle Enterprise', description: 'La navette spatiale Enterprise effectue son premier vol d\'essai atmosphérique, ouvrant la voie au programme de navettes spatiales américaines.', category: 'science' },
  { month: 8, day: 15, year: 1947, title: 'Indépendance de l\'Inde', description: 'L\'Inde proclame son indépendance vis-à-vis de la Grande-Bretagne après des décennies de lutte portée par Gandhi. Jawaharlal Nehru devient le premier Premier ministre.', category: 'politics' },
  { month: 8, day: 19, year: 1955, title: 'Le premier disque de Chuck Berry', description: 'Chuck Berry enregistre "Maybellene", qui deviendra l\'un des premiers grands succès du rock\'n\'roll et posera les bases d\'un genre musical révolutionnaire.', category: 'art' },
  { month: 8, day: 22, year: 1791, title: 'Révolte de Saint-Domingue', description: 'Les esclaves de Saint-Domingue (future Haïti) se soulèvent sous la direction de Toussaint Louverture, première révolte d\'esclaves réussie de l\'histoire moderne.', category: 'history' },
  { month: 8, day: 25, year: 1513, title: 'Vasco Núñez de Balboa aperçoit le Pacifique', description: 'Traversant l\'isthme de Panama, l\'explorateur espagnol devient le premier Européen à voir l\'océan Pacifique depuis les Amériques.', category: 'discovery' },

  // Octobre
  { month: 9, day: 2,  year: 1869, title: 'Naissance du Mahatma Gandhi', description: 'Mohandas Karamchand Gandhi naît à Porbandar. Il développera la philosophie de la résistance non-violente qui inspirera les mouvements de libération du monde entier.', category: 'history' },
  { month: 9, day: 4,  year: 1957, title: 'Lancement de Spoutnik', description: 'L\'URSS lance le premier satellite artificiel de l\'histoire, Spoutnik 1. Son bip radio, capté dans le monde entier, marque le début de la conquête spatiale.', category: 'science' },
  { month: 9, day: 12, year: 1492, title: 'Christophe Colomb découvre l\'Amérique', description: 'Les équipages de la Nina, la Pinta et la Santa Maria aperçoivent une île des Bahamas. Cette "découverte" va transformer à jamais le monde et ouvrir l\'ère des grandes explorations.', category: 'discovery' },
  { month: 9, day: 14, year: 1066, title: 'Bataille de Hastings', description: 'Guillaume le Conquérant bat le roi Harold II en Angleterre. La conquête normande transformera profondément la langue, la culture et les institutions anglaises.', category: 'history' },
  { month: 9, day: 17, year: 1905, title: 'Einstein publie E=mc²', description: 'Albert Einstein publie son équation de masse-énergie, fondement de la physique nucléaire et de toute la technologie du XXe siècle.', category: 'science' },
  { month: 9, day: 20, year: 1973, title: '"Bataille des sexes" : Billie Jean King bat Bobby Riggs', description: 'Billie Jean King écrase Bobby Riggs en tennis en trois sets devant 50 millions de téléspectateurs, victoire symbolique pour l\'égalité hommes-femmes dans le sport.', category: 'sport' },
  { month: 9, day: 24, year: 1648, title: 'Traités de Westphalie', description: 'Ces traités mettent fin à la Guerre de Trente Ans et posent les bases du droit international moderne et du système des États-nations.', category: 'history' },
  { month: 9, day: 28, year: 1929, title: 'Jeudi Noir — Krach de Wall Street', description: 'L\'effondrement de la Bourse de New York déclenche la Grande Dépression, crise économique mondiale qui durera une décennie et favorisera la montée des fascismes.', category: 'history' },
  { month: 9, day: 31, year: 1517, title: 'Luther affiche ses 95 thèses', description: 'Martin Luther cloue ses 95 thèses sur la porte de l\'église de Wittenberg, acte fondateur de la Réforme protestante qui fracturera durablement la chrétienté.', category: 'history' },

  // Novembre
  { month: 10, day: 3, year: 1957, title: 'Laïka, premier être vivant dans l\'espace', description: 'La chienne soviétique Laïka est lancée dans l\'espace à bord de Spoutnik 2. Elle devient le premier être vivant à orbiter autour de la Terre.', category: 'science' },
  { month: 10, day: 7, year: 1867, title: 'Naissance de Marie Curie', description: 'Maria Sklodowska naît à Varsovie. Elle sera la première femme prix Nobel, et la seule à en avoir remporté deux (Physique 1903, Chimie 1911), découvrant le polonium et le radium.', category: 'science' },
  { month: 10, day: 9, year: 1989, title: 'Chute du Mur de Berlin', description: 'Le gouvernement est-allemand annonce l\'ouverture des frontières. Des foules en liesse commencent à abattre le Mur de Berlin, mettant fin symboliquement à la Guerre Froide.', category: 'history' },
  { month: 10, day: 11, year: 1918, title: 'Armistice de la Première Guerre mondiale', description: 'À 11h le 11 novembre 1918, les canons se taisent sur le front occidental. La Grande Guerre, qui a fait 18 millions de morts, prend fin. C\'est l\'armistice.', category: 'history' },
  { month: 10, day: 14, year: 1851, title: 'Publication de Moby Dick', description: 'Herman Melville publie son chef-d\'œuvre, l\'odyssée du capitaine Achab à la poursuite de la baleine blanche — roman qui sera reconnu comme l\'un des plus grands de la littérature américaine.', category: 'art' },
  { month: 10, day: 17, year: 1958, title: 'Naissance de la Ve République française', description: 'Après le retour au pouvoir du général de Gaulle, une nouvelle constitution est approuvée par référendum, fondant la Ve République qui régit toujours la France.', category: 'politics' },
  { month: 10, day: 19, year: 1969, title: 'Premier message sur Internet (ARPANET)', description: 'Le premier message est envoyé sur ARPANET, ancêtre d\'Internet. Le mot "login" est transmis mais le système plante après les deux premières lettres — "lo". Internet est né.', category: 'science' },
  { month: 10, day: 22, year: 1963, title: 'Assassinat de John F. Kennedy', description: 'Le président américain est assassiné à Dallas dans sa limousine présidentielle. Sa mort traumatisera une génération entière et nourrit encore des décennies de théories.', category: 'history' },
  { month: 10, day: 28, year: 1889, title: 'Inauguration de la Tour Eiffel', description: 'Gustave Eiffel inaugure sa tour métallique, symbole universel de Paris, construite pour l\'Exposition universelle de 1889 et décriée par les artistes à l\'époque.', category: 'art' },

  // Décembre
  { month: 11, day: 1,  year: 1955, title: 'Rosa Parks refuse de céder sa place dans le bus', description: 'Rosa Parks, couturière afro-américaine, refuse de laisser sa place à un passager blanc dans un bus de Montgomery, Alabama. Son arrestation déclenche le boycott des bus et galvanise le mouvement des droits civiques.', category: 'history' },
  { month: 11, day: 5,  year: 1492, title: 'Colomb découvre Hispaniola', description: 'Christophe Colomb débarque sur l\'île qu\'il nomme Hispaniola (aujourd\'hui Haïti et République dominicaine), poursuivant son exploration du Nouveau Monde.', category: 'discovery' },
  { month: 11, day: 10, year: 1948, title: 'Adoption de la Déclaration universelle des droits de l\'homme', description: 'L\'ONU adopte la Déclaration universelle des droits de l\'homme, texte fondateur du droit international humanitaire, rédigé sous l\'égide de René Cassin.', category: 'politics' },
  { month: 11, day: 12, year: 1913, title: 'Vol de la Joconde résolu', description: 'La Joconde, volée au Louvre en 1911 par Vincenzo Peruggia, est retrouvée à Florence. Ce vol avait contribué à faire de ce tableau l\'œuvre d\'art la plus célèbre du monde.', category: 'art' },
  { month: 11, day: 15, year: 1791, title: 'Adoption du Bill of Rights américain', description: 'Les dix premiers amendements à la Constitution des États-Unis sont ratifiés, garantissant les libertés fondamentales des citoyens américains.', category: 'politics' },
  { month: 11, day: 17, year: 1903, title: 'Premier vol des frères Wright', description: 'Orville et Wilbur Wright réussissent à Kitty Hawk le premier vol motorisé et contrôlé de l\'histoire. 12 secondes de vol qui vont transformer le monde.', category: 'science' },
  { month: 11, day: 21, year: 1898, title: 'Naissance de Marie Curie — Prix Nobel', description: 'Pierre et Marie Curie annoncent la découverte du radium, transformant la physique nucléaire naissante.', category: 'science' },
  { month: 11, day: 25, year: 1991, title: 'Dissolution officielle de l\'URSS', description: 'Mikhaïl Gorbatchev démissionne et le drapeau rouge est amené pour la dernière fois au Kremlin. L\'Union soviétique cesse d\'exister, fin de la Guerre Froide.', category: 'history' },
  { month: 11, day: 26, year: 1898, title: 'Découverte du radium par les Curie', description: 'Marie et Pierre Curie isolent le radium, ouvrant l\'ère de la radioactivité et de la physique nucléaire moderne.', category: 'science' },
  { month: 11, day: 31, year: 1999, title: 'Passage à l\'An 2000 — Le bug de l\'an 2000', description: 'Le monde retient son souffle pour le passage au troisième millénaire et le mythique "bug de l\'an 2000" qui ne causera finalement aucune catastrophe majeure.', category: 'history' },

  // Compléments pour meilleure couverture
  { month: 0, day: 9,  year: 2007, title: 'Steve Jobs présente l\'iPhone', description: 'Apple dévoile l\'iPhone lors de la Macworld. Ce smartphone va transformer notre façon de communiquer, travailler et consommer.', category: 'science' },
  { month: 0, day: 15, year: 2001, title: 'Lancement de Wikipédia', description: 'Jimmy Wales et Larry Sanger lancent Wikipédia, encyclopédie collaborative comptant aujourd\'hui des millions d\'articles en 300 langues.', category: 'science' },
  { month: 1, day: 12, year: 1809, title: 'Naissance de Darwin et Lincoln le même jour', description: 'Charles Darwin, qui révolutionnera l\'évolution, et Abraham Lincoln, qui abolira l\'esclavage, naissent le même jour.', category: 'history' },
  { month: 2, day: 12, year: 1989, title: 'Tim Berners-Lee propose le World Wide Web', description: 'L\'ingénieur du CERN soumet sa proposition pour un système hypertexte — le futur World Wide Web.', category: 'science' },
  { month: 3, day: 4,  year: 1968, title: 'Assassinat de Martin Luther King', description: 'Le leader des droits civiques est abattu à Memphis, déclenchant des émeutes dans plus de 100 villes.', category: 'politics' },
  { month: 3, day: 15, year: 2019, title: 'Incendie de Notre-Dame de Paris', description: 'Un incendie ravage la cathédrale, dévastant la flèche et la charpente médiévale. La reconstruction mobilise le monde.', category: 'art' },
  { month: 4, day: 25, year: 1977, title: 'Sortie de Star Wars', description: 'George Lucas révolutionne le cinéma de science-fiction avec "La Guerre des Étoiles", lançant une franchise culturelle mondiale.', category: 'art' },
  { month: 5, day: 21, year: 2004, title: 'Premier vol spatial privé (SpaceShipOne)', description: 'Le premier véhicule spatial privé atteint l\'espace, marquant le début de l\'ère du tourisme spatial.', category: 'science' },
  { month: 6, day: 7,  year: 1985, title: 'Live Aid — Concert mondial contre la famine', description: 'Bob Geldof organise le plus grand concert de charité de l\'histoire, retransmis à 1,5 milliard de téléspectateurs.', category: 'culture' },
  { month: 7, day: 9,  year: 1945, title: 'Bombe atomique sur Nagasaki', description: 'Une seconde bombe atomique frappe Nagasaki, précipitant la capitulation japonaise et la fin de la guerre du Pacifique.', category: 'history' },
  { month: 7, day: 24, year: 2006, title: 'Pluton rétrogradée en planète naine', description: 'L\'Union Astronomique Internationale retire à Pluton son statut de planète, bouleversant des générations.', category: 'science' },
  { month: 8, day: 5,  year: 1977, title: 'Lancement de Voyager 1', description: 'La sonde Voyager 1 est lancée. Elle atteindra l\'espace interstellaire en 2012, objet humain le plus loin de la Terre.', category: 'science' },
  { month: 9, day: 28, year: 2008, title: 'Première mise en route du LHC au CERN', description: 'Le Grand collisionneur de hadrons, plus grande machine jamais construite, est activé pour la première fois.', category: 'science' },
  { month: 10, day: 4, year: 2008, title: 'Élection de Barack Obama', description: 'Barack Obama devient le premier président afro-américain des États-Unis, mobilisant une vague historique d\'espoir.', category: 'politics' },
  { month: 11, day: 25, year: 1990, title: 'Premier SMS de l\'histoire', description: 'Le tout premier SMS est envoyé : "Merry Christmas". La messagerie texte changera pour toujours la communication humaine.', category: 'science' },
];
