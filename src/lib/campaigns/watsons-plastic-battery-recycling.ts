import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import { queryRecyclingPoints } from "@/lib/csdi/client";
import { CSDI_MAX_PAGE_SIZE } from "@/lib/csdi/constants";
import { filterBatteryLoopPoints } from "./battery-loop-recycling";
import { WATSONS_PLASTIC_BATTERY_STORES } from "./watsons-plastic-battery-locations";

/** Watsons HK stores accepting plastic bottle & rechargeable battery recycling (54 branches). */
export const WATSONS_PLASTIC_BATTERY_CAMPAIGN = {
  id: "watsons-plastic-battery-recycling",
  nameEn: "Watsons — Plastic Bottle & Rechargeable Battery Recycling",
  nameTc: "屈臣氏 — 膠樽及充電池回收",
  programUrl: "https://www.watsons.com.hk/en/recycling_program",
  programUrlTc: "https://www.watsons.com.hk/zh-hk/recycling_program",
  storeFinderUrl: "https://www.watsons.com.hk/zh-hk/store-finder",
  batteryProgramUrl:
    "https://www.wastereduction.gov.hk/en-hk/waste-reduction-programme/rechargeable-battery-recycling-programme",
  batteryProgramUrlTc:
    "https://www.wastereduction.gov.hk/zh-hk/waste-reduction-programme/rechargeable-battery-recycling-programme",
  storeCount: 54,
  sponsorEn: "Watsons Hong Kong",
  sponsorTc: "屈臣氏香港",
} as const;

export const WATSONS_PLASTIC_BOTTLE_WASTE_TYPE = "Plastic Bottle";
export const WATSONS_RECHARGEABLE_BATTERY_WASTE_TYPE = "Rechargeable Batteries";

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

function buildWatsonsPoint(
  store: (typeof WATSONS_PLASTIC_BATTERY_STORES)[number],
  wasteType: string,
  legendEn: string,
  legendTc: string,
  contactEn: string,
  contactTc: string,
): RecyclingCollectionPoint {
  return {
    cp_id: `${store.storeId}-${wasteType === WATSONS_PLASTIC_BOTTLE_WASTE_TYPE ? "bottle" : "battery"}`,
    cp_state: "Accepted",
    district_id: store.district,
    address_en: `Watsons — ${store.nameEn}`,
    address2_en: store.addressEn,
    address_tc: `屈臣氏 — ${store.nameTc}`,
    address2_tc: store.addressTc,
    address_sc: null,
    address2_sc: null,
    lat: store.lat,
    lng: store.lng,
    waste_type: wasteType,
    legend: legendEn,
    accessibilty_notes: null,
    contact_en: contactEn,
    contact_tc: contactTc,
    contact_sc: null,
    openhour_en: store.openhourEn,
    openhour_tc: store.openhourTc,
    openhour_sc: null,
    campaign_source: WATSONS_PLASTIC_BATTERY_CAMPAIGN.id,
    campaign_url: WATSONS_PLASTIC_BATTERY_CAMPAIGN.programUrl,
    is_short_term: false,
  };
}

const PLASTIC_BOTTLE_LEGEND_EN =
  "Watsons — plastic bottle recycling (empty drinking water & eligible plastic bottles)";
const PLASTIC_BOTTLE_LEGEND_TC = "屈臣氏 — 膠樽回收（飲用水膠樽及其他合資格膠樽）";
const PLASTIC_BOTTLE_CONTACT_EN =
  "Drop off empty plastic drinking water bottles and other eligible plastic bottles at the in-store collection point.";
const PLASTIC_BOTTLE_CONTACT_TC = "請將空的飲用水膠樽及其他合資格膠樽交至店內回收點。";

const BATTERY_LEGEND_EN =
  "Watsons — government Rechargeable Battery Recycling Programme collection point";
const BATTERY_LEGEND_TC = "屈臣氏 — 政府充電池回收計劃收集點";
const BATTERY_CONTACT_EN =
  "Accepts portable Li-ion, Ni-MH and Ni-Cd rechargeable batteries from household products.";
const BATTERY_CONTACT_TC = "接受家用產品內的鋰離子、鎳氫及鎳鎘充電池。";

const WATSONS_PLASTIC_BOTTLE_POINTS: RecyclingCollectionPoint[] =
  WATSONS_PLASTIC_BATTERY_STORES.map((store) =>
    buildWatsonsPoint(
      store,
      WATSONS_PLASTIC_BOTTLE_WASTE_TYPE,
      PLASTIC_BOTTLE_LEGEND_EN,
      PLASTIC_BOTTLE_LEGEND_TC,
      PLASTIC_BOTTLE_CONTACT_EN,
      PLASTIC_BOTTLE_CONTACT_TC,
    ),
  );

const WATSONS_BATTERY_POINTS: RecyclingCollectionPoint[] = WATSONS_PLASTIC_BATTERY_STORES.map(
  (store) =>
    buildWatsonsPoint(
      store,
      WATSONS_RECHARGEABLE_BATTERY_WASTE_TYPE,
      BATTERY_LEGEND_EN,
      BATTERY_LEGEND_TC,
      BATTERY_CONTACT_EN,
      BATTERY_CONTACT_TC,
    ),
);

