# yokai-watchle-fun Design Document

> **Summary**: 재미 업그레이드 기능 설계 — 로컬 상태 설계, UI, 로직 흐름, 테스트 계획.
>
> **Project**: yokai-watchle
> **Version**: 5.0
> **Author**: opencode (bkit)
> **Date**: 2026-09-14
> **Status**: Approved

**Prerequisite**: `docs/01-plan/features/yokai-watchle-fun.plan.md` (approved)

---

## Rev 2 (2026-09-14) — Copilot 리디자인 머지 적응

원격 `main`이 Copilot의 전면 리디자인으로 갱신됨에 따라(베이스 `0719c57`), **Rev 1 설계를 Copilot 코드 위에 포팅**했다. 로컬 `reset --hard origin/main` 후 구현 시작.

### 변경 요약

| 항목 | Rev 1 (구 기반) | Rev 2 (적용) |
|------|----------------|--------------|
| 베이스 | `2a0b739` 구 app.js | Copilot `0719c57` (ES6, KST 데일리 6회, `.card`/CSS 변수 디자인) |
| 게임/버전 선택 | 없음 | 복원 — 3개 게임 / 7개 풀 (`game-select`/`version-select`) |
| 난이도 | 설정 하드 모드(10회) | **연습 라운드 선택**: 10 / 50 / 100 (`round-select`) |
| 데일리 키 | `ykw-daily-{date}` | `ykw-daily-{game}-{ver}-{KST}` + per-pool 데일리 타깃 `hash(game\|ver\|date) % len` |
| 데일리 행동 | 진도 저장 | 선택 변경 시 이어하기, "다시 하기/새 게임"은 오늘 키 초기화 후 재도전 |
| 힌트 열 | 인라인 `gridTemplateColumns` | CSS 클래스 `cols-all|nr|nt|na|nrt|nra|nta|name` (데스크톱/모바일 3단계) |
| 행 셀 | `#answers` | Copilot `#guesses-container` 내 `.col-num/.col-name/.col-rank/.col-tribe/.col-attr` |
| 연습 타깃 | 결정적 아님 | 재시작마다 랜덤 재선택 (셀렉트 전환 시 재시작) |
| 통계 마이그레이션 | 없음 | Copilot `ykw-practice-wins/total` → `ykw-stats.practice` 1회 이관 |
| 설정 형태 | `{sound, hard, hints}` | `{sound, hints:{rank,tribe,attr}}` (hard 제거) |
| i18n | 일부 | 설정/통계/도감/공유 포함 전체 패널 KO/EN 확장 |

### Rev 2 동작 규칙

- 데일리: 1일 1요괴(풀별), 6회 제한, KST 자정 갱신. 게임/버전/모드 셀렉트 변경은 현재 풀의 기존 진도를 이어한다. `play-again-btn`/`new-game-btn`은 오늘 시도를 초기화해 재도전.
- 연습: `round-select`(10/50/100) 만큼 추측. 종료 후 재시작 시 랜덤 뉴타깃.
- 저장 키: `ykw-lang`(기존), `ykw-daily-{g}-{v}-{date}`, `ykw-settings`, `ykw-stats`, `ykw-caught`.
- 회귀 검증: jsdom 스모크 9개 그룹(부팅, 승리, 재도전, 패배 6회, 통계 패널, 힌트 열+리셋, KO/EN, 연습 10라운드 패배, 게임/버전 전환).

---

## Rev 3 (2026-09-14) — NYT(New York Times) 스타일 + 무제한 기회

사용자 피드백: "디자인이 AI스럽다", "밑에 요괴 검색 전체 나열이 AI스럽다", "게임 방법은 NYT처럼", "기회는 무제한".

### 변경 요약

| Rev 2 | Rev 3 |
|-------|-------|
| 상단 4개 셀렉트(게임/버전/모드/라운드) + 새 게임 버튼 | 모두 제거 — 헤더는 타이틀 + `? 📊 ⚙` 3아이콘 (NYT) |
| 밑에 고정 도감 섹션(검색+전체 그리드) | 메인에서 제거 → **설정 모달 안의 "포획 도감"** 으로 이동 |
| 게임 방법 목록이 하단 고정 섹션 | **도움말 모달** (예시 행 2개: 위스퍼/지바냥) |
| 모드(데일리/연습) + 연습 라운드 10/50/100 | **삭제** — 데일리 단일 모드 |
| 데일리 6회 제한 + 패배(정답 공개) 상태 | **무제한 기회** — 패배 없음, 맞힐 때까지 계속 |
| 통계: 게임/승률/연속/최고 + 분포 | **해결/연속/최고** + 분포 (승률 제거) |
| 헤더의 언어 토글 | **설정 모달** 안의 언어 스위치 |
| 설정은 인라인 카드 | **모달**(backdrop + Esc/바깥 클릭 닫기) |
| 선택 변경 시 하단 "이어하기" | 유지 (선택/버전 변경 시 진도 이어하기) |
| 재도전 시 같은 날 재스코어 | `lastWinKey`(풀+날짜) 기반 **1일 1회 스코어** (중복 카운트 방지) |

