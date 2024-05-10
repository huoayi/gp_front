import request from '@/utils/request';

// 根据邀请码id获得用户信息
export const queryUserInfoByInviteId = (inviteId: string) => {
  return request.$Axios.get('/invite/user-info', { invite_code: inviteId });
};
