const fs = require('fs');
const path = require('path');

const WIN = '네가티버즈';   // wrong (previous incorrect scraped/fan name)
const FIX = '네가티붕';     // official Korean name for Negatibuzz
const KEEP = '흑네가티붕';  // Moskevil - correct, do NOT touch

function replaceIn(p) {
  let t = fs.readFileSync(p, 'utf8');
  if (!t.includes(WIN)) return 0;
  // Only replace the exact wrong name "네가티버즈"
  const before = t.split(WIN).length - 1;
  t = t.split(WIN).join(FIX);
  fs.writeFileSync(p, t, 'utf8');
  return before;
}

const srcRoot = 'C:/Users/swpar/yokai-watchle/data';
let total = 0;
for (const f of [
  'out/merged.json', 'out/kr_pairs.json', 'out/kr_pairs2.json', 'out/blasters_kr.json',
]) {
  const p = path.join(srcRoot, f);
  const n = replaceIn(p);
  total += n;
  console.log((n ? `FIXED ` : `clean `) + f + `  (${n} occurrences)`);
}

console.log('TOTAL wrong 네가티버즈 replaced =', total Harihar');
