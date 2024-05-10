<template>
  <div class="recharge-pay-success" v-if="rechargeData.status === 'succeed'">
    <img src="@/assets/img/recharge/success.png" />
    <h3>支付成功</h3>
    <p class="slow-effect">订单编号：{{ rechargeData.sid || rechargeData.id }}</p>
    <p>订单时间：{{ rechargeData.updatedAt }}</p>
    <p>
      <span>脑力值到账：</span>
      <img src="@/assets/img/cep.png" />
      <span class="cep">{{ transferRMBToCep(rechargeData.value) }}</span>
      <span class="gift-cep" v-if="rechargeData.giftValue">+ {{ transferRMBToCep(rechargeData.giftValue) }}</span>
    </p>
    <p>
      <span>支付金额：</span>
      <span>¥ {{ rechargeData.value }}</span>
    </p>
  </div>
  <div class="recharge-pay" :class="{ 'recharge-pay-second': showType === 'horizontal' }" v-else>
    <div class="text-content">
      <p>
        <span>订单编号：{{ rechargeData.sid || rechargeData.id }}</span>
      </p>
      <p>
        <span>脑力值到账：</span>
        <img src="@/assets/img/cep.png" alt="" />
        <span class="cep">{{ transferRMBToCep(rechargeData.value) }}</span>
        <span class="gift-cep" v-if="rechargeData.giftValue">+ {{ transferRMBToCep(rechargeData.giftValue) }}</span>
      </p>
      <p class="sum">
        <span>应付金额：</span>
        <span class="sum-red">¥&nbsp;</span>
        <span class="sum-red value">{{ rechargeData.value.toFixed(2) }}</span>
      </p>
      <p class="way">
        <span>支付方式：</span>
        <img src="@/assets/img/recharge/wx-pay.png" />
        <img src="@/assets/img/recharge/ali-pay.png" />
        <span>使用微信/支付宝扫码支付</span>
      </p>
    </div>
    <template v-if="webStore.isPc">
      <div class="qr-code slow-effect">
        <img :src="rechargeData.qrSrc" v-if="rechargeData.qrSrc" />
      </div>
      <p class="scan" v-if="showType !== 'horizontal'">
        <template v-if="rechargeData.status === 'scanning'">
          <img src="@/assets/img/recharge/loading.gif" />
          <span>正在进行扫码操作，切勿重复支付</span>
        </template>
        <span v-else>请使用对应 App 扫一扫进行扫码付款</span>
      </p>
    </template>
    <Button class="wap-pay-btn" v-else type="primary" size="large" block @click="jumpTo(qrLinkUrl)">立即支付</Button>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import type { IRechargeStorageData } from '@/interface/common';
import { clearTimer, formatMsg, getQueryparams, jumpTo, setStorage, transferRMBToCep } from '@/utils/common';
import { ORDER_COUNTDOWN } from '@/json/common';
import { closeRechargeOrder, queryRechargeOrder } from '@/api/payment';
import qrcode from 'qrcode';
import { message, Button } from 'ant-design-vue';
import { useUserStore } from '@/stores/user';
import { reactive, ref } from 'vue';
import { createRechargeOrder } from '@/api/payment';
import { useWebStore } from '@/stores/web';

interface IProps {
  showType?: 'horizontal' | 'default'; // horizontal 目前用于 Integration.vue
  showOrderInvalidTip?: boolean;
  storageName: string; // 用于刷新时缓存数据，注意：请保证项目中名称唯一性
}
const props = withDefaults(defineProps<IProps>(), { showOrderInvalidTip: true });
const emit = defineEmits<{
  (event: 'orderSucceed'): void;
  (event: 'orderInvalid'): void;
}>();

const webStore = useWebStore();
const store = useUserStore();
type RechargeStatus = 'scanning' | 'pending' | 'succeed' | 'failed';
const rechargeData = reactive({
  // way: 'wx' as PaymentWay, // 支付方式，微信or支付宝
  qrSrc: '', // 二维码地址
  sid: '', // 订单编号，展示
  id: '', // 订单 ID，接口接口
  current: '',
  countdown: 0, // 倒计时
  status: 'pending' as RechargeStatus, // 订单状态
  updatedAt: '', //订单更新时间,
  value: 0, // 值
  giftValue: 0, // 赠送值
});
const rechargeTimer = ref<number>();
const rechargeCostTimer = ref<number>();
const qrLinkUrl = ref<string>('');

