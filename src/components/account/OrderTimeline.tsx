"use client";

import {
  Building2,
  Check,
  ClipboardCheck,
  Heart,
  PackageCheck,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MemberOrder, OrderTimelineStep } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatMessage } from "@/lib/i18n";

const STEPS: OrderTimelineStep[] = [
  "accepted",
  "en_route",
  "collected",
  "at_facility",
  "sorted",
];

const STEP_INDEX: Record<OrderTimelineStep, number> = {
  accepted: 0,
  en_route: 1,
  collected: 2,
  at_facility: 3,
  sorted: 4,
};

const STEP_ICONS: Record<OrderTimelineStep, LucideIcon> = {
  accepted: ClipboardCheck,
  en_route: Truck,
  collected: PackageCheck,
  at_facility: Building2,
  sorted: Heart,
};

type OrderTimelineProps = {
  order: MemberOrder;
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  const { t } = useLanguage();
  const timeline = order.timeline;
  if (!timeline) return null;

  const currentIdx = STEP_INDEX[timeline.current];
  const progressPct = Math.round(((currentIdx + 1) / STEPS.length) * 100);
  const isComplete = timeline.current === "sorted";

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.account.timeline.title}
          </p>
          <span className="rounded-full bg-brand-orange-muted px-2.5 py-0.5 text-xs font-semibold text-brand-orange-foreground">
            {progressPct}%
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ol className="relative px-5 py-5">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const isLast = idx === STEPS.length - 1;
          const Icon = STEP_ICONS[step];

          let label = t.account.timeline.steps[step];
          if (step === "en_route" && (active || done) && timeline.eta) {
            label = formatMessage(t.account.timeline.enRouteEta, { eta: timeline.eta });
          }

          return (
            <li key={step} className="relative flex gap-4 pb-7 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[17px] top-10 bottom-0 w-px ${
                    done ? "bg-brand-orange/50" : "bg-slate-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  done
                    ? "border-brand-orange bg-brand-orange text-white shadow-sm shadow-brand-orange/30"
                    : active
                      ? "border-brand-orange bg-white text-brand-orange-dark shadow-md ring-4 ring-brand-orange/15"
                      : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <Icon className={`h-4 w-4 ${active ? "text-brand-orange-dark" : ""}`} />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-sm font-semibold leading-snug ${
                      active
                        ? "text-slate-900"
                        : done
                          ? "text-slate-700"
                          : "text-slate-400"
                    }`}
                  >
                    {label}
                  </p>
                  {active && step === "en_route" && timeline.eta && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      <Truck className="h-3 w-3" />
                      ETA
                    </span>
                  )}
                  {active && !isLast && (
                    <span className="rounded-full bg-brand-orange-muted px-2 py-0.5 text-[10px] font-semibold text-brand-orange-foreground">
                      {t.account.timeline.inProgress}
                    </span>
                  )}
                </div>

                {step === "sorted" && (active || done) && (
                  <div
                    className={`mt-3 rounded-xl border p-3.5 ${
                      isComplete
                        ? "border-brand-orange/30 bg-gradient-to-br from-brand-orange-muted to-white"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    {isComplete && (
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-orange-foreground">
                        {t.account.timeline.closureTitle}
                      </p>
                    )}
                    <p
                      className={`text-sm leading-relaxed ${
                        isComplete ? "mt-1 text-slate-700" : "text-slate-500"
                      }`}
                    >
                      {t.account.timeline.closureNote}
                    </p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
