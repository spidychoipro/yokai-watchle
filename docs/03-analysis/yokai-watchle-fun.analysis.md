# yokai-watchle-fun Analysis Document

> **Summary**: 설계 대비 구현 갭 분석 (Check phase) — Rev 2: Copilot 리디자인 기반 포팅
>
> **Project**: yokai-watchle
> **Version**: 2.1
> **Date**: 2026-09-14
> **Status**: Complete

## 1. Design Items vs Implementation (Rev 2)

| # | Design Item (Rev 2) | Status | Evidence |
|---|---------------------|--------|----------|
| 1 | 설정 패널: 소리/힌트 토글 + `ykw-settings` 저장 | Match | `saveSettings()`, `applySettingsUI()`, jsdom T6 |
| 2 | 연습 라운드 선택 (10/50/100) `round-select` | Match | `startGame` Practice 분기, jsdom T8 |
| 3 | 데일리 6회 제한 + `ykw-daily-{game}-{ver}-{KST}` 진도 저장 | Match | `dailyKey()`, `saveDaily()`, jsdom T1/T2/T3 |
| 4 | 게임/버전 선택 복원 (3게임 7풀) + 셀렉트 전환 시 이어하기 | Match | `fillSelects()`, `fillVersionSelect()`, jsdom T9 |
| 5 | per-pool 데일리 타깃 `hash(game\|ver\|KST) % len` | Match | `dailyTarget()`, jsdom T1 |
| 6 | 힌트 열 토글 + 8 CSS 그리드 변형 | Match | `colClass()`, `applyCols()`, `cols-*`, jsdom T6 |
| 7 | 컨페티 (canvas) + ctx 가드 | Match | `spawnConfetti()`, `.confetti`, jsdom T1 (show class 확인) |
| 8 | 통계/연승/분포 (`ykw-stats`), 추측 분포 바 | Match | `recordWin/Loss`, `renderStats()`, jsdom T5 |
| 9 | 결과 공유 (이모지 그리드 + execCommand fallback) | Match | `shareText()`, `doShare()`, `fallbackCopy()`, jsdom T2 |
| 10 | 포획 도감 + 진행률 (`ykw-caught`) | Match | `markCaught()`, `renderDex()`, jsdom T1 |
| 11 | 효과음 WebAudio + 토글 | Match | `initAudio()`, `SFX`, pointerdown/keydown 1회 활성화 |
| 12 | i18n 전체 (설정/통계/도감 포함) KO/EN | Match | `I18N`, `applyLang()`, jsdom T7 |
| 13 | Copilot `ykw-practice-wins/total` 마이그레이션 | Match | `migrateStats()` |
| 14 | 새 게임/다시 하기 → 데일리 키 초기화 (재도전 허용) | Match | `playAgain()`, jsdom T3 |
| 15 | 연습 재시작 시 랜덤 뉴타깃 | Match | `startGame` Practice 랜덤 분기, jsdom T8 |
| 16 | 데일리 셀렉트 전환 시 이어하기 (키 보존) | Match | `startGame` Daily 분기, jsdom T9 |

## 2. Gap Categories

| Category | Count |
|----------|-------|
| Match | 16 |
| Missing in Code | 0 |
| Missing in Design | 0 |
| Changed | 0 |

### Minor Deviations (의도적)

- `shareText()` 헤더에 게임명/모드/날짜 포함 → 공유 정보 명확화
- 데일리 목록 전환 시 같은 날 진도 이어하기 (기존 키 독립)
- 도감 전체 노출 (Copilot의 100개 slice 제거)

## 3. Quality Checks

| Check | Result |
|-------|--------|
| `node --check src/app.js` | Pass |
| 데이터 구조 일관성 (rank/tribe/attr, 3525 entries) | Pass |
| I18N 키 KO/EN 일치 | Pass |
| jsdom 스모크 테스트 9개 그룹 (승/패/설정/언어/연습/전환 등) | 70+ assertions Pass |
| 정적 서빙 (index/app/style/data) | 200 OK |

**Match Rate: 16 / 16 = 100%**

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-09-14 | Initial analysis (구 기반) | opencode |
| 2.1 | 2026-09-14 | Rev 2: Copilot 베이스 포팅 반영 | opencode |
