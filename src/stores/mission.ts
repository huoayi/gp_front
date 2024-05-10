import { defineStore } from 'pinia';
import { clearTimer, getStorage, setStorage } from '@/utils/common';
import { getMissionList } from '@/api/mission';
import type { ICreateMissionData, MissionType } from '@/interface/aigc';

interface IPurchaseData extends ICreateMissionData {
  detailMissionType: MissionType['app']; // 由于单个应用大类存在多个版本
}
interface IState {
  actualSum: number;
  sum: number | string; // 展示已启动的任务数量
  isConfirmKnowMissionNeedManualShutdown: boolean;
  purchaseData?: IPurchaseData; // 点击再次购买：从【我的应用】跳转【AIGC 应用】
  clickType: string;
}

export const useMissionStore = defineStore('mission', {
  state: (): IState => ({
    actualSum: 0,
    sum: 0,
    isConfirmKnowMissionNeedManualShutdown: false, // 是否确认知道任务需要手动关闭，由于只存于前端，那么不受登录态影响
    purchaseData: undefined,
    clickType: 'click',
  }),
  actions: {
    resetSum() {
      this.actualSum = 0;
      this.sum = 0;
    },
    changeSum(num: number) {
      if (this.sum === num) return;
      this.actualSum = num;
      if (!this.sum) {
        this.sum = num;
      } else if (num > 99) {
        let temp = num - Number(this.sum);
        this.sum = temp >= 0 ? `+${temp}` : `${temp}`;
        const timer = window.setTimeout(() => {
          this.sum = num;
          clearTimer({ value: timer });
        }, 1000);
      } else {
        this.sum = num;
      }
    },
    async countPossibleUsingMissions() {
      const result = await getMissionList({
        page_index: 1,
        page_size: 1,
        front_state: ['running'],
      });
      const temp = result.code === 20000 ? result.data.total : 0;
      this.changeSum(temp);
    },
    setIsConfirmKnowMissionNeedManualShutdown(bool: boolean) {
      this.isConfirmKnowMissionNeedManualShutdown = bool;
      setStorage({ name: 'ickmnms', data: bool, type: 'local' });
    },
    getIsConfirmKnowMissionNeedManualShutdown() {
      const value = getStorage({ name: 'ickmnms', type: 'local' });
      if (typeof value === 'boolean') {
        this.isConfirmKnowMissionNeedManualShutdown = value;
      } else {
        this.isConfirmKnowMissionNeedManualShutdown = false;
      }
    },
  },
});
