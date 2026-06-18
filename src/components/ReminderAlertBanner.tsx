"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatMessage } from "@/lib/i18n";
import {
  getUpcomingReminders,
  URGENT_REMINDER_DAYS,
  type UpcomingReminder,
} from "@/lib/reminders";

const DISMISS_KEY = "collectiv-reminder-banner-dismissed";

function countdownLabel(reminder: UpcomingReminder, t: ReturnType<typeof useLanguage>["t"]): string {
  if (reminder.daysLeft === 0) return t.account.countdown.endsToday;
  if (reminder.daysLeft === 1) return t.account.countdown.endsTomorrow;
  return formatMessage(t.account.countdown.endsInDays, { days: reminder.daysLeft });
}

export function ReminderAlertBanner() {
  const pathname = usePathname();
  const { member, reminders } = useAuth();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(true);

  const upcoming = getUpcomingReminders(reminders);
  const primary = upcoming[0];
  const isUrgent = primary ? primary.daysLeft <= URGENT_REMINDER_DAYS : false;
  const extraCount = upcoming.length > 1 ? upcoming.length - 1 : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (!member || pathname === "/account" || upcoming.length === 0 || dismissed) {
    return null;
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div
      role="status"
      className={`border-b px-4 py-3 sm:px-6 ${
        isUrgent
          ? "border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50"
          : "border-sky-200/80 bg-gradient-to-r from-sky-50 via-cyan-50 to-sky-50"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${
              isUrgent ? "bg-amber-100 text-amber-700" : "bg-white text-sky-700"
            }`}
          >
            <Bell className={`h-4 w-4 ${isUrgent ? "animate-pulse" : ""}`} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${isUrgent ? "text-amber-950" : "text-sky-950"}`}>
              {primary.title}
              <span className={`ml-2 font-bold ${isUrgent ? "text-amber-800" : "text-sky-800"}`}>
                {countdownLabel(primary, t)}
              </span>
            </p>
            <p className={`mt-0.5 text-sm ${isUrgent ? "text-amber-900/85" : "text-sky-900/80"}`}>
              {isUrgent
                ? formatMessage(t.account.countdown.actionUrgent, { event: primary.title })
                : formatMessage(t.account.countdown.actionSoon, { event: primary.title })}
              {extraCount > 0 &&
                ` ${formatMessage(t.account.reminderBannerMore, { count: extraCount })}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/account#reminders"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition ${
              isUrgent
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-sky-700 text-white hover:bg-sky-800"
            }`}
          >
            {t.account.reminderBannerView}
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className={`rounded-lg p-1.5 transition ${
              isUrgent
                ? "text-amber-800 hover:bg-amber-100"
                : "text-sky-800 hover:bg-sky-100"
            }`}
            aria-label={t.account.reminderBannerDismiss}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
