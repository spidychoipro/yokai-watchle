import { readFileSync, writeFileSync } from 'node:fs';

const normEn = (s) =>
  (s || '')
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const kr = JSON.parse(readFileSync('data/out/kr_pairs.json', 'utf8')).pairs;
const enMap = new Map();
for (const p of kr) {
  if (!p.en) continue;
  const k = normEn(p.en);
  if (!enMap.has(k)) enMap.set(k, []);
  enMap.get(k).push(p.ko);
}

function load(k) {
  return JSON.parse(readFileSync(`data/out/${k}.json`, 'utf8'));
}

const games = {
  ykw1: load('ykw1'),
  ykw2: load('ykw2'),
  ykw3: load('ykw3'),
};

const nameFixes = {
  ykw2: { 'McKraken (Second From)': 'McKraken (2nd Form)' },
  ykw3: { 'Shad. Venoct': 'Shadow Venoct' },
};

const out = {};
const stats = {};
for (const [g, rows] of Object.entries(games)) {
  out[g] = [];
  let matched = 0;
  const unmatched = [];
  for (const r of rows) {
    let name = r.name;
    if (nameFixes[g] && nameFixes[g][name]) name = nameFixes[g][name];
    const k = normEn(name);
    const kos = enMap.get(k);
    let ko = kos && kos.length ? kos[0] : null;
    if (!ko) unmatched.push(`${r.num}|${name}`);
    else matched++;
    out[g].push({ n: r.num, en: name, ko, rank: r.rank, tribe: r.tribe, attr: r.attr, excl: r.excl, sec: r.section });
  }
  stats[g] = { total: rows.length, matched, unmatched: unmatched.length };
  console.log(`\n=== ${g}: matched ${matched}/${rows.length} ===`);
  console.log('unmatched (' + unmatched.length + '):');
  console.log(unmatched.join('\n'));
}

writeFileSync('data/out/merged.json', JSON.stringify(out, null, 1), 'utf8');
console.log('\nwritten data/out/merged.json');
console.log(JSON.stringify(stats, null, 1));