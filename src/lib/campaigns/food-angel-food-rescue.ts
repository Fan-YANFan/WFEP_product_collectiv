import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import { FOOD_ANGEL_LOCATIONS } from "./food-angel-locations";

export const FOOD_RESCUE_WASTE_TYPE = "Food Rescue";

export const FOOD_ANGEL_CAMPAIGN = {
  id: "food-angel-food-rescue",
  nameEn: "Food Angel — Food Rescue Programme",
  nameTc: "惜食堂 — 食物回收計劃",
  programUrl: "https://www.foodangel.org.hk/en/food-rescue",
  programUrlTc: "https://www.foodangel.org.hk/zh-hk/food-rescue",
  sponsorEn: "Food Angel (惜食堂)",
  sponsorTc: "惜食堂",
  personalHotline: "9247 9330 (WhatsApp text only)",
  bulkContactEn: "Ms Leung 3704 8202 / Mr Chan 3704 8247",
  bulkContactTc: "梁小姐 3704 8202／陳先生 3704 8247",
} as const;

const HOURS_DEPOT_EN = "Mon–Fri 9:00 AM–5:00 PM (public holidays excluded)";
const HOURS_DEPOT_TC = "星期一至五 上午9時至下午5時（公眾假期除外）";
const HOURS_MALL_EN = "Follows venue opening hours";
const HOURS_MALL_TC = "服務時間請參考該地點營業時間";

const DONATION_RULES_EN =
  "Unopened dry goods with 4+ weeks until expiry; intact non-glass packaging. No chilled, frozen, fresh, baked, or expired items at public boxes.";
const DONATION_RULES_TC =
  "未開封乾貨食品，距離到期日4星期或以上，包裝完好、非玻璃容器。收集箱不接受冷凍、冷藏、新鮮、烘焙食品及已過期食品。";

function buildFoodAngelPoint(loc: (typeof FOOD_ANGEL_LOCATIONS)[number]): RecyclingCollectionPoint {
  return {
    cp_id: loc.id,
    cp_state: loc.underRepair ? "Under maintenance" : "Accepted",
    district_id: loc.district,
    address_en: `Food Angel — ${loc.nameEn}`,
    address2_en: loc.addressEn,
    address_tc: `惜食堂 — ${loc.nameTc}`,
    address2_tc: loc.addressTc,
    address_sc: null,
    address2_sc: null,
    lat: loc.lat,
    lng: loc.lng,
    waste_type: FOOD_RESCUE_WASTE_TYPE,
    legend: `Food Angel food rescue — ${loc.typeEn}`,
    accessibilty_notes: loc.residentsOnly ? "Residents / members only" : null,
    contact_en: DONATION_RULES_EN,
    contact_tc: DONATION_RULES_TC,
    contact_sc: null,
    openhour_en: loc.type === "depot" ? HOURS_DEPOT_EN : HOURS_MALL_EN,
    openhour_tc: loc.type === "depot" ? HOURS_DEPOT_TC : HOURS_MALL_TC,
    openhour_sc: null,
    campaign_source: FOOD_ANGEL_CAMPAIGN.id,
    campaign_url: FOOD_ANGEL_CAMPAIGN.programUrl,
    is_short_term: false,
  };
}

const FOOD_ANGEL_POINTS: RecyclingCollectionPoint[] = FOOD_ANGEL_LOCATIONS.map(buildFoodAngelPoint);

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

export function queryFoodAngelPoints(query: RecyclingPointsQuery): RecyclingPointsResult {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);

  let filtered = FOOD_ANGEL_POINTS.filter((point) => {
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
    source: FOOD_ANGEL_CAMPAIGN.programUrl,
  };
}

export function isFoodRescueWasteType(wasteType?: string): boolean {
  return wasteType === FOOD_RESCUE_WASTE_TYPE;
}
