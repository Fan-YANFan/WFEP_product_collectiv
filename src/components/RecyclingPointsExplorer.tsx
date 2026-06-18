"use client";

import { RecyclingPointCard, isPointExpiredCampaign } from "@/components/RecyclingPointCard";
import {
  ChevronLeft,
  ChevronRight,
  Navigation,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { HK_DISTRICTS, WASTE_TYPE_FILTERS } from "@/lib/csdi/constants";
import { BOOKS_FOR_LOVE_CAMPAIGN } from "@/lib/campaigns/books-for-love";
import { ADVENTIST_MEDICATION_CAMPAIGN } from "@/lib/campaigns/adventist-medication-disposal";
import { MEDICATION_COLLECTION_CAMPAIGN } from "@/lib/campaigns/medication-collection-2026";
import { FOOD_ANGEL_CAMPAIGN } from "@/lib/campaigns/food-angel-food-rescue";
import {
  isGreenCollectionWasteType,
  GREEN_COLLECTION_CAMPAIGN,
} from "@/lib/campaigns/green-collection-programme";
import { isMilBusWasteType, MIL_BUS_CAMPAIGN } from "@/lib/campaigns/mil-bus-recycling";
import { WATSONS_SKINCARE_CAMPAIGN } from "@/lib/campaigns/watsons-skincare-recycling";
import { WATSONS_PLASTIC_BATTERY_CAMPAIGN } from "@/lib/campaigns/watsons-plastic-battery-recycling";
import { getAddress } from "@/lib/csdi/display";
import type { RecyclingCollectionPoint } from "@/lib/csdi/types";
import { formatMessage } from "@/lib/i18n";
import { getDistrictLabel } from "@/lib/i18n/districts";
import {
  getExpiredBadgeClass,
  getWasteTypeStyle,
  isExpiredWasteType,
} from "@/lib/waste-types";

interface ApiResponse {
  points: RecyclingCollectionPoint[];
  total: number;
  offset: number;
  limit: number;
  error?: string;
}

const PAGE_SIZE = 25;
const CAMPAIGN_PAGE_SIZE = 100;
const NEARBY_RADIUS_M = 2000;

function usesCampaignPageSize(wasteType: string): boolean {
  return (
    wasteType === "Books" ||
    wasteType === "Medication" ||
    wasteType === "Food Rescue" ||
    isGreenCollectionWasteType(wasteType) ||
    wasteType === "Skincare Containers" ||
    wasteType === "Plastic Bottle" ||
    wasteType === "Rechargeable Batteries" ||
    isMilBusWasteType(wasteType)
  );
}

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
  const resultsAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const pageSize = usesCampaignPageSize(wasteType) ? CAMPAIGN_PAGE_SIZE : PAGE_SIZE;

      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(pageSize),
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

  const pageSize = usesCampaignPageSize(wasteType) ? CAMPAIGN_PAGE_SIZE : PAGE_SIZE;
  const total = data?.total ?? 0;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.floor(offset / pageSize) + 1;
  const hasMultiplePages = total > pageSize;

  function goToPage(newOffset: number) {
    setOffset(newOffset);
    requestAnimationFrame(() => {
      resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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
            const expired = isExpiredWasteType(type);
            const chipClass = selected ? style.chipActive : style.chip;

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setWasteType(selected ? "" : type);
                  setOffset(0);
                }}
                className={`chip-pop inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${chipClass}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {label}
                {expired && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getExpiredBadgeClass(type)}`}
                  >
                    {t.explorer.expiredBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {wasteType === "Books" && (
          <div className="animate-fade-in mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">{t.explorer.booksCampaignTitle}</p>
            <p className="mt-1 leading-relaxed">{t.explorer.booksCampaignEndedDesc}</p>
            <a
              href={BOOKS_FOR_LOVE_CAMPAIGN.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-slate-500 underline hover:text-slate-700"
            >
              {t.explorer.booksCampaignLink}
            </a>
          </div>
        )}

        {wasteType === "Food Rescue" && (
          <div className="animate-fade-in mt-4 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 text-sm text-red-950">
            <p className="font-semibold">{t.explorer.foodRescueCampaignTitle}</p>
            <p className="mt-1 leading-relaxed text-red-900/90">{t.explorer.foodRescueCampaignDesc}</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-red-900/85">
              <li>{t.explorer.foodRescueRule1}</li>
              <li>{t.explorer.foodRescueRule2}</li>
              <li>{t.explorer.foodRescueRule3}</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={FOOD_ANGEL_CAMPAIGN.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-red-800 underline hover:text-red-950"
              >
                {t.explorer.foodRescueCampaignLink}
              </a>
              <a
                href={FOOD_ANGEL_CAMPAIGN.programUrlTc}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-red-800 underline hover:text-red-950"
              >
                {t.explorer.foodRescueCampaignLinkTc}
              </a>
            </div>
          </div>
        )}

        {isGreenCollectionWasteType(wasteType) && (
          <div className="animate-fade-in mt-4 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 text-sm text-sky-950">
            <p className="font-semibold">{t.explorer.greenCollectionCampaignTitle}</p>
            <p className="mt-1 leading-relaxed text-sky-900/90">{t.explorer.greenCollectionCampaignDesc}</p>
            <a
              href={GREEN_COLLECTION_CAMPAIGN.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-sky-800 underline hover:text-sky-950"
            >
              {t.explorer.greenCollectionCampaignLink}
            </a>
          </div>
        )}

        {wasteType === "Medication" && (
          <>
            <div className="animate-fade-in mt-4 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 text-sm text-teal-950">
              <p className="font-semibold">{t.explorer.medicationCampaignTitle}</p>
              <p className="mt-1 leading-relaxed text-teal-900/90">{t.explorer.medicationCampaignDesc}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-teal-900/85">
                <li>{t.explorer.medicationCampaignRule1}</li>
                <li>{t.explorer.medicationCampaignRule2}</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                <a
                  href={MEDICATION_COLLECTION_CAMPAIGN.pointsPdfEn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-800 underline hover:text-teal-950"
                >
                  {t.explorer.medicationCampaignLinkEn}
                </a>
                <a
                  href={MEDICATION_COLLECTION_CAMPAIGN.pointsPdfTc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-800 underline hover:text-teal-950"
                >
                  {t.explorer.medicationCampaignLinkTc}
                </a>
                <a
                  href={MEDICATION_COLLECTION_CAMPAIGN.pointsFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-800 underline hover:text-teal-950"
                >
                  {t.explorer.medicationCampaignFolderLink}
                </a>
              </div>
            </div>

            <div className="animate-fade-in mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">{t.explorer.adventistMedicationCampaignTitle}</p>
              <p className="mt-1 leading-relaxed">{t.explorer.adventistMedicationCampaignEndedDesc}</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>{t.explorer.adventistMedicationCampaignRule1}</li>
                <li>{t.explorer.adventistMedicationCampaignRule2}</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                <a
                  href={ADVENTIST_MEDICATION_CAMPAIGN.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-500 underline hover:text-slate-700"
                >
                  {t.explorer.adventistMedicationCampaignLink}
                </a>
                <a
                  href={ADVENTIST_MEDICATION_CAMPAIGN.hospitalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-500 underline hover:text-slate-700"
                >
                  {t.explorer.adventistMedicationCampaignHospitalLink}
                </a>
              </div>
            </div>
          </>
        )}

        {wasteType === "Skincare Containers" && (
          <div className="animate-fade-in mt-4 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 text-sm text-rose-950">
            <p className="font-semibold">{t.explorer.skincareCampaignTitle}</p>
            <p className="mt-1 leading-relaxed text-rose-900/90">{t.explorer.skincareCampaignDesc}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={WATSONS_SKINCARE_CAMPAIGN.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-brand font-semibold underline"
              >
                {t.explorer.skincareCampaignProgramLink}
              </a>
              <a
                href={WATSONS_SKINCARE_CAMPAIGN.storeFinderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-brand font-semibold underline"
              >
                {t.explorer.skincareCampaignStoreLink}
              </a>
            </div>
          </div>
        )}

        {wasteType === "Plastic Bottle" && (
          <div className="animate-fade-in mt-4 rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 p-4 text-sm text-cyan-950">
            <p className="font-semibold">{t.explorer.plasticBottleCampaignTitle}</p>
            <p className="mt-1 leading-relaxed text-cyan-900/90">{t.explorer.plasticBottleCampaignDesc}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={WATSONS_PLASTIC_BATTERY_CAMPAIGN.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-800 underline hover:text-cyan-950"
              >
                {t.explorer.plasticBottleCampaignProgramLink}
              </a>
              <a
                href={WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-800 underline hover:text-cyan-950"
              >
                {t.explorer.plasticBottleCampaignStoreLink}
              </a>
            </div>
          </div>
        )}

        {wasteType === "Rechargeable Batteries" && (
          <div className="animate-fade-in mt-4 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-sm text-orange-950">
            <p className="font-semibold">{t.explorer.batteryCampaignTitle}</p>
            <p className="mt-1 leading-relaxed text-orange-900/90">{t.explorer.batteryCampaignDesc}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <a
                href={WATSONS_PLASTIC_BATTERY_CAMPAIGN.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange-800 underline hover:text-orange-950"
              >
                {t.explorer.batteryCampaignProgramLink}
              </a>
              <a
                href={WATSONS_PLASTIC_BATTERY_CAMPAIGN.batteryProgramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange-800 underline hover:text-orange-950"
              >
                {t.explorer.batteryCampaignGovLink}
              </a>
              <a
                href={WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-orange-800 underline hover:text-orange-950"
              >
                {t.explorer.batteryCampaignStoreLink}
              </a>
            </div>
          </div>
        )}

        {isMilBusWasteType(wasteType) && (
          <div className="animate-fade-in mt-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-sm text-emerald-950">
            <p className="font-semibold">{t.explorer.milBusCampaignTitle}</p>
            <p className="mt-1 leading-relaxed text-emerald-900/90">{t.explorer.milBusCampaignDesc}</p>
            <a
              href={MIL_BUS_CAMPAIGN.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-emerald-800 underline hover:text-emerald-950"
            >
              {t.explorer.milBusCampaignLink}
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

      <div ref={resultsAnchorRef} className="scroll-mt-20 space-y-4">
        <ExplorerPagination
            loading={loading}
            resultsLabel={resultsLabel}
            currentPage={currentPage}
            totalPages={totalPages}
            showPageNumber={hasMultiplePages}
            canGoPrev={offset > 0}
            canGoNext={!!data && offset + pageSize < total}
            onPrev={() => goToPage(Math.max(0, offset - pageSize))}
            onNext={() => goToPage(offset + pageSize)}
            t={t}
          />

        {error && (
          <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <ul className="grid gap-4 sm:grid-cols-2">
        {!loading &&
          data?.points.map((point, index) => {
            const stagger = Math.min(index % 6, 5) + 1;
            return (
              <li
                key={point.cp_id}
                className={`hover-lift animate-fade-in-up stagger-${stagger}`}
              >
                <RecyclingPointCard
                  point={point}
                  address={getAddress(point, addressLocale)}
                  locale={siteLocale}
                  t={t}
                  expiredCampaign={isPointExpiredCampaign(point)}
                  activeWasteType={wasteType || undefined}
                  bookmarked={isBookmarked(point.cp_id)}
                  showBookmark={!!member}
                  onToggleBookmark={() =>
                    isBookmarked(point.cp_id)
                      ? removeBookmark(point.cp_id)
                      : addBookmark(point, getAddress(point, addressLocale))
                  }
                />
              </li>
            );
          })}
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

        {hasMultiplePages && !loading && (
          <ExplorerPagination
            loading={loading}
            resultsLabel={resultsLabel}
            currentPage={currentPage}
            totalPages={totalPages}
            showPageNumber={hasMultiplePages}
            canGoPrev={offset > 0}
            canGoNext={!!data && offset + pageSize < total}
            onPrev={() => goToPage(Math.max(0, offset - pageSize))}
            onNext={() => goToPage(offset + pageSize)}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

type ExplorerPaginationProps = {
  loading: boolean;
  resultsLabel: string;
  currentPage: number;
  totalPages: number;
  showPageNumber: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  t: ReturnType<typeof useLanguage>["t"];
};

function ExplorerPagination({
  loading,
  resultsLabel,
  currentPage,
  totalPages,
  showPageNumber,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  t,
}: ExplorerPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <div className="min-w-0">
        <p className={loading ? "animate-pulse" : ""}>{resultsLabel}</p>
        {showPageNumber && !loading && (
          <p className="mt-0.5 text-xs text-slate-500">
            {formatMessage(t.explorer.pageOf, { page: currentPage, pages: totalPages })}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading || !canGoPrev}
          onClick={onPrev}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.common.previous}
        </button>
        <button
          type="button"
          disabled={loading || !canGoNext}
          onClick={onNext}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-40"
        >
          {t.common.next}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