const createOrder = async (value: number, giftValue: number, isHot: boolean = false) => {
  console.log(0, '订单金额', value);
  rechargeData.value = value;
  rechargeData.giftValue = giftValue;
  const result = await createRechargeOrder({ type: 'recharge', amount: value * 1000, is_active: isHot });
  if (result.code !== 20000) {
    message.error(formatMsg(result.msg || '创建订单失败，请稍后再试！'));
    return;
  }
  console.log(1, '创建后端订单号', result.data);
  const { id, serial_number } = result.data;
  rechargeData.sid = serial_number;
  rechargeData.id = id;
  rechargeData.countdown = ORDER_COUNTDOWN;
  getQrLink();
  handleRechargeCountdown();
  checkRechargeOrder();
};

async function getQrLink() {
  const { id, value: cost, giftValue: gift } = rechargeData;
  let token = store.getToken();
  if (!token) return;
  // http://192.168.101.21:3000/#/h5-payment
  let tokenTemp = encodeURIComponent(token);
  const urlQuery = { id, cost, gift, tk: tokenTemp };
  let origin = location.origin + location.pathname;
  const { MODE, VITE_TEST_URL, VITE_PROD_URL } = import.meta.env;
  if (MODE === 'development') origin = VITE_TEST_URL;
  if (MODE === 'production-local') origin = VITE_PROD_URL;

  let temp = `${origin}#/h5-payment?${getQueryparams(urlQuery)}`;
  qrLinkUrl.value = temp;
  console.log(2, '获取 Qr link', temp);
  const url = await qrcode.toDataURL(temp, { margin: 3 });
  rechargeData.qrSrc = url;
  saveRechargeData();
}

function saveRechargeData() {
  // 保存购买弹框
  const { storageName } = props;
  if (!storageName) return;
  const { sid, id, value, giftValue, countdown } = rechargeData;
  const temp: IRechargeStorageData['pay'] = { sid, id, value, giftValue, countdown, current: dayjs() };
  setStorage({ name: storageName, data: temp });
}

type EchoData = Omit<IRechargeStorageData['pay'], 'current'>;
function echoRechargeData(data: EchoData) {
  // 回显购买弹框
  if (data) {
    Object.assign(rechargeData, data);
    getQrLink();
    handleRechargeCountdown();
    checkRechargeOrder();
  }
}

function checkRechargeOrder() {
  clearTimer(rechargeTimer);
  rechargeTimer.value = window.setTimeout(async () => {
    const { id } = rechargeData;
    if (id) {
      const result = await queryRechargeOrder(id);
      if (result.code === 20000) {
        const { status, is_locked, updated_at } = result.data;
        if (status === 'succeed') {
          message.success('支付成功！');
          rechargeData.status = 'succeed';
          rechargeData.updatedAt = dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss');
          // todo：待确认：后端会检测到余额变化通知前端更改
          // balanceStore.updateValue(store.getToken());
          emit('orderSucceed');
        } else if (status === 'pending') {
          checkRechargeOrder();
          rechargeData.status = is_locked ? 'scanning' : 'pending';
        } else if (status === 'canceled') {
          resetRechargeDataAndStatus();
        }
        saveRechargeData();
      }
    } else {
      clearTimer(rechargeTimer);
    }
  }, 1000);
}

async function handleRechargeCountdown() {
  clearTimer(rechargeCostTimer, 'interval');
  rechargeCostTimer.value = window.setInterval(async () => {
    if (rechargeData.countdown > 1) {
      rechargeData.countdown--;
      saveRechargeData();
    } else {
      await _closeRechargeOrder({
        msg: props.showOrderInvalidTip ? '订单已过期，请重新下单再发起支付！' : '',
        type: 'error',
        needCallApi: true,
      });
      emit('orderInvalid');
    }
  }, 1000);
}

