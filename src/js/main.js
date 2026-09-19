'use strict';

import { $ } from './dom.js';
import { state, safeGet, safeSet, cloneSettings, DEFAULT_SETTINGS, saveSettings } from './store.js';
import { t } from './i18n.js';
import {
  allGames, gameById, versionBy, roster, gameName, entryName, dailyKey, dailyTarget,
  normalize, getTodayKST, KO_LOCALIZED_GAMES
} from './domain.js';
import { play, initAudio, spawnConfetti, stopConfetti } from './fx.js';
import { recordWin, renderStats } from './stats.js';
import { renderBoard, markFreshRow, renderResult, renderModeInfo } from './board.js';

const MODALS = ['help-modal', 'stats-modal', 'settings-modal'];
const T = (key) => t(state.lang, key);

// ---------- game flow ----------
function startGame() {
  const g = gameById(state.gameId);
  if (!g) return;
  const v = versionBy(g, state.versionId);
  if (!v) return;
  state.roster = v.list;
  state.target = state.mode === 'practice'
    ? state.roster[Math.floor(Math.random() * state.roster.length)]
    : dailyTarget();
  const savedRaw = state.mode === 'daily' ? safeGet(dailyKey()) : null;
  if (savedRaw) {
    try {
      const saved = JSON.parse(savedRaw);
      state.guesses = (saved.guesses || []).filter((e) => e && typeof e.n === 'number');
      state.won = !!saved.won;
      state.over = state.won;
    } catch (e) {
      state.guesses = []; state.won = false; state.over = false;
    }
  } else {
    state.guesses = []; state.won = false; state.over = false;
  }

  stopConfetti();
  if (state.over) renderResult();
  else {
    $('result-screen').classList.add('hidden');
    $('game-board').classList.remove('hidden');
renderBoard({ toBottom: state.guesses.length > 0 });
  }
  $('guess-input').value = '';
  $('suggestions').classList.add('hidden');
  if (!state.over && !$('backdrop').classList.contains('show')) $('guess-input').focus();
  $('new-game-btn').hidden = state.mode === 'daily';
  renderModeInfo();
}

function playAgain() {
  if (state.mode === 'daily') { try { localStorage.removeItem(dailyKey()); } catch (e) {} }
  startGame();
}

function saveDaily() {
  safeSet(dailyKey(), JSON.stringify({ guesses: state.guesses, won: state.won }));
}

function submitGuess() {
  if (state.over) return;
  const input = $('guess-input');
  const raw = normalize(input.value);
  if (!raw) return;
  const hit = roster().find((y) => normalize(y.en) === raw || (y.ko && normalize(y.ko) === raw));
  if (!hit) {
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    play('wrong');
    return;
  }
  if (state.guesses.some((g) => g.n === hit.n)) { input.value = ''; $('suggestions').classList.add('hidden'); return; }

  state.guesses.push(hit);
  input.value = '';
  $('suggestions').classList.add('hidden');

  if (hit.n === state.target.n) {
    endGame();
    return;
  }
  markFreshRow();
  play('click');
  renderBoard();
  renderModeInfo();
  $('guess-input').focus();
}

function endGame() {
  state.won = true;
  state.over = true;
  if (state.mode === 'daily') {
    saveDaily();
    recordWin(state.guesses.length);
  }
  spawnConfetti();
  play('win');
  renderResult();
}

// ---------- share ----------
function shareText() {
  const head = T('shareHead') + ' · ' + gameName() + ' (' + getTodayKST() + ')';
  const lines = [head];
  lines.push('#' + String(state.target.n).padStart(3, '0') + ' ' + entryName(state.target));
  const want = { rank: state.settings.hints.rank, tribe: state.settings.hints.tribe, attr: state.settings.hints.attr };
  state.guesses.forEach((gg) => {
    let ok = 0, total = 0;
    ['rank', 'tribe', 'attr'].forEach((k) => {
      if (!want[k]) return;
      total++;
      if (gg[k] && gg[k] === state.target[k]) ok++;
    });
    const rel = total ? ok / total : 0;
    lines.push(rel === 1 ? '🟩' : rel >= 0.5 ? '🟨' : '⬜');
  });
  return lines.join('\n');
}
function shareFeedback() {
  const b = $('share-btn');
  const old = b.textContent;
  b.textContent = T('copied');
  setTimeout(() => { if (b) b.textContent = old; }, 1400);
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); shareFeedback(); } catch (e) {}
  document.body.removeChild(ta);
}
function doShare() {
  const text = shareText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(shareFeedback, () => fallbackCopy(text));
  } else fallbackCopy(text);
}

