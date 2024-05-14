import request from '@/utils/request';

export function register(data) {
  return request.$Axios.post('/register', data);
}

export function becomeMerchant(data) {
  return request.$Axios.post('/merchants', data);
}

export function editUserInfo(data) {
  return request.$Axios.put('/user-info', data);
}
