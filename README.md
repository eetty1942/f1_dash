# F1 시즌 대시보드

응원하는 F1 팀과 드라이버의 **올해 시즌 성적 현황**을 한눈에 보는 대시보드.

- 첫 방문 시 팀 → 드라이버를 직접 선택 (선택값은 브라우저 `localStorage`에 저장)
- 드라이버 순위 / 포인트 / 시즌 우승 수, 팀(컨스트럭터) 순위
- 다음 경기 정보, 라운드별 레이스 결과 테이블
- 우측 상단 "팀/드라이버 변경" 버튼으로 언제든 재선택

## 기술 스택

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- 데이터: [Jolpica F1 API](https://github.com/jolpica/jolpica-f1) (Ergast 후속, 무료·키 불필요)

## 실행

```bash
npm install   # 최초 1회
npm run dev   # http://localhost:3000
npm run build && npm run start   # 프로덕션
```

## 구조

```
app/
  page.tsx              # 선택 화면 ↔ 대시보드 전환 (localStorage)
  layout.tsx            # 루트 레이아웃 / 메타데이터
  globals.css           # 다크 테마
  api/
    options/route.ts    # 시즌 팀+드라이버 목록 (선택용)
    dashboard/route.ts  # 선택한 팀/드라이버의 순위·결과·다음 경기
components/
  Selector.tsx          # 팀 → 드라이버 선택 UI
  Dashboard.tsx         # 성적 카드 + 결과 테이블
lib/
  jolpica.ts            # Jolpica API 클라이언트 + 타입 (서버 측 1시간 캐시)
  season.ts             # 시즌 상수(SEASON) + 팀 컬러
  types.ts              # API 응답 / 즐겨찾기 공유 타입
```

## 시즌 변경

매년 `lib/season.ts`의 `SEASON` 값을 수정하면 됩니다 (현재 `"2026"`).
API 라우트는 Jolpica 응답을 1시간 캐싱하므로 레이트 리밋 걱정 없이 사용 가능합니다.
