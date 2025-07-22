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