### Rev 3 동작 규칙

- 게임: 오늘 대상(KST, 풀별 hash) 하나를 맞힐 때까지 무제한 추측. 진입 시 정답이면 결과 화면 복원.
- `새 게임`/`다시 하기`: 오늘 키 초기화 후 재도전 (같은 대상, 스코어는 1일 1회 유지).
- 통계: `{daily:{won, streak, max, dist, lastWinKey}}`. `won++/streak++/dist[n]++`는 `lastWinKey != 오늘키`일 때만.
- 설정 모달: 소리 / 힌트 열(랭크·부족·속성) / 언어 / 게임·버전 선택 / 포획 도감(검색+진행률) / 기본값 복원.
- i18n: 도움말·설정·통계·결과 전체 KO/EN.
- 회귀: jsdom 스모크 **11개** 그룹(부팅, 승리, 재도전, 무제한 12회+중복스코어 방지, 통계 모달, Esc/backdrop 닫기, 힌트 열, KO/EN, 게임/버전 전환, 자동완성, **ykw3 영어 전용**).

## Rev 4 (2026-09-14) — "AI스러움을 깨는" 메달 컨셉 리디자인

사용자 피드백: "디자인이 덜 AI스럽지만 ㅈㄴ 구려졌어. 이전 디자인에서 사람처럼 생각해서 AI스러운 걸 깨봐", "버스터즈도 있니?", "3는 영어로만 플레이가능함".

### 변경 요약

| Rev 3 (NYT 미니멀) | Rev 4 (메달 컨셉) |
|--------------------|-------------------|
| 밋밋한 플랫 카드 + 아웃라인 버튼 | 딥 네이비 밤하늘 배경 + 별 무늬 + 통통한 스티커 카드(오프셋 단색 그림자) |
| serif 타이틀 텍스트 | `Black Han Sans` 골드 그라데이션 타이틀 + **요괴 메달 로고**(금색 원 + 흰 코어) |
| 정답 화면 = 숫자/텍스트 | 결과 화면에 대형 메달 + `#N` 금색 숫자 |
| — | `ENGLISH_ONLY` 상수: 공식 한글판이 없는 ykw3는 이름을 영어로 강제 (입력/자동완성/정답/공유), 모드줄에 `· EN` 표기 |

### Rev 4 동작 규칙

- 디자인: 금색 `#ffd66b` 액센트 + 메달/별하늘 모티프, 카드는 `box-shadow: 0 10px 0` 하드 스티커 룩.
- ykw3: `isEnglishOnly()` → `ykw3`만 true. `entryName`/`gameName`/`versionLabel`/결과 `result-name`이 영어로 고정. 설정 내 언어 토글은 다른 시리즈에만 영향. (토글 시 `ENGLISH_ONLY` 객체만 수정)
- 자동완성·제출 매칭은 데이터의 ko 이름을 그대로 두고 표시만 영어 강제.
- 회귀: jsdom **11개** 그룹 통과(신규 T11: ykw3 강제 영어 검증).

---

## 1. Architecture

기존 단일 IIFE 구조를 유지한 채 모듈(함수) 단위 확장. 컴포넌트:

| Layer | Files | Notes |
|-------|-------|-------|
| HTML | `src/index.html` | 설정/통계 modal, 공유 버튼, 컨페티 canvas, i18n 요소 |
| Style | `src/style.css` | 설정·통계 UI, 승리 애니메이션, 진행률 바, 숨김열 그리드 |
| Logic | `src/app.js` | 상태, 게임플레이, 설정, 통계, 수집, 효과음, 공유, 컨페티 |
| Data | `src/data.js` | **변경 없음** (window.YKW_DATA) |

## 2. Data / State Model

### 2.1 localStorage 확장 (기존 키 유지 + 신규)

| Key | Shape | Purpose |
|-----|-------|---------|
| `ykw-lang` | `'ko'\|'en'` | (기존) 언어 |
| `ykw-daily-{game}-{ver}-{date}` | `{g:[n],w:bool,t:n}` | (기존) 데일리 진도 |
| `ykw-settings` | `{sound:bool, hard:bool, hints:{rank:bool,tribe:bool,attr:bool}}` | 신규 설정 |
| `ykw-stats` | `{daily:{won,lost,streak,max,dist:{count:num}}, practice:{won,lost,streak,max}}` | 통계 |
| `ykw-caught` | `{gameId:[n,...]}` | 수집 포획 번호 |

### 2.2 게임 state 확장

```js
state = {
  lang, gameId, versionId, mode, roster, target, guesses, won,
  over,           // 게임 종료(승/패) 여부
  settings: { sound, hard, hints:{rank,tribe,attr} }
}
```

## 3. Key Logic Flows

