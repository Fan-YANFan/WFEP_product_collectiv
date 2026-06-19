#!/usr/bin/env python3
"""Parse EPD Food Waste Recycling Spots PDF text and geocode via Nominatim."""

from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "scripts" / "food_waste_raw.txt"
OUT_JSON = ROOT / "scripts" / "food_waste_parsed.json"

DISTRICT_ONLY = {
    "Central and Western District",
    "Eastern District",
    "Wan Chai District",
    "Southern District",
    "Kowloon City District",
    "Kwun Tong District",
    "Sham Shui Po District",
    "Wong Tai Sin District",
    "Yau Tsim Mong District",
    "Kwai Tsing District",
    "North District",
    "Sai Kung District",
    "Sha Tin District",
    "Tai Po District",
    "Tsuen Wan District",
    "Tuen Mun District",
    "Yuen Long District",
}

DISTRICT_MAP = {
    "Central and Western District": "Central_Western",
    "Central and \nWestern District": "Central_Western",
    "Eastern District": "Eastern",
    "Wan Chai District": "Wan_Chai",
    "Southern District": "Southern",
    "Kowloon City District": "Kowloon_City",
    "Kowloon City \nDistrict": "Kowloon_City",
    "Kwun Tong District": "Kwun_Tong",
    "Sham Shui Po District": "Sham_Shui_Po",
    "Sham Shui Po \nDistrict": "Sham_Shui_Po",
    "Wong Tai Sin District": "Wong_Tai_Sin",
    "Wong Tai Sin \nDistrict": "Wong_Tai_Sin",
    "Yau Tsim Mong District": "Yau_Tsim_Mong",
    "Yau Tsim Mong \nDistrict": "Yau_Tsim_Mong",
    "Kwai Tsing District": "Kwai_Tsing",
    "North District": "North",
    "Sai Kung District": "Sai_Kung",
    "Sha Tin District": "Sha_Tin",
    "Tai Po District": "Tai_Po",
    "Tsuen Wan District": "Tsuen_Wan",
    "Tuen Mun District": "Tuen_Mun",
    "Yuen Long District": "Yuen_Long",
}

TIME_RE = re.compile(
    r"(\d{1,2}:\d{2}\s*(?:am|pm)\s*[-–]\s*\d{1,2}:\d{2}\s*(?:am|pm))\s*#?\s*$",
    re.I,
)
CJK_RE = re.compile(r"[\u4e00-\u9fff]")
SKIP_RE = re.compile(
    r"^(地區|District|Venue|Time|香港島|九龍|新界|Hong Kong Island|Kowloon|New Territories|"
    r"廚餘|Food Waste|Locations of|Environmental Protection|operators and residents|"
    r"Collecting food waste|查詢|Enquiry|電話|電郵|Phone|E-mail|#|"
    r"The Environmental Protection Department)",
    re.I,
)

DISTRICT_NAME_ONLY = {
    "Sham Shui Po",
    "Yau Tsim Mong",
    "Central and Western District",
    "Eastern District",
    "Wan Chai District",
    "Southern District",
    "Kowloon City District",
    "Kwun Tong District",
    "Sham Shui Po District",
    "Wong Tai Sin District",
    "Yau Tsim Mong District",
    "Kwai Tsing District",
    "North District",
    "Sai Kung District",
    "Sha Tin District",
    "Tai Po District",
    "Tsuen Wan District",
    "Tuen Mun District",
    "Yuen Long District",
}


def normalize_district(chunk: str) -> str | None:
    chunk = re.sub(r"\s+", " ", chunk).strip()
    for key, val in DISTRICT_MAP.items():
        if key.replace("\n", " ") in chunk or chunk.endswith(key.replace("\n", " ")):
            return val
    return None


