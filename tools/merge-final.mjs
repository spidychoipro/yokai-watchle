import { readFileSync, writeFileSync } from 'node:fs';

const KR = 'data/out/kr_pairs2.json';
const normEn = (s) =>
  (s || '').replace(/[\u2018\u2019\u02BC]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

function buildMap(jsonPath) {
  const arr = JSON.parse(readFileSync(jsonPath, 'utf8')).pairs;
  const m = new Map();
  for (const p of arr) {
    if (!p.en) continue;
    const k = normEn(p.en);
    if (!m.has(k)) m.set(k, p.ko);
  }
  return m;
}

const agentMap = buildMap('data/out/kr_pairs.json');
const directMap = buildMap('data/out/kr_pairs2.json');
const enMap = new Map(agentMap);
for (const [k, v] of directMap) if (!enMap.has(k)) enMap.set(k, v);

function lookup(en) {
  return enMap.get(normEn(en)) || null;
}

const ABBREV = {
  'Shad. Venoct': 'Shadow Venoct',
  'McKraken (2nd Form)': 'McKraken',
  'McKraken (Second From)': 'McKraken',
  'Sgt. Burly': 'Sargeant Burly',
  'Mr. Sandmeh': 'Mister Sandmeh',
  "Ray O'Light": "Ray O' Light",
  'Dame Damona': 'Damona',
  'Prof. Plumage': 'Professor Plumage',
  'Spect-hare': 'Agent Spect-hare',
  'Sn. Spect-hare': 'Snow Spect-hare',
  'Sp mountain': 'Speedemountain',
  'Ship. Sailor': 'ShipShape Sailor',
  'Adm. Admiral': 'Admirable Admiral',
  'Jawsome Kid': 'The Jawsome Kid',
  'Hoppy.': 'Hoppy-Go-Lucky',
  'Pch. Baguette': 'Punching Baguette',
  'Jiban. Liu Bei': 'Jibanyan Liu Bei',
  'Koma. Sun Ce': 'Komasan Sun Ce',
  'Chukket': 'Chicken Chukket',
  'Shrillington': 'Lord Shrillington',
  'Seaweed Sns.': 'Seaweed Sensei',
  'Lil Blue Hood': 'Lil Blue BathingHood',
  'DON-CHAN': 'Don Chan',
  '2-Much-2-Take': 'Too-Much-To-Take',
  'Sad 2 the Bone': 'Sad to The Bone',
  'Ult. Robonyan': 'U Robonyan',
  'Eggcelency': 'Her Eggcelency',
  'Crummy Mum.': 'Crummy Mummy',
  'Kaped Koma.': 'Kaped Komander',
  'Gorgeous Amb.': 'Gorgeous Ambassador',
  'Procrastino.': 'Procrastinocchio',
  'J. Ne-Sais-Quoi': 'Jeanne Ne-Sais-Quoi',
  'Rgt. Zazel': 'Righteous Zazel',
  'Last Nyanmurai': 'The Last Nyanmurai',
  'Hover. Cao Cao': 'Hovernyan Cao Cao',
  'Usa. Zhongda': 'Usapyon Zhongda',
  'Qn. Usapyon': 'Queen Usapyon',
  'Dr. E. Raser': 'Dr. E. Razer',
  'Shurikenny': 'Shurikenny',
  'Flippa': 'Flippa&Floppa',
  'Floppa': 'Flippa&Floppa',
  'Kin': 'Kin&Gin&Bronzlow',
  'Gin': 'Kin&Gin&Bronzlow',
  'Bronzlow': 'Kin&Gin&Bronzlow',
};

const TRIO = {
  'Flippa&Floppa': ['감파', '옴파'],
  'Kin&Gin&Bronzlow': ['금파', '은파', '동파'],
};

const REPLACE = {}; // canEn -> newCanonEn (display fix)
for (const [disp, full] of Object.entries(ABBREV)) {
  REPLACE[disp] = full;
}

const OVERRIDE = {
  ykw2: {
    17: '주먹밥무사',
    335: '멜론냥', 336: '오렌지냥', 337: '키위냥', 338: '포도냥', 339: '딸기냥', 340: '수박냥',
  },
  ykw3: {
    29: '주먹밥무사',
    278: '멜론냥', 279: '오렌지냥', 280: '키위냥', 281: '포도냥', 282: '딸기냥', 283: '수박냥',
    33: '전력승부사',
    655: '위스퍼 콩밍',
    671: '히노졸 어워큰',
    673: '로드 엔마 어워큰',
    687: '케이제이',
    424: '우사뿅 풋볼',
    425: '우사뿅 스쿠버',
    426: '우사뿅 G.I.',
    427: '우사뿅 레이서',
  },
};

function load(k) { return JSON.parse(readFileSync(`data/out/${k}.json`, 'utf8')); }
const games = { ykw1: load('ykw1'), ykw2: load('ykw2'), ykw3: load('ykw3') };

const getKo = (g, num, name) => {
  if (OVERRIDE[g] && OVERRIDE[g][num]) return OVERRIDE[g][num];
  let en = name;
  if (REPLACE[en]) en = REPLACE[en];
  if (TRIO[en] !== undefined) {
    const order = {'Flippa': 0, 'Floppa': 1, 'Kin': 0, 'Gin': 1, 'Bronzlow': 2};
    return TRIO[en][order[name]] || TRIO[en][0];
  }
  return lookup(en);
};

const out = {};
for (const [g, rows] of Object.entries(games)) {
  out[g] = [];
  let matched = 0;
  const unmatched = [];
  for (const r of rows) {
    const ko = getKo(g, r.num, r.name);
    if (ko) matched++;
    else unmatched.push(`${r.num}|${r.name}`);
    let en = r.name;
    const rep = REPLACE[en];
    if (rep && TRIO[rep] === undefined) en = rep;
    out[g].push({ n: r.num, en, ko, rank: r.rank, tribe: r.tribe, attr: r.attr, excl: r.excl, sec: r.section });
  }
  console.log(`=== ${g}: ${matched}/${rows.length} matched`);
  if (unmatched.length) { console.log('unmatched:'); console.log(unmatched.join('\n')); }
}

writeFileSync('data/out/merged.json', JSON.stringify(out, null, 1), 'utf8');
console.log('written data/out/merged.json');
console.log(JSON.stringify({ ykw1: games.ykw1.length, ykw2: games.ykw2.length, ykw3: games.ykw3.length }));