import type { LucideIcon } from "lucide-react";
import {
  Battery,
  BookOpen,
  Box,
  Droplets,
  Eye,
  FileText,
  GlassWater,
  Lightbulb,
  Monitor,
  Package,
  Pill,
  Plug,
  Recycle,
  Shirt,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { EXPIRED_WASTE_TYPES, SHORT_TERM_WASTE_TYPES, type WASTE_TYPE_FILTERS } from "@/lib/csdi/constants";

export type WasteTypeFilter = (typeof WASTE_TYPE_FILTERS)[number];

export function isShortTermWasteType(type: string): boolean {
  return (SHORT_TERM_WASTE_TYPES as readonly string[]).includes(type);
}

export function isExpiredWasteType(type: string): boolean {
  return (EXPIRED_WASTE_TYPES as readonly string[]).includes(type);
}

/** Grey chip/tag/badge styles for ended campaign waste types */
export const EXPIRED_WASTE_TYPE_STYLE = {
  chip:
    "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-300",
  chipActive: "border-slate-400 bg-slate-300 text-slate-600 shadow-sm scale-105",
  tag: "border border-slate-200 bg-slate-100 text-slate-500",
  badge: "bg-slate-400/90 text-white",
} as const;

/** Amber pulse badge for active short-term campaigns only */
export const SHORT_TERM_BADGE_STYLE = "bg-amber-500/90 text-white";

export interface WasteTypeStyle {
  icon: LucideIcon;
  /** Tailwind classes for inactive chip */
  chip: string;
  /** Tailwind classes when chip is selected */
  chipActive: string;
  /** Tailwind classes for tag on result cards */
  tag: string;
}

export const WASTE_TYPE_STYLES: Record<WasteTypeFilter, WasteTypeStyle> = {
  Books: {
    icon: BookOpen,
    chip:
      "border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-950 shadow-sm ring-2 ring-amber-300/70 hover:from-amber-100 hover:to-yellow-100",
    chipActive:
      "border-amber-500 bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-lg shadow-amber-300/50 ring-2 ring-amber-300 scale-105",
    tag: "border border-amber-300 bg-amber-50 text-amber-900 font-semibold",
  },
  "Skincare Containers": {
    icon: Droplets,
    chip:
      "border-rose-300 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-950 shadow-sm ring-2 ring-rose-300/70 hover:from-rose-100 hover:to-pink-100",
    chipActive:
      "border-rose-500 bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-300/50 ring-2 ring-rose-300 scale-105",
    tag: "border border-rose-300 bg-rose-50 text-rose-900 font-semibold",
  },
  Paper: {
    icon: FileText,
    chip:
      "border-stone-400 bg-gradient-to-r from-stone-50 to-amber-50 text-stone-950 shadow-sm ring-2 ring-stone-200/70 hover:from-stone-100 hover:to-amber-100",
    chipActive:
      "border-stone-600 bg-gradient-to-r from-stone-500 to-amber-500 text-white shadow-lg shadow-stone-300/50 ring-2 ring-stone-300 scale-105",
    tag: "border border-stone-300 bg-stone-50 text-stone-900 font-semibold",
  },
  Metals: {
    icon: Wrench,
    chip: "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 hover:border-blue-400",
    chipActive: "border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-200",
    tag: "border border-blue-200 bg-blue-50 text-blue-900",
  },
  Plastics: {
    icon: Package,
    chip:
      "border-sky-300 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-950 shadow-sm ring-2 ring-sky-200/70 hover:from-sky-100 hover:to-cyan-100",
    chipActive:
      "border-sky-600 bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-300/50 ring-2 ring-sky-300 scale-105",
    tag: "border border-sky-200 bg-sky-50 text-sky-900 font-semibold",
  },
  "Glass Bottle": {
    icon: GlassWater,
    chip: "border-emerald-500 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 hover:border-emerald-600",
    chipActive: "border-emerald-800 bg-emerald-800 text-white shadow-md shadow-emerald-200",
    tag: "border border-emerald-300 bg-emerald-50 text-emerald-950",
  },
  "Fluorescent Lamps": {
    icon: Lightbulb,
    chip: "border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 hover:border-yellow-300",
    chipActive: "border-yellow-500 bg-yellow-500 text-white shadow-md shadow-yellow-200",
    tag: "border border-yellow-200 bg-yellow-50 text-yellow-800",
  },
  "Rechargeable Batteries": {
    icon: Battery,
    chip: "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:border-orange-300",
    chipActive: "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200",
    tag: "border border-orange-200 bg-orange-50 text-orange-800",
  },
  "Small Electrical Appliances": {
    icon: Plug,
    chip: "border-indigo-400 bg-indigo-50 text-indigo-950 hover:bg-indigo-100 hover:border-indigo-500",
    chipActive: "border-indigo-800 bg-indigo-800 text-white shadow-md shadow-indigo-200",
    tag: "border border-indigo-300 bg-indigo-50 text-indigo-950",
  },
  "Regulated Electrical Equipment": {
    icon: Monitor,
    chip: "border-slate-600 bg-slate-200 text-slate-900 hover:bg-slate-300 hover:border-slate-700",
    chipActive: "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-200",
    tag: "border border-slate-400 bg-slate-200 text-slate-900",
  },
  Clothing: {
    icon: Shirt,
    chip: "border-pink-300 bg-pink-50 text-pink-900 hover:bg-pink-100 hover:border-pink-400",
    chipActive: "border-pink-600 bg-pink-600 text-white shadow-md shadow-pink-200",
    tag: "border border-pink-200 bg-pink-50 text-pink-900",
  },
  "Food Rescue": {
    icon: UtensilsCrossed,
    chip: "border-red-300 bg-red-50 text-red-900 hover:bg-red-100 hover:border-red-400",
    chipActive: "border-red-700 bg-red-700 text-white shadow-md shadow-red-200",
    tag: "border border-red-200 bg-red-50 text-red-900",
  },
  "Tetra Pak": {
    icon: Box,
    chip:
      "border-lime-300 bg-gradient-to-r from-lime-50 to-green-50 text-lime-950 shadow-sm ring-2 ring-lime-200/70 hover:from-lime-100 hover:to-green-100",
    chipActive:
      "border-lime-600 bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg shadow-lime-300/50 ring-2 ring-lime-300 scale-105",
    tag: "border border-lime-200 bg-lime-50 text-lime-900 font-semibold",
  },
  Medication: {
    icon: Pill,
    chip:
      "border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-950 shadow-sm ring-2 ring-teal-200/70 hover:from-teal-100 hover:to-cyan-100",
    chipActive:
      "border-teal-600 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-300/50 ring-2 ring-teal-300 scale-105",
    tag: "border border-teal-200 bg-teal-50 text-teal-900 font-semibold",
  },
  "Contact Lens Cases": {
    icon: Eye,
    chip: "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 hover:border-sky-400",
    chipActive: "border-sky-600 bg-sky-600 text-white shadow-md shadow-sky-200",
    tag: "border border-sky-200 bg-sky-50 text-sky-800",
  },
};

const FALLBACK_STYLE: WasteTypeStyle = {
  icon: Recycle,
  chip: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900 hover:bg-fuchsia-100 hover:border-fuchsia-300",
  chipActive: "border-fuchsia-600 bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200",
  tag: "border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
};

/** Map EPD/CSDI and campaign variant labels to canonical filter-chip keys */
const WASTE_TYPE_ALIASES: Record<string, WasteTypeFilter> = {
  Clothes: "Clothing",
  "Beverage Cartons": "Tetra Pak",
  "Fluorescent Lamp": "Fluorescent Lamps",
  "Fluorescent Lamps": "Fluorescent Lamps",
  "Glass Bottles": "Glass Bottle",
  "Glass Bottle": "Glass Bottle",
  "Plastic Bottle": "Plastics",
  "Plastic Bottles": "Plastics",
  "Small Electrical and Electronic Equipment": "Small Electrical Appliances",
  "Small Electrical Appliances": "Small Electrical Appliances",
  "Regulated Electrical Equipment": "Regulated Electrical Equipment",
  "REE": "Regulated Electrical Equipment",
};

export function normalizeWasteTypeKey(type: string): string {
  const trimmed = type.trim();
  return WASTE_TYPE_ALIASES[trimmed] ?? trimmed;
}

export function getWasteTypeLabel(
  type: string,
  labels: Record<string, string>,
): string {
  const key = normalizeWasteTypeKey(type);
  return labels[key] ?? labels[type.trim()] ?? type.trim();
}

/** All CSDI/EPD strings to match when filtering by a canonical waste-type key */
export function getWasteTypeSearchTerms(canonicalKey: string): string[] {
  const terms = new Set<string>([canonicalKey]);
  for (const [alias, canonical] of Object.entries(WASTE_TYPE_ALIASES)) {
    if (canonical === canonicalKey) terms.add(alias);
  }
  return [...terms];
}

export function getExpiredBadgeClass(_type: string): string {
  return EXPIRED_WASTE_TYPE_STYLE.badge;
}

export function getWasteTypeStyle(type: string): WasteTypeStyle {
  const key = normalizeWasteTypeKey(type);
  return WASTE_TYPE_STYLES[key as WasteTypeFilter] ?? FALLBACK_STYLE;
}