### 3.1 게임 종료 판정 `endGame(won)`
- 추측 제출 시: 정답 → `endGame(true)`. 아니면 guesses.length >= (hard?10:∞) → `endGame(false)`.
- 기존 `finishGame()`을 `endGame(won)`으로 통합, 오답 상태 추가 렌더(정답 공개).

### 3.2 힌트 열 토글 `applyCols()`
- 표시 열에 따라 `#answers`에 `gridTemplateColumns` 재설정:
  `44px 1fr` + (rank?` 62px`:'') + (tribe?` 78px`:'') + (attr?` 78px`:'').
- `hidden` 속성으로 셀 숨김. 헤더 동일하게 적용.

### 3.3 효과음 (WebAudio)
```js
var AC = null; // lazily on first gesture
function tone(freq, dur, type, gain) // oscillator + gain envelope
playClick/wrong/correct/win
```
- `settings.sound` true일 때만 재생, 모든 노드는 즉시 stop/GC.

### 3.4 컨페티
- 승리 시 `#confetti` canvas 전체 화면, ~70 입자(요괴 컬러: 골드/브라운/화이트), physics + fade, 1.5s 후 자동 정리.
- `requestAnimationFrame` 기반, 탭 언마운트 시 cancel.

### 3.5 통계/연승
- 승: `won++, streak++, max=max(streak), dist[guessCount]++`
- 패: `lost++, streak=0`
- 데일리와 연습 각각 트래킹, 추측 분포는 데일리만.

### 3.6 공유
- 추측별 텍스트 타일: rank/tribe/attr 열 일치 수 → 3=`🟩`, 2=`🟨`, 1/0=`⬜`.
- 제목에 `요괴워치 즐 · {game} {date}`. `navigator.clipboard.writeText` → 실패 시 `execCommand('copy')` fallback + 버튼 피드백("복사됨!").

### 3.7 수집 포획
- `endGame(true)` 시 `caught[gameId]`에 target.n 추가(중복 무시), `renderDex()` 진행률 바/배지 갱신.

### 3.8 bind 정리
- 기존 중복 `bind()` 2개를 단일 `bind()`로 통합. 새 게임 버튼은 모드 무관 "재시작". 언어 토글 시 결과 화면 상태 보존.

## 4. API / Endpoints

없음 (정적 사이트). 외부 통신 없음.

## 5. UI Spec

### 5.1 상단바 (신규)
- `?`(도움말 extant), `⚙`(설정), `📊`(통계) 버튼 추가. (모달 토글)

### 5.2 설정 모달
- 소리 토글 / 하드 모드 토글(추측 10회) / 힌트 열 체크박스(랭크·부족·속성) / 기본값 초기화

### 5.3 결과 섹션 (신규)
- 컨페티 + 승리/패배 타이틀 애니메이션, 정답 요괴 이름 리빌
- `공유` 버튼 (복사 결과 피드백)

### 5.4 도감
- 상단 진행률 바 `포획 X / 전체 Y`
- 포획된 항목에 `✓` 배지

## 6. i18n 델타

| ko | en |
|----|----|
| 설정 / 소리 / 하드 모드(추측 10회) / 힌트 표시 / 기본값 | Settings / Sound / Hard mode (10 guesses) / Show hints / Reset |
| 통계 / 승리 / 패배 / 연승 / 최고 연승 / 추측 분포 / 복사됨! | Stats / Wins / Losses / Streak / Best streak / Guess distribution / Copied! |
| 공유 | Share |

## 7. Test Plan

1. `node --check src/app.js` — 문법 검증
2. 로컬 서버(`npx serve` 또는 python) 로드 스모크:
   - 게임 시작(데일리/연습), 추측 정상, 정답 시 컨페티+통계+포획
   - 하드 모드 10회 오답 시 패배 공개
   - 힌트 열 해제 시 그리드/헤더 반영 + localStorage 복원
   - 설정·통계 저장 후 새로고침 복원
   - 공유 그리드 복사 (클립보드)
   - KO/EN 토글
3. 회귀: 데일리 피킹 결정성, 도감 검색, 기존 저장 키 읽기.

## 8. Risk 전략 (변경 예정)

| Risk | Mitigation |
|------|------------|
| 기존 localStorage 키 파손 | 읽기 try/catch → 기본값 |
| 컨페티 성능 | 파티클 제한(~70), rAF cancel |
| 오디오 반복 재생 | 노드 stop() 명시 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-09-14 | Initial design | opencode |
| 2.0 | 2026-09-14 | Rev 2: Copilot 베이스 포팅 | opencode |
| 3.0 | 2026-09-14 | Rev 3: NYT 스타일 + 무제한 기회 | opencode |
| 4.0 | 2026-09-14 | Rev 4: 메달 컨셉 리디자인 + ykw3 영어 전용 | opencode |
| 5.0 | 2026-09-14 | Rev 5: 버스터즈(ykwb) 470종 추가 + 한글판 ykw3 선택 차단 + 빌드 파이프라인 확장 | opencode |