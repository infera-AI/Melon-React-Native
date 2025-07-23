export interface ApifoxModel<T = any> {
  code: number;
  data: T;
  message: string;
  [property: string]: any;
}
// 翻译文档请求参数
export interface TranslateDocumentRequest {
  /**
   * 源语言
   */
  source_language: string;
  /**
   * 目标语言
   */
  target_language: string;
  /**
   * 要翻译的文件
   */
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

// 翻译图片请求参数
export interface TranslateImageRequest {
  /**
   * 源语言
   */
  source_language: string;
  /**
   * 目标语言
   */
  target_language: string;
  /**
   * 要翻译的图片文件列表
   */
  img_files: {
    uri: string;
    name: string;
    type: string;
  }[];
}


// 翻译文档任务详情响应数据
export interface TranslationTaskResponse extends ApifoxModel {
  page_count: string;
  request_id: string;
  status: string;
  task_id: string;
  translate_error_message: string;
  translate_file_url: string;
}

// 翻译文本请求参数
export interface TranslateTextRequest {
  /**
   * 文本格式：html/text
   */
  format_type: string;
  /**
   * 支持语言查看：https://help.aliyun.com/zh/machine-translation/support/supported-languages-and-codes?spm=api-workbench.api_explorer.0.0.59593014ULnLuq
   */
  source_language: string;
  source_text: string;
  /**
   * 支持语言查看：https://help.aliyun.com/zh/machine-translation/support/supported-languages-and-codes?spm=api-workbench.api_explorer.0.0.59593014ULnLuq
   */
  target_language: string;
  [property: string]: any;
}


export interface TranslateTextData {
  /**
   * 源语言传入 auto 时，语种识别后的源语言代码
   */
  detected_language: string;
  /**
   * 翻译后的结果
   */
  translated: string;
  /**
   * 总单词数
   */
  word_count: string;
  [property: string]: any;
}

export interface CreateConversationRequest {
  source_language: string;
  target_language: string;
  contact_name?: string;
}

// 创建新会话响应
export interface CreateConversationResponse {
  conversation_id: string;
  status: string;
  message: string;
  request_id: string;
  success: string;
  task_id: string;
}