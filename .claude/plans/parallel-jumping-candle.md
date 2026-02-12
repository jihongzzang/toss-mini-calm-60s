# 코드 품질 리뷰 — Web Interface Guidelines + Vercel React Best Practices

## Context
제출 전 최종 코드 품질 검증. Web Interface Guidelines(접근성, 애니메이션, 터치, 폼 등)과 Vercel React Best Practices(번들, 렌더링, 성능 패턴)을 기준으로 전체 코드베이스를 검토.

---

## 🟢 잘 되어 있는 것 (수정 불필요)

| 항목 | 상태 |
|------|------|
| **접근성 ARIA** | `role="radiogroup"`, `role="radio"`, `role="button"`, `role="timer"`, `aria-checked`, `aria-label` 전반적으로 잘 적용 |
| **코드 스플리팅** | `lazy()` + `Suspense`로 5개 페이지 모두 분리 |
| **애니메이션 GPU** | `transform`/`opacity` 위주, layout-triggering 속성 안 씀 |
| **터치 최적화** | `-webkit-tap-highlight-color: transparent`, `user-select: none` 일관 적용 |
| **useCallback/useMemo** | 이벤트 핸들러, 파티클 데이터 등 적절히 메모이제이션 |
| **cleanup** | useEffect return으로 타이머, 이벤트 리스너, 오디오 노드 정리 |
| **타입 안전성** | TypeScript Record 타입, 인터페이스 정의 일관 |
| **ErrorBoundary** | 전역 에러 바운더리 + 폴백 UI |
| **localStorage 버전 관리** | `calm60_save_v1` 키 버저닝 |

---

## 🟡 개선 권장 (MEDIUM)

### 1. `prefers-reduced-motion` 미지원
**가이드라인**: Web Interface Guidelines — Animation
**파일**: 모든 미션 컴포넌트, Home, ModeSelect, History, Complete
**문제**: 모션 민감 사용자를 위한 `prefers-reduced-motion` 미디어 쿼리 없음
**수정**:
```tsx
// src/utils/motion.ts (새 파일)
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 또는 글로벌 CSS로:
// @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; } }
```

### 2. `transition: all` 사용 (2곳)
**가이드라인**: Web Interface Guidelines — Animation: "never use transition: all"
**파일**:
- `src/pages/Complete.tsx:93` — `actionItemStyle`: `transition: all 0.2s;`
- `src/pages/Complete.tsx:120` — `radioStyle`: `transition: all 0.2s;`
**수정**: 구체적 속성으로 변경
```tsx
// actionItemStyle
transition: border-color 0.2s, background 0.2s, transform 0.2s;
// radioStyle
transition: border-color 0.2s, background 0.2s;
```

### 3. `<div onClick>` → `<button>` 또는 키보드 핸들러
**가이드라인**: Web Interface Guidelines — Accessibility: "use semantic HTML over div onClick"
**파일**: 대부분의 인터랙티브 요소
**문제**: `<div onClick>` + `role="radio"`/`role="button"` 패턴 사용 중. 키보드 포커스/Enter/Space 핸들러 없음
**수정**: `tabIndex={0}`, `onKeyDown` (Enter/Space) 추가. 이상적으로는 `<button>`으로 교체하되, 스타일 영향이 큼.
```tsx
<div
  role="radio"
  tabIndex={0}
  aria-checked={isSelected}
  onClick={() => handleSelect(item)}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(item); } }}
>
```

### 4. `intensityDecayTimer` — useEffect 밖에서 setInterval 시작
**가이드라인**: Vercel — `rerender-dependencies`
**파일**: `src/components/missions/RapidTapMission.tsx:341-348`
**문제**: 컴포넌트 바디에서 직접 `setInterval` 시작 — StrictMode에서 이중 생성 가능, cleanup 없음
**수정**: `useEffect`로 이동
```tsx
useEffect(() => {
  const timer = setInterval(() => {
    setIntensity(prev => Math.max(0, prev - 0.008));
    // ...
  }, 100);
  return () => clearInterval(timer);
}, []);
```

### 5. 숫자 표시에 `tabular-nums` 없음
**가이드라인**: Web Interface Guidelines — Typography: "apply tabular-nums for number columns"
**파일**: History.tsx (통계 카운트), SessionTimer, RapidTapMission (TPS), SlowTapMission (카운트)
**수정**:
```tsx
const numericStyle = css`font-variant-numeric: tabular-nums;`;
```

---

## 🟠 개선 권장 (LOW, nice-to-have)

### 6. meterFillStyle에서 `width` 애니메이션
**파일**: `RapidTapMission.tsx:184` — `width: ${intensity * 100}%;`
**가이드라인**: Vercel — `rendering-animate-svg-wrapper`: transform 기반 애니메이션 권장
**수정**: `transform: scaleX(${intensity})` + `transform-origin: left`로 변경하면 GPU 가속

### 7. `.sort()` → `.toSorted()`
**가이드라인**: Vercel — `js-tosorted-immutable`
**파일**: `History.tsx:177-183` — `Object.entries().sort()`
**수정**: `.toSorted()` 사용 (ES2023, 대상 환경이 지원 시)

### 8. storage.ts에서 loadData 중복 호출
**가이드라인**: Vercel — `js-cache-storage`
**파일**: `storage.ts` — `getLast7DaysHistory()`와 `getTotalCount()` 각각 `loadData()` 호출
**수정**: History.tsx에서 `loadData()` 한 번 호출 후 파생 계산

---

## ✅ 수정 계획 (우선순위순)

### Step 1: `transition: all` 제거 (Complete.tsx)
- `actionItemStyle`: `all 0.2s` → `border-color 0.2s, background 0.2s, transform 0.2s`
- `radioStyle`: `all 0.2s` → `border-color 0.2s, background 0.2s`

### Step 2: `prefers-reduced-motion` 글로벌 지원 (index.css 또는 App.tsx)
- `@media (prefers-reduced-motion: reduce)` 추가

### Step 3: RapidTapMission setInterval → useEffect
- 컴포넌트 바디 → useEffect + cleanup

### Step 4: 키보드 접근성 (tabIndex + onKeyDown)
- Home.tsx mood 버튼
- ModeSelect.tsx 미션 카드
- Complete.tsx 액션 아이템
- Session.tsx 사운드/닫기 버튼

### Step 5: `tabular-nums` 숫자 스타일
- 카운트/통계 숫자 표시에 적용

### Step 6: (선택) meterFill → scaleX 전환

---

## 검증
- `npx tsc -b` — 타입 에러 0
- `npx vite build` — 빌드 성공
- 각 미션 진입/완료 플로우 수동 테스트
