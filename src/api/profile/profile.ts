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
import type { 
  GetUserInfoParams, 
  UpdateProfileRequest, 
  CommonResult, 
  UserVoiceprintDemoResult, 
  VoiceprintDemoConfigResult, 
  SynthesizeSpeechRequest, 
  SynthesizeSpeechResult, 
  GetVoiceprintEnrollmentConfigParams, 
  VoiceprintEnrollmentConfigResult, 
  UploadVoiceprintRecordingRequest, 
  UploadVoiceprintRecordingResult, 
  GenerateVoiceIdRequest, 
  GenerateVoiceIdResult, 
  SubmitFeedbackRequest, 
  SubmitFeedbackResult, 
  GetFeedbackTypeChoicesParams, 
  GetFeedbackTypeChoicesResult, 
  VerifyIdentityByPasswordRequest, 
  VerifyIdentityByPasswordResult, 
  DeleteAccountRequest, 
  DeleteAccountResult, 
  TranslateTextRequest, 
  TranslateTextResult,
  BindingInfoResult,
  SendVerificationCodeToNewRequest,
  SendVerificationCodeToNewResult,
  GetDeviceInfosParams,
  GetDeviceInfosResult,
  ForgotPasswordResetNewRequest,
  ForgotPasswordResetNewResponse
} from './types'
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

// 生成用户声纹信息
export function generateVoiceId(params: GenerateVoiceIdRequest) {
  const formData = new FormData();
    formData.append('audio_file', {
      uri: params.audio_file.uri,
      name: params.audio_file.name,
      type: params.audio_file.type,
    });
  
  return http.post<GenerateVoiceIdResult>(API_ENDPOINTS.PROFILE.GENERATE_VOICE_ID, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }); 
}

// 提交用户反馈
export function submitFeedback(params: SubmitFeedbackRequest) {
  const formData = new FormData();
  formData.append('type', params.type);
  formData.append('content', params.content);
  formData.append('contact', params.contact);
  
  // 如果有相关截图，添加到表单中
  if (params.related_shortcut_imgs) {
    params.related_shortcut_imgs?.forEach((item: any ) => {
      formData.append('related_shortcut_imgs', {
        uri: item.uri,
        name: item.name,
        type: item.type,
      });
    });
  }
  console.log(formData,'formData')
  
  return http.post<SubmitFeedbackResult>(API_ENDPOINTS.PROFILE.SUBMIT_FEEDBACK, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取反馈类型列表
export function getFeedbackTypeChoices(params?: GetFeedbackTypeChoicesParams) {
  return http.get<any>(API_ENDPOINTS.PROFILE.GET_FEEDBACK_TYPE_CHOICES, params);
}

// 密码认证身份
export function verifyIdentityByPassword(params: VerifyIdentityByPasswordRequest) {
  return http.post<VerifyIdentityByPasswordResult>(API_ENDPOINTS.PROFILE.VERIFY_IDENTITY_BY_PASSWORD, params);
}

// 注销用户
export function deleteAccount(params: DeleteAccountRequest) {
  return http.post<DeleteAccountResult>(API_ENDPOINTS.PROFILE.DELETE_ACCOUNT, params);
}

// 翻译文本
export function translateText(params: TranslateTextRequest) {
  return http.post<TranslateTextResult>(API_ENDPOINTS.TRANSLATE.TRANLATE_TEXT, params);
}

// 获取账户绑定信息
export function getBindingInfos() {
  return http.get<BindingInfoResult>(API_ENDPOINTS.PROFILE.GET_BINDING_INFOS);
}

// 发送验证码到新邮箱或手机号
export function sendVerificationCodeToNew(params: SendVerificationCodeToNewRequest) {
  return http.post<SendVerificationCodeToNewResult>(API_ENDPOINTS.PROFILE.SEND_VERIFICATION_CODE_TO_NEW, params);
}

// 忘记密码重设
export function forgotPasswordReset(params: ForgotPasswordResetNewRequest) {
  return http.post<ForgotPasswordResetNewResponse>(API_ENDPOINTS.PROFILE.FORGOT_PASSWORD_RESET, params);
}

// ----------- 声纹相关 ------------

// 获取全部公共声纹
export function getCommonVoiceprints() {
  return http.get<CommonResult>(API_ENDPOINTS.PROFILE.GET_COMMON_VOICEPRINTS);
}

// 获取全部个人声纹
export function getPersonalVoiceprints() {
  return http.get<CommonResult>(API_ENDPOINTS.PROFILE.GET_PERSONAL_VOICEPRINTS);
}

// 重命名声纹
export function renameVoiceprint(params: { id: number; name: string }) {
  return http.post<any>(
    API_ENDPOINTS.PROFILE.RENAME_VOICEPRINT,
    params,
  );
}

// 删除声纹
export function deleteVoiceprint(params: { id_list: number[] }) {
  return http.post<CommonResult>(API_ENDPOINTS.PROFILE.DELETE_VOICEPRINT, params);
}

// 保存声纹
export function saveVoiceprint(params: { material_id: number; name: string }) {
  const formData = new FormData();
  formData.append('material_id', params.material_id.toString());
  formData.append('name', params.name);
  return http.post<CommonResult>(API_ENDPOINTS.PROFILE.SAVE_VOICEPRINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取全部素材
export function getAllMaterials() {
  return http.get<CommonResult>(API_ENDPOINTS.PROFILE.GET_ALL_MATERIALS);
}

// 删除声纹素材
export function deleteMaterials(params: { id_list: number[] }) {
  return http.post<CommonResult>(API_ENDPOINTS.PROFILE.DELETE_MATERIALS, params);
}

// 保存声纹素材
export function saveMaterials(params: { material_id?:string,name: string; file_list: any[] ,name_list:string[]}) {
  return http.post<CommonResult>(API_ENDPOINTS.PROFILE.SAVE_MATERIALS, params);
}

//训练声纹
export function trainVoiceprint(params: { voice_print_id: number }) {
  const formData = new FormData();
  formData.append('voice_print_id', params.voice_print_id.toString());
  return http.post<CommonResult>(API_ENDPOINTS.PROFILE.TRAIN_VOICEPRINT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取积分余额
export function getPointsBalance() {
  return http.get<CommonResult>(API_ENDPOINTS.PROFILE.GET_INTEGRAL_BALANCE);
}

// 获取积分记录
export function getPointsRecord() {
  return http.get<CommonResult>(API_ENDPOINTS.PROFILE.GET_INTEGRAL_RECORD);
}

// 获取邀请码
export function getInvitationCode() {
  return http.post<any>(API_ENDPOINTS.PROFILE.GET_INVITATION_CODE);
}

// 验证邀请码
export function verifyInvitationCode(params: { invitation_code: string }) {
  return http.post<any>(API_ENDPOINTS.PROFILE.VERIFY_INVITATION_CODE, params);
}

// 获取声纹录制文本
export function getVoiceprintEnrollmentConfig(params:{language:string}) {
  return http.get<VoiceprintEnrollmentConfigResult>(API_ENDPOINTS.PROFILE.GET_VOICEPRINT_ENROLLMENT_CONFIG, params);
}





 



