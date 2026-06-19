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
import type { Translations } from "@/lib/i18n/types";
import { MIL_BUS_CAMPAIGN } from "@/lib/campaigns/mil-bus-recycling";
import { BATTERY_LOOP_CAMPAIGN } from "@/lib/campaigns/battery-loop-recycling";
import { BOOKS_FOR_LOVE_CAMPAIGN } from "@/lib/campaigns/books-for-love";
import { ADVENTIST_MEDICATION_CAMPAIGN } from "@/lib/campaigns/adventist-medication-disposal";
import { GREEN_COLLECTION_CAMPAIGN } from "@/lib/campaigns/green-collection-programme";
import { MEDICATION_COLLECTION_CAMPAIGN } from "@/lib/campaigns/medication-collection-2026";
import {
  EXPIRED_WASTE_TYPE_STYLE,
  getWasteTypeLabel,
  getWasteTypeStyle,
  isExpiredWasteType,
  normalizeWasteTypeKey,
} from "@/lib/waste-types";
import { getShortTermCountdown } from "@/lib/short-term-countdown";
import { ShortTermCountdownBar } from "@/components/ShortTermCountdownBar";

export type RecyclingPointCardProps = {
  point: RecyclingCollectionPoint;
  address: string;
  locale: "en" | "zh";
  t: Translations;
  expiredCampaign?: boolean;
  /** Active waste-type filter — used for short-term styling on multi-type campaign points */
  activeWasteType?: string;
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
  activeWasteType,
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
  const isShortTermEvent = point.is_short_term && !expiredCampaign;
  const shortTermCountdown = getShortTermCountdown(point, expiredCampaign);
  const mapPinClass = isShortTermEvent ? "short-term-map-pin text-amber-500" : "text-slate-400";
  const wasteTypes = parseWasteTypes(point.waste_type);
  const normalizedActiveType = activeWasteType ? normalizeWasteTypeKey(activeWasteType) : null;
  const highlightedType =
    normalizedActiveType && wasteTypes.some((type) => normalizeWasteTypeKey(type) === normalizedActiveType)
      ? normalizedActiveType
      : wasteTypes.length === 1
        ? normalizeWasteTypeKey(wasteTypes[0])
        : null;
  const primaryWasteStyle = highlightedType ? getWasteTypeStyle(highlightedType) : null;
  const useWasteTypeStatusBadge =
    !expiredCampaign &&
    primaryWasteStyle &&
    highlightedType &&
    (point.is_short_term || point.cp_state === "Upcoming");

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        expiredCampaign
          ? "border-slate-200 bg-slate-50"
          : isShortTermEvent
            ? "border-amber-200/80 bg-gradient-to-br from-amber-50/40 to-white"
            : "border-slate-100 bg-white"
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          {isShortTermEvent && (
            <span className="short-term-map-pin mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 ring-2 ring-amber-300/60">
              <MapPin className="h-4 w-4 text-amber-600" aria-hidden />
            </span>
          )}
          <p
            className={`font-display text-base leading-snug font-semibold ${
              expiredCampaign ? "text-slate-500" : "text-slate-900"
            }`}
          >
            {address}
          </p>
        </div>
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
                  : useWasteTypeStatusBadge
                    ? `inline-flex items-center gap-1 border font-semibold ${primaryWasteStyle!.chipActive}`
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
                  {!useWasteTypeStatusBadge && (
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                  )}
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
          <MapPin className={`h-3 w-3 shrink-0 ${mapPinClass}`} />
          {getDistrictLabel(point.district_id, locale)}
        </p>
      )}

      {shortTermCountdown && (
        <ShortTermCountdownBar info={shortTermCountdown} locale={locale} t={t} />
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
                const styleKey = normalizeWasteTypeKey(w);
                const style = getWasteTypeStyle(styleKey);
                const Icon = style.icon;
                const label = getWasteTypeLabel(w, t.explorer.wasteTypes);
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
                <MapPin className={`h-3 w-3 ${mapPinClass}`} />
                {t.explorer.openStreetMap}
              </a>
              <a
                href={googleMapsUrl(point.lat, point.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  expiredCampaign
                    ? "inline-flex items-center gap-1 text-slate-500 underline hover:text-slate-700"
                    : isShortTermEvent
                      ? "inline-flex items-center gap-1 font-semibold text-amber-700 underline hover:text-amber-900"
                      : "link-brand inline-flex items-center gap-1"
                }
              >
                <Navigation className={`h-3 w-3 ${isShortTermEvent ? "text-amber-600" : ""}`} />
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
  if (point.campaign_source === MIL_BUS_CAMPAIGN.id) {
    return !point.is_short_term;
  }
  if (point.campaign_source === GREEN_COLLECTION_CAMPAIGN.id) {
    return point.cp_state === "Ended";
  }
  if (point.campaign_source === MEDICATION_COLLECTION_CAMPAIGN.id) {
    return false;
  }
  if (point.campaign_source === ADVENTIST_MEDICATION_CAMPAIGN.id) {
    return true;
  }
  if (point.campaign_source === BOOKS_FOR_LOVE_CAMPAIGN.id) {
    return true;
  }
  if (point.campaign_source === BATTERY_LOOP_CAMPAIGN.id) {
    return true;
  }
  const types = parseWasteTypes(point.waste_type);
  return types.some((w) => isExpiredWasteType(normalizeWasteTypeKey(w)));
}

