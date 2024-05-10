import { defineStore } from 'pinia';
import { clearTimer, convertToCEP } from '@/utils/common';
import { Modal, message } from 'ant-design-vue';
import router from '@/router';
import { useUserStore } from './user';

interface IState {
  socket: WebSocket | null;
  createdCount: number;
  value: number; // 后端返回的货币值以厘为单位
  timer: { value?: number };
}

export const useBalanceStore = defineStore('balance', {
  state: (): IState => ({
    socket: null,
    createdCount: 0,
    value: 0,
    timer: {},
  }),
  getters: {
    showValue(state) {
      // 前端展示：1￥ = 1000CEP
      return convertToCEP(state.value);
    },
  },
  actions: {
    createSocket() {
      const tk = useUserStore().getToken();
      if (!tk) return;
      if (this.socket) return this.socket;
      const { MODE, VITE_PROD_WSS_URL, VITE_WSS_URL } = import.meta.env;
      const wssurl = MODE === 'production-local' ? VITE_PROD_WSS_URL : VITE_WSS_URL;
      const socket = new WebSocket(`${wssurl}/wallets/ws`);
      this.socket = socket;
      socket.onopen = (e) => {
        console.log(1, 'balance ws open', e);
        this.updateValue(tk);
      };
      let isTelledBalance = false;
      socket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        // console.log(2, 'balance ws message', data);
        // todo：目前只有一种货币，返回的是一个数组
        if (Array.isArray(data)) {
          // 出现多种货币时，需要 symbol_id 做判断
          const { real_amount: num, symbol_id } = data.find((i) => i.symbol_id === '1') || {};
          this.value = num || '0';
        } else if (Object.keys(data).length > 0) {
          const { type, symbol_id } = data;
          if (type === 'balance' && !isTelledBalance) {
            Modal.confirm({
              title: '当前脑力值即将耗尽，请及时购买',
              content: '温馨提示：脑力值扣尽，将自动停用所有临时链接',
              centered: true,
              okText: '前往购买',
              onOk() {
                router.push('/account');
              },
            });
            isTelledBalance = true;
          }
        }
      };
      socket.onclose = (e) => {
        console.log(3, 'balance ws close', e);
        this.closeSocket();
      };
      return this.socket;
    },
    updateValue(tk: string) {
      if (!(this.socket && tk)) return;
      this.socket.send(JSON.stringify({ Authorization: tk }));
      clearTimer(this.timer, 'interval');
      this.timer.value = window.setInterval(
        () => {
          this.socket?.send(JSON.stringify({ Authorization: tk }));
        },
        // todo
        // 9 * 60 * 1000,
        50 * 1000,
      );
    },
    closeSocket() {
      clearTimer(this.timer, 'interval');
      this.socket?.close();
      this.socket = null;
      // 重新创建
      if (useUserStore().isLogining) {
        if (this.createdCount < 1) {
          this.createdCount++;
          this.createSocket();
        } else {
          message.error('监测脑力值变化失败，请尝试刷新页面！');
        }
      }
    },
  },
});
