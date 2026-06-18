import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import { queryRecyclingPoints } from "@/lib/csdi/client";
import { CSDI_MAX_PAGE_SIZE } from "@/lib/csdi/constants";
import {
  MIL_BUS_ACCEPTED_WASTE_TYPES,
  MIL_BUS_STOPS,
  MIL_BUS_WASTE_TYPE_STRING,
  type MilBusStopInput,
} from "./mil-bus-locations";

export const MIL_BUS_CAMPAIGN = {
  id: "mil-mill-mil-bus",
  nameEn: "Mil Mill 喵巴士 — Community Recycling Bus",
  nameTc: "喵坊 喵巴士 — 社區回收車",
  officialUrl: "https://www.milmill.hk/milbus",
  sponsorEn: "Mil Mill Limited",
  sponsorTc: "喵坊有限公司",
  contactEn: "Tel: 2498 2800 / marketing@ssid.hk",
  contactTc: "電話：2498 2800／marketing@ssid.hk",
  scheduleNoteEn: "Weekly one-day pop-up stops — see each listing for date & time slot.",
  scheduleNoteTc: "每週不同屋苑單日回收活動，請查看各站日期及時段。",
} as const;

/** Only this date is shown as the active short-term 喵巴士 stop */
export const MIL_BUS_ACTIVE_DATE = "2026-06-20";

function formatEventDate(dateIso: string, locale: "en" | "tc"): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (locale === "tc") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isMilBusActiveStop(stop: MilBusStopInput): boolean {
  return stop.eventDate === MIL_BUS_ACTIVE_DATE;
}

/** Include 20 Jun (active) and earlier (reference); hide stops after 20 Jun */
function shouldIncludeMilBusStop(stop: MilBusStopInput): boolean {
  return stop.eventDate <= MIL_BUS_ACTIVE_DATE;
}

function buildMilBusPoint(stop: MilBusStopInput): RecyclingCollectionPoint {
  const dateEn = formatEventDate(stop.eventDate, "en");
  const dateTc = formatEventDate(stop.eventDate, "tc");
  const active = isMilBusActiveStop(stop);

  return {
    cp_id: stop.id,
    cp_state: active ? "Short-term" : "Ended",
    district_id: stop.district,
    address_en: `Mil Mill 喵巴士 — ${stop.nameEn}`,
    address2_en: stop.addressEn,
    address_tc: `喵坊 喵巴士 — ${stop.nameTc}`,
    address2_tc: stop.addressTc,
    address_sc: null,
    address2_sc: null,
    lat: stop.lat,
    lng: stop.lng,
    waste_type: MIL_BUS_WASTE_TYPE_STRING,
    legend: active
      ? "Mil Mill 喵巴士 — one-day community recycling pop-up (paper, books, plastics, metals, small & regulated appliances, Tetra Pak)"
      : "Mil Mill 喵巴士 — past stop (before 20 Jun 2026)",
    accessibilty_notes: null,
    contact_en: `${MIL_BUS_CAMPAIGN.contactEn}. Accepts paper, books, plastics, metals, small & regulated electrical appliances, Tetra Pak.`,
    contact_tc: `${MIL_BUS_CAMPAIGN.contactTc}。接受紙張、書籍、塑膠、金屬、小型及四電一腦、紙包飲品盒。`,
    contact_sc: null,
    openhour_en: `${dateEn}, ${stop.timeEn}`,
    openhour_tc: `${dateTc}，${stop.timeTc}`,
    openhour_sc: null,
    campaign_source: MIL_BUS_CAMPAIGN.id,
    campaign_url: MIL_BUS_CAMPAIGN.officialUrl,
    is_short_term: active,
  };
}

const MIL_BUS_POINTS: RecyclingCollectionPoint[] = MIL_BUS_STOPS.filter(shouldIncludeMilBusStop).map(
  buildMilBusPoint,
);

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
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
    point.openhour_en,
    point.openhour_tc,
    point.contact_en,
    point.contact_tc,
    point.district_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

