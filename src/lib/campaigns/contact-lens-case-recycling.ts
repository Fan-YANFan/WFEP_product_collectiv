import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import { CONTACT_LENS_CASE_POINTS } from "./contact-lens-case-locations";

export const CONTACT_LENS_CASE_WASTE_TYPE = "Contact Lens Cases";

export const CONTACT_LENS_CASE_CAMPAIGN = {
  id: "contact-lens-easy-case-recycling",
  nameEn: "CON Case & Foil Recycling — Contact Lens Easy",
  nameTc: "CON殼錫紙回收計劃 — Contact Lens Easy",
  programUrl: "https://www.contactlenseasy.com/con%E6%AE%BC%E5%9B%9E%E6%94%B6%E8%A2%8B/",
  sponsorEn: "Contact Lens Easy",
  sponsorTc: "Contact Lens Easy",
  flagshipAddressEn: "1/F, Kar Wai Building, 41C-41D Granville Road, Tsim Sha Tsui",
  flagshipAddressTc: "尖沙咀加連威老道41C-41D號嘉威大廈1樓A室",
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

function sortPoints(points: RecyclingCollectionPoint[]): RecyclingCollectionPoint[] {
  return [...points].sort((a, b) => {
    if (a.cp_id === "cle-contact-lens-easy") return -1;
    if (b.cp_id === "cle-contact-lens-easy") return 1;
    const aRestricted = (a.contact_en ?? "").includes("only");
    const bRestricted = (b.contact_en ?? "").includes("only");
    if (aRestricted !== bRestricted) return aRestricted ? 1 : -1;
    return (a.address_en ?? "").localeCompare(b.address_en ?? "");
  });
}

export function filterContactLensCasePoints(
  query: RecyclingPointsQuery,
): RecyclingCollectionPoint[] {
  let filtered = CONTACT_LENS_CASE_POINTS.filter((point) => {
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
  } else {
    filtered = sortPoints(filtered);
  }

  return filtered;
}

export function queryContactLensCasePoints(
  query: RecyclingPointsQuery,
): RecyclingPointsResult {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const filtered = filterContactLensCasePoints(query);
  const total = filtered.length;

  return {
    points: filtered.slice(offset, offset + limit),
    total,
    offset,
    limit,
    source: CONTACT_LENS_CASE_CAMPAIGN.programUrl,
  };
}

export function isContactLensCaseWasteType(wasteType?: string): boolean {
  return wasteType === CONTACT_LENS_CASE_WASTE_TYPE;
}
