"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MemberOrder } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { OrderTimeline } from "./OrderTimeline";

function isOrderDelivered(order: MemberOrder): boolean {
  return order.status === "Delivered" || order.timeline?.current === "sorted";
}

type OrderHistoryCardProps = {
  order: MemberOrder;
};

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const { t } = useLanguage();
  const delivered = isOrderDelivered(order);
  const [expanded, setExpanded] = useState(!delivered);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-label={expanded ? t.account.orderCollapse : t.account.orderExpand}
        className={`flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-100/60 ${
          expanded ? "border-b border-slate-100 bg-slate-50/80" : "bg-slate-50/80"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{order.id}</p>
          <p className="text-sm text-slate-600">
            {order.date} · {order.items}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-slate-900">HK$ {order.total.toFixed(0)}</p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                delivered
                  ? "bg-slate-200 text-slate-600"
                  : "bg-brand-cyan-muted text-brand-cyan-foreground"
              }`}
            >
              {order.status}
            </span>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5">
          <OrderTimeline order={order} />
        </div>
      )}
    </div>
  );
}
