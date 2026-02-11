# PRD — 감정 리셋 60s (터치 기반)

## 기본 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | toss-mini-calm-60s |
| 형태 | Toss 미니앱 (WebView) |
| 기술 | React 18 + TypeScript + Vite |
| 디자인시스템 | @toss/tds-mobile (Text, Button, ProgressBar, Asset) |
| 햅틱 | @apps-in-toss/web-bridge (`generateHapticFeedback`) |
| 스타일링 | @emotion/react (CSS-in-JS) |
| 서버 | 없음 (localStorage 기반) |
| AI | 없음 |
| 목표 | 빠른 출시 + 빠른 지표 검증 + 얇아 보이지 않는 5페이지 UX |

---

## 1. 제품 한 줄 정의

사용자가 다양한 감정 상태에서 60초 안에 터치 기반 리셋 미션을 수행하고,
완료 기록을 누적하여 재방문하게 만드는 미니앱.

---

## 2. 타겟 감정 (6개 고정)

Home에서 감정 선택. 감정은 "기록/추천"을 위한 분류이며 의료적 진단이 아니다.

| 감정 | 라벨 | 이모지 |
|------|------|--------|
| anxiety | 불안 | 😰 |
| anger | 짜증 | 😤 |
| lethargy | 무기력 | 😶 |
| focus | 집중 안됨 | 🌀 |
| tension | 긴장됨 | 😬 |
| down | 다운됨 | 😢 |

---

## 3. 핵심 문제 / 해결 방식

### 문제
- 심호흡 앱은 거부감이 있고("호흡하라"가 부담)
- 단일 터치 미션만 있으면 콘텐츠가 얇아 보임(5페이지 구성인데 기능이 빈약)

### 해결
- 호흡 대신 "터치 기반 미션"으로 진입 장벽 낮춤
- 미션을 **4종류** 제공하여 콘텐츠 폭 확보
- 감정별 추천 미션으로 선택 고민 최소화
- TDS 디자인시스템 + Toss 네이티브 햅틱으로 브랜드 일관성 확보

---

## 4. 전체 페이지 구조 (총 5페이지)

| 페이지 | 설명 | 탭 노출 |
|--------|------|---------|
| Home | 감정 선택 + 오늘 통계 + 시작 진입 | ✅ |
| Mode Select | 4개 터치 미션 선택(감정별 추천 포함) | ❌ |
| Session | 선택한 미션 실행(실제 60초 리셋) | ❌ |
| Complete | 마무리 액션 선택 + "완료 기록하기"(저장 트리거) | ❌ |
| History | 연속 스트릭 + 최근 7일 기록 + 감정/모드 통계 | ✅ |

### 하단 탭 (BottomNav)
- Home (`icon-home-mono`) / History (`icon-chart-mono`) — 2탭
- TDS `Asset.Icon`으로 아이콘 렌더링
- Mode Select, Session, Complete는 플로우 화면(탭 비노출)

---

## 5. 핵심 미션 4종 (터치 기반)

### Mission A) 천천히 터치 (진정형) `🫧`

| 항목 | 내용 |
|------|------|
| 코드명 | `slow_tap` |
| 목적 | 과자극 없이 안정감 |
| 룰 | 2초 간격 가이드로 "천천히 터치" |
| 목표 | 30회 (60초 근처가 되도록 설계) |
| 완료 조건 | 카운트 30 도달 또는 60초 타이머 |
| 추천 감정 | 불안 / 긴장됨 / 다운됨 |
| ProgressBar | TDS `<ProgressBar>` (0.0~1.0) |
| 햅틱 | 탭 시 `tap()`, 빠른 탭 경고 시 `light()`, 완료 시 `success()` |

### Mission B) 꾹 누르기 (안정형) `💎`

