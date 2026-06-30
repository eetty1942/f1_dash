"use client";

import {
  ArrowLeft,
  BookOpen,
  Flag,
  Gauge,
  ListChecks,
  Sparkles,
  Trophy,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";

// F1 beginner guide — a standalone in-app "page" reached from the promo banner.
// Covers the basics, the sweeping 2026 regulation reset (verified against the
// official F1/FIA sources), and a glossary + strategy/grid primer for newcomers.
// Stays within the app's design system (surface/elevated/line tokens, team
// accent, font-display) and offers a back button to return to the main page.
export default function Guide({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-zinc-600 hover:text-zinc-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        메인으로 돌아가기
      </button>

      {/* Hero */}
      <div className="team-glow overflow-hidden rounded-2xl border border-line px-6 py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-team">
          Beginner&apos;s Guide
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight">
          F1 입문 가이드
        </h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          포뮬러 1을 처음 보시나요? 경기를 즐기는 데 꼭 필요한 기본 규칙과,
          역대급 대개편이 이뤄진 <strong className="text-foreground">2026 시즌</strong>의
          달라진 규정을 한 곳에 정리했습니다.
        </p>
      </div>

      {/* A. Basic rules */}
      <SectionHeading icon={BookOpen} eyebrow="A. 기본 규칙">
        경기를 보기 전에 알아두면 좋은 것
      </SectionHeading>
      <div className="grid gap-3">
        <Card title="F1과 두 개의 챔피언십" icon={Trophy}>
          <p>
            F1은 한 시즌(보통 24개 내외 그랑프리) 동안 점수를 쌓아 우승자를
            가리는 대회입니다. 챔피언십은 두 가지로 나뉩니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">드라이버 챔피언십</strong> —
              개인 순위. 가장 많은 점수를 모은 드라이버가 월드 챔피언.
            </li>
            <li>
              <strong className="text-foreground">컨스트럭터 챔피언십</strong> —
              팀 순위. 한 팀 소속 두 드라이버의 점수 합산.
            </li>
          </ul>
        </Card>

        <Card title="레이스 주말 구성" icon={Flag}>
          <p>한 그랑프리는 보통 사흘에 걸쳐 진행됩니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">연습 주행(FP1~FP3)</strong> —
              차 세팅을 다듬는 시간.
            </li>
            <li>
              <strong className="text-foreground">예선(Qualifying)</strong> —
              Q1·Q2·Q3 세 단계. 단계마다 느린 차들이 탈락하며, 가장 빠른 한 바퀴
              기록으로 결승 출발 순서(그리드)를 정합니다. 1위는{" "}
              <strong className="text-foreground">폴 포지션</strong>.
            </li>
            <li>
              <strong className="text-foreground">결승(Race)</strong> — 정해진
              바퀴 수를 먼저 완주하는 순서로 순위 결정.
            </li>
            <li>
              일부 대회는 <strong className="text-foreground">스프린트</strong>
              (짧은 추가 레이스)를 포함해 별도 예선·점수가 더해집니다.
            </li>
          </ul>
        </Card>

        <Card title="포인트 시스템" icon={ListChecks}>
          <p>결승 상위 10명이 점수를 받습니다.</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-center text-xs">
              <thead className="text-muted">
                <tr>
                  {["1위", "2위", "3위", "4위", "5위", "6위", "7위", "8위", "9위", "10위"].map(
                    (h) => (
                      <th key={h} className="border-b border-line px-1.5 py-1.5 font-semibold">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="font-mono text-foreground">
                <tr>
                  {[25, 18, 15, 12, 10, 8, 6, 4, 2, 1].map((p, i) => (
                    <td key={i} className="px-1.5 py-1.5">
                      {p}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            스프린트는 상위 8명에게 8·7·6·5·4·3·2·1점을 추가로 줍니다. 참고로{" "}
            <strong className="text-foreground">2025 시즌부터</strong> &lsquo;패스티스트
            랩(최고 바퀴) 보너스 1점&rsquo;은 폐지됐습니다.
          </p>
        </Card>

        <Card title="타이어와 피트스톱" icon={Gauge}>
          <p>
            드라이 타이어는 <strong className="text-foreground">소프트·미디엄·하드</strong>
            세 컴파운드가 있습니다. 부드러울수록 빠르지만 빨리 닳죠. 비가 오면
            인터미디어트·웻 타이어를 씁니다.
          </p>
          <p className="mt-2">
            건조한 결승에서는{" "}
            <strong className="text-foreground">서로 다른 두 종류의 컴파운드를
            반드시 사용</strong>해야 해서, 최소 한 번은 피트스톱이 필요합니다.
            언제·몇 번 들어오느냐가 곧 전략입니다.
          </p>
        </Card>

        <Card title="플래그와 페널티" icon={Flag}>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">옐로 플래그</strong> — 위험 구간,
              추월 금지·감속.
            </li>
            <li>
              <strong className="text-foreground">블루 플래그</strong> — 한 바퀴
              뒤처진 차에게 빠른 차를 보내주라는 신호.
            </li>
            <li>
              <strong className="text-foreground">레드 플래그</strong> — 세션 중단.
            </li>
            <li>
              <strong className="text-foreground">세이프티카 / VSC</strong> — 사고
              수습 동안 전체 속도를 통제(가상 세이프티카 포함).
            </li>
            <li>
              규정 위반 시 <strong className="text-foreground">5초·10초 페널티</strong>,
              드라이브스루, 그리드 강등 등이 부과됩니다.
            </li>
          </ul>
        </Card>
      </div>

      {/* B. 2026 regulation changes */}
      <SectionHeading icon={Sparkles} eyebrow="B. 2026 달라진 규정">
        이전 시즌 대비 무엇이 바뀌었나
      </SectionHeading>
      <div className="mb-3 rounded-xl border border-team/40 bg-elevated px-4 py-3 text-sm text-muted">
        2026년은 <strong className="text-foreground">파워유닛·에어로·차량 치수</strong>가
        동시에 바뀌는 F1 역사상 손꼽히는 대개편 시즌입니다. 아래 내용은 공식
        F1·FIA 자료로 확인했습니다.
      </div>
      <div className="grid gap-3">
        <Card title="새 파워유닛: 내연 50 / 전기 50" icon={Gauge}>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              동력의 약 <strong className="text-foreground">절반을 전기</strong>로
              생산. 전기모터(MGU-K) 출력이 120kW → 약{" "}
              <strong className="text-foreground">350kW</strong>로 대폭 상승.
            </li>
            <li>
              열에너지 회수장치(<strong className="text-foreground">MGU-H 폐지</strong>)로
              구조가 단순해지고 가벼워짐.
            </li>
            <li>
              <strong className="text-foreground">100% 지속가능 연료</strong>
              (비식용 원료 기반)를 사용.
            </li>
          </ul>
        </Card>

        <Card title="액티브 에어로 — DRS 폐지" icon={Wind}>
          <p>
            앞·뒤 날개가 상황에 맞춰 움직입니다. 기존의 추월 보조장치인{" "}
            <strong className="text-foreground">DRS는 폐지</strong>됐습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">스트레이트 모드</strong> — 직선에서
              날개를 눕혀 공기저항↓, 최고속도↑.
            </li>
            <li>
              <strong className="text-foreground">코너 모드</strong> — 코너에서
              날개를 세워 다운포스(접지력)↑.
            </li>
          </ul>
        </Card>

        <Card title="추월 보조: 오버테이크 모드 & 부스트" icon={Sparkles}>
          <p>
            DRS를 대신해, 앞차에 <strong className="text-foreground">1초 이내</strong>로
            접근한 차에게 추가 전기에너지(약 +0.5MJ)와 더 높은 출력을 허용하는{" "}
            <strong className="text-foreground">오버테이크 모드</strong>가 생겼습니다.
            드라이버가 직접 누르는 <strong className="text-foreground">부스트</strong>로
            공격·방어에 에너지를 쓸 수도 있습니다.
          </p>
        </Card>

        <Card title="더 작고 가벼운 차" icon={Gauge}>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              최소 중량 약 <strong className="text-foreground">768kg</strong>
              (이전 약 800kg에서 감소).
            </li>
            <li>
              휠베이스 −200mm(약 <strong className="text-foreground">3400mm</strong>),
              차폭 −100mm(약 <strong className="text-foreground">1900mm</strong>).
            </li>
            <li>
              앞 타이어 25mm·뒤 타이어 30mm 좁아져 공기저항·무게 감소.
            </li>
          </ul>
        </Card>

        <Card title="그리드와 새 얼굴들" icon={Flag}>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">캐딜락</strong>이 11번째 팀으로
              합류해 그리드가 22대로 확대(예선은 Q1·Q2에서 6대씩 탈락).
            </li>
            <li>
              <strong className="text-foreground">아우디</strong>가 자우버를 이어받아
              워크스 팀으로 참전, 혼다–애스턴마틴·포드–레드불 등 엔진 동맹도 재편.
            </li>
          </ul>
        </Card>
      </div>

      {/* C. Newcomer extras */}
      <SectionHeading icon={BookOpen} eyebrow="C. 더 알아두기">
        입문자를 위한 보너스
      </SectionHeading>
      <div className="grid gap-3">
        <Card title="핵심 용어집" icon={BookOpen}>
          <dl className="space-y-2">
            {GLOSSARY.map((g) => (
              <div key={g.term} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-mono text-xs font-semibold text-team sm:w-32">
                  {g.term}
                </dt>
                <dd className="text-sm text-muted">{g.def}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="전략 기초: 왜 피트인 타이밍이 중요할까" icon={ListChecks}>
          <p>
            결승은 단순한 속도 싸움이 아닙니다. 타이어가 닳으면 느려지므로, 언제
            새 타이어로 갈아끼우느냐가 순위를 좌우합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">1-스톱 vs 2-스톱</strong> — 적게
              멈추면 시간을 아끼지만 타이어가 더 닳고, 많이 멈추면 빠른 타이어로
              만회. 트랙·기온에 따라 최적이 달라집니다.
            </li>
            <li>
              <strong className="text-foreground">언더컷</strong> — 앞차보다 먼저
              피트인해 새 타이어로 빠르게 달려 추월하는 기술.
            </li>
            <li>
              <strong className="text-foreground">오버컷</strong> — 반대로 피트인을
              미뤄, 트랙에 남아 앞서 나가는 전략.
            </li>
          </ul>
        </Card>

        <Card title="그리드와 스타트 절차" icon={Flag}>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              예선 결과대로 <strong className="text-foreground">출발 그리드</strong>가
              정해집니다(1위 = 폴 포지션, 가장 앞줄).
            </li>
            <li>
              결승 시작 전 <strong className="text-foreground">포메이션 랩</strong>을
              한 바퀴 돌며 타이어·브레이크를 데우고 제자리에 정렬합니다.
            </li>
            <li>
              빨간 신호등 5개가 차례로 켜졌다가{" "}
              <strong className="text-foreground">모두 꺼지는 순간 출발</strong>.
              너무 일찍 움직이면(점프 스타트) 페널티를 받습니다.
            </li>
          </ul>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        규정 세부 수치는 공식 F1·FIA 발표 기준이며, 시즌 진행에 따라 일부 조정될
        수 있습니다.
      </p>

      <div className="mt-4 flex justify-center">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-zinc-600 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}

const GLOSSARY: { term: string; def: string }[] = [
  { term: "Pole Position", def: "예선 1위, 결승에서 가장 앞에서 출발하는 자리." },
  { term: "DNF", def: "Did Not Finish — 사고·고장 등으로 완주하지 못함." },
  { term: "Box", def: "무전에서 '피트로 들어오라'는 신호. 'Box, box'." },
  { term: "Stint", def: "한 세트의 타이어로 달리는 구간." },
  { term: "Out / In Lap", def: "피트를 나오는 바퀴 / 들어가는 바퀴." },
  { term: "Lap Time", def: "한 바퀴 기록. 짧을수록 빠름." },
  { term: "Backmarker", def: "선두권에 한 바퀴 이상 뒤처진 차." },
  { term: "Parc Fermé", def: "예선 후 차 세팅 변경을 제한하는 규정 상태." },
];

function SectionHeading({
  icon: Icon,
  eyebrow,
  children,
}: {
  icon: typeof BookOpen;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-3 mt-8">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-team">
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </p>
      <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
        {children}
      </h2>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof BookOpen;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h3 className="flex items-center gap-2 font-display text-base font-bold">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-team">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-zinc-300">{children}</div>
    </section>
  );
}
