import type { RecyclingCollectionPoint, RecyclingPointsQuery, RecyclingPointsResult } from "@/lib/csdi/types";
import { queryRecyclingPoints } from "@/lib/csdi/client";
import { CSDI_MAX_PAGE_SIZE } from "@/lib/csdi/constants";
import { queryMilBusMergedCsdi } from "@/lib/campaigns/mil-bus-recycling";

export const CLOTHING_WASTE_TYPE = "Clothing";
export const SMALL_APPLIANCE_WASTE_TYPE = "Small Electrical Appliances";

export const GREEN_COLLECTION_EVENT_DATE = "2026-06-20";

export const GREEN_COLLECTION_CAMPAIGN = {
  id: "christian-action-green-collection-2026",
  nameEn: "Green Collection Programme — Christian Action",
  nameTc: "環保回收活動 — 基督教勵行會",
  eventUrl:
    "https://www.facebook.com/photo.php?fbid=1291772149737796&set=pb.100067150690669.-2207520000&type=3",
  sponsorEn: "Christian Action Social Enterprise",
  sponsorTc: "基督教勵行會社會企業",
  contactEn: "Enquiries: The Park Resort staff — Tel 2273 4113",
  contactTc: "查詢請聯絡 The Park Resort 職員 — 電話 2273 4113",
} as const;

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isEventActive(): boolean {
  return todayIso() === GREEN_COLLECTION_EVENT_DATE;
}

function isEventEnded(): boolean {
  return todayIso() > GREEN_COLLECTION_EVENT_DATE;
}

