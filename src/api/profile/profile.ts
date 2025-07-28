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
import type { GetUserInfoParams, UpdateProfileRequest, CommonResult, UserVoiceprintDemoResult, VoiceprintDemoConfigResult, SynthesizeSpeechRequest, SynthesizeSpeechResult, GetVoiceprintEnrollmentConfigParams, VoiceprintEnrollmentConfigResult, UploadVoiceprintRecordingRequest, UploadVoiceprintRecordingResult } from './types'
import http from '../../utils/http'
import { API_ENDPOINTS } from '../apiPath';

// 获取个人信息
export function getUserInfo(data: GetUserInfoParams) {
  return http.get<any>(API_ENDPOINTS.PROFILE.GET_USER_INFO, data)
}

// 修改个人信息
export function updateProfile(params: UpdateProfileRequest) {
  const formData = new FormData();
  formData.append('username', params.username);
  params.avatar_file&&formData.append('avatar_file', {
    uri: params.avatar_file.uri,
    name: params.avatar_file.name,
    type: params.avatar_file.type,
  });
  return http.post<CommonResult>(API_ENDPOINTS.PROFILE.UPDATE_PROFILE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取用户个人声纹示例
export function getUserVoiceprintDemo() {
  return http.get<UserVoiceprintDemoResult>(API_ENDPOINTS.PROFILE.GET_VOICEPRINT_DEMO);
}

// 获取声纹试听配置信息
export function getVoiceprintDemoConfig() {
  return http.get<VoiceprintDemoConfigResult>(API_ENDPOINTS.PROFILE.GET_VOICEPRINT_DEMO_CONFIG);
}

// 生成试听音频
export function synthesizeSpeech(params: SynthesizeSpeechRequest) {
  return http.post<SynthesizeSpeechResult>(API_ENDPOINTS.PROFILE.SYNTHESIZE_SPEECH, params);
}

// 获取声纹录制文本
export function getVoiceprintEnrollmentConfig(params?: GetVoiceprintEnrollmentConfigParams) {
  return http.get<VoiceprintEnrollmentConfigResult>(API_ENDPOINTS.PROFILE.GET_VOICEPRINT_ENROLLMENT_CONFIG, params);
}

// 上传声纹录音
export function uploadVoiceprintRecording(params: UploadVoiceprintRecordingRequest) {
  const formData = new FormData();
  formData.append('recording_file', {
    uri: params.recording_file.uri,
    name: params.recording_file.name,
    type: params.recording_file.type,
  });
  formData.append('phrase_id', params.phrase_id);
  formData.append('duration', params.duration.toString());
  
  return http.post<UploadVoiceprintRecordingResult>(API_ENDPOINTS.PROFILE.UPLOAD_VOICEPRINT_RECORDING, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
