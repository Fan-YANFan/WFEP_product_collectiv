import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import {
  AVS_BOOK_COLLECTION_POINTS,
  BGCA_BOOK_COLLECTION_POINTS,
  BOOKS_SALE_VENUE_POINTS,
  SWIRE_BOOK_COLLECTION_POINTS,
} from "./books-for-love-locations";

export const BOOKS_FOR_LOVE_WASTE_TYPE = "Books";

export const BOOKS_FOR_LOVE_CAMPAIGN = {
  id: "books-for-love-2026",
  nameEn: "Books for Love @ $10",
  nameTc: "書出愛心 十元義賣",
  officialUrl: "https://cloud.edm.swireproperties.com/2026BookCollection",
  sponsorEn: "Swire Properties",
  sponsorTc: "太古地產",
  collectionPeriodEn: "1 Jan – 31 Jan 2026",
  collectionPeriodTc: "2026年1月1日至31日",
  onlineSaleEn: "24 Mar – 14 Apr 2026 (children's books)",
  onlineSaleTc: "2026年3月24日至4月14日（兒童圖書網上義賣）",
  inPersonSaleEn: "7–10 & 14–17 May 2026, Taikoo Place",
  inPersonSaleTc: "2026年5月7至10日及14至17日，鰂魚涌太古坊",
  beneficiariesEn: "BGCA & Agency for Volunteer Service",
  beneficiariesTc: "香港小童群益會、義務工作發展局",
} as const;

const BOOKS_FOR_LOVE_POINTS: RecyclingCollectionPoint[] = [
  ...SWIRE_BOOK_COLLECTION_POINTS,
  ...AVS_BOOK_COLLECTION_POINTS,
  ...BGCA_BOOK_COLLECTION_POINTS,
  ...BOOKS_SALE_VENUE_POINTS,
];

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

export function queryBooksForLovePoints(query: RecyclingPointsQuery): RecyclingPointsResult {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);

  let filtered = BOOKS_FOR_LOVE_POINTS.filter((point) => {
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
    source: BOOKS_FOR_LOVE_CAMPAIGN.officialUrl,
  };
}

export function isBooksWasteType(wasteType?: string): boolean {
  return wasteType === BOOKS_FOR_LOVE_WASTE_TYPE;
}
