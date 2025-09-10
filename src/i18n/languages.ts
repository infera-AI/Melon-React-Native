// 统一定义语言项, app首次打开时的语种选择数据就可以从这个配置中获取
/**
 * import CountryFlag from 'react-native-country-flag';
 * <CountryFlag isoCode="DE" size={25} /> 这个库能根据国家代码渲染图片
 */

export type Language =
    'en' | 'zh' | 'es' | 'fr' | 'ar' | 'ru' | 'de' | 'ja' | 'pt' |
    'hi' | 'bn' | 'ur' | 'id' | 'pa' | 'ms' | 'ko' | 'it' | 'nl' |
    'tr' | 'vi' | 'th' | 'pl' | 'uk' | 'fa' | 'sw' | 'el' | 'hu' |
    'sv' | 'da' | 'no' | 'fi' | 'cs' | 'ro' | 'he' | 'af' | 'sq' |
    'am' | 'hy' | 'az' | 'eu' | 'be' | 'bs' | 'bg' | 'ca' | 'ceb' |
    'ny' | 'co' | 'hr' | 'et' | 'fo' | 'fy' | 'gl' | 'ka' | 'gu' |
    'ht' | 'ha' | 'haw' | 'hmn' | 'is' | 'ig' | 'ga' | 'jw' | 'kn' |
    'kk' | 'km' | 'rw' | 'ku' | 'ky' | 'lo' | 'lv' | 'lt' | 'lb' | 'mk' |
    'mg' | 'ml' | 'mt' | 'mi' | 'mr' | 'mn' | 'my' | 'ne' | 'or' | 'ps' |
    'sm' | 'gd' | 'sr' | 'st' | 'sn' | 'sd' | 'si' | 'sk' | 'sl' | 'so' |
    'su' | 'tg' | 'ta' | 'te' | 'uz' | 'cy' | 'xh' | 'yo' | 'zu' | 'ab' |
    'aa' | 'ak' | 'an' | 'as' | 'av' | 'ay' | 'ba' | 'bm' | 'bi' | 'bo' |
    'br' | 'bz' | 'cb' | 'ch' | 'cv' | 'kw' | 'cr' | 'dv' | 'dz' | 'ee' |
    'fj' | 'ff' | 'fl' | 'gn' | 'gv' | 'hz' | 'ii' | 'ik' | 'iu' | 'jv' |
    'kg' | 'ki' | 'kj' | 'kl' | 'kr' | 'ks' | 'kv' | 'lg' | 'li' | 'ln' |
    'lu' | 'mh' | 'mo' | 'na' | 'nb' | 'nd' | 'ng' | 'nn' | 'nr' | 'nv' |
    'oc' | 'oj' | 'om' | 'os' | 'qu' | 'rm' | 'rn' | 'sc' | 'se' | 'sg' |
    'ss' | 'ti' | 'tk' | 'tl' | 'tn' | 'to' | 'ts' | 'tt' | 'tw' | 'ty' |
    'ug' | 've' | 'wa' | 'wo';

export type LanguageOption = {
  code: Language; // 对应 json 文件名
  label: string; // 展示在列表中的名称
};

