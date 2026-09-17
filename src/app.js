(function () {
  'use strict';

  const DATA = window.YKW_DATA;
  const $ = (id) => document.getElementById(id);
  const MODALS = ['help-modal', 'stats-modal', 'settings-modal'];

  // ---------- 다국어 ----------
  const I18N = {
    ko: {
      brandTitle: '요괴워치',
      langName: '한국어',
      lblTheme: '테마',
      segThemeSystem: '자동',
      segThemeLight: '라이트',
      segThemeDark: '다크',
      pageTitle: '요괴워치 Watchle · 요괴 맞히기',
      pageDesc: '매일 정해진 요괴를 이름으로 맞히는 게임. 랭크·부족·속성 힌트로 요괴 도감을 완성해보세요.',
      shareHead: '요괴워치 즐',
      todayLine: '오늘의 요괴',
      newGame: '새 게임',
      lblGame: '게임',
      lblVersion: '버전',
      submit: '맞혀보기',
      placeholder: '요괴 이름 입력...',
      win: '정답!',
      playAgain: '다시 하기',
      guessCounter: '추측 {n}회',
      share: '공유',
      copied: '복사됨!',
      footer: '데이터: 요괴워치 도감',
      help: '게임 설명',
      helpAria: '게임 설명',
      closeAria: '닫기',
      helpTitle: '게임 방법',
      helpLi1: '숨은 요괴를 이름으로 맞혀보세요.',
      helpLi2: '제출할수록 정답과의 거리가 힌트로 드러나요. 횟수 제한은 없어요.',
      helpEx1: '초록 칸 = 정답과 일치',
      helpEx2: '색칠된 칸 = 다르지만 그 요괴의 실제 값이에요',
      helpEx3: '▲▼ = 정답보다 낮으면 ▲, 높으면 ▼ (번호·랭크)',
      helpEx4: '맞히면 도감에 포획되고, 결과를 공유할 수 있어요',
      helpExR1Name: '무대꼬',
      helpExR1Rank: 'E ▲',
      helpExR1Tribe: '용맹',
      helpExR1Attr: '화염',
      helpExR2Name: '지바냥',
      helpExR2Rank: 'D',
      helpExR2Tribe: '프리티',
      helpExR2Attr: '화염',
      settingsH: '설정',
      settingsAria: '설정',
      grpGeneral: '일반',
      grpGame: '게임',
      lblSound: '소리',
      lblLang: '언어',
      lblMode: '모드',
      segDaily: '일일 도전',
      segPractice: '연습 모드',
      practiceMode: '연습 모드',
      lblHints: '힌트 표시',
      lblHintRank: '랭크',
      lblHintTribe: '부족',
      lblHintAttr: '속성',
      resetSettings: '기본값 복원',
      statsH: '통계',
      statsAria: '통계',
      stSolved: '해결',
      stStreak: '연속',
      stBest: '최고',
      stDistTitle: '추측 분포',
      stNote: '하루에 정답을 맞히면 1회로 기록돼요.',
      headNum: '№',
      headName: '요괴',
      headRank: '랭크',
      headTribe: '부족',
      headAttr: '속성',
      unknown: '?'
    },
    en: {
      brandTitle: 'YO-KAI WATCH',
      langName: 'English',
      lblTheme: 'Theme',
      segThemeSystem: 'Auto',
      segThemeLight: 'Light',
      segThemeDark: 'Dark',
      pageTitle: 'Yo-kai Watchle · Daily Yo-kai Guess',
      pageDesc: "Guess today's hidden yo-kai by name. Rank, tribe and attribute hints lead you through the Medallium.",
      shareHead: 'Yo-kai Watchle',
      todayLine: "Today's yo-kai",
      newGame: 'New Game',
      lblGame: 'Game',
      lblVersion: 'Version',
      submit: 'Guess',
      placeholder: 'Type yo-kai name...',
      win: 'Correct!',
      playAgain: 'Play Again',
      guessCounter: '{n} guess',
      share: 'Share',
      copied: 'Copied!',
      footer: 'Data: Yo-kai Watch Medallium',
      help: 'How to Play',
      helpAria: 'How to play',
      closeAria: 'Close',
      helpTitle: 'How to Play',
      helpLi1: 'Find the hidden yo-kai by name.',
      helpLi2: 'Each guess reveals how close you are. There is no guess limit.',
      helpEx1: 'Green cell = matches the answer',
      helpEx2: 'Colored cell = differs, but shows the real value',
      helpEx3: '▲▼ = ▲ below the answer, ▼ above (number & rank)',
      helpEx4: 'Caught yo-kai are added to the Medallium. Share your results!',
      helpExR1Name: 'Pandle',
      helpExR1Rank: 'E ▲',
      helpExR1Tribe: 'Brave',
      helpExR1Attr: 'Fire',
      helpExR2Name: 'Jibanyan',
      helpExR2Rank: 'D',
      helpExR2Tribe: 'Charming',
      helpExR2Attr: 'Fire',
      settingsH: 'Settings',
      settingsAria: 'Settings',
      grpGeneral: 'General',
      grpGame: 'Game',
      lblSound: 'Sound',
      lblLang: 'Language',
      lblMode: 'Mode',
      segDaily: 'Daily',
      segPractice: 'Practice',
      practiceMode: 'Practice',
      lblHints: 'Show hints',
      lblHintRank: 'Rank',
      lblHintTribe: 'Tribe',
      lblHintAttr: 'Attr',
      resetSettings: 'Reset defaults',
      statsH: 'Stats',
      statsAria: 'Statistics',
      stSolved: 'Solved',
      stStreak: 'Streak',
      stBest: 'Best',
      stDistTitle: 'Guess distribution',
      stNote: 'One win is counted per day.',
      headNum: '№',
      headName: 'Yo-kai',
      headRank: 'Rank',
      headTribe: 'Tribe',
      headAttr: 'Attr',
      unknown: '?'
    }
  };

  const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];
  const KO_LOCALIZED_GAMES = new Set(['ykw1', 'ykw2', 'ykwb']);
  const RANK_COLOR = {
    S: 'var(--rank-s)', A: 'var(--rank-a)', B: 'var(--rank-b)',
    C: 'var(--rank-c)', D: 'var(--rank-d)', E: 'var(--rank-e)'
  };
  const TRIBE_COLOR = {};
  const ATTR_COLOR = {};
  function hueColor(name, sat) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return 'hsl(' + h + ', ' + (sat || 62) + '%, 56%)';
  }
  DATA.meta.tribes.forEach((t) => { TRIBE_COLOR[t.en] = hueColor(t.en); });
  DATA.meta.attrs.forEach((a) => { ATTR_COLOR[a] = hueColor(a); });
  TRIBE_COLOR.Boss = '#e4572e';
  TRIBE_COLOR.Legendary = '#ffd54a';
  TRIBE_COLOR.Enma = '#c0392b';

  // ---------- storage ----------
  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  const DEFAULT_SETTINGS = { sound: true, hints: { rank: true, tribe: true, attr: true } };
  function cloneSettings(s) {
    return {
      sound: s.sound !== false,
      hints: { rank: s.hints.rank !== false, tribe: s.hints.tribe !== false, attr: s.hints.attr !== false }
    };
  }
  function defaultStats() {
    return { daily: { won: 0, lost: 0, streak: 0, max: 0, dist: {}, lastWinKey: '' } };
  }

  let state = {
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

  const T = (key) => I18N[state.lang][key] || key;

  // ---------- helpers ----------
  function getTodayKST() {
    const now = new Date();
    const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    return kst.getFullYear() + '-' + String(kst.getMonth() + 1).padStart(2, '0') + '-' + String(kst.getDate()).padStart(2, '0');
  }
  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }
  function normalize(s) {
    return (s || '').replace(/[\u2018\u2019\u02bc]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function gameById(id) { return DATA.games.find((g) => g.id === id); }
  function versionBy(game, id) { return game.versions.find((v) => v.id === id); }
  function roster() { return state.roster; }
  function entryName(e) {
    return state.lang === 'ko' ? (e.ko || e.en) : e.en;
  }
  function gameName() {
    const g = gameById(state.gameId);
    return state.lang === 'ko' ? g.name.ko : g.name.en;
  }
  function dailyKey() {
    return 'ykw-daily-' + state.gameId + '-' + state.versionId + '-' + getTodayKST();
  }
  function dailyTarget() {
    return state.roster[hashString(state.gameId + '|' + state.versionId + '|' + getTodayKST()) % state.roster.length];
  }
  function tribeLabel(id) {
    const t = DATA.meta.tribes.find((x) => x.en === id);
    if (state.lang === 'ko' && t && t.ko !== t.en) return t.ko;
    return id;
  }
  function attrLabel(id) {
    if (state.lang === 'ko') return DATA.meta.attrKo[id] || id;
    return id;
  }
  function rankLabel(id) { return id; }
  function rankCompare(a, b) { return DATA.meta.rankOrder[b] - DATA.meta.rankOrder[a]; }

  // ---------- sound ----------
  let AC = null;
  function initAudio() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; }
    }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
  }
  function tone(freq, dur, type, gain, delay) {
    if (!AC) return;
    const t = AC.currentTime + (delay || 0);
    const o = AC.createOscillator();
    const g = AC.createGain();
    o.type = type || 'triangle';
    o.frequency.value = freq;
    const peak = gain || 0.1;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(AC.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const SFX = {
    click() { tone(660, 0.07, 'square', 0.04); },
    wrong() { tone(190, 0.16, 'sawtooth', 0.07); tone(150, 0.2, 'sawtooth', 0.06, 0.05); },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.1, i * 0.12));
      tone(1318, 0.45, 'triangle', 0.09, 0.5);
    }
  };
  function play(name) {
    if (!state.settings.sound) return;
    initAudio();
    if (AC && SFX[name]) SFX[name]();
  }

  // ---------- confetti ----------
  let confRaf = null;
  function spawnConfetti() {
    const cv = $('confetti');
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.ceil(window.innerWidth * dpr);
    cv.height = Math.ceil(window.innerHeight * dpr);
    cv.style.width = window.innerWidth + 'px';
    cv.style.height = window.innerHeight + 'px';
    cv.classList.add('show');
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const colors = ['#ffc857', '#ffb347', '#a78bfa', '#6fdcb0', '#c9b458', '#b48cff', '#ffffff'];
    const parts = [];
    for (let i = 0; i < 90; i++) {
      parts.push({
        x: Math.random() * cv.width,
        y: -10 - Math.random() * cv.height * 0.35,
        w: (6 + Math.random() * 6) * dpr,
        h: (9 + Math.random() * 9) * dpr,
        vx: (Math.random() - 0.5) * 2.4 * dpr,
        vy: (2.2 + Math.random() * 3.6) * dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        circle: Math.random() < 0.4
      });
    }
    if (confRaf) cancelAnimationFrame(confRaf);
    confRaf = null;
    function step() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let alive = 0;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05 * dpr; p.rot += p.vr;
        if (p.y - p.h < cv.height) {
          alive++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, 1 - (p.y - cv.height * 0.8) / (cv.height * 0.35));
          if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
          else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
          ctx.restore();
        }
      }
      if (alive > 0) confRaf = requestAnimationFrame(step);
      else { cv.classList.remove('show'); ctx.clearRect(0, 0, cv.width, cv.height); confRaf = null; }
    }
    confRaf = requestAnimationFrame(step);
  }
  function stopConfetti() {
    if (confRaf) { cancelAnimationFrame(confRaf); confRaf = null; }
    const cv = $('confetti');
    if (cv) { cv.classList.remove('show'); const c = cv.getContext('2d'); if (c) c.clearRect(0, 0, cv.width, cv.height); }
  }

  // ---------- stats ----------
  function stats() {
    let s = null;
    try { s = JSON.parse(safeGet('ykw-stats')); } catch (e) {}
    if (!s || !s.daily) s = defaultStats();
    return s;
  }
  function saveStats(s) { safeSet('ykw-stats', JSON.stringify(s)); }
  function recordWin(guessCount) {
    const st = stats();
    const m = st.daily;
    const key = dailyKey();
    if (m.lastWinKey === key) return st;
    m.won++;
    m.streak++;
    if (m.streak > m.max) m.max = m.streak;
    if (guessCount) m.dist[String(guessCount)] = (m.dist[String(guessCount)] || 0) + 1;
    m.lastWinKey = key;
    saveStats(st);
    return st;
  }

  // ---------- board rendering ----------
  function colClass() {
    const r = state.settings.hints.rank, t = state.settings.hints.tribe, a = state.settings.hints.attr;
    if (r && t && a) return 'cols-all';
    if (r && t && !a) return 'cols-na';
    if (r && !t && a) return 'cols-nt';
    if (!r && t && a) return 'cols-nr';
    if (r && !t && !a) return 'cols-nta';
    if (!r && t && !a) return 'cols-nra';
    if (!r && !t && a) return 'cols-nrt';
    return 'cols-name';
  }
  function applyCols() {
    const box = $('guesses-container');
    box.className = 'guesses-container ' + colClass();
    const map = { rank: state.settings.hints.rank, tribe: state.settings.hints.tribe, attr: state.settings.hints.attr };
    ['rank', 'tribe', 'attr'].forEach((k) => {
      box.querySelectorAll('.col-' + k).forEach((el) => el.classList.toggle('hide', !map[k]));
    });
  }

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
      renderBoard();
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

  function renderModeInfo() {
    const practice = state.mode === 'practice';
    let line = (practice ? T('practiceMode') : T('todayLine'));
    line += ' · ' + T('guessCounter').replace('{n}', String(state.guesses.length));
    $('mode-info').textContent = line;
    const bm = $('brand-mode');
    if (bm) bm.textContent = practice ? 'PRACTICE' : 'DAILY';
    if (state.over && !$('result-stats-line').textContent.match(/\d/)) {
      $('result-stats-line').textContent = line;
    }
  }

  let freshRow = false;
  function renderBoard() {
    const container = $('guesses-container');
    while (container.children.length > 1) container.removeChild(container.lastChild);
    state.guesses.forEach((g, i) => renderGuessRow(g, i));
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

  // ---------- guess flow ----------
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
    freshRow = true;
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

  // ---------- result ----------
  function renderResult() {
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

  // ---------- settings ----------
  function saveSettings() { safeSet('ykw-settings', JSON.stringify(state.settings)); }
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

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    const dark = state.theme === 'dark' || (state.theme === 'system' && !getPrefersLight().matches);
    const tc = $('theme-color');
    if (tc) tc.content = dark ? '#171033' : '#fbf3e4';
  }
  const getPrefersLight = () => window.matchMedia('(prefers-color-scheme: light)');

  // ---------- stats panel ----------
  function renderStats() {
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

  // ---------- game / version selects ----------
  function fillSelects() {
    const gSel = $('game-select');
    gSel.innerHTML = '';
    DATA.games.forEach((g) => {
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
  function applyLang() {
    document.documentElement.lang = state.lang === 'ko' ? 'ko' : 'en';
    document.title = T('pageTitle');
    $('meta-desc').content = T('pageDesc');
    $('lang-label').textContent = T('langName');
    $('brand-title').textContent = T('brandTitle');
    $('lbl-theme').textContent = T('lblTheme');
    $('seg-theme-system').textContent = T('segThemeSystem');
    $('seg-theme-light').textContent = T('segThemeLight');
    $('seg-theme-dark').textContent = T('segThemeDark');
    $('new-game-btn').textContent = T('newGame');
    $('submit-btn').textContent = T('submit');
    $('guess-input').placeholder = T('placeholder');
    $('help-btn').title = T('help');
    $('settings-btn').title = T('settingsH');
    $('stats-btn').title = T('statsH');
    $('footer-text').textContent = T('footer');
    $('help-btn').setAttribute('aria-label', T('helpAria'));
    $('stats-btn').setAttribute('aria-label', T('statsAria'));
    $('settings-btn').setAttribute('aria-label', T('settingsAria'));
    document.querySelectorAll('.modal-close').forEach((b) => b.setAttribute('aria-label', T('closeAria')));

    $('help-title').textContent = T('helpTitle');
    $('help-li-1').textContent = T('helpLi1');
    $('help-li-2').textContent = T('helpLi2');
    $('help-ex-1').textContent = T('helpEx1');
    $('help-ex-2').textContent = T('helpEx2');
    $('help-ex-3').textContent = T('helpEx3');
    $('help-ex-4').textContent = T('helpEx4');
    $('help-ex-r1-name').textContent = T('helpExR1Name');
    $('help-ex-r1-rank').textContent = T('helpExR1Rank');
    $('help-ex-r1-tribe').textContent = T('helpExR1Tribe');
    $('help-ex-r1-attr').textContent = T('helpExR1Attr');
    $('help-ex-r2-name').textContent = T('helpExR2Name');
    $('help-ex-r2-rank').textContent = T('helpExR2Rank');
    $('help-ex-r2-tribe').textContent = T('helpExR2Tribe');
    $('help-ex-r2-attr').textContent = T('helpExR2Attr');

    $('settings-title').textContent = T('settingsH');
    $('grp-general').textContent = T('grpGeneral');
    $('grp-game').textContent = T('grpGame');
    $('lbl-sound').textContent = T('lblSound');
    $('lbl-lang').textContent = T('lblLang');
    $('lbl-mode').textContent = T('lblMode');
    $('seg-daily').textContent = T('segDaily');
    $('seg-practice').textContent = T('segPractice');
    $('lbl-hints').textContent = T('lblHints');
    $('lbl-hint-rank').textContent = T('lblHintRank');
    $('lbl-hint-tribe').textContent = T('lblHintTribe');
    $('lbl-hint-attr').textContent = T('lblHintAttr');
    $('reset-settings').textContent = T('resetSettings');
    $('lbl-game').textContent = T('lblGame');
    $('lbl-version').textContent = T('lblVersion');

    $('stats-title').textContent = T('statsH');
    $('lbl-st-played').textContent = T('stSolved');
    $('lbl-st-streak').textContent = T('stStreak');
    $('lbl-st-best').textContent = T('stBest');
    $('st-dist-title').textContent = T('stDistTitle');
    $('st-mode-note').textContent = T('stNote');
    $('share-btn').textContent = T('share');
    $('play-again-btn').textContent = T('playAgain');

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

  // ---------- suggestions ----------
  function suggest(q) {
    const val = normalize(q);
    const ul = $('suggestions');
    if (!val) { ul.classList.add('hidden'); return; }
    const matches = roster()
      .filter((y) => normalize(y.en).includes(val) || (y.ko && normalize(y.ko).includes(val)))
      .slice(0, 8);
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

  window.addEventListener('load', init);
})();