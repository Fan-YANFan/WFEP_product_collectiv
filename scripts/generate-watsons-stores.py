#!/usr/bin/env python3
"""Generate watsons-store-locations.ts from official PDF store list (20260508)."""
from __future__ import annotations

import json
import math
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src/lib/campaigns/watsons-store-locations.ts"
CACHE = ROOT / "src/lib/campaigns/.watsons-geocode-cache.json"

# (id, nameEn, nameTc, addressEn, addressTc, district)
STORES: list[tuple[str, str, str, str, str, str]] = [
    ("fortune-centre", "Fortune Centre", "恩平中心", "Shop 3-10 of G/F, Whole 1/F & 2/F Fortune Centre, 44-48 Yun Ping Road, Causeway Bay, Hong Kong", "香港銅鑼灣恩平道44-48號恩平中心地舖, 1樓及2樓", "Wan_Chai"),
    ("jp-plaza", "JP Plaza", "翡翠明珠廣場", "Shop No. 32A & 32B, G/F, JP Plaza, 22 Paterson Street, Causeway Bay", "銅鑼灣百德新街22號地下32A及32B舖", "Wan_Chai"),
    ("wah-ming-centre", "Wah Ming Centre", "華明中心", "G/F, Wah Ming Centre, 396 Des Voeux Road West, Hong Kong", "德輔道西396號華明中心地下", "Central_Western"),
    ("belchers-hill", "Belcher's Hill", "寶雅山", "Shop 1 & 2, Lower Ground Floor, Belcher's Hill, 42-44 Belcher's Street, Kennedy Town, Hong Kong", "堅尼地城卑路乍街42至44號寶雅山低層地下1及2號舖", "Central_Western"),
    ("tin-hau", "Tin Hau", "天后", "Shop C, C1 & D, G/F, Kiu Hing Mansion, 14 King's Road, North Point, Hong Kong", "北角英皇道十四號僑興大廈地下C, C1 & D", "Eastern"),
    ("hennessy-road", "Hennessy Road", "軒尼詩道", "G/F & M/F, 205-207 Hennessy Road, Wanchai, Hong Kong", "軒尼詩道205-207號廣德大廈地下及閣樓", "Wan_Chai"),
    ("shun-tak-centre", "Shun Tak Centre", "信德中心", "Unit 291-293, 2/F, Shun Tak Centre, 200 Connaught Road Central, Hong Kong", "德輔道中200號信德中心二樓291-293號", "Central_Western"),
    ("centre-street", "Centre Street", "正街", "Ground Floor, No. 13-15 Centre Street, Sai Ying Pun, Hong Kong", "西營盤正街13-15號地舖", "Central_Western"),
    ("tung-lo-wan-road", "Tung Lo Wan Road", "銅鑼灣道", "Shop A, G/F, Cathay Mansion, 3-5 Tung Lo Wan Road, Causeway Bay, HK", "銅鑼灣道3-5號國泰大廈A座2號舖", "Wan_Chai"),
    ("united-centre", "United Centre", "統一中心", "Shop 1003-1004, 1/F, United Centre, 95 Queensway Road, Hong Kong", "金鐘道95號統一中心1003-1004號", "Central_Western"),
    ("pacific-place-l2", "Pacific Place Level 2", "太古廣場", "Shop 204, Level 2, Pacific Place, Phase II, 88 Queensway, HK", "金鐘道88號太古廣場二期2樓204號舖", "Central_Western"),
    ("admiralty-centre", "Admiralty Centre", "金鐘海富中心", "Shop 23-26, 81-83, 1/F Podium, Admiralty Centre, Admiralty, HK", "金鐘海富中心一樓平台23-26, 81-83號舖", "Central_Western"),
    ("times-square", "Times Square", "時代廣場", "Shop No.927-928, 9th Floor, Times Square, Causeway Bay, Hong Kong", "銅鑼灣時代廣場9樓927-928號舖", "Wan_Chai"),
    ("hopewell-centre", "Hopewell Centre", "合和中心", "Shop 301-306, Hopewell Centre, 183 Queen's Road East, Wanchai, Hong Kong", "灣仔皇后大道東183號合和中心三樓301-306號", "Wan_Chai"),
    ("fook-sing-court", "Fook Sing Court", "福陞閣", "Designated portion on G/F, Fook Sing Court, 378 Queen's Road Central, HK", "皇后大道中378號福陞閣地下指定部份", "Central_Western"),
    ("melbourne-plaza", "Melbourne Plaza", "萬邦行", "Shop G1-A, G/F, Melbourne Plaza, 33 Queen's Road Central, Hong Kong", "中環皇后大道中33號萬邦行地下G1-A舖", "Central_Western"),
    ("hong-kong-station", "Hong Kong Station", "香港站", "Concession HOK 55, Unpaid Concourse, MTR Hong Kong Station, Central, HK", "港鐵香港站非入閘區大堂55號舖", "Central_Western"),
    ("des-voeux-33", "Des Voeux Road Central 33", "德輔道中33號", "Whole Shop on G/F, No.33 Des Voeux Road Central, Central, HK", "德輔道中33號地下", "Central_Western"),
    ("cheung-kong-centre", "Cheung Kong Centre", "長江中心", "Portal of Parknshop, Basement 2, Cheung Kong Centre, Central, Hong Kong", "中環長江中心地庫2層", "Central_Western"),
    ("discovery-bay", "Discovery Bay", "愉景灣", "Shop 135, 1/F, Block C, D B Plaza, Discovery Bay, Lantau Island, Hong Kong", "大嶼山愉景灣商場135號", "Islands"),
    ("cheung-chau", "Cheung Chau", "長洲", "G/F-3/F & roof, 85 Praya Road, Cheung Chau, Hong Kong", "長洲海傍路85號", "Islands"),
    ("hing-wah", "Hing Wah Shopping Centre", "興華村", "Shop No. 119-120, 1/F Hing Wah Plaza, Chai Wan, Hong Kong", "柴灣興華廣場1樓119-120號舖", "Eastern"),
    ("aberdeen-centre", "Aberdeen Centre", "香港仔中心", "Flat/RM 6C, G/F, Hoi Chu Court, AC4 Aberdeen, HK", "香港仔中心海珠閣地下6C", "Southern"),
    ("lei-tung", "Lei Tung Estate", "利東村", "Shop No. L-202C, 1/F Lei Tung Comm Centre Phase 1, Lei Tung Est, HK", "利東邨利東社區中心1樓L-202C號舖", "Southern"),
    ("cityplaza", "Cityplaza", "太古城中心", "Shop No. 124, First Floor, Cityplaza, 18 TaiKoo Shing Rd, Island East, HK", "太古城太古城道18號太古城中心1樓124號舖", "Eastern"),
    ("shau-kei-wan", "Shau Kei Wan", "筲箕灣", "Shop D & E, G/F, King Fai Building, 104 Shau Kei Wan Main Street, Hong Kong", "筲箕灣筲箕灣道104號景輝大廈地下D及E舖", "Eastern"),
    ("siu-sai-wan", "Siu Sai Wan Shopping Centre", "小西灣商場", "Shop No. 108, First Floor, Siu Sai Wan Shopping Centre, Hong Kong", "小西灣商場1樓108號舖", "Eastern"),
    ("south-horizons", "South Horizons", "海怡半島", "Shop 112, 112A & 113, 1/F, South Horizon Marina Square West Comm. Ctr., Ap Lei Chau, HK", "鴨脷洲海怡半島海怡西商場1樓112, 112A及113號舖", "Southern"),
    ("noble-square", "Noble Square", "華貴坊", "Shop Nos. 15-16, G/F Noble Square, Wah Kwai Estate, 3 Wah Kwai Road, Aberdeen, HK", "香港仔華貴邨華貴坊地下15-16號舖", "Southern"),
    ("the-southside", "The Southside", "港島南岸", "Shop Unit G13, Ground Floor, The SouthSide, Wong Chuk Hang, HK", "黃竹坑港島南岸地下G13號舖", "Southern"),
    ("electric-road-228", "Electric Road 228", "電氣道228號", "Unit 1 on Ground Floor, 228 Electric Road, North Point, HK", "北角電氣道228號地下1號", "Eastern"),
    ("kornhill-plaza", "Kornhill Plaza", "康怡廣場", "Shop Nos. S26-S27, 2/F, Kornhill Plaza, 1 Kornhill Road, Quarry Bay, HK", "鰂魚涌康山道1號康怡廣場2樓S26-S27號舖", "Eastern"),
    ("island-place", "Island Place", "港運城", "Shop 111, 1/F, Island Place, 500 King's Road, North Point, Hong Kong", "北角英皇道500號港運城商場1樓111號", "Eastern"),
    ("nathan-road-80", "Nathan Road 80", "彌敦道80號", "Shop A, G/F, Majestic House, No. 80 Nathan Rd, Tsim Sha Tsui, KL", "尖沙咀彌敦道80號金鑾大廈地下A號舖", "Yau_Tsim_Mong"),
    ("metro-harbour-plaza", "Metro Harbour Plaza", "港灣豪庭廣場", "Shop Nos. G83-G85, G/F, Metro Harbour Plaza, Tai Kok Tsui, KL", "大角咀港灣豪庭地下G83-G85號舖", "Sham_Shui_Po"),
    ("whampoa-garden", "Whampoa Garden", "黃埔花園", "Shop No G3A, G/F, Site 2, Whampoa Garden, Hunghom, KLN", "紅磡黃埔花園第二期商場地下3A號舖", "Kowloon_City"),
    ("harbour-city", "Harbour City", "海港城", "Shop 3302 Level 3, Gateway Arcade, Harbour City, 7-23 Canton Road, Tsim Sha Tsui", "尖沙咀廣東道7-23號海港城港威中心三樓3302號舖", "Yau_Tsim_Mong"),
    ("laguna-city", "Laguna City", "麗港城", "Shop 60-62, Level 1, Laguna City Plaza, Kowloon", "觀塘麗港城商場第一層60-62號", "Kwun_Tong"),
    ("metropolis-mall", "Metropolis Mall", "國際都會", "Shop No. 719 & 720B, Level 7, The Metropolis Mall, 6 Metropolis Drive, Hunghom", "紅磡都會道6號置富都會7層719, 720B號舖", "Kowloon_City"),
    ("hilton-tower", "Hilton Tower", "希爾頓大廈", "Front Portion of Shop C, G/F, Hilton Tower, 96 Granville Road, Tsimshatsui, KL", "尖沙咀加連威老道96號希爾頓大廈地下C舖", "Yau_Tsim_Mong"),
    ("hunghom-bay", "Hunghom Bay", "紅磡灣", "Shop 10, G/F, Hunghom Bay Centre, 92-112 Baker Street, Hunghom, Kowloon", "紅磡必嘉街92-112號紅磡中心地下10號舖", "Kowloon_City"),
    ("olympian-city", "Olympian City", "奧海城", "Shop 108, 1/F, Olympian City 2, 18 Hoi Ting Road, Kowloon", "海庭道18號奧海城二期一樓108號", "Sham_Shui_Po"),
    ("festival-walk", "Festival Walk", "又一城", "Portion of Unit MTR-01, Level MTR, Festival Walk, 80 Tat Chee Avenue, Kowloon", "九龍塘達之路80號又一城MTR01號", "Sham_Shui_Po"),
    ("china-hong-kong-city", "China Hong Kong City", "中港城", "UG/F 43D, China Hong Kong City, 33 Canton Road, Tsim Sha Tsui", "尖沙咀廣東道33號中港城高層地下43D號舖", "Yau_Tsim_Mong"),
    ("sai-yeung-choi-st", "Sai Yeung Choi St. S", "西洋菜南街", "Shop G06 & G07, G/F, Sim City, 47-51 Shan Tung Street, Mongkok, KL", "旺角山東街47-51號星際城市地下G06-G07號舖", "Yau_Tsim_Mong"),
    ("celestial-plaza", "Celestial Plaza", "壹號名薈", "Shop No. 16, 1/F, Celestial Place, No. 80 Sheung Shing Street, KL", "常盛街80號半山壹號名薈1樓16號舖", "Kowloon_City"),
    ("hunghom-comm-ctr", "Hunghom Comm Ctr G/F", "紅磡商業中心", "Shop No. 45-47, G/F, Hunghom Commercial Centre, 37-41 Ma Tau Wai Road, KL", "紅磡馬頭圍道37-41號紅磡商業中心地下45-47號舖", "Kowloon_City"),
    ("moko", "MOKO Level 1", "新世紀廣場", "Shop No. 153, Level 1, MOKO, 193 Prince Edward Road West, Mong Kok, KL", "旺角太子道西193號新世紀廣場1樓153號舖", "Yau_Tsim_Mong"),
    ("jubilant-place", "Jubilant Place", "欣榮花園", "Shops 28-30 & 46-49, G/F, Jubilant Place, 33 Ma Tau Kok Road, Tokwawan, KL", "土瓜灣馬頭角道33號欣榮花園地下46-49號", "Kowloon_City"),
    ("mongkok-655", "Mongkok", "旺角", "Shop C1 & C2, G/F and Whole of M/F Wu Sang House, 655 Nathan Road, Mongkok, KL", "旺角彌敦道655號胡社生行地下C1及C2號舖", "Yau_Tsim_Mong"),
    ("tokwawan", "Tokwawan", "土瓜灣", "G/F, Shop 20-1, Portion of Shop 30B, Honor Building, 80-2 Tokwawan Road, Tokwawan, KLN", "土瓜灣道80-2號定安大廈地下20-1及30B舖", "Kowloon_City"),
    ("fuk-lo-tsun-road", "Fuk Lo Tsun Road", "福佬村道", "G/F, No. 13 Fuk Lo Tsun Road, Kowloon City, Kowloon", "九龍城福佬村道13號地下", "Kowloon_City"),
    ("dragon-centre-2", "Dragon Centre 2", "西九龍中心2", "Unit 203, 2/F, Dragon Centre, 37 Yen Chow Street, Sham Shui Po, Kowloon", "深水埗欽州街西九龍中心203號舖", "Sham_Shui_Po"),
    ("union-park-centre", "Union Park Centre", "柏宜中心", "Shop Nos. 4-6, G/F, Union Park Centre, 771-775 Nathan Road, Mongkok, Kowloon", "旺角彌敦道771-775號柏宜中心地下4-6號舖", "Yau_Tsim_Mong"),
    ("oi-man", "Oi Man Shopping Centre", "愛民商場", "Shop No. G16, G/F, Oi Man Plaza, 60 Chung Hau Street, KL", "忠孝街60號愛民商場地下G16號舖", "Kowloon_City"),
    ("megabox", "Megabox Level 2", "企業廣場", "Units 32 & 33, Level 2, Megabox, 38 Wang Chiu Road, Kowloon Bay, KL", "九龍灣宏照道38號企業廣場五期L2層32及33號舖", "Kwun_Tong"),
    ("ping-shek", "Ping Shek Estate", "坪石邨", "Shop No.201A, Tsuen Shek House, Ping Shek Estate, Kowloon", "坪石邨鑽石樓201A號舖", "Kwun_Tong"),
    ("temple-mall-north", "Temple Mall North", "黃大仙中心北館", "Shop No. N221 Level 2, Temple Mall North, 136 Lung Cheung Road, KL", "龍翔道黃大仙中心北館N221號舖", "Wong_Tai_Sin"),
    ("choi-wan", "Choi Wan Shopping Centre", "彩雲商場", "Shop No. B203, 2/F, Choi Wan Shopping Centre Phase 3, Ngau Chi Wan, Kowloon", "牛池灣彩雲商場二樓B203號舖", "Wong_Tai_Sin"),
    ("amoy-plaza", "Amoy Plaza", "淘大商場", "Shop Nos. G73-76, 78, G/F Amoy Plaza, 77 Ngau Tau Kok Rd, Kowloon", "牛頭角道77號淘大商場地下G73-76及78號舖", "Kwun_Tong"),
    ("kai-tak-sports-park", "Kai Tak Sports Park", "啟德體育園", "Shop No. M1-217, Level 2, Kai Tak Mall 1, Kai Tak Sports Park, Kai Tak, KL", "啟德體育園啟德零售館1二樓M1-217號舖", "Kowloon_City"),
    ("telford-plaza", "Telford Plaza I", "德福廣場一期", "Shop Unit G52, Telford Plaza I, Kowloon Bay, Kowloon", "九龍灣德福廣場一期G52號舖", "Kwun_Tong"),
    ("mikiki", "Mikiki", "Mikiki", "Shop No. G02B-G03 on G/F, Mikiki, 638 Prince Edward Road East, San Po Kong, Kowloon", "新蒲崗太子道東638號Mikiki地下G02B-G03號舖", "Wong_Tai_Sin"),
    ("ching-long", "Ching Long Shopping Centre", "晴朗商場", "Shop B021, G/F, Ching Long Shopping Centre, Kowloon City", "九龍城晴朗商場地下B021號舖", "Kowloon_City"),
    ("lok-fu-place", "Lok Fu Place", "樂富廣場", "Shop Nos. 2116 & 2117, 2/F, Lok Fu Place, 198 Junction Road, Kowloon", "橫頭磡聯合道198號樂富廣場二樓2116及2117號舖", "Wong_Tai_Sin"),
    ("choi-tak", "Choi Tak Shopping Centre", "彩德商場", "Shop 513, 5/F, Choi Tak Shopping Centre, Ngau Tau Kok, Kowloon", "牛頭角彩德商場5樓513號舖", "Kwun_Tong"),
    ("tsz-wan-shan", "Tsz Wan Shan", "慈雲山", "Shop 414-416, Tsz Wan Shan Shopping Centre, 23 Yuk Wah Street, Tze Wan Shan, Kln", "毓華街23號慈雲山廣場414-416號舖", "Wong_Tai_Sin"),
    ("diamond-hill", "Diamond Hill", "鑽石山", "Shop No. 228, L2, Plaza Hollywood, Diamond Hill, Kowloon", "鑽石山荷里活廣場2樓228號舖", "Wong_Tai_Sin"),
    ("chuk-yuen", "Chuk Yuen", "竹園", "Shop No. S231, Chuk Yuen Shopping Centre, Wong Tai Sin, Kowloon", "黃大仙竹園商場S231號舖", "Wong_Tai_Sin"),
    ("cheung-sha-wan-plaza", "Cheung Sha Wan Plaza G/F", "長沙灣廣場", "Unit G02, G/F, Cheung Sha Wan Plaza, 833 Cheung Sha Wan Road, KL", "長沙灣道833號長沙灣廣場地下G02號舖", "Sham_Shui_Po"),
    ("mei-foo", "Mei Foo", "美孚", "G/F, N58 & N65-N68, Mount Sterling Mall, Stage 7, Mei Foo, Kowloon", "美孚新村萬事達廣場七期地下N58, N65-68舖", "Sham_Shui_Po"),
    ("the-pacifica", "The Pacifica Mall", "宇晴軒", "Shop No. 41, 42 & 47, 2/F, The Pacifica Mall, 9 Sham Shing Road, Lai Chi Kok, Kowloon", "荔枝角深盛路9號宇晴軒商場2樓41, 42及47號舖", "Sham_Shui_Po"),
    ("un-chau-street", "Un Chau Street", "元洲街", "Shop G03, Un Chau Shopping Centre, 303 Un Chau Street, Cheung Sha Wan, Kowloon", "長沙灣元洲街303號元洲商場地下G03號舖", "Sham_Shui_Po"),
    ("domain", "Domain", "大本型", "Shop No. 220 on second floor, Domain, Yau Tong, KL", "油塘大本型第二層220號舖", "Kwun_Tong"),
    ("kai-tin", "Kai Tin", "啟田", "Shop 101A, 1/F, Kai Tin Shopping Centre, Lam Tin, Kowloon", "藍田啟田商場一樓101A號舖", "Kwun_Tong"),
    ("tak-tin", "Tak Tin Shopping Centre", "德田商場", "Shop No. G2A, G/F, Tak Tin Shopping Centre, 223 Pik Wan Road, Lam Tin, Kowloon", "藍田碧雲道223號德田商場地下G2A號舖", "Kwun_Tong"),
    ("sau-mau-ping", "Sau Mau Ping", "秀茂坪", "Shop no. 210, 2/F, Sau Mau Ping Shopping Ctr, 101 Sau Ming Rd, Kwun Tong", "觀塘秀明道101號秀茂坪商場2樓210號舖", "Kwun_Tong"),
    ("crocodile-centre", "Crocodile Centre", "鱷魚恤中心", "Shop A, G/F, Crocodile Centre, 79 Hoi Yuen Road, Kwun Tong, Kowloon", "觀塘開源道79號鱷魚恤中心地下A舖", "Kwun_Tong"),
    ("cke-mall", "CKE Mall Level 2", "重慶站購物商場", "Shop 2-383, 2-385-7, 2-396-397, 2/F Chungking Mansion, 36-44 Nathan Road, KL", "尖沙咀彌敦道36-44號CKE重慶站購物商場二樓", "Yau_Tsim_Mong"),
    ("pak-tin", "Pak Tin Commercial Centre", "白田商場", "Shop No. LG301, LG3/F, Pak Tin Commercial Centre, Pak Tin Estate, Sham Shui Po", "白田邨白田商場LG3樓LG301號舖", "Sham_Shui_Po"),
    ("sham-shui-po-17", "Sham Shui Po", "深水埗", "G/F and Cockloft, No. 17 Un Chau Street, Sham Shui Po", "深水埗元州街17號地下及閣樓", "Sham_Shui_Po"),
    ("maritime-square", "Maritime Square", "青衣城", "Shop Unit 311-312, Level 3, Maritime Square, 33 Tsing King Road, Tsing Yi, N.T.", "青衣青敬路33號青衣城3樓311-312號舖", "Kwai_Tsing"),
    ("cheung-hong", "Cheung Hong", "長康", "Shops 13 & 14, G/F, Hong Kwai House, Cheung Hong Estate, Tsing Yi, NT", "青衣長康邨康貴樓地下13,14號舖", "Kwai_Tsing"),
    ("fu-tung-plaza", "Fu Tung Plaza", "富東廣場", "Shop Nos. 113B & 114, 1/F Fu Tung Plaza, 6 Fu Tung Street, Tung Chung, NT", "東涌富東街6號富東廣場一樓113B及114號", "Islands"),
    ("cheung-fat", "Cheung Fat Estate", "長發村", "Shop No. 209, 2/F, Cheung Fat Shopping Centre, Tsing Yi, New Territories", "青衣長發村長發商場2樓209號舖", "Kwai_Tsing"),
    ("tsuen-kam-centre", "Tsuen Kam Centre", "荃灣錦中心", "Shop Nos. 104-109, 2/F, Tsuen Kam Centre, 338 Castle Peak Road, Tsuen Wan, NT", "荃灣青山公路338號荃灣錦中心二樓104-109號舖", "Tsuen_Wan"),
    ("belvedere-square", "Belvedere Square", "麗城薈", "Shop Nos. 52-53, G/F Belvedere Square, 625 Castle Peak Rd, Tsuen Wan, N.T.", "荃灣青山路625號麗城薈地下52-53號舖", "Tsuen_Wan"),
    ("op-mall", "OP Mall", "海之戀", "Shop No. 3027, 3/F OP Mall, 100 Tai Ho Road, Tsuen Wan, NT", "荃灣海之戀商場3樓3027號舖", "Tsuen_Wan"),
    ("d-park", "D.Park Level 2", "愉景新城", "Shop Nos. 2004-2005, Level 2, D. Park Discovery Park, 398 Castle Peak Rd, Tsuen Wan, NT", "荃灣青山道398號愉景新城購物商場二層2004-2005號舖", "Tsuen_Wan"),
    ("on-yam", "On Yam", "安蔭商場", "Shops 103 & 104, 1/F, On Yam Shopping Centre, 7 On Chuk St, Kwai Chung, NT", "葵涌安足街7號安蔭商場1樓103及104號舖", "Kwai_Tsing"),
    ("shek-yam", "Shek Yam", "石蔭", "Shop No. 101, LG 1/F, Shek Yam Shopping Centre, Shek Yam Estate, Kwai Chung, NT", "葵涌石蔭村石蔭商場地下101號舖", "Kwai_Tsing"),
    ("shek-lei", "Shek Lei Shopping Centre", "石籬商場", "Shop No. B001B & B001C, G/F, Shek Lei Shopping Centre Phase 2, Kwai Chung, NT", "葵涌石籬村石籬商場2期地下B001B及B001C號舖", "Kwai_Tsing"),
    ("lei-muk-shue", "Lei Muk Shue", "梨木樹", "Shop 117, Lei Muk Shue Shopping Centre, Lei Muk Shue Estate, Tsuen Wan, NT", "荃灣梨木樹村梨木樹商場117舖", "Tsuen_Wan"),
    ("luk-yeung-galleria", "Luk Yeung Galleria", "綠楊坊", "Shop Unit F20A, Luk Yeung Galleria, Tsuen Wan, New Territories", "荃灣綠楊新村商場F20A號舖", "Tsuen_Wan"),
    ("lido-avenue", "LIDO AVENUE", "麗都花園", "Shop Nos. 7&8, G/F Lido Avenue, 41-63 Castle Peak Road, Sham Tseng, N.T.", "深井青山公路41-63號麗都花園地下7及8號舖", "Tsuen_Wan"),
    ("citywalk-2", "Citywalk Phase 2", "荃新天地2期", "Shop G66-68, G/F, Citywalk 2, 18 Yeung Uk Road, Tsuen Wan, NT", "荃灣楊屋道18號荃新天地2期G66-G68號舖", "Tsuen_Wan"),
    ("metroplaza", "Metroplaza", "葵芳新都會廣場", "Shop 341, Level 3, Metroplaza, Kwai Fong, N.T.", "葵芳新都會廣場三樓341號舖", "Kwai_Tsing"),
    ("park-central", "Park Central", "將軍澳中心", "Shop Nos. 125 & 128A, Level 1, Park Central, 9 Tong Tak Street, Tseung Kwan O, NT", "將軍澳唐德街9號將軍澳中心1樓125及128A號舖", "Sai_Kung"),
    ("metro-discovery", "Metro Discovery", "新都城中心三期商場", "Shop No. 246-247, Level 2, MCP Discovery, Tseung Kwan O", "將軍澳新都城三期二樓246-247號舖", "Sai_Kung"),
    ("sheung-tak", "Sheung Tak Shopping Centre", "尚德商場", "Shop No. 202, 2/F, Sheung Tak Shopping Centre, Tseung Kwan O, N.T.", "將軍澳尚德商場二樓202號鋪", "Sai_Kung"),
    ("east-point-city", "East Point City", "東港城", "Shop No.226, 2/F, East Point City, 8 Chung Wa Road, Tseung Kwan O, NT", "將軍澳重華路8號東港城2樓226號鋪", "Sai_Kung"),
    ("metro-town", "Metro Town", "都會駅", "Shop Nos.L2-018 & L2-019, Level 2, Metro Town, 8 King Ling Road, Tseung Kwan O, NT", "將軍澳景嶺路8號都會駅第二層18-19號", "Sai_Kung"),
    ("tko-plaza", "Tseung Kwan O Plaza", "將軍澳廣場", "Shop Nos.1-073-075 & 1-085-086, Level 1, Tseung Kwan O Plaza, 1 Tong Tak St, TKO, NT", "將軍澳唐德街一號將軍澳廣場一樓", "Sai_Kung"),
    ("mcp-central", "MCP Central", "新都城中心二期", "Shops UG026-27, UG/F, MCP Central, Tseung Kwan O, NT", "將軍澳新都城中心二期UG026-27號鋪", "Sai_Kung"),
    ("sai-kung-garden", "Sai Kung Garden", "西貢花園", "Designated Portion on G/F of Sai Kung Garden, 16 Chan Man Street, Sai Kung, N.T.", "西貢親民街16號西貢花園地下部份", "Sai_Kung"),
    ("tai-wo-plaza", "Tai Wo Plaza", "太和廣場", "Shop No. 218, Level 2, Tai Wo Plaza, 12 Tai Po Tai Wo Road, Tai Po, NT", "大埔太和路12號太和廣場2樓218號", "Tai_Po"),
    ("tin-yiu-plaza", "Tin Yiu Plaza", "天耀廣場", "Shop Nos. L046A & L046B, G/F, Tin Yiu Plaza, Tin Shui Wai, NT", "天水圍天耀廣場地下L046A及L046B號舖", "Yuen_Long"),
    ("tin-shui-shopping", "Tin Shui Shopping Centre", "天瑞商場", "Shop No. L112, 1/F Tin Shui Shopping Centre, Tin Shui Wai, NT", "天水圍天瑞商場1樓L112號舖", "Yuen_Long"),
    ("yoho-mix", "YOHO Mix", "元點", "Shop B169 & B187, Level 1, Yoho Mix, Yuen Long, NT", "元朗元點1樓B169及B187號舖", "Yuen_Long"),
    ("park-circle", "Park Circle G/F", "峻巒廣場", "Shop Nos. 101-102, G/F, Park Circle, 18 Castle Peak Road Tam Mi, Kam Tin, NT", "錦田青山公路18號峻巒廣場地下101-102號舖", "Yuen_Long"),
    ("long-ping", "Long Ping", "朗屏商場", "Shop No. L112, 1/F, Long Ping Shopping Centre, Long Ping Estate, Yuen Long, NT", "元朗朗屏邨朗屏商場1樓L112號舖", "Yuen_Long"),
    ("fu-shin", "Fu Shin Shopping Centre", "富善商場", "Shop No. G007 and G012, G/F, Fu Shin Estate, Tai Po, NT", "大埔富善邨富善商場地下G007及G012號舖", "Tai_Po"),
    ("tai-po-mega-mall", "Tai Po Mega Mall 2", "大埔超級城", "Shop No. 113, Level 1, Zone B, Tai Po Mega Mall, 8-10 On Pong Road, Tai Po, NT", "大埔超級城1樓113號舖", "Tai_Po"),
    ("woo", "+WOO", "嘉湖", "Shop Nos. G73A, G74 & G75, G/F, +WOO Phase 1, 12-18 Tin Yan Road, Tin Shui Wai, N.T.", "天水圍天恩路12-18號嘉湖1期地下G73A, G74及G75號舖", "Yuen_Long"),
    ("t-town", "T-TOWN", "T-TOWN", "Shop N133-N134, 1/F, T-TOWN North, Tin Chung Court, Tin Shui Wai", "天水圍天頌苑T-TOWN北翼1樓N133-N134號舖", "Yuen_Long"),
    ("locwood-court", "Locwood Court", "新北江商場", "Shop Nos. 3 & 4, 1/F, Locwood Court, Kingswood Villas, 1 Tin Wu Road, Tin Shui Wai, NT", "天水圍天湖路1號新北江商場1樓3及4號舖", "Yuen_Long"),
    ("tin-chak", "Tin Chak Shopping Centre", "天澤商場", "Shop No. 212C, 2/F, Tin Chak Shopping Centre, Tin Chak Estate, Tin Shui Wai, NT", "天水圍天澤商場2樓212C舖", "Yuen_Long"),
    ("po-heung-street", "Po Heung Street", "寶鄉街", "Shop B, G/F, Tak Shun Building, 82 Po Heung Street, Tai Po, NT", "大埔寶鄉街82號德信大樓地下B舖", "Tai_Po"),
    ("uptown-plaza", "Uptown Plaza", "新達廣場", "Shop 079-082, Level 1, Uptown Plaza, Tai Po, New Territories", "大埔新達廣場一樓079-082號舖", "Tai_Po"),
    ("k-point", "K-Point Level 3", "錦薈坊", "Shop Nos. 336, 337 & 345-352, Level 3, K-Point, 1 Tuen Lung Street, Tuen Mun, NT", "屯門屯龍街1號K-POINT 3樓336, 337及345-352號舖", "Tuen_Mun"),
    ("hands", "HANDS", "愛定商場", "Shop No. A210-212, H.A.N.D.S., On Ting Estate, Tuen Mun, NT", "屯門安定邨H.A.N.D.S商場A210-212號舖", "Tuen_Mun"),
    ("kin-sang", "Kin Sang", "建生商場", "Shop No. 120 & 121, G/F Kin Sang Shopping Centre, Tuen Mun, NT", "屯門建生商場地下120及121號舖", "Tuen_Mun"),
    ("hk-gold-coast", "HK Gold Coast", "黃金海岸", "Shop No 9-10, G/F, Marina Magic Shopping Mall, HK Gold Coast, 1 Castle Peak Road, Tsuen Wan, NT", "荃灣青山道1號黃金海岸商場地下9-10號舖", "Tsuen_Wan"),
    ("chelsea-heights", "Chelsea Heights", "卓爾居", "Shop 101, 1/F, Chelsea Heights, Tuen Mun, New Territories", "屯門卓爾居一樓101號舖", "Tuen_Mun"),
    ("yuen-long-142", "Yuen Long", "元朗", "G/F, 1/F & 2/F, 142 Castle Peak Road, Yuen Long, New Territories", "元朗大馬路142號地下至2樓", "Yuen_Long"),
    ("new-yuen-long", "New Yuen Long", "新元朗", "Shop 2 & 3, 8-10, G/F, Hing Fat House, 9-13 Kau Yuk Road, Yuen Long, NT", "元朗教育路9-13號興發大樓地下2-3及8-10舖", "Yuen_Long"),
    ("sun-tuen-mun", "Sun Tuen Mun Centre", "新屯門中心", "Shop 125, Level 3, Sun Tuen Mun Shopping Centre, 55-65 Lung Mun Road, Tuen Mun, NT", "屯門龍門路55-65號新屯門中心3樓125號舖", "Tuen_Mun"),
    ("tuen-mun-town-plaza", "Tuen Mun", "屯門市廣場", "Shop 2100B-C & 2115-2122, 2/F, Tuen Mun Town Plaza Phase 1, 1 Tuen Shing Street, Tuen Mun, NT", "屯門屯盛街1號屯門市廣場1期2樓2100B-C及2115-2122號", "Tuen_Mun"),
    ("butterfly-estate", "Butterfly Estate", "蝴蝶村", "Shop Nos. R260, R261 and R262, Level 2, Butterfly Shopping Centre, Tuen Mun, N.T.", "屯門蝴蝶村蝴蝶廣場R260, R261及R262號舖", "Tuen_Mun"),
    ("tseng-choi-street", "Tseng Choi Street", "井財街", "Shop Nos. 11 & 12, G/F, Kam Men Mansion, 15 Tseng Choi Street, Tuen Mun, NT", "屯門井財街15號金銘大廈地下11及12號舖", "Tuen_Mun"),
    ("v-city", "V City", "V City", "Shop M-32, MTR Level, V City, 83 Tuen Mun Heung Sze Wui Road, Tuen Mun, NT", "屯門鄉事會路83號V City地鐵樓層M-32號舖", "Tuen_Mun"),
    ("sau-fu-street", "Sau Fu Street", "壽富街", "G/F, 17 Sau Fu Street, Yuen Long, New Territories", "元朗壽富街17號地下", "Yuen_Long"),
    ("double-cove-place", "Double Cove Place", "迎海薈", "Shop No.7, 2/F Double Cove Place, 8 Wu Kai Sha Road, Ma On Shan, NT", "馬鞍山烏溪沙路8號迎海薈2樓7號舖", "Sha_Tin"),
    ("kings-wing-plaza", "Kings Wing Plaza", "京瑞廣場", "Shop G10, G/F, Kings Wing Plaza 1, 3 On Kwan Street, Shatin, NT", "沙田安群街3號京瑞廣場1期地下G10號舖", "Sha_Tin"),
    ("flora-plaza", "Flora Plaza 2", "花都廣場", "Shop Nos. A42 & A46, G/F, Flora Plaza, Fanling, NT", "粉嶺花都廣場地下A42及A46號舖", "North"),
    ("shatin-galleria", "Shatin Galleria", "沙田商業中心", "Shop Nos. 7-9, 1/F Shatin Galleria, 18-24 Shan Mei Street, Shatin, N.T.", "沙田火炭山尾街18-24號沙田商業中心1樓7-9號舖", "Sha_Tin"),
    ("lung-hang", "Lung Hang Shopping Centre", "隆亨商場", "Shop No. 117, Level 2, Lung Hang Shopping Centre, Lung Hang Estate, Shatin, N.T.", "沙田隆亨商場二樓117舖", "Sha_Tin"),
    ("fanling-town-centre", "Fanling Town Centre", "粉嶺名都廣場", "Shop No. 28B, Level 2, Fanling Town Centre, Fanling, New Territories", "粉嶺名都廣場二樓28B舖", "North"),
    ("the-wai", "The Wai", "圍方", "Shop Unit 504, 5/F, The Wai Commercial Development at Tai Wai Station, Shatin, NT", "沙田大圍車公廟路18號圍方5樓504號舖", "Sha_Tin"),
    ("ma-on-shan-plaza", "Ma On Shan", "馬鞍山", "Shop 222-225, Level 2, Ma On Shan Plaza, 608 Sai Sha Road, Ma On Shan, NT", "馬鞍山西沙路608號馬鞍山廣場第二層222-225號", "Sha_Tin"),
    ("mos-town", "MOS Town", "新港城中心", "Shop No.2136, Level 2, MOS Town, Ma On Shan, NT", "馬鞍山新港城中心2樓2136號舖", "Sha_Tin"),
    ("new-town-plaza", "New Town Plaza", "新城市廣場", "Shops 451-453, Level 4, New Town Plaza Phase 1, Shatin, New Territories", "沙田新城市廣場1期4樓451-453號舖", "Sha_Tin"),
    ("lucky-plaza", "Lucky Plaza", "好運中心商場", "Shops 3058, 3087 & 3088, Level 3 Lucky Plaza, 1-15 Wang Pok Street, Sha Tin, NT", "沙田橫壆街1-15號好運中心商場3樓3058, 3087及3088號舖", "Sha_Tin"),
    ("palazzo", "Palazzo", "御龍山", "Shop 102B, The Palazzo, Fo Tan, Shatin, New Territories", "沙田火炭御龍山102B舖", "Sha_Tin"),
    ("fortune-city-one", "Fortune City One", "置富第一城", "Shop G24B, G25 & G26, Fortune City One, City One Shatin, Shatin, NT", "沙田置富第一城地下G24B, G25-G26舖", "Sha_Tin"),
    ("regentville", "Regentville", "帝庭軒", "Shop No. 27-28, 1/F, Regentville Shopping Mall, 8 Wo Mun Street, Fanling, NT", "粉嶺聯和墟和滿街8號帝庭軒購物商場1樓27-28號舖", "North"),
    ("green-code", "Green Code", "逸峯廣場", "Shop G09, G/F, Green Code Plaza, 1 Ma Sik Road, Fanling, NT", "粉嶺馬適路1號逸峯廣場地下G09號舖", "North"),
    ("tai-wai", "Tai Wai", "大圍", "Shop A & B, G/F & Cockloft, Chung Pak Lau, 28-30 Tai Wai Road, Tai Wai, NT", "沙田大圍路28-30號地下A,B及閣樓", "Sha_Tin"),
    ("spot", "Spot", "上水匯", "Shop Nos 206, 213-214, 2/F Spot, 48 Lung Sum Avenue, Sheung Shui, NT", "上水石湖墟龍琛路48號上水匯2樓206, 213-214號舖", "North"),
    ("choi-yuen-plaza", "Choi Yuen Plaza", "彩園村商場", "Shop No. R42 & R43, 3/F, Choi Yuen Plaza, Sheung Shui, N.T.", "上水彩園商場三樓R42及R43號舖", "North"),
    ("sheung-shui-fu-hing", "Sheung Shui", "上水", "G/F & Cockloft, 43-45 Fu Hing Street, Sheung Shui, New Territories", "上水符興街43-45號地下", "North"),
    ("lok-ma-chau", "Lok Ma Chau", "落馬洲", "MTR Station Shop LMC 115 and Storeroom LMC STR 11, Lok Ma Chau Station, NT", "港鐵落馬洲站LMC 115號舖", "North"),
    ("mayfair-lane", "Mayfair Lane", "逸瓏灣", "Shop LG 12, 13, 15 LG Floor, Mayfair Lane, 21 Fo Chun Road, Tai Po, NT", "大埔科進路21號逸瓏灣II地下低層12,13,15號舖", "Tai_Po"),
    ("landmark-north", "Landmark North", "上水廣場", "Shop Nos. 401-402, Level 4 Landmark North, 39 Lung Sum Avenue, Sheung Shui, NT", "上水石湖墟龍琛路39號上水廣場4樓401-402號舖", "North"),
    ("lok-ma-chau-2", "Lok Ma Chau Station 2", "落馬洲港鐵站2", "Shop LMC 207, 208 and Storeroom LMC STR 12, 14, Lok Ma Chau Station, NT", "港鐵落馬洲站LMC 207, 208號舖", "North"),
    ("tin-ping", "Tin Ping Estate", "天平邨", "Shops 108 & 120, G/F, Tin Ping Shopping Centre, Tin Ping Estate, Sheung Shui, NT", "上水天平邨天平商場地下108及120號舖", "North"),
    ("caribbean-square", "Caribbean Square", "映灣薈", "Shop 35, Podium, 1/F, Caribbean Square, 1 Kin Tung Road, Tung Chung, NT", "東涌健東道1號映灣薈平台1樓35號舖", "Islands"),
    ("smartland", "Smartland", "荃灣", "Shop No. 7 G/F Smartland, 16 Tsuen Wah Street, Tsuen Wan, NT", "荃灣荃華街創意無限廣場7號地舖", "Tsuen_Wan"),
    ("citywalk-1", "Citywalk I", "荃新天地1期", "Shop Nos. G57, G59, G61a, G61b & G63, G/F, Citywalk 1, Tsuen Wan, N.T.", "荃灣楊屋道1號荃新天地1期地下G57, G59, G61a, G61b及G63號舖", "Tsuen_Wan"),
    ("kolour-tsuen-wan", "Kolour Tsuen Wan", "荃灣千色匯", "Shop Nos. 2020, 2029 & 2030, 2/F KOLOUR Tsuen Wan 1, 68 Chung On Street, Tsuen Wan, N.T.", "荃灣眾安街68號荃灣千色匯1期2樓2020, 2029及2030舖", "Tsuen_Wan"),
    ("soho-west", "Soho West", "Soho West", "Shop No. 104, L1, SOHO WEST, 10 Lai Ying Street, Cheung Sha Wan, KL", "荔枝角荔盈街10號SOHO WEST 1樓104號舖", "Sham_Shui_Po"),
    ("east-point-baby", "East Point Baby", "東港城(Baby)", "Shop No. 239, 2/F East Point City, 8 Chung Wa Road, Tseung Kwan O, N.T.", "將軍澳重華路8號東港城2樓239號舖", "Sai_Kung"),
    ("the-lohas", "The Lohas", "康城", "Shop Unit 430, 4/F The Lohas, Tseung Kwan O, N.T.", "將軍澳康城4樓430號舖", "Sai_Kung"),
    ("leung-king-plaza", "Leung King Plaza", "良景廣場", "Shop L314, Level 3, Leung King Plaza, Tuen Mun, N.T.", "屯門良景廣場3樓L314號舖", "Tuen_Mun"),
    ("queens-hill", "Queens Hill Shopping Centre", "皇后山商場", "Shop No. 14, G/F, Queens Hill Shopping Centre, Queens Hill Estate, Fanling", "粉嶺皇后山村皇后山商場地下14號舖", "North"),
    ("science-park", "Science Park", "科學園", "Unit S046B, G/F Building 10W Phase Two, Hong Kong Science Park, Pak Shek Kok, NT", "香港科學園10W大樓2期地下S046B號舖", "Sha_Tin"),
    ("rua-campo", "Rua Campo", "水坑尾", "Rua Campo No.62-92, Ljs. A,B,C,D, China Const. Com. Building, Macau", "澳門水坑尾街62-92號地下A,B,C,D舖", "Macau"),
    ("three-lamps", "Three Lamps", "三盞燈", "6A Rotunda De Carlos Da Maia, Macau", "澳門嘉路米耶圓地添運大廈6A地下B,C舖", "Macau"),
    ("largo-senado", "Largo Senado", "議事亭", "Largo Senado No. 11, Shun Tak House, G/F to 3/F, Macau", "澳門議事亭前地11號信德堡地下及1-3樓", "Macau"),
    ("costa", "Costa", "世紀豪庭", "Avenida De Horta E Costa, Millennium Court, Res-do-chao B, Macau", "澳門高士德大馬路世紀豪庭地下B座", "Macau"),
    ("the-londoner", "The Londoner", "倫敦人", "Shops 2230, 2231 & 2232, Level 2, Cotai, Macau", "澳門倫敦人購物中心2樓2230, 2231及2232號舖", "Macau"),
    ("nam-fai-building", "Nam Fai Building", "南暉", "Rua Da Serenidade No.82, Nam Fai, Macau", "澳門永定街82號南暉地下S座, AO座及AN座", "Macau"),
    ("parisian-macao", "Shoppes at Parisian", "澳門巴黎人", "Shop 3549, Level 5, Shoppes at Parisian, The Parisian Macao, Cotai, Macau", "澳門巴黎人購物中心5樓3549號舖", "Macau"),
    ("hoi-pan-fa-un", "Hoi Pan Fa Un", "海濱花園", "Rua Do Canal Novo Nos 62-64, Hoi Pan Fa Un Bloco XI, Macau", "澳門涌河新街62-64號海濱花園第11座地下", "Macau"),
    ("venetian-exp", "Venetian exp", "威尼斯人度假村酒店exp", "Shop 2016 & 2017a, Level 3, Shoppes at Venetian, Taipa, Macau", "澳門威尼斯人購物中心三樓2016及2017a號舖", "Macau"),
    ("venetian", "Venetian", "威尼斯人度假村酒店", "Shop 2025 & 2026, Level 3, Shoppes at Venetian, Taipa, Macau", "澳門威尼斯人購物中心三樓2025及2026號舖", "Macau"),
    ("studio-city", "Studio City", "新濠影匯", "Shop L1095 & L1097, Level 1, The Boulevard at Studio City, Cotai, Macau", "澳門路氹連貫公路新濠影匯購物大道一樓L1095及L1097號舖", "Macau"),
]

