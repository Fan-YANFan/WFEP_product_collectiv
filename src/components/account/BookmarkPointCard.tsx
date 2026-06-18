"use client";

import type { BookmarkedPoint } from "@/context/AuthContext";
import type { RecyclingCollectionPoint } from "@/lib/csdi/types";
import { getAddress } from "@/lib/csdi/display";
import type { Translations } from "@/lib/i18n/types";
import { isPointExpiredCampaign, RecyclingPointCard } from "@/components/RecyclingPointCard";

type BookmarkPointCardProps = {
  bookmark: BookmarkedPoint;
  locale: "en" | "zh";
  t: Translations;
  onRemove: () => void;
};

function toDisplayPoint(bookmark: BookmarkedPoint): RecyclingCollectionPoint | null {
  if (bookmark.point) return bookmark.point;

  if (!bookmark.district && !bookmark.wasteTypes) return null;

  return {
    cp_id: bookmark.cp_id,
    cp_state: null,
    district_id: bookmark.district ?? null,
    address_en: bookmark.address,
    address2_en: null,
    address_tc: bookmark.address,
    address2_tc: null,
    address_sc: null,
    address2_sc: null,
    lat: 0,
    lng: 0,
    waste_type: bookmark.wasteTypes ?? null,
    legend: null,
    accessibilty_notes: null,
    contact_en: null,
    contact_tc: null,
    contact_sc: null,
    openhour_en: null,
    openhour_tc: null,
    openhour_sc: null,
  };
}

export function BookmarkPointCard({ bookmark, locale, t, onRemove }: BookmarkPointCardProps) {
  const point = toDisplayPoint(bookmark);
  const addressLocale = locale === "zh" ? "tc" : "en";
  const address = point ? getAddress(point, addressLocale) : bookmark.address;

  if (!point) {
    return (
      <li className="hover-lift">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-base font-semibold leading-snug text-slate-900">
              {bookmark.address}
            </p>
            <button
              type="button"
              onClick={onRemove}
              className="btn-save rounded-full px-2.5 py-1 text-xs"
              title={t.explorer.saveTitle}
            >
              {t.explorer.save}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500">{t.account.bookmarkLegacyNote}</p>
        </div>
      </li>
    );
  }

  return (
    <li className="hover-lift">
      <RecyclingPointCard
        point={point}
        address={address}
        locale={locale}
        t={t}
        expiredCampaign={isPointExpiredCampaign(point)}
        bookmarked
        showBookmark
        onToggleBookmark={onRemove}
        collapsible
        defaultExpanded={false}
      />
      {!bookmark.point && (
        <p className="mt-2 px-1 text-xs text-slate-500">{t.account.bookmarkLegacyNote}</p>
      )}
    </li>
  );
}
