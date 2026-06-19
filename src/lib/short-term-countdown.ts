import type { RecyclingCollectionPoint } from "@/lib/csdi/types";
import { daysUntil } from "@/lib/calendar";
import { BOOKS_FOR_LOVE_CAMPAIGN } from "@/lib/campaigns/books-for-love";
import {
  GREEN_COLLECTION_CAMPAIGN,
  GREEN_COLLECTION_EVENT_DATE,
} from "@/lib/campaigns/green-collection-programme";
import { MEDICATION_COLLECTION_CAMPAIGN } from "@/lib/campaigns/medication-collection-2026";
import {
  MIL_BUS_ACTIVE_DATE,
  MIL_BUS_CAMPAIGN,
} from "@/lib/campaigns/mil-bus-recycling";
import { WATSONS_SKINCARE_CAMPAIGN } from "@/lib/campaigns/watsons-skincare-recycling";

export type ShortTermCountdownMode = "starts" | "ends";

export type ShortTermCountdownInfo = {
  daysLeft: number;
  endDateIso: string;
  mode: ShortTermCountdownMode;
  urgent: boolean;
};

const CAMPAIGN_END_DATES: Record<string, string> = {
  [MIL_BUS_CAMPAIGN.id]: MIL_BUS_ACTIVE_DATE,
  [GREEN_COLLECTION_CAMPAIGN.id]: GREEN_COLLECTION_EVENT_DATE,
  [WATSONS_SKINCARE_CAMPAIGN.id]: "2026-12-31",
  [MEDICATION_COLLECTION_CAMPAIGN.id]: "2026-12-31",
  [BOOKS_FOR_LOVE_CAMPAIGN.id]: "2026-01-31",
};

function parseMilBusEventDate(cpId: string): string | null {
  const match = cpId.match(/milbus-(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

function resolveEndDate(point: RecyclingCollectionPoint): string | null {
  if (point.campaign_source === MIL_BUS_CAMPAIGN.id) {
    return parseMilBusEventDate(point.cp_id) ?? MIL_BUS_ACTIVE_DATE;
  }
  if (point.campaign_source) {
    return CAMPAIGN_END_DATES[point.campaign_source] ?? null;
  }
  return null;
}

export function formatShortTermEventDate(dateIso: string, locale: "en" | "zh"): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (locale === "zh") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getShortTermCountdown(
  point: RecyclingCollectionPoint,
  expiredCampaign: boolean,
): ShortTermCountdownInfo | null {
  if (expiredCampaign) return null;

  const isUpcoming = point.cp_state === "Upcoming";
  const isActiveShort = point.is_short_term === true;
  if (!isUpcoming && !isActiveShort) return null;

  const endDate = resolveEndDate(point);
  if (!endDate) return null;

  const daysLeft = daysUntil(endDate);
  if (daysLeft < 0) return null;

  return {
    daysLeft,
    endDateIso: endDate,
    mode: isUpcoming ? "starts" : "ends",
    urgent: daysLeft <= 2,
  };
}
