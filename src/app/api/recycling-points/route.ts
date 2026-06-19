import { NextRequest, NextResponse } from "next/server";
import { isBooksWasteType, filterBooksForLovePoints, BOOKS_FOR_LOVE_CAMPAIGN } from "@/lib/campaigns/books-for-love";
import {
  isMedicationWasteType,
  queryMedicationCollectionPoints,
  MEDICATION_COLLECTION_CAMPAIGN,
} from "@/lib/campaigns/medication-collection-2026";
import {
  isFoodRescueWasteType,
  queryFoodAngelPoints,
  FOOD_ANGEL_CAMPAIGN,
} from "@/lib/campaigns/food-angel-food-rescue";
import {
  FOOD_WASTE_CAMPAIGN,
  isFoodWasteType,
  queryFoodWastePoints,
} from "@/lib/campaigns/food-waste-recycling-spots";
import {
  CLOTHING_WASTE_TYPE,
  isGreenCollectionWasteType,
  queryGreenCollectionMergedCsdi,
  queryGreenCollectionWithMilBus,
  GREEN_COLLECTION_CAMPAIGN,
  SMALL_APPLIANCE_WASTE_TYPE,
} from "@/lib/campaigns/green-collection-programme";
import {
  isMilBusWasteType,
  mergeMilBusWithPoints,
  MIL_BUS_CAMPAIGN,
  queryMilBusMergedCsdi,
} from "@/lib/campaigns/mil-bus-recycling";
import {
  isContactLensCaseWasteType,
  queryContactLensCasePoints,
  CONTACT_LENS_CASE_CAMPAIGN,
} from "@/lib/campaigns/contact-lens-case-recycling";
import {
  isSkincareContainersWasteType,
  queryWatsonsSkincarePoints,
} from "@/lib/campaigns/watsons-skincare-recycling";
import { queryRecyclingPoints } from "@/lib/csdi/client";
import { CSDI_DATA_ATTRIBUTION, CSDI_MAX_PAGE_SIZE } from "@/lib/csdi/constants";
import {
  isPlasticsWasteType,
  isRechargeableBatteryWasteType,
  queryPlasticsPoints,
  queryRechargeableBatteryPoints,
} from "@/lib/campaigns/watsons-plastic-battery-recycling";

export const dynamic = "force-dynamic";

function parseOptionalFloat(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

function parseOptionalInt(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const query = {
      district: searchParams.get("district") ?? undefined,
      wasteType: searchParams.get("wasteType") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      lat: parseOptionalFloat(searchParams.get("lat")),
      lng: parseOptionalFloat(searchParams.get("lng")),
      radiusMeters: parseOptionalInt(searchParams.get("radiusMeters")),
      offset: parseOptionalInt(searchParams.get("offset")) ?? 0,
      limit: Math.min(
        parseOptionalInt(searchParams.get("limit")) ?? 50,
        CSDI_MAX_PAGE_SIZE,
      ),
    };

    let result;
    if (isBooksWasteType(query.wasteType)) {
      const books = filterBooksForLovePoints(query);
      result = await mergeMilBusWithPoints(
        query,
        books,
        books.length,
        BOOKS_FOR_LOVE_CAMPAIGN.officialUrl,
      );
    } else if (isContactLensCaseWasteType(query.wasteType)) {
      result = queryContactLensCasePoints(query);
    } else if (isMedicationWasteType(query.wasteType)) {
      result = queryMedicationCollectionPoints(query);
    } else if (isSkincareContainersWasteType(query.wasteType)) {
      result = queryWatsonsSkincarePoints(query);
    } else if (isPlasticsWasteType(query.wasteType)) {
      result = await queryPlasticsPoints(query);
    } else if (isRechargeableBatteryWasteType(query.wasteType)) {
      result = await queryRechargeableBatteryPoints(query);
    } else if (query.wasteType === CLOTHING_WASTE_TYPE) {
      result = await queryGreenCollectionMergedCsdi(query);
    } else if (query.wasteType === SMALL_APPLIANCE_WASTE_TYPE) {
      result = await queryGreenCollectionWithMilBus(query);
    } else if (isMilBusWasteType(query.wasteType)) {
      result = await queryMilBusMergedCsdi(query);
    } else if (isFoodRescueWasteType(query.wasteType)) {
      result = queryFoodAngelPoints(query);
    } else if (isFoodWasteType(query.wasteType)) {
      result = queryFoodWastePoints(query);
    } else {
      result = await queryRecyclingPoints(query);
    }

    return NextResponse.json({
      ...result,
      attribution: isBooksWasteType(query.wasteType)
        ? "Mil Mill 喵巴士, Swire Properties — Books for Love @ $10"
        : isContactLensCaseWasteType(query.wasteType)
          ? `${CONTACT_LENS_CASE_CAMPAIGN.sponsorEn} — ${CONTACT_LENS_CASE_CAMPAIGN.nameEn}`
          : isMedicationWasteType(query.wasteType)
          ? `${MEDICATION_COLLECTION_CAMPAIGN.sponsorEn} — ${MEDICATION_COLLECTION_CAMPAIGN.nameEn}`
          : isSkincareContainersWasteType(query.wasteType)
            ? "Watsons Hong Kong — Skincare container recycling (short-term campaign)"
            : isPlasticsWasteType(query.wasteType)
              ? "Watsons Hong Kong, Mil Mill 喵巴士 & EPD — Plastics & plastic bottle recycling"
              : isRechargeableBatteryWasteType(query.wasteType)
                ? "Watsons Hong Kong & EPD — Rechargeable battery recycling"
                : isGreenCollectionWasteType(query.wasteType)
                  ? `${GREEN_COLLECTION_CAMPAIGN.sponsorEn} — ${GREEN_COLLECTION_CAMPAIGN.nameEn}`
                  : isMilBusWasteType(query.wasteType)
                    ? `${MIL_BUS_CAMPAIGN.sponsorEn} — ${MIL_BUS_CAMPAIGN.nameEn}`
                    : isFoodRescueWasteType(query.wasteType)
                      ? `${FOOD_ANGEL_CAMPAIGN.sponsorEn} — ${FOOD_ANGEL_CAMPAIGN.nameEn}`
                      : isFoodWasteType(query.wasteType)
                        ? `${FOOD_WASTE_CAMPAIGN.sponsorEn} — ${FOOD_WASTE_CAMPAIGN.nameEn}`
                        : CSDI_DATA_ATTRIBUTION,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch recycling points";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
