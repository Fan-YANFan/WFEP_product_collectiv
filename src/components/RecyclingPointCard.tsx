"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
} from "lucide-react";
import type { RecyclingCollectionPoint } from "@/lib/csdi/types";
import {
  getContact,
  getOpenHours,
  googleMapsUrl,
  openStreetMapUrl,
  parseWasteTypes,
} from "@/lib/csdi/display";
import { getDistrictLabel } from "@/lib/i18n/districts";
import type { Translations } from "@/lib/i18n/en";
import {
  EXPIRED_WASTE_TYPE_STYLE,
  getWasteTypeStyle,
  isExpiredWasteType,
} from "@/lib/waste-types";

export type RecyclingPointCardProps = {
  point: RecyclingCollectionPoint;
  address: string;
  locale: "en" | "zh";
  t: Translations;
  expiredCampaign?: boolean;
  bookmarked?: boolean;
  showBookmark?: boolean;
  onToggleBookmark?: () => void;
  /** When true, only header + district show until expanded */
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
};

export function RecyclingPointCard({
  point,
  address,
  locale,
  t,
  expiredCampaign = false,
  bookmarked = false,
  showBookmark = false,
  onToggleBookmark,
  collapsible = false,
  defaultExpanded = false,
  className = "",
}: RecyclingPointCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const addressLocale = locale === "zh" ? "tc" : "en";
  const showDetails = !collapsible || expanded;
  const hasCoords = Number.isFinite(point.lat) && Number.isFinite(point.lng) && (point.lat !== 0 || point.lng !== 0);

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        expiredCampaign ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`font-display text-base leading-snug font-semibold ${
            expiredCampaign ? "text-slate-500" : "text-slate-900"
          }`}
        >
          {address}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {showBookmark && onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`rounded-full px-2.5 py-1 text-xs ${
                bookmarked ? "btn-save-saved" : "btn-save"
              }`}
              title={bookmarked ? t.explorer.removeBookmarkTitle : t.explorer.saveTitle}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Bookmark className="h-3.5 w-3.5" aria-hidden />
              )}
              {bookmarked ? t.explorer.saved : t.explorer.save}
            </button>
          )}
          {point.cp_state && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                expiredCampaign
                  ? "border border-slate-300 bg-slate-200 font-semibold text-slate-600"
                  : point.is_short_term
                    ? "border border-amber-300 bg-amber-100 font-semibold text-amber-900"
                    : "status-accepted"
              }`}
            >
              {expiredCampaign ? (
                t.explorer.expiredBadge
              ) : point.is_short_term ? (
                t.explorer.shortTermBadge
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  {point.cp_state}
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {point.district_id && (
        <p
          className={`mt-1.5 flex items-center gap-1 text-xs ${
            expiredCampaign ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
          {getDistrictLabel(point.district_id, locale)}
        </p>
      )}

      {showDetails && (
        <div className="animate-fade-in">
          {point.legend && (
            <p className={`mt-2 text-sm ${expiredCampaign ? "text-slate-400" : "text-slate-600"}`}>
              {point.legend}
            </p>
          )}

          {point.waste_type && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {parseWasteTypes(point.waste_type).map((w) => {
                const style = getWasteTypeStyle(w);
                const Icon = style.icon;
                const label = t.explorer.wasteTypes[w] ?? w;
                const tagClass = expiredCampaign ? EXPIRED_WASTE_TYPE_STYLE.tag : style.tag;

                return (
                  <span
                    key={w}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${tagClass}`}
                  >
                    <Icon className="h-3 w-3 shrink-0" aria-hidden />
                    {label}
                  </span>
                );
              })}
            </div>
          )}

          {getOpenHours(point, addressLocale) && (
            <p
              className={`mt-2 flex items-start gap-1.5 text-xs ${
                expiredCampaign ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <Clock className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
              <span>
                <span className={`font-medium ${expiredCampaign ? "text-slate-400" : "text-slate-700"}`}>
                  {t.explorer.hours}{" "}
                </span>
                {getOpenHours(point, addressLocale)}
              </span>
            </p>
          )}

          {getContact(point, addressLocale) && (
            <p className={`mt-1 text-xs ${expiredCampaign ? "text-slate-400" : "text-slate-600"}`}>
              {getContact(point, addressLocale)}
            </p>
          )}

          {point.accessibilty_notes && (
            <p className="mt-2 text-xs text-slate-500">{point.accessibilty_notes}</p>
          )}

          {hasCoords && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
              {point.campaign_url && (
                <a
                  href={point.campaign_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${
                    expiredCampaign
                      ? "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
                      : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  {t.explorer.campaignDetails}
                </a>
              )}
              <a
                href={openStreetMapUrl(point.lat, point.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  expiredCampaign
                    ? "inline-flex items-center gap-1 text-slate-500 underline hover:text-slate-700"
                    : "link-brand inline-flex items-center gap-1"
                }
              >
                <MapPin className="h-3 w-3" />
                {t.explorer.openStreetMap}
              </a>
              <a
                href={googleMapsUrl(point.lat, point.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  expiredCampaign
                    ? "inline-flex items-center gap-1 text-slate-500 underline hover:text-slate-700"
                    : "link-brand inline-flex items-center gap-1"
                }
              >
                <Navigation className="h-3 w-3" />
                {t.explorer.googleMaps}
              </a>
            </div>
          )}
        </div>
      )}

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-cyan hover:bg-brand-cyan-muted/40 hover:text-brand-cyan-foreground"
          aria-expanded={expanded}
        >
          {expanded ? t.account.bookmarkShowLess : t.account.bookmarkShowMore}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

export function isPointExpiredCampaign(point: RecyclingCollectionPoint): boolean {
  const types = parseWasteTypes(point.waste_type);
  return types.some((w) => isExpiredWasteType(w));
}
