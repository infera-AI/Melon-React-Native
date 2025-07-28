// 获取个人信息请求参数
export interface GetUserInfoParams {
  [property: string]: any;
}

// 头像文件
export interface AvatarFile {
  uri: string;
  name: string;
  type: string;
}

// 修改个人信息请求参数
export interface UpdateProfileRequest {
  username: string; // 用户名
  avatar_file: AvatarFile; // 头像文件路径
  [property: string]: any;
}

// 通用返回结果
export interface CommonResult {
  code: number; // 自定义状态码
  data: null; // 返回数据
  message: string; // 数据说明
  [property: string]: any;
}

// 用户声纹示例返回数据
export interface UserVoiceprintDemoRes {
  /**
   * 输出语言
   */
  output_language: string;
  /**
   * 声纹示例文本
   */
  voiceprint_demo_text: string;
  [property: string]: any;
}

// 用户声纹示例API返回结果
export interface UserVoiceprintDemoResult {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: UserVoiceprintDemoRes;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

// 声纹合成支持的输出语言
export interface SupportedOutputLanguage {
  code: string;
  name: string;
  [property: string]: any;
}

// 声纹试听配置返回数据
export interface VoiceprintDemoConfigRes {
  /**
   * 供试听的文本
   */
  demo_text: string;
  /**
   * 声纹合成支持的输出语言列表
   */
  supported_output_languages: SupportedOutputLanguage[];
  [property: string]: any;
}

// 声纹试听配置API返回结果
export interface VoiceprintDemoConfigResult {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: VoiceprintDemoConfigRes;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

// 生成试听音频请求参数
export interface SynthesizeSpeechRequest {
  /**
   * 试听文本
   */
  text: string;
  [property: string]: any;
}

// 生成试听音频返回数据
export interface SynthesizeSpeechData {
  /**
   * 生成的音频的url
   */
  audio_url: string;
  [property: string]: any;
}

// 生成试听音频API返回结果
export interface SynthesizeSpeechResult {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: SynthesizeSpeechData;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

// 获取声纹录制文本请求参数
export interface GetVoiceprintEnrollmentConfigParams {
  /**
   * 语言环境（zh、en）
   */
  locale?: string;
  /**
   * 声纹注册模式（TEXT_DEPENDENT或TEXT_INDEPENDENT）
   */
  mode?: string;
  [property: string]: any;
}

// 短语
export interface Phrase {
  /**
   * 短语唯一ID，方便后端追踪或前端管理
   */
  id: string;
  text: string;
  [property: string]: any;
}

// 文本依赖配置
export interface TextDependentConfig {
  /**
   * 每段录音最长时长
   */
  max_segment_duration_seconds: number;
  /**
   * 每段录音最短时长
   */
  min_segment_duration_seconds: number;
  /**
   * 具体的短语列表
   */
  phrases: Phrase[];
  /**
   * 需要录制的短语总数
   */
  required_phrases_count: number;
  [property: string]: any;
}

// 文本独立配置
export interface TextIndependentConfig {
  /**
   * 自由说话模式下总共所需最长时长
   */
  max_total_duration_seconds: number;
  /**
   * 自由说话模式下总共所需最短时长
   */
  min_total_duration_seconds: number;
  [property: string]: any;
}

// 声纹录制配置返回数据
export interface VoiceprintEnrollmentConfigRes {
  /**
   * 返回当前请求或默认的模式
   */
  enrollment_mode: string;
  overall_tips: string;
  text_dependent_config: TextDependentConfig;
  text_independent_config: TextIndependentConfig;
  [property: string]: any;
}

// 声纹录制配置API返回结果
export interface VoiceprintEnrollmentConfigResult {
  code: number;
  data: VoiceprintEnrollmentConfigRes;
  message: string;
  [property: string]: any;
}

// 上传声纹录音请求参数
export interface UploadVoiceprintRecordingRequest {
  /**
   * 录音文件
   */
  recording_file: {
    uri: string;
    name: string;
    type: string;
  };
  /**
   * 短语ID
   */
  phrase_id: string;
  /**
   * 录音时长（秒）
   */
  duration: number;
  [property: string]: any;
}

// 上传声纹录音返回数据
export interface UploadVoiceprintRecordingData {
  /**
   * 录音文件ID
   */
  recording_id: string;
  /**
   * 上传状态
   */
  status: string;
  [property: string]: any;
}

// 上传声纹录音API返回结果
export interface UploadVoiceprintRecordingResult {
  code: number;
  data: UploadVoiceprintRecordingData;
  message: string;
  [property: string]: any;
}