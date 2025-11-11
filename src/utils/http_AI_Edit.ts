// AI以httpOld修改的一版
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios'
import { useUserStore, useAppStore } from '@/store'
import { APP_SIGN_ENUM, CODE } from './constants'
// import { checkNetwork } from './network'
import { ToastService } from '@/utils/ToastService';
import { i18nService } from '@/utils/i18nService';
import { useStore } from 'zustand';

interface HttpRequestConfig extends AxiosRequestConfig {
    baseURL?: string;
    timeout?: number;
    withCredentials?: boolean;
}

interface RequestOptions {
    headers?: Record<string, string>;
    extraConfig?: Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'>;
    fileType?: string;
    fileName?: string;
}

class HttpRequest {
    private instance: AxiosInstance  // 使用从axios导入的AxiosInstance类型
    private readonly config: HttpRequestConfig

    constructor(config: HttpRequestConfig = {}) {
        this.config = {
            baseURL: config.baseURL,
            timeout: config.timeout || 180000,
            // timeout: config.timeout || 30000, // 减少到30秒
            withCredentials: config.withCredentials || false,
            // proxy: {
            //     host: '', // 空主机名，axios 会忽略代理
            //     port: 0
            // }
        }

        this.instance = axios.create(this.config)
        this.setupInterceptors()
    }

