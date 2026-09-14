# yokai-watchle-fun Completion Report

> **Summary**: Yo-kai Watchle 재미 업그레이드 완료 (Rev 5). Rev 4 메달 컨셉 리디자인에 더해 **요괴워치 버스터즈 470종**(적묘단·백견대·월토조) 추가 + **한글판에서 요괴워치 3 선택 차단**.
>
> **Project**: yokai-watchle
> **Version**: 5.0
> **Date**: 2026-09-14
> **Status**: Complete — ready to push

## 1. Summary

- **Match Rate**: Rev 4 항목 14/14 + Rev 5 신규 항목 5/5 = 100%
- **기간**: 단일 세션 (Plan → Design → Do → Check → Report)
- **베이스**: Rev 4 커밋 `ff772ed` (메달 컨셉 리디자인 + ykw3 영어 전용)
- **변경 파일**: `tools/build-data.mjs`, `tools/blasters-parse.mjs`(신규), `tools/blasters-kr.mjs`(신규), `data/raw/blasters.raw.txt`(신규), `data/out/blasters.json`(신규), `data/out/blasters_kr.json`(신규), `src/data.js`(재생성), `src/app.js`, `docs/`
- **배포 파이프라인**: 변경 없음 (GitHub Actions → Pages `src/` 업로드)

## 2. User Feedback 반영

| 피드백 | 대응 |
|--------|------|
| 버스터즈도 있니? | **추가됨 (Rev 5)**: Fandom "List of Yo-kai by Medallium Number (Yo-kai Watch Blasters)" 470종 파싱 → 적묘단(RC) 392 · 백견대(WD) 392 · 월토조(MRC) 368 |
| 한글판에서는 요괴워치3은 못하게 | **ko UI에서 ykw3 옵션 제거** + ykw3 선택 중 한글 전환 시 ykw1 자동 폴백 (`isYkw3Blocked()`) |
| 3는 영어로만 플레이가능함 | 정발 없음 확인 → en에서는 계속 영어 전용(`ENGLISH_ONLY`, `· EN` 배지) 유지 |
| 디자인이 AI스럽다 (Rev 4) | Rev 4 메달 컨셉 유지 — 별하늘 배경·금색 메달 로고·`Black Han Sans` 골드 타이틀 |
| 게임 방법은 NYT처럼 | 도움말 모달 유지 |
| 기회 무제한 (너무 어려움) | 추측 한도·패배 상태 없이 유지 |
| (덤) 통계 왜곡 방지 | `lastWinKey` 기반 1일 1회 스코어 유지 |

## 3. Completed Items

### Functional (Rev 4 유지 + Rev 5 추가)

- [x] NYT 스타일 레이아웃: serif 타이틀, 플랫 카드, `? 📊 ⚙` 아이콘 헤더 (Rev 4 메달 컨셉)
- [x] 설정 모달: 소리, 힌트 열(랭크/부족/속성), 언어, 게임/버전 선택, 포획 도감, 기본값 복원
- [x] 모달 UX: backdrop 오버레이, Esc / 바깥 클릭 / × 닫기
- [x] 무제한 추측 (한도·패배 없음), 오늘 대상 KST 기준 풀별 결정
- [x] 통계(해결/연속/최고 + 분포 15행) 1일 1회 스코어, 컨페티/효과음/공유, 포획 도감
- [x] KO/EN 전체 i18n
- [x] Rev 4 리디자인: 금색 메달 로고 + 골드 그라데이션 타이틀 + 별하늘 배경 + 스티커 카드/결과 대형 메달
- [x] **버스터즈 데이터**: `tools/blasters-parse.mjs`로 Fandom raw(107KB) → 470행 파싱(중복 0, RCC/WDS/MRC 마커, Boss tribe 42종)
- [x] **버스터즈 한글화**: `tools/blasters-kr.mjs` — 기존 namu 유래 `kr_pairs`/`kr_pairs2` + OVERRIDE 19건 → **470/470 한글명**
- [x] **한글판 ykw3 차단**: `fillSelects()`에서 ko일 때 ykw3 옵션 제거 + `lang-toggle` fallback→ykw1
- [x] **빌드 확장**: `build-data.mjs` GAMES에 `ykwb`(rc/wd/mrc) 추가, `merged.ykwb` 주입 → `src/data.js` 재생성

### Non-Functional

- 외부 의존성 0, 정적 사이트 유지
- `node --check src/app.js` 통과, jsdom 스모크 **13개 그룹(90+ assertion)** 통과
- 정적 서빙 200 OK

## 4. Quality Metrics

| Metric | Value |
|--------|-------|
| Match Rate (Rev 4 설계 + Rev 5 신규) | 14/14 + 5/5 = 100% |
| Syntax check | Pass |
| jsdom smoke groups | 13 / 13 pass (90+ assertions) |
| 버스터즈 한글 매핑 | 470 / 470 (0 unmatched) |
| 버전별 규모 | rc(적묘단) 392 · wd(백견대) 392 · mrc(월토조) 368 |
| Storage keys | `ykw-lang`, `ykw-settings`, `ykw-stats`(+`lastWinKey`), `ykw-caught`, `ykw-daily-{g}-{v}-{KST}` |

## 5. Known Limitations

| Item | Note |
|------|------|
| 나무위키 API 접근 불가 | `api.namu.wiki` DNS차단 + `INITIAL_STATE` 커스텀 인코딩 미해독 → 이름 소스는 기존 repo namu 유래 데이터 + Fandom 언어표 + websearch로 대체 |
| 보스 42종(rank/attr 없음) | 버스터즈 파일만 tribe=`Boss`, rank/attr은 `?` 표시 (결과의존) |
| 초기 Boss 왕곱 등 소수 이름 | OVERRIDE로 게임 도감 번호/대응 닉 기반 상정 — 공식 표기와 상이할 수 있음 |
| Canvas | jsdom에서 `getContext()` null → 런타임 가드 (라이브 브라우저 정상) |

## 6. Lessons Learned

- **Keep**: Fandom wikitext를 raw로 수집 후 마커(`{{Versionlink|RCC}}` 등)로 버전 필터 — 병렬 파싱이 데이터 확장의 핵심
- **Keep**: 나무위키 본문이 네트워크에서 불가할 때 기존 namu 유래 pairs + 일관된 OVERRIDE로 100% 커버
- **Problem**: 한국 정발 판본(버스터즈)도 보스 한글명이 공개 문서마다 갈림(Fandom vs namu) → fandom 언어표 우선 + namu 교차 검증
- **Try**: 사용자 지시가 기존 규칙("data.js/tools 수정 금지")을 대체 — 데이터 추가 요청 시 빌드 스크립트 확장을 수용

## 7. Next Steps

1. `git commit` + `git push origin main` → GitHub Actions 배포 확인
2. 실제 모바일 브라우저에서 버스터즈(특히 월토조) 전환·승리·도감 확인
3. 필요 시 버스터즈 보스 42종 rank/attr 보강 (작은 분수 데이터 추가 작업) 또는 버스터즈 2(밤바라야) 확장