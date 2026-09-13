import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'data', 'raw');

const GAMES = [
  { key: 'ykw1', label: '(Yo-kai_Watch)' },
  { key: 'ykw2', label: '(Yo-kai_Watch_2)' },
  { key: 'ykw3', label: '(Yo-kai_Watch_3)' },
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function fetchRaw(label) {
  const url = `https://yokaiwatch.fandom.com/wiki/List_of_Yo-kai_by_Medallium_Number_${label}?action=raw`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return await res.text();
}

function clean(value) {
  return (value || '').replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1').trim();
}

function parseAttrLink(text) {
  const m = text.match(/link=([A-Za-z ()\-']+)/);
  if (!m) return null;
  return m[1].replace(/ \(attribute\)$/i, '').trim();
}

function parseNameCell(text) {
  const m = text.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  let name = m ? (m[2] || m[1]) : text.replace(/\{\{.*?\}\}/g, '').trim();
  let excl = [];
  const after = text.slice(m ? text.indexOf(']]') + 2 : 0);
  const markerMatch = after.match(/\[(FS|BS|PS|FS\/BS|PS|ALL)\]/i) || after.match(/\(FS\)|\(BS\)|\(PS\)/i);
  const markerMatch2 = text.match(/\[(FS|BS|PS)\]/i);
  if (markerMatch) excl.push(markerMatch[1].toUpperCase());
  if (markerMatch2 && markerMatch2[1] !== (markerMatch && markerMatch[1])) excl.push(markerMatch2[1].toUpperCase());
  name = name.replace(/\[(FS|BS|PS)\]/i, '').trim();
  return { name, excl };
}

function parseTable(block) {
  const rows = [];
  let cur = { cells: [] };
  const lines = block.split(/\r?\n/);
  for (const line of lines) {
    if (line.trim().startsWith('|-')) {
      if (cur.cells.length) rows.push(cur.cells);
      cur = { cells: [] };
    } else if (line.trim().startsWith('|') && !line.trim().startsWith('|-')) {
      cur.cells.push(line.replace(/^\|/, ''));
    } else if (line.trim().startsWith('!')) {
      // header rows are ignored (they don't start with |)
    }
  }
  if (cur.cells.length) rows.push(cur.cells);
  return rows;
}

function parseRow(cells) {
  const numMatch = (cells[0] || '').trim().match(/^(\d+)\s*(.*)$/);
  if (!numMatch) return null;
  const num = parseInt(numMatch[0], 10);
  let name = null;
  let excl = [];
  let rank = null;
  let tribe = null;
  let attr = null;
  let seenName = false;
  for (const cell of cells.slice(1)) {
    if (cell.includes('_icon.PNG') && /Rank_/.test(cell)) {
      const m = cell.match(/Rank_([A-Z])_icon\.PNG/);
      if (m) rank = m[1];
    } else if (/Tribe\.png|_Tribe\./.test(cell) || /Tribe/.test(cell)) {
      const m = cell.match(/link=([A-Za-z ()\-']+)/);
      if (m) tribe = m[1].trim();
    } else if (/icon\.PNG/.test(cell)) {
      const a = parseAttrLink(cell);
      if (a && !attr) attr = a;
    } else if (!seenName && !cell.match(/^(SeaFood|Meat|Rice|Vegetables|Bread|Candy|Sweets|Ramen|Milk|Juice|Snacks|Sushi|Curry|Oden|Chinese|Soba|Noodles|Hamburgers|Drinks|Seafood)/i)) {
      const p = parseNameCell(cell);
      name = p.name;
      excl = p.excl;
      seenName = true;
    }
  }
  return { num, name, rank, tribe, attr, excl: excl.length ? excl.join(',') : '' };
}

for (const g of GAMES) {
  const text = await fetchRaw(g.label);
  const blocks = text.match(/\{\|[\s\S]*?\|\}/g) || [];
  let heading = '';
  const all = [];
  let curIdx = -1;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^==+\s*(.*?)\s*==+\s*$/.test(line)) {
      heading = line.replace(/^==+\s*/, '').replace(/\s*==+\s*$/, '');
    }
    if (line.trim().startsWith('{|')) {
      // gather block
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
        const parsed = parseRow(cells);
        if (parsed && parsed.name) {
          parsed.section = heading;
          all.push(parsed);
        }
      }
    }
  }
  // remove table-internal numbering for renaissance etc: keep first occurrence per num unless section indicates otherwise
  mkdirSync(OUT, { recursive: true });
  const file = join(OUT, `${g.key}.raw.json`);
  writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');
  console.log(`${g.label}: ${all.length} rows -> ${file}`);
  console.log('  sections:', [...new Set(all.map((r) => r.section))].slice(0, 40).join(' | '));
  console.log('  sample:', JSON.stringify(all.slice(0, 3)));
}