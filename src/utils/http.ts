import { useUserStore, useAppStore } from '@/store'
import { APP_SIGN_ENUM, CODE } from './constants'
import { checkNetwork } from './network'
import { ToastService } from '@/utils/ToastService';
import { i18nService } from '@/utils/i18nService';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface HttpRequestConfig {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
}

interface RequestOptions {
  headers?: Record<string, string>;
  extraConfig?: RequestInit;
  fileType?: string;
  fileName?: string;
}

class HttpRequest {
  private config: HttpRequestConfig;
  private abortControllers = new Map<string, AbortController>();

  constructor(config: HttpRequestConfig = {}) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout || 180000,
      withCredentials: true,
    };
  }

  private getRequestKey(method: Method, url: string): string {
    return `${method}-${url}-${Date.now()}`;
  }

  private getFullUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.config.baseURL || ''}${url}`;
  }

  private handleParams(url: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) return url;
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private async handleHeaders(
    customHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*', // 和 axios 一致
      'Content-Type': 'application/json', // 默认 JSON
    };

    const token = useUserStore.getState().token || useUserStore.getState().verification_token;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 合并自定义 headers，但不强制覆盖 Content-Type（后续会根据 data 类型自动调整）
    return { ...defaultHeaders, ...customHeaders };
  }

  private async request<T>({
    method,
    url,
    params,
    data,
    options = {},
  }: {
    method: Method;
    url: string;
    params?: Record<string, any>;
    data?: any;
    options?: RequestOptions;
  }): Promise<T> {
    const isConnected = await checkNetwork();
    if (!isConnected) {
      console.log('网络检查失败-------');
      ToastService.show({
        message: i18nService.t('network_unavailable')
      });
      throw {
        code: CODE.NETWORK_ERROR,
        message: i18nService.t('network_unavailable'),
      };
    }

    const fullUrl = this.getFullUrl(url);
    const requestUrl = this.handleParams(fullUrl, params);
    let headers = await this.handleHeaders(options.headers); // 注意：用 let 声明，后续会修改

    const requestKey = this.getRequestKey(method, requestUrl);
    const controller = new AbortController();
    this.abortControllers.set(requestKey, controller);
    const timeoutId = setTimeout(() => {
      controller.abort();
      this.abortControllers.delete(requestKey);
    }, this.config.timeout);

    const fetchConfig: RequestInit = {
      method,
      headers: headers,
      signal: controller.signal,
      credentials: this.config.withCredentials ? 'include' : 'omit',
      ...options.extraConfig,
    };

    // -------------------------- 核心逻辑：复刻 axios 的 Content-Type 自动匹配 --------------------------
    if (data) {
      if (data instanceof FormData) {
        // 1. 若 data 是 FormData，自动设置正确的 multipart/form-data（带边界符）
        fetchConfig.body = data;
        delete headers['Content-Type']; // 让浏览器自动添加 `multipart/form-data; boundary=xxx`
      } else {
        // 2. 若 data 是普通对象，强制用 JSON 格式，且 Content-Type 设为 application/json
        fetchConfig.body = JSON.stringify(data);
        headers['Content-Type'] = 'application/json'; // 覆盖自定义的 multipart/form-data
      }
    }
    // 更新 headers（因为可能修改了 Content-Type）
    fetchConfig.headers = headers;
    // -----------------------------------------------------------------------------------

    console.log(
      '🚀 ~ 发起请求 ~\n',
      `URL: ${method} ${requestUrl}\n`,
      `Headers: ${JSON.stringify(headers, null, 2)}\n`,
      `${params ? `Params: ${JSON.stringify(params, null, 2)}\n` : ''}`,
      `${data ? `Data: ${data instanceof FormData ? 'FormData' : JSON.stringify(data, null, 2)}` : ''}`
    );

    try {
      const response = await fetch(requestUrl, fetchConfig);
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestKey);

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      console.log(
        '✅ ~ 收到响应 ~\n',
        `URL: ${method} ${requestUrl}\n`,
        `Status: ${response.status}\n`,
        `Data: ${JSON.stringify(responseData, null, 2)}`
      );

      if (!response.ok) {
        if (response.status === CODE.FORBIDDEN) {
          useUserStore.getState().clearLoginInfo();
          throw {
            code: CODE.FORBIDDEN,
            message: i18nService.t('http_forbidden'),
            data: responseData,
          };
        }

        if (response.status === CODE.UNAUTHORIZED) {
          ToastService.show({
            message: i18nService.t('http_unauthorized')
          });
          throw {
            code: CODE.UNAUTHORIZED,
            message: i18nService.t('http_unauthorized'),
          };
        }

        throw {
          code: response.status,
          message: responseData?.message || i18nService.t('response_error'),
          data: responseData,
        };
      }

      const { code: bizCode, message: bizMsg, data: bizData } = responseData;
      if (bizCode !== undefined && bizCode !== CODE.SUCCESS) {
        ToastService.show({
          message: bizMsg || i18nService.t('http_service_error')
        });

        if (bizCode === CODE.TOKEN_INVALID) {
          useUserStore.getState().clearLoginInfo();
          throw {
            code: bizCode,
            message: i18nService.t('token_expiration'),
            data: bizData,
          };
        }

        throw {
          code: bizCode,
          message: bizMsg,
          data: bizData,
        };
      }

      return (bizData ?? responseData) as T;

    } catch (error: any) {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestKey);

      if (error.name === 'AbortError') {
        console.error('❌ 请求超时或被取消:', requestUrl);
        ToastService.show({
          message: i18nService.t('request_timeout')
        });
        throw {
          code: CODE.TIMEOUT_ERROR,
          message: i18nService.t('request_timeout'),
        };
      }

      console.error(
        '❌ 完整错误信息:',
        `URL: ${method} ${requestUrl}`,
        'error:',
        JSON.stringify(error, null, 2)
      );

      if (!error.code) {
        ToastService.show({
          message: i18nService.t('response_error')
        });
      }

      throw error;
    }
  }

  public get<T>(url: string, params?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'GET', url, params, options });
  }

  public post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'POST', url, data, options });
  }

  public put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'PUT', url, data, options });
  }

  public delete<T>(url: string, params?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'DELETE', url, params, options });
  }

  public patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request({ method: 'PATCH', url, data, options });
  }

  public upload<T>(
    url: string,
    fileUri: string,
    formData?: any,
    options?: RequestOptions
  ): Promise<T> {
    const data = new FormData();
    data.append('file', {
      uri: fileUri,
      type: options?.fileType || 'application/octet-stream',
      name: options?.fileName || fileUri.split('/').pop() || 'file',
    } as any);

    if (formData) {
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
    }

    return this.post(url, data, {
      ...options,
      headers: { ...options?.headers, 'Content-Type': 'multipart/form-data' },
    });
  }
}

const getBaseUrl = () => {
  let appSign = useAppStore.getState().appSign;
  let url = '';
  if (__DEV__) {
    // url = 'http://218.244.147.232:80/api' // 平时用的测试url
    // url = 'http://47.96.234.251/api' // 国内线上url
    url = 'https://api.sinobiz.biz/api';
  } else if (
    appSign === APP_SIGN_ENUM.TYPE_MELON ||
    appSign === APP_SIGN_ENUM.TYPE_MOMOR
  ) {
    url = 'http://47.96.234.251/api'; // 国内线上url
  } else if (
    appSign === APP_SIGN_ENUM.TYPE_MELONS ||
    appSign === APP_SIGN_ENUM.TYPE_MOMORS
  ) {
    url = 'https://api.sinobiz.biz/api'; // 海外线上url
  }
  return { baseURL: url };
};

const http = new HttpRequest(getBaseUrl());
export default http;