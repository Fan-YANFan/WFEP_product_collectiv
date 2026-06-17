"use client";

import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Navigation,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { HK_DISTRICTS, WASTE_TYPE_FILTERS } from "@/lib/csdi/constants";
import { BOOKS_FOR_LOVE_CAMPAIGN } from "@/lib/campaigns/books-for-love";
import {
  getAddress,
  getContact,
  getOpenHours,
  googleMapsUrl,
  openStreetMapUrl,
  parseWasteTypes,
} from "@/lib/csdi/display";
import { getDistrictLabel } from "@/lib/i18n/districts";
import { formatMessage } from "@/lib/i18n";
import { getWasteTypeStyle, isShortTermWasteType } from "@/lib/waste-types";
import type { RecyclingCollectionPoint } from "@/lib/csdi/types";

interface ApiResponse {
  points: RecyclingCollectionPoint[];
  total: number;
  offset: number;
  limit: number;
  error?: string;
}

const PAGE_SIZE = 25;
const NEARBY_RADIUS_M = 2000;

export function RecyclingPointsExplorer() {
  const { member, addBookmark, removeBookmark, isBookmarked } = useAuth();
  const { locale: siteLocale, t } = useLanguage();
  const addressLocale = siteLocale === "zh" ? "tc" : "en";
  const [district, setDistrict] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [search, setSearch] = useState("");
  const [nearby, setNearby] = useState(false);
  const [offset, setOffset] = useState(0);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(PAGE_SIZE),
      });

      if (district) params.set("district", district);
      if (wasteType) params.set("wasteType", wasteType);
      if (search.trim()) params.set("search", search.trim());

      if (nearby && coords) {
        params.set("lat", String(coords.lat));
        params.set("lng", String(coords.lng));
        params.set("radiusMeters", String(NEARBY_RADIUS_M));
      }

      try {
        const res = await fetch(`/api/recycling-points?${params}`);
        const json = (await res.json()) as ApiResponse;
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? t.explorer.requestFailed);
          setData(null);
        } else {
          setData(json);
        }
      } catch {
        if (!cancelled) {
          setError(t.explorer.apiError);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [coords, district, nearby, offset, refreshNonce, search, wasteType, t.explorer.apiError, t.explorer.requestFailed]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    setRefreshNonce((n) => n + 1);
  }

  function requestNearby() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError(t.explorer.geoUnsupported);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearby(true);
        setOffset(0);
      },
      () => setGeoError(t.explorer.geoDenied),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  const total = data?.total ?? 0;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);

  const resultsLabel = useMemo(() => {
    if (loading) return t.common.loading;
    if (total === 0) return t.explorer.noResults;
    return formatMessage(t.explorer.showing, {
      start: pageStart,
      end: pageEnd,
      total,
    });
  }, [loading, total, pageStart, pageEnd, t]);

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSearchSubmit}
        className="animate-scale-in rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[140px] flex-1">
            <label htmlFor="rcp-search" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.explorer.searchAddress}
            </label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="rcp-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.explorer.searchPlaceholder}
                className="input-brand w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm"
              />
            </div>
          </div>
          <div className="min-w-[160px]">
            <label htmlFor="rcp-district" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.explorer.district}
            </label>
            <select
              id="rcp-district"
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setOffset(0);
              }}
              className="input-brand mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">{t.explorer.allDistricts}</option>
              {HK_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {getDistrictLabel(d, siteLocale)}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary rounded-full px-6 py-2.5 text-sm">
            {t.common.search}
          </button>
          <button
            type="button"
            onClick={requestNearby}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-cyan hover:bg-brand-cyan-muted/50 hover:text-brand-cyan-foreground"
          >
            <Navigation className="h-4 w-4" />
            {t.explorer.nearMe}
          </button>
          {nearby && (
            <button
              type="button"
              onClick={() => {
                setNearby(false);
                setCoords(null);
                setOffset(0);
              }}
              className="link-brand text-sm underline"
            >
              {t.explorer.clearNearby}
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="mb-1 flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t.explorer.wasteType}
          </span>
          {WASTE_TYPE_FILTERS.map((type) => {
            const style = getWasteTypeStyle(type);
            const Icon = style.icon;
            const selected = wasteType === type;
            const label = t.explorer.wasteTypes[type] ?? type;
            const shortTerm = isShortTermWasteType(type);

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setWasteType(selected ? "" : type);
                  setOffset(0);
                }}
                className={`chip-pop inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  selected ? `${style.chipActive} scale-105` : style.chip
                } ${shortTerm ? "short-term-waste-chip" : ""}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {label}
                {shortTerm && (
                  <span className="rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {t.explorer.shortTermBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {wasteType === "Books" && (
          <div className="animate-fade-in mt-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">{t.explorer.booksCampaignTitle}</p>
            <p className="mt-1 leading-relaxed text-amber-900/90">{t.explorer.booksCampaignDesc}</p>
            <a
              href={BOOKS_FOR_LOVE_CAMPAIGN.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-brand mt-2 inline-block font-semibold underline"
            >
              {t.explorer.booksCampaignLink}
            </a>
          </div>
        )}

        {geoError && (
          <p className="animate-fade-in mt-3 text-sm text-amber-700">{geoError}</p>
        )}
        {nearby && coords && (
          <p className="animate-fade-in mt-3 flex items-center gap-1.5 text-sm text-slate-600">
            <Navigation className="h-4 w-4 text-brand-cyan-dark" />
            {formatMessage(t.explorer.nearMeHint, {
              km: (NEARBY_RADIUS_M / 1000).toFixed(1),
            })}
          </p>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p className={loading ? "animate-pulse" : ""}>{resultsLabel}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading || offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.common.previous}
          </button>
          <button
            type="button"
            disabled={loading || !data || offset + PAGE_SIZE >= total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:opacity-40"
          >
            {t.common.next}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {!loading &&
          data?.points.map((point, index) => (
            <PointCard
              key={point.cp_id}
              point={point}
              index={index}
              address={getAddress(point, addressLocale)}
              bookmarked={isBookmarked(point.cp_id)}
              member={!!member}
              siteLocale={siteLocale}
              t={t}
              onToggleBookmark={() =>
                isBookmarked(point.cp_id)
                  ? removeBookmark(point.cp_id)
                  : addBookmark(point, getAddress(point, addressLocale))
              }
            />
          ))}
      </ul>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-shimmer h-44 rounded-2xl border border-slate-100 bg-slate-100"
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PointCardProps {
  point: RecyclingCollectionPoint;
  index: number;
  address: string;
  bookmarked: boolean;
  member: boolean;
  siteLocale: "en" | "zh";
  t: ReturnType<typeof useLanguage>["t"];
  onToggleBookmark: () => void;
}

function PointCard({
  point,
  index,
  address,
  bookmarked,
  member,
  siteLocale,
  t,
  onToggleBookmark,
}: PointCardProps) {
  const addressLocale = siteLocale === "zh" ? "tc" : "en";
  const stagger = Math.min(index % 6, 5) + 1;

  return (
    <li
      className={`hover-lift animate-fade-in-up stagger-${stagger} rounded-2xl border border-slate-100 bg-white p-5 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-base leading-snug font-semibold text-slate-900">{address}</p>
        <div className="flex shrink-0 items-center gap-2">
          {member && (
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
                point.is_short_term
                  ? "border border-amber-300 bg-amber-100 font-semibold text-amber-900"
                  : "status-accepted"
              }`}
            >
              {point.is_short_term ? (
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
        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
          {getDistrictLabel(point.district_id, siteLocale)}
        </p>
      )}

      {point.legend && <p className="mt-2 text-sm text-slate-600">{point.legend}</p>}

      {point.waste_type && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {parseWasteTypes(point.waste_type).map((w) => {
            const style = getWasteTypeStyle(w);
            const Icon = style.icon;
            const label = t.explorer.wasteTypes[w] ?? w;

            return (
              <span
                key={w}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${style.tag}`}
              >
                <Icon className="h-3 w-3 shrink-0" aria-hidden />
                {label}
              </span>
            );
          })}
        </div>
      )}

      {getOpenHours(point, addressLocale) && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
          <Clock className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          <span>
            <span className="font-medium text-slate-700">{t.explorer.hours} </span>
            {getOpenHours(point, addressLocale)}
          </span>
        </p>
      )}

      {getContact(point, addressLocale) && (
        <p className="mt-1 text-xs text-slate-600">{getContact(point, addressLocale)}</p>
      )}

      {point.accessibilty_notes && (
        <p className="mt-2 text-xs text-slate-500">{point.accessibilty_notes}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
        {point.campaign_url && (
          <a
            href={point.campaign_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-900 hover:bg-amber-100"
          >
            {t.explorer.campaignDetails}
          </a>
        )}
        <a
          href={openStreetMapUrl(point.lat, point.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="link-brand inline-flex items-center gap-1"
        >
          <MapPin className="h-3 w-3" />
          {t.explorer.openStreetMap}
        </a>
        <a
          href={googleMapsUrl(point.lat, point.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="link-brand inline-flex items-center gap-1"
        >
          <Navigation className="h-3 w-3" />
          {t.explorer.googleMaps}
        </a>
        {/* <span className="text-slate-400">
          {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
        </span> */}
      </div>
    </li>
  );
}
