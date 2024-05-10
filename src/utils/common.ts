import { message } from 'ant-design-vue';
import type { IGiftRuleItem, IRechargeStorageData } from '@/interface/common';
import dayjs from 'dayjs';
import router from '@/router';
import type { RouteLocationRaw } from 'vue-router';
import { RECHARGE_STORAGE_NAME, EXTRA_STORAGE_NAME } from '@/json/common';
import { useUserStore } from '@/stores/user';

export function validatePhone(value: string) {
  if (value && !/^1[3-9][0-9]\d{8}$/.test(value)) {
    return Promise.reject('手机格式错误');
  }
  return Promise.resolve();
}

export function validatePassword(value: string) {
  const isCapital = /[A-Z]+/.test(value),
    isLowercase = /[a-z]+/.test(value),
    isNumber = /[0-9]+/.test(value),
    isChars = /[~!@#$%^&*()-+={}[\]\\;:\'\"\|<>,\./?\_`]+/.test(value);
  // console.log(isCapital, isLowercase, isNumber, isChars);
  if (value && !(/^.{6,16}$/.test(value) && [isCapital, isLowercase, isNumber, isChars].filter((i) => i).length >= 2)) {
    return Promise.reject('密码格式错误');
  }
  return Promise.resolve();
}

export function validateConfirmPassword(value: string, prefix: string) {
  if (value && prefix && value !== prefix) {
    return Promise.reject('两次密码输入不一致');
  }
  return Promise.resolve();
}

export function validateEmail(value: string) {
  const Email = /^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\;))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/;
  if (value && !Email.test(value.replace(/\r+|\n+/g, ';'))) {
    return Promise.reject(new Error('邮箱格式错误'));
  } else {
    return Promise.resolve();
  }
}

export function validateChecked(checked: boolean) {
  if (checked) {
    return Promise.resolve();
  } else {
    return Promise.reject('请先勾选同意协议');
  }
}

// 复制文字
export function copyText(value: string | object, tip: string = '复制成功！') {
  let str = typeof value === 'string' ? value : JSON.stringify(value);
  const oInput = document.createElement('input');
  oInput.value = str;
  document.body.appendChild(oInput);
  oInput.select(); // 选择对象
  document.execCommand('Copy'); // 执行浏览器复制命令
  message.success(tip);
  oInput.remove();
}

export function clearTimer(timer: { value?: number }, type: 'timeout' | 'interval' = 'timeout') {
  if (timer.value) {
    if (type === 'interval') {
      window.clearInterval(timer.value);
    } else {
      window.clearTimeout(timer.value);
    }
    timer.value = undefined;
  }
}

export function getAsterisk(value: string, start: number, end: number, len?: number) {
  if (!value) return '';
  let endTemp = end > 0 ? end : value.length + end;
  let str = '',
    strEnd = len ? start + len : endTemp;
  for (let i = start; i < strEnd; i++) {
    str += '*';
  }
  return value.slice(0, start) + str + value.slice(endTemp);
}

export function getComma(value: number | string, keepPoints: number | 'auto' = 3) {
  let num = Number(value);
  if (num === 0) return 0;
  // Integers and decimals
  let val = Math.abs(num); // 非负数
  let integers = Math.trunc(val); // 整数部分
  let formatIntegers =
    integers > 0
      ? `${integers}`
          .split('')
          .reverse()
          .map((n, i) => (i !== 0 && i % 3 === 0 ? `${n},` : n))
          .reverse()
          .join('')
      : 0;
  let sign = Math.sign(num) < 0 ? '-' : ''; // 正数为 1，负数为 -1，零为 0
  let decimals = `${num}`.split('.')[1]; // 小数部分
  let formatDecimals = decimals ? `.${keepPoints === 'auto' ? decimals : decimals?.padEnd(keepPoints, '0')}` : '';

  return sign + formatIntegers + formatDecimals;
}

export function getQueryparams(data: { [key: string]: any }) {
  const keys = Object.keys(data);
  let str = '';
  keys.forEach((key, index) => {
    str += `${key}=${data[key]}`;
    if (index !== keys.length - 1) {
      str += '&';
    }
  });
  return str;
}

export function convertToCEP(value: number) {
  return value; // 参数：单位为厘，返回值：单位为 CEP，与后端保持一致：1厘 = 1CEP，1￥ = 1000CEP
}

export function transferRMBToCep(rmb: number) {
  // 1.007 浮点数计算精度丢失问题
  let temp = 0;
  let str = `${rmb}`,
    hasPoint = /\./.test(str); // 是否小数点
  if (hasPoint) {
    let arr = str.split('.');
    let digit = arr[1].length; // 小数点位数
    let n = Math.pow(10, digit);
    temp = Math.round(rmb * n * 1000) / n;
  } else {
    temp = rmb * 1000;
  }
  return temp >= 10000 ? `${temp / 10000}w` : `${temp}`;
}

export function transferCepToRMB(cep: number) {
  return cep / 1000;
}

