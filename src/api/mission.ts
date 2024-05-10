import request, { configRequest } from '@/utils/request';
import type { IPagination } from '@/interface/common';
import type { MissionType, CategoryType, TimeBillingType } from '@/interface/aigc';

const dispatcherRequest = (headers: {} = {}) =>
  configRequest({
    headers,
    baseurl: import.meta.env.VITE_APP_DISPATCHER_BASE_URL,
  });

// 预加密
export function encodeData(data: { [key: string]: any }, headers: { [key in 'Hmac-Key' | 'URI']: string }) {
  return configRequest({ headers }).$Axios.post('/hmac_encode_test', data);
}

export function closeMission(id: string, headers: { [key in 'Hmac-Key' | 'Hmac']: string }) {
  return dispatcherRequest(headers).$Axios.del(`/sd/v1/missions/${id}`);
}

export function closeMissions(ids: string[], headers: { [key in 'Hmac-Key' | 'Hmac']: string }) {
  return dispatcherRequest(headers).$Axios.del('/sd/v1/missions', { ids });
}

// 按批次创建任务
export function createMissionsBatch(
  data: {
    type: MissionType['app'];
    call_back_url: string;
    body: string;
    batch_size: number;
    gpu_version?: string;
    billing_type?: MissionType['timeBilling'];
    buy_duration?: number;
    auto_renewal?: boolean;
  },
  headers: { [key in 'Hmac-Key' | 'Hmac']: string },
) {
  return dispatcherRequest(headers).$Axios.post('/sd/v1/missions/batch', data);
}

// 搜索任务批次号列表
export function getMissionBatches(params: { type: MissionType['app'] } & IPagination) {
  return request.$Axios.get('/mission-batches', params);
}

export interface IMissionListParams extends IPagination {
  id?: string;
  front_type?: CategoryType;
  front_way?: 'api' | 'app';
  front_state?: ('waiting' | 'running' | 'expired' | 'closing')[]; // 后端任务：等待和进行状态 | 结束状态 | 进行状态，对应前端展示：运行中 | 已关机 | 启动中
  front_mission_billing_type?: (MissionType['billing'] | MissionType['timeBilling'])[];
  des_start_at?: boolean;
  des_end_at?: boolean;
  des_stop_at?: boolean;
  started_at?: string;
  finished_at?: string;
}
export function getMissionList(params: IMissionListParams) {
  return request.$Axios.get('/user/missions', params);
}

export function getSubMissionsList(params: { mission_ids: string[] }) {
  return request.$Axios.get('/mission-orders/sub', params);
}

// 自动续费 type: hour, day, week, month
export function setAgreementMission(params: { mission_id: string; type: string }) {
  return request.$Axios.post('/agreement/missions', params);
}

export function delAgreementMission(id: string) {
  return request.$Axios.del(`/agreement/missions/${id}`);
}

// 创建续费订单
export function createMissionOrders(data: {
  mission_id: string;
  mission_billing_type: TimeBillingType;
  buy_duration: number;
}) {
  return request.$Axios.post('/orders/missions', data);
}

export function deleteMission(id: string) {
  return request.$Axios.del(`/user/missions/${id}`);
}