def parse_entries(text: str) -> list[dict]:
    lines = [ln.strip() for ln in text.splitlines()]
    current_district: str | None = None
    pending_tc: list[str] = []
    pending_en: list[str] = []
    default_time: str | None = None
    entries: list[dict] = []

    def flush(time_value: str | None):
        nonlocal pending_tc, pending_en
        if not pending_en and not pending_tc:
            return
        address_en = " ".join(pending_en).strip()
        address_tc = "".join(pending_tc).strip()
        if not address_en and not address_tc:
            pending_tc, pending_en = [], []
            return
        if address_en in DISTRICT_ONLY or address_tc in DISTRICT_ONLY:
            pending_tc, pending_en = [], []
            return
        if address_en in DISTRICT_NAME_ONLY or address_tc in DISTRICT_NAME_ONLY:
            pending_tc, pending_en = [], []
            return
        if "環境保護署" in address_tc or "Environmental Protection Department has set" in address_en:
            pending_tc, pending_en = [], []
            return
        entries.append(
            {
                "district": current_district or "Central_Western",
                "addressEn": address_en or address_tc,
                "addressTc": address_tc or address_en,
                "timeEn": time_value or default_time or "See EPD schedule",
            }
        )
        pending_tc, pending_en = [], []

    for raw in lines:
        if not raw or SKIP_RE.search(raw):
            continue
        if "District" in raw and not TIME_RE.search(raw):
            d = normalize_district(raw)
            if d:
                current_district = d
                continue
        if raw in ("中西區", "東區", "灣仔區", "南區", "九龍城區", "觀塘區", "深水埗區", "黃大仙區", "油尖旺區", "葵青區", "北區", "西貢區", "沙田區", "大埔區", "荃灣區", "屯門區", "元朗區"):
            continue

        m = TIME_RE.search(raw)
        if m:
            time_val = m.group(1).replace("–", "–")
            before = raw[: m.start()].strip()
            if before:
                if CJK_RE.search(before):
                    pending_tc.append(before)
                else:
                    pending_en.append(before)
            flush(time_val)
            default_time = time_val
            continue

        if CJK_RE.search(raw):
            if pending_tc or pending_en:
                flush(None)
            pending_tc = [raw]
            pending_en = []
        else:
            pending_en.append(raw)

    flush(None)
    return entries


def simplify_query(address_en: str) -> str:
    q = re.sub(r"\s*\(.*", "", address_en).strip()
    q = re.sub(r"\s*#+\s*$", "", q).strip()
    q = re.sub(r"^Public pavement(?: outside| at| of)?\s+", "", q, flags=re.I)
    q = re.sub(r"^Near\s+", "", q, flags=re.I)
    q = re.sub(r"^Outside\s+", "", q, flags=re.I)
    return q


def geocode(query: str) -> tuple[float, float] | None:
    simplified = simplify_query(query)
    for candidate in (simplified, query):
        q = urllib.parse.quote(f"{candidate}, Hong Kong")
        url = f"https://nominatim.openstreetmap.org/search?q={q}&format=json&limit=1"
        req = urllib.request.Request(url, headers={"User-Agent": "WFEP-product/1.0 (food-waste-import)"})
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode())
        except Exception:
            data = []
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
        time.sleep(1.05)
    return None


DISTRICT_CENTROIDS: dict[str, tuple[float, float]] = {
    "Central_Western": (22.286, 114.154),
    "Eastern": (22.284, 114.224),
    "Wan_Chai": (22.277, 114.173),
    "Southern": (22.247, 114.158),
    "Kowloon_City": (22.321, 114.191),
    "Kwun_Tong": (22.313, 114.225),
    "Sham_Shui_Po": (22.330, 114.162),
    "Wong_Tai_Sin": (22.340, 114.195),
    "Yau_Tsim_Mong": (22.305, 114.171),
    "Kwai_Tsing": (22.358, 114.128),
    "North": (22.494, 114.138),
    "Sai_Kung": (22.382, 114.271),
    "Sha_Tin": (22.381, 114.188),
    "Tai_Po": (22.450, 114.164),
    "Tsuen_Wan": (22.371, 114.114),
    "Tuen_Mun": (22.391, 113.977),
    "Yuen_Long": (22.445, 114.022),
}


def main() -> None:
    text = RAW.read_text(encoding="utf-8")
    entries = parse_entries(text)
    print(f"Parsed {len(entries)} entries")

    enriched = []
    for i, entry in enumerate(entries):
        query = entry["addressEn"]
        coords = geocode(query)
        if coords:
            entry["lat"], entry["lng"] = coords
            print(f"[{i+1}/{len(entries)}] OK {query[:60]} -> {coords}")
        else:
            lat, lng = DISTRICT_CENTROIDS.get(entry["district"], (22.3193, 114.1694))
            entry["lat"], entry["lng"] = lat, lng
            print(f"[{i+1}/{len(entries)}] MISS {query[:60]} -> centroid")
        enriched.append(entry)
        time.sleep(0.2)

    OUT_JSON.write_text(json.dumps(enriched, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_JSON}")


if __name__ == "__main__":
    main()
