// 登录-获取验证码参数类型
export interface GetLoginCodeParams {
  recipient_type: string; // 登录类型 手机号 phone /邮箱 email   
  identifier: string; // 邮箱地址/手机号码
  auth_purpose?: string;   // 验证码用途，可选值 register login reset_password verify_identity bind_email bind_phone forgot_password
}

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;   // 验证码(可选)
}

// 登录成功，接口响应数据类型
export interface LoginResult {
  token: string;
}

