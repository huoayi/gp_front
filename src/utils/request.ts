import router from '@/router';
import { message } from 'ant-design-vue';
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { useUserStore } from '@/stores/user';
import type { ResponseData } from '@/interface/common';
import qs from 'qs';
import { useBalanceStore } from '@/stores/balance';
import { useMissionStore } from '@/stores/mission';
import { formatMsg } from './common';

class Request {
  isRequestAborted = false;
  abortTimer = 0;
  static CONFIG = {
    repeat_request_cancel: true, // 是否开启取消重复请求, 默认为 true
    loading: false, // 是否开启loading层效果, 默认为false
    error_message_show: true, // 是否开启接口错误信息展示,默认为true
    code_message_show: false, // 是否开启code不为0时的信息提示, 默认为false
  };
  axios = axios.create();
  requestMap = new Map(); // 网络请求的map集合
  $Axios = {
    get: (url: string, params?: any): Promise<ResponseData<any>> => {
      return new Promise(async (resolve, reject) => {
        try {
          const result: any = await this.axios({
            url,
            method: 'get',
            params,
            paramsSerializer: function (params) {
              return qs.stringify(params, { arrayFormat: 'repeat' });
            },
          });
          resolve(result);
        } catch (err: any) {
          if (err.message) {
            reject(err.message);
          } else {
            reject(err);
          }
        }
      });
    },
    post: (url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<ResponseData<any>> => {
      return new Promise(async (resolve, reject) => {
        try {
          const result: any = await this.axios.post(url, data, config);
          resolve(result);
        } catch (err: any) {
          if (err.message) {
            reject(err.message);
          } else {
            reject(err);
          }
        }
      });
    },
    put: (url: string, data: any): Promise<ResponseData<any>> => {
      return new Promise(async (resolve, reject) => {
        try {
          const result: any = await this.axios.put(url, data);
          resolve(result);
        } catch (err: any) {
          if (err.message) {
            reject(err.message);
          } else {
            reject(err);
          }
        }
      });
    },
    del: (url: string, data?: any): Promise<ResponseData<any>> => {
      // console.log('del', url, data);
      return new Promise(async (resolve, reject) => {
        try {
          const result: any = await this.axios.delete(url, { data });
          resolve(result);
        } catch (err: any) {
          if (err.message) {
            reject(err.message);
          } else {
            reject(err);
          }
        }
      });
    },
  };
  constructor(
    baseURL: string = import.meta.env.VITE_APP_BASE_URL,
    headers?: { [key: string]: string },
    isAborted?: boolean,
  ) {
    this.AxiosInit(baseURL, headers);
    this.isRequestAborted = isAborted || false;
  }
  AxiosInit(baseURL: string, headers?: { [key: string]: string }) {
    this.axios.defaults.baseURL = baseURL;
    this.axios.defaults.timeout = 20000;
    this.axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
    this.axios.defaults.withCredentials = true;
    this.axios.interceptors.request.use(
      (config): InternalAxiosRequestConfig<any> => {
        this.handleRequest(config);
        if (this.isRequestAborted) {
          this.cancelRequest(config);
        } else {
          const store = useUserStore();
          const token = store.getToken();
          const merchantToken = store.getMerchantToken();
          console.log('merchantToken', merchantToken);
          if (token) {
            config.headers.Authorization = token;
            config.headers.MerchantAuthorization = merchantToken;
            console.log('config.headers', config.headers);
          } else {
            const { url, method } = config;
            if (url?.includes('/user/missions') && method === 'get') {
              this.cancelRequest(config);
            }
          }
          if (headers) {
            Object.keys(headers).forEach((key) => {
              config.headers[key] = headers[key];
            });
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
    this.axios.interceptors.response.use(
      (res: AxiosResponse) => {
        this.cancelRequest(res.config);
        if (res.data) {
          const { code, msg } = res.data;
          if (code === 40000) {
            // if (router.currentRoute.value.name !== 'h5-payment') {
            //   message.error('登录凭证失效！', 1, () => {
            //     useUserStore().resetState();
            //     useBalanceStore().closeSocket();
            //     useMissionStore().resetSum();
            //     router.push({ name: 'aigc' });
            //   });
            // } else {
            //   message.error('登录凭证失效，请重新刷新二维码！');
            // }
          } else {
            const digit = Math.round(code / 10000);
            if (digit === 5) {
              message.error('服务异常，请稍后再尝试！');
              return Promise.reject(res.data);
            } else if ([3, 4].includes(digit) && msg) {
              const { url } = res.config;
              const hide = url?.includes('/login') && code === 30013;
              !hide && message.error(formatMsg(msg));
            }
          }

          return res.data || {};
        }
      },
      (error: AxiosError) => {
        this.cancelRequest(error.config);
        if (this.isRequestAborted) {
          window.clearTimeout(this.abortTimer);
          this.abortTimer = window.setTimeout(() => {
            this.isRequestAborted = false;
          }, 1000);
        } else {
          console.log('error', error);
        }

        if (error.config?.url === '/collectors') {
          return Promise.reject(error);
        }

        if (error.response?.status === 429) {
          return Promise.reject({ code: 429 });
        }

        // if (error.code === 'ECONNABORTED') {
        //   const msg = '连接中止，请刷新重试！';
        //   if (error.config?.baseURL !== import.meta.env.VITE_APP_DISK_URL) message.error(msg);
        //   this.isRequestAborted = true;
        //   return Promise.reject(msg);
        // }

        if (!this.isRequestAborted && Request.CONFIG.error_message_show) {
          let msg = '';
          if (error.code === 'ERR_NETWORK') {
            msg = '网络异常，请稍后尝试！';
          }
          if (!msg && error.response) {
            msg = this.handleResponseError(error.response);
          }
          if (msg) message.error(msg);
          return Promise.reject(msg);
        }
        return Promise.reject(error);
      },
    );
  }

  // 请求前的处理
  handleRequest(config: InternalAxiosRequestConfig) {
    if (Request.CONFIG.repeat_request_cancel) {
      // 如果开启了取消配置的话，先取消掉先前的同一条请求，在添加新的请求记录
      this.cancelRequest(config);
      this.addRequest(config);
    }
  }
  // 取消重复请求
  cancelRequest(config?: InternalAxiosRequestConfig) {
    if (!config) return;
    const key = this.getRequestKey(config);
    if (Request.CONFIG.repeat_request_cancel && this.requestMap.has(key)) {
      // 判断是否开启了取消配置，并且map集合中确实存在该条请求的取消函数
      const cancelToken = this.requestMap.get(key);
      cancelToken();
      this.requestMap.delete(key);
    }
  }
  // 添加一条请求记录
  addRequest(config: InternalAxiosRequestConfig) {
    const key = this.getRequestKey(config);
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((c) => {
        // 给某条请求添加请求取消函数
        if (!this.requestMap.has(key)) {
          this.requestMap.set(key, c);
        }
      });
  }
  // 根据请求配置，生成一条唯一的key值
  getRequestKey(config: InternalAxiosRequestConfig) {
    let { url, method, params, data } = config;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
  }
  // 统一处理响应错误
  handleResponseError(err: AxiosResponse) {
    // if (axios.isCancel(err)) return console.error('请求的重复请求：' + error.message);
    let message = '';
    if (err) {
      switch (err.status) {
        case 302:
          message = '接口重定向了！';
          break;
        case 400:
          message = '参数不正确！';
          break;
        case 401:
          message = '您未登录，或者登录已经超时，请先登录！';
          break;
        case 403:
          message = '您没有权限操作！';
          break;
        case 404:
          message = `请求地址出错: ${err.config?.url}`;
          break; // 在正确域名下
        case 408:
          message = '请求超时！';
          break;
        case 409:
          message = '系统已存在相同数据！';
          break;
        case 500:
          message = '服务繁忙！';
          break;
        case 501:
          message = '服务未实现！';
          break;
        case 502:
          message = '网关错误！';
          break;
        case 503:
          message = '服务不可用！';
          break;
        case 504:
          message = '服务暂时无法访问，请稍后再试！';
          break;
        case 505:
          message = 'HTTP版本不受支持！';
          break;
        default:
          message = '异常问题，请稍后再试！';
          break;
      }
    }
    return message;
  }
}

export default new Request();

export const configRequest = (data: { baseurl?: string; headers?: { [key: string]: string }; isAborted?: boolean }) => {
  const { baseurl, headers, isAborted } = data;
  return new Request(baseurl, headers, isAborted);
};
