import request from '@/utils/request';

export function getCdkDetail(cdk_number: string) {
  return request.$Axios.get('/cdk/detail', { cdk_number });
}

export function useCdk(cdk_number: string) {
  return request.$Axios.put('/cdk/use', { cdk_number });
}
