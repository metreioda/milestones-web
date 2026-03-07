// ── ASTROLOGIE ────────────────────────────────────────────────────────────────
function getZodiacSign(month, day) {
  const d = month * 100 + day;
  if (d >= 1222 || d <= 119) return { name: 'Capricorne', emoji: '♑' };
  if (d >= 120  && d <= 218) return { name: 'Verseau',    emoji: '♒' };
  if (d >= 219  && d <= 320) return { name: 'Poissons',   emoji: '♓' };
  if (d >= 321  && d <= 419) return { name: 'Bélier',     emoji: '♈' };
  if (d >= 420  && d <= 520) return { name: 'Taureau',    emoji: '♉' };
  if (d >= 521  && d <= 620) return { name: 'Gémeaux',    emoji: '♊' };
  if (d >= 621  && d <= 722) return { name: 'Cancer',     emoji: '♋' };
  if (d >= 723  && d <= 822) return { name: 'Lion',       emoji: '♌' };
  if (d >= 823  && d <= 922) return { name: 'Vierge',     emoji: '♍' };
  if (d >= 923  && d <= 1022) return { name: 'Balance',   emoji: '♎' };
  if (d >= 1023 && d <= 1121) return { name: 'Scorpion',  emoji: '♏' };
  return { name: 'Sagittaire', emoji: '♐' };
}

function getMoonPhase(date) {
  const REF_NEW_MOON = new Date('2000-01-06T18:14:00Z');
  const CYCLE = 29.530589;
  const diffDays = (date - REF_NEW_MOON) / 864e5;
  let phase = ((diffDays % CYCLE) + CYCLE) % CYCLE;
  const moonSigns = [
    { name: 'Bélier', emoji: '♈' }, { name: 'Taureau', emoji: '♉' },
    { name: 'Gémeaux', emoji: '♊' }, { name: 'Cancer', emoji: '♋' },
    { name: 'Lion', emoji: '♌' }, { name: 'Vierge', emoji: '♍' },
    { name: 'Balance', emoji: '♎' }, { name: 'Scorpion', emoji: '♏' },
    { name: 'Sagittaire', emoji: '♐' }, { name: 'Capricorne', emoji: '♑' },
    { name: 'Verseau', emoji: '♒' }, { name: 'Poissons', emoji: '♓' },
  ];
  const phaseNames = [
    { max: 1.85,  name: 'Nouvelle Lune',             emoji: '🌑' },
    { max: 7.38,  name: 'Premier Croissant',          emoji: '🌒' },
    { max: 11.15, name: 'Premier Quartier',           emoji: '🌓' },
    { max: 14.77, name: 'Lune Gibbeuse Croissante',   emoji: '🌔' },
    { max: 16.61, name: 'Pleine Lune',                emoji: '🌕' },
    { max: 22.15, name: 'Lune Gibbeuse Décroissante', emoji: '🌖' },
    { max: 25.92, name: 'Dernier Quartier',           emoji: '🌗' },
    { max: 29.53, name: 'Dernier Croissant',          emoji: '🌘' },
  ];
  let phaseName = phaseNames[phaseNames.length - 1];
  for (const p of phaseNames) { if (phase < p.max) { phaseName = p; break; } }
  const signIdx = Math.floor(phase / (CYCLE / 12)) % 12;
  return { phase, phaseName: phaseName.name, phaseEmoji: phaseName.emoji, moonSign: moonSigns[signIdx] };
}

function getChineseZodiac(date) {
  const animals = [
    { name: 'Rat', emoji: '🐭' }, { name: 'Bœuf', emoji: '🐮' },
    { name: 'Tigre', emoji: '🐯' }, { name: 'Lapin', emoji: '🐰' },
    { name: 'Dragon', emoji: '🐲' }, { name: 'Serpent', emoji: '🐍' },
    { name: 'Cheval', emoji: '🐴' }, { name: 'Chèvre', emoji: '🐑' },
    { name: 'Singe', emoji: '🐵' }, { name: 'Coq', emoji: '🐓' },
    { name: 'Chien', emoji: '🐶' }, { name: 'Cochon', emoji: '🐷' },
  ];
  const elements = ['Bois', 'Bois', 'Feu', 'Feu', 'Terre', 'Terre', 'Métal', 'Métal', 'Eau', 'Eau'];
  let year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 1 || (month === 2 && day < 4)) year -= 1;
  const idx = ((year - 1900) % 12 + 12) % 12;
  const elemIdx = ((year - 1900) % 10 + 10) % 10;
  return { ...animals[idx], element: elements[elemIdx], year };
}

// ── CALENDRIERS ALTERNATIFS ───────────────────────────────────────────────────
function gregorianToJD(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function jdToHijri(jd) {
  const z = Math.floor(jd) - 1948438 + 32167;
  const era = Math.floor((30 * z + 29) / 10631);
  const remaining = z - Math.floor((10631 * era) / 30);
  const month = Math.min(12, Math.floor((11 * remaining + 330) / 325));
  const day = remaining - Math.floor((325 * month - 320) / 11);
  return {
    year: era, month, day,
    monthName: ['','Muharram','Safar','Rabi I','Rabi II','Joumada I','Joumada II','Rajab',"Sha'ban",'Ramadan','Chawwal','Dhou al-Qi\'da','Dhou al-Hijja'][month]
  };
}

function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  return r;
}

