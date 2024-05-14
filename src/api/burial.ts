import { getTime, isEnv } from '@/utils/common';
import { configRequest } from '@/utils/request';
import { useWebStore } from '@/stores/web';

const burialRequest = configRequest({
  baseurl: import.meta.env.VITE_APP_BURIAL_URL,
});

export function setBurialPoint(params: { creator?: string; type: string; body: {} }) {}