    private setupInterceptors() {
        // 请求拦截器
        this.instance.interceptors.request.use(
            async (config: any) => {
                console.log(
                    '🚀 ~ 发起请求 ~\n',
                    `URL: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}\n`,
                    `Headers: ${JSON.stringify(config.headers, null, 2)}\n`,
                    `Params: ${JSON.stringify(config.params, null, 2)}\n`,
                    `Data: ${JSON.stringify(config.data, null, 2)}`
                );

                try {
                    // 临时禁用网络检查，直接跳过
                    console.log('🔍 跳过网络检查（临时调试）');
                    // const isConnected = await checkNetwork()
                    // console.log('🔍 网络检查结果:', isConnected);
                    
                    // if (!isConnected) {
                    //     console.log('❌ 网络检查失败，请求被拦截');
                    //     ToastService.show({
                    //         message: i18nService.t('network_unavailable')
                    //     });
                    //     throw {
                    //         code: CODE.NETWORK_ERROR,
                    //         message: i18nService.t('network_unavailable'),
                    //     }
                    // }

                    // 从store获取token
                    const token = useUserStore.getState().token||useUserStore.getState().verification_token;
                    if (token) {
                        config.headers = {
                            ...config.headers,
                            Authorization: `Bearer ${token}`,
                        }
                    }

                    console.log('✅ 网络检查通过，请求继续发送');
                    console.log('🔍 最终请求配置:', {
                        url: config.url,
                        method: config.method,
                        baseURL: config.baseURL,
                        timeout: config.timeout,
                        headers: config.headers
                    });

                    return config
                } catch (error) {
                    console.log('❌ 请求拦截器内部错误:', error);
                    throw error;
                }
            },
            (error: any) => {
                console.error('❌ 请求错误:', error);
                return Promise.reject(error)
            }
        )

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: any) => {
                console.log(
                    '✅ ~ 收到响应 ~\n',
                    // `response: ${JSON.stringify(response)}`,
                    `URL: ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url}\n`,
                    `Status: ${response.status}\n`,
                    `Data: ${JSON.stringify(response.data, null, 2)}`
                );
                
                const { code, message, data } = response.data

                if (code === CODE.SUCCESS) {
                    return data
                }
                ToastService.show({
                    message: message || i18nService.t('http_service_error')
                });

                if (code === CODE.TOKEN_INVALID) { // token无效
                    const clearLoginInfo = useUserStore(s => s.clearLoginInfo);
                    clearLoginInfo()
                    throw {
                        code,
                        message: i18nService.t('token_expiration'),
                        data,
                    }
                }

             

                throw {
                    code,
                    message,
                    data,
                }
            },
            (error: any) => {
                console.log('http请求失败---', error);
                
                if (error.response) {
                    console.error(
                        '❌ ~ 响应错误 ~\n',
                        `URL: ${error.config.method?.toUpperCase()} ${error.config.url}\n`,
                        `Status: ${error.response.status}\n`,
                        `Data: ${JSON.stringify(error.response.data, null, 2)}`
                    );
                    
                } else {
                    console.error('❌ 网络或请求未送达:', error.message);
                }
                if (error.response.status === CODE.FORBIDDEN) {
                    useUserStore.getState().clearLoginInfo()
                    console.log('Forbidden',useUserStore.getState().token);
                    throw {
                     code: CODE.FORBIDDEN,
                     message: i18nService.t('http_forbidden'),
                     data: error.response.data,
                    }
                 }
                ToastService.show({
                    message: error?.response?.data?.error || i18nService.t('response_error')
                });
                console.error(
                    '❌ 完整错误信息:',
                    'error.code--',
                    `[${error.code}]`,      // 错误代码（如 ECONNREFUSED）
                    '  error.message---',
                    `[${error.message}]`,   // 错误描述
                    '  error.config?.url---',
                    `[${error.config?.url}]`, // 请求 URL
                    '  error.request---',
                    `[${JSON.stringify(error.request)}]`    // 原始请求对象
                );
                // 处理axios错误
                if (error.response) {
                    const status = error.response.status
                    switch (status) {
                        case CODE.UNAUTHORIZED:
                            // store.dispatch({ type: 'user/logout' })
                            ToastService.show({
                                message: i18nService.t('http_unauthorized')
                            });
                            throw {
                                code: CODE.UNAUTHORIZED,
                                message: i18nService.t('http_unauthorized'),
                            }
                            // 其他错误处理...
                    }
                }
                throw error
            }
        )
    }

    

    /**
     * 核心请求方法
     * @param method 请求方法
     * @param url 请求地址
     * @param data 请求数据 (POST/PUT/PATCH)
     * @param params 查询参数 (GET/DELETE)
     * @param options 请求选项
     */

    private async request<T>({
        method,
        url,
        data,
        params,
        options = {},
    }: {
        method: Method
        url: string
        data?: any
        params?: any
        options?: RequestOptions
    }): Promise<T> {
        const config: AxiosRequestConfig = {
        method,
        url,
        params,
        data,
        headers: options.headers,
        ...options.extraConfig,
        }
        return this.instance.request(config);
    }


    public get<T>(url: string, params?: any, options?: RequestOptions): Promise<T> {
        return this.request({
            method: 'GET',
            url,
            params,
            options,
        })
    }

    public post<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.request({
            method: 'POST',
            url,
            data,
            options,
        })
    }

    public put<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.request({
            method: 'PUT',
            url,
            data,
            options,
        })
    }

    public delete<T>(url: string, params?: any, options?: RequestOptions): Promise<T> {
        return this.request({
            method: 'DELETE',
            url,
            params,
            options,
        })
    }

    public patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.request({
            method: 'PATCH',
            url,
            data,
            options,
        })
    }

    public upload<T>(url: string, fileUri: string, formData?: any, options?: RequestOptions): Promise<T> {
        const data = new FormData()
        data.append('file', {
            uri: fileUri,
            type: options?.fileType || 'multipart/form-data',
            name: options?.fileName || fileUri.split('/').pop(),
        })
        
        if (formData) {
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key])
            })
        }

        return this.post(url, data, {
            ...options,
            headers: {
                ...options?.headers,
                'Content-Type': 'multipart/form-data',
            },
        })
    }
}

const getBaseUrl = () => {
    let appSign = useAppStore.getState().appSign
    let url = ''
    if (__DEV__) {
        // url = 'http://218.244.147.232:80/api' // 平时用的测试url
        // url = 'http://47.96.234.251/api' // 国内线上url
        url = 'https://api.sinobiz.biz/api' // 海外线上url
    } else if (
        appSign === APP_SIGN_ENUM.TYPE_MELON ||
        appSign === APP_SIGN_ENUM.TYPE_MOMOR
    ) {
        url = 'http://47.96.234.251/api' // 国内线上url
        
    } else if (
        appSign === APP_SIGN_ENUM.TYPE_MELONS ||
        appSign === APP_SIGN_ENUM.TYPE_MOMORS
    ) {
        url = 'https://api.sinobiz.biz/api' // 海外线上url
    }
    return {
        baseURL: url
    }
}

// 创建默认实例
const http = new HttpRequest(getBaseUrl())

export default http