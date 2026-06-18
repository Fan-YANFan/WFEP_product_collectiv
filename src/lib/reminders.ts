import type { EventReminder } from "@/context/AuthContext";
import { daysUntil } from "@/lib/calendar";

export const UPCOMING_REMINDER_WINDOW_DAYS = 14;
export const URGENT_REMINDER_DAYS = 2;

export type UpcomingReminder = EventReminder & { daysLeft: number };

export function getUpcomingReminders(
  reminders: EventReminder[],
  withinDays = UPCOMING_REMINDER_WINDOW_DAYS,
): UpcomingReminder[] {
  return reminders
    .map((reminder) => ({ ...reminder, daysLeft: daysUntil(reminder.date) }))
    .filter((reminder) => reminder.daysLeft >= 0 && reminder.daysLeft <= withinDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function hasUpcomingReminders(reminders: EventReminder[]): boolean {
  return getUpcomingReminders(reminders).length > 0;
}

export function getUrgentReminders(reminders: EventReminder[]): UpcomingReminder[] {
  return getUpcomingReminders(reminders).filter(
    (reminder) => reminder.daysLeft <= URGENT_REMINDER_DAYS,
  );
}
