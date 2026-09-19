'use strict';

import { safeGet, safeSet } from './store.js';
import { dailyKey, getTodayKST, kstDateDaysAgo } from './domain.js';
import { $ } from './dom.js';

function defaultStats() {
  return { daily: { won: 0, streak: 0, max: 0, dist: {}, lastWinKey: '', lastWinDate: null } };
}

function stats() {
  let s = null;
  try { s = JSON.parse(safeGet('ykw-stats')); } catch (e) {}
  if (!s || !s.daily) s = defaultStats();
  return s;
}
function saveStats(s) { safeSet('ykw-stats', JSON.stringify(s)); }

function lastWinDateOf(key) {
  if (!key) return null;
  const m = String(key).match(/(\d{4}-\d{2}-\d{2})$/);
  return m ? m[1] : null;
}

export function recordWin(guessCount) {
  const st = stats();
  const m = st.daily;
  const key = dailyKey();
  if (m.lastWinKey === key) return st;
  if (m.lastWinDate === undefined) m.lastWinDate = lastWinDateOf(m.lastWinKey);
  const today = getTodayKST();
  m.won++;
  m.streak = m.lastWinDate === kstDateDaysAgo(1) ? (m.streak || 0) + 1 : 1;
  if (m.streak > m.max) m.max = m.streak;
  if (guessCount) m.dist[String(guessCount)] = (m.dist[String(guessCount)] || 0) + 1;
  m.lastWinKey = key;
  m.lastWinDate = today;
  saveStats(st);
  return st;
}

export function renderStats() {
  const m = stats().daily;
  $('st-played').textContent = m.won;
  $('st-streak').textContent = m.streak;
  $('st-best').textContent = m.max;

  const box = $('st-dist');
  box.innerHTML = '';
  const dist = m.dist || {};
  let maxV = 1;
  for (const k in dist) if (+k > maxV) maxV = +k;
  const maxCols = 15;
  for (let i = 1; i <= maxCols; i++) {
    const c = dist[String(i)] || 0;
    const row = document.createElement('div');
    row.className = 'dist-row';
    row.innerHTML = '<span class="dist-n">' + i + '</span>' +
      '<div class="dist-bar"><div class="dist-fill" style="width:' + (c ? Math.max(8, c / maxV * 100) : 0) + '%"></div></div>' +
      '<span class="dist-c">' + c + '</span>';
    box.appendChild(row);
  }
}