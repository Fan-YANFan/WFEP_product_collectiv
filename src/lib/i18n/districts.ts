/** HK district labels for UI (CSDI `district_id` values) */
export const DISTRICT_LABELS: Record<string, { en: string; zh: string }> = {
  Central_Western: { en: "Central & Western", zh: "中西區" },
  Eastern: { en: "Eastern", zh: "東區" },
  Islands: { en: "Islands", zh: "離島" },
  Kowloon_City: { en: "Kowloon City", zh: "九龍城" },
  Kwai_Tsing: { en: "Kwai Tsing", zh: "葵青" },
  Kwun_Tong: { en: "Kwun Tong", zh: "觀塘" },
  North: { en: "North", zh: "北區" },
  Sai_Kung: { en: "Sai Kung", zh: "西貢" },
  Sha_Tin: { en: "Sha Tin", zh: "沙田" },
  Sham_Shui_Po: { en: "Sham Shui Po", zh: "深水埗" },
  Southern: { en: "Southern", zh: "南區" },
  Tai_Po: { en: "Tai Po", zh: "大埔" },
  Tsuen_Wan: { en: "Tsuen Wan", zh: "荃灣" },
  Tuen_Mun: { en: "Tuen Mun", zh: "屯門" },
  Wan_Chai: { en: "Wan Chai", zh: "灣仔" },
  Wong_Tai_Sin: { en: "Wong Tai Sin", zh: "黃大仙" },
  Yau_Tsim_Mong: { en: "Yau Tsim Mong", zh: "油尖旺" },
  Yuen_Long: { en: "Yuen Long", zh: "元朗" },
  Macau: { en: "Macau", zh: "澳門" },
};

export function getDistrictLabel(districtId: string, locale: "en" | "zh"): string {
  const entry = DISTRICT_LABELS[districtId];
  if (!entry) return districtId.replace(/_/g, " ");
  return locale === "zh" ? entry.zh : entry.en;
}
