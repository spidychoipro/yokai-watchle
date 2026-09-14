(function () {
  'use strict';

  const DATA = window.YKW_DATA;
  const $ = (id) => document.getElementById(id);

  // ---------- 다국어 ----------
  const I18N = {
    ko: {
      langName: 'EN',
      modeDaily: '일일 도전',
      modePractice: '연습',
      modeDaily_desc: '매일 자정(KST)에 바뀌는 요괴를 맞혀보세요.',
      modePractice_desc: '무제한으로 요괴를 맞혀보세요.',
      rounds_txt: '라운드',
      newGame: '새 게임',
      submit: '맞혀보기',
      placeholder: '요괴 이름 입력...',
      win: '정답!',
      lose: '정답 공개',
      playAgain: '다시 하기',
      help: '게임 설명',
      dexTitle: '요괴 도감',
      dexSearch: '요괴 검색...',
      caughtProgress: '포획 {n}/{m}',
      footer: '데이터: 요괴워치 도감',
      settingsH: '설정',
      lblSound: '소리',
      lblHints: '힌트 표시',
      lblHintRank: '랭크',
      lblHintTribe: '부족',
      lblHintAttr: '속성',
      resetSettings: '기본값 복원',
      statsH: '통계',
      stPlayed: '게임',
      stWinrate: '승률',
      stStreak: '연승',
      stBest: '최고',
      stDistTitle: '추측 분포',
      stModeDailyNote: '일일 도전 기준 통계예요.',
      stModePracticeNote: '연습 기준 통계예요.',
      share: '공유',
      copied: '복사됨!',
      guessCounter: '추측 {n}/{m}',
      headNum: '№',
      headName: '요괴',
      headRank: '랭크',
      headTribe: '부족',
      headAttr: '속성',
      unknown: '?'
    },
    en: {
      langName: '한국어',
      modeDaily: 'Daily',
      modePractice: 'Practice',
      modeDaily_desc: 'New yo-kai every day at midnight (KST).',
      modePractice_desc: 'Unlimited practice rounds.',
      rounds_txt: 'Rounds',
      newGame: 'New Game',
      submit: 'Guess',
      placeholder: 'Type yo-kai name...',
      win: 'Correct!',
      lose: 'Answer revealed',
      playAgain: 'Play Again',
      help: 'How to Play',
      dexTitle: 'Medallium',
      dexSearch: 'Search yo-kai...',
      caughtProgress: 'Caught {n}/{m}',
      footer: 'Data: Yo-kai Watch Medallium',
      settingsH: 'Settings',
      lblSound: 'Sound',
      lblHints: 'Show hints',
      lblHintRank: 'Rank',
      lblHintTribe: 'Tribe',
      lblHintAttr: 'Attr',
      resetSettings: 'Reset defaults',
      statsH: 'Stats',
      stPlayed: 'Played',
      stWinrate: 'Win rate',
      stStreak: 'Streak',
      stBest: 'Best',
      stDistTitle: 'Guess distribution',
      stModeDailyNote: 'Stats for Daily.',
      stModePracticeNote: 'Stats for Practice.',
      share: 'Share',
      copied: 'Copied!',
      guessCounter: 'Guesses {n}/{m}',
      headNum: '№',
      headName: 'Yo-kai',
      headRank: 'Rank',
      headTribe: 'Tribe',
      headAttr: 'Attr',
      unknown: '?'
    }
  };

  const DAILY_LIMIT = 6;
  const RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];
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
    return {
      daily: { won: 0, lost: 0, streak: 0, max: 0, dist: {} },
      practice: { won: 0, lost: 0, streak: 0, max: 0 }
    };
  }

  let state = {
    lang: safeGet('ykw-lang') || 'ko',
    gameId: 'ykw1',
    versionId: 'main',
    mode: 'daily',
    rounds: 10,
    roster: null,
    target: null,
    guesses: [],
    won: false,
    over: false,
    limit: DAILY_LIMIT,
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

  (function migrateStats() {
    if (!safeGet('ykw-stats')) {
      const st = defaultStats();
      const pw = parseInt(safeGet('ykw-practice-wins') || '0', 10);
      const pt = parseInt(safeGet('ykw-practice-total') || '0', 10);
      if (pw || pt) {
        st.practice.won = pw;
        st.practice.lost = Math.max(0, pt - pw);
      }
      safeSet('ykw-stats', JSON.stringify(st));
    }
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
  function entryName(e) { return state.lang === 'ko' ? (e.ko || e.en) : e.en; }
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
    const colors = ['#ffd54a', '#ffb347', '#4d9bff', '#ff5d6c', '#46c07b', '#ffffff'];
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
    if (!s || !s.daily || !s.practice) s = defaultStats();
    return s;
  }
  function saveStats(s) { safeSet('ykw-stats', JSON.stringify(s)); }
  function recordWin(mode, guessCount) {
    const st = stats();
    const m = st[mode];
    m.won++;
    m.streak++;
    if (m.streak > m.max) m.max = m.streak;
    if (guessCount) m.dist[String(guessCount)] = (m.dist[String(guessCount)] || 0) + 1;
    saveStats(st);
    return st;
  }
  function recordLoss(mode) {
    const st = stats();
    const m = st[mode];
    m.lost++;
    m.streak = 0;
    saveStats(st);
    return st;
  }

  // ---------- caught ----------
  function caughtSet() {
    try { const o = JSON.parse(safeGet('ykw-caught')); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
  }
  function caughtNums(gameId) { return caughtSet()[gameId] || []; }
  function markCaught(gameId, n) {
    const c = caughtSet();
    const arr = c[gameId] || [];
    if (arr.indexOf(n) === -1) arr.push(n);
    c[gameId] = arr;
    safeSet('ykw-caught', JSON.stringify(c));
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
    state.limit = state.mode === 'daily' ? DAILY_LIMIT : state.rounds;

    if (state.mode === 'daily') {
      state.target = dailyTarget();
      const savedRaw = safeGet(dailyKey());
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw);
          state.guesses = (saved.guesses || []).filter((e) => e && typeof e.n === 'number');
          state.won = !!saved.won;
          state.over = state.won || state.guesses.length >= state.limit;
        } catch (e) {
          state.guesses = []; state.won = false; state.over = false;
        }
      } else {
        state.guesses = []; state.won = false; state.over = false;
      }
    } else {
      state.target = state.roster[Math.floor(Math.random() * state.roster.length)];
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
    if (!state.over) $('guess-input').focus();
    renderModeInfo();
    renderDex();
  }

  function playAgain() {
    if (state.mode === 'daily') {
      try { localStorage.removeItem(dailyKey()); } catch (e) {}
    }
    startGame();
  }

  function renderModeInfo() {
    $('mode-info').textContent =
      T(state.mode === 'daily' ? 'modeDaily_desc' : 'modePractice_desc') +
      ' · ' + T('guessCounter').replace('{n}', String(state.guesses.length)).replace('{m}', String(state.limit));
  }

  function renderBoard() {
    const container = $('guesses-container');
    while (container.children.length > 1) container.removeChild(container.lastChild);
    state.guesses.forEach(renderGuessRow);
    applyCols();
  }

  function renderGuessRow(guess) {
    const container = $('guesses-container');
    const row = document.createElement('div');
    row.className = 'guess-row';

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
        const arrow = rankCompare(guess.rank, state.target.rank) > 0 ? ' ▼' : ' ▲';
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
    if (state.guesses.some((g) => g.n === hit.n)) { input.value = ''; return; }

    state.guesses.push(hit);
    input.value = '';
    $('suggestions').classList.add('hidden');

    if (hit.n === state.target.n) {
      endGame(true);
      return;
    }
    play('click');
    if (state.guesses.length >= state.limit) {
      endGame(false);
      return;
    }
    renderBoard();
    renderModeInfo();
    $('guess-input').focus();
  }

  function endGame(won) {
    state.won = won;
    state.over = true;
    if (state.mode === 'daily') saveDaily();
    if (won) {
      recordWin(state.mode, state.guesses.length);
      markCaught(state.gameId, state.target.n);
    } else {
      recordLoss(state.mode);
    }
    if (won) { spawnConfetti(); play('win'); } else play('wrong');
    renderResult();
    renderDex();
  }

  // ---------- result ----------
  function renderResult() {
    $('game-board').classList.add('hidden');
    $('result-screen').classList.remove('hidden');

    const title = $('result-title');
    title.textContent = state.won ? T('win') : T('lose');
    title.classList.remove('pop'); void title.offsetWidth; title.classList.add('pop');

    $('result-number').textContent = '#' + String(state.target.n).padStart(3, '0');
    $('result-name').textContent =
      state.target.en + (state.target.ko && state.target.ko !== state.target.en ? ' / ' + state.target.ko : '');

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
    const g = gameById(state.gameId);
    const head = '요괴워치 즐 · ' + (state.lang === 'ko' ? g.name.ko : g.name.en) +
      (state.mode === 'daily' ? ' (' + getTodayKST() + ')' : '');
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
  }

  // ---------- stats panel ----------
  function renderStats() {
    const st = stats();
    const m = st[state.mode];
    const played = m.won + m.lost;
    $('st-played').textContent = played;
    $('st-winrate').textContent = (played ? Math.round(m.won / played * 100) : 0) + '%';
    $('st-streak').textContent = m.streak;
    $('st-best').textContent = m.max;
    $('st-mode-note').textContent = T(state.mode === 'daily' ? 'stModeDailyNote' : 'stModePracticeNote');

    const box = $('st-dist');
    box.innerHTML = '';
    const dist = m.dist || {};
    let maxV = 1;
    for (const k in dist) if (+k > maxV) maxV = +k;
    const maxCols = 10;
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

  // ---------- dex ----------
  function renderDex() {
    const list = state.roster || [];
    const q = normalize($('dex-search').value);
    let filtered = list;
    if (q) filtered = list.filter((y) => normalize(y.en).includes(q) || (y.ko && normalize(y.ko).includes(q)));

    const caught = caughtNums(state.gameId);
    const inRoster = caught.filter((n) => list.some((e) => e.n === n));
    const prog = $('dex-progress');
    if (list.length) {
      prog.hidden = false;
      $('dex-progress-bar').style.width = Math.round(inRoster.length / list.length * 100) + '%';
      $('dex-progress-label').textContent =
        T('caughtProgress').replace('{n}', String(inRoster.length)).replace('{m}', String(list.length));
    } else {
      prog.hidden = true;
      $('dex-progress-label').textContent = '';
    }

    const grid = $('dex-grid');
    grid.innerHTML = '';
    filtered.forEach((yo) => {
      const item = document.createElement('div');
      item.className = 'dex-item' + (inRoster.indexOf(yo.n) !== -1 ? ' caught' : '');

      const num = document.createElement('span');
      num.className = 'dex-num';
      num.textContent = '#' + String(yo.n).padStart(3, '0');

      const name = document.createElement('div');
      name.style.flex = '1';

      const koName = document.createElement('div');
      koName.className = 'dex-name';
      koName.innerHTML = (inRoster.indexOf(yo.n) !== -1 ? '<span class="catch-mrk">✓</span>' : '') +
        escapeHtml(entryName(yo));

      const info = document.createElement('div');
      info.className = 'dex-info';
      info.textContent = (yo.rank || '?') + ' • ' + (yo.tribe ? tribeLabel(yo.tribe) : '?') + ' • ' + (yo.attr ? attrLabel(yo.attr) : '?');

      name.appendChild(koName);
      name.appendChild(info);

      item.appendChild(num);
      item.appendChild(name);
      grid.appendChild(item);
    });
  }
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- selects ----------
  function fillSelects() {
    const gSel = $('game-select');
    gSel.innerHTML = '';
    DATA.games.forEach((g) => {
      const o = document.createElement('option');
      o.value = g.id;
      o.textContent = state.lang === 'ko' ? g.name.ko : g.name.en;
      if (g.id === state.gameId) o.selected = true;
      gSel.appendChild(o);
    });

    fillVersionSelect();

    const mSel = $('mode-select');
    mSel.innerHTML = '';
    ['daily', 'practice'].forEach((m) => {
      const o = document.createElement('option');
      o.value = m;
      o.textContent = T(m === 'daily' ? 'modeDaily' : 'modePractice');
      if (m === state.mode) o.selected = true;
      mSel.appendChild(o);
    });

    const rSel = $('round-select');
    rSel.innerHTML = '';
    [10, 50, 100].forEach((n) => {
      const o = document.createElement('option');
      o.value = n;
      o.textContent = n + ' ' + T('rounds_txt');
      if (n === state.rounds) o.selected = true;
      rSel.appendChild(o);
    });
    rSel.hidden = state.mode !== 'practice';
  }
  function fillVersionSelect() {
    const vSel = $('version-select');
    vSel.innerHTML = '';
    const g = gameById(state.gameId);
    g.versions.forEach((v) => {
      const o = document.createElement('option');
      o.value = v.id;
      o.textContent = g.versions.length > 1 ? v.label.ko + ' · ' + v.label.en : v.label.ko;
      if (v.id === state.versionId) o.selected = true;
      vSel.appendChild(o);
    });
  }

  // ---------- language ----------
  function applyLang() {
    document.documentElement.lang = state.lang === 'ko' ? 'ko' : 'en';
    $('lang-label').textContent = T('langName');
    $('lang-toggle').checked = state.lang === 'en';
    $('new-game-btn').textContent = T('newGame');
    $('submit-btn').textContent = T('submit');
    $('guess-input').placeholder = T('placeholder');
    $('help-btn').title = T('help');
    $('settings-btn').title = T('settingsH');
    $('stats-btn').title = T('statsH');
    $('dex-title').textContent = T('dexTitle');
    $('dex-search').placeholder = T('dexSearch');
    $('footer-text').textContent = T('footer');
    $('settings-title').textContent = T('settingsH');
    $('lbl-sound').textContent = T('lblSound');
    $('lbl-hints').textContent = T('lblHints');
    $('lbl-hint-rank').textContent = T('lblHintRank');
    $('lbl-hint-tribe').textContent = T('lblHintTribe');
    $('lbl-hint-attr').textContent = T('lblHintAttr');
    $('reset-settings').textContent = T('resetSettings');
    $('stats-title').textContent = T('statsH');
    $('lbl-st-played').textContent = T('stPlayed');
    $('lbl-st-winrate').textContent = T('stWinrate');
    $('lbl-st-streak').textContent = T('stStreak');
    $('lbl-st-best').textContent = T('stBest');
    $('st-dist-title').textContent = T('stDistTitle');
    $('share-btn').textContent = T('share');

    const cells = document.querySelectorAll('.guess-header .col-num, .guess-header .col-name, .guess-header .col-rank, .guess-header .col-tribe, .guess-header .col-attr');
    const refs = { 'col-num': 'headNum', 'col-name': 'headName', 'col-rank': 'headRank', 'col-tribe': 'headTribe', 'col-attr': 'headAttr' };
    cells.forEach((el) => {
      el.textContent = T(refs[el.className]);
    });

    fillSelects();
    renderModeInfo();
  }

  // ---------- events ----------
  function togglePanel(id) {
    const el = $(id);
    el.classList.toggle('hidden');
    if (id === 'stats-panel' && !el.classList.contains('hidden')) renderStats();
    if (id === 'settings-panel' && !el.classList.contains('hidden')) applySettingsUI();
  }

  function bindEvents() {
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

    $('mode-select').addEventListener('change', (e) => {
      state.mode = e.target.value === 'daily' ? 'daily' : 'practice';
      $('round-select').hidden = state.mode !== 'practice';
      startGame();
    });

    $('round-select').addEventListener('change', (e) => {
      state.rounds = parseInt(e.target.value, 10);
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

    $('dex-search').addEventListener('input', renderDex);
    $('help-btn').addEventListener('click', () => $('help-section').classList.toggle('hidden'));
    $('stats-btn').addEventListener('click', () => togglePanel('stats-panel'));
    $('settings-btn').addEventListener('click', () => togglePanel('settings-panel'));

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
      renderDex();
    });

    document.addEventListener('pointerdown', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });
  }

  // ---------- suggestions ----------
  function suggest(q) {
    const val = normalize(q);
    const ul = $('suggestions');
    if (!val) { ul.classList.add('hidden'); return; }
    const list = roster();
    const matches = list
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
    applySettingsUI();
    startGame();
  }

  window.addEventListener('load', init);
})();