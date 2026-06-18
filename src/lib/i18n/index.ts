import { en } from "./en";
import { zh } from "./zh";
import type { Translations } from "./types";

export type Locale = "en" | "zh";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

export const translations: Record<Locale, Translations> = { en, zh };

export const LOCALE_STORAGE_KEY = "collectiv-locale";

/** Replace `{key}` placeholders in a template string */
export function formatMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export { en, zh };
export type { Translations } from "./types";