// ---------- settings / theme ----------
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const dark = state.theme === 'dark' || (state.theme === 'system' && !getPrefersLight().matches);
  const tc = $('theme-color');
  if (tc) tc.content = dark ? '#171033' : '#fbf3e4';
}
const getPrefersLight = () => window.matchMedia('(prefers-color-scheme: light)');

function applySettingsUI() {
  $('sound').checked = state.settings.sound;
  $('hint-rank').checked = state.settings.hints.rank;
  $('hint-tribe').checked = state.settings.hints.tribe;
  $('hint-attr').checked = state.settings.hints.attr;
  $('lang-toggle').checked = state.lang === 'en';
  document.querySelectorAll('#mode-seg .seg-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.mode === state.mode);
  });
  document.querySelectorAll('#theme-seg .seg-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.theme === state.theme);
  });
}

// ---------- game / version selects ----------
function fillSelects() {
  const gSel = $('game-select');
  gSel.innerHTML = '';
  allGames().forEach((g) => {
    if (state.lang === 'ko' && !KO_LOCALIZED_GAMES.has(g.id)) return;
    const o = document.createElement('option');
    o.value = g.id;
    o.textContent = state.lang === 'ko' ? g.name.ko : g.name.en;
    if (g.id === state.gameId) o.selected = true;
    gSel.appendChild(o);
  });

  fillVersionSelect();
}
function fillVersionSelect() {
  const vSel = $('version-select');
  vSel.innerHTML = '';
  const g = gameById(state.gameId);
  g.versions.forEach((v) => {
    const o = document.createElement('option');
    o.value = v.id;
    o.textContent = state.lang === 'ko' ? v.label.ko : v.label.en;
    if (v.id === state.versionId) o.selected = true;
    vSel.appendChild(o);
  });
}

// ---------- modals ----------
function openModal(id) {
  closeModals();
  $(id).classList.remove('hidden');
  $('backdrop').classList.add('show');
}
function closeModals() {
  MODALS.forEach((id) => { const el = $(id); if (el) el.classList.add('hidden'); });
  const b = $('backdrop');
  if (b) b.classList.remove('show');
}

