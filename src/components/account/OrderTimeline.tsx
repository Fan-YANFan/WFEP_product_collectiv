"use client";

import { Check, Circle, Truck } from "lucide-react";
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

type OrderTimelineProps = {
  order: MemberOrder;
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  const { t } = useLanguage();
  const timeline = order.timeline;
  if (!timeline) return null;

  const currentIdx = STEP_INDEX[timeline.current];

  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {t.account.timeline.title}
      </p>
      <ol className="relative mt-4 space-y-0">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const isLast = idx === STEPS.length - 1;

          let label = t.account.timeline.steps[step];
          if (step === "en_route" && active && timeline.eta) {
            label = formatMessage(t.account.timeline.enRouteEta, { eta: timeline.eta });
          }

          return (
            <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[15px] top-8 h-full w-0.5 ${
                    done ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "border-brand-cyan-dark bg-white text-brand-cyan-dark shadow-md"
                      : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : step === "en_route" && active ? (
                  <Truck className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3 fill-current" />
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm font-semibold ${
                    active ? "text-slate-900" : done ? "text-emerald-800" : "text-slate-400"
                  }`}
                >
                  {label}
                </p>
                {active && step === "sorted" && (
                  <p className="mt-1 text-xs text-emerald-700">{t.account.timeline.closureNote}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
