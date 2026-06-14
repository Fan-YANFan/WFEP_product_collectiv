"use client";

import { Leaf, Recycle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatMessage } from "@/lib/i18n";

type EcoDashboardProps = {
  carbonDivertedKg: number;
  largeItemsRecycled: number;
};

export function EcoDashboard({ carbonDivertedKg, largeItemsRecycled }: EcoDashboardProps) {
  const { t } = useLanguage();
  const treeScale = Math.min(1, 0.5 + carbonDivertedKg / 200);
  const coastClean = Math.min(100, 30 + largeItemsRecycled * 8);

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm">
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            {t.account.ecoDashboard.badge}
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {t.account.ecoDashboard.title}
          </h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-emerald-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Leaf className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                {formatMessage(t.account.ecoDashboard.carbonLine, { kg: carbonDivertedKg })}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-emerald-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <Recycle className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                {formatMessage(t.account.ecoDashboard.itemsLine, { count: largeItemsRecycled })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Growing tree micro-illustration */}
          <div className="flex-1 rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-50 p-4 ring-1 ring-emerald-100">
            <p className="text-xs font-semibold text-emerald-800">{t.account.ecoDashboard.treeLabel}</p>
            <svg viewBox="0 0 200 120" className="mt-2 h-28 w-full" aria-hidden>
              <rect x="0" y="95" width="200" height="25" fill="#86efac" rx="4" />
              <rect
                x="92"
                y={80 - treeScale * 20}
                width="16"
                height={20 + treeScale * 20}
                fill="#92400e"
                rx="2"
                className="transition-all duration-1000"
              />
              <ellipse
                cx="100"
                cy={55 - treeScale * 15}
                rx={20 + treeScale * 18}
                ry={18 + treeScale * 14}
                fill="#16a34a"
                className="transition-all duration-1000"
              />
              <ellipse
                cx="88"
                cy={62 - treeScale * 10}
                rx={12 + treeScale * 10}
                ry={12 + treeScale * 8}
                fill="#22c55e"
                className="transition-all duration-1000"
              />
              <ellipse
                cx="112"
                cy={62 - treeScale * 10}
                rx={12 + treeScale * 10}
                ry={12 + treeScale * 8}
                fill="#22c55e"
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* HK coastline micro-illustration */}
          <div className="flex-1 rounded-2xl bg-gradient-to-b from-sky-200 to-sky-50 p-4 ring-1 ring-sky-100">
            <p className="text-xs font-semibold text-sky-900">{t.account.ecoDashboard.coastLabel}</p>
            <svg viewBox="0 0 200 80" className="mt-2 h-24 w-full" aria-hidden>
              <rect x="0" y="40" width="200" height="40" fill="#38bdf8" opacity="0.5" />
              <path
                d="M0 50 Q50 35 100 48 T200 42 L200 80 L0 80 Z"
                fill="#0ea5e9"
                opacity={0.4 + coastClean / 200}
              />
              <path d="M0 55 Q60 42 120 52 T200 48" stroke="#f8fafc" strokeWidth="3" fill="none" opacity="0.6" />
              {coastClean > 50 && (
                <circle cx="160" cy="38" r="6" fill="#fbbf24" className="animate-pulse" />
              )}
              <rect x="10" y="58" width="8" height="14" fill="#64748b" opacity="0.5" />
              <rect x="30" y="54" width="10" height="18" fill="#64748b" opacity="0.5" />
              <rect x="55" y="60" width="6" height="12" fill="#64748b" opacity="0.4" />
            </svg>
            <p className="mt-1 text-xs text-sky-800">
              {formatMessage(t.account.ecoDashboard.coastProgress, { pct: coastClean })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