// ---------- language ----------
const LANG_TEXTS = [
  ['brand-title', 'brandTitle'],
  ['lbl-theme', 'lblTheme'], ['seg-theme-system', 'segThemeSystem'],
  ['seg-theme-light', 'segThemeLight'], ['seg-theme-dark', 'segThemeDark'],
  ['new-game-btn', 'newGame'], ['submit-btn', 'submit'],
  ['footer-text', 'footer'],
  ['help-title', 'helpTitle'], ['help-li-1', 'helpLi1'], ['help-li-2', 'helpLi2'],
  ['help-ex-1', 'helpEx1'], ['help-ex-2', 'helpEx2'],
  ['help-ex-3', 'helpEx3'], ['help-ex-4', 'helpEx4'],
  ['help-ex-r1-name', 'helpExR1Name'], ['help-ex-r1-rank', 'helpExR1Rank'],
  ['help-ex-r1-tribe', 'helpExR1Tribe'], ['help-ex-r1-attr', 'helpExR1Attr'],
  ['help-ex-r2-name', 'helpExR2Name'], ['help-ex-r2-rank', 'helpExR2Rank'],
  ['help-ex-r2-tribe', 'helpExR2Tribe'], ['help-ex-r2-attr', 'helpExR2Attr'],
  ['settings-title', 'settingsH'], ['grp-general', 'grpGeneral'], ['grp-game', 'grpGame'],
  ['lbl-sound', 'lblSound'], ['lbl-lang', 'lblLang'], ['lbl-mode', 'lblMode'],
  ['seg-daily', 'segDaily'], ['seg-practice', 'segPractice'],
  ['lbl-hints', 'lblHints'],
  ['lbl-hint-rank', 'lblHintRank'], ['lbl-hint-tribe', 'lblHintTribe'], ['lbl-hint-attr', 'lblHintAttr'],
  ['reset-settings', 'resetSettings'], ['lbl-game', 'lblGame'], ['lbl-version', 'lblVersion'],
  ['stats-title', 'statsH'], ['lbl-st-played', 'stSolved'], ['lbl-st-streak', 'stStreak'],
  ['lbl-st-best', 'stBest'], ['st-dist-title', 'stDistTitle'], ['st-mode-note', 'stNote'],
  ['share-btn', 'share'], ['play-again-btn', 'playAgain']
];
const LANG_TITLES = { 'help-btn': 'help', 'settings-btn': 'settingsH', 'stats-btn': 'statsH' };
const LANG_ARIAS = { 'help-btn': 'helpAria', 'stats-btn': 'statsAria', 'settings-btn': 'settingsAria' };

function applyLang() {
  document.documentElement.lang = state.lang === 'ko' ? 'ko' : 'en';
  document.title = T('pageTitle');
  $('meta-desc').content = T('pageDesc');
  $('lang-label').textContent = T('langName');
  LANG_TEXTS.forEach(([id, key]) => { const el = $(id); if (el) el.textContent = T(key); });

  $('guess-input').placeholder = T('placeholder');

  Object.keys(LANG_TITLES).forEach((id) => { $(id).title = T(LANG_TITLES[id]); });
  Object.keys(LANG_ARIAS).forEach((id) => { $(id).setAttribute('aria-label', T(LANG_ARIAS[id])); });
  document.querySelectorAll('.modal-close').forEach((b) => b.setAttribute('aria-label', T('closeAria')));

  const cells = document.querySelectorAll('.guess-header .col-num, .guess-header .col-name, .guess-header .col-rank, .guess-header .col-tribe, .guess-header .col-attr');
  const refs = { 'col-num': 'headNum', 'col-name': 'headName', 'col-rank': 'headRank', 'col-tribe': 'headTribe', 'col-attr': 'headAttr' };
  cells.forEach((el) => { el.textContent = T(refs[el.className]); });

  if (state.lang === 'ko' && state.gameId === 'ykw3') {
    state.gameId = 'ykw1';
    state.versionId = 'main';
    fillSelects();
    startGame();
    return;
  }
  fillSelects();
  renderModeInfo();
}

// ---------- suggestions ----------
function suggest(q) {
  const val = normalize(q);
  const ul = $('suggestions');
  if (!val) { ul.classList.add('hidden'); return; }
  const matches = roster()
    .map((y) => {
      const iEn = normalize(y.en).indexOf(val);
      const iKo = y.ko ? normalize(y.ko).indexOf(val) : -1;
      const score = Math.min(iEn === -1 ? Infinity : iEn, iKo === -1 ? Infinity : iKo);
      return { y, score };
    })
    .filter((m) => m.score !== Infinity)
    .sort((a, b) => a.score - b.score || a.y.n - b.y.n)
    .slice(0, 8)
    .map((m) => m.y);
  ul.innerHTML = '';
  matches.forEach((y) => {
    const li = document.createElement('li');
    li.textContent = '#' + String(y.n).padStart(3, '0') + ' ' + entryName(y);
    li.addEventListener('click', () => {
      $('guess-input').value = entryName(y);
      ul.classList.add('hidden');
      submitGuess();
    });
    ul.appendChild(li);
  });
  ul.classList.toggle('hidden', matches.length === 0);
}

