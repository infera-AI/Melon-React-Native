// 统一定义语言项, app首次打开时的语种选择数据就可以从这个配置中获取
/**
 * import CountryFlag from 'react-native-country-flag';
 * <CountryFlag isoCode="DE" size={25} /> 这个库能根据国家代码渲染图片
 */

export type Language = 'de' | 'en' | 'es' | 'fr' | 'ja' | 'zh';

export type LanguageOption = {
  code: Language; // 对应 json 文件名
  label: string; // 展示在列表中的名称
};

export const supportedLanguages: LanguageOption[] = [
  { code: 'zh', label: '中文'},
  { code: 'de', label: 'Deutsch'},
  { code: 'en', label: 'English'},
  { code: 'es', label: 'Español'},
  { code: 'fr', label: 'Français'},
  { code: 'ja', label: '日本語'}
];

// 语言代码和国家代码映射用于react-native-country-flag找到对应国家图片
export const languageToCountryCode: Record<Language, string> = {
    de: 'DE',
    en: 'US',
    es: 'ES',
    fr: 'FR',
    ja: 'JP',
    zh: 'CN',
}