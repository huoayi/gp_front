import { encodeData, closeMission, closeMissions } from '@/api/mission';

export async function closeOffMission(hmacKey: string, id: string) {
  if (!hmacKey) return;
  const encodeResult = await encodeData({}, { 'Hmac-Key': hmacKey, URI: `${'/sd/v1/missions'}/${id}` });
  if (encodeResult.code !== 20000) return;
  const result = await closeMission(id, { 'Hmac-Key': hmacKey, Hmac: encodeResult.data });
  if (result.code !== 20000) return;
  return true;
}

export async function closeOffMissions(hmacKey: string, ids: string[]) {
  if (!hmacKey) return;
  const encodeResult = await encodeData({ ids }, { 'Hmac-Key': hmacKey, URI: '/sd/v1/missions' });
  if (encodeResult.code !== 20000) return;
  const result = await closeMissions(ids, { 'Hmac-Key': hmacKey, Hmac: encodeResult.data });
  if (result.code !== 20000) return;
  return true;
}
