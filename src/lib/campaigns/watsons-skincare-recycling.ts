import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import {
  WATSONS_STORE_HOURS_EN,
  WATSONS_STORE_HOURS_TC,
  WATSONS_STORE_LOCATIONS,
} from "./watsons-store-locations";

export const WATSONS_SKINCARE_WASTE_TYPE = "Skincare Containers";

export const WATSONS_SKINCARE_CAMPAIGN = {
  id: "watsons-skincare-recycling-2026",
  nameEn: "Watsons Skincare Container Recycling",
  nameTc: "屈臣氏護膚容器回收計劃",
  programUrl: "https://www.watsons.com.hk/en/recycling_program",
  programUrlTc: "https://www.watsons.com.hk/zh-hk/recycling_program",
  storeFinderUrl: "https://www.watsons.com.hk/zh-hk/store-finder",
  sponsorEn: "Watsons Hong Kong",
  sponsorTc: "屈臣氏香港",
  collectionPeriodEn: "Until 31 Dec 2026",
  collectionPeriodTc: "至2026年12月31日",
  partnerEn: "V Cycle (recycling partner)",
  partnerTc: "V Cycle（回收伙伴）",
} as const;

const COLLECTION_HOURS_EN = WATSONS_STORE_HOURS_EN;
const COLLECTION_HOURS_TC = WATSONS_STORE_HOURS_TC;

const WATSONS_SKINCARE_POINTS: RecyclingCollectionPoint[] = WATSONS_STORE_LOCATIONS.map(
  (store) => ({
    cp_id: store.storeId,
    cp_state: "Short-term",
    district_id: store.district,
    address_en: `Watsons — ${store.nameEn}`,
    address2_en: store.addressEn,
    address_tc: `屈臣氏 — ${store.nameTc}`,
    address2_tc: store.addressTc,
    address_sc: null,
    address2_sc: null,
    lat: store.lat,
    lng: store.lng,
    waste_type: WATSONS_SKINCARE_WASTE_TYPE,
    legend: "Watsons — skincare & beauty container recycling (until 31 Dec 2026)",
    accessibilty_notes: null,
    contact_en:
      "Return rinsed empty skincare, cosmetic & personal-care containers (any brand). Earn MoneyBack rewards — see program page.",
    contact_tc: "交回已清洗的護膚、化妝及個人護理容器（任何品牌）。可賺取易賞錢積分，詳情請参阅活動頁面。",
    contact_sc: null,
    openhour_en: COLLECTION_HOURS_EN,
    openhour_tc: COLLECTION_HOURS_TC,
    openhour_sc: null,
    campaign_source: WATSONS_SKINCARE_CAMPAIGN.id,
    campaign_url: WATSONS_SKINCARE_CAMPAIGN.programUrl,
    is_short_term: true,
  }),
);

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesSearch(point: RecyclingCollectionPoint, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  const haystack = [
    point.address_en,
    point.address2_en,
    point.address_tc,
    point.address2_tc,
    point.legend,
    point.contact_en,
    point.contact_tc,
    point.district_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export function queryWatsonsSkincarePoints(query: RecyclingPointsQuery): RecyclingPointsResult {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);

  let filtered = WATSONS_SKINCARE_POINTS.filter((point) => {
    if (query.district && point.district_id !== query.district) return false;
    if (query.search && !matchesSearch(point, query.search)) return false;
    return true;
  });

  if (
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0
  ) {
    filtered = filtered
      .map((point) => ({
        point,
        dist: distanceMeters(query.lat!, query.lng!, point.lat, point.lng),
      }))
      .filter(({ dist }) => dist <= query.radiusMeters!)
      .sort((a, b) => a.dist - b.dist)
      .map(({ point }) => point);
  }

  const total = filtered.length;
  const points = filtered.slice(offset, offset + limit);

  return {
    points,
    total,
    offset,
    limit,
    source: WATSONS_SKINCARE_CAMPAIGN.storeFinderUrl,
  };
}

export function isSkincareContainersWasteType(wasteType?: string): boolean {
  return wasteType === WATSONS_SKINCARE_WASTE_TYPE;
}
