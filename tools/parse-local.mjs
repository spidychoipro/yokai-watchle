import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'data', 'raw');
const OUT = join(__dirname, '..', 'data', 'out');

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
  while ((m = re.exec(text))) {
    markers.push(m[1].trim());
  }
  const re2 = /\[(FS|BS|PS)\]/g;
  while ((m = re2.exec(text))) markers.push(m[1]);
  return [...new Set(markers.map((x) => x.toUpperCase()))];
}

function parseRow(cells, section, conf) {
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
    if (/Tribe|_mini_icon/i.test(cell) && !tribe) { tribe = cleanVal || null; continue; }
    if (/[iI]con\.PNG/.test(cell) && ATTRS.has(cleanVal) && !attr) { attr = cleanVal; continue; }
    if (/[iI]con\.PNG/.test(cell) && !attr) {
      // attr file with non-matching link text; try filename
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

function parseGame(key, conf) {
  const text = readFileSync(join(RAW, `${key}.raw.txt`), 'utf8');
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
      for (const cells of parseTable(block)) {
        const r = parseRow(cells, heading, conf);
        if (r) rows.push(r);
      }
      continue;
    }
    i++;
  }
  return rows;
}

function parseTable(block) {
  const rows = [];
  let cur = [];
  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith('|-')) {
      if (cur.length) rows.push(cur);
      cur = [];
    } else if (line.startsWith('|')) {
      cur.push(rawLine.replace(/^\|/, ''));
    }
  }
  if (cur.length) rows.push(cur);
  return rows;
}

const games = {
  ykw1: {},
  ykw2: {},
  ykw3: {},
};

for (const key of Object.keys(games)) {
  const rows = parseGame(key, games[key]);
  writeFileSync(join(OUT, `${key}.json`), JSON.stringify(rows, null, 1), 'utf8');
  const nums = rows.map((r) => r.num);
  const missingRank = rows.filter((r) => !r.rank).length;
  const missingTribe = rows.filter((r) => !r.tribe).length;
  const missingAttr = rows.filter((r) => !r.attr).length;
  const dupNums = nums.filter((n, idx) => nums.indexOf(n) !== idx);
  console.log(`${key}: ${rows.length} rows | missing rank=${missingRank} tribe=${missingTribe} attr=${missingAttr} | dup nums=${[...new Set(dupNums)].length}`);
  console.log(`  sections: ${[...new Set(rows.map((r) => r.section))].join(' | ')}`);
  console.log(`  excl markers: ${[...new Set(rows.flatMap((r) => r.excl ? r.excl.split(',') : []))].join(',') || 'none'}`);
  console.log(`  sample: ${JSON.stringify(rows.slice(0, 2))}`);
}