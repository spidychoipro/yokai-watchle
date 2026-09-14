# yokai-watchle-fun Analysis Document

> **Summary**: 설계 대비 구현 갭 분석 (Check phase) — Rev 4 메달 리디자인 + Rev 5 버스터즈 470종 & 한글판 ykw3 차단
>
> **Project**: yokai-watchle
> **Version**: 5.0
> **Date**: 2026-09-14
> **Status**: Complete

## 1. Design Items vs Implementation (Rev 3)

| # | Design Item (Rev 3) | Status | Evidence |
|---|---------------------|--------|----------|
| 1 | NYT 헤더: 타이틀 + `? 📊 ⚙` 3아이콘, 상단 셀렉트 제거 | Match | `site-header`, `icon-btn`, jsdom T1 (선택 UI 부재 확인) |
| 2 | 보드에 모드/라운드/새 게임 셀렉트 없음 | Match | index.html 구조, jsdom T1 |
| 3 | 도감(검색+그리드) 메인 제거 → 설정 모달 이동 | Match | `settings-modal` 내 `dex-grid`, jsdom T1/T9 |
| 4 | 도움말 모달 (예시 행 2개) | Match | `help-modal`, `help-example`, applyLang T8 |
| 5 | 데일리 단일 모드 (연습/라운드 삭제) | Match | state에 mode/rounds 없음, jsdom T1 |
| 6 | 무제한 기회 — 패배 상태 없음 | Match | `submitGuess` 한도 미검, jsdom T4 (12회+) |
| 7 | 통계: 해결/연속/최고 + 추측 분포 | Match | `renderStats()` 3타일, jsdom T5 |
| 8 | 1일 1회 스코어 (`lastWinKey` 기준) | Match | `recordWin()` 키 비교, jsdom T4 |
| 9 | 언어 토글을 설정 모달로 이동 | Match | `settings-modal` 내 `lang-toggle`, jsdom T8 |
| 10 | 설정/통계/도움말을 모달(backdrop+Esc+바깥클릭)로 | Match | `openModal/closeModals`, jsdom T6 |
| 11 | 게임/버전 선택을 설정 모달에서 변경 + 진도 이어하기 | Match | `game-select`/`version-select` change → `startGame()`, jsdom T9 |
| 12 | 포획 도감 + 진행률 (설정 내) | Match | `markCaught/`renderDex()`, jsdom T2 |
| 13 | 컨페티·효과음·공유 유지 | Match | `spawnConfetti`, `SFX`, `doShare`, jsdom T2 |
| 14 | i18n 도움말/설정/통계 확장 | Match | I18N 키 적용, jsdom T8 |

## Rev 5 (2026-09-14) — 버스터즈 + 한글판 ykw3 차단

| # | Design Item | Status | Evidence |
|---|-------------|--------|----------|
| 15 | 버스터즈(ykwb) 470종 추가 — 적묘단/백견대/월토조 버전 | Match | `data/out/blasters.json`→`blasters_kr.json`(470/470 ko), build-data `ykwb` rc392/wd392/mrc368, jsdom T12 |
| 16 | 나무위키 우회 실패 → 대체 소스(기존 kr_pairs+Fandom+websearch)로 한글명 100% | Match | `tools/blasters-kr.mjs` OVERRIDE 19건, matched 470/470 |
| 17 | 한글판(ko)에서 ykw3 선택 불가 — 옵션 제거 + ykw3 중일 때 자동 폴백 | Match | `fillSelects()` 전용 조건 + `lang-toggle` fallback, jsdom T11 |
| 18 | en에서는 ykw3 영어 전용 유지 (`ENGLISH_ONLY` 기존) | Match | `isEnglishOnly()` + `· EN` 배지, jsdom T11 |
| 19 | 빌드 파이프라인 확장 (build-data.mjs에 ykwb 통합) | Match | `tools/build-data.mjs` GAMES + merged.ykwb 주입, `node build-data.mjs` 로그 |

**Rev 5 Match Rate: 5/5 = 100%**

## 2. Gap Categories

| Category | Count |
|----------|-------|
| Match | 14 |
| Missing in Code | 0 |
| Missing in Design | 0 |
| Changed | 0 |

### Minor Deviations (의도적)

- 통계에서 승률 제거 (무제한 모드라 항상 100% → 무의미)
- `shareText()` 헤더: `요괴워치 즐 · {게임명} (KST날짜)` 하고 정답 번호/주요 정보 포함
- 힌트 열 숨김 시 그리드는 8종 CSS 클래스 유지 (Rev 2) — 모달 이동 없이 보드에만 적용

## 3. Quality Checks

| Check | Result |
|-------|--------|
| `node --check src/app.js` | Pass |
| 데이터 구조 일관성 (rank/tribe/attr, 3525 + 470 entries) | Pass |
| I18N 키 KO/EN 일치 | Pass |
| jsdom 스모크 13개 그룹 + 무제한 12회 검증 | 90+ assertions Pass |
| 정적 서빙 (index/app/style/data) | 200 OK |

**Match Rate: Rev 3 14/14 = 100% · Rev 5 5/5 = 100%**

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-09-14 | Initial analysis (구 기반) | opencode |
| 2.1 | 2026-09-14 | Rev 2: Copilot 베이스 포팅 반영 | opencode |
| 3.0 | 2026-09-14 | Rev 3: NYT 스타일 + 무제한 기회 반영 | opencode |
| 4.0 | 2026-09-14 | Rev 4: 메달 컨셉 리디자인 + ykw3 영어 전용 반영 | opencode |
| 5.0 | 2026-09-14 | Rev 5: 버스터즈(ykwb) 470종/적묘단·백견대·월토조 추가 + 한글판 ykw3 차단 반영 | opencode |