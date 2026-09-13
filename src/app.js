(function () {
  'use strict';

  var DATA = window.YKW_DATA;
  var $ = function (id) { return document.getElementById(id); };

  var I18N = {
    ko: {
      langName: 'English',
      modeInfoDaily: '매일 자정에 바뀌는 도감 하나를 맞혀보세요.',
      modeInfoPractice: '무제한! 새 요괴가 계속 나옵니다.',
      newGame: '새 게임',
      againPractice: '다음 요괴',
      againDaily: '내일의 요괴',
      guess: '맞혀보기',
      placeholder: '요괴 이름 입력…',
      win: '정답!',
      lose: '정답 공개',
      helpH: '게임 방법',
      help1: '숨겨진 요괴 1마리를 도감번호·부족·속성·랭크 힌트로 맞힙니다.',
      help2: '입력칸에 요괴 이름을 넣고 「맞혀보기」를 누르세요.',
      help3: '번호 칸의 화살표는 정답보다 앞/뒤 번호임을 알려줍니다. 랭크도 ▲▼로 대소를 알려줍니다.',
      help4: '부족·속성이 같으면 초록색으로 표시됩니다.',
      headName: '요괴',
      headRank: '랭크',
      headTribe: '부족',
      headAttr: '속성',
      modeDaily: '일일 도전',
      modePractice: '연습',
      dexTitle: '도감',
      dexSearch: '요괴 검색…',
      unknown: '?',
      foot: '데이터 출처: 요괴워치 시리즈 도감 · 나무위키 (비공식 팬 번역 포함).',
    },
    en: {
      langName: '한국어',
      modeInfoDaily: 'One yo-kai a day. Resets at midnight.',
      modeInfoPractice: 'Unlimited! A new yo-kai every round.',
      newGame: 'New game',
      againPractice: 'Next yo-kai',
      againDaily: "Tomorrow's yo-kai",
      guess: 'Guess',
      placeholder: 'Type a yo-kai name…',
      win: 'Correct!',
      lose: 'Answer revealed',
      helpH: 'How to play',
      help1: 'Guess one hidden yo-kai using Medallium number, tribe, attribute and rank hints.',
      help2: 'Type a yo-kai name and press “Guess”.',
      help3: 'The arrow in the № column shows whether the answer is numbered higher or lower. Rank arrows show the same.',
      help4: 'Matching tribe / attribute cells turn green.',
      headName: 'Yo-kai',
      headRank: 'Rank',
      headTribe: 'Tribe',
      headAttr: 'Attr',
      modeDaily: 'Daily',
      modePractice: 'Practice',
      dexTitle: 'Medallium',
      dexSearch: 'Search yo-kai…',
      unknown: '?',
      foot: 'Data: Yo-kai Watch medallium · namu.wiki (unofficial fan translations included).',
    },
  };

  var RANKS = ['S', 'A', 'B', 'C', 'D', 'E'];
  var RANK_COLOR = { S: 'var(--chip-s)', A: 'var(--chip-a)', B: 'var(--chip-b)', C: 'var(--chip-c)', D: 'var(--chip-d)', E: 'var(--chip-e)' };
  var TRIBE_COLOR = {};
  var ATTR_COLOR = {};
  function hueColor(name, sat) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return 'hsl(' + h + ', ' + (sat || 62) + '%, 56%)';
  }
  DATA.meta.tribes.forEach(function (t) { TRIBE_COLOR[t.en] = hueColor(t.en); });
  DATA.meta.attrs.forEach(function (a) { ATTR_COLOR[a] = hueColor(a); });
  TRIBE_COLOR.Boss = '#e4572e';
  TRIBE_COLOR.Legendary = '#ffd54a';
  TRIBE_COLOR.Enma = '#c0392b';

  var state = { lang: 'ko', gameId: 'ykw1', versionId: 'main', mode: 'daily', roster: null, target: null, guesses: [], won: false };
  var savedLang = null;
  try { savedLang = localStorage.getItem('ykw-lang'); } catch (e) {}
  if (savedLang === 'en' || savedLang === 'ko') state.lang = savedLang;

  var T = function (k) { return I18N[state.lang][k] || k; };

  function gameById(id) { return DATA.games.find(function (g) { return g.id === id; }); }
  function versionBy(game, id) { return game.versions.find(function (v) { return v.id === id; }); }
  function roster() { return state.roster; }

  function normalize(s) {
    return (s || '').replace(/[\u2018\u2019\u02bc]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function entryName(e) { return state.lang === 'ko' ? (e.ko || e.en) : e.en; }

  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ---------- board ----------
  function startGame() {
    var g = gameById(state.gameId);
    var v = versionBy(g, state.versionId);
    state.roster = v.list;
    if (state.mode === 'daily') {
      var key = 'ykw-daily-' + state.gameId + '-' + state.versionId + '-' + todayStr();
      var idx = hashString(state.gameId + '|' + state.versionId + '|' + todayStr()) % state.roster.length;
      state.target = state.roster[idx];
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(key)); } catch (e) {}
      state.guesses = ((saved && saved.g) || []).map(function (n) {
        return state.roster.find(function (e) { return e.n === n; });
      }).filter(Boolean);
      state.won = !!(saved && saved.w);
    } else {
      state.target = state.roster[Math.floor(Math.random() * state.roster.length)];
      state.guesses = [];
      state.won = false;
    }
    renderBoard();
    $('result').hidden = true;
    $('board').hidden = false;
    $('guess').value = '';
    $('guess').focus();
    $('mode-info').textContent = T(state.mode === 'daily' ? 'modeInfoDaily' : 'modeInfoPractice');
    renderDex();
  }

  function renderBoard() {
    var box = $('answers');
    while (box.children.length > 1) box.removeChild(box.lastChild);
    state.guesses.forEach(renderGuessRow);
    if (state.won) finishGame();
  }

  function rankCompare(a, b) {
    return DATA.meta.rankOrder[b] - DATA.meta.rankOrder[a];
  }

  function renderGuessRow(entry) {
    var box = $('answers');
    var div = document.createElement('div');
    div.className = 'answer-row';

    var num = document.createElement('span');
    num.className = 'c-num';
    if (entry.n === state.target.n) { num.className += ' cell ok'; num.textContent = '✓'; }
    else { num.className += ' arrow'; num.textContent = entry.n < state.target.n ? '▲ ' + entry.n : '▼ ' + entry.n; }
    div.appendChild(num);

    var nm = document.createElement('span');
    nm.className = 'c-name';
    nm.textContent = entryName(entry);
    div.appendChild(nm);

    var rk = document.createElement('span');
    rk.className = 'c-rank';
    if (entry.rank) {
      var rkE = document.createElement('span');
      rkE.className = 'cell';
      rkE.style.background = entry.rank === state.target.rank ? 'var(--ok)' : RANK_COLOR[entry.rank];
      rkE.style.color = entry.rank === state.target.rank ? '#04240f' : '#000';
      rkE.textContent = entry.rank + (entry.rank === state.target.rank ? '' : (rankCompare(entry.rank, state.target.rank) > 0 ? ' ▲' : ' ▼'));
      rk.appendChild(rkE);
    } else { rk.innerHTML = '<span class="cell blank">?</span>'; }
    div.appendChild(rk);

    var tb = document.createElement('span');
    tb.className = 'c-tribe';
    if (entry.tribe) {
      var tbE = document.createElement('span');
      tbE.className = 'cell';
      var okT = entry.tribe === state.target.tribe;
      tbE.style.background = okT ? 'var(--ok)' : TRIBE_COLOR[entry.tribe];
      tbE.style.color = okT ? '#04240f' : '#000';
      tbE.textContent = tribeLabel(entry.tribe);
      tb.appendChild(tbE);
    } else { tb.innerHTML = '<span class="cell blank">?</span>'; }
    div.appendChild(tb);

    var at = document.createElement('span');
    at.className = 'c-attr';
    if (entry.attr) {
      var atE = document.createElement('span');
      atE.className = 'cell';
      var okA = entry.attr === state.target.attr;
      atE.style.background = okA ? 'var(--ok)' : ATTR_COLOR[entry.attr];
      atE.style.color = okA ? '#04240f' : '#000';
      atE.textContent = attrLabel(entry.attr);
      at.appendChild(atE);
    } else { at.innerHTML = '<span class="cell blank">?</span>'; }
    div.appendChild(at);

    box.appendChild(div);
  }

  function tribeLabel(id) {
    var t = DATA.meta.tribes.find(function (x) { return x.en === id; });
    if (state.lang === 'ko' && t && t.ko !== t.en) return t.ko;
    return id;
  }
  function attrLabel(id) {
    if (state.lang === 'ko') return DATA.meta.attrKo[id] || id;
    return id;
  }
  function rankLabel(id) { return id; }

  function submitGuess() {
    var raw = normalize($('guess').value);
    if (!raw) return;
    var hit = roster().find(function (e) {
      return normalize(e.en) === raw || (e.ko && normalize(e.ko) === raw);
    });
    if (!hit) { $('guess').classList.remove('shake'); void $('guess').offsetWidth; $('guess').classList.add('shake'); return; }
    if (state.guesses.some(function (g) { return g.n === hit.n; })) { $('guess').value = ''; return; }
    state.guesses.push(hit);
    if (hit.n === state.target.n) state.won = true;
    if (state.mode === 'daily') saveDaily();
    renderBoard();
    $('guess').value = '';
    $('suggest').hidden = true;
    $('guess').focus();
  }

  function saveDaily() {
    var key = 'ykw-daily-' + state.gameId + '-' + state.versionId + '-' + todayStr();
    try { localStorage.setItem(key, JSON.stringify({ g: state.guesses.map(function (x) { return x.n; }), w: state.won, t: state.target.n })); } catch (e) {}
  }

  function finishGame() {
    $('board').hidden = true;
    var res = $('result');
    res.hidden = false;
    $('win-title').textContent = state.won ? T('win') : T('lose');
    $('win-num').textContent = '#' + String(state.target.n).padStart(3, '0');
    $('win-rank').innerHTML = '';
    $('win-tribe').innerHTML = '';
    $('win-attr').innerHTML = '';
    var rk = document.createElement('span');
    rk.className = 'chip'; rk.style.background = RANK_COLOR[state.target.rank] || 'var(--line)';
    rk.style.color = '#000'; rk.textContent = rankLabel(state.target.rank) || T('unknown');
    $('win-rank').appendChild(rk);
    ['tribe', 'attr'].forEach(function (f) {
      var v = state.target[f];
      var el = document.createElement('span');
      el.className = 'chip';
      el.style.background = (f === 'tribe' ? TRIBE_COLOR[v] : ATTR_COLOR[v]) || 'var(--line)';
      el.style.color = '#000';
      el.textContent = v ? (f === 'tribe' ? tribeLabel(v) : attrLabel(v)) : T('unknown');
      $('win-' + f).appendChild(el);
    });
    $('win-name').textContent = state.target.en + (state.target.ko && state.target.ko !== state.target.en ? ' / ' + state.target.ko : '');
    $('again').textContent = T(state.mode === 'daily' ? 'againDaily' : 'againPractice');
    $('again').onclick = function () {
      if (state.mode === 'daily') { state.guesses = []; state.won = false; startGame(); }
      else startGame();
    };
  }

  // ---------- suggestions ----------
  function suggest(q) {
    var val = normalize(q);
    if (!val) { $('suggest').hidden = true; return; }
    var list = roster().filter(function (e) {
      return normalize(e.en).indexOf(val) !== -1 || (e.ko && normalize(e.ko).indexOf(val) !== -1);
    });
    list.sort(function (a, b) {
      return normalize(a.en).indexOf(val) - normalize(b.en).indexOf(val);
    });
    var ul = $('suggest');
    ul.innerHTML = '';
    list.slice(0, 8).forEach(function (e) {
      var li = document.createElement('li');
      var display = (state.lang === 'ko' && e.ko) ? e.ko : e.en;
      li.textContent = '#' + String(e.n).padStart(3, '0') + ' ' + display;
      li.onclick = function () {
        var v = (state.lang === 'ko' && e.ko) ? e.ko : e.en;
        $('guess').value = v;
        ul.hidden = true;
        $('guess').focus();
        submitGuess();
      };
      ul.appendChild(li);
    });
    ul.hidden = list.length === 0;
  }

  // ---------- dex ----------
  function renderDex() {
    var rows = state.roster;
    var q = normalize($('dex-search').value);
    if (q) rows = rows.filter(function (e) { return normalize(e.en).indexOf(q) !== -1 || (e.ko && normalize(e.ko).indexOf(q) !== -1); });
    var box = $('dex');
    box.innerHTML = '';
    rows.forEach(function (e) {
      var row = document.createElement('div');
      row.className = 'row';
      var n = document.createElement('span'); n.className = 'num'; n.textContent = '#' + String(e.n).padStart(3, '0');
      var nm = document.createElement('span');
      nm.className = 'nm';
      nm.innerHTML = escapeHtml(state.lang === 'ko' ? (e.ko || e.en) : e.en) +
        '<span class="teal"> · ' + (e.rank || '?') + ' · ' + (e.tribe ? tribeLabel(e.tribe) : '?') + ' · ' + (e.attr ? attrLabel(e.attr) : '?') + '</span>';
      row.appendChild(n); row.appendChild(nm);
      box.appendChild(row);
    });
  }
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- events ----------
  function bind() {
    $('game').addEventListener('change', function (e) {
      state.gameId = e.target.value;
      var g = gameById(state.gameId);
      state.versionId = g.versions[0].id;
      fillVersionSelect();
      startGame();
    });
    $('version').addEventListener('change', function (e) {
      state.versionId = e.target.value;
      startGame();
    });
    $('mode').addEventListener('change', function (e) {
      state.mode = e.target.value;
      startGame();
    });
    $('new-game').addEventListener('click', function () {
      if (state.mode === 'practice') { state.guesses = []; state.won = false; startGame(); }
      else { state.guesses = []; state.won = false; startGame(); }
    });
    $('guess-form').addEventListener('submit', function (e) { e.preventDefault(); submitGuess(); });
    $('guess').addEventListener('input', function () { suggest(this.value); });
    $('guess').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        var lis = $('suggest').querySelectorAll('li');
        var idx = -1;
        lis.forEach(function (li, i) { if (li.classList.contains('hl')) idx = i; });
        if (lis.length) {
          e.preventDefault();
          var next = e.key === 'ArrowDown' ? (idx + 1) % lis.length : (idx - 1 + lis.length) % lis.length;
          lis.forEach(function (li) { li.classList.remove('hl'); });
          lis[next].classList.add('hl');
        }
      } else if (e.key === 'Enter') {
        var sel = $('suggest').querySelector('li.hl');
        if (sel) { e.preventDefault(); sel.click(); }
      } else if (e.key === 'Escape') { $('suggest').hidden = true; }
    });
    $('dex-search').addEventListener('input', renderDex);
    $('help-btn').addEventListener('click', function () { $('help').hidden = !$('help').hidden; });
    $('lang').addEventListener('change', function (e) {
      state.lang = e.target.checked ? 'en' : 'ko';
      try { localStorage.setItem('ykw-lang', state.lang); } catch (err) {}
      applyLang();
      renderBoard();
      renderDex();
      var inp = $('guess');
      if (inp.value) suggest(inp.value);
      if (!state.won) $('board').hidden = false;
    });
  }

  function applyLang() {
    document.documentElement.lang = state.lang === 'ko' ? 'ko' : 'en';
    $('subtitle-en').textContent = 'Yo-kai Watchle';
    $('lang-title').textContent = T('langName');
    $('lang').checked = state.lang === 'en';
    $('new-game').textContent = T('newGame');
    $('submit').textContent = T('guess');
    $('guess').placeholder = T('placeholder');
    $('help-btn').title = T('helpH');
    $('help-h').textContent = T('helpH');
    $('help-p1').textContent = T('help1');
    $('help-p2').textContent = T('help2');
    $('help-p3').textContent = T('help3');
    $('help-p4').textContent = T('help4');
    $('dex-title').textContent = T('dexTitle');
    $('dex-search').placeholder = T('dexSearch');
    $('foot').textContent = T('foot');
    $('mode-info').textContent = T(state.mode === 'daily' ? 'modeInfoDaily' : 'modeInfoPractice');
    var rh = $('answers').querySelector('.head');
    if (rh) {
      var cells = rh.children;
      cells[1].textContent = T('headName');
      cells[2].textContent = T('headRank');
      cells[3].textContent = T('headTribe');
      cells[4].textContent = T('headAttr');
    }
    fillSelects();
  }

  // ---------- init ----------
  function bind() {
    $('game').addEventListener('change', function (e) {
      state.gameId = e.target.value;
      var g = gameById(state.gameId);
      state.versionId = g.versions[0].id;
      fillVersionSelect();
      startGame();
    });
    $('version').addEventListener('change', function (e) {
      state.versionId = e.target.value;
      startGame();
    });
    $('mode').addEventListener('change', function (e) {
      state.mode = e.target.value;
      startGame();
    });
    $('new-game').addEventListener('click', function () { startGame(); });
    $('guess-form').addEventListener('submit', function (e) { e.preventDefault(); submitGuess(); });
    $('guess').addEventListener('input', function () { suggest(this.value); });
    $('guess').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        var lis = $('suggest').querySelectorAll('li');
        var idx = -1;
        lis.forEach(function (li, i) { if (li.classList.contains('hl')) idx = i; });
        if (lis.length) {
          e.preventDefault();
          var next = e.key === 'ArrowDown' ? (idx + 1) % lis.length : (idx - 1 + lis.length) % lis.length;
          lis.forEach(function (li) { li.classList.remove('hl'); });
          lis[next].classList.add('hl');
        }
      } else if (e.key === 'Enter') {
        var sel = $('suggest').querySelector('li.hl');
        if (sel) { e.preventDefault(); sel.click(); }
      } else if (e.key === 'Escape') { $('suggest').hidden = true; }
    });
    $('dex-search').addEventListener('input', renderDex);
    $('help-btn').addEventListener('click', function () { $('help').hidden = !$('help').hidden; });
    $('lang').addEventListener('change', function (e) {
      state.lang = e.target.checked ? 'en' : 'ko';
      try { localStorage.setItem('ykw-lang', state.lang); } catch (err) {}
      applyLang();
      renderBoard();
      renderDex();
      var inp = $('guess');
      if (inp.value) suggest(inp.value);
      if (!state.won && $('result').hidden === false) { $('board').hidden = false; $('result').hidden = true; }
    });
  }

  function fillSelects() {
    var gSel = $('game'), vSel = $('version'), mSel = $('mode');
    gSel.innerHTML = '';
    DATA.games.forEach(function (g) {
      var o = document.createElement('option');
      o.value = g.id; o.textContent = state.lang === 'ko' ? g.name.ko : g.name.en;
      if (g.id === state.gameId) o.selected = true;
      gSel.appendChild(o);
    });
    mSel.innerHTML = '';
    ['daily', 'practice'].forEach(function (m) {
      var o = document.createElement('option');
      o.value = m; o.textContent = T(m === 'daily' ? 'modeDaily' : 'modePractice');
      if (m === state.mode) o.selected = true;
      mSel.appendChild(o);
    });
    fillVersionSelect();
  }
  function fillVersionSelect() {
    var vSel = $('version');
    vSel.innerHTML = '';
    var g = gameById(state.gameId);
    g.versions.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v.id;
      o.textContent = (g.versions.length > 1 ? v.label.ko + ' · ' + v.label.en : v.label.ko);
      if (v.id === state.versionId) o.selected = true;
      vSel.appendChild(o);
    });
  }

  function init() {
    bind();
    applyLang();
    startGame();
  }

  init();
})();