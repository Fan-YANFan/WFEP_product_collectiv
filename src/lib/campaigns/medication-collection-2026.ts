import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import { MEDICATION_COLLECTION_POINTS } from "./medication-collection-locations";

export const MEDICATION_WASTE_TYPE = "Medication";

export const MEDICATION_COLLECTION_CAMPAIGN = {
  id: "greeners-action-medication-collection-2026",
  nameEn: "Medicine Collection Program 2026",
  nameTc: "藥餘收集計劃 2026",
  pointsPdfEn:
    "https://drive.google.com/file/d/1Nzv0tE1_k41BynIinVj2SDUtBhV6Wl5h/view?usp=sharing",
  pointsPdfTc:
    "https://drive.google.com/file/d/12GBKwLhFwJ-iQ1q_pfez4unHVjoMgRpU/view?usp=sharing",
  pointsFolderUrl:
    "https://drive.google.com/drive/folders/1-H6jPggG-PY72CrSZufVKFN_mhsWwAwf",
  sponsorEn: "Greeners Action",
  sponsorTc: "綠領行動",
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

export function filterMedicationCollectionPoints(
  query: RecyclingPointsQuery,
): RecyclingCollectionPoint[] {
  let filtered = MEDICATION_COLLECTION_POINTS.filter((point) => {
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

export function queryMedicationCollectionPoints(
  query: RecyclingPointsQuery,
): RecyclingPointsResult {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const filtered = filterMedicationCollectionPoints(query);
  const total = filtered.length;

  return {
    points: filtered.slice(offset, offset + limit),
    total,
    offset,
    limit,
    source: MEDICATION_COLLECTION_CAMPAIGN.pointsFolderUrl,
  };
}

export function isMedicationWasteType(wasteType?: string): boolean {
  return wasteType === MEDICATION_WASTE_TYPE;
}