function gregorianToFrenchRevolutionary(year, month, day) {
  const MOIS = ['Vendémiaire','Brumaire','Frimaire','Nivôse','Pluviôse','Ventôse','Germinal','Floréal','Prairial','Messidor','Thermidor','Fructidor'];
  const JOURS_COMPL = ['Vertu','Génie','Travail','Opinion','Récompenses','Révolution'];
  const EPOCH_JD = 2375839.5;
  const jd = gregorianToJD(year, month, day);
  const elapsed = jd - EPOCH_JD;
  if (elapsed < 0) return { display: 'Avant la République', hypothetical: true };
  const an = Math.floor(elapsed / 365.24219) + 1;
  const jourDansAnnee = Math.floor(elapsed % 365.24219);
  if (jourDansAnnee >= 360) {
    const jc = jourDansAnnee - 360;
    return { display: `${JOURS_COMPL[jc] || 'J.C.'} An ${toRoman(an)}`, hypothetical: false };
  }
  const moisIdx = Math.floor(jourDansAnnee / 30);
  const jour = (jourDansAnnee % 30) + 1;
  return { display: `${jour} ${MOIS[moisIdx]} An ${toRoman(an)}`, hypothetical: false };
}

function gregorianToEthiopian(year, month, day) {
  const ETH_MONTHS = ['','Meskerem','Tikimt','Hidar','Tahsas','Tir','Yekatit','Megabit','Miazia','Ginbot','Sene','Hamle','Nehase','Pagumé'];
  const ETH_EPOCH = 1724220.5;
  const jd = gregorianToJD(year, month, day);
  const r = (jd - ETH_EPOCH) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const ethYear  = 4 * Math.floor((jd - ETH_EPOCH) / 1461) + Math.floor(r / 365) + 1;
  const ethMonth = Math.min(13, Math.floor(n / 30) + 1);
  const ethDay   = (n % 30) + 1;
  return { display: `${ethDay} ${ETH_MONTHS[ethMonth]} ${ethYear}` };
}

function gregorianToJalali(gy, gm, gd) {
  const MONTHS = ['','Farvardin','Ordibehesht','Khordad','Tir','Mordad','Shahrivar','Mehr','Aban','Azar','Dey','Bahman','Esfand'];
  function div(a, b) { return Math.floor(a / b); }
  const g_d_no = 365 * gy + div(gy + 3, 4) - div(gy + 99, 100) + div(gy + 399, 400);
  const gm_arr = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let d_no = g_d_no;
  for (let i = 1; i < gm; i++) d_no += gm_arr[i];
  if (gm > 2 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) d_no++;
  d_no += gd;
  const j_d_no = d_no - 79;
  const j_np = div(j_d_no - 1, 12053);
  let jdn = (j_d_no - 1) % 12053;
  let jy = 979 + 33 * j_np + 4 * div(jdn, 1461);
  jdn %= 1461;
  if (jdn >= 366) { jy += div(jdn - 1, 365); jdn = (jdn - 1) % 365; }
  const j_m_arr = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let jm = 0;
  for (; jm < 11 && jdn >= j_m_arr[jm]; jm++) jdn -= j_m_arr[jm];
  return { display: `${jdn + 1} ${MONTHS[jm + 1]} ${jy}` };
}

function gregorianToJulian(year, month, day) {
  const MONTHS_FR = ['','janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const jd = gregorianToJD(year, month, day);
  const z = Math.floor(jd + 0.5);
  const b = z + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const dd = Math.floor(365.25 * c);
  const e = Math.floor((b - dd) / 30.6001);
  const julianDay   = b - dd - Math.floor(30.6001 * e);
  const julianMonth = e < 14 ? e - 1 : e - 13;
  const julianYear  = julianMonth > 2 ? c - 4716 : c - 4715;
  return { display: `${julianDay} ${MONTHS_FR[julianMonth]} ${julianYear}` };
}

// ── NUMÉROLOGIE ───────────────────────────────────────────────────────────────
function reduceNumerology(n) {
  if (n === 11 || n === 22 || n === 33 || (n >= 1 && n <= 9)) return n;
  const sum = String(n).split('').reduce((acc, d) => acc + Number(d), 0);
  return reduceNumerology(sum);
}

function getLifePathNumber(date) {
  const digits = `${date.getDate()}${date.getMonth()+1}${date.getFullYear()}`.split('').map(Number);
  return reduceNumerology(digits.reduce((a, d) => a + d, 0));
}

function getExpressionNumber(firstName) {
  const normalized = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');
  if (!normalized.length) return null;
  const sum = normalized.split('').reduce((acc, l) => acc + (PYTHAGOREAN_TABLE[l] || 0), 0);
  return reduceNumerology(sum);
}

// ── PROFIL ASTRAL : GÉNÉRATION ────────────────────────────────────────────────
// Dépend de ZODIAC_TRAITS, MOON_TRAITS, CHINESE_TRAITS — définis dans data.js
function generateAstralDescription(zodiacName, moonSignName, chineseAnimal) {
  const z = ZODIAC_TRAITS[zodiacName];
  const mo = MOON_TRAITS[moonSignName];
  const ch = CHINESE_TRAITS[chineseAnimal];

  // Fallback si un signe n'est pas trouvé (ne devrait pas arriver)
  if (!z || !mo || !ch) return '<p>Les astres refusent de se prononcer pour le moment.</p>';

  const sentences = [
    `En apparence, tu es <em>${z.core}</em> — avec <em>${z.shadow}</em>.`,
    `Intérieurement, ta Lune en ${moonSignName} révèle que tu <em>${mo.core}</em>, et qu'en amour, tu <em>${mo.love}</em>.`,
    `Mais c'est ton côté <em>${chineseAnimal}</em> qui te trahit vraiment : <em>${ch.core}</em>, avec pour défaut principal <em>${ch.shadow}</em>.`,
    `Résultat ? <em>${z.style}</em> — et ${ch.love}.`,
  ];

  return sentences.map(s => `<p>${s}</p>`).join('');
}
