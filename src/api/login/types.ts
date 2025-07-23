// 验证码用途
export type AuthPurpose = 
  | 'register'
  | 'login'
  | 'reset_password'
  | 'verify_identity'
  | 'bind_email'
  | 'bind_phone'
  | 'forgot_password';

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
  app_version: string; // App版本
  device_model: string; // 设备型号
  fingerprint: string; // 设备指纹
  ip_type: string; // IP类型(可选)
  locale: string;
  network_type: string;
  os_type: string; // 操作系统
  os_version: string; // 系统版本
  screen_resolution: string;
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
  action_token: string; // 验证token
  auth_type: string; // email/phone
  confirm_password: string; // 确认新密码
  identifier: string; // 邮箱/手机号
  new_password: string; // 新密码
  [property: string]: any;
}