import { readFileSync, writeFileSync } from 'node:fs';

const normEn = (s) =>
  (s || '')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const rows = JSON.parse(readFileSync('data/out/blasters.json', 'utf8'));

function buildMap(jsonPath) {
  const arr = JSON.parse(readFileSync(jsonPath, 'utf8')).pairs;
  const m = new Map();
  for (const p of arr) {
    if (!p.en) continue;
    const k = normEn(p.en);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(p.ko);
  }
  return m;
}

const map1 = buildMap('data/out/kr_pairs.json');
const map2 = buildMap('data/out/kr_pairs2.json');
const enMap = new Map();
for (const [k, v] of map1) enMap.set(k, v[0]);
for (const [k, v] of map2) if (!enMap.has(k)) enMap.set(k, v[0]);

const REPLACE = {
  'Sgt. Burly': 'Sargeant Burly',
  'Mr. Sandmeh': 'Mister Sandmeh',
  "Ray O'Light": "Ray O' Light",
  'Dame Damona': 'Damona',
  'Prof. Plumage': 'Professor Plumage',
  'Hoppy.': 'Hoppy-Go-Lucky',
  'Pch. Baguette': 'Punching Baguette',
  'Jiban. Liu Bei': 'Jibanyan Liu Bei',
  'Koma. Sun Ce': 'Komasan Sun Ce',
  'Chukket': 'Chicken Chukket',
  'Shrillington': 'Lord Shrillington',
  'Lil Blue Hood': 'Lil Blue BathingHood',
  'DON-CHAN': 'Don Chan',
  '2-Much-2-Take': 'Too-Much-To-Take',
  'Ult. Robonyan': 'U Robonyan',
  'Eggcelency': 'Her Eggcelency',
  "Bland Ron': ↑↓": 'Bland Ron',
  'Shad. Venoct': 'Shadow Venoct',
};

const OVERRIDE = {
  'Slicenrice': '주먹밥무사',
  'Oranyan': '오렌지냥',
  'Kiwinyan': '키위냥',
  'Grapenyan': '포도냥',
  'Strawbnyan': '딸기냥',
  'Watermelnyan': '수박냥',
  'Melonyan': '멜론냥',
  'Usapyon Foot.': '우사뿅 풋볼',
  'Usapyon Scu.': '우사뿅 스쿠버',
  'Usapyon G.I.': '우사뿅 G.I.',
  'Usapyon Rac.': '우사뿅 레이서',
  'Whisped Cream': '위스마시멜로맨',
  'McKraken (2nd Form)': '오징어회장님',
  'Seaweed Sns.': '해초선생님',
  'Captain Thunder (Serious Mode)': '캡틴 썬더 진심',
  'Duke Drooly': '나찰견왕',
  'Alicktokat': '야차묘왕',
  'Zazel (Boss Form)': '아수라',
  'Pink Emperor': '핑크 엠페러',
};

const unmatched = [];
const out = [];
for (const r of rows) {
  let en = r.name.replace(/\u00a0/g, ' ');
  if (REPLACE[en]) en = REPLACE[en];
  let ko = OVERRIDE[en] || null;
  if (!ko) {
    const kos = enMap.get(normEn(en));
    if (kos) ko = kos[0];
  }
  if (!ko) unmatched.push(`${r.num}|${r.name}`);
  out.push({ n: r.num, en: en, ko: ko || '', rank: r.rank, tribe: r.tribe, attr: r.attr, excl: r.excl, section: r.section });
}
writeFileSync('data/out/blasters_kr.json', JSON.stringify(out, null, 1), 'utf8');
console.log(`matched ${rows.length - unmatched.length}/${rows.length}`);
console.log('unmatched (' + unmatched.length + '):');
console.log(unmatched.join('\n'));