'use strict';

import { state } from './store.js';
import { t } from './i18n.js';
import {
  entryName, tribeLabel, attrLabel, rankLabel, rankCompare,
  RANK_COLOR, TRIBE_COLOR, ATTR_COLOR
} from './domain.js';
import { $ } from './dom.js';

const T = (key) => t(state.lang, key);

export function colClass() {
  const r = state.settings.hints.rank, t2 = state.settings.hints.tribe, a = state.settings.hints.attr;
  if (r && t2 && a) return 'cols-all';
  if (r && t2 && !a) return 'cols-na';
  if (r && !t2 && a) return 'cols-nt';
  if (!r && t2 && a) return 'cols-nr';
  if (r && !t2 && !a) return 'cols-nta';
  if (!r && t2 && !a) return 'cols-nra';
  if (!r && !t2 && a) return 'cols-nrt';
  return 'cols-name';
}
export function applyCols() {
  const box = $('guesses-container');
  box.className = 'guesses-container ' + colClass();
  const map = { rank: state.settings.hints.rank, tribe: state.settings.hints.tribe, attr: state.settings.hints.attr };
  ['rank', 'tribe', 'attr'].forEach((k) => {
    box.querySelectorAll('.col-' + k).forEach((el) => el.classList.toggle('hide', !map[k]));
  });
}

let freshRow = false;
export function markFreshRow() { freshRow = true; }

export function renderBoard(opts) {
  const container = $('guesses-container');
  while (container.children.length > 1) container.removeChild(container.lastChild);
  const fresh = freshRow;
  state.guesses.forEach((g, i) => renderGuessRow(g, i));
  if ((opts && opts.toBottom) || fresh) container.scrollTop = container.scrollHeight;
  freshRow = false;
  applyCols();
}

function renderGuessRow(guess, idx) {
  const container = $('guesses-container');
  const row = document.createElement('div');
  row.className = 'guess-row';
  if (freshRow && idx === state.guesses.length - 1) row.classList.add('row-fresh');

  const num = document.createElement('span');
  num.className = 'col-num';
  if (guess.n === state.target.n) {
    num.textContent = '✓';
    num.classList.add('correct-num');
  } else {
    num.textContent = guess.n < state.target.n ? '▲ ' + guess.n : '▼ ' + guess.n;
    num.classList.add('arrow-num');
  }
  row.appendChild(num);

  const name = document.createElement('span');
  name.className = 'col-name';
  name.textContent = entryName(guess);
  row.appendChild(name);

  row.appendChild(makeHintCell('rank', guess));
  row.appendChild(makeHintCell('tribe', guess));
  row.appendChild(makeHintCell('attr', guess));

  container.appendChild(row);
}

function makeHintCell(k, guess) {
  const cell = document.createElement('span');
  cell.className = 'col-' + k;
  const v = guess[k];
  if (v) {
    const chip = document.createElement('span');
    chip.className = 'cell';
    const ok = v === state.target[k];
    if (ok) chip.className += ' correct';
    else {
      chip.className += ' wrong';
      chip.style.background = k === 'rank' ? RANK_COLOR[v] : (k === 'tribe' ? TRIBE_COLOR[v] : ATTR_COLOR[v]);
      chip.style.color = '#000';
    }
    if (k === 'rank' && !ok) {
      const arrow = rankCompare(guess.rank, state.target.rank) > 0 ? ' ▲' : ' ▼';
      chip.textContent = v + arrow;
    } else {
      chip.textContent = k === 'rank' ? v : (k === 'tribe' ? tribeLabel(v) : attrLabel(v));
    }
    cell.appendChild(chip);
  } else {
    cell.innerHTML = '<span class="cell hint">?</span>';
  }
  if (!state.settings.hints[k]) cell.classList.add('hide');
  return cell;
}

export function renderResult() {
  $('game-board').classList.add('hidden');
  $('result-screen').classList.remove('hidden');

  const title = $('result-title');
  title.textContent = T('win');
  title.classList.remove('pop'); void title.offsetWidth; title.classList.add('pop');

  $('result-number').textContent = '#' + String(state.target.n).padStart(3, '0');
  $('result-name').textContent = state.lang === 'ko'
    ? (state.target.ko || state.target.en) + (state.target.en && state.target.en !== state.target.ko ? ' / ' + state.target.en : '')
    : state.target.en + (state.target.ko && state.target.ko !== state.target.en ? ' / ' + state.target.ko : '');

  const badges = { rank: $('badge-rank'), tribe: $('badge-tribe'), attr: $('badge-attr') };
  badges.rank.textContent = state.target.rank ? rankLabel(state.target.rank) : T('unknown');
  badges.rank.style.background = state.target.rank ? RANK_COLOR[state.target.rank] : 'var(--border-color)';
  badges.tribe.textContent = state.target.tribe ? tribeLabel(state.target.tribe) : T('unknown');
  badges.tribe.style.background = state.target.tribe ? TRIBE_COLOR[state.target.tribe] : 'var(--border-color)';
  badges.attr.textContent = state.target.attr ? attrLabel(state.target.attr) : T('unknown');
  badges.attr.style.background = state.target.attr ? ATTR_COLOR[state.target.attr] : 'var(--border-color)';

  $('share-btn').textContent = T('share');
  $('play-again-btn').textContent = T('playAgain');
  renderModeInfo();
}

export function renderModeInfo() {
  const practice = state.mode === 'practice';
  let line = (practice ? T('practiceMode') : T('todayLine'));
  line += ' · ' + T('guessCounter').replace('{n}', String(state.guesses.length));
  $('mode-info').textContent = line;
  const bm = $('brand-mode');
  if (bm) bm.textContent = practice ? 'PRACTICE' : 'DAILY';
  if (state.over) $('result-stats-line').textContent = line;
}