"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookmarkPointCard } from "@/components/account/BookmarkPointCard";
import { EcoDashboard } from "@/components/account/EcoDashboard";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { ReminderCountdownCards } from "@/components/account/ReminderCountdownCards";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { appleCalendarIcs, googleCalendarUrl } from "@/lib/calendar";
import { CalendarPlus } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const {
    member,
    ready,
    logout,
    orders,
    bookmarks,
    reminders,
    ecoStats,
    removeBookmark,
    addReminder,
    removeReminder,
  } = useAuth();
  const { locale, t } = useLanguage();

  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderNotes, setReminderNotes] = useState("");

  useEffect(() => {
    if (ready && !member) {
      router.replace("/login");
    }
  }, [ready, member, router]);

  if (!ready || !member) {
    return null;
  }

  function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDate) return;
    addReminder(reminderTitle.trim(), reminderDate, reminderNotes.trim());
    setReminderTitle("");
    setReminderDate("");
    setReminderNotes("");
  }

  return (
    <>
      <section className="gradient-mesh border-b border-slate-200/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan-foreground">
                {t.account.memberArea}
              </p>
              <h1 className="font-display mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
                {t.account.welcome}
              </h1>
              <p className="mt-2 text-slate-600">{member.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t.account.logout}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6">
        <EcoDashboard
          carbonDivertedKg={ecoStats.carbonDivertedKg}
          largeItemsRecycled={ecoStats.largeItemsRecycled}
        />

        <section>
          <h2 className="font-display text-xl font-semibold text-slate-900">{t.account.orderHistory}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.account.orderDesc}</p>

          {orders.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {t.account.noOrders}
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{order.id}</p>
                      <p className="text-sm text-slate-600">{order.date} · {order.items}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">HK$ {order.total.toFixed(0)}</p>
                      <span className="rounded-full bg-brand-cyan-muted px-2.5 py-0.5 text-xs font-medium text-brand-cyan-foreground">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <OrderTimeline order={order} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            {t.account.savedPoints}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t.account.savedDesc}{" "}
            <Link href="/" className="link-brand font-semibold">
              {t.account.browsePoints}
            </Link>
          </p>

          {bookmarks.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {t.account.noBookmarks}
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {bookmarks.map((point) => (
                <BookmarkPointCard
                  key={point.cp_id}
                  bookmark={point}
                  locale={locale}
                  t={t}
                  onRemove={() => removeBookmark(point.cp_id)}
                />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            {t.account.reminders}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t.account.remindersDesc}</p>

          <div className="mt-6">
            <ReminderCountdownCards reminders={reminders} />
          </div>

          <form
            onSubmit={handleAddReminder}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="event-title" className="text-sm font-medium text-slate-700">
                  {t.account.eventName}
                </label>
                <input
                  id="event-title"
                  required
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder={t.account.eventPlaceholder}
                  className="input-brand mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="event-date" className="text-sm font-medium text-slate-700">
                  {t.account.date}
                </label>
                <input
                  id="event-date"
                  type="date"
                  required
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="input-brand mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label htmlFor="event-notes" className="text-sm font-medium text-slate-700">
                  {t.account.notes}
                </label>
                <input
                  id="event-notes"
                  value={reminderNotes}
                  onChange={(e) => setReminderNotes(e.target.value)}
                  placeholder={t.account.notesPlaceholder}
                  className="input-brand mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary mt-4 rounded-full px-6 py-2.5 text-sm"
            >
              {t.account.addReminder}
            </button>
          </form>

          {reminders.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {t.account.noReminders}
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {reminders.map((reminder) => (
                <li
                  key={reminder.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{reminder.title}</p>
                    <p className="mt-1 text-sm text-brand-cyan-dark">{reminder.date}</p>
                    {reminder.notes && (
                      <p className="mt-1 text-sm text-slate-600">{reminder.notes}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={googleCalendarUrl(reminder.title, reminder.date, reminder.notes)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        {t.account.countdown.addGoogle}
                      </a>
                      <a
                        href={appleCalendarIcs(reminder.title, reminder.date, reminder.notes)}
                        download={`${reminder.title.replace(/\s+/g, "-")}.ics`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        {t.account.countdown.addApple}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReminder(reminder.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    {t.common.remove}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
