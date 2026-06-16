"use client";

import { Construction, X } from "lucide-react";
import { useEffect } from "react";

// Lightweight "coming soon" dialog reused by the banner and the bottom feature
// cards. `title` names the feature the user tapped (e.g. "일정"). Closes on
// Escape or backdrop click.
export default function ComingSoonModal({
  title,
  onClose,
}: {
  title?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rise-in w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-elevated text-team">
              <Construction className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                {title ?? "기능 안내"}
              </p>
              <p className="font-display text-lg font-bold leading-tight">
                준비중입니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-muted">
            해당 기능은 현재 준비중이에요. 곧 항목별 상세 가이드와 함께
            제공될 예정입니다.
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-lg border border-line bg-elevated py-2.5 text-sm font-semibold transition hover:border-zinc-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
