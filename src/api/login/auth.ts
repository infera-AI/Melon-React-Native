/**
 * 外部使用时
 * // import { getLoginCodeApi } from '../../api/login'
 *  方式1：
    // getLoginCodeApi({
    //   recipient_type: 'email',
    //   identifier: '775822253@qq.com',
    //   auth_purpose: 'login'
    // }).then((rsp) => {
    //   console.log('rsp-----', rsp);
      
    // }).catch((err) => {
    //   console.log('err----', err);
      
    // })
    方式2：
    // const rsp = await getLoginCodeApi({
    //   recipient_type: 'email',
    //   identifier: '775822253@qq.com',
    //   auth_purpose: 'login'
    // })
    // console.log('rsp11----', rsp);
 * 
 * 验证码登录使用示例：
 * // import { loginByVerificationCode } from '../../api/login/auth'
 * 
 * 方式1：
 * loginByVerificationCode({
 *   auth_type: 'email',
 *   identifier: 'user@example.com',
 *   verification_code: '123456',
 *   device_info: {
 *     app_version: '1.0.0',
 *     device_model: 'iPhone 15 Pro Max',
 *     fingerprint: 'device_fingerprint_hash',
 *     locale: 'zh-CN',
 *     network_type: 'WiFi',
 *     os_type: 'iOS',
 *     os_version: '17.0',
 *     screen_resolution: '1179x2556',
 *     timezone: 'Asia/Shanghai'
 *   }
 * }).then((rsp) => {
 *   console.log('验证码登录成功:', rsp.data.token);
 * }).catch((err) => {
 *   console.log('验证码登录失败:', err);
 * });
 * 
 * 方式2：
 * const rsp = await loginByVerificationCode({
 *   auth_type: 'phone',
 *   identifier: '+8613800138000',
 *   verification_code: '123456',
 *   device_info: {
 *     app_version: '1.0.0',
 *     device_model: 'Samsung S24',
 *     fingerprint: 'device_fingerprint_hash',
 *     locale: 'zh-CN',
 *     network_type: '4G',
 *     os_type: 'Android',
 *     os_version: '14.0',
 *     screen_resolution: '1080x2400',
 *     timezone: 'Asia/Shanghai'
 *   }
 * });
 * console.log('验证码登录成功:', rsp.data.token);
 */
import type { GetLoginCodeParams, LoginRequest, LoginRes, ForgotPasswordResetRequest, ModifyPasswordReq, RegisterRequest, VerifyCodeRequest, LoginByVerificationCodeRequest, LoginByVerificationCodeResult } from './types'
import http from '../../utils/http'
import { API_ENDPOINTS } from '../apiPath';

// 获取验证码
export function getLoginCodeApi(data: GetLoginCodeParams) {
  return http.post<any>(API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE, data)
}

// 验证验证码
export async function verifyCode(data: VerifyCodeRequest) {
  return http.post<any>(API_ENDPOINTS.AUTH.VERIFY_CODE, data);
}

// 设备登录
export function loginWithDevice(params: LoginRequest) {
  return http.post<LoginRes>(API_ENDPOINTS.AUTH.LOGIN, params);    
}

// 修改密码
export function modifyPassword(params: ModifyPasswordReq) {
  return http.post<any>(API_ENDPOINTS.AUTH.MODIFY_PASSWORD, params);
}

// 注册
export function registerWithToken(params: RegisterRequest) {
  return http.post<any>(API_ENDPOINTS.AUTH.REGISTER, params);
}

// 忘记密码重设
export function forgotPasswordReset(params: ForgotPasswordResetRequest) {
  return http.post<any>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET, params);
}

// 退出登录
export function logout(params:{device_fingerprint:string}) {
  return http.post<any>(API_ENDPOINTS.AUTH.LOGOUT, params);
}

// 验证码登录
export function loginByVerificationCode(params: LoginByVerificationCodeRequest) {
  return http.post<LoginByVerificationCodeResult>(API_ENDPOINTS.AUTH.LOGIN_BY_VERIFICATION_CODE, params);
}