function passesDistrictAndSearch(
  point: RecyclingCollectionPoint,
  query: RecyclingPointsQuery,
): boolean {
  if (query.district && point.district_id !== query.district) return false;
  if (query.search && !matchesSearch(point, query.search)) return false;
  return true;
}

function sortEndedByDate(points: RecyclingCollectionPoint[]): RecyclingCollectionPoint[] {
  return [...points].sort((a, b) => (a.openhour_en ?? "").localeCompare(b.openhour_en ?? ""));
}

export function getMilBusPointsSplit(query: RecyclingPointsQuery): {
  active: RecyclingCollectionPoint[];
  ended: RecyclingCollectionPoint[];
} {
  const filtered = MIL_BUS_POINTS.filter((point) => passesDistrictAndSearch(point, query));
  const active = filtered.filter((point) => point.is_short_term);
  const ended = sortEndedByDate(filtered.filter((point) => !point.is_short_term));
  return { active, ended };
}

/** @deprecated Use getMilBusPointsSplit — kept for any direct callers */
export function getMilBusPoints(query: RecyclingPointsQuery): RecyclingCollectionPoint[] {
  const { active, ended } = getMilBusPointsSplit(query);
  return [...active, ...ended];
}

export function isMilBusWasteType(wasteType?: string): boolean {
  if (!wasteType) return false;
  return (MIL_BUS_ACCEPTED_WASTE_TYPES as readonly string[]).includes(wasteType);
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

async function countCsdiForQuery(query: RecyclingPointsQuery): Promise<number> {
  const result = await queryRecyclingPoints({ ...query, offset: 0, limit: 1 });
  return result.total;
}

export async function mergeMilBusWithPoints(
  query: RecyclingPointsQuery,
  otherPoints: RecyclingCollectionPoint[],
  otherTotal: number,
  source: string,
): Promise<RecyclingPointsResult> {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const { active, ended } = getMilBusPointsSplit(query);

  const useGeo =
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0;

  if (useGeo) {
    const lat = query.lat!;
    const lng = query.lng!;
    const radius = query.radiusMeters!;

    const activeNearby = active
      .map((point) => ({
        point,
        dist: distanceMeters(lat, lng, point.lat, point.lng),
      }))
      .filter(({ dist }) => dist <= radius)
      .sort((a, b) => a.dist - b.dist)
      .map(({ point }) => point);

    const otherNearby = otherPoints
      .map((point) => ({
        point,
        dist: distanceMeters(lat, lng, point.lat, point.lng),
      }))
      .filter(({ dist }) => dist <= radius)
      .sort((a, b) => a.dist - b.dist)
      .map(({ point }) => point);

    const merged = [...activeNearby, ...otherNearby, ...ended];
    return {
      points: merged.slice(offset, offset + limit),
      total: merged.length,
      offset,
      limit,
      source,
    };
  }

  const { points, total } = await paginateSegments(offset, limit, [
    {
      total: active.length,
      fetch: (localOffset, count) => active.slice(localOffset, localOffset + count),
    },
    {
      total: otherTotal,
      fetch: (localOffset, count) => otherPoints.slice(localOffset, localOffset + count),
    },
    {
      total: ended.length,
      fetch: (localOffset, count) => ended.slice(localOffset, localOffset + count),
    },
  ]);

  return { points, total, offset, limit, source };
}

export async function queryMilBusMergedCsdi(
  query: RecyclingPointsQuery,
): Promise<RecyclingPointsResult> {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const { active, ended } = getMilBusPointsSplit(query);

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
    return mergeMilBusWithPoints(
      query,
      csdiResult.points,
      csdiResult.points.length,
      MIL_BUS_CAMPAIGN.officialUrl,
    );
  }

  const csdiTotal = await countCsdiForQuery(query);

  const { points, total } = await paginateSegments(offset, limit, [
    {
      total: active.length,
      fetch: (localOffset, count) => active.slice(localOffset, localOffset + count),
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
      total: ended.length,
      fetch: (localOffset, count) => ended.slice(localOffset, localOffset + count),
    },
  ]);

  return {
    points,
    total,
    offset,
    limit,
    source: MIL_BUS_CAMPAIGN.officialUrl,
  };
}
