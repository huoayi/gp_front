import request from '@/utils/request';
import { configRequest } from '@/utils/request';

export function getArtworks(user_id?: string) {
  return request.$Axios.get('/artwork', { user_id });
}

export function voteArtwork(artwork_id: string) {
  return request.$Axios.post(`/artwork/vote?artwork_id=${artwork_id}`);
}

// 春节活动 ID
const lotto_id = '1752247008487280640';

export function getLotteryRecord(params: any) {
  return request.$Axios.get('/game/prize-wheel/records', { ...params, id: lotto_id });
}

export function doLottery() {
  return request.$Axios.post('/game/prize-wheel', { lotto_id });
}

export function getRemainCount() {
  return request.$Axios.get('/game/prize-wheel/remain-count', { lotto_id });
}

export function getMissionList() {
  return request.$Axios.get(`/game/lotto/rules/${lotto_id}`);
}

export function getGiftList() {
  return request.$Axios.get(`/game/lotto/${lotto_id}`);
}
