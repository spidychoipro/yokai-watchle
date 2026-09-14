import { readFileSync, writeFileSync } from 'node:fs';

const merged = JSON.parse(readFileSync('data/out/merged.json', 'utf8'));
merged.ykwb = JSON.parse(readFileSync('data/out/blasters_kr.json', 'utf8'));

const TRIBE_KO = {
  Brave: '용맹',
  Mysterious: '불가사의',
  Tough: '호걸',
  Charming: '프리티',
  Heartful: '따끈따끈',
  Shady: '어스름',
  Eerie: '불쾌',
  Slippery: '뽀로롱',
  Wicked: '마괴',
  Enma: '염라',
  Legendary: '레전드',
  Boss: '보스',
  Gemnyans: '보석냥',
  Additional: '추가',
  Dream: '드림',
  Classic: '클래식',
  Treasure: '보물',
};

const ATTR_KO = {
  Fire: '화염',
  Ice: '빙결',
  Lightning: '전격',
  Water: '수류',
  Wind: '돌풍',
  Earth: '대지',
  Restoration: '회복',
  Drain: '흡수',
};

const RANK_KO = { S: 'S', A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' };

const RANK_ORDER = { S: 5, A: 4, B: 3, C: 2, D: 1, E: 0 };

function tribeFromSection(sec) {
  const word = sec.split(' - ')[1].trim();
  if (word.includes('Boss')) return 'Boss';
  if (word.includes('Legendary')) return 'Legendary';
  if (word.includes('Enma')) return 'Enma';
  if (word.includes('Wicked')) return 'Wicked';
  if (word.includes('Dream')) return 'Dream';
  if (word.includes('Classic')) return 'Classic';
  if (word.includes('Treasure')) return 'Treasure';
  if (word.includes('Additional')) return 'Additional';
  if (word.includes('Gemnyan')) return 'Gemnyans';
  return word.split(',')[0].trim().split(' ')[0];
}

function cleanRow(r) {
  let tribe = r.tribe;
  if (!tribe || tribe === 'Wicked (tribe)' || tribe === 'Wicked (Tribe)') {
    if (!tribe) tribe = tribeFromSection(r.sec);
    else if (tribe.startsWith('Wicked')) tribe = 'Wicked';
  }
  if (tribe === 'Wicked (tribe)') tribe = 'Wicked';
  return {
    n: r.n,
    en: r.en,
    ko: r.ko,
    rank: r.rank || null,
    tribe: tribe || null,
    attr: r.attr || null,
  };
}

const GAMES = [
  {
    id: 'ykw1',
    name: { en: 'Yo-kai Watch', ko: '요괴워치' },
    versions: [
      { id: 'main', label: { en: 'Main Game', ko: '본편' }, filter: (r) => true },
    ],
  },
  {
    id: 'ykw2',
    name: { en: 'Yo-kai Watch 2', ko: '요괴워치 2' },
    versions: [
      { id: 'fs', label: { en: 'Fleshy Souls', ko: '원조' }, filter: (r) => r.excl === '' || r.excl === 'FS' },
      { id: 'bs', label: { en: 'Bony Spirits', ko: '본가' }, filter: (r) => r.excl === '' || r.excl === 'BS' },
      { id: 'ps', label: { en: 'Psychic Specters', ko: '끝판왕' }, filter: (r) => true },
    ],
  },
  {
    id: 'ykw3',
    name: { en: 'Yo-kai Watch 3', ko: '요괴워치 3' },
    versions: [
      { id: 's', label: { en: 'Sushi', ko: '스시' }, filter: (r) => r.excl === '' || r.excl === 'S' },
      { id: 't', label: { en: 'Tempura', ko: '텐푸라' }, filter: (r) => r.excl === '' || r.excl === 'T' },
      { id: 'sk', label: { en: 'Sukiyaki', ko: '스키야키' }, filter: (r) => true },
    ],
  },
  {
    id: 'ykwb',
    name: { en: 'Yo-kai Watch Blasters', ko: '요괴워치 버스터즈' },
    versions: [
      { id: 'rc', label: { en: 'Red Cat Corps', ko: '적묘단' }, filter: (r) => r.excl === '' || r.excl === 'RCC' },
      { id: 'wd', label: { en: 'White Dog Squad', ko: '백견대' }, filter: (r) => r.excl === '' || r.excl === 'WDS' },
      { id: 'mrc', label: { en: 'Moon Rabbit Crew', ko: '월토조' }, filter: (r) => r.excl === '' || r.excl === 'MRC' },
    ],
  },
];

const tribes = new Map();
const attrs = new Set();
for (const g of Object.keys(merged)) {
  for (const r of merged[g]) {
    const row = cleanRow(r);
    if (row.tribe) tribes.set(row.tribe, { en: row.tribe, ko: TRIBE_KO[row.tribe] || row.tribe });
    if (row.attr) attrs.add(row.attr);
  }
}
const tribeList = [...tribes.values()];
const attrList = [...attrs].sort();

const games = GAMES.map((g) => {
  const rows = merged[g.id];
  const versions = g.versions.map((v) => ({
    id: v.id,
    label: v.label,
    size: rows.filter(v.filter).length,
    list: rows.filter(v.filter).map(cleanRow),
  }));
  return { id: g.id, name: g.name, versions };
});

const data = {
  meta: {
    tribes: tribeList,
    attrs: attrList,
    ranks: ['S', 'A', 'B', 'C', 'D', 'E'],
    rankOrder: RANK_ORDER,
    attrKo: ATTR_KO,
  },
  games,
};

const js = `window.YKW_DATA = ${JSON.stringify(data)};`;
writeFileSync('src/data.js', js, 'utf8');
console.log('written src/data.js', js.length, 'bytes');
for (const g of games) {
  for (const v of g.versions) console.log(g.id, v.id, v.label.ko, v.size);
}