// ---------- events ----------
function bindEvents() {
  document.querySelectorAll('#theme-seg .seg-btn').forEach((b) => {
    b.addEventListener('click', () => {
      if (state.theme === b.dataset.theme) return;
      state.theme = b.dataset.theme;
      safeSet('ykw-theme', state.theme);
      applyTheme();
      applySettingsUI();
      play('click');
    });
  });

  document.querySelectorAll('#mode-seg .seg-btn').forEach((b) => {
    b.addEventListener('click', () => {
      if (state.mode === b.dataset.mode) return;
      state.mode = b.dataset.mode;
      safeSet('ykw-mode', state.mode);
      applySettingsUI();
      play('click');
      startGame();
    });
  });

  $('game-select').addEventListener('change', (e) => {
    const g = gameById(e.target.value);
    if (!g) return;
    state.gameId = g.id;
    state.versionId = g.versions[0].id;
    fillVersionSelect();
    startGame();
  });

  $('version-select').addEventListener('change', (e) => {
    state.versionId = e.target.value;
    startGame();
  });

  $('new-game-btn').addEventListener('click', playAgain);

  $('guess-form').addEventListener('submit', (e) => { e.preventDefault(); submitGuess(); });
  $('guess-input').addEventListener('input', () => suggest($('guess-input').value));
  $('guess-input').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const lis = $('suggestions').querySelectorAll('li');
      let idx = -1;
      lis.forEach((li, i) => { if (li.classList.contains('highlighted')) idx = i; });
      if (lis.length) {
        e.preventDefault();
        const next = e.key === 'ArrowDown' ? (idx + 1) % lis.length : (idx - 1 + lis.length) % lis.length;
        lis.forEach((li) => li.classList.remove('highlighted'));
        lis[next].classList.add('highlighted');
      }
    } else if (e.key === 'Enter') {
      const sel = $('suggestions').querySelector('li.highlighted');
      if (sel) { e.preventDefault(); sel.click(); }
    } else if (e.key === 'Escape') { $('suggestions').classList.add('hidden'); }
  });

  $('help-btn').addEventListener('click', () => openModal('help-modal'));
  $('stats-btn').addEventListener('click', () => { renderStats(); openModal('stats-modal'); });
  $('settings-btn').addEventListener('click', () => { applySettingsUI(); openModal('settings-modal'); });

  document.querySelectorAll('.modal-close').forEach((b) => b.addEventListener('click', closeModals));
  $('backdrop').addEventListener('click', (e) => { if (e.target === $('backdrop')) closeModals(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });

  $('share-btn').addEventListener('click', () => { play('click'); doShare(); });
  $('play-again-btn').addEventListener('click', playAgain);

  $('sound').addEventListener('change', (e) => {
    state.settings.sound = e.target.checked;
    saveSettings();
    if (state.settings.sound) play('click');
  });
  const hintIds = { 'hint-rank': 'rank', 'hint-tribe': 'tribe', 'hint-attr': 'attr' };
  Object.keys(hintIds).forEach((id) => {
    $(id).addEventListener('change', (e) => {
      state.settings.hints[hintIds[id]] = e.target.checked;
      saveSettings();
      play('click');
      if (!state.over) renderBoard();
    });
  });
  $('reset-settings').addEventListener('click', () => {
    state.settings = cloneSettings(DEFAULT_SETTINGS);
    saveSettings();
    applySettingsUI();
    play('click');
    if (!state.over) renderBoard();
  });

  $('lang-toggle').addEventListener('change', (e) => {
    state.lang = e.target.checked ? 'en' : 'ko';
    safeSet('ykw-lang', state.lang);
    applyLang();
    if (state.over) renderResult(); else renderBoard();
  });

  document.addEventListener('pointerdown', initAudio, { once: true });
  document.addEventListener('keydown', initAudio, { once: true });
}

// ---------- init ----------
function init() {
  bindEvents();
  applyLang();
  applyTheme();
  applySettingsUI();
  startGame();
  getPrefersLight().addEventListener('change', () => {
    if (state.theme === 'system') applyTheme();
  });
}

init();