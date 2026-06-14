"use client";

import { CalendarPlus, Clock } from "lucide-react";
import type { EventReminder } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { appleCalendarIcs, daysUntil, googleCalendarUrl } from "@/lib/calendar";
import { formatMessage } from "@/lib/i18n";

type ReminderCountdownCardsProps = {
  reminders: EventReminder[];
};

export function ReminderCountdownCards({ reminders }: ReminderCountdownCardsProps) {
  const { t } = useLanguage();

  const upcoming = reminders
    .map((r) => ({ ...r, daysLeft: daysUntil(r.date) }))
    .filter((r) => r.daysLeft >= 0 && r.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-4">
      {upcoming.map((reminder) => {
        const urgency =
          reminder.daysLeft <= 2
            ? "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
            : "border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50";

        const countdownText =
          reminder.daysLeft === 0
            ? t.account.countdown.endsToday
            : reminder.daysLeft === 1
              ? t.account.countdown.endsTomorrow
              : formatMessage(t.account.countdown.endsInDays, { days: reminder.daysLeft });

        const actionText =
          reminder.daysLeft <= 2
            ? formatMessage(t.account.countdown.actionUrgent, { event: reminder.title })
            : formatMessage(t.account.countdown.actionSoon, { event: reminder.title });

        return (
          <div
            key={reminder.id}
            className={`animate-fade-in-up rounded-2xl border p-5 shadow-sm ${urgency}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{reminder.title}</p>
                  <p className="mt-1 text-sm font-bold text-amber-800">{countdownText}</p>
                  <p className="mt-2 text-sm text-slate-600">{actionText}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={googleCalendarUrl(reminder.title, reminder.date, reminder.notes)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  {t.account.countdown.addGoogle}
                </a>
                <a
                  href={appleCalendarIcs(reminder.title, reminder.date, reminder.notes)}
                  download={`${reminder.title.replace(/\s+/g, "-")}.ics`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  {t.account.countdown.addApple}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
