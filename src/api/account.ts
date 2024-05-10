import type { IPagination } from '@/interface/common';
import request from '@/utils/request';

// 余额
export interface ICostBillParams extends IPagination {
  id?: string; // 流水 ID
  bill_type?: string;
  bill_way?: string;
  bill_time_begin?: string;
  bill_time_end?: string;
}
export function getCostBills(params: ICostBillParams = { page_index: 1, page_size: 10 }) {
  return request.$Axios.get('/bills', params);
}
