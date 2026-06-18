import type { RecyclingCollectionPoint, RecyclingPointsQuery } from "@/lib/csdi/types";
import { BATTERY_LOOP_POINTS } from "./battery-loop-locations";

export const BATTERY_LOOP_CAMPAIGN = {
  id: "battery-loop-2026",
  nameEn: "Battery Loop 回芯轉意 — Battery Collection Box Map",
  nameTc: "回芯轉意 — 電池收集箱地圖",
  mapUrl:
    "https://www.google.com/maps/d/u/0/viewer?mid=1ICObjfnSaGZA1yVsWo4MuEBvD7I6hdo&ll=22.314618199999998%2C114.16234870000001&z=11",
  sponsorEn: "Battery Loop (student-initiated recycling project)",
  sponsorTc: "回芯轉意（學生倡議回收計劃）",
  collectionPeriodEn: "Ended 31 May 2026",
  collectionPeriodTc: "已於2026年5月31日結束",
} as const;

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
    point.contact_en,
    point.contact_tc,
    point.district_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

/** Ended Battery Loop boxes — listed after Watsons & EPD points */
export function filterBatteryLoopPoints(query: RecyclingPointsQuery): RecyclingCollectionPoint[] {
  return BATTERY_LOOP_POINTS.filter((point) => {
    if (query.district && point.district_id !== query.district) return false;
    if (query.search && !matchesSearch(point, query.search)) return false;
    if (
      query.lat != null &&
      query.lng != null &&
      query.radiusMeters != null &&
      query.radiusMeters > 0
    ) {
      const dist = distanceMeters(query.lat, query.lng, point.lat, point.lng);
      if (dist > query.radiusMeters) return false;
    }
    return true;
  });
}