| 항목 | 내용 |
|------|------|
| 코드명 | `hold_release` |
| 목적 | 리듬을 강제해 감정 끊기 |
| 룰 | 누르고 유지(4초) → 놓고 대기(2초) 반복 |
| 목표 | 10회 반복 (총 60초) |
| 완료 조건 | 10회 완료 |
| 추천 감정 | 짜증 / 긴장됨 |
| ProgressBar | TDS `<ProgressBar>` (0.0~1.0) |
| 햅틱 | 홀드 중 `medium()` 500ms 반복, 릴리즈 시 `release()`, 완료 시 `success()` |

### Mission C) 오감 집중 (집중 전환형) `🌿`

| 항목 | 내용 |
|------|------|
| 코드명 | `grounding_321` |
| 목적 | 생각 과열/산만함을 즉시 끊고 현재로 복귀 |
| 룰 | 칩(Chip) 선택 방식으로 주변 감각 체크 |
| 섹션 | 보이는 것 6개 → 들리는 것 5개 → 느껴지는 것 4개 (총 15개) |
| 선택지 | 각 섹션별 랜덤 풀에서 선택지 제공 (예: 시계, 창문, 모니터 등) |
| 완료 조건 | 총 15개 모두 선택 |
| 추천 감정 | 집중 안됨 / 불안 |
| ProgressBar | TDS `<ProgressBar>` (0.0~1.0) |
| 햅틱 | 칩 선택 시 `tap()`, 섹션 완료 시 `success()` |
| 타이머 | 없음 (자기 페이스로 진행) |

### Mission D) 연타 모드 (발산형) `⚡`

| 항목 | 내용 |
|------|------|
| 코드명 | `rapid_tap` |
| 목적 | 스트레스를 빠른 탭으로 해소 |
| 룰 | 60초 안에 마음껏 연타 |
| 목표 | 없음 (탭 수 무제한, 타이머 종료 시 자동 완료) |
| 완료 조건 | 60초 타이머 종료 |
| 추천 감정 | 짜증 / 긴장됨 / 무기력 |
| UI | 커스텀 강도 게이지 (14px 바 + 퍼센트 수치 + glow 효과) |
| 콤보 | TPS 기반 메시지 (좋아요! → 대단해요!! → 불타오르는중🔥 → 미쳤다!!!🤯) |
| 햅틱 | 강도별 `tap()` / `medium()` / `heavy()`, 50탭마다 `success()` |

### 감정별 추천 미션 매핑

| 감정 | 추천 미션 |
|------|----------|
| 불안 | 천천히 터치 |
| 짜증 | 연타 모드 |
| 무기력 | 연타 모드 |
| 집중 안됨 | 오감 집중 |
| 긴장됨 | 꾹 누르기 |
| 다운됨 | 천천히 터치 |

---

## 6. 각 페이지 상세 기획

### Page 1) Home

**목적:** 3초 내 세션 시작

**구성:**
- 시간대별 인사 문구 (아침/오후/저녁/밤)
- 타이틀: "지금, 60초만 리셋"
- `icon-emoji-mono` + "지금 기분이 어때요?" — 감정 선택 6개 (3열 그리드)
  - 각 감정 버튼: `Asset.Frame CircleMedium` + 이모지 + 라벨
  - 선택 시 파란색 테두리 + 배경 변경 + 바운스 애니메이션
- `icon-star-mono` + "추천 모드" — 선택한 감정에 따라 추천 미션 1개 표시
  - `Asset.Frame SquircleSmall` + 미션 이모지 + 미션 이름
- `icon-chart-mono` + "오늘 통계"
  - `icon-check-circle-mono` 오늘 완료 N회 / `icon-trophy-mono` 연속 N일
  - 숫자 카운트업 애니메이션 (`useCountUp` 훅)
- CTA 버튼: "시작" (하단 고정)

**동작:**
- 감정 미선택 시: "감정을 선택해 주세요" alert
- 시작 클릭 시: Mode Select로 이동(추천 모드 선택 상태로)

### Page 2) Mode Select

**목적:** 콘텐츠 두께 확보 + 선택 명확화