interface ICloseData {
  msg?: string;
  type: 'error' | 'success' | 'none';
  isDelete?: boolean; // 默认不删除
  needCallApi?: boolean; // 默认不调用
}
async function _closeRechargeOrder(data: ICloseData = { msg: '关闭成功！', type: 'success', needCallApi: true }) {
  console.log(4, '执行了 _closeRechargeOrder');
  const { id, status } = rechargeData;
  const { msg, type, isDelete, needCallApi } = data;
  if (!id) {
    resetRechargeDataAndStatus();
    console.log(4, '关闭订单', '没有找到订单号');
  } else {
    clearTimer(rechargeCostTimer, 'interval');
    clearTimer(rechargeTimer);
    let isCurrentSucceed = status === 'succeed';
    if (needCallApi && !isCurrentSucceed) {
      await closeRechargeOrder(isDelete ? { order_id: id, is_delete: isDelete } : { order_id: id });
    }
    if (msg) {
      if (type === 'error') {
        message.error(msg);
      } else if (type === 'success' && !isCurrentSucceed) {
        message.success(msg);
      }
    }
    resetRechargeDataAndStatus();
    console.log(4, '关闭订单 √');
  }
  return { status };
}

function resetRechargeDataAndStatus() {
  console.log('执行了 resetRechargeDataAndStatus');
  Object.assign(rechargeData, {
    qrSrc: '',
    id: '',
    current: '',
    countdown: 0,
    status: '',
    updatedAt: '',
    value: 0,
    giftValue: 0,
  });
  saveRechargeData();
  clearTimer(rechargeCostTimer, 'interval');
}

export interface IPayExpose {
  createOrder: (value: number, giftValue: number, isHot?: boolean) => void;
  closeOrder: (data?: ICloseData) => Promise<{ status: RechargeStatus }>;
  echoRechargeData: (data: EchoData) => void;
}

defineExpose<IPayExpose>({
  createOrder,
  closeOrder: _closeRechargeOrder,
  echoRechargeData,
});
</script>

<style scoped lang="less">
.slow-effect {
  transition: all 0.8s ease-in-out;
}

.gift-cep {
  margin-left: 0.5rem;
  color: @color-info;
}

.recharge-pay-success {
  padding: 2.5rem 0;
  text-align: center;

  > img {
    width: 6.25rem;
    height: 6.25rem;
  }

  h3 {
    margin: 1rem 0 1.875rem;
    height: 1.75rem;
    font-size: 1.25rem;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.75rem;
  }

  p {
    .flex-mode(row, flex-start);
    margin: 0 auto 0.5rem;
    width: 15.875rem;
    height: 1.25rem;
    font-size: 0.875rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.25rem;
    text-align: start;

    span.cep {
      color: rgba(255, 255, 255, 0.85);
    }

    img {
      width: 0.9375rem;
      height: 0.9375rem;
    }

    &:last-child {
      margin-top: 0.6875rem;
      margin-bottom: 0;
    }
  }
}

.recharge-pay {
  padding: 1.25rem 1.375rem 1.5rem;
  color: @color-text-secondary;

  .text-content {
    color: @color-text-secondary;

    p {
      .flex-mode(row, flex-start);

      &:not(:last-child) {
        margin-bottom: 0.625rem;
      }
    }

    span {
      height: 1.25rem;
      font-size: 0.875rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      line-height: 1.25rem;

      &.cep {
        margin-left: 0.25rem;
      }
    }

    img {
      width: 0.875rem;
      height: 0.875rem;
    }

    .sum {
      display: block;

      &-red {
        font-size: 1rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        color: #ff4646;
        line-height: 1.375rem;
      }
      .value {
        font-size: 1.625rem;
      }
    }

    .way {
      > span {
        white-space: nowrap;
      }

      img {
        margin-right: 0.25rem;
        width: 1.5rem;
        height: 0.875rem;
      }
    }
  }

  .qr-code {
    margin: 1.25rem auto 0.625rem;
    width: 7.875rem;
    height: 7.875rem;

    img {
      width: 100%;
      height: 100%;
      border-radius: 0.3125rem;
    }
  }

  .scan {
    margin-bottom: 0;
    text-align: center;

    span {
      color: @color-text-tertiary;
      font-size: 0.75rem;
    }

    img {
      margin-right: 0.25rem;
      width: 0.875rem;
      height: 0.9375rem;
      filter: opacity(0.45);
    }
  }

  .wap-pay-btn {
    margin-top: 1rem;
  }
}

.recharge-pay-second {
  .flex-mode(row, flex-start);
  padding: 1.5rem;

  .text-content {
    order: 2;
  }

  .qr-code {
    margin: 0 1.5rem 0 0;
    width: 8.3125rem;
    height: 8.3125rem;
    order: 1;

    img {
      width: 100%;
      height: 100%;
      border-radius: 0.3125rem;
    }
  }
}

.is-mobile {
  .recharge-pay-success {
    p {
      width: 16.875rem;
    }
  }
}
</style>
