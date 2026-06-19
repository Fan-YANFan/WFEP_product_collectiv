/** Hong Kong CSDI — Recyclable Collection Points Data (EPD) */
export const CSDI_DATASET_ID = "epd_rcd_1630899452408_9505";

export const CSDI_LAYER_NAME = "geotagging";

export const CSDI_FEATURE_SERVER =
  "https://portal.csdi.gov.hk/server/rest/services/common/epd_rcd_1630899452408_9505/FeatureServer";

export const CSDI_GEOJSON_URL = `https://portal.csdi.gov.hk/csdi-webpage/file-api?dataset_id=${CSDI_DATASET_ID}&format=geojson&layer_name=${CSDI_LAYER_NAME}`;

export const CSDI_PORTAL_URL = `https://portal.csdi.gov.hk/geoportal/?datasetId=${CSDI_DATASET_ID}&lang=zh-hk`;

export const CSDI_DATA_ATTRIBUTION =
  "Environmental Protection Department via Common Spatial Data Infrastructure (CSDI)";

/** ArcGIS FeatureServer max records per query */
export const CSDI_MAX_PAGE_SIZE = 3000;

/** Default page size for the app API */
export const DEFAULT_PAGE_SIZE = 50;

/** Hong Kong districts as returned in `district_id` */
export const HK_DISTRICTS = [
  "Central_Western",
  "Eastern",
  "Islands",
  "Kowloon_City",
  "Kwai_Tsing",
  "Kwun_Tong",
  "North",
  "Sai_Kung",
  "Sha_Tin",
  "Sham_Shui_Po",
  "Southern",
  "Tai_Po",
  "Tsuen_Wan",
  "Tuen_Mun",
  "Wan_Chai",
  "Wong_Tai_Sin",
  "Yau_Tsim_Mong",
  "Yuen_Long",
  "Macau",
] as const;

/**
 * Waste-type filter chips — ordered by everyday recycling habit (most familiar first),
 * not by database point count.
 *
 * 1. Daily household recyclables (paper, plastics, bottles, cans, drink cartons)
 * 2. Donation & surplus (clothing, food, books)
 * 3. Electrical & hazardous (batteries, appliances, lamps)
 * 4. Special / campaign programmes (contact lens cases, medication, skincare)
 */
export const WASTE_TYPE_FILTERS = [
  "Paper",
  "Plastics",
  "Glass Bottle",
  "Metals",
  "Tetra Pak",
  "Clothing",
  "Food Rescue",
  "Food Waste",
  "Books",
  "Rechargeable Batteries",
  "Small Electrical Appliances",
  "Regulated Electrical Equipment",
  "Fluorescent Lamps",
  "Contact Lens Cases",
  "Medication",
  "Skincare Containers",
] as const;

/** Short-term / campaign waste types shown with highlight styling */
export const SHORT_TERM_WASTE_TYPES = ["Skincare Containers", "Medication"] as const;

/** Ended campaigns — shown greyed out on result cards (not on filter chips) */
export const EXPIRED_WASTE_TYPES = [] as const;

export type ShortTermWasteType = (typeof SHORT_TERM_WASTE_TYPES)[number];

export type ExpiredWasteType = (typeof EXPIRED_WASTE_TYPES)[number];
