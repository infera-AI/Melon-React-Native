// 常量定义
// TODO: 定义全局常量
export const CODE = {
  SUCCESS: 200,           // 成功
  BAD_REQUEST: 400,       // 错误请求
  UNAUTHORIZED: 401,      // 未授权
  FORBIDDEN: 403,         // 禁止访问
  NOT_FOUND: 404,         // 未找到
  SERVER_ERROR: 500,      // 服务器错误
  TOKEN_INVALID: 1001,    // token无效
  NETWORK_ERROR: 1002,    // 网络错误
  UNKNOWN_ERROR: 9999,    // 未知错误
} as const

// TODO: APP标识
export const APP_SIGN_ENUM = {
  TYPE_MELON: 'melon',         // 收费国内版
  TYPE_MELONS: 'melons',       // 收费海外版
  TYPE_MOMOR: 'momor', // 免费国内版
  TYPE_MOMORS: 'momors', // 免费海外版
} as const

// 积分扣除
export const POINTS_DEDUCTION = {
  GENERATE_MUSIC: 50, // 音乐生成
  COVER_MUSIC: 50, // 翻唱
  GENERATE_AND_COVER: 100, // 音乐生成+翻唱
  CLONE_VOICEPRINT: 500, // 声音克隆
  TRANSLATE_VIDEO: 15,
  TRANSLATE_DOCUMENT: 5,
  TRANSLATE_EXTERNAL_SPEAKER: 1,
} as const
