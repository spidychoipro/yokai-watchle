# yokai-watchle-refactor Planning Document

> **Summary**: Yo-kai Watchle 코드 리모델 — 926줄 단일 IIFE `app.js`를 네이티브 ES 모듈로 분리하고, 리뷰에서 발견된 스트릭 버그·렌더 해킹·데드코드·EN FOUC·자동완성 정렬을 수정한다.
>
> **Project**: yokai-watchle
> **Version**: 1.0
> **Author**: opencode (bkit)
> **Date**: 2026-09-20
> **Status**: Approved

---

## 1. Overview

### 1.1 Purpose

현재 `src/app.js`(926줄)는 i18n·저장소·사운드·컨페티·통계·보드·추측·모달·언어·자동완성을 모두 담은 단일 IIFE로 유지보수가 어렵다. 기능·데이터·배포 파이프라인은 건드리지 않고 **안전하게** 코드 품질을 개선한다.

### 1.2 Background

- 순수 정적 사이트: `src/index.html` + `app.js` + `style.css` + `data.js` (window.YKW_DATA)
- 배포: GitHub Actions → GitHub Pages (`src/` 업로드). **변경하지 않는다.**
- 데이터 파이프라인(tools/, data/, data.js) **변경하지 않는다.**
- localStorage 키: `ykw-lang`, `ykw-theme`, `ykw-mode`, `ykw-settings`, `ykw-stats`, `ykw-daily-{g}-{v}-{date}`, `ykw-caught`(미사용) — 전부 **호환 유지**.

### 1.3 Related Documents

- `src/app.js` (기존 단일 IIFE — 리모델 대상)
- `docs/01-plan/features/yokai-watchle-fun.plan.md` (이전 PDCA 이력)

---

## 2. Scope

### 2.1 In Scope (src/ 한정)

- [x] `app.js`를 `src/js/` 네이티브 ES 모듈로 분리 (dom / i18n / store / domain / fx / stats / board / main)
- [x] 스트릭 버그 수정: 하루 이상 건너뛰면 스트릭 리셋 (`lastWinDate` KST 기반)
- [x] 렌더 해킹 제거: `renderModeInfo`의 `result-stats-line.match(/\d/)` 조건
- [x] 데드코드 제거: 통계 스키마의 `lost` 카운터
- [x] EN FOUC 완화: `<head>` 초기 `lang` 스크립트 + 모듈 즉시 init
- [x] `applyLang` id→키 테이블화 (문구 누락 원천 차단, 누락 시 console.warn)
- [x] 자동완성 결과 접두어 우선 정렬 (안정적 medallium 순 tiebreak)
- [x] 이벤트/동작/문구/스타일 원복 보장 (동작 동일)

### 2.2 Out of Scope

- tools/, data/ 파이프라인, data.js 내용, `.github/` 워크플로
- 외부 라이브러리·빌드 단계·TypeScript
- localStorage 스키마 변경·게임 로직(규칙) 변경·신규 기능

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 기존 기능(데일리/연습/설정/통계/공유/테마/KO·EN/자동완성) 동작 동일 | High | Pending |
| FR-02 | 스트릭이 KST 1일 이상 공백이면 1로 리셋, 연속일이면 유지 | High | Pending |
| FR-03 | 앱 로직이 전역 네임스페이스 오염 없이 모듈로 분리 | High | Pending |
| FR-04 | i18n 키 누락 시 두 언어 교차 확인 가능 (console.warn) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Method |
|----------|----------|--------|
| Compatibility | 모던 브라우저 ES Module 지원 | `type="module"` |
| Regression | localStorage 키·게임 규칙·문구 불변 | 원문 대조 리뷰 |
| Persistence | 기존 설정/통계 데이터 복원 보존 | `lastWinDate` backfill |

---

## 4. Success Criteria

- [x] 각 `src/js/*.js` `node --check` 통과 (ESM 모드)
- [x] `python -m http.server` 정적 서빙 200 OK (index / js/* / css / data.js)
- [x] 인라인 스크립트 제거 + CSP·Permissions-Policy·Referrer-Policy 메타 추가 (Rev 7.1)
- [x] 외부 링크 `rel="noopener noreferrer"` (reverse tabnabbing)
- [x] 헤드리스 스모크: KO/EN init 무예외, roster/target 할당, 스트릭 로직 5케이스
- [x] 기존 localStorage 데이터(승리 기록·설정) backfill 복원 (legacy `lastWinKey` → `lastWinDate`)
- [x] 연혁·레포 구조 README 반영 (Rev 7)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 모듈 로드 순서로 data.js 미로드 | High | Low | classic `data.js`가 module보다 먼저 평가됨(파서 순서) |
| 모듈 간 순환 import | Medium | Low | 레이어 열화 설계(dom→i18n/store→domain→fx/stats/board→main), 검증 |
| 코드 이동 실수로 동작 변화 | Medium | Medium | 함수 원문 전사 + 커밋 전 diff 리뷰 |

---

## 6. Architecture

`src/js/` 레이어 (하위 모듈은 상위를 import하지 않는 DAG)

```
main.js          orchestrator: 이벤트·추측흐름·모달·테마·셀렉트·applyLang·init
 ├── board.js    보드/결과/모드정보 렌더
 ├── stats.js    통계 로드/저장/기록/렌더 (+스트릭 수정)
 ├── fx.js       WebAudio 신스 + 컨페티
 ├── domain.js   DATA 접근·라벨·색상·날짜·normalize
 ├── i18n.js     KO/EN 사전 + t()
 └── store.js    state + localStorage 안전 래퍼
```

- 빌드 0: `type="module"` 로 index.html에서 직접 참조
- `data.js`는 classic script 유지 (window.YKW_DATA 주입)

---

## 7. Next Steps

1. [x] 모듈 파일 작성
2. [x] index.html 스크립트 전환 + 구 app.js 제거
3. [x] 검증(node --check / 헤드리스 스모크 / 서빙 200)
4. [x] README 연혁·구조 반영
5. [ ] 실제 브라우저 최종 스모크(데일리·연습·승리·통계·공유·설정·KO↔EN·테마·게임/버전 전환·자동완성) 및 커밋

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-09-20 | Initial draft (approved) | opencode |