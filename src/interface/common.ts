import type { Dayjs } from 'dayjs';
export interface IPagination {
  page_index: number;
  page_size: number;
}

export type ResponseData<T> = {
  code: number;
  data: T;
  msg: string;
};

export type SmsActionType = 'login' | 'register' | 'modify' | 'bind';

export type CodeStatus = 'success' | 'failed' | 'none';

export interface IVerifyCodeState {
  disabled: boolean;
  isClicked: boolean;
  codeStatus: CodeStatus;
}

export type PaymentWay = 'wx' | 'ali' | 'other'; // 用户当前支付的方式

export interface IRechargeStorageData {
  pay: {
    sid: string; // 订单编号，展示
    id: string; // 订单 ID，接口交互
    value: number;
    giftValue: number;
    countdown: number;
    current: Dayjs;
  };
  choose: {
    index: number;
    customValue: string;
  };
}

// 购买卡片列表项
export interface IRechargeListItem {
  value: number;
  giftPercent?: number;
  iconType?: 'hot' | 'new-user';
}

export interface IGiftRuleItem {
  min: number;
  max: number;
  giftPercent: number;
}

export type aigcBannerEvent =
  | 'goto-bili-aaaki'
  | 'goto-competition'
  | 'goto-vote'
  | 'goto-carnival'
  | 'goto-recharge'
  | 'open-first-app'
  | 'open-node-recruit'
  | 'goto-live-streaming'
  | 'goto-spring';
