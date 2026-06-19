#!/usr/bin/env python3
"""Generate food-waste-locations.ts from parsed JSON."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IN_JSON = ROOT / "scripts" / "food_waste_parsed.json"
OUT_TS = ROOT / "src/lib/campaigns/food-waste-locations.ts"


def slugify(text: str, index: int) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower())[:48].strip("-")
    return f"food-waste-{index:03d}-{slug or 'spot'}"


def esc(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def main() -> None:
    entries = json.loads(IN_JSON.read_text(encoding="utf-8"))
    lines = [
        "/** EPD Food Waste Recycling Spots 廚餘回收流動點 — source PDF as of 13 Jun 2026 */",
        "",
        "export interface FoodWasteSpotLocation {",
        "  id: string;",
        "  district: string;",
        "  nameEn: string;",
        "  nameTc: string;",
        "  addressEn: string;",
        "  addressTc: string;",
        "  lat: number;",
        "  lng: number;",
        "  timeEn: string;",
        "  timeTc: string;",
        "}",
        "",
        "export const FOOD_WASTE_SPOT_LOCATIONS: FoodWasteSpotLocation[] = [",
    ]

    for i, entry in enumerate(entries, start=1):
        address_en = entry["addressEn"]
        address_tc = entry["addressTc"]
        time_en = entry["timeEn"]
        time_tc = time_en.replace("pm", "晚上").replace("am", "凌晨")
        spot_id = slugify(address_en, i)
        lines.extend(
            [
                "  {",
                f'    id: "{spot_id}",',
                f'    district: "{entry["district"]}",',
                f'    nameEn: "Food Waste Recycling Spot",',
                f'    nameTc: "廚餘回收流動點",',
                f'    addressEn: "{esc(address_en)}",',
                f'    addressTc: "{esc(address_tc)}",',
                f'    lat: {entry["lat"]},',
                f'    lng: {entry["lng"]},',
                f'    timeEn: "{esc(time_en)}",',
                f'    timeTc: "{esc(time_tc)}",',
                "  },",
            ]
        )

    lines.append("];")
    lines.append("")
    OUT_TS.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(entries)} locations to {OUT_TS}")


if __name__ == "__main__":
    main()
