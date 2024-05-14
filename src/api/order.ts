import request from '@/utils/request';

export function addOrder(data) {
  return request.$Axios.post('/order', data);
}

export function getProductList(params) {
  return request.$Axios.get('/merchant/product', params);
}

export function confirmPayOrder(params) {
  return request.$Axios.post('/pay', params);
}

export function getOrderList(params) {
  return request.$Axios.get('/order', params);
}

export function getEarningList(params) {
  return request.$Axios.get('/merchant/order', params);
}

export function deliverOrder(params) {
  return request.$Axios.put('/merchant/order', params);
}