function filterWatsonsPoints(
  points: RecyclingCollectionPoint[],
  query: RecyclingPointsQuery,
): RecyclingCollectionPoint[] {
  let filtered = points.filter((point) => {
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

  return filtered;
}

export function getWatsonsPlasticBottlePoints(query: RecyclingPointsQuery): RecyclingCollectionPoint[] {
  return filterWatsonsPoints(WATSONS_PLASTIC_BOTTLE_POINTS, query);
}

export function getWatsonsBatteryPoints(query: RecyclingPointsQuery): RecyclingCollectionPoint[] {
  return filterWatsonsPoints(WATSONS_BATTERY_POINTS, query);
}

export async function queryPlasticBottlePoints(
  query: RecyclingPointsQuery,
): Promise<RecyclingPointsResult> {
  return mergeWithCsdiPoints(query, getWatsonsPlasticBottlePoints(query));
}

export async function queryRechargeableBatteryPoints(
  query: RecyclingPointsQuery,
): Promise<RecyclingPointsResult> {
  const ended = filterBatteryLoopPoints(query);
  return mergeBatteryWithCsdi(query, getWatsonsBatteryPoints(query), ended);
}

type SegmentFetcher = (
  localOffset: number,
  count: number,
) => RecyclingCollectionPoint[] | Promise<RecyclingCollectionPoint[]>;

async function paginateSegments(
  offset: number,
  limit: number,
  segments: Array<{ total: number; fetch: SegmentFetcher }>,
): Promise<{ points: RecyclingCollectionPoint[]; total: number }> {
  const grandTotal = segments.reduce((sum, seg) => sum + seg.total, 0);
  const points: RecyclingCollectionPoint[] = [];
  let remaining = limit;
  let cursor = offset;

  for (const segment of segments) {
    if (remaining <= 0) break;
    if (cursor >= segment.total) {
      cursor -= segment.total;
      continue;
    }

    const take = Math.min(remaining, segment.total - cursor);
    const slice = await segment.fetch(cursor, take);
    points.push(...slice);
    remaining -= slice.length;
    cursor = 0;
  }

  return { points, total: grandTotal };
}

async function mergeBatteryWithCsdi(
  query: RecyclingPointsQuery,
  watsonsPoints: RecyclingCollectionPoint[],
  endedPoints: RecyclingCollectionPoint[],
): Promise<RecyclingPointsResult> {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const watsonsTotal = watsonsPoints.length;
  const endedTotal = endedPoints.length;

  const useGeo =
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0;

  if (useGeo) {
    const csdiResult = await queryRecyclingPoints({
      ...query,
      offset: 0,
      limit: CSDI_MAX_PAGE_SIZE,
    });
    const merged = [...watsonsPoints, ...csdiResult.points, ...endedPoints];
    return {
      points: merged.slice(offset, offset + limit),
      total: merged.length,
      offset,
      limit,
      source: WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl,
    };
  }

  const csdiTotal = await countCsdiForQuery(query);

  const { points, total } = await paginateSegments(offset, limit, [
    {
      total: watsonsTotal,
      fetch: (localOffset, count) => watsonsPoints.slice(localOffset, localOffset + count),
    },
    {
      total: csdiTotal,
      fetch: async (localOffset, count) => {
        const result = await queryRecyclingPoints({
          ...query,
          offset: localOffset,
          limit: count,
        });
        return result.points;
      },
    },
    {
      total: endedTotal,
      fetch: (localOffset, count) => endedPoints.slice(localOffset, localOffset + count),
    },
  ]);

  return {
    points,
    total,
    offset,
    limit,
    source: WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl,
  };
}

async function mergeWithCsdiPoints(
  query: RecyclingPointsQuery,
  watsonsPoints: RecyclingCollectionPoint[],
): Promise<RecyclingPointsResult> {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const watsonsTotal = watsonsPoints.length;

  const useGeo =
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0;

  if (useGeo) {
    const csdiResult = await queryRecyclingPoints({
      ...query,
      offset: 0,
      limit: CSDI_MAX_PAGE_SIZE,
    });
    const merged = [...watsonsPoints, ...csdiResult.points];
    const total = merged.length;
    const points = merged.slice(offset, offset + limit);

    return {
      points,
      total,
      offset,
      limit,
      source: WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl,
    };
  }

  if (offset < watsonsTotal) {
    const watsonsSlice = watsonsPoints.slice(offset, offset + limit);
    const remaining = limit - watsonsSlice.length;

    if (remaining > 0) {
      const csdiResult = await queryRecyclingPoints({
        ...query,
        offset: 0,
        limit: remaining,
      });
      return {
        points: [...watsonsSlice, ...csdiResult.points],
        total: watsonsTotal + csdiResult.total,
        offset,
        limit,
        source: WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl,
      };
    }

    return {
      points: watsonsSlice,
      total: watsonsTotal + (await countCsdiForQuery(query)),
      offset,
      limit,
      source: WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl,
    };
  }

  const csdiResult = await queryRecyclingPoints({
    ...query,
    offset: offset - watsonsTotal,
    limit,
  });

  return {
    points: csdiResult.points,
    total: watsonsTotal + csdiResult.total,
    offset,
    limit,
    source: WATSONS_PLASTIC_BATTERY_CAMPAIGN.storeFinderUrl,
  };
}

async function countCsdiForQuery(query: RecyclingPointsQuery): Promise<number> {
  const result = await queryRecyclingPoints({ ...query, offset: 0, limit: 1 });
  return result.total;
}

export function isPlasticBottleWasteType(wasteType?: string): boolean {
  return wasteType === WATSONS_PLASTIC_BOTTLE_WASTE_TYPE;
}

export function isRechargeableBatteryWasteType(wasteType?: string): boolean {
  return wasteType === WATSONS_RECHARGEABLE_BATTERY_WASTE_TYPE;
}
