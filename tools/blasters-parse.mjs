import { readFileSync, writeFileSync } from 'node:fs';

// Copy of parse-local.mjs logic targeted at the Blasters medallium page
const ATTRS = new Set([
  'Fire', 'Water', 'Earth', 'Wind', 'Ice', 'Lightning', 'Thunder', 'Drain',
  'Restoration', 'Poison', 'Mechanical', 'Normal', 'Ghostly', 'Harmonic', 'Steel', 'All',
]);

function cleanName(value) {
  return (value || '')
    .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\{\{[^}]+\}\}/g, '')
    .trim();
}

function extractMarkers(text) {
  const markers = [];
  const re = /\{\{Versionlink\|([^}]+)\}\}/g;
  let m;
  while ((m = re.exec(text))) markers.push(m[1].trim());
  return [...new Set(markers.map((x) => x.toUpperCase()))];
}

function parseRow(cells, section) {
  const numText = (cells[0] || '').trim();
  const num = parseInt(numText, 10);
  if (!Number.isFinite(num)) return null;
  const rawNameCell = cells[2] || '';
  const name = cleanName(rawNameCell);
  if (!name) return null;
  const excl = extractMarkers(rawNameCell);

  let rank = null, tribe = null, attr = null;
  for (const cell of cells.slice(3)) {
    const linkM = cell.match(/link=([^\]|]+)/);
    const linkVal = linkM ? linkM[1].trim() : '';
    const cleanVal = linkVal.replace(/ \(attribute\)$/i, '').trim();
    const rm = cell.match(/Rank[_ ]([A-Z])[_ ]?[iI]con/);
    if (rm && !rank) { rank = rm[1]; continue; }
    if (/Tribe|_mini_icon/i.test(cell) || /link=Boss/i.test(cell)) {
      if (!tribe) tribe = cleanVal || (/link=Boss/i.test(cell) ? 'Boss' : null);
      continue;
    }
    if (/[iI]con\.PNG/.test(cell) && ATTRS.has(cleanVal) && !attr) { attr = cleanVal; continue; }
    if (/[iI]con\.PNG/.test(cell) && !attr) {
      const fn = cell.match(/File:([A-Za-z_ ]*)\.PNG/i);
      if (fn) {
        const base = fn[1].replace(/_/g, ' ').trim();
        const word = base.split(' ')[0];
        if (ATTRS.has(word)) attr = word;
      }
    }
  }
  return { num, name, rank, tribe, attr, excl: excl.join(',') || '', section };
}

const text = readFileSync('data/raw/blasters.raw.txt', 'utf8');
const lines = text.split(/\r?\n/);
const rows = [];
let heading = '';
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const h = line.match(/^=+(.*?)=+\s*$/);
  if (h) heading = h[1].trim();
  const t = line.trim().match(/^\{\|/);
  if (t) {
    let block = line;
    let depth = 1;
    let j = i + 1;
    while (j < lines.length && depth > 0) {
      block += '\n' + lines[j];
      if (lines[j].includes('{|')) depth++;
      if (lines[j].trim() === '|}') depth--;
      j++;
    }
    i = j - 1;
    let cur = [];
    for (const rawLine of block.split(/\r?\n/)) {
      const ln = rawLine.trim();
      if (ln.startsWith('|-')) {
        if (cur.length) {
          const r = parseRow(cur, heading);
          if (r) rows.push(r);
          cur = [];
        }
      } else if (ln.startsWith('|')) {
        cur.push(rawLine.replace(/^\|/, ''));
      }
    }
    if (cur.length) {
      const r = parseRow(cur, heading);
      if (r) rows.push(r);
    }
    continue;
  }
  i++;
}

writeFileSync('data/out/blasters.json', JSON.stringify(rows, null, 1), 'utf8');

const nums = rows.map((r) => r.num);
const dupNums = nums.filter((n, idx) => nums.indexOf(n) !== idx);
console.log(`blasters: ${rows.length} rows`);
console.log(`  missing rank=${rows.filter((r) => !r.rank).length} tribe=${rows.filter((r) => !r.tribe).length} attr=${rows.filter((r) => !r.attr).length}`);
console.log(`  dup nums=${[...new Set(dupNums)].length}`);
console.log(`  markers: ${[...new Set(rows.flatMap((r) => r.excl ? r.excl.split(',') : []))].join(',')}`);
console.log(`  sections: ${[...new Set(rows.map((r) => r.section))].join(' | ')}`);
console.log(`  sample: ${JSON.stringify(rows.slice(0, 3))}`);