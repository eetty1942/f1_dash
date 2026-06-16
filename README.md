# F1 시즌 대시보드

응원하는 F1 팀과 드라이버의 **시즌 성적 현황**을 한눈에 보는 대시보드.

- 첫 방문 시 팀 → 드라이버를 직접 선택 (선택값은 브라우저 `localStorage`에 저장)
- 드라이버/컨스트럭터 순위·포인트·우승, 다음 경기, 라운드별 결과 테이블, 차량 텔레메트리(OpenF1), 시즌 추이 차트
- **시즌 선택**(헤더 드롭다운, 최근 5시즌) — 연도별로 그 시즌의 실제 소속팀·헤드샷·차량·성적을 반영
- **일정**: 자체 생성한 도트 월드맵에 라운드 위치/상태 표시(지난=green·다음·예정), 핀 클릭 시 일정 카드
- **선수 비교 / 컨스트럭터 비교**: 누적 포인트·산점도·요약, 상세, 1:1 head-to-head (해당 시즌 기준)

## 기술 스택

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind CSS v4**
- 차트 `recharts`, 아이콘 `lucide-react`, 테스트 `vitest`
- 데이터: [Jolpica F1 API](https://github.com/jolpica/jolpica-f1) (Ergast 후속) · [OpenF1](https://openf1.org) (차량/텔레메트리) — 모두 무료·키 불필요

## 실행

```bash
npm install   # 최초 1회
npm run dev    # http://localhost:3000
npm run build  # 프로덕션 빌드 + 타입체크
npm run lint   # ESLint
npm test       # vitest (집계/시즌 헬퍼 유닛 테스트)
```

## 구조

```
app/
  page.tsx               # 선택↔대시보드 전환, 전역 시즌 상태 (localStorage)
  layout.tsx, globals.css
  api/                   # options · dashboard · car · schedule · compare · compare-teams
components/
  AppShell · Selector · Dashboard · TeamDriverModal · Intro · Banner
  ScheduleView/DotMap · CompareView · CompareTeamsView · OneVsOne · TeamVsTeam · SeasonCharts
lib/
  jolpica.ts             # Jolpica 클라이언트 (서버 1시간 캐시)
  openf1.ts              # OpenF1 클라이언트 (차량 데이터, 2023~)
  season.ts              # SEASON/availableSeasons/resolveSeason + 팀 컬러 + 시즌별 미디어 URL
  compute.ts             # 순수 집계 (테스트 대상)  ·  useFetch.ts  ·  types.ts
scripts/                 # fetch-headshots.mjs (헤드샷 로컬 저장) · gen-dotmap.mjs (도트맵 생성)
public/headshots/, public/dotmap/   # 생성된 정적 자산
```

## 시즌 변경 / 자산 갱신

- 현재 시즌: `lib/season.ts`의 `SEASON`(현재 `"2026"`). 선택 가능 시즌은 `availableSeasons()`.
- 로스터/시즌 창이 바뀌면 자산 재생성:
  `node scripts/fetch-headshots.mjs` (헤드샷), `node scripts/gen-dotmap.mjs` (도트맵).
- API 라우트는 Jolpica/OpenF1 응답을 1시간 캐싱합니다.
