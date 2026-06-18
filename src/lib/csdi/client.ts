import {
  CSDI_FEATURE_SERVER,
  CSDI_MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from "./constants";
import type {
  ArcGISCountResponse,
  ArcGISQueryResponse,
  RecyclingCollectionPoint,
  RecyclingPointsQuery,
  RecyclingPointsResult,
} from "./types";

const QUERY_URL = `${CSDI_FEATURE_SERVER}/0/query`;

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function buildWhereClause(query: RecyclingPointsQuery): string {
  const clauses: string[] = ["1=1"];

  if (query.district) {
    clauses.push(`district_id = '${escapeSqlLiteral(query.district)}'`);
  }

  if (query.wasteType === "Clothing") {
    clauses.push(`(waste_type LIKE '%Clothes%' OR waste_type LIKE '%Clothing%')`);
  } else if (query.wasteType) {
    clauses.push(`waste_type LIKE '%${escapeSqlLiteral(query.wasteType)}%'`);
  }

  if (query.search?.trim()) {
    const term = escapeSqlLiteral(query.search.trim());
    clauses.push(
      `(address_en LIKE '%${term}%' OR address_tc LIKE '%${term}%' OR address_sc LIKE '%${term}%' OR address2_en LIKE '%${term}%' OR address2_tc LIKE '%${term}%' OR address2_sc LIKE '%${term}%')`,
    );
  }

  return clauses.join(" AND ");
}

function parseCoord(value: string | null | undefined, geometryFallback: number): number {
  if (value == null || value === "") return geometryFallback;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : geometryFallback;
}

function toPoint(
  attrs: NonNullable<ArcGISQueryResponse["features"]>[number]["attributes"],
  geometry?: { x: number; y: number },
): RecyclingCollectionPoint | null {
  const lat = parseCoord(attrs.lat, geometry?.y ?? NaN);
  const lng = parseCoord(attrs.lgt, geometry?.x ?? NaN);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    cp_id: String(attrs.cp_id ?? ""),
    cp_state: attrs.cp_state ?? null,
    district_id: attrs.district_id ?? null,
    address_en: attrs.address_en ?? null,
    address2_en: attrs.address2_en ?? null,
    address_tc: attrs.address_tc ?? null,
    address2_tc: attrs.address2_tc ?? null,
    address_sc: attrs.address_sc ?? null,
    address2_sc: attrs.address2_sc ?? null,
    lat,
    lng,
    waste_type: attrs.waste_type ?? null,
    legend: attrs.legend ?? null,
    accessibilty_notes: attrs.accessibilty_notes ?? null,
    contact_en: attrs.contact_en ?? null,
    contact_tc: attrs.contact_tc ?? null,
    contact_sc: attrs.contact_sc ?? null,
    openhour_en: attrs.openhour_en ?? null,
    openhour_tc: attrs.openhour_tc ?? null,
    openhour_sc: attrs.openhour_sc ?? null,
  };
}

async function fetchArcGIS<T>(params: URLSearchParams): Promise<T> {
  const url = `${QUERY_URL}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`CSDI FeatureServer error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function countRecyclingPoints(
  query: Omit<RecyclingPointsQuery, "offset" | "limit" | "lat" | "lng" | "radiusMeters">,
): Promise<number> {
  const params = new URLSearchParams({
    where: buildWhereClause(query),
    returnCountOnly: "true",
    f: "json",
  });

  const data = await fetchArcGIS<ArcGISCountResponse>(params);
  return data.count ?? 0;
}

export async function queryRecyclingPoints(
  query: RecyclingPointsQuery,
): Promise<RecyclingPointsResult> {
  const limit = Math.min(
    Math.max(query.limit ?? DEFAULT_PAGE_SIZE, 1),
    CSDI_MAX_PAGE_SIZE,
  );
  const offset = Math.max(query.offset ?? 0, 0);

  const params = new URLSearchParams({
    where: buildWhereClause(query),
    outFields: "*",
    returnGeometry: "true",
    f: "json",
    resultRecordCount: String(limit),
    resultOffset: String(offset),
    orderByFields: "cp_id",
  });

  if (
    query.lat != null &&
    query.lng != null &&
    query.radiusMeters != null &&
    query.radiusMeters > 0
  ) {
    params.set("geometry", `${query.lng},${query.lat}`);
    params.set("geometryType", "esriGeometryPoint");
    params.set("inSR", "4326");
    params.set("spatialRel", "esriSpatialRelIntersects");
    params.set("distance", String(query.radiusMeters));
    params.set("units", "esriSRUnit_Meter");
  }

  const [data, total] = await Promise.all([
    fetchArcGIS<ArcGISQueryResponse>(params),
    countRecyclingPoints(query),
  ]);

  const points =
    data.features
      ?.map((f) => toPoint(f.attributes, f.geometry))
      .filter((p): p is RecyclingCollectionPoint => p != null) ?? [];

  return {
    points,
    total,
    offset,
    limit,
    source: CSDI_FEATURE_SERVER,
  };
}