export function judgeEchoRechargeData(
  storageName: string,
  isRemove: boolean = true,
): { canUse: boolean; data?: Omit<IRechargeStorageData['pay'], 'current'> } {
  // 判断是否需要回显购买弹框
  const storageData = getStorage({ name: storageName });
  if (!storageData) return { canUse: false };
  const temp: IRechargeStorageData['pay'] = storageData;
  if (Object.keys(temp).length > 0) {
    const { sid, id, value, giftValue, countdown, current } = temp;
    const diff = dayjs().diff(current, 'second');
    console.log(1, '页面刷新：订单倒计时', diff, countdown);
    const data = { sid, id, value, giftValue, countdown: countdown - diff };
    if (diff < countdown) {
      return { canUse: true, data };
    } else {
      console.log(5, `订单 ${id} 已超时`, countdown - diff);
      isRemove && removeStorage({ name: storageName });
      return { canUse: false, data };
    }
  } else {
    isRemove && removeStorage({ name: storageName });
    return { canUse: false };
  }
}

export function getGiftPercent(value: number, rules: IGiftRuleItem[]) {
  const percent = rules?.find((item) => {
    let { min, max } = item;
    return value >= min && value < max;
  })?.giftPercent;
  return percent;
}

export function setStorage(params: { name: string; data: any; type?: 'session' | 'local' }) {
  // 默认 session
  const { name, data, type } = params;
  const storageData = typeof data === 'string' ? data : JSON.stringify(data);
  if (type === 'local') {
    localStorage.setItem(name, storageData);
  } else {
    sessionStorage.setItem(name, storageData);
  }
}

export function getStorage(params: { name: string; dataType?: 'string' | 'object'; type?: 'session' | 'local' }) {
  // 默认 session，dataType 默认 object
  const { name, dataType, type } = params;
  const storageData = type === 'local' ? localStorage.getItem(name) : sessionStorage.getItem(name);
  if (!storageData) return;
  return dataType === 'string' ? storageData : JSON.parse(storageData);
}

export function removeStorage(params: { name: string; type?: 'session' | 'local' }) {
  // 默认 session
  const { name, type } = params;
  if (type === 'local') {
    localStorage.removeItem(name);
  } else {
    sessionStorage.removeItem(name);
  }
}

export function jumpTo(data: RouteLocationRaw, target: '_self' | '_blank' = '_self') {
  if (typeof data === 'string' && /^http/.test(data)) {
    window.open(data, target);
  } else if (data) {
    router.push(data);
  }
}

// 重新登陆时清除缓存数据
export function clearStorageState() {
  // 购买状态数据
  let values = Object.values(RECHARGE_STORAGE_NAME);
  values.forEach((item) => {
    let names = Object.values(item);
    names.forEach((n) => {
      // todo：待删，原有逻辑是使用了 localStorage，这里暂保存
      localStorage.removeItem(n);
      sessionStorage.removeItem(n);
    });
  });
  // 其他：aigc 弹窗数据
  let extras = Object.values(EXTRA_STORAGE_NAME);
  extras.forEach((n) => {
    // todo：待删，理由同上
    localStorage.removeItem(n);
    sessionStorage.removeItem(n);
  });
}

export function openUrl(text: string) {
  if (/^http/.test(text)) {
    window.open(text, '_blank');
  } else if (!text) {
    message.warn('当前链接为空！');
  }
}

export function toRemValue(v: number) {
  // px
  return v / 16; // rem
}

export function toRem(v: number) {
  return `${toRemValue(v)}rem`; // rem
}

// 判断操作是否需要登录f
export function beforeOperation(func?: Function) {
  const store = useUserStore();
  const token = store.getToken();
  if (!token) {
    isEnv() && message.error('请先登录！');
    store.showLoginModal = true;
  } else {
    func && func();
  }
}

// 判断当前环境，一般默认是开发环境（主要在本地开发使用）
export function isEnv(envs: string[] = ['development', 'production-local']) {
  return envs.includes(import.meta.env.MODE);
}

export function getTime() {
  return new Date().toISOString();
}

export function formatMsg(msg: string) {
  let has = /！$/.test(msg);
  let temp = has ? msg : `${msg}！`;
  return temp;
}

// 处理 GPU 展示
export function getGpuVersionText(version: string) {
  let prefix = ['Ascend', 'RTX', 'A', 'V', 'H'].find((i) => version.includes(i));
  if (prefix) {
    let suffix = version.split(prefix)[1];
    if (suffix === '910ProB') suffix = '910'; // todo：让后端改
    return `${prefix}${suffix}`;
  } else if (/^ComputilityKing-/.test(version)) {
    // let temp = version.split('-')[1];
    // return `算力王 ${temp}`;
    return `天河三芯`;
  } else if (version === 'P40') {
    return 'Tesla P40';
  } else {
    return version;
  }
}

// 0 增加到指定值，time 毫秒
export function numScroll($el: HTMLElement, num: number, time: number = 1500) {
  let init = 0;
  let addNum = Math.max(num / (time / 10), 1);
  let t = setInterval(function () {
    if (init >= num) {
      clearInterval(t);
      $el.innerText = `${num}`;
    } else {
      init += addNum;
      $el.innerText = `${Math.round(init)}`;
    }
  }, 10);
}

export function formatByte(num?: number) {
  if (!num) return '0B';
  if (num > 1024 * 1024 * 1024) {
    return (num / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }
  if (num > 1024 * 1024) {
    return (num / (1024 * 1024)).toFixed(2) + 'MB';
  }
  if (num > 1024) {
    return (num / 1024).toFixed(2) + 'KB';
  }
  return num + 'B';
}
