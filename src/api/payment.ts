import request, { configRequest } from '@/utils/request';

export const APPID = {
  WX: 'wxc9390b3187a40264', // 公众号 appId
  ALI: '2021004109681246',
};

// 购买
export function closeRechargeOrder(data: { order_id: string; is_delete?: boolean }) {
  return request.$Axios.del('/orders/transfers', data);
}

export function queryRechargeOrder(id: string, headers?: { Authorization: string }) {
  const url = `/orders/transfers/${id}`;
  return headers ? configRequest({ headers }).$Axios.get(url) : request.$Axios.get(url);
}

export function createRechargeOrder(
  data: ({ target_user_id: string; type: 'manual' } | { type: 'recharge' }) & {
    source_user_id?: string;
    symbol_id?: string;
    amount: number; // cep
    description?: string;
    is_active?: boolean; // todo: 临时活动，买 100 送 400
  },
) {
  return request.$Axios.post('/orders/transfers', data);
}

export type ThirdPartyType = 'manual' | 'recharge_vx' | 'recharge_alipay';
export function createThirdPartyOrder(
  data: { id: string; code: string; type: ThirdPartyType },
  headers: { Authorization: string },
) {
  const { id, ...rest } = data;
  const url = `/orders/transfers/${id}/third-party`;
  return configRequest({ headers }).$Axios.post(url, rest);
}

// 购买活动规则列表
export function getRechargeRuleList() {
  return request.$Axios.get('/campaign/recharge/rule/list');
}
