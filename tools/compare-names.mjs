import { readFileSync } from 'node:fs';

function loadYKData(file) {
  const src = readFileSync(file, 'utf8');
  const m = src.match(/const\s+ykData\s*=|let\s+ykData\s*=/);
  if (!m) throw new Error('no declaration: ' + file);
  const eq = src.indexOf('{', m.index);
  if (eq < 0) throw new Error('no brace: ' + file);
  let depth = 0, inStr = null, esc = false, start = -1, end = -1;
  for (let i = eq; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"') { inStr = c; continue; }
    if (c === '{') { if (depth === 0) start = i; depth++; }
    else if (c === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) throw new Error('unbalanced: ' + file);
  return Function('return (' + src.slice(start, end + 1) + ')')();
}

// Normalize names for comparison: curly quotes -> ', remove periods, lowercase
function norm(s) {
  return s
    .replace(/[\u2018\u2019\u02BC\u0060\u00B4]/g, "'")
    .replace(/\./g, '')
    .toLowerCase()
    .trim();
}

const base = 'data/external/YW-Befriend-Calculator/';
const games = ['yw1', 'yw2', 'yw3'];
const parsedFile = { yw1: 'ykw1', yw2: 'ykw2', yw3: 'ykw3' };

for (const k of games) {
  const def = loadYKData(base + `${k}/befriend.js`);
  const parsed = JSON.parse(readFileSync(`data/out/${parsedFile[k]}.json`, 'utf8'));
  const byNorm = new Map(parsed.map((r) => [norm(r.name), r]));

  const befriendOnly = [];
  for (const [name] of Object.entries(def)) {
    const baseName = name.replace(/ \(Type Rare\)$/, ''); // YW2 rare-variant species
    if (!byNorm.has(norm(baseName))) {
      befriendOnly.push(name);
    }
  }
  // species in parsed missing from befriend (excluding normalizable variants)
  const parsedOnly = [];
  for (const r of parsed) {
    const n = norm(r.name);
    const found = Object.keys(def).some((k2) => norm(k2.replace(/ \(Type Rare\)$/, '')) === n);
    if (!found) parsedOnly.push(`${r.num}|${r.name}`);
  }
  console.log(`\n=== ${k} ===`);
  console.log(`befriend names: ${Object.keys(def).length}, parsed rows: ${parsed.length}`);
  console.log(`[${k}] befriend-only (${befriendOnly.length}): ${befriendOnly.join(', ')}`);
  console.log(`[${k}] parsed-not-in-befriend (${parsedOnly.length}):`);
  console.log(parsedOnly.join('\n'));
}