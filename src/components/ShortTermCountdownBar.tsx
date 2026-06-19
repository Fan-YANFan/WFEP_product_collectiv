"use client";

import { Clock } from "lucide-react";
import type { Translations } from "@/lib/i18n/types";
import { formatMessage } from "@/lib/i18n";
import {
  formatShortTermEventDate,
  type ShortTermCountdownInfo,
} from "@/lib/short-term-countdown";

type ShortTermCountdownBarProps = {
  info: ShortTermCountdownInfo;
  locale: "en" | "zh";
  t: Translations;
};

function countdownText(info: ShortTermCountdownInfo, t: Translations): string {
  const { daysLeft, mode } = info;

  if (mode === "starts") {
    if (daysLeft === 0) return t.explorer.shortTermCountdown.startsToday;
    if (daysLeft === 1) return t.explorer.shortTermCountdown.startsTomorrow;
    return formatMessage(t.explorer.shortTermCountdown.startsInDays, { days: daysLeft });
  }

  if (daysLeft === 0) return t.explorer.shortTermCountdown.endsToday;
  if (daysLeft === 1) return t.explorer.shortTermCountdown.endsTomorrow;
  return formatMessage(t.explorer.shortTermCountdown.endsInDays, { days: daysLeft });
}

export function ShortTermCountdownBar({ info, locale, t }: ShortTermCountdownBarProps) {
  const urgent = info.urgent;
  const dateLabel = formatShortTermEventDate(info.endDateIso, locale);

  return (
    <div
      role="status"
      className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 ${
        urgent
          ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50"
          : "border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            urgent ? "bg-amber-100 text-amber-700" : "bg-white text-sky-700"
          }`}
        >
          <Clock className={`h-4 w-4 ${urgent ? "animate-pulse" : ""}`} aria-hidden />
        </span>
        <div className="min-w-0">
          <p
            className={`text-sm font-bold leading-snug ${
              urgent ? "text-amber-950" : "text-sky-950"
            }`}
          >
            {countdownText(info, t)}
          </p>
          <p className={`text-xs ${urgent ? "text-amber-800/85" : "text-sky-800/80"}`}>
            {formatMessage(t.explorer.shortTermCountdown.eventDate, { date: dateLabel })}
          </p>
        </div>
      </div>
      {urgent && (
        <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {t.explorer.shortTermCountdown.urgent}
        </span>
      )}
    </div>
  );
}