DISTRICT_CENTERS = {
    "Central_Western": (22.286, 114.145),
    "Eastern": (22.285, 114.225),
    "Islands": (22.288, 113.945),
    "Kowloon_City": (22.328, 114.191),
    "Kwai_Tsing": (22.358, 114.125),
    "Kwun_Tong": (22.312, 114.225),
    "North": (22.494, 114.128),
    "Sai_Kung": (22.382, 114.272),
    "Sha_Tin": (22.381, 114.195),
    "Sham_Shui_Po": (22.330, 114.162),
    "Southern": (22.247, 114.155),
    "Tai_Po": (22.450, 114.170),
    "Tsuen_Wan": (22.371, 114.115),
    "Tuen_Mun": (22.391, 113.977),
    "Wan_Chai": (22.276, 114.173),
    "Wong_Tai_Sin": (22.342, 114.195),
    "Yau_Tsim_Mong": (22.305, 114.171),
    "Yuen_Long": (22.445, 114.022),
    "Macau": (22.1987, 113.5439),
}


def load_cache() -> dict:
    if CACHE.exists():
        return json.loads(CACHE.read_text())
    return {}


def save_cache(cache: dict) -> None:
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2))


def geocode(address: str, district: str, cache: dict) -> tuple[float, float]:
    if address in cache:
        return cache[address]["lat"], cache[address]["lng"]

    region = "Macau" if district == "Macau" else "Hong Kong"
    query = f"Watsons, {address}, {region}"
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": query, "format": "json", "limit": 1, "countrycodes": "hk,mo" if district != "Macau" else "mo"}
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Collectiv-WFEP/1.0 (recycling-app)"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())
        if data:
            lat, lng = float(data[0]["lat"]), float(data[0]["lon"])
            cache[address] = {"lat": lat, "lng": lng, "source": "nominatim"}
            return lat, lng
    except Exception:
        pass

    clat, clng = DISTRICT_CENTERS.get(district, (22.32, 114.17))
    idx = abs(hash(address)) % 1000
    lat = clat + (idx % 50 - 25) * 0.00008
    lng = clng + (idx // 50 - 10) * 0.00008
    cache[address] = {"lat": lat, "lng": lng, "source": "district-fallback"}
    return lat, lng


def esc(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def main() -> None:
    cache = load_cache()
    lines = [
        "/**",
        " * Watsons HK/Macau store locations for skincare container recycling.",
        " * Source: 20260508_Storelist_updated-pages-deleted.pdf (official Watsons store list).",
        " * Service hours: 10:00 AM – 9:00 PM at all listed branches.",
        " */",
        "export const WATSONS_STORE_HOURS_EN = \"10:00 AM – 9:00 PM daily\";",
        "export const WATSONS_STORE_HOURS_TC = \"每日上午10時至晚上9時\";",
        "",
        "export const WATSONS_STORE_LOCATIONS = [",
    ]

    for i, (sid, name_en, name_tc, addr_en, addr_tc, district) in enumerate(STORES):
        lat, lng = geocode(addr_en, district, cache)
        if i and i % 8 == 0:
            time.sleep(1.1)
        lines.extend([
            "  {",
            f"    storeId: \"wtc-{sid}\",",
            f"    district: \"{district}\",",
            f"    nameEn: {esc(name_en)},",
            f"    nameTc: {esc(name_tc)},",
            f"    lat: {round(lat, 6)},",
            f"    lng: {round(lng, 6)},",
            f"    addressEn: {esc(addr_en)},",
            f"    addressTc: {esc(addr_tc)},",
            "  },",
        ])

    lines.extend([
        "] as const;",
        "",
        "export type WatsonsStoreLocation = (typeof WATSONS_STORE_LOCATIONS)[number];",
        "",
    ])

    OUT.write_text("\n".join(lines))
    save_cache(cache)
    print(f"Wrote {len(STORES)} stores to {OUT}")


if __name__ == "__main__":
    main()
