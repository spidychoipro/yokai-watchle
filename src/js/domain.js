'use strict';

import { state } from './store.js';

const DATA = window.YKW_DATA;

export const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];
export const KO_LOCALIZED_GAMES = new Set(['ykw1', 'ykw2', 'ykwb']);

export const RANK_COLOR = {
  S: 'var(--rank-s)', A: 'var(--rank-a)', B: 'var(--rank-b)',
  C: 'var(--rank-c)', D: 'var(--rank-d)', E: 'var(--rank-e)'
};

function hueColor(name, sat) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return 'hsl(' + h + ', ' + (sat || 62) + '%, 56%)';
}

export const TRIBE_COLOR = {};
export const ATTR_COLOR = {};
(function buildColors() {
  DATA.meta.tribes.forEach((t) => { TRIBE_COLOR[t.en] = hueColor(t.en); });
  DATA.meta.attrs.forEach((a) => { ATTR_COLOR[a] = hueColor(a); });
  TRIBE_COLOR.Boss = '#e4572e';
  TRIBE_COLOR.Legendary = '#ffd54a';
  TRIBE_COLOR.Enma = '#c0392b';
})();

function kstNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}
function fmtKST(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function getTodayKST() { return fmtKST(kstNow()); }
export function kstDateDaysAgo(days) {
  const d = kstNow();
  d.setDate(d.getDate() - days);
  return fmtKST(d);
}

export function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export function normalize(s) {
  return (s || '').replace(/[\u2018\u2019\u02bc]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
}

export function allGames() { return DATA.games; }
export function gameById(id) { return DATA.games.find((g) => g.id === id); }
export function versionBy(game, id) { return game.versions.find((v) => v.id === id); }
export function roster() { return state.roster; }

export function entryName(e) {
  return state.lang === 'ko' ? (e.ko || e.en) : e.en;
}
export function gameName() {
  const g = gameById(state.gameId);
  return state.lang === 'ko' ? g.name.ko : g.name.en;
}

export function dailyKey() {
  return 'ykw-daily-' + state.gameId + '-' + state.versionId + '-' + getTodayKST();
}
export function dailyTarget() {
  return state.roster[hashString(state.gameId + '|' + state.versionId + '|' + getTodayKST()) % state.roster.length];
}

export function tribeLabel(id) {
  const t = DATA.meta.tribes.find((x) => x.en === id);
  if (state.lang === 'ko' && t && t.ko !== t.en) return t.ko;
  return id;
}
export function attrLabel(id) {
  if (state.lang === 'ko') return DATA.meta.attrKo[id] || id;
  return id;
}
export function rankLabel(id) { return id; }
export function rankCompare(a, b) { return DATA.meta.rankOrder[b] - DATA.meta.rankOrder[a]; }