**구성:**
- `Asset.Icon icon-arrow-left-mono` 뒤로가기 + 선택한 감정 라벨
- 타이틀: "어떤 방식으로 리셋할까요?"
- 미션 카드 4개 (세로 리스트):
  - `Asset.Frame SquircleLarge` + 미션 이모지 아이콘
  - 미션 이름 (한글) + 설명
  - 추천 감정에 해당하면 "추천" 뱃지 (파란색, 펄스 애니메이션)
  - 선택 시 파란색 테두리 + 배경 변경
- CTA 버튼: "시작하기" (하단 고정)

**동작:**
- 진입 시 추천 모드가 자동 선택됨
- 모드 선택 후 시작 → Session으로 이동

### Page 3) Session

**목적:** 실행 집중 (이탈 최소)

**공통 구성:**
- 60초 타이머 (SVG 원형 타이머, `SessionTimer.tsx`)
  - 잔여 시간 mm:ss 표시
  - 10초 남으면 경고색 (빨간색) + `wiggle()` 햅틱
- 중단 버튼 (X) — 확인 후 Home으로 복귀 (저장 없음)
- 각 미션별 전용 UI 컴포넌트

**세부 동작 (모드별):**
- 천천히 터치: 터치 카운트/가이드 + 리플 이펙트 + ProgressBar
- 꾹 누르기: Press/Release 단계 게이지 + 원형 타이머 + ProgressBar
- 오감 집중: 섹션별 칩 선택 UI + 완료 진행률 + ProgressBar (타이머 없음)
- 연타 모드: 탭 원형 버튼 + 강도 게이지 + 콤보 메시지 (타이머 기반)

**완료 시:** 자동으로 Complete 페이지 이동
**중단 시:** 확인 후 Home으로 복귀 (저장 없음)

### Page 4) Complete

**목적:** "저장"과 "재방문 가치" 확정

**구성:**
- `Asset.Icon icon-check-circle-mono` (80x80 원형, 파란색, 스케일인 애니메이션)
- 파티클 컨페티 (24개 도트, 5색 burst 애니메이션)
- 완료 문구: "좋아요, 여기까지 완료!" + "60초 동안 잘 집중했어요"
- 마무리 액션 선택 (택1, 선택사항):
  - `Asset.Frame CircleLarge` + 이모지
  - 💧 물 마시기 / 🪟 창문 열기 / 👟 10걸음 걷기
  - 선택 시 라디오 인디케이터 + 바운스 애니메이션
- CTA: "완료 기록하기" ← 저장 트리거
- Secondary: "한 번 더 하기" (같은 모드로 재시작)
- 진입 시 `haptic.confetti()` 축하 햅틱

**저장 규칙:**
- 타이머 완료만으로 저장하지 않음
- "완료 기록하기" 클릭 시에만 저장

### Page 5) History

**목적:** 리텐션 (다시 들어올 이유)

**구성:**
- 타이틀: "기록"
- 연속 스트릭 카드 (파란 그라데이션 배경)
  - `Asset.Icon icon-trophy-mono` (흰색) + "연속 리셋"
  - 스트릭 N일 (카운트업 애니메이션)
  - 단계별 격려 메시지 (1일/3일/7일/14일/30일)
- 요약 카드 (2열):
  - `Asset.Icon icon-clock-mono` + "오늘" N회
  - `Asset.Icon icon-chart-mono` + "전체" N회
- 최근 7일 캘린더 (7열 그리드)
  - 날짜 + 요일, 기록 있는 날은 파란색 표시 + 횟수
  - 오늘은 파란 테두리
- 통계 (2열 그리드):
  - 감정별: `Asset.Frame CircleXSmall` + 이모지 + 라벨 + 횟수
  - 모드별: `Asset.Frame CircleXSmall` + 이모지 + 라벨 + 횟수
- 기록 없을 때 빈 상태 UI

**데이터:** localStorage 기반

---

## 7. 디자인시스템 & 아이콘 활용

### TDS 컴포넌트 사용 현황

| 컴포넌트 | 용도 |
|----------|------|
| `Text` | 전체 텍스트 (typography, color, fontWeight) |
| `Button` | CTA 버튼 (primary/light, xlarge, block) |
| `ProgressBar` | 미션 진행률 (progress: 0.0~1.0) |
| `Asset.Frame` | 이모지 아이콘 프레임 (Circle/Squircle/Clean) |
| `Asset.Icon` | TDS CDN 아이콘 (SVG, color 제어) |

### 사용 중인 TDS 아이콘

| 아이콘 이름 | 위치 | 용도 |
|-------------|------|------|
| `icon-home-mono` | BottomNav | 홈 탭 |
| `icon-chart-mono` | BottomNav, Home, History | 기록 탭, 통계 라벨 |
| `icon-arrow-left-mono` | ModeSelect | 뒤로가기 |
| `icon-check-circle-mono` | Complete, Home | 완료 아이콘, 오늘 완료 카드 |
| `icon-trophy-mono` | History, Home | 스트릭 카드, 연속 카드 |
| `icon-clock-mono` | History | 오늘 요약 카드 |
| `icon-emoji-mono` | Home | 감정 선택 섹션 라벨 |
| `icon-star-mono` | Home | 추천 모드 섹션 라벨 |

### Asset.Frame 프리셋 사용

| 프리셋 | 크기 | 용도 |
|--------|------|------|
| `CircleXSmall` | 24×24 | History 통계 이모지 |
| `CircleMedium` | 36×36 | Home 감정 버튼 이모지 |
| `CircleLarge` | 40×40 | Complete 마무리 액션 이모지 |
| `SquircleSmall` | 30×30 | Home 추천 모드 이모지 |
| `SquircleLarge` | 40×40 | ModeSelect 미션 카드 이모지 |
| `CleanW16~24` | 가변 | Asset.Icon 프레임 |

---

## 8. 햅틱 피드백 설계

Toss 네이티브 `generateHapticFeedback` API 사용 (`@apps-in-toss/web-bridge`).

### 햅틱 유틸 (`src/utils/haptic.ts`)

| 메서드 | 네이티브 타입 | 용도 |
|--------|-------------|------|
| `haptic.light()` | `tickWeak` | 감정 선택, 액션 선택 |
| `haptic.tap()` | `tap` | 체크리스트 체크, 단일 탭 |
| `haptic.medium()` | `tickMedium` | 시작 버튼, 모드 선택 |
| `haptic.heavy()` | `basicMedium` | 연타 고강도 |
| `haptic.soft()` | `softMedium` | 홀드 릴리즈 |
| `haptic.success()` | `success` | 미션/세션/섹션 완료 |
| `haptic.error()` | `error` | 에러 피드백 |
| `haptic.wiggle()` | `wiggle` | 타이머 종료 임박 |
| `haptic.confetti()` | `confetti` | 완료 화면 진입 |
| `haptic.release()` | `softMedium` + `tap` | 꾹 누르기 해제 |

---

## 9. 저장 설계 (로컬 only)

**Storage Key:** `calm60_save_v1`

**기본 JSON 예시:**
```json
{
  "version": 1,
  "lastCompletedDate": "2026-02-11",
  "todayCount": 2,
  "streak": 3,
  "history": [
    { "date": "2026-02-05", "count": 1 },
    { "date": "2026-02-06", "count": 0 },
    { "date": "2026-02-07", "count": 2 }
  ],
  "moodStats": {
    "anxiety": 3, "anger": 1, "lethargy": 0,
    "focus": 2, "tension": 1, "down": 1
  },
  "modeStats": {
    "slow_tap": 4, "hold_release": 2,
    "grounding_321": 2, "rapid_tap": 3
  }
}
```

**저장 로직:**
- 완료 기록 저장 시 (로컬 날짜 기준):
  - 같은 날짜면 `todayCount++`
  - 다른 날짜면 `todayCount = 1`
- streak: `lastCompletedDate`가 어제면 `streak++`, 같은 날이면 유지, 그 외 `streak = 1`
- history: 오늘 entry 업데이트/추가, **최근 30일**로 trim
- moodStats/modeStats: 해당 키 +1
- 날짜 계산: `getFullYear()/getMonth()/getDate()` (로컬 타임존, UTC 아님)
- 앱 로드 시 streak 유효성 검증: `lastCompletedDate`가 오늘도 어제도 아니면 `streak = 0`으로 리셋

---

## 10. 파일 구조

```
src/
├── App.tsx                     # 라우터 설정
├── main.tsx                    # 앱 엔트리
├── index.css                   # 글로벌 스타일
├── types/
│   └── index.ts                # Mood, MissionMode, SaveData 타입 + 상수
├── stores/
│   └── storage.ts              # localStorage CRUD + streak 로직
├── utils/
│   └── haptic.ts               # Toss 네이티브 햅틱 유틸
├── hooks/
│   └── useCountUp.ts           # 숫자 카운트업 애니메이션 훅
├── components/
│   ├── BottomNav.tsx            # 하단 탭 (Asset.Icon)
│   ├── SessionTimer.tsx         # SVG 원형 타이머 (60초)
│   └── missions/
│       ├── SlowTapMission.tsx   # 천천히 터치 미션
│       ├── HoldReleaseMission.tsx # 꾹 누르기 미션
│       ├── GroundingMission.tsx  # 오감 집중 미션 (칩 선택)
│       └── RapidTapMission.tsx   # 연타 모드 미션
└── pages/
    ├── Home.tsx                 # 홈 (감정선택 + 통계)
    ├── ModeSelect.tsx           # 모드 선택
    ├── Session.tsx              # 세션 컨테이너
    ├── Complete.tsx             # 완료 (저장 트리거)
    └── History.tsx              # 기록 (스트릭 + 통계)
```

---

## 11. Non-goals (이번 MVP에서 제외)

- 토스 게임 로그인
- 서버 저장
- 결제/아이템
- 리더보드
- AI 기능
- 사운드
- 다크 모드

---

## 12. 앱인토스 가이드라인 체크리스트

### 접속 및 앱 내 기능

| 항목 | 상태 | 비고 |
|------|------|------|
| 미니앱이 정상적으로 열림 | ✅ | |
| 앱 내 기능으로 안내한 모든 서비스 기능 사용 가능 | ✅ | 오프라인(로컬) 전용 |
| 앱 스킴으로 진입 후 뒤로가기 정상 동작 | ✅ | |

### 내비게이션 바

| 항목 | 상태 | 비고 |
|------|------|------|
| 앱인토스 비게임 내비게이션 바 사용 | ✅ | TDS 기반 |
| [좌측] 뒤로가기 버튼이 모든 화면에서 정상 동작 | ✅ | 토스 내비게이션 바 + Asset.Icon |
| [중앙] 브랜드 로고와 미니앱 이름 표시 | ✅ | "감정 리셋 60s" |
| [우측] 미니앱 기능 버튼 최대 1개 | ✅ | 사용 안함 |
| 토스 뒤로가기와 자체 뒤로가기 중복 노출 안함 | ✅ | ModeSelect만 자체 뒤로가기 (플로우 화면) |
| 더보기 버튼에서 토스 공통 기능 제공 | ✅ | 토스 기본 제공 |
| 닫기/뒤로가기 버튼 동작 명확 | ✅ | |
| 최초 화면에서 뒤로가기 시 미니앱 종료 | ✅ | Home에서 뒤로가기 = 앱 종료 |
| 탭바는 토스 앱과 동일한 플로팅 형태 | ✅ | 하단 고정 탭 + TDS Asset.Icon |

### 서비스 이용 동작

