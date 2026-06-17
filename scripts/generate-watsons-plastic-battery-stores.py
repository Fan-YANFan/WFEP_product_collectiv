#!/usr/bin/env python3
"""Generate watsons-plastic-battery-locations.ts from PDF store list + watsons-store-locations.ts."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STORES_FILE = ROOT / "src/lib/campaigns/watsons-store-locations.ts"
OUT_FILE = ROOT / "src/lib/campaigns/watsons-plastic-battery-locations.ts"

# Source: Watson's plastic bottle & battery recycling PDF (54 branches)
ENTRIES = [
    ("wtc-yoho-mix", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-spot", "10:30 AM – 8:30 PM", "上午10:30 – 下午8:30"),
    ("wtc-landmark-north", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-un-chau-street", "9:00 AM – 10:00 PM", "上午9:00 – 下午10:00"),
    ("wtc-smartland", "10:00 AM – 9:30 PM", "上午10:00 – 下午9:30"),
    ("wtc-kai-tin", "9:30 AM – 9:30 PM", "上午9:30 – 下午9:30"),
    ("wtc-sau-fu-street", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-domain", "Wed 10:00 AM – 8:30 PM", "星期三 上午10:00 – 下午8:30"),
    ("wtc-tin-hau", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-cityplaza", "9:30 AM – 9:30 PM", "上午9:30 – 下午9:30"),
    ("wtc-olympian-city", "9:30 AM – 10:00 PM", "上午9:30 – 下午10:00"),
    ("wtc-sheung-tak", "10:00 AM – 8:30 PM", "上午10:00 – 下午8:30"),
    ("wtc-tuen-mun-town-plaza", "10:00 AM – 10:00 PM", "上午10:00 – 下午10:00"),
    ("wtc-choi-wan", "9:30 AM – 8:30 PM", "上午9:30 – 下午8:30"),
    ("wtc-fortune-centre", "9:30 AM – 10:00 PM", "上午9:30 – 下午10:00"),
    ("wtc-d-park", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-discovery-bay", "9:00 AM – 8:00 PM", "上午9:00 – 下午8:00"),
    ("wtc-oi-man", "9:00 AM – 8:30 PM", "上午9:00 – 下午8:30"),
    ("wtc-moko", "10:30 AM – 9:00 PM", "上午10:30 – 下午9:00"),
    ("wtc-new-yuen-long", "9:00 AM – 10:00 PM", "上午9:00 – 下午10:00"),
    ("wtc-locwood-court", "9:00 AM – 9:00 PM", "上午9:00 – 下午9:00"),
    ("wtc-new-town-plaza", "9:00 AM – 10:00 PM", "上午9:00 – 下午10:00"),
    ("wtc-uptown-plaza", "10:00 AM – 9:30 PM", "上午10:00 – 下午9:30"),
    ("wtc-mcp-central", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-metroplaza", "10:00 AM – 10:00 PM", "上午10:00 – 下午10:00"),
    ("wtc-mongkok-655", "9:00 AM – 11:00 PM", "上午9:00 – 下午11:00"),
    ("wtc-ching-long", "9:30 AM – 8:30 PM", "上午9:30 – 下午8:30"),
    ("wtc-east-point-city", "10:00 AM – 9:30 PM", "上午10:00 – 下午9:30"),
    ("wtc-lok-fu-place", "9:30 AM – 9:00 PM", "上午9:30 – 下午9:00"),
    ("wtc-jubilant-place", "9:00 AM – 10:00 PM", "上午9:00 – 下午10:00"),
    ("wtc-centre-street", "9:30 AM – 9:00 PM", "上午9:30 – 下午9:00"),
    ("wtc-island-place", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-sau-mau-ping", "10:00 AM – 8:30 PM", "上午10:00 – 下午8:30"),
    ("wtc-shau-kei-wan", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-fanling-town-centre", "10:00 AM – 9:30 PM", "上午10:00 – 下午9:30"),
    ("wtc-hunghom-bay", "9:00 AM – 9:00 PM", "上午9:00 – 下午9:00"),
    ("wtc-luk-yeung-galleria", "9:30 AM – 9:00 PM", "上午9:30 – 下午9:00"),
    ("wtc-woo", "9:30 AM – 9:30 PM", "上午9:30 – 下午9:30"),
    ("wtc-fortune-city-one", "9:00 AM – 10:00 PM", "上午9:00 – 下午10:00"),
    ("wtc-metropolis-mall", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-flora-plaza", "10:00 AM – 8:00 PM", "上午10:00 – 下午8:00"),
    ("wtc-citywalk-2", "10:00 AM – 10:00 PM", "上午10:00 – 下午10:00"),
    ("wtc-tsuen-kam-centre", "9:00 AM – 9:00 PM", "上午9:00 – 下午9:00"),
    ("wtc-melbourne-plaza", "9:00 AM – 8:00 PM", "上午9:00 – 下午8:00"),
    ("wtc-butterfly-estate", "Wed 10:00 AM – 9:00 PM", "星期三 上午10:00 – 下午9:00"),
    ("wtc-hennessy-road", "9:30 AM – 8:00 PM", "上午9:30 – 下午8:00"),
    ("wtc-mayfair-lane", "11:00 AM – 8:30 PM", "上午11:00 – 下午8:30"),
    ("wtc-metro-town", "10:00 AM – 9:30 PM", "上午10:00 – 下午9:30"),
    ("wtc-diamond-hill", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-maritime-square", "10:00 AM – 9:30 PM", "上午10:00 – 下午9:30"),
    ("wtc-belvedere-square", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-laguna-city", "10:00 AM – 9:00 PM", "上午10:00 – 下午9:00"),
    ("wtc-lido-avenue", "10:30 AM – 8:00 PM", "上午10:30 – 下午8:00"),
    ("wtc-whampoa-garden", "9:30 AM – 10:00 PM", "上午9:30 – 下午10:00"),
]


def parse_stores(text: str) -> dict[str, dict]:
    blocks = re.split(r"\n  \{", text)
    stores: dict[str, dict] = {}
    for block in blocks:
        sid = re.search(r'storeId: "([^"]+)"', block)
        if not sid:
            continue
        store_id = sid.group(1)
        stores[store_id] = {
            "storeId": store_id,
            "district": re.search(r'district: "([^"]+)"', block).group(1),
            "nameEn": re.search(r'nameEn: "([^"]+)"', block).group(1),
            "nameTc": re.search(r'nameTc: "([^"]+)"', block).group(1),
            "lat": float(re.search(r"lat: ([\d.]+)", block).group(1)),
            "lng": float(re.search(r"lng: ([\d.]+)", block).group(1)),
            "addressEn": re.search(r'addressEn: "([^"]+)"', block).group(1),
            "addressTc": re.search(r'addressTc: "([^"]+)"', block).group(1),
        }
    return stores


def main() -> None:
    stores = parse_stores(STORES_FILE.read_text())
    lines = [
        "/**",
        " * Watsons HK stores accepting plastic bottle & rechargeable battery recycling.",
        " * Source: Watson's plastic bottle & battery recycling PDF (54 branches).",
        " * Coordinates matched from watsons-store-locations.ts.",
        " */",
        "",
        "export interface WatsonsPlasticBatteryStore {",
        "  storeId: string;",
        "  district: string;",
        "  nameEn: string;",
        "  nameTc: string;",
        "  lat: number;",
        "  lng: number;",
        "  addressEn: string;",
        "  addressTc: string;",
        "  openhourEn: string;",
        "  openhourTc: string;",
        "}",
        "",
        "export const WATSONS_PLASTIC_BATTERY_STORES: WatsonsPlasticBatteryStore[] = [",
    ]

    for i, (store_id, hours_en, hours_tc) in enumerate(ENTRIES, start=1):
        if store_id not in stores:
            raise SystemExit(f"Missing store {store_id}")
        s = stores[store_id]
        lines.append("  {")
        lines.append(f'    storeId: "wtc-pb-{i:02d}-{store_id.removeprefix("wtc-")}",')
        for key in ("district", "nameEn", "nameTc", "lat", "lng", "addressEn", "addressTc"):
            val = s[key]
            if isinstance(val, str):
                lines.append(f'    {key}: "{val}",')
            else:
                lines.append(f"    {key}: {val},")
        lines.append(f'    openhourEn: "{hours_en}",')
        lines.append(f'    openhourTc: "{hours_tc}",')
        lines.append("  },")

    lines.append("];")
    lines.append("")
    OUT_FILE.write_text("\n".join(lines))
    print(f"Wrote {len(ENTRIES)} stores to {OUT_FILE}")


if __name__ == "__main__":
    main()
