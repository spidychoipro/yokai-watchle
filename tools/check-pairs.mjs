import { readFileSync } from 'node:fs';

const pairs = JSON.parse(readFileSync('data/out/kr_pairs2.json', 'utf8')).pairs;
function n(s) {
  return (s || '').toLowerCase().replace(/[\u2018\u2019\u02bc]/g, "'").replace(/[^a-z0-9' .]/g, '').replace(/\s+/g, ' ').trim();
}
const has = new Map(pairs.map((p) => [n(p.en), p]));

const checks = [
  'el gutso', 'mudmunch', 'dr maddiman', 'eyedra', 'hoggles', 'styx mkvi',
  'squisker', 'mckraken', 'shadow venoct', 'slicenrice', 'flamurice',
  'demuncher', 'mister sandmeh', 'ray o light', 'machonyan', 'hovernyan',
  'time keeler', 'meganyan', 'kin', 'gin', 'mckraken 2nd form',
  'dame dedtime', 'eyeclone', "cap'n crash", 'goldy bones', 'hans full',
  'flippa', 'floppa', 'hinozall', 'bronzlow', 'goofball', 'lappinitup',
  'bbqvil', 'shurikenny', 'nunchucky', 'camellia', '2-much-2-take',
  'chukket', 'shrillington', 'prof plum '.trim(), 'spect hare', 'sn spect hare',
  'jawsome kid', 'hoppy', 'pch baguette', 'jiban liu bei', 'koma sun ce',
  'seaweed sns'.replace(' sns',' sensei'), 'lil blue hood', 'don-chan',
  'dr e raser', 'qn usapyon', 'hotei', 'daikokuten', 'last nyanmurai',
  'hover cao cao', 'sad 2 the bone', 'ult robonyan', 'eggcelency',
  'crummy mum', 'kaped koma', 'gorgeous amb', 'procrastino',
  'j ne sais quoi', 'whi kongming', 'rgt zazel', 'hinozall awk', 'lord enma awk', 'kj',
];
for (const c of checks) {
  const e = has.get(c);
  console.log((e ? 'MATCH ' : 'NONE  ') + c + (e ? '  =>  ' + e.en + ' | ' + e.ko + ' | ' + e.src : ''));
}