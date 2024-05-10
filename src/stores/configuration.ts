import { defineStore } from 'pinia';
import dayjs from 'dayjs';
import type { IRechargeListItem, aigcBannerEvent } from '@/interface/common';
import { useUserStore } from './user';

type ActivityName = 'carnival' | 'give-four-times' | 'new-user-reward'; // 目前即将展示的购买优惠活动

interface IState {
  rechargeList: IRechargeListItem[];
  newUserTimer?: number;
  aigcBanners: {
    name: string;
    alt?: string;
    event?: aigcBannerEvent;
    show: boolean;
    afterEnd: boolean;
    end?: string;
  }[]; // 简单判断，特殊情况需要 end，如狂欢节倒计时需要用结束时间
  aigcBannerTimers: Record<string, number>; // key 为 banner.name，value 为 setTimeout 定时器
}

export const useConfigurationStore = defineStore('configuration', {
  state: (): IState => ({
    rechargeList: [],
    newUserTimer: undefined,
    aigcBanners: [],
    aigcBannerTimers: {},
  }),
  getters: {
    isSpring(state) {
      return state.aigcBanners.findIndex((i) => i.name === 'spring' && i.show) !== -1;
    },
  },
  actions: {
    initActivity() {
      this.aigcBanners = [];
      let arr: IState['aigcBanners'] = [];
      for (let i = 0; i < aigcBannerArr.length; i++) {
        let { name, alt, event, start, end } = aigcBannerArr[i];
        let show = false, // 是否展示 banner
          afterEnd = false; // 二者都为 false，可表示还未开始

        if (start && !end) {
          let diff = dayjs().diff(start); // 默认毫秒，现在相比未来时间得到的值是负数
          if (diff < 0) {
            // 还没到开始时间
            this.aigcBannerTimers[name] = window.setTimeout(() => {
              const item = this.aigcBanners.find((i) => i.name === name);
              if (item) {
                item.show = true;
                this.initRechargeList();
              }
            }, -1 * diff);
          } else {
            // 已经超过开始时间了
            show = true;
          }
        } else if (!start && end) {
          show = true; // 初始值
          let diff = dayjs().diff(end);
          if (diff < 0) {
            // 还没到结束时间
            this.aigcBannerTimers[name] = window.setTimeout(() => {
              const item = this.aigcBanners.find((i) => i.name === name);
              if (item) {
                item.afterEnd = true;
                item.show = false;
                this.initRechargeList();
              }
            }, -1 * diff);
          } else {
            // 已经超过结束时间了
            afterEnd = true;
            show = false;
          }
        } else if (start && end) {
          let diff = dayjs(start).diff(end); // 判断开始和结束时间是否合法
          if (diff >= 0) {
            // start 大于 end
            show = false;
          } else {
            let current = dayjs(),
              sDiff = current.diff(start),
              eDiff = current.diff(end);

            if (sDiff < 0) {
              // 还没到开始时间
              this.aigcBannerTimers[name] = window.setTimeout(() => {
                const item = this.aigcBanners.find((i) => i.name === name);
                if (item) {
                  item.show = true;
                  // 重新执行该方法，为设置是否到达结束时间的定时器
                  window.clearTimeout(this.aigcBannerTimers[name]);
                  this.initActivity();
                  this.initRechargeList();
                }
              }, -1 * sDiff);
            } else if (eDiff < 0) {
              show = true; // 已经在开始时间内
              // 还没到结束时间
              this.aigcBannerTimers[name] = window.setTimeout(() => {
                const item = this.aigcBanners.find((i) => i.name === name);
                if (item) {
                  item.afterEnd = true;
                  item.show = false;
                  this.initRechargeList();
                }
              }, -1 * eDiff);
            } else {
              // 已经超过结束时间了
              afterEnd = true;
            }
          }
        } else {
          show = true; // 不存在开始和结束时间，代表长期展示
        }
        arr.push({ name, alt, event, show, afterEnd, end });
      }
      this.aigcBanners = arr;
    },
    initRechargeList() {
      let info = useUserStore().userInfo;
      let createdAt = info?.createdAt;
      if (!createdAt) return; // 登录成功之后这里会有 createdAt 时间
      let currentDiff = dayjs().diff(createdAt); // 在正常情况下一定大于 0
      let diff = currentDiff - 3 * 24 * 60 * 60 * 1000;
      if (diff < 0) {
        // 在新用户注册 3 天内
        this.newUserTimer = window.setTimeout(() => {
          this.initRechargeList();
        }, -1 * diff);
      }
      let arr: IRechargeListItem[] = [];
      rechargeArr.forEach((item) => {
        let { bannerName: name, value, giftPercent, iconType } = item;
        let isShow = name ? this.aigcBanners.find((b) => b.name === name)?.show : true; // 表示新用户 3 天购买优惠活动存在时
        if (isShow) {
          if (iconType === 'new-user') {
            // 是否在新用户注册 3 天内
            diff < 0 && arr.push({ value, giftPercent, iconType });
          } else if (giftPercent && iconType) {
            arr.push({ value, giftPercent, iconType });
          } else {
            arr.push({ value });
          }
        }
      });
      this.rechargeList = arr;
    },
    clearAigcBannerTimers() {
      Object.keys(this.aigcBannerTimers).forEach((key) => {
        window.clearTimeout(this.aigcBannerTimers[key]);
      });
    },
  },
});