function formatEventDate(locale: "en" | "tc"): string {
  const [y, m, d] = GREEN_COLLECTION_EVENT_DATE.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (locale === "tc") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（星期六）`;
  }
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildGreenCollectionPoint(wasteType: string): RecyclingCollectionPoint {
  const active = isEventActive();
  const ended = isEventEnded();
  const dateEn = formatEventDate("en");
  const dateTc = formatEventDate("tc");
  const suffix = wasteType === CLOTHING_WASTE_TYPE ? "clothing" : "appliance";

  const clothingLegendEn =
    "Christian Action Green Collection — clothing, footwear, bags, toys, accessories, household items & more (one-day event)";
  const applianceLegendEn =
    "Christian Action Green Collection — small home appliances & computer supplies (one-day event)";

  return {
    cp_id: `green-collection-2026-06-20-${suffix}`,
    cp_state: active ? "Short-term" : ended ? "Ended" : "Upcoming",
    district_id: "Yau_Tsim_Mong",
    address_en: "Green Collection Programme — Central Park & Park Avenue",
    address2_en: "Open space next to the clubhouse, Hoi Ting Road, Tai Kok Tsui",
    address_tc: "環保回收活動 — 帝柏海灣及柏景灣",
    address2_tc: "會所正門對出空地（海庭道，大角咀）",
    address_sc: null,
    address2_sc: null,
    lat: 22.3163,
    lng: 114.1608,
    waste_type: wasteType,
    legend:
      wasteType === CLOTHING_WASTE_TYPE
        ? active
          ? clothingLegendEn
          : ended
            ? `${clothingLegendEn} — event ended`
            : clothingLegendEn
        : active
          ? applianceLegendEn
          : ended
            ? `${applianceLegendEn} — event ended`
            : applianceLegendEn,
    accessibilty_notes: null,
    contact_en: `${GREEN_COLLECTION_CAMPAIGN.contactEn}. ${GREEN_COLLECTION_CAMPAIGN.sponsorEn}.`,
    contact_tc: `${GREEN_COLLECTION_CAMPAIGN.contactTc}。${GREEN_COLLECTION_CAMPAIGN.sponsorTc}。`,
    contact_sc: null,
    openhour_en: `${dateEn}, 10:00 AM – 3:00 PM`,
    openhour_tc: `${dateTc}，上午10時至下午3時`,
    openhour_sc: null,
    campaign_source: GREEN_COLLECTION_CAMPAIGN.id,
    campaign_url: GREEN_COLLECTION_CAMPAIGN.eventUrl,
    is_short_term: active,
  };
}

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

function csdiQueryForWasteType(query: RecyclingPointsQuery): RecyclingPointsQuery {
  if (query.wasteType === CLOTHING_WASTE_TYPE) {
    return { ...query, wasteType: "Clothes" };
  }
  return query;
}

export function getGreenCollectionPoint(query: RecyclingPointsQuery): RecyclingCollectionPoint | null {
  if (!query.wasteType || !isGreenCollectionWasteType(query.wasteType)) return null;
  const point = buildGreenCollectionPoint(query.wasteType);
  if (query.district && point.district_id !== query.district) return null;
  if (query.search && !matchesSearch(point, query.search)) return null;
  if (
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0
  ) {
    const dist = distanceMeters(query.lat, query.lng, point.lat, point.lng);
    if (dist > query.radiusMeters) return null;
  }
  return point;
}

export function isGreenCollectionWasteType(wasteType?: string): boolean {
  return wasteType === CLOTHING_WASTE_TYPE || wasteType === SMALL_APPLIANCE_WASTE_TYPE;
}

async function countCsdiForQuery(query: RecyclingPointsQuery): Promise<number> {
  const result = await queryRecyclingPoints({
    ...csdiQueryForWasteType(query),
    offset: 0,
    limit: 1,
  });
  return result.total;
}

export async function queryGreenCollectionMergedCsdi(
  query: RecyclingPointsQuery,
): Promise<RecyclingPointsResult> {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const campaignPoint = getGreenCollectionPoint(query);
  const campaignPoints = campaignPoint ? [campaignPoint] : [];
  const campaignTotal = campaignPoints.length;
  const csdiQuery = csdiQueryForWasteType(query);

  const useGeo =
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0;

  if (useGeo) {
    const csdiResult = await queryRecyclingPoints({
      ...csdiQuery,
      offset: 0,
      limit: CSDI_MAX_PAGE_SIZE,
    });
    const merged = [...campaignPoints, ...csdiResult.points];
    return {
      points: merged.slice(offset, offset + limit),
      total: merged.length,
      offset,
      limit,
      source: GREEN_COLLECTION_CAMPAIGN.eventUrl,
    };
  }

  if (offset < campaignTotal) {
    const campaignSlice = campaignPoints.slice(offset, offset + limit);
    const remaining = limit - campaignSlice.length;

    if (remaining > 0) {
      const csdiResult = await queryRecyclingPoints({
        ...csdiQuery,
        offset: 0,
        limit: remaining,
      });
      return {
        points: [...campaignSlice, ...csdiResult.points],
        total: campaignTotal + csdiResult.total,
        offset,
        limit,
        source: GREEN_COLLECTION_CAMPAIGN.eventUrl,
      };
    }

    return {
      points: campaignSlice,
      total: campaignTotal + (await countCsdiForQuery(query)),
      offset,
      limit,
      source: GREEN_COLLECTION_CAMPAIGN.eventUrl,
    };
  }

  const csdiResult = await queryRecyclingPoints({
    ...csdiQuery,
    offset: offset - campaignTotal,
    limit,
  });

  return {
    points: csdiResult.points,
    total: campaignTotal + csdiResult.total,
    offset,
    limit,
    source: GREEN_COLLECTION_CAMPAIGN.eventUrl,
  };
}

export async function queryGreenCollectionWithMilBus(
  query: RecyclingPointsQuery,
): Promise<RecyclingPointsResult> {
  const limit = Math.max(query.limit ?? 50, 1);
  const offset = Math.max(query.offset ?? 0, 0);
  const campaignPoint = getGreenCollectionPoint(query);
  const campaignTotal = campaignPoint ? 1 : 0;

  if (offset < campaignTotal && campaignPoint) {
    const remaining = limit - 1;
    if (remaining > 0) {
      const milBusResult = await queryMilBusMergedCsdi({
        ...query,
        offset: 0,
        limit: remaining,
      });
      return {
        points: [campaignPoint, ...milBusResult.points],
        total: campaignTotal + milBusResult.total,
        offset,
        limit,
        source: GREEN_COLLECTION_CAMPAIGN.eventUrl,
      };
    }

    const milBusTotal = (await queryMilBusMergedCsdi({ ...query, offset: 0, limit: 1 })).total;
    return {
      points: [campaignPoint],
      total: campaignTotal + milBusTotal,
      offset,
      limit,
      source: GREEN_COLLECTION_CAMPAIGN.eventUrl,
    };
  }

  const milBusResult = await queryMilBusMergedCsdi({
    ...query,
    offset: offset - campaignTotal,
    limit,
  });

  return {
    points: milBusResult.points,
    total: campaignTotal + milBusResult.total,
    offset,
    limit,
    source: GREEN_COLLECTION_CAMPAIGN.eventUrl,
  };
}
