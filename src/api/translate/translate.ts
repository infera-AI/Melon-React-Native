import type { TranslateDocumentRequest, TranslateImageRequest, TranslationTaskResponse, TranslateTextData, TranslateTextRequest, CreateConversationRequest, CreateConversationResponse, TranslateAudioRequest} from './types'
import http from '../../utils/http'
import { API_ENDPOINTS } from '../apiPath';


export function translateDocument(params: TranslateDocumentRequest){
      // 创建FormData对象用于文件上传
    const formData = new FormData();
    formData.append('source_language', params.source_language);
    formData.append('target_language', params.target_language);
    
    formData.append('file', {
      uri: params.file.uri,
      name: params.file.name, 
      type: params.file.type,
    });

    // 使用httpClient的upload方法
    return  http.post<any>(
          API_ENDPOINTS.TRANSLATE.TRANLATE_DOCUMENT,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
    );
}

  /**
   * 翻译图片接口
   * @param params 翻译参数
   * @returns Promise<ApifoxModel>
   */
export function translateImage(params: TranslateImageRequest){
      // 创建FormData对象用于文件上传
      const formData = new FormData();
      formData.append('source_language', params.source_language);
      formData.append('target_language', params.target_language);
      
      
      // 添加所有图片文件
      params.img_files.forEach((file) => {
          formData.append('img_files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      });

      // 使用httpClient的upload方法
      return http.post<any>(
        API_ENDPOINTS.TRANSLATE.TRANLATE_IMAGE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

  }

  /**
   * 翻译音频接口
   * @param params 翻译参数
   * @returns Promise<ApifoxModel>
   */
export function translateAudio(params: TranslateAudioRequest){
      // 创建FormData对象用于文件上传
      const formData = new FormData();
      formData.append('source_language', params.source_language);
      formData.append('target_language', params.target_language);
      
      // 添加音频文件
      formData.append('audio_file', {
        uri: params.audio_file.uri,
        name: params.audio_file.name, 
        type: params.audio_file.type,
      });

      // 使用httpClient的upload方法
      return http.post<any>(
        API_ENDPOINTS.TRANSLATE.TRANLATE_AUDIO,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

  }

/**
 * 获取翻译音频任务详情
 * @param taskId 任务ID
 * @returns Promise<ApifoxModel>
 */
export function getTranslationAudioTask(taskId: string){
  return http.get<any>(
    `${API_ENDPOINTS.TRANSLATE.GET_TRANLATE_AUDIO_TASK}/${taskId}`
  );   
}

  
  /**
   * 获取翻译文档任务详情
   * @param taskId 任务ID
   * @returns Promise<ApifoxModel>
   */
export function getTranslationTask(taskId: string){
      return http.get<TranslationTaskResponse>(
        `${API_ENDPOINTS.TRANSLATE.GET_TRANSLATION_TASK}/${taskId}`
    );   
}

 /**
   * 下载翻译结果
   * @param taskId 任务ID
   * @returns Promise<Blob>
   */
export function downloadTranslationResult(taskId: string){
    return http.get<Blob>(
      `${API_ENDPOINTS.TRANSLATE.GET_TRANSLATION_TASK}/${taskId}/download`,
      {
        responseType: 'blob',
      }
    );
}

  /**
   * 获取图片翻译详情
   * @param params 图片详情请求参数
   * @returns Promise<ApifoxModel>
   */
export function getImageTranslationDetails(taskId: string){
    return http.get<any>(
        `${API_ENDPOINTS.TRANSLATE.GET_TRANSLATION_TASK_IMAGE}/${taskId}`
      );
  }

/**
 * 翻译文本接口
 * @param params 翻译参数
 * @returns Promise<ApifoxModel>
 */
export function translateText(params: TranslateTextRequest){
  return http.post<TranslateTextData>(
    API_ENDPOINTS.TRANSLATE.TRANLATE_TEXT,
      params
    );
}


  /**
 * 创建新会话
 * @param params 会话参数
 * @returns Promise<ApifoxModel>
 */
export function createConversation(params: CreateConversationRequest){
    return http.post<CreateConversationResponse>(
    API_ENDPOINTS.TRANSLATE.CREATE_CONVERSATION,
      params
    );
}

/**
 * 发送消息给语音助手
 */
export function sendMsgToAI(params: any){
    return http.post<any>(
    API_ENDPOINTS.TRANSLATE.SEND_MSG_TO_AI,
      params
    );
}

/**
 * 发送消息给语音助手
 */
export function translationText(params: any){
    return http.post<any>(
    API_ENDPOINTS.TRANSLATE.TRANSLATION_TEXT,
      params
    );
}