// 验证码用途
export type AuthPurpose = 
  | 'register'
  | 'login'
  | 'reset_password'
  | 'verify_identity'
  | 'bind_email'
  | 'bind_phone'
  | 'forgot_password'
  | 'delete_account';

// 获取验证码参数
export interface GetLoginCodeParams {
  recipient_type: string; // phone/email
  identifier: string; // 邮箱/手机号
  auth_purpose?: AuthPurpose;
}

// 验证验证码参数
export interface VerifyCodeRequest {
  identifier: string;
  verification_code: string;
  auth_purpose: AuthPurpose;
  recipient_type: string;
}

// 设备信息
export interface DeviceInfo {
  /**
   * 客户端App版本 (如果是Web应用，可以是浏览器版本或Web App版本)
   */
  app_version: string;
  /**
   * 设备型号 (例如: iPhone 15 Pro Max, Samsung S24, MacBook Pro)
   */
  device_model: string;
  /**
   * 设备指纹哈希
   */
  fingerprint: string;
  /**
   * IP地址类型（公共IP/私有IP/VPN），前端根据判断上传 (可选)
   */
  ip_type?: string;
  /**
   * 语言环境
   */
  locale: string;
  /**
   * 网络类型
   */
  network_type: string;
  /**
   * 操作系统类型 (例如: iOS, Android, Windows, macOS, Linux)
   */
  os_type: string;
  /**
   * 操作系统版本
   */
  os_version: string;
  /**
   * 屏幕分辨率
   */
  screen_resolution: string;
  /**
   * 时区
   */
  timezone: string;
  [property: string]: any;
}

// 登录请求参数
export interface LoginRequest {
  auth_type: string; // email/phone
  device_info: DeviceInfo;
  identifier: string; // 邮箱/手机号
  password: string;
  [property: string]: any;
}

// 应用更新信息
export interface AppUpdateInfo {
  latest_version: string;
  minimum_version: string;
  update_message: string; // 更新说明
  update_status: string; // 更新状态
  update_url: string; // 下载链接
  [property: string]: any;
}

// 登录响应
export interface LoginRes {
  app_update_info: AppUpdateInfo;
  token: string;
  [property: string]: any;
}

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
  captcha?: string; // 验证码(可选)
}

// 登录结果
export interface LoginResult {
  token: string;
}

// 修改密码参数
export interface ModifyPasswordReq {
  confirm_password: string; // 确认新密码
  new_password: string; // 新密码
  old_password: string; // 旧密码
  [property: string]: any;
}

// 注册参数
export interface RegisterRequest {
  auth_type: string; // email/phone
  identifier: string; // 邮箱/手机号
  action_token: string; // 验证token
  country_code: string; // 国际区号
}

// 忘记密码重设参数
export interface ForgotPasswordResetRequest {
  /**
   * 邮箱地址或手机号码
   */
  identifier: string;
  /**
   * 新密码
   */
  new_password: string;
  /**
   * 验证码
   */
  verification_code: string;
  [property: string]: any;
}

// 验证码登录请求参数
export interface LoginByVerificationCodeRequest {
  /**
   * 可选值: "email" 或 "phone"
   */
  auth_type: string;
  /**
   * 设备信息
   */
  device_info: DeviceInfo;
  /**
   * 邮箱地址或手机号码
   */
  identifier: string;
  /**
   * 验证码
   */
  verification_code: string;
  [property: string]: any;
}

// 验证码登录API返回结果
export interface LoginByVerificationCodeResult {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: LoginRes;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}