export const supportedLanguages: LanguageOption[] =
[
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'pl', label: 'Polski' },
  { code: 'uk', label: 'Українська' },
  { code: 'th', label: 'ไทย' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'sv', label: 'Svenska' },
  { code: 'no', label: 'Norsk' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'be', label: 'Беларуская' },
  { code: 'bg', label: 'Български' },
  { code: 'da', label: 'Dansk' },
  { code: 'cs', label: 'Čeština' },
  { code: 'hu', label: 'Magyar' },
  { code: 'sq', label: 'Shqip' },
  { code: 'fa', label: 'فارسی' },
  { code: 'he', label: 'עברית' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'hy', label: 'Հայերեն' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'az', label: 'Azərbaycan' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'eu', label: 'Euskara' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'bs', label: 'Bosanski' },
  { code: 'fi', label: 'Suomi' },
  { code: 'ro', label: 'Română' },
  { code: 'ur', label: 'اردو' },
  
  // { code: 'ca', label: 'Català' },
  // { code: 'ceb', label: 'Cebuano' },
  // { code: 'ny', label: 'Chichewa' },
  // { code: 'co', label: 'Corsu' },
  // { code: 'hr', label: 'Hrvatski' },

  // { code: 'et', label: 'Eesti' },
  // { code: 'fo', label: 'Føroyskt' },
  // { code: 'fy', label: 'Frysk' },
  // { code: 'gl', label: 'Galego' },
  // { code: 'ka', label: 'ქართული' },
  // { code: 'gu', label: 'ગુજરાતી' },
  // { code: 'ht', label: 'Kreyòl Ayisyen' },
  // { code: 'ha', label: 'Hausa' },
  // { code: 'haw', label: 'Hawaiʻi' },
  // { code: 'hmn', label: 'Hmong' },
  // { code: 'is', label: 'Íslenska' },
  // { code: 'ig', label: 'Igbo' },
  // { code: 'ga', label: 'Gaeilge' },
  // { code: 'jw', label: 'Jawa' },
  // { code: 'kn', label: 'ಕನ್ನಡ' },
  // { code: 'kk', label: 'Қазақша' },
  // { code: 'km', label: 'ខ្មែរ' },
  // { code: 'rw', label: 'Kinyarwanda' },
  // { code: 'ku', label: 'Kurdî' },
  // { code: 'ky', label: 'Кыргызча' },
  // { code: 'lo', label: 'ລາວ' },

  // { code: 'lv', label: 'Latviešu' },
  // { code: 'lt', label: 'Lietuvių' },
  // { code: 'lb', label: 'Lëtzebuergesch' },
  // { code: 'mk', label: 'Македонски' },
  // { code: 'mg', label: 'Malagasy' },
  // { code: 'ml', label: 'മലയാളം' },
  // { code: 'mt', label: 'Malti' },
  // { code: 'mi', label: 'Māori' },
  // { code: 'mr', label: 'मराठी' },
  // { code: 'mn', label: 'Монгол' },
  // { code: 'my', label: 'မြန်မာ' },
  // { code: 'ne', label: 'नेपाली' },
  // { code: 'or', label: 'ଓଡ଼ିଆ' },
  // { code: 'ps', label: 'پښتو' },
  // { code: 'sm', label: 'Samoan' },
  // { code: 'gd', label: 'Gàidhlig' },
  // { code: 'sr', label: 'Српски' },
  // { code: 'st', label: 'Sesotho' },
  // { code: 'sn', label: 'Shona' },
  // { code: 'sd', label: 'سنڌي' },
  // { code: 'si', label: 'සිංහල' },
  // { code: 'sk', label: 'Slovenčina' },
  // { code: 'sl', label: 'Slovenščina' },
  // { code: 'so', label: 'Soomaali' },
  // { code: 'su', label: 'Sunda' },
  // { code: 'tg', label: 'Тоҷикӣ' },
  // { code: 'ta', label: 'தமிழ்' },
  // { code: 'te', label: 'తెలుగు' },
  // { code: 'uz', label: 'Oʻzbek' },
  // { code: 'cy', label: 'Cymraeg' },
  // { code: 'xh', label: 'Xhosa' },
  // { code: 'yo', label: 'Yorùbá' },
  // { code: 'zu', label: 'Zulu' },
  // { code: 'ab', label: 'Аҧсуа' },
  // { code: 'aa', label: 'Afar' },
  // { code: 'ak', label: 'Akan' },
  // { code: 'an', label: 'Aragonés' },
  // { code: 'as', label: 'অসমীয়া' },
  // { code: 'av', label: 'Авар' },
  // { code: 'ay', label: 'Aymara' },
  // { code: 'ba', label: 'Башҡорт' },
  // { code: 'bm', label: 'Bambara' },
  // { code: 'bi', label: 'Bislama' },
  // { code: 'bo', label: 'བོད་ཡིག' },
  // { code: 'br', label: 'Brezhoneg' },
  // { code: 'bz', label: 'Беларуская' },
  // { code: 'cb', label: 'Нохчийн' },
  // { code: 'ch', label: 'Chamoru' },
  // { code: 'cv', label: 'Чăваш' },
  // { code: 'kw', label: 'Kernewek' },
  // { code: 'cr', label: 'Cree' },
  // { code: 'dv', label: 'ދިވެހި' },
  // { code: 'dz', label: 'ཇོ་བོ་སོག་' },
  // { code: 'ee', label: 'Ewe' },
  // { code: 'fj', label: 'Fijian' },
  // { code: 'ff', label: 'Fulah' },
  // { code: 'fl', label: 'Vlaams' },
  // { code: 'gn', label: 'Guarani' },
  // { code: 'gv', label: 'Gaelg' },
  // { code: 'hz', label: 'Herero' },


  // { code: 'ii', label: 'ꆈꌠ꒿' },
  // { code: 'ik', label: 'Inupiaq' },
  // { code: 'iu', label: 'Inuktitut' },
  // { code: 'jv', label: 'Jawa' },
  // { code: 'kg', label: 'Kongo' },
  // { code: 'ki', label: 'Kikuyu' },
  // { code: 'kj', label: 'Kuanyama' },
  // { code: 'kl', label: 'Kalaallisut' },
  // { code: 'kr', label: 'Kanuri' },
  // { code: 'ks', label: 'कश्मीरी' },
  // { code: 'kv', label: 'Коми' },
  // { code: 'lg', label: 'Ganda' },

  // { code: 'li', label: 'Limburgs' },
  // { code: 'ln', label: 'Lingala' },
  // { code: 'lu', label: 'Luba-Katanga' },
  // { code: 'mh', label: 'Marshallese' },
  // { code: 'mo', label: 'Moldovenească' },
  // { code: 'na', label: 'Nauru' },
  // { code: 'nb', label: 'Norsk Bokmål' },
  // { code: 'nd', label: 'North Ndebele' },
  // { code: 'ng', label: 'Ndonga' },
  // { code: 'nn', label: 'Norsk Nynorsk' },
  // { code: 'nr', label: 'South Ndebele' },
  // { code: 'nv', label: 'Navajo' },
  // { code: 'oc', label: 'Occitan' },
  // { code: 'oj', label: 'Ojibwa' },
  // { code: 'om', label: 'Oromo' },
  // { code: 'os', label: 'Оссетинский' },
  // { code: 'qu', label: 'Quechua' },
  // { code: 'rm', label: 'Rumantsch' },
  // { code: 'rn', label: 'Rundi' },
  // { code: 'sc', label: 'Sardu' },
  // { code: 'se', label: 'Davvisámegiella' },
  // { code: 'sg', label: 'Sango' },
  // { code: 'ss', label: 'Swati' },

  // { code: 'ti', label: 'ትግርኛ' },
  // { code: 'tk', label: 'Türkmen' },
  // { code: 'tl', label: 'Tagalog' },
  // { code: 'tn', label: 'Tswana' },
  // { code: 'to', label: 'Tonga' },
  // { code: 'ts', label: 'Tsonga' },
  // { code: 'tt', label: 'Татарча' },
  // { code: 'tw', label: 'Twi' },
  // { code: 'ty', label: 'Tahitian' },
  // { code: 'ug', label: 'Uyghur' },
  // { code: 've', label: 'Venda' },
  // { code: 'wa', label: 'Walloon' },
  // { code: 'wo', label: 'Wolof' }
];

// 语言代码和国家代码映射用于react-native-country-flag找到对应国家图片
export const languageToCountryCode: Record<Language, string> = {
    "en": "US",   // 英语 - 美国
    "zh": "CN",   // 中文 - 中国
    "es": "ES",   // 西班牙语 - 西班牙
    "fr": "FR",   // 法语 - 法国
    "ar": "SA",   // 阿拉伯语 - 沙特阿拉伯
    "ru": "RU",   // 俄语 - 俄罗斯
    "de": "DE",   // 德语 - 德国
    "ja": "JP",   // 日语 - 日本
    "pt": "PT",   // 葡萄牙语 - 葡萄牙
    "hi": "IN",   // 印地语 - 印度
    "bn": "BD",   // 孟加拉语 - 孟加拉国
    "ur": "PK",   // 乌尔都语 - 巴基斯坦
    "id": "ID",   // 印度尼西亚语 - 印度尼西亚
    "pa": "PK",   // 旁遮普语 - 巴基斯坦
    "ms": "MY",   // 马来语 - 马来西亚
    "ko": "KR",   // 韩语 - 韩国
    "it": "IT",   // 意大利语 - 意大利
    "nl": "NL",   // 荷兰语 - 荷兰
    "tr": "TR",   // 土耳其语 - 土耳其
    "vi": "VN",   // 越南语 - 越南
    "th": "TH",   // 泰语 - 泰国
    "pl": "PL",   // 波兰语 - 波兰
    "uk": "UA",   // 乌克兰语 - 乌克兰
    "fa": "IR",   // 波斯语 - 伊朗
    "sw": "TZ",   // 斯瓦希里语 - 坦桑尼亚
    "el": "GR",   // 希腊语 - 希腊
    "hu": "HU",   // 匈牙利语 - 匈牙利
    "sv": "SE",   // 瑞典语 - 瑞典
    "da": "DK",   // 丹麦语 - 丹麦
    "no": "NO",   // 挪威语 - 挪威
    "fi": "FI",   // 芬兰语 - 芬兰
    "cs": "CZ",   // 捷克语 - 捷克
    "ro": "RO",   // 罗马尼亚语 - 罗马尼亚
    "he": "IL",   // 希伯来语 - 以色列
    "af": "ZA",   // 南非荷兰语 - 南非
    "sq": "AL",   // 阿尔巴尼亚语 - 阿尔巴尼亚
    "am": "ET",   // 阿姆哈拉语 - 埃塞俄比亚
    "hy": "AM",   // 亚美尼亚语 - 亚美尼亚
    "az": "AZ",   // 阿塞拜疆语 - 阿塞拜疆
    "eu": "ES",   // 巴斯克语 - 西班牙（巴斯克地区）
    "be": "BY",   // 白俄罗斯语 - 白俄罗斯
    "bs": "BA",   // 波斯尼亚语 - 波斯尼亚和黑塞哥维那
    "bg": "BG",   // 保加利亚语 - 保加利亚
    "ca": "ES",   // 加泰罗尼亚语 - 西班牙（加泰罗尼亚地区）
    "ceb": "PH",  // 宿务语 - 菲律宾
    "ny": "MW",   // 齐切瓦语 - 马拉维
    "co": "FR",   // 科西嘉语 - 法国（科西嘉岛）
    "hr": "HR",   // 克罗地亚语 - 克罗地亚

    "et": "EE",   // 爱沙尼亚语 - 爱沙尼亚
    "fo": "FO",   // 法罗语 - 法罗群岛
    "fy": "NL",   // 弗里斯兰语 - 荷兰
    "gl": "ES",   // 加利西亚语 - 西班牙（加利西亚地区）
    "ka": "GE",   // 格鲁吉亚语 - 格鲁吉亚
    "gu": "IN",   // 古吉拉特语 - 印度
    "ht": "HT",   // 海地克里奥尔语 - 海地
    "ha": "NG",   // 豪萨语 - 尼日利亚
    "haw": "US",  // 夏威夷语 - 美国（夏威夷州）
    "hmn": "LA",  // 苗语 - 老挝
    "is": "IS",   // 冰岛语 - 冰岛
    "ig": "NG",   // 伊博语 - 尼日利亚
    "ga": "IE",   // 爱尔兰语 - 爱尔兰
    "jw": "ID",   // 爪哇语 - 印度尼西亚
    "kn": "IN",   // 卡纳达语 - 印度
    "kk": "KZ",   // 哈萨克语 - 哈萨克斯坦
    "km": "KH",   // 高棉语 - 柬埔寨
    "rw": "RW",   // 基隆迪语 - 卢旺达
    "ku": "IQ",   // 库尔德语 - 伊拉克（库尔德地区）
    "ky": "KG",   // 吉尔吉斯语 - 吉尔吉斯斯坦
    "lo": "LA",   // 老挝语 - 老挝

    "lv": "LV",   // 拉脱维亚语 - 拉脱维亚
    "lt": "LT",   // 立陶宛语 - 立陶宛
    "lb": "LU",   // 卢森堡语 - 卢森堡
    "mk": "MK",   // 马其顿语 - 北马其顿
    "mg": "MG",   // 马达加斯加语 - 马达加斯加
    "ml": "IN",   // 马拉雅拉姆语 - 印度
    "mt": "MT",   // 马耳他语 - 马耳他
    "mi": "NZ",   // 毛利语 - 新西兰
    "mr": "IN",   // 马拉地语 - 印度
    "mn": "MN",   // 蒙古语 - 蒙古
    "my": "MM",   // 缅甸语 - 缅甸
    "ne": "NP",   // 尼泊尔语 - 尼泊尔
    "or": "IN",   // 奥里亚语 - 印度
    "ps": "AF",   // 普什图语 - 阿富汗
    "sm": "WS",   // 萨摩亚语 - 萨摩亚
    "gd": "GB",   // 苏格兰盖尔语 - 英国（苏格兰）
    "sr": "RS",   // 塞尔维亚语 - 塞尔维亚
    "st": "ZA",   // 塞索托语 - 南非
    "sn": "ZW",   // 绍纳语 - 津巴布韦
    "sd": "PK",   // 信德语 - 巴基斯坦
    "si": "LK",   // 僧伽罗语 - 斯里兰卡
    "sk": "SK",   // 斯洛伐克语 - 斯洛伐克
    "sl": "SI",   // 斯洛文尼亚语 - 斯洛文尼亚
    "so": "SO",   // 索马里语 - 索马里
    "su": "ID",   // 巽他语 - 印度尼西亚
    "tg": "TJ",   // 塔吉克语 - 塔吉克斯坦
    "ta": "IN",   // 泰米尔语 - 印度
    "te": "IN",   // 泰卢固语 - 印度
    "uz": "UZ",   // 乌兹别克语 - 乌兹别克斯坦
    "cy": "GB",   // 威尔士语 - 英国（威尔士）
    "xh": "ZA",   // 科萨语 - 南非
    "yo": "NG",   // 约鲁巴语 - 尼日利亚
    "zu": "ZA",   // 祖鲁语 - 南非
    "ab": "GE",   // 阿布哈兹语 - 格鲁吉亚（阿布哈兹地区）
    "aa": "ET",   // 阿法尔语 - 埃塞俄比亚
    "ak": "GH",   // 阿坎语 - 加纳
    "an": "ES",   // 阿拉贡语 - 西班牙（阿拉贡地区）
    "as": "IN",   // 阿萨姆语 - 印度
    "av": "RU",   // 阿瓦尔语 - 俄罗斯
    "ay": "BO",   // 艾马拉语 - 玻利维亚
    "ba": "RU",   // 巴什基尔语 - 俄罗斯
    "bm": "ML",   // 班图语 - 马里
    "bi": "VU",   // 比斯拉马语 - 瓦努阿图
    "bo": "CN",   // 藏语 - 中国（西藏地区）
    "br": "FR",   // 布列塔尼语 - 法国（布列塔尼地区）
    "bz": "BY",   // 白俄罗斯语 - 白俄罗斯
    "cb": "RU",   // 车臣语 - 俄罗斯（车臣地区）
    "ch": "GU",   // 查莫罗语 - 关岛
    "cv": "RU",   // 楚瓦什语 - 俄罗斯
    "kw": "GB",   // 康沃尔语 - 英国（康沃尔地区）
    "cr": "CA",   // 克里语 - 加拿大
    "dv": "MV",   // 迪维希语 - 马尔代夫
    "dz": "BT",   // 不丹语 - 不丹
    "ee": "GH",   // 埃维语 - 加纳
    "fj": "FJ",   // 斐济语 - 斐济
    "ff": "SN",   // 富拉语 - 塞内加尔
    "fl": "BE",   // 弗拉芒语 - 比利时
    "gn": "PY",   // 瓜拉尼语 - 巴拉圭
    "gv": "GB",   // 马恩岛语 - 英国（马恩岛）
    "hz": "NA",   // 赫雷罗语 - 纳米比亚


    "ii": "CN",   // 彝语 - 中国
    "ik": "US",   // 伊努庇克语 - 美国（阿拉斯加州）
    "iu": "CA",   // 因纽特语 - 加拿大
    "jv": "ID",   // 爪哇语 - 印度尼西亚
    "kg": "CG",   // 刚果语 - 刚果共和国
    "ki": "KE",   // 基库尤语 - 肯尼亚
    "kj": "NA",   // 宽亚玛语 - 纳米比亚
    "kl": "GL",   // 格陵兰语 - 格陵兰
    "kr": "NG",   // 卡努里语 - 尼日利亚
    "ks": "IN",   // 克什米尔语 - 印度（克什米尔地区）
    "kv": "RU",   // 科米语 - 俄罗斯
    "lg": "UG",   // 干达语 - 乌干达

    "li": "BE",   // 林堡语 - 比利时
    "ln": "CD",   // 林加拉语 - 刚果民主共和国
    "lu": "CD",   // 卢巴-加丹加语 - 刚果民主共和国
    "mh": "MH",   // 马绍尔语 - 马绍尔群岛
    "mo": "MD",   // 摩尔达维亚语 - 摩尔多瓦
    "na": "NR",   // 瑙鲁语 - 瑙鲁
    "nb": "NO",   // 挪威语（书面） - 挪威
    "nd": "ZA",   // 北恩德贝莱语 - 南非
    "ng": "AO",   // 恩敦加语 - 安哥拉
    "nn": "NO",   // 挪威语（新挪威语） - 挪威
    "nr": "ZA",   // 南恩德贝莱语 - 南非
    "nv": "US",   // 纳瓦霍语 - 美国
    "oc": "FR",   // 奥克语 - 法国
    "oj": "CA",   // 奥杰布瓦语 - 加拿大
    "om": "ET",   // 奥罗莫语 - 埃塞俄比亚
    "os": "RU",   // 奥塞梯语 - 俄罗斯
    "qu": "PE",   // 克丘亚语 - 秘鲁
    "rm": "CH",   // 罗曼什语 - 瑞士
    "rn": "BI",   // 基隆迪语 - 布隆迪
    "sc": "IT",   // 撒丁语 - 意大利（撒丁岛）
    "se": "NO",   // 北萨米语 - 挪威
    "sg": "CF",   // 桑戈语 - 中非共和国
    "ss": "SZ",   // 斯威士语 - 斯威士兰



    
    "ti": "ET",   // 提格雷尼亚语 - 埃塞俄比亚
    "tk": "TM",   // 土库曼语 - 土库曼斯坦
    "tl": "PH",   // 他加禄语 - 菲律宾
    "tn": "ZA",   // 茨瓦纳语 - 南非
    "to": "TO",   // 汤加语 - 汤加
    "ts": "ZA",   // 聪加语 - 南非
    "tt": "RU",   // 鞑靼语 - 俄罗斯
    "tw": "GH",   // 契维语 - 加纳
    "ty": "PF",   // 塔希提语 - 法属波利尼西亚
    "ug": "CN",   // 维吾尔语 - 中国（新疆地区）
    "ve": "ZA",   // 文达语 - 南非
    "wa": "BE",   // 瓦隆语 - 比利时
    "wo": "SN",   // 沃洛夫语 - 塞内加尔
}