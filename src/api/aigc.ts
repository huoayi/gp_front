import { configRequest } from '@/utils/request';
import type { MissionType } from '@/interface/aigc';

const dispatcherRequest = (headers: {} = {}) =>
  configRequest({
    headers,
    baseurl: import.meta.env.VITE_APP_DISPATCHER_BASE_URL,
  });

export function getCategories() {
  return dispatcherRequest().$Axios.get('/sd/v1/prices/categories');
}

export function getPrices(params: {
  gpu_version?: string;
  mission_type?: MissionType['app'][]; // todo：目前只用了应用模式
  mission_category?: string | string[];
  mission_billing_type?: MissionType['billing'] | MissionType['timeBilling'];
}) {
  return dispatcherRequest().$Axios.get('/sd/v1/prices/cheapest', params);
}
