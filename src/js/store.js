'use strict';

export function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
export function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch (e) {}
}

export const DEFAULT_SETTINGS = { sound: true, hints: { rank: true, tribe: true, attr: true } };

export function cloneSettings(s) {
  return {
    sound: s.sound !== false,
    hints: { rank: s.hints.rank !== false, tribe: s.hints.tribe !== false, attr: s.hints.attr !== false }
  };
}

export const state = {
  lang: safeGet('ykw-lang') || 'ko',
  theme: safeGet('ykw-theme') || 'system',
  mode: safeGet('ykw-mode') === 'practice' ? 'practice' : 'daily',
  gameId: 'ykw1',
  versionId: 'main',
  roster: null,
  target: null,
  guesses: [],
  won: false,
  over: false,
  settings: cloneSettings(DEFAULT_SETTINGS)
};

(function loadSettings() {
  const raw = safeGet('ykw-settings');
  if (!raw) return;
  try {
    const p = JSON.parse(raw);
    if (p && p.hints) state.settings = cloneSettings(p);
  } catch (e) {}
})();

export function saveSettings() { safeSet('ykw-settings', JSON.stringify(state.settings)); }