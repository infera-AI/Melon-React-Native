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

import type { GetLoginCodeParams, LoginParams, LoginResult } from './types'
import http from '../../utils/http'

// 获取验证码接口
export function getLoginCodeApi(data: GetLoginCodeParams) {
  return http.post<any>('/auth/send_verification_code', data)
}

// 用户登录接口
export function loginApi(data: LoginParams) {
  return http.post<LoginResult>('/auth/send_verification_code', data)
}