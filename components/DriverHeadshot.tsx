"use client";

import { useState } from "react";
import { driverHeadshot } from "@/lib/season";

// Official F1 driver headshot with a graceful initials fallback. The F1 image
// URL already serves a silhouette for unknown drivers, so onError mainly guards
// against teams/drivers we can't map to a slug.
export default function DriverHeadshot({
  constructorId,
  name,
  accent,
  className = "",
}: {
  constructorId: string | undefined;
  name: string;
  accent: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = driverHeadshot(constructorId, name);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover object-top ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-display text-sm font-extrabold text-black ${className}`}
      style={{ backgroundColor: accent }}
    >
      {initials(name)}
    </div>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}
