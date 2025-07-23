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
 */
import type { GetLoginCodeParams, LoginRequest, LoginRes, ForgotPasswordResetRequest, ModifyPasswordReq, RegisterRequest, VerifyCodeRequest } from './types'
import http from '../../utils/http'
import { API_ENDPOINTS } from '../apiPath';

// 获取验证码
export function getLoginCodeApi(data: GetLoginCodeParams) {
  return http.post<any>(API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE, data)
}

// 验证验证码
export async function verifyCode(data: VerifyCodeRequest) {
  return http.post(API_ENDPOINTS.AUTH.VERIFY_CODE, data);
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