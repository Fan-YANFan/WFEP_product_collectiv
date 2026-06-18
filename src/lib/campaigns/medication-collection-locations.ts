import type { RecyclingCollectionPoint } from "@/lib/csdi/types";

const MEDICATION_WASTE_TYPE = "Medication";

const MEDICATION_COLLECTION_CAMPAIGN = {
  id: "greeners-action-medication-collection-2026",
  pointsFolderUrl: "https://drive.google.com/drive/folders/1-H6jPggG-PY72CrSZufVKFN_mhsWwAwf",
} as const;

function buildPoint(
  id: string,
  district: string,
  nameEn: string,
  addressEn: string,
  nameTc: string,
  addressTc: string,
  noteEn: string,
  noteTc: string,
  lat: number,
  lng: number,
): RecyclingCollectionPoint {
  const contactEn = noteEn
    ? `Greeners Action medicine collection box. ${noteEn}. Opening hours vary by venue.`
    : "Greeners Action medicine collection box. Opening hours vary by venue.";
  const contactTc = noteTc
    ? `綠領行動藥餘收集箱。${noteTc}。營業時間視乎個別機構而定。`
    : "綠領行動藥餘收集箱。營業時間視乎個別機構而定。";
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
    waste_type: MEDICATION_WASTE_TYPE,
    legend: "Medicine Collection Program 2026 — Greeners Action collection box (programme ended)",
    accessibilty_notes: null,
    contact_en: contactEn,
    contact_tc: contactTc,
    contact_sc: null,
    openhour_en: "Opening hours vary by venue — see official collection point list",
    openhour_tc: "營業時間視乎個別機構而定，請参阅官方收集點列表",
    openhour_sc: null,
    campaign_source: MEDICATION_COLLECTION_CAMPAIGN.id,
    campaign_url: MEDICATION_COLLECTION_CAMPAIGN.pointsFolderUrl,
    is_short_term: false,
  };
}

export const MEDICATION_COLLECTION_POINTS: RecyclingCollectionPoint[] = [
  buildPoint("med-kennedy-38","Central_Western","Kennedy 38","Club House, Kennedy 38, 1A Rock Hill Street, Kennedy Town","Kennedy 38","香港堅尼地城石山街1號A Kennedy 38 會所","Residents only","只限住戶",22.2825,114.127),
  buildPoint("med-chi-fu-fa-yuen","Southern","Chi Fu Fa Yuen","24-hours Operations Centre Office, Tower 9, Chi Fu Fa Yuen, 1-20 Chi Fu Road, Pok Fu Lam","置富花園","香港薄扶林置富道1-20號置富花園第9座服務處24小時行動組中心","Residents only","只限住戶",22.255,114.136),
  buildPoint("med-new-jade-gardens","Eastern","New Jade Gardens","Customer Service Centre, Podium, Block 1, New Jade Garden, 233 Chai Wan Road, Chai Wan","新翠花園","香港柴灣道233號新翠花園第一座平台客戶服務處","Residents only","只限住戶",22.264,114.237),
  buildPoint("med-grand-century-place","Yau_Tsim_Mong","Grand Century Place","Concierge, Grand Century Place, 193 Prince Edward Road West, Mong Kok","新世紀廣場（辦公大樓）","旺角太子道西193號新世紀廣場禮賓部","","",22.3235,114.1705),
  buildPoint("med-icc","Yau_Tsim_Mong","International Commerce Centre","Concierge, International Commerce Centre, 1 Austin Road West, West Kowloon","環球貿易廣場","柯士甸道西1號環球貿易廣場禮賓部","Tenants only","只限租戶",22.303,114.1615),
  buildPoint("med-igc","Yau_Tsim_Mong","International Gateway Centre","Concierge, International Gateway Centre, 1 Wui Man Road, West Kowloon","International Gateway Centre","九龍匯民道1號International Gateway Centre禮賓部","Tenants only","只限租戶",22.3045,114.1635),
  buildPoint("med-argyle-centre","Yau_Tsim_Mong","Argyle Centre Phase I","Unit 1612-12A, Argyle Centre Phase I, 688 Nathan Road, Mongkok","旺角中心第一座","旺角彌敦道688號旺角中心第一座管理處1612-12A室","Mon–Fri 9 AM–1 PM & 2–6 PM; Sat 9 AM–1 PM. Tenants only","星期一至五上午9時至下午1時及下午2時至6時；星期六上午9時至下午1時。只限租戶",22.318,114.17),
  buildPoint("med-hk-pacific-centre","Yau_Tsim_Mong","HK Pacific Centre","Lobby Reception, G/F, HK Pacific Centre, 28 Hankow Road, Tsim Sha Tsui","亞太中心","尖沙咀漢口道28號亞太中心地下大堂接待處","Tenants only","只限租戶",22.2975,114.172),
  buildPoint("med-v-walk","Sham_Shui_Po","V Walk","2/F Customer Care Centre, V Walk, 28 Sham Mong Road, Sham Shui Po","V Walk","深水埗深旺道28號V Walk二樓客戶服務中心","","",22.332,114.1495),
  buildPoint("med-ultima","Kowloon_City","Ultima","Control Room, Ultima, 23 Fat Kwong Street, Ho Man Tin","天鑄","何文田佛光街23號天鑄控制室","Residents only","只限住戶",22.312,114.183),
  buildPoint("med-mantin-heights","Kowloon_City","Mantin Heights","The Club Mantin 1 Reception, Mantin Heights, 28 Sheung Shing Street, Ho Man Tin","皓畋","九龍何文田常盛街28號皓畋會所（一）接待處","Residents only","只限住戶",22.3105,114.186),
  buildPoint("med-millennium-city-1","Kwun_Tong","Millennium City 1, 2, 3 & 6","Concierge, Millennium City 1, 388 Kwun Tong Road, Kwun Tong","創紀之城一期、二期、三期、六期","觀塘觀塘道388號創紀之城一期一座客戶服務中心","","",22.3125,114.225),
  buildPoint("med-millennium-city-5","Kwun_Tong","Millennium City 5 & apm","Concierge, Millennium City 5, 418 Kwun Tong Road, Kwun Tong","創紀之城五期及apm","九龍觀塘觀塘道418號創紀之城五期客戶服務中心","","",22.312,114.2265),
  buildPoint("med-one-harbour-square","Kwun_Tong","One Harbour Square","Concierge, One Harbour Square, 181 Hoi Bun Road, Kwun Tong","One Harbour Square","觀塘海濱道181號One Harbour Square 禮賓部","Tenants only","只限租戶",22.308,114.218),
  buildPoint("med-two-harbour-square","Kwun_Tong","Two Harbour Square","Concierge, Two Harbour Square, 180 Wai Yip Street, Kwun Tong","Two Harbour Square","觀塘偉業街180號Two Harbour Square 禮賓部","Tenants only","只限租戶",22.3095,114.222),
  buildPoint("med-new-town-plaza","Sha_Tin","New Town Plaza","L4 Concierge, New Town Plaza, 18 Sha Tin Centre Street, Sha Tin","新城市廣場","沙田沙田正街18號新城市廣場四樓顧客服務中心","","",22.381,114.1885),
  buildPoint("med-homesquare","Sha_Tin","Grand Central Plaza / HomeSquare","L1 Customer Care Centre, HomeSquare, 138 Sha Tin Rural Committee Road, Sha Tin","新城市中央廣場 / HomeSquare","新界沙田鄉事會路138號HomeSquare一樓顧客服務中心","","",22.385,114.191),
  buildPoint("med-shatin-plaza","Sha_Tin","Shatin Plaza","L3 Concierge, Shatin Plaza, 21-27 Shatin Centre Street, Sha Tin","沙田廣場","沙田正街21-27號沙田廣場L3禮賓部","","",22.383,114.187),
  buildPoint("med-villa-athena","Sha_Tin","Villa Athena","Clubhouse, Villa Athena, 600 Sai Sha Road, Ma On Shan","雅典居","馬鞍山西沙路600號雅典居會所","Residents only","只限住戶",22.426,114.243),
  buildPoint("med-east-point-commercial","Sai_Kung","East Point City (Commercial)","2/F Customer Care Centre, East Point City (Commercial), 8 Chung Wa Road, Tseung Kwan O","東港城（商場）","將軍澳重華路8號東港城（商場）二樓顧客服務中心","","",22.3165,114.264),
  buildPoint("med-east-point-residential","Sai_Kung","East Point City (Residential)","Clubhouse, East Point City (Residential), 8 Chung Wa Road, Tseung Kwan O","東港城（住宅）","將軍澳重華路8號東港城（住宅）會所","Residents only","只限住戶",22.316,114.2645),
  buildPoint("med-wings-ii","Sai_Kung","The Wings II","Clubhouse, The Wings II, 12 Tong Chun Street, Tseung Kwan O","天晉II","將軍澳唐俊街12號天晉II會所","Residents only","只限住戶",22.304,114.2595),
  buildPoint("med-oscar-by-the-sea","Sai_Kung","Oscar By The Sea","Customer Service Office, Oscar By The Sea, 8 Pung Loi Road, Tseung Kwan O","清水灣半島","將軍澳蓬萊路8號清水灣半島客戶服務處","Residents only","只限住戶",22.318,114.27),
  buildPoint("med-kowloon-commerce-centre","Kwai_Tsing","Kowloon Commerce Centre","2/F Concierge, Tower 2, Kowloon Commerce Centre, 51 Kwai Cheong Road, Kwai Chung","九龍貿易中心","葵涌葵昌路51號九龍貿易中心二樓二座禮賓部","","",22.3695,114.1345),
  buildPoint("med-metroplaza","Kwai_Tsing","Metroplaza","Concierge, Metroplaza Tower 2, 223 Hing Fong Road, Kwai Fong","新都會廣場","葵芳興芳路223號新都會廣場2座辦公大樓禮賓部","","",22.3575,114.1275),
  buildPoint("med-grand-horizon","Kwai_Tsing","Grand Horizon","Clubhouse, Grand Horizon, 11 Cheung Wan Street, Tsing Yi","海欣花園","青衣長環街11號海欣花園會所","Residents only","只限住戶",22.345,114.108),
  buildPoint("med-mount-haven","Kwai_Tsing","Mount Haven","Club Mount Haven, Mount Haven, 3 Liu To Road, Tsing Yi","曉峰園","青衣寮肚路3號曉峰園平台會所","Residents only","只限住戶",22.3485,114.102),
  buildPoint("med-park-island","Tsuen_Wan","Park Island","Control Room, Park Island, 8 Pak Lai Road, Ma Wan, Tsuen Wan","珀麗灣","香港新界荃灣區馬灣珀麗路8號珀麗灣控制室","Residents only","只限住戶",22.348,114.06),
  buildPoint("med-tsuen-wan-plaza","Tsuen_Wan","Tsuen Wan Plaza","L3 Customer Care Centre, Tsuen Wan Plaza, 4-30 Tai Pa Street, Tsuen Wan","荃灣廣場","新界荃灣4-30大壩街荃灣廣場3樓顧客服務中心","","",22.3705,114.1145),
  buildPoint("med-kolour-tsuen-wan","Tsuen_Wan","Kolour Tsuen Wan I","1/F Concierge, Kolour Tsuen Wan I, 68 Chung On Street, Tsuen Wan","荃灣千色匯I期","荃灣眾安街68號荃灣千色匯I期1/F禮賓部","","",22.369,114.117),
  buildPoint("med-yoho-midtown","Yuen_Long","Yoho Midtown","Control Room, Yoho Midtown, 9 Yuen Lung Street, Yuen Long","新時代中城","元朗元龍街9號新時代中城控制室","Residents only","只限住戶",22.445,114.031),
  buildPoint("med-yoho-town","Yuen_Long","YOHO Town","Clubhouse, YOHO Town, 8 Yuen Lung Street, Yuen Long","新時代廣場","元朗元龍街8號新時代廣場會所大堂","Residents only","只限住戶",22.4455,114.032),
  buildPoint("med-sun-yuen-long-centre","Yuen_Long","Sun Yuen Long Centre","Lobby, Sun Yuen Long Centre, 8 Long Yat Road, Yuen Long","新元朗中心","元朗朗日路8號新元朗中心地下大堂","Residents only","只限住戶",22.444,114.028),
  buildPoint("med-kolour-yuen-long","Yuen_Long","Kolour Yuen Long","G/F Concierge, 1 Kau Yuk Road, Kolour Yuen Long, Yuen Long","元朗千色匯","元朗教育路1號元朗千色匯G/F 禮賓部","","",22.4445,114.035),
  buildPoint("med-villa-by-the-park","Yuen_Long","Villa By The Park","Reception, Clubhouse, Villa By The Park, 139 Castle Peak Road - Ping Shan, Yuen Long","朗庭園","元朗青山公路屏山段139號朗庭園會所前台","Residents only","只限住戶",22.437,114.01),
  buildPoint("med-royal-palms","Yuen_Long","Royal Palms","Club Mirage, Royal Palms, Wo Shang Wai, Yuen Long","加州豪園","元朗和生圍加州豪園住客會所地下","Residents only","只限住戶",22.432,114.02),
  buildPoint("med-la-grove","Yuen_Long","La Grove","Lobby, Clubhouse, La Grove, 83 Shap Pat Heung Road, Yuen Long","原築","元朗十八鄉路83號原築會所地下大堂","Residents only","只限住戶",22.428,114.038),
  buildPoint("med-the-vineyard","Yuen_Long","The Vineyard","Clubhouse, The Vineyard, 23 Ngau Tam Mei Road, Yuen Long","葡萄園","元朗牛潭尾路23號葡萄園會所","Residents only","只限住戶",22.425,114.045),
  buildPoint("med-park-yoho","Yuen_Long","Park Yoho","Club Como Reception (Phase 1 Clubhouse), Park Yoho, 18 Castle Peak Road - Tam Mi, Kam Tin North, Yuen Long","Park Yoho","新界錦田沙埔青山公路潭尾段18號Park Yoho Club Como接待處（一期會所）","Residents only","只限住戶",22.452,114.062),
  buildPoint("med-yoho-west","Yuen_Long","YOHO WEST","Management Office, YOHO WEST, 1 Tin Yan Road, Tin Shui Wai","YOHO WEST","新界天水圍天恩路1號YOHO WEST管理處","Residents only","只限住戶",22.458,114.002),
  buildPoint("med-v-city","Tuen_Mun","V city","Customer Care Centre, MTR Floor, 83 Heung Sze Wui Road, Tuen Mun","V city","屯門鄉事會路83號V city MTR層顧客服務中心","","",22.3955,113.9745),
  buildPoint("med-chelsea-heights","Tuen_Mun","Chelsea Heights","P/F Clubhouse, Phase 1, Chelsea Heights, 1 Shek Pai Tau Path, Tuen Mun","卓爾居","屯門北石排頭徑1號一期會所P層","Residents only","只限住戶",22.402,113.976),
  buildPoint("med-blossom-garden","Tuen_Mun","Blossom Garden","Control Room, Blossom Garden, 11 Leung Tak Street, Tuen Mun","寶怡花園","屯門良德街11號寶怡花園控制室","Residents only","只限住戶",22.391,113.978),
  buildPoint("med-novo-land","Tuen_Mun","NOVO LAND","Reception, Poolside Club, NOVO LAND, 8 Yan Po Road, Tuen Mun","NOVO LAND","屯門欣寶路8號NOVO LAND Poolside Club 接待處","Residents only","只限住戶",22.408,113.965),
  buildPoint("med-avignon","Tuen_Mun","Avignon","Reception, Clubhouse, Avignon, 1 Kwun Chui Road, So Kwun Wat, Tuen Mun","星堤","屯門掃管笏管翠路1號星堤會所接待處","Residents only","只限住戶",22.385,113.955),
  buildPoint("med-grand-pacific","Tuen_Mun","Grand Pacific Heights / Views","Clubhouse, Grand Pacific Heights / Views, 400 Castle Peak Road - Tai Lam, Siu Lam, Tuen Mun","浪/海琴軒","新界屯門青山公路大欖桶400地段康輝路浪/海琴軒會所","Residents only","只限住戶",22.358,113.988),
];
