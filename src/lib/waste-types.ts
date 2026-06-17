import type { LucideIcon } from "lucide-react";
import {
  Battery,
  BookOpen,
  Box,
  Droplets,
  FileText,
  GlassWater,
  Lightbulb,
  Monitor,
  Package,
  Plug,
  Recycle,
  Shirt,
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
    chip: "border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100 hover:border-teal-300",
    chipActive: "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-200",
    tag: "border border-teal-200 bg-teal-50 text-teal-900",
  },
  Metals: {
    icon: Wrench,
    chip: "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 hover:border-blue-400",
    chipActive: "border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-200",
    tag: "border border-blue-200 bg-blue-50 text-blue-900",
  },
  Plastics: {
    icon: Package,
    chip: "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 hover:border-sky-300",
    chipActive: "border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-200",
    tag: "border border-sky-200 bg-sky-50 text-sky-800",
  },
  "Plastic Bottle": {
    icon: Recycle,
    chip: "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 hover:border-cyan-300",
    chipActive: "border-cyan-600 bg-cyan-600 text-white shadow-md shadow-cyan-200",
    tag: "border border-cyan-200 bg-cyan-50 text-cyan-800",
  },
  "Glass Bottle": {
    icon: GlassWater,
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300",
    chipActive: "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200",
    tag: "border border-emerald-200 bg-emerald-50 text-emerald-800",
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
    chip: "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 hover:border-violet-300",
    chipActive: "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200",
    tag: "border border-violet-200 bg-violet-50 text-violet-800",
  },
  "Regulated Electrical Equipment": {
    icon: Monitor,
    chip: "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 hover:border-indigo-300",
    chipActive: "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200",
    tag: "border border-indigo-200 bg-indigo-50 text-indigo-800",
  },
  Clothes: {
    icon: Shirt,
    chip: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 hover:border-rose-300",
    chipActive: "border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-200",
    tag: "border border-rose-200 bg-rose-50 text-rose-800",
  },
  "Tetra Pak": {
    icon: Box,
    chip: "border-lime-200 bg-lime-50 text-lime-800 hover:bg-lime-100 hover:border-lime-300",
    chipActive: "border-lime-600 bg-lime-600 text-white shadow-md shadow-lime-200",
    tag: "border border-lime-200 bg-lime-50 text-lime-800",
  },
};

const FALLBACK_STYLE: WasteTypeStyle = {
  icon: Recycle,
  chip: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900 hover:bg-fuchsia-100 hover:border-fuchsia-300",
  chipActive: "border-fuchsia-600 bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200",
  tag: "border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
};

export function getWasteTypeStyle(type: string): WasteTypeStyle {
  return WASTE_TYPE_STYLES[type as WasteTypeFilter] ?? FALLBACK_STYLE;
}
