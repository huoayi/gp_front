import { defineStore } from 'pinia';

interface IState {
  cloud: {
    hasUploading: boolean;
    abortVisbile: boolean; // 打断上传弹窗
    isNextLogout: boolean; // 仅记录打断的下一步是否是退出
  };
}

export const useDiskStore = defineStore('disk', {
  state: (): IState => ({
    cloud: {
      hasUploading: false,
      abortVisbile: false,
      isNextLogout: false,
    },
  }),
});
