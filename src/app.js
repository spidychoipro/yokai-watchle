(function () {
  'use strict';

  const DATA = window.YKW_DATA;
  const $ = (id) => document.getElementById(id);

  // 다국어 설정
  const I18N = {
    ko: {
      langName: 'EN',
      modeDaily: '일일 도전',
      modePractice: '연습',
      modeDaily_desc: '매일 자정(KST)에 바뀌는 요괴를 맞혀보세요',
      modePractice_desc: '무제한으로 요괴를 맞혀보세요',
      newGame: '새 게임',
      submit: '맞혀보기',
      placeholder: '요괴 이름 입력...',
      win: '정답!',
      lose: '정답 공개',
      playAgain: '다시 하기',
      help: '게임 설명',
      dexTitle: '요괴 도감',
      dexSearch: '요괴 검색...',
      correct: '정답입니다!',
      gameOver: '게임 끝',
      nextRound: '다음 라운드',
      stats: '통계',
      wins: '승리',
      rate: '정답률',
      footer: '데이터: 요괴워치 도감'
    },
    en: {
      langName: '한국어',
      modeDaily: 'Daily',
      modePractice: 'Practice',
      modeDaily_desc: 'New yo-kai every day at midnight (KST)',
      modePractice_desc: 'Unlimited practice rounds',
      newGame: 'New Game',
      submit: 'Guess',
      placeholder: 'Type yo-kai name...',
      win: 'Correct!',
      lose: 'Answer revealed',
      playAgain: 'Play Again',
      help: 'How to Play',
      dexTitle: 'Medallium',
      dexSearch: 'Search yo-kai...',
      correct: 'You got it!',
      gameOver: 'Game Over',
      nextRound: 'Next Round',
      stats: 'Stats',
      wins: 'Wins',
      rate: 'Win Rate',
      footer: 'Data: Yo-kai Watch Medallium'
    }
  };

  // 상태 관리
  let state = {
    lang: localStorage.getItem('ykw-lang') || 'ko',
    mode: 'daily',
    rounds: 10,
    gameActive: false,
    currentRound: 1,
    totalRounds: 10,
    target: null,
    guesses: [],
    won: false,
    stats: {
      dailyWon: false,
      practiceWins: parseInt(localStorage.getItem('ykw-practice-wins') || '0'),
      practiceTotal: parseInt(localStorage.getItem('ykw-practice-total') || '0')
    }
  };

  // 텍스트 가져오기
  const T = (key) => I18N[state.lang][key] || key;

  // KST 자정 기준 오늘 문자열 가져오기
  function getTodayKST() {
    const now = new Date();
    const kstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 문자열 해시
  function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  // 요괴 목록 가져오기
  function getYokaiList() {
    if (!DATA || !DATA.games || DATA.games.length === 0) return [];
    const game = DATA.games[0];
    if (!game.versions || game.versions.length === 0) return [];
    return game.versions[0].list || [];
  }

  // 일일 도전 요괴 결정
  function getDailyYokai() {
    const list = getYokaiList();
    if (list.length === 0) return null;
    const todayStr = getTodayKST();
    const idx = hashString(todayStr) % list.length;
    return list[idx];
  }

  // 게임 시작
  function startGame() {
    const list = getYokaiList();
    if (list.length === 0) {
      alert('요괴 데이터를 로드할 수 없습니다.');
      return;
    }

    state.guesses = [];
    state.won = false;
    state.gameActive = true;

    if (state.mode === 'daily') {
      state.target = getDailyYokai();
      state.currentRound = 1;
      state.totalRounds = 6;
      
      // 오늘 이미 플레이했는지 확인
      const todayStr = getTodayKST();
      const saved = localStorage.getItem(`ykw-daily-${todayStr}`);
      if (saved) {
        const data = JSON.parse(saved);
        state.guesses = data.guesses || [];
        state.won = data.won || false;
        if (state.won || state.guesses.length >= state.totalRounds) {
          state.gameActive = false;
        }
      }
    } else {
      state.target = list[Math.floor(Math.random() * list.length)];
      state.currentRound = 1;
      state.totalRounds = state.rounds;
    }

    renderGame();
    $('guess-input').focus();
  }

  // 게임 렌더링
  function renderGame() {
    const board = $('game-board');
    const guessContainer = $('guesses-container');

    // 기존 추측 제거 (헤더 제외)
    while (guessContainer.children.length > 1) {
      guessContainer.removeChild(guessContainer.lastChild);
    }

    // 추측 목록 렌더링
    state.guesses.forEach((guess, idx) => {
      renderGuessRow(guess, idx);
    });

    if (state.won) {
      showWinScreen();
    } else if (state.guesses.length >= state.totalRounds) {
      showLoseScreen();
    } else {
      board.classList.remove('hidden');
      $('result-screen').classList.add('hidden');
    }
  }

  // 추측 행 렌더링
  function renderGuessRow(guess, index) {
    const guessContainer = $('guesses-container');
    const row = document.createElement('div');
    row.className = 'guess-row';

    const numCell = document.createElement('span');
    numCell.className = 'col-num';
    if (guess.n === state.target.n) {
      numCell.textContent = '✓';
      numCell.style.background = 'var(--success)';
      numCell.style.color = 'white';
    } else {
      numCell.textContent = guess.n < state.target.n ? '▲' : '▼';
      numCell.style.color = 'var(--accent-2)';
    }
    row.appendChild(numCell);

    const nameCell = document.createElement('span');
    nameCell.className = 'col-name';
    nameCell.textContent = state.lang === 'ko' ? (guess.ko || guess.en) : guess.en;
    row.appendChild(nameCell);

    // 랭크
    const rankCell = document.createElement('span');
    rankCell.className = 'col-rank';
    if (guess.rank && state.target.rank) {
      const match = guess.rank === state.target.rank;
      rankCell.innerHTML = `<span class="cell ${match ? 'correct' : 'wrong'}">${guess.rank}${match ? '' : ' ▲▼'}</span>`;
    } else {
      rankCell.innerHTML = '<span class="cell hint">?</span>';
    }
    row.appendChild(rankCell);

    // 부족
    const tribeCell = document.createElement('span');
    tribeCell.className = 'col-tribe';
    if (guess.tribe && state.target.tribe) {
      const match = guess.tribe === state.target.tribe;
      tribeCell.innerHTML = `<span class="cell ${match ? 'correct' : 'wrong'}">${guess.tribe}</span>`;
    } else {
      tribeCell.innerHTML = '<span class="cell hint">?</span>';
    }
    row.appendChild(tribeCell);

    // 속성
    const attrCell = document.createElement('span');
    attrCell.className = 'col-attr';
    if (guess.attr && state.target.attr) {
      const match = guess.attr === state.target.attr;
      attrCell.innerHTML = `<span class="cell ${match ? 'correct' : 'wrong'}">${guess.attr}</span>`;
    } else {
      attrCell.innerHTML = '<span class="cell hint">?</span>';
    }
    row.appendChild(attrCell);

    guessContainer.appendChild(row);
  }

  // 맞춤법 정규화
  function normalize(s) {
    return (s || '')
      .replace(/[\u2018\u2019\u02bc]/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // 추측 제출
  function submitGuess() {
    if (!state.gameActive) return;

    const input = $('guess-input');
    const raw = normalize(input.value);
    input.value = '';

    if (!raw) return;

    const list = getYokaiList();
    const match = list.find(
      (y) =>
        normalize(y.en) === raw ||
        (y.ko && normalize(y.ko) === raw)
    );

    if (!match) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 300);
      return;
    }

    if (state.guesses.some((g) => g.n === match.n)) {
      return;
    }

    state.guesses.push(match);

    if (match.n === state.target.n) {
      state.won = true;
      state.gameActive = false;
      state.stats.practiceWins++;
      
      if (state.mode === 'daily') {
        const todayStr = getTodayKST();
        localStorage.setItem(
          `ykw-daily-${todayStr}`,
          JSON.stringify({ guesses: state.guesses, won: true })
        );
      } else {
        state.stats.practiceTotal++;
        localStorage.setItem('ykw-practice-wins', state.stats.practiceWins);
        localStorage.setItem('ykw-practice-total', state.stats.practiceTotal);
      }
    } else if (state.guesses.length >= state.totalRounds) {
      state.gameActive = false;
      
      if (state.mode === 'daily') {
        const todayStr = getTodayKST();
        localStorage.setItem(
          `ykw-daily-${todayStr}`,
          JSON.stringify({ guesses: state.guesses, won: false })
        );
      } else {
        state.stats.practiceTotal++;
        localStorage.setItem('ykw-practice-total', state.stats.practiceTotal);
      }
    }

    renderGame();
    input.focus();
  }

  // 승리 화면
  function showWinScreen() {
    $('game-board').classList.add('hidden');
    const result = $('result-screen');
    result.classList.remove('hidden');

    $('result-title').textContent = T('win');
    $('result-number').textContent = `#${String(state.target.n).padStart(3, '0')}`;
    $('result-name').textContent =
      state.target.en +
      (state.target.ko && state.target.ko !== state.target.en
        ? ` / ${state.target.ko}`
        : '');

    const badges = $('result-badges');
    badges.innerHTML = '';

    if (state.target.rank) {
      const rankBadge = document.createElement('span');
      rankBadge.className = 'badge';
      rankBadge.textContent = state.target.rank;
      badges.appendChild(rankBadge);
    }

    if (state.target.tribe) {
      const tribeBadge = document.createElement('span');
      tribeBadge.className = 'badge';
      tribeBadge.textContent = state.target.tribe;
      badges.appendChild(tribeBadge);
    }

    if (state.target.attr) {
      const attrBadge = document.createElement('span');
      attrBadge.className = 'badge';
      attrBadge.textContent = state.target.attr;
      badges.appendChild(attrBadge);
    }

    $('play-again-btn').textContent = T('playAgain');
    $('play-again-btn').onclick = startGame;
  }

  // 패배 화면
  function showLoseScreen() {
    $('game-board').classList.add('hidden');
    const result = $('result-screen');
    result.classList.remove('hidden');

    $('result-title').textContent = T('lose');
    $('result-number').textContent = `#${String(state.target.n).padStart(3, '0')}`;
    $('result-name').textContent =
      state.target.en +
      (state.target.ko && state.target.ko !== state.target.en
        ? ` / ${state.target.ko}`
        : '');

    const badges = $('result-badges');
    badges.innerHTML = '';

    if (state.target.rank) {
      const rankBadge = document.createElement('span');
      rankBadge.className = 'badge';
      rankBadge.textContent = state.target.rank;
      badges.appendChild(rankBadge);
    }

    if (state.target.tribe) {
      const tribeBadge = document.createElement('span');
      tribeBadge.className = 'badge';
      tribeBadge.textContent = state.target.tribe;
      badges.appendChild(tribeBadge);
    }

    if (state.target.attr) {
      const attrBadge = document.createElement('span');
      attrBadge.className = 'badge';
      attrBadge.textContent = state.target.attr;
      badges.appendChild(attrBadge);
    }

    $('play-again-btn').textContent = T('playAgain');
    $('play-again-btn').onclick = startGame;
  }

  // 도감 렌더링
  function renderDex() {
    const list = getYokaiList();
    const search = normalize($('dex-search').value);

    let filtered = list;
    if (search) {
      filtered = list.filter(
        (y) =>
          normalize(y.en).includes(search) ||
          (y.ko && normalize(y.ko).includes(search))
      );
    }

    const grid = $('dex-grid');
    grid.innerHTML = '';

    filtered.slice(0, 100).forEach((yo) => {
      const item = document.createElement('div');
      item.className = 'dex-item';

      const num = document.createElement('span');
      num.className = 'dex-num';
      num.textContent = `#${String(yo.n).padStart(3, '0')}`;

      const name = document.createElement('div');
      name.style.flex = '1';

      const koName = document.createElement('div');
      koName.className = 'dex-name';
      koName.textContent = state.lang === 'ko' ? (yo.ko || yo.en) : yo.en;

      const info = document.createElement('div');
      info.className = 'dex-info';
      info.textContent = `${yo.rank || '?'} • ${yo.tribe || '?'} • ${yo.attr || '?'}`;

      name.appendChild(koName);
      name.appendChild(info);

      item.appendChild(num);
      item.appendChild(name);
      grid.appendChild(item);
    });
  }

  // 이벤트 바인딩
  function bindEvents() {
    $('game-select').addEventListener('change', (e) => {
      state.mode = e.target.value === 'daily' ? 'daily' : 'practice';
      if (state.mode === 'practice') {
        $('version-select').style.display = 'none';
      } else {
        $('version-select').style.display = 'block';
      }
      startGame();
    });

    $('mode-select').addEventListener('change', (e) => {
      state.rounds = parseInt(e.target.value);
      startGame();
    });

    $('new-game-btn').addEventListener('click', startGame);

    $('guess-form').addEventListener('submit', (e) => {
      e.preventDefault();
      submitGuess();
    });

    $('guess-input').addEventListener('input', (e) => {
      const list = getYokaiList();
      const val = normalize(e.target.value);
      if (!val) {
        $('suggestions').classList.add('hidden');
        return;
      }

      const matches = list
        .filter(
          (y) =>
            normalize(y.en).includes(val) ||
            (y.ko && normalize(y.ko).includes(val))
        )
        .slice(0, 5);

      const ul = $('suggestions');
      ul.innerHTML = '';

      matches.forEach((y) => {
        const li = document.createElement('li');
        const display = state.lang === 'ko' ? (y.ko || y.en) : y.en;
        li.textContent = `#${String(y.n).padStart(3, '0')} ${display}`;
        li.addEventListener('click', () => {
          $('guess-input').value = display;
          ul.classList.add('hidden');
          submitGuess();
        });
        ul.appendChild(li);
      });

      ul.classList.toggle('hidden', matches.length === 0);
    });

    $('dex-search').addEventListener('input', renderDex);

    $('help-btn').addEventListener('click', () => {
      const help = $('help-section');
      help.classList.toggle('hidden');
    });

    $('lang-toggle').addEventListener('change', (e) => {
      state.lang = e.target.checked ? 'en' : 'ko';
      localStorage.setItem('ykw-lang', state.lang);
      updateUI();
      renderGame();
      renderDex();
    });
  }

  // UI 업데이트
  function updateUI() {
    $('game-select').innerHTML = `
      <option value="daily">${T('modeDaily')}</option>
      <option value="practice" ${state.mode === 'practice' ? 'selected' : ''}>연습</option>
    `;

    $('mode-select').innerHTML = `
      <option value="10">10 ${T('nextRound')}</option>
      <option value="50">50 ${T('nextRound')}</option>
      <option value="100">100 ${T('nextRound')}</option>
    `;

    $('new-game-btn').textContent = T('newGame');
    $('guess-input').placeholder = T('placeholder');
    $('submit-btn').textContent = T('submit');
    $('dex-search').placeholder = T('dexSearch');
    $('footer-text').textContent = T('footer');
    $('lang-label').textContent = T('langName');
  }

  // 초기화
  function init() {
    bindEvents();
    updateUI();
    startGame();
  }

  // 게임 시작
  window.addEventListener('load', init);
})();
