/** geotagging layer fields per EPD Recyclable Collection Points Data spec */
export interface RecyclingCollectionPoint {
  cp_id: string;
  cp_state: string | null;
  district_id: string | null;
  address_en: string | null;
  address2_en: string | null;
  address_tc: string | null;
  address2_tc: string | null;
  address_sc: string | null;
  address2_sc: string | null;
  lat: number;
  lng: number;
  waste_type: string | null;
  legend: string | null;
  accessibilty_notes: string | null;
  contact_en: string | null;
  contact_tc: string | null;
  contact_sc: string | null;
  openhour_en: string | null;
  openhour_tc: string | null;
  openhour_sc: string | null;
  /** Short-term campaign metadata (non-CSDI points) */
  campaign_source?: string | null;
  campaign_url?: string | null;
  is_short_term?: boolean;
}

export type AddressLocale = "en" | "tc" | "sc";

export interface RecyclingPointsQuery {
  district?: string;
  wasteType?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  offset?: number;
  limit?: number;
}

export interface RecyclingPointsResult {
  points: RecyclingCollectionPoint[];
  total: number;
  offset: number;
  limit: number;
  source: string;
}

interface ArcGISPointGeometry {
  x: number;
  y: number;
}

interface ArcGISFeatureAttributes {
  cp_id?: string;
  cp_state?: string | null;
  district_id?: string | null;
  address_en?: string | null;
  address2_en?: string | null;
  address_tc?: string | null;
  address2_tc?: string | null;
  address_sc?: string | null;
  address2_sc?: string | null;
  lat?: string | null;
  lgt?: string | null;
  waste_type?: string | null;
  legend?: string | null;
  accessibilty_notes?: string | null;
  contact_en?: string | null;
  contact_tc?: string | null;
  contact_sc?: string | null;
  openhour_en?: string | null;
  openhour_tc?: string | null;
  openhour_sc?: string | null;
}

export interface ArcGISQueryResponse {
  features?: Array<{
    geometry?: ArcGISPointGeometry;
    attributes: ArcGISFeatureAttributes;
  }>;
  exceededTransferLimit?: boolean;
}

export interface ArcGISCountResponse {
  count: number;
}
