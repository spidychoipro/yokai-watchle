# yokai-watchle-fun Completion Report

> **Summary**: Yo-kai Watchle 재미 업그레이드 완료 (Rev 4). "AI스러움을 깨는" 메달 컨셉 리디자인 + **무제한 기회** + 1일 1회 통계 + ykw3 영어 전용.
>
> **Project**: yokai-watchle
> **Version**: 4.0
> **Date**: 2026-09-14
> **Status**: Complete — ready to push

## 1. Summary

- **Match Rate**: 100% (14/14 Rev 3 설계 항목)
- **기간**: 단일 세션 (Plan → Design → Do → Check → Report)
- **베이스**: Yokai-watchle `0719c57` + Rev 2 통합 커밋 `cacbd48`
- **변경 파일**: `src/index.html`, `src/style.css`, `src/app.js`, `docs/`
- **미변경**: `src/data.js`, `.github/workflows`, 외부 의존성 0
- **배포 파이프라인**: 변경 없음 (GitHub Actions → Pages `src/` 업로드)

## 2. User Feedback 반영

| 피드백 | 대응 |
|--------|------|
| 디자인이 AI스럽다 + '"ㅈㄴ 구려졌어"' (Rev 3 NYT 미니멀) | Rev 4 메달 컨셉: 딥 네이비 별하늘 배경, 금색 요괴 메달 로고, 스티커 카드(하드 그림자), `Black Han Sans` 골드 타이틀 |
| 버스터즈도 있니? | 데이터 조사: **버스터즈 없음** (ykw1/2/3 7개 버전 3525마리만 존재). 추가 원하면 별도 데이터 구축 필요 |
| 3는 영어로만 플레이가능함 | 전 항목에 ko 이름은 존재하나, 공식 한글판 미출시이므로 ykw3만 이름을 **영어로 강제** (`ENGLISH_ONLY`) — 입력/자동완성/정답/공유 전부 영어, 모드줄에 `· EN` |
| 게임 방법은 NYT처럼 | 도움말을 **모달**로, 예시 행(위스퍼/지바냥)으로 설명 (Rev 3 유지) |
| 기회 무제한 (너무 어려움) | **추측 한도·패배 상태 제거** — 맞힐 때까지 계속 |
| (덤) 통계 왜곡 방지 | `lastWinKey` 기반 1일 1회 스코어로 같은 날 재도전 중복 카운트 차단 |

## 3. Completed Items

### Functional

- [x] NYT 스타일 레이아웃: serif 타이틀, 플랫 카드, `? 📊 ⚙` 아이콘 헤더
- [x] 상단 셀렉트/도감/게임방법(고정) 전부 제거 → 모달(도움말·통계·설정) 전환
- [x] 설정 모달: 소리, 힌트 열(랭크/부족/속성), 언어, 게임/버전 선택, 포획 도감(검색+진행률), 기본값 복원
- [x] 모달 UX: backdrop 오버레이, Esc / 바깥 클릭 / × 닫기
- [x] 무제한 추측 (한도·패배 없음), 오늘 대상 KST 기준 풀별 결정
- [x] "새 게임"/"다시 하기" → 오늘 키 초기화 후 재도전
- [x] 통계: 해결 / 연속 / 최고 + 추측 분포 (15행), 1일 1회 스코어 (`lastWinKey`)
- [x] 컨페티 / WebAudio 효과음(클릭·오답·승리) / 공유(이모지 그리드 + fallback) 유지
- [x] 포획 도감 진행률 바 + ✓ 배지 + 검색 (메인에서 설정 모달로 이동)
- [x] KO/EN 전체 i18n (도움말/설정/통계/결과 포함)
- [x] Rev 4 리디자인: 금색 메달 로고 + 골드 그라데이션 타이틀 + 별하늘 배경 + 스티커 카드/결과 대형 메달
- [x] ykw3 영어 전용: `ENGLISH_ONLY` 상수로 이름/자동완성/정답/공유 영어 강제 + `· EN` 표기

### Non-Functional

- 외부 의존성 0, 데이터/배포 미변경, 완전 정적 사이트
- `node --check` 통과, jsdom 스모크 11개 그룹(80+ assertion) 통과
- 정적 서빙 4개 파일 200 OK

## 4. Quality Metrics

| Metric | Value |
|--------|-------|
| Match Rate (Rev 4 설계 대비) | 100% |
| Syntax check | Pass |
| jsdom smoke groups | 11 / 11 pass (80+ assertions) |
| Data/I18N consistency | Pass (전 항목 en+ko 보유, `ko===en` 0건) |
| Storage keys | `ykw-lang`, `ykw-settings`, `ykw-stats`(+`lastWinKey`), `ykw-caught`, `ykw-daily-{g}-{v}-{KST}` |

## 5. Known Limitations

| Item | Note |
|------|------|
| Canvas | jsdom 테스트에서 `getContext()` null → 런타임 가드 (라이브 브라우저 정상) |
| 클립보드 | Clipboard API 거부 시 `execCommand('copy')` 폴백 — 일부 브라우저 제한 가능 |
| 무제한 추측 | 분포 그래프 행 수를 15로 상한 (초장기 게임 데이터는 상단 행에 합산 없음 — 필요시 조정) |

## 6. Lessons Learned

- **Keep**: `lastWinKey` 전략 — 하루에 정답 1회만 통계 반영, 같은 날 재도전해도 통계 불변
- **Keep**: 전체 정보(게임 선택/도감/언어/설정)를 단일 설정 모달로 모으니 메인 화면이 NYT처럼 단순해짐
- **Problem**: 언어 전환 시 결과 버튼 라벨(공유/다시 하기) 미갱신 → `applyLang()`에서 공유·재시작 라벨도 설정, 테스트로 재확인
- **Try**: ykw3 영어 전용은 표시만 강제 (데이터 ko는 유지) — 사용자가 한글 입력을 원하면 `ENGLISH_ONLY`를 꺼서 즉시 복구 가능
- **Try**: 다음 단계로 버스터즈 데이터 추가, 또는 정답 후 요괴 세부정보 카드

## 7. Next Steps

1. `git push origin main` → GitHub Pages 배포 확인
2. 실제 모바일 브라우저에서 별하늘 배경/메달/컨페티/모달 동작 확인
3. 필요 시 머티리얼 스타일 바로미터 재확인 (AI스러움 제거 여부)