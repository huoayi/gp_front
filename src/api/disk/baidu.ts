import request from '@/utils/request';

export function getOauthUrl() {
  return request.$Axios.get('/baidu/oauth_url');
}

export function getAccessToken() {
  return request.$Axios.get('/baidu/access_token');
}

export function getUserInfo(access_token: string) {
  return request.$Axios.get('/baidu/user_info', { access_token });
}

export function bindToken(data: { code: string; state: string }) {
  return request.$Axios.post('/baidu/account/bind', data);
}

export function unbindToken() {
  return request.$Axios.del('/baidu/account/bind');
}

export function refreshAccessToken() {
  return request.$Axios.put('/baidu/access_token/refresh', {});
}
