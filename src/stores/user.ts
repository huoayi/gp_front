import { defineStore } from 'pinia';
import { getUserInfo, getActivityIsExist } from '@/api/user';
import { getAsterisk, getStorage, isEnv, removeStorage, setStorage } from '@/utils/common';
import { NOTIFY_TIME, SERVICE_STOP_TIME } from '@/json/common';
import dayjs from 'dayjs';

export type NotifyKey = keyof typeof NOTIFY_TIME;

interface IState {
  userInfo: {
    userId: string;
    userType: 'phone' | 'email';
    phone: string;
    key: string;
    createdAt: string;
    email: string;
    areaCode: string;
  } | null;
  token: string | null;
  merchantToken: string | null;
  showLoginModal: boolean; // 显示登录弹窗
  isFirstRegister: boolean;
  isActivityExist: boolean | null; // 不受登录态影响
  // 后端服务更新，不展示后台入口
  isNowServiceStop: boolean;
  isConfirmKnowServiceWillStop: boolean; // 是否确认知道后端服务即将更新，由于只存于前端，那么不受登录态影响
  notifyState: { [key in NotifyKey]?: Partial<{ isNow: boolean; isConfirmKnow: boolean }> }; // 公告仅通知，todo：目前有与后端服务更新并用同一个弹窗【临时】
}

export const useUserStore = defineStore('user', {
  state: (): IState => ({
    userInfo: null,
    token: null,
    merchantToken: null,
    showLoginModal: false,
    isFirstRegister: false,
    isActivityExist: null,
    isNowServiceStop: false,
    isConfirmKnowServiceWillStop: false,
    notifyState: {},
  }),
  getters: {
    getAsteriskAccount(state) {
      const { phone = '', email = '', userType } = state.userInfo || {};
      if (email && userType === 'email') {
        const index = email.indexOf('@');
        return getAsterisk(email, 3, index);
      } else {
        return getAsterisk(phone, 3, -4);
      }
    },
    getUserAccount(state) {
      const { phone = '', email = '', userType } = state.userInfo || {};
      if (email && userType === 'email') {
        return email;
      }
      return phone;
    },
    getUserKey(state) {
      return state.userInfo?.key || '';
    },
    isLogining(state) {
      return !!state.userInfo;
    },
  },
  actions: {
    resetState() {
      this.userInfo = null;
      this.setToken('');
      this.setMerchantToken('');
      this.isFirstRegister = false;
    },
    async getUserInfo() {
      try {
        if (this.userInfo) return this.userInfo;
        const result = await getUserInfo();
        if (result.code !== 20000) return 'error';
        this.setUserInfo(result.data);
        return this.userInfo;
      } catch (err: any) {
        if (isEnv() && err.code === 50001) {
          // 已登录的情况下，本地切环境，请求报数据库错误
          // this.resetState();
          // return 'error';
        }
        console.log('get userinfo', err);
        return 'error';
      }
    },
    getToken() {
      if (this.token) return this.token;
      let temp = localStorage.getItem('userToken');
      this.token = temp;
      return temp || '';
    },
    getMerchantToken() {
      if (this.merchantToken) return this.merchantToken;
    },
    setToken(tk: string) {
      this.token = tk;
      setStorage({ name: 'userToken', data: tk, type: 'local' });
    },
    setMerchantToken(tk: string) {
      this.merchantToken = tk;
      setStorage({ name: 'merchantToken', data: tk, type: 'local' });
    },
    setUserInfo(data: any) {
      // const { id: userId, key, phone, user_type: userType, created_at: createdAt, email, area_code: areaCode } = data;
      this.userInfo = data;
    },
    setIsFirstRegister(is: boolean) {
      this.isFirstRegister = is;
      if (is) {
        setStorage({ name: 'isFirstRegister', data: `${is}`, type: 'local' });
      } else {
        localStorage.removeItem('isFirstRegister');
      }
    },
    getIsFirstRegister() {
      let temp = localStorage.getItem('isFirstRegister');
      if (temp) {
        this.isFirstRegister = JSON.parse(temp);
        return this.isFirstRegister;
      } else {
        return false;
      }
    },
    async getIsActivityExist() {
      return;
      if (this.isActivityExist !== null) return this.isActivityExist;
      const result = await getActivityIsExist();
      if (result.code !== 20000) return;
      this.isActivityExist = result.data;
    },
    checkServiceStop() {
      const now = dayjs();
      const { START, END } = SERVICE_STOP_TIME;
      const start = dayjs(START);
      const end = dayjs(END);
      this.isNowServiceStop = now.isAfter(start) && now.isBefore(end);
      return this.isNowServiceStop;
    },
    getServiceWillStop() {
      const now = dayjs();
      const { START } = SERVICE_STOP_TIME;
      const start = dayjs(START);
      const diff = start.diff(now, 'second');
      return { is: diff > 0 && diff < 60 * 60 * 24, diffSecond: diff }; // 一天内
    },
    setIsConfirmKnowServiceWillStop(bool: boolean) {
      this.isConfirmKnowServiceWillStop = bool;
      setStorage({ name: 'icksws', data: bool });
    },
    getIsConfirmKnowServiceWillStop() {
      const value = getStorage({ name: 'icksws' });
      if (typeof value === 'boolean') {
        this.isConfirmKnowServiceWillStop = value;
      } else {
        this.isConfirmKnowServiceWillStop = false;
      }
      return this.isConfirmKnowServiceWillStop;
    },
    setNotifyState() {
      const now = dayjs();
      const keys = Object.keys(NOTIFY_TIME) as NotifyKey[];
      for (let key of keys) {
        const { ADV_START, START, END } = NOTIFY_TIME[key] as any;
        const startTime = ADV_START || START,
          start = dayjs(startTime);
        const end = dayjs(END);
        const temp = now.isAfter(start) && now.isBefore(end);

        // init
        if (!this.notifyState[key]) this.notifyState[key] = {};

        this.notifyState[key]!.isNow = temp;
        if (!temp) removeStorage({ name: `Notify: ${key}`, type: 'local' });

        const value = getStorage({ name: `Notify: ${key}`, type: 'local' });
        if (typeof value === 'boolean') {
          this.notifyState[key]!.isConfirmKnow = value;
        } else {
          this.notifyState[key]!.isConfirmKnow = false;
        }
      }
    },
    confirmKnowNotify(key: NotifyKey) {
      this.notifyState[key]!.isConfirmKnow = true;
      setStorage({ name: `Notify: ${key}`, data: true, type: 'local' });
    },
  },
});
