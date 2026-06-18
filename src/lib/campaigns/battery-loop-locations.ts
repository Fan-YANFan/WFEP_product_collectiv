import type { RecyclingCollectionPoint } from "@/lib/csdi/types";

const WASTE_TYPE = "Rechargeable Batteries";
const CAMPAIGN_ID = "battery-loop-2026";
const MAP_URL =
  "https://www.google.com/maps/d/u/0/viewer?mid=1ICObjfnSaGZA1yVsWo4MuEBvD7I6hdo";

function buildPoint(
  id: string, district: string, nameEn: string, addressEn: string,
  nameTc: string, addressTc: string, noteEn: string, noteTc: string,
  lat: number, lng: number,
): RecyclingCollectionPoint {
  const contactEn = noteEn
    ? `Battery Loop collection box. ${noteEn}. Programme ended May 2026.`
    : "Battery Loop collection box — single-use & rechargeable batteries (programme ended May 2026).";
  const contactTc = noteTc
    ? `回芯轉意電池收集箱。${noteTc}。活動已於2026年5月結束。`
    : "回芯轉意電池收集箱 — 接受一次性及充電池（活動已於2026年5月結束）。";
  return {
    cp_id: id,
    cp_state: "Ended",
    district_id: district,
    address_en: nameEn,
    address2_en: addressEn,
    address_tc: nameTc,
    address2_tc: addressTc,
    address_sc: null,
    address2_sc: null,
    lat,
    lng,
    waste_type: WASTE_TYPE,
    legend: "Battery Loop 回芯轉意 — battery collection box (ended May 2026)",
    accessibilty_notes: null,
    contact_en: contactEn,
    contact_tc: contactTc,
    contact_sc: null,
    openhour_en: "Collection ended 31 May 2026",
    openhour_tc: "收集期已於2026年5月31日結束",
    openhour_sc: null,
    campaign_source: CAMPAIGN_ID,
    campaign_url: MAP_URL,
    is_short_term: false,
  };
}

export const BATTERY_LOOP_POINTS: RecyclingCollectionPoint[] = [
  buildPoint("battery-loop-grand-century-place-concierge-of-tower-2","Yau_Tsim_Mong","Grand Century Place (Concierge of Tower 2)","","新世紀廣場 (辦公大樓二座禮賓司)","","","",22.3229031,114.1725864),
  buildPoint("battery-loop-plaza-hollywood-1-f-customer-care-centre","Wong_Tai_Sin","Plaza Hollywood (1/F Customer Care Centre)","","荷里活廣場 (一樓客戶服務中心)","","","",22.3405646,114.2020117),
  buildPoint("battery-loop-cheung-wah-shopping-centre","North","Cheung Wah Shopping Centre","","祥華商場","","","",22.4932658,114.1403668),
  buildPoint("battery-loop-fu-shin-shopping-centre","Tai_Po","Fu Shin Shopping Centre","","富善商場","","","",22.454126,114.1747214),
  buildPoint("battery-loop-tai-wo-plaza","Tai_Po","太和廣場 Tai Wo Plaza","","太和廣場 Tai Wo Plaza","","","",22.4514269,114.1616803),
  buildPoint("battery-loop-chung-on-shopping-centre","Sha_Tin","Chung On Shopping Centre","","頌安商場","","","",22.421895,114.2267511),
  buildPoint("battery-loop-yu-chui-shopping-centre","Sha_Tin","Yu Chui Shopping Centre","","愉翠商場","","","",22.3821425,114.2051621),
  buildPoint("battery-loop-wo-che-plaza","Sha_Tin","Wo Che Plaza","","禾輋廣場","","","",22.3879278,114.1951855),
  buildPoint("battery-loop-lek-yuen-plaza","Sha_Tin","Lek Yuen Plaza","","瀝源廣場","","","",22.3845673,114.1912338),
  buildPoint("battery-loop-mei-lam-commercial-centre","Sha_Tin","Mei Lam Commercial Centre","","美林商場","","","",22.3780697,114.1761461),
  buildPoint("battery-loop-stk-eco-eight-recycling-ecotourism-education-center","North","「環」遊八角回收及生態旅遊教育中心 STK Eco Eight Recycling & Ecotourism Education Center","新界沙頭角順興街49號沙頭角邨第20座地下2A及2B號 Shop No. 2A & 2B, Ground Floor, Block 20, Sha Tau Kok Chuen, 49 Shun Hing Street, Sha Tau Kok, New Territories","「環」遊八角回收及生態旅遊教育中心 STK Eco Eight Recycling & Ecotourism Education Center","新界沙頭角順興街49號沙頭角邨第20座地下2A及2B號 Shop No. 2A & 2B, Ground Floor, Block 20, Sha Tau Kok Chuen, 49 Shun Hing Street, Sha Tau Kok, New Territories","新界沙頭角順興街49號沙頭角邨第20座地下2A及2B號 Shop No. 2A & 2B, Ground Floor, Block 20, Sha Tau Kok Chuen, 49 Shun Hing Street, Sha Tau Kok, New Territories","新界沙頭角順興街49號沙頭角邨第20座地下2A及2B號 Shop No. 2A & 2B, Ground Floor, Block 20, Sha Tau Kok Chuen, 49 Shun Hing Street, Sha Tau Kok, New Territories",22.5461286,114.224224),
  buildPoint("battery-loop-g-f-hong-kong-red-cross-headquarters","Yau_Tsim_Mong","G/F, Hong Kong Red Cross Headquarters","西九龍海庭道19號 19 Hoi Ting Road, West Kowloon","香港紅十字會總部地下","西九龍海庭道19號 19 Hoi Ting Road, West Kowloon","西九龍海庭道19號 19 Hoi Ting Road, West Kowloon","西九龍海庭道19號 19 Hoi Ting Road, West Kowloon",22.3146182,114.1623487),
  buildPoint("battery-loop-hong-kong-baptist-university-harmony-cafeteria","Sham_Shui_Po","香港浸會大學 (衡軒餐廳) Hong Kong Baptist University (Harmony Cafeteria)","","香港浸會大學 (衡軒餐廳) Hong Kong Baptist University (Harmony Cafeteria)","","","",22.3411786,114.1799761),
  buildPoint("battery-loop-hong-kong-baptist-university-li-promenade-opposite-to-securi","Sham_Shui_Po","香港浸會大學 (李作權大道 - 保安控制室對出) Hong Kong Baptist University (Li Promenade - Opposite to Security Control Room)","","香港浸會大學 (李作權大道 - 保安控制室對出) Hong Kong Baptist University (Li Promenade - Opposite to Security Control Room)","","","",22.3377033,114.1820208),
  buildPoint("battery-loop-green-corner-hong-kong-baptist-university-jcacc-green-corner","Sham_Shui_Po","香港浸會大學 (賽馬會師生活動中心 Green Corner) Hong Kong Baptist University (JCACC Green Corner)","","香港浸會大學 (賽馬會師生活動中心 Green Corner) Hong Kong Baptist University (JCACC Green Corner)","","","",22.3362213,114.1826548),
  buildPoint("battery-loop-egaoco-egaoco-eco-friendly-select-shop","Kwun_Tong","Egaoco 地球友善選物店 Egaoco Eco Friendly Select Shop","","Egaoco 地球友善選物店 Egaoco Eco Friendly Select Shop","","Password: 3647","密碼：3647",22.3120109,114.223668),
  buildPoint("battery-loop-9-f-office-hong-kong-red-cross","Yau_Tsim_Mong","9/F Office, Hong Kong Red Cross","","香港紅十字會總部9樓辦公室","","Internal personnel only","只供內部人員投放",22.3147148,114.1625072),
  buildPoint("battery-loop-hong-kong-red-cross-youth-development-service-divisional-hea","Wan_Chai","香港紅十字會 - 青年發展服務分區總部港島總部 Hong Kong Red Cross - Youth Development Service Divisional Headquarters (Hong Kong Island Divisional Headquarters)","","香港紅十字會 - 青年發展服務分區總部港島總部 Hong Kong Red Cross - Youth Development Service Divisional Headquarters (Hong Kong Island Divisional Headquarters)","","Internal personnel only","只供內部人員投放",22.2772515,114.172755),
  buildPoint("battery-loop-hong-kong-red-cross-youth-development-service-divisional-hea-2","Kwun_Tong","香港紅十字會 - 青年發展服務分區總部東九龍活動中心 Hong Kong Red Cross - Youth Development Service Divisional Headquarters (East Kowloon Activity Centre)","","香港紅十字會 - 青年發展服務分區總部東九龍活動中心 Hong Kong Red Cross - Youth Development Service Divisional Headquarters (East Kowloon Activity Centre)","","Internal personnel only","只供內部人員投放",22.3109291,114.2263731),
  buildPoint("battery-loop-hong-kong-red-cross-youth-development-service-divisional-hea-3","Sha_Tin","香港紅十字會 - 青年發展服務分區總部 (新界東總部) Hong Kong Red Cross - Youth Development Service Divisional Headquarters (East New Territories Divisional Headquarters)","","香港紅十字會 - 青年發展服務分區總部 (新界東總部) Hong Kong Red Cross - Youth Development Service Divisional Headquarters (East New Territories Divisional Headquarters)","","Internal personnel only","只供內部人員投放",22.3788941,114.1865189),
  buildPoint("battery-loop-hong-kong-red-cross-youth-development-service-divisional-hea-4","Tsuen_Wan","香港紅十字會 - 青年發展服務分區總部 (新界西總部) Hong Kong Red Cross - Youth Development Service Divisional Headquarters (West New Territories Divisional Headquarters)","","香港紅十字會 - 青年發展服務分區總部 (新界西總部) Hong Kong Red Cross - Youth Development Service Divisional Headquarters (West New Territories Divisional Headquarters)","","Internal personnel only","只供內部人員投放",22.3692809,114.1253338),
  buildPoint("battery-loop-hong-kong-baptist-university-fsc-learning-commons","Sham_Shui_Po","香港浸會大學 (方樹泉圖書館 學習共享空間) Hong Kong Baptist University (FSC Learning Commons)","","香港浸會大學 (方樹泉圖書館 學習共享空間) Hong Kong Baptist University (FSC Learning Commons)","","Internal personnel only","只供內部人員投放",22.340316,114.180022),
  buildPoint("battery-loop-hong-kong-baptist-university-aab-learning-commons-our-zone","Sham_Shui_Po","Hong Kong Baptist University (AAB Learning Commons - Our Zone)","","香港浸會大學 (教學及行政大樓 學習共享空間－匯言)","","Internal personnel only","只供內部人員投放",22.336551,114.182282),
  buildPoint("battery-loop-grand-view-garden","Wong_Tai_Sin","宏景花園 Grand View Garden","","宏景花園 Grand View Garden","","Internal personnel only","只供內部人員投放",22.3411704,114.2080904),
  buildPoint("battery-loop-the-arch","Yau_Tsim_Mong","凱旋門 The Arch","","凱旋門 The Arch","","Internal personnel only","只供內部人員投放",22.3031887,114.1632431),
  buildPoint("battery-loop-po-leung-kuk-lee-shau-kee-youth-oasis","Yuen_Long","保良局李兆基青年綠洲 Po Leung Kuk Lee Shau Kee Youth Oasis","","保良局李兆基青年綠洲 Po Leung Kuk Lee Shau Kee Youth Oasis","","","",22.4372202,114.0272049),
];
