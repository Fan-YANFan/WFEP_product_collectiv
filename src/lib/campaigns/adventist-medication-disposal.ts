import type { RecyclingCollectionPoint, RecyclingPointsQuery } from "@/lib/csdi/types";

const MEDICATION_WASTE_TYPE = "Medication";

export const ADVENTIST_MEDICATION_CAMPAIGN = {
  id: "adventist-medication-disposal-2026",
  nameEn: "Pharmacy Medication Disposal Programme",
  nameTc: "藥房「藥餘回收計劃」",
  eventUrl:
    "https://www.facebook.com/TsuenWanAdventistHospital/photos/%E9%81%8E%E6%9C%9F%E6%88%96%E5%89%A9%E9%A4%98%E8%97%A5%E7%89%A9%E6%87%89%E5%A6%82%E4%BD%95%E8%99%95%E7%90%86-%E5%A4%A7%E5%AE%B6%E6%9C%89%E6%B2%92%E6%9C%89%E6%83%B3%E9%81%8E%E5%A6%82%E4%BD%95%E6%A3%84%E7%BD%AE%E8%97%A5%E9%A4%98%E6%89%8D%E6%9C%80%E5%AE%89%E5%85%A8-%E9%9A%A8%E6%84%8F%E4%B8%9F%E6%A3%84%E8%97%A5%E7%89%A9%E4%B8%8D%E4%BD%86%E6%9C%83%E6%B1%A1%E6%9F%93%E6%B0%B4%E8%B3%AA%E5%92%8C%E5%9C%9F%E5%A3%A4%E8%80%8C%E6%8A%97%E7%94%9F%E7%B4%A0%E7%AD%89%E8%97%A5%E7%89%A9%E9%80%B2%E5%85%A5%E7%92%B0%E5%A2%83%E6%9B%B4%E6%9C%83%E5%9F%B9%E8%82%B2%E5%87%BA%E8%B6%85%E7%B4%9A%E6%83%A1%E8%8F%8C-%E8%8B%A5%E6%8A%8A%E8%97%A5%E7%89%A9%E7%9B%B4%E6%8E%A5%E4%B8%9F%E5%85%A5%E5%9E%83%E5%9C%BE%E6%A1%B6%E8%97%A5/1598575005609706/",
  hospitalUrl: "https://www.twah.org.hk",
  sponsorEn: "Hong Kong Adventist Hospital – Tsuen Wan",
  sponsorTc: "香港港安醫院（荃灣）",
  collectionPeriodEn: "11 May – 31 May 2026 (public); staff collection 4–10 May 2026",
  collectionPeriodTc: "2026年5月11日至31日（公眾）；員工收集期為5月4日至10日",
} as const;

export const ADVENTIST_MEDICATION_DISPOSAL_POINT: RecyclingCollectionPoint = {
  cp_id: "adventist-medication-disposal-tsuen-wan",
  cp_state: "Ended",
  district_id: "Tsuen_Wan",
  address_en: "Hong Kong Adventist Hospital – Tsuen Wan — Pharmacy (2/F New Block)",
  address2_en: "199 Tsuen King Circuit, Tsuen Wan, New Territories",
  address_tc: "香港港安醫院（荃灣）— 新座2樓藥房",
  address2_tc: "新界荃灣荃景圍199號",
  address_sc: null,
  address2_sc: null,
  lat: 22.3686,
  lng: 114.1147,
  waste_type: MEDICATION_WASTE_TYPE,
  legend:
    "Pharmacy Medication Disposal Programme — residual or expired solid pills & Western medicine (May 2026, ended)",
  accessibilty_notes: null,
  contact_en:
    "Enquiry Tel: 2275 6266 / Hospital Tel: 2275 6688. Keep pills in original bags or bottles; cross out personal details on labels. Not accepted: liquids, ointments, inhalers, Chinese medicine, or dangerous drugs.",
  contact_tc:
    "查詢電話：2275 6266／醫院電話：2275 6688。請將藥丸保留在原包裝袋或藥瓶內，並塗掉標籤上的個人資料。不接受：藥水、藥膏、吸入器、中藥／中成藥及危險藥物。",
  contact_sc: null,
  openhour_en: "Collection: 11 May – 31 May 2026 (public); Mon – Sun during pharmacy hours",
  openhour_tc: "公眾收集期：2026年5月11日至31日（藥房開放時間內）",
  openhour_sc: null,
  campaign_source: ADVENTIST_MEDICATION_CAMPAIGN.id,
  campaign_url: ADVENTIST_MEDICATION_CAMPAIGN.eventUrl,
  is_short_term: false,
};

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

/** Ended Adventist hospital point — listed after active Greeners Action boxes */
export function filterAdventistMedicationDisposalPoints(
  query: RecyclingPointsQuery,
): RecyclingCollectionPoint[] {
  const point = ADVENTIST_MEDICATION_DISPOSAL_POINT;
  if (query.district && point.district_id !== query.district) return [];
  if (query.search && !matchesSearch(point, query.search)) return [];

  if (
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0
  ) {
    const dist = distanceMeters(query.lat, query.lng, point.lat, point.lng);
    if (dist > query.radiusMeters) return [];
  }

  return [point];
}
