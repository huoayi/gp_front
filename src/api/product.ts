import request from '@/utils/request';

export function addProduct(data) {
  return request.$Axios.post('/product', data);
}

export function getProductList(params) {
  return request.$Axios.get('/product', { params });
}
