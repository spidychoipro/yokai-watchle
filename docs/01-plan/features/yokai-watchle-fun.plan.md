# yokai-watchle-fun Planning Document

> **Summary**: Yo-kai Watchle 격추 게임을 "사이크 괜찮고 재미있게" 업그레이드 — 승리 연출, 통계/연승, 결과 공유, 난이도 설정, 수집 도감, 효과음.
>
> **Project**: yokai-watchle
> **Version**: 2.0
> **Author**: opencode (bkit)
> **Date**: 2026-09-14
> **Status**: Approved

---

## 1. Overview

### 1.1 Purpose

현재 Yo-kai Watchle(데일리/연습 격추 게임)은 정확한 데이터와 기본 게임플레이를 갖추고 있으나
"재미"(재방문 유도, 성취감, 공유) 요소가 부족하다. 기존 구조(정적 바닐라 JS, 데이터/배포 파이프라인)를
그대로 유지하면서 아래 게임 요소를 추가한다.

### 1.2 Background

- 순수 정적 사이트: `src/index.html` + `app.js` + `style.css` + `data.js` (window.YKW_DATA)
- 배포: GitHub Actions → GitHub Pages (`src/` 업로드). **배포 파이프라인은 변경하지 않는다.**
- 데이터: 작품 5종(요괴워치 1/2/2영혼/3/3스키야키), 도감 최대 698마리. `data.js`와 tools/는 변경하지 않는다.
- localStorage 키: `ykw-lang`, `ykw-daily-{game}-{ver}-{date}` (기존)

### 1.3 Related Documents

- README.md (프로젝트 개요)
- src/app.js (현재 게임 로직 — 중복된 bind() 두 개 존재)

---

## 2. Scope

### 2.1 In Scope

- [x] 추측 제한(하드 모드) + 힌트 열(랭크/부족/속성) 표시 설정
- [x] 정답 시 컨페티 애니메이션 + 요괴 리빌 연출
- [x] 통계 & 연승 패널 (localStorage)
- [x] 결과 공유 (이모지 그리드 클립보드 복사)
- [x] 수집 "포획" 도감 + 진행률 (localStorage)
- [x] 효과음 (WebAudio 신스, on/off)
- [x] 코드 정리: 중복 bind() 통합, dead code 제거
- [x] KO/EN i18n 추가 문구

### 2.2 Out of Scope

- data.js, tools/ 데이터 파이프라인 변경
- .github 워크플로/배포 변경
- 외부 라이브러리 도입 (전부 네이티브 구현)
- 서버/DB/빌드 단계 추가

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 설정 패널(사운드/하드/힌트열)과 localStorage 저장·복원 | High | Pending |
| FR-02 | 하드 모드: 추측 10회 초과 시 정답 공개(패배) | High | Pending |
| FR-03 | 힌트 열 해제 시 해당 열/헤더 숨김, 그리드 동적 재구성 | High | Pending |
| FR-04 | 승리 시 컨페티(canvas) + 리빌 애니메이션 | Medium | Pending |
| FR-05 | 통계: 승/패, 현재/최대 연승, 추측 분포 (데일리) | High | Pending |
| FR-06 | 결과 공유 버튼: Wordle식 이모지 그리드 복사 | Medium | Pending |
| FR-07 | 포획 도감: 승리 시 요괴 포획, 진행률 바 + 배지 | High | Pending |
| FR-08 | 효과음: 클릭/정답/오답/승리, 사운드 토글 | Low | Pending |
| FR-09 | 기존 데일리/연습 진도 저장·복원 동작 유지 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 데이터 로드/렌더 지연 없음, 컨페티는 60fps 목표 | 수동 확인 |
| Compatibility | 모던 브라우저(Clipboard API fallback 포함) | `navigator.clipboard` + execCommand fallback |
| Persistence | 설정/통계/수집 정보 유실 없음 | localStorage try/catch |
| Accessibility | 버튼 키보드 접근, ARIA 라벨 | 수동 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] FR-01 ~ FR-09 모두 동작
- [x] `node --check src/app.js` 통과
- [x] 로컬 서버 스모크 테스트 통과 (게임 시작/추측/승리/설정/저장 복원)
- [x] 기존 기능(데일리 피킹, 도감 검색, KO/EN 토글) 회귀 없음

### 4.2 Quality Criteria

- [x] 기존 데이터 구조(`window.YKW_DATA`) 미변경
- [x] 외부 의존성 0
- [x] 커밋 전 자가 리뷰 완료

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| localStorage 구조 변경으로 기존 데이터 충돌 | Medium | Low | 새 키 분리(`ykw-settings`, `ykw-stats`, `ykw-caught`) & try/catch |
| 하드 모드에서 무한 루프/버그 | Medium | Low | guessLimit 경계 검사 단일 함수 `checkEnd()` |
| Clipboard API 미지원 | Low | Medium | execCommand('copy') fallback |
| WebAudio 자동재생 차단 | Low | Medium | 최초 사용자 제스처 시 context 생성 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | Simple structure, static sites | **X** |
| Dynamic | Full-stack with BaaS integration | - |
| Enterprise | Microservices, K8s | - |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 구조 | 모듈 분리 vs 단일 IIFE | 단일 IIFE 기존 유지 | 빌드 단계 0, 정적 호스팅 |
| 상태 저장 | URL vs localStorage | localStorage | 생성·순위 불변, 오프라인 |
| 애니메이션 | 라이브러리 vs canvas 네이티브 | canvas 네이티브 | 의존성 0 |

---

## 7. Next Steps

1. [ ] Design 문서 작성 (`yokai-watchle-fun.design.md`)
2. [x] 팀(사용자) 승인
3. [x] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-09-14 | Initial draft (plan) | opencode |
| 1.1 | 2026-09-14 | 사용자 승인, 스코프 확정 | opencode |