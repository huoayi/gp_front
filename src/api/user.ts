import type { IPagination, SmsActionType } from '@/interface/common';
import request from '@/utils/request';

export type LoginData =
  | { ticket: string; way: 'ticket' }
  | { phone: string; code: string; way: 'phone_code'; ticket?: string }
  | { phone: string; pwd: string; way: 'phone_pwd'; ticket?: string; code?: string; confirm_pwd?: string }
  | {
      email: string;
      pwd: string;
      way: 'email_pwd';
      ticket?: string;
      code?: string;
      confirm_pwd?: string;
      phone?: string;
      area_code?: string;
    };

export function login(data: LoginData, id?: string) {
  let url = id ? `/login?id=${id}` : '/login';
  // 由于邮箱目前仅在 Cloud 使用，后端对此不区分平台
  if (data.way === 'email_pwd') {
    return request.$Axios.post(url, { ...data });
  } else {
    return request.$Axios.post(url, { ...data, way: 'phone_pwd' });
  }
}

export function getSmsCode(data: {
  phone?: string;
  email?: string;
  action_type: SmsActionType;
  secret_key: string;
  point_dots: string;
}) {
  return request.$Axios.post('/code', { ...data, app_type: 'platform' });
}

export function register(
  data: {
    phone: string;
    code: string;
    pwd: string;
    confirm_pwd: string;
    is_enterprise: boolean;
    enterprise_name?: string;
    ticket?: string;
  },
  id?: string,
) {
  let url = id ? `/register?id=${id}` : '/register';
  return request.$Axios.post(url, data);
}

export function getQrcode() {
  return request.$Axios.get('/qr');
}

export function checkQrScanStatus(ticket: string) {
  return request.$Axios.get('/is_ticket_exist', { ticket });
}

export function bindQrPhone(data: { ticket: string; phone: string; code: string }) {
  return request.$Axios.post('/bind_phone', data);
}

export function verifyUser(data: { code: string; is_email: boolean } | { pwd: string }) {
  return request.$Axios.get('/is_correct', data);
}

export function resetUserPassword(data: { code: string; new_pwd: string }) {
  return request.$Axios.post('/pwd/reset', data);
}

export function resetEmailPassword(data: { email: string; code: string; pwd: string; confirm_pwd: string }) {
  return request.$Axios.post('/pwd/reset/email', data);
}

export function getUserInfo() {
  return request.$Axios.get('/user/info');
}

export function getHmackey() {
  return request.$Axios.get('/get_key');
}

export function checkPhoneExist(params: { phone: string }) {
  return request.$Axios.get('/is-phone-exist', params);
}

export function checkEmailExist(params: { email: string }) {
  return request.$Axios.get('/is-email-exist', params);
}

// 邀请码
export function getInviteCode(data: { type: 'share_register' } = { type: 'share_register' }) {
  return request.$Axios.post('/user/invite/add', data);
}

export function bindInvite(code: string) {
  return request.$Axios.get(`/invite/bind/${code}`);
}

export function getInvitePhone() {
  return request.$Axios.get('/invite/bind');
}

// todo：查询活动是否存在，目前四个活动都用这个字段判断
export function getActivityIsExist() {
  return request.$Axios.get('/campaign/exist');
}

export function getInviteUserList(params: IPagination) {
  return request.$Axios.get('/user/invite-user/list', params);
}

export function getInviteUserGiftList(params: IPagination) {
  return request.$Axios.get('/user/invite-user/gift/list', params);
}

export function getInviteUserGiftCount() {
  return request.$Axios.get('/user/invite-user/gift/statistics');
}

export function queryInviteReward(invite_code: string) {
  return request.$Axios.get('/invite/list', { invite_code, page_index: 1, page_size: 1 });
}

// 版本更新弹框提醒
export function getPopVersion() {
  return request.$Axios.get('user/pop/version');
}

export function editPopVersion(version: string) {
  return request.$Axios.put(`user/pop/${version}`, {});
}

export function getSecretPictrue() {
  return request.$Axios.get('/get_secret_picture');
}