| 항목 | 상태 | 비고 |
|------|------|------|
| 제스처 확대·축소 비활성화 | ✅ | viewport 설정 완료 |
| 라이트 모드로 구현 | ✅ | 다크모드 미지원 |
| 모든 UI 컴포넌트 정상 동작 | ✅ | TDS 컴포넌트 사용 |
| 인터랙션 반응 2초 이내 | ✅ | 서버 통신 없음 |
| 재진입 시 데이터 유지 | ✅ | localStorage 사용 |
| 외부 링크 정상 동작 | ✅ | 외부 링크 없음 |
| 공유 기능에 intoss:// 스킴 사용 | N/A | 공유 기능 없음 |
| 비속어/은어/과도한 유행어 미사용 | ✅ | 전체 한글화 완료 |
| 확인 필요 시 TDS 모달 사용 | ⬜ | 현재 confirm 사용 중 (개선 예정) |
| 불법/선정적 콘텐츠 없음 | ✅ | |
| 권한 요청 전 사용자 동의 | N/A | 권한 요청 없음 |
| 비정상적 네트워크 사용량 없음 | ✅ | 서버 통신 없음 (아이콘 CDN만 사용) |
| 비정상적 메모리 사용량 없음 | ✅ | |

### UX

| 항목 | 상태 | 비고 |
|------|------|------|
| 진입 시 바텀시트 자동 열림 없음 | ✅ | |
| 화면 전환 시 바텀시트 강제 유도 없음 | ✅ | |
| 모든 화면에서 미니앱 나가는 방법 명확 | ✅ | 토스 내비게이션 바 사용 |
| CTA 버튼으로 다음 행동 예측 가능 | ✅ | "시작", "시작하기", "완료 기록하기" 등 |
| 자사 서비스/앱 설치 유도 없음 | ✅ | |

---

## 13. "빠꾸 방지" 체크포인트

이 MVP가 얇아 보이지 않기 위한 조건:

- ✅ 페이지는 5개이지만 "실제 기능"이 **4개 미션**으로 분화되어 있음
- ✅ 감정 선택 + 추천 로직으로 개인화 느낌 제공
- ✅ History에서 누적이 보임 (스트릭, 통계)
- ✅ 완료 저장은 명시 버튼으로 동작 (조작/오작동 감소)
- ✅ TDS 디자인시스템 아이콘/프레임으로 토스 브랜드 일관성
- ✅ 네이티브 햅틱으로 물리적 피드백 제공
- ✅ 전체 한글화 완료 (영어 문구 없음)

---

## 14. 개발 완료 현황

| 항목 | 상태 |
|------|------|
| 라우팅 (5페이지) + 하단 탭 (Home/History) | ✅ |
| localStorage save/load + streak/todayCount/history | ✅ |
| Mission A (천천히 터치) | ✅ |
| Mission B (꾹 누르기) | ✅ |
| Mission C (오감 집중 — 칩 선택 방식) | ✅ |
| Mission D (연타 모드) | ✅ |
| Complete 저장 + Stats 업데이트 | ✅ |
| History 감정/모드 통계 | ✅ |
| 전체 한글화 | ✅ |
| Toss 네이티브 햅틱 연동 | ✅ |
| TDS Asset.Frame/Icon 적용 | ✅ |
| ProgressBar 0.0~1.0 버그 수정 | ✅ |
| Streak 로직 버그 수정 (로컬 날짜, 유효성 검증) | ✅ |
| History 30일 보관, 총 완료 횟수 표시 | ✅ |

---

## 15. 추가 개선 사항 (Post-MVP)

- [ ] Session 중단 시 TDS Modal 사용 (현재 confirm 사용 중)
- [ ] 오프라인 PWA 지원
- [ ] 접근성 (a11y) 강화
- [ ] TDS Lottie 애니메이션 활용 (완료 화면 등)
- [ ] 공유 기능 (intoss:// 스킴)
