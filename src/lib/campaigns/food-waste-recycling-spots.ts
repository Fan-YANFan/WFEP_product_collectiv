import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import { FOOD_WASTE_SPOT_LOCATIONS } from "./food-waste-locations";

export const FOOD_WASTE_TYPE = "Food Waste";

export const FOOD_WASTE_CAMPAIGN = {
  id: "epd-food-waste-recycling-spots",
  nameEn: "Food Waste Recycling Spots",
  nameTc: "廚餘回收流動點",
  programUrl:
    "https://www.wastereduction.gov.hk/en-hk/waste-reduction-programme/food-waste-recycling-schemes",
  programUrlTc:
    "https://www.wastereduction.gov.hk/zh-hk/waste-reduction-programme/food-waste-recycling-schemes",
  spotsPdfUrl:
    "https://www.wastereduction.gov.hk/sites/default/files/food_wise/Food_Waste_Recycling_Spots.pdf",
  sponsorEn: "Environmental Protection Department",
  sponsorTc: "環境保護署",
  enquiryPhone: "2838 3111",
  enquiryEmail: "fwc@epd.gov.hk",
  dataAsOfEn: "13 June 2026",
  dataAsOfTc: "2026年6月13日",
} as const;

const ACCEPTANCE_EN =
  "Cooked and uncooked food waste from households and small eateries. No plastic bags, utensils, or non-food items.";
const ACCEPTANCE_TC = "家居及小型食肆廚餘。請勿混入膠袋、餐具或非廚餘物品。";

function buildFoodWastePoint(
  loc: (typeof FOOD_WASTE_SPOT_LOCATIONS)[number],
): RecyclingCollectionPoint {
  return {
    cp_id: loc.id,
    cp_state: "Accepted",
    district_id: loc.district,
    address_en: `EPD Food Waste Spot — ${loc.addressEn}`,
    address2_en: loc.nameEn,
    address_tc: `環保署廚餘回收流動點 — ${loc.addressTc}`,
    address2_tc: loc.nameTc,
    address_sc: null,
    address2_sc: null,
    lat: loc.lat,
    lng: loc.lng,
    waste_type: FOOD_WASTE_TYPE,
    legend: "EPD kerbside / mobile food waste recycling spot (evening hours)",
    accessibilty_notes: null,
    contact_en: `${ACCEPTANCE_EN} Enquiry: ${FOOD_WASTE_CAMPAIGN.enquiryPhone} / ${FOOD_WASTE_CAMPAIGN.enquiryEmail}`,
    contact_tc: `${ACCEPTANCE_TC} 查詢：${FOOD_WASTE_CAMPAIGN.enquiryPhone}／${FOOD_WASTE_CAMPAIGN.enquiryEmail}`,
    contact_sc: null,
    openhour_en: loc.timeEn,
    openhour_tc: loc.timeTc,
    openhour_sc: null,
    campaign_source: FOOD_WASTE_CAMPAIGN.id,
    campaign_url: FOOD_WASTE_CAMPAIGN.spotsPdfUrl,
    is_short_term: false,
  };
}

const FOOD_WASTE_POINTS: RecyclingCollectionPoint[] =
  FOOD_WASTE_SPOT_LOCATIONS.map(buildFoodWastePoint);

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
    point.openhour_en,
    point.openhour_tc,
    point.district_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export function queryFoodWastePoints(query: RecyclingPointsQuery): RecyclingPointsResult {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);

  let filtered = FOOD_WASTE_POINTS.filter((point) => {
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
    source: FOOD_WASTE_CAMPAIGN.spotsPdfUrl,
  };
}

export function isFoodWasteType(wasteType?: string): boolean {
  return wasteType === FOOD_WASTE_TYPE;
}
