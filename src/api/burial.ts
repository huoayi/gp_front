import { getTime, isEnv } from '@/utils/common';
import { configRequest } from '@/utils/request';
import { useWebStore } from '@/stores/web';

const burialRequest = configRequest({
  baseurl: import.meta.env.VITE_APP_BURIAL_URL,
});

export function setBurialPoint(params: { creator?: string; type: string; body: {} }) {
  if (isEnv()) return; // 如果是本地，则不调用
  if (!params.creator) return;
  const created_by = getTime();
  const webStore = useWebStore();
  const device = webStore.isPc ? 'pc' : 'phone';
  const body = JSON.stringify({ ...params.body, device });
  return burialRequest.$Axios.post('/collectors', { ...params, body, created_by });
}