// 静态数据
// 默认购买金额列表（元），giftPercent 单位为百分比（参照 ChooseCard.vue 中的 props list）
// 这里的 bannerName 与 aigcBannerArr 的 name 一致，会跟随同步展示
const rechargeArr: (IRechargeListItem & { bannerName?: ActivityName })[] = [
  { value: 100, giftPercent: 200, iconType: 'hot', bannerName: 'carnival' },
  { value: 100, giftPercent: 400, iconType: 'hot', bannerName: 'give-four-times' },
  { value: 100, giftPercent: 100, iconType: 'new-user', bannerName: 'new-user-reward' },
  { value: 9.9 },
  { value: 100 },
  { value: 500 },
  { value: 1000 },
  { value: 3000 },
  { value: 5000 },
  { value: 10000 },
];

// aigc banner
// 点击事件：与 aigc.vue 中的 bannerHandlers 同步，如果找不到对应方法是不执行操作
const aigcBannerArr: {
  name: ActivityName | string;
  alt?: string;
  event?: aigcBannerEvent;
  start?: string; // 展示 banner 的开始时间
  end?: string;
}[] = [
  {
    name: 'spring',
    alt: '端脑云春节活动',
    event: 'goto-spring',
    start: '2024-2-9',
    end: '2024-2-25',
  },
  {
    name: 'purchase-in-spring',
    alt: '端脑云春节活动',
    event: 'goto-recharge',
    start: '2024-2-9',
    end: '2024-2-25',
  },
  // todo：del
  {
    name: 'live-streaming',
    alt: 'Cephalon Cloud 端脑云人工智能 AI 直播课',
    event: 'goto-live-streaming',
    start: '2024-1-26 17',
    end: '2024-2-1 21:30:00',
  },
  {
    name: 'new-user-reward',
    alt: 'Cephalon Cloud 端脑云新用户注册三天内，买 100 送 100，不限次数',
    event: 'goto-recharge',
    start: '2024-2-26',
  },
  { name: 'tianhe', alt: 'Cephalon Cloud 端脑云天河三芯超值算力显卡' },
  { name: 'h100-recruit', alt: 'Cephalon Cloud 端脑云 H100 高端算力节点招募' },
  {
    name: 'competition-vote',
    alt: 'Cephalon Cloud 端脑云和氪学家联名 AI 绘画大赛',
    event: 'goto-vote',
    start: '2024-1-10',
    end: '2024-1-17',
  },
  {
    name: 'aaaki',
    alt: '秋葉aaaki 大神重磅推荐Cephalon Cloud 端脑云',
    event: 'goto-bili-aaaki',
    end: '2024-2-5',
  },
  {
    name: 'competition',
    event: 'goto-competition',
    start: '2023-12-22',
    end: '2024-1-6',
  },
  {
    name: 'carnival',
    event: 'goto-carnival',
    start: '2023-12-22',
    end: '2024-1-6',
  },
  {
    name: 'give-four-times',
    event: 'goto-recharge',
    start: '2023-11-8',
    end: '2023-11-16',
  },
  // {
  //   name: 'discount-primary',
  //   alt: 'Cephalon Cloud 端脑云 GPU 包月价格限时 3.5 折',
  //   event: 'open-first-app',
  // },
  // { name: 'sd', event: 'open-first-app' },
  // {
  //   name: 'ai-box',
  //   alt: 'Cephalon Cloud 端脑云提供端脑 AI 魔盒使闲置 GPU 成为端脑科技算力网络节点',
  //   event: 'open-node-recruit',
  // },
];
