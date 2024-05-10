<template>
  <custom-modal
    :visible="state.rechargeVisible"
    @update:visible="closeRechargeVisible"
    :class-name="webStore.getClassName('recharge-switch')"
    :full-modal="!webStore.isPc"
    :show-back-icon="hasPrevStep"
    @back="clickRechargeBack"
    v-bind="modalAttrs"
  >
    <template #title>
      <div class="close-icon-header" v-if="!webStore.isPc">
        <img
          v-if="hasPrevStep || state.wapRechargeStatus === 'payment'"
          class="close-icon cursor-pointer"
          src="@/assets/img/go-back-v2.png"
          @click="clickRechargeBack"
        />
        <img v-else class="close-icon" src="@/assets/img/close.png" alt="" @click="closeRechargeVisible(false)" />
      </div>
      <h4 class="wap-title switch-title" v-if="!webStore.isPc">
        {{ state.wapRechargeStatus === 'choose' ? '购买脑力值' : '支付订单' }}
      </h4>
    </template>
    <div class="switch-content">
      <template
        v-if="(webStore.isPc && !state.isPaySuccess) || (!webStore.isPc && state.wapRechargeStatus === 'choose')"
      >
        <h4 v-if="webStore.isPc">选择金额</h4>
        <div class="choose-card-wrapper">
          <choose-card
            :list="rechargeArray"
            :storage-name="RECHARGE_STORAGE_NAME.CHOOSE"
            @item-click="clickChooseItem"
            ref="chooseCardRef"
            :initial-index="state.rechargeInitialIndex"
            v-bind="
              webStore.isPc
                ? {
                    hasTowards: true,
                    dragCardAttrs: {
                      containerId: 'header-choose-list-container',
                      towardsType: 'circle-btn-away-icon',
                      towardItemWidth: 40,
                    },
                  }
                : {}
            "
          ></choose-card>
        </div>
      </template>
      <template v-if="webStore.isPc || state.wapRechargeStatus === 'payment'">
        <h4 class="pay-title" v-if="webStore.isPc && !state.isPaySuccess">支付订单</h4>
        <div class="pay-card-wrapper" :class="{ 'waiting-pay': !state.isPaySuccess }">
          <pay
            :storage-name="RECHARGE_STORAGE_NAME.PAYMENT"
            ref="paymentCardRef"
            :show-type="webStore.isPc ? 'horizontal' : undefined"
            :show-order-invalid-tip="false"
            @order-invalid="handleOrderInvalid"
            @order-succeed="handleOrderSucceed"
          ></pay>
        </div>
      </template>
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, nextTick, onMounted, watch } from 'vue';
import CustomModal from '@/components/Modal.vue';
import ChooseCard, { type IChooseExpose } from '@/components/recharge/ChooseCard.vue';
import Pay, { type IPayExpose } from '@/components/recharge/Pay.vue';
import { useUserStore } from '@/stores/user';
import { RECHARGE_STORAGE_NAME as TEMP_NAME, EXTRA_STORAGE_NAME } from '@/json/common';
import { useWebStore } from '@/stores/web';
import { message, type ModalProps } from 'ant-design-vue';
import { getGiftPercent, setStorage } from '@/utils/common';
import { useConfigurationStore } from '@/stores/configuration';

const RECHARGE_STORAGE_NAME = TEMP_NAME['INTEGRATION'];

const props = withDefaults(defineProps<{ hasPrevStep?: boolean }>(), {
  hasPrevStep: false,
});
const emit = defineEmits<{
  (event: 'prevStep'): void;
  (event: 'orderSucceed'): void;
}>();

const userStore = useUserStore();
const webStore = useWebStore();
const configStore = useConfigurationStore();
const state = reactive({
  rechargeVisible: false,
  isPaySuccess: false,
  rechargeInitialIndex: 0,
  wapRechargeStatus: 'choose' as 'choose' | 'payment', // 由于 wap 端购买是两个页面，所以需要记录状态
  currentValue: { value: 0, giftValue: 0, isHot: false as boolean | undefined }, // 目前选择的价格 ￥，用于刷新失效订单
});
// 购买
const rechargeArray = computed(() =>
  configStore.rechargeList.filter(
    (item) => userStore.isActivityExist || (!userStore.isActivityExist && !item.giftPercent),
  ),
);
const chooseCardRef = ref<IChooseExpose>();
const paymentCardRef = ref<IPayExpose>();
const modalAttrs = computed((): ModalProps => {
  const { isPc } = webStore;
  return isPc
    ? {
        width: state.isPaySuccess ? '31.25rem' : '52.5rem',
        title: '脑力值购买',
      }
    : {
        width: '100%',
      };
});

function saveState() {
  return;
  setStorage({ name: EXTRA_STORAGE_NAME.INTEGRATION, data: state });
}

function clickRecharge() {
  state.rechargeVisible = true;
  let index = webStore.isPc ? 0 : -1;
  state.rechargeInitialIndex = index;
  state.wapRechargeStatus = 'choose';
  nextTick(async () => {
    console.log(1, 'recharge:choose', chooseCardRef.value);
    let { value, giftPercent: customPercent } = rechargeArray.value[0];
    chooseCardRef.value?.changeChooseData(index, '');
    if (!webStore.isPc) return;
    if (userStore.isActivityExist) {
      let giftPercent = customPercent;
      if (!customPercent) {
        // 需要获取价格
        const rules = (await chooseCardRef.value?.getRechargeRules()) || [];
        console.log(1, 'recharge:payment', rules);
        giftPercent = getGiftPercent(value, rules);
      }
      const giftValue = giftPercent ? (value * giftPercent) / 100 : 0,
        isHot = giftPercent && configStore.isSpring ? true : !!customPercent;
      paymentCardRef.value?.createOrder(value, giftValue, isHot);
      // 用于刷新订单
      state.currentValue = { value, giftValue, isHot };
    } else {
      paymentCardRef.value?.createOrder(value, 0);
      state.currentValue = { value, giftValue: 0, isHot: false };
    }
    saveState();
  });
}

function closeRechargeVisible(isDelete?: boolean) {
  console.log(1, '关闭了购买框');
  if (isDelete) {
    // 卡片列表变化引起关闭
    paymentCardRef.value?.closeOrder({ type: 'none', needCallApi: true, isDelete: true });
  } else {
    // 这里是用户关闭
    paymentCardRef.value?.closeOrder();
  }
  chooseCardRef.value?.changeChooseData(-1);
  state.isPaySuccess = false;
  state.rechargeVisible = false;
  saveState();
}

async function clickChooseItem(value: number, giftValue: number, isHot?: boolean) {
  if (!webStore.isPc) {
    state.wapRechargeStatus = 'payment';
  }
  console.log(2, '选择金额生成订单', paymentCardRef.value);
  await paymentCardRef.value?.closeOrder({ type: 'none', needCallApi: true, isDelete: true });
  paymentCardRef.value?.createOrder(value, giftValue, isHot);
  state.currentValue = { value, giftValue, isHot };
  saveState();
}

function handleOrderInvalid() {
  // 失效重新刷个订单
  console.log(2, '失效：刷新订单', paymentCardRef.value, state.currentValue?.value);
  const { value, giftValue, isHot } = state.currentValue || {};
  if (value) {
    paymentCardRef.value?.createOrder(value, giftValue, isHot);
  }
}

function handleOrderSucceed() {
  state.isPaySuccess = true;
  emit('orderSucceed');
}

function clickRechargeBack() {
  console.log(1, '点击了返回');
  const { wapRechargeStatus: status } = state;
  const { hasPrevStep } = props;
  if (webStore.isPc) {
    closeRechargeVisible();
    hasPrevStep && emit('prevStep');
  } else if (status === 'choose') {
    chooseCardRef.value?.changeChooseData(-1);
    state.rechargeVisible = false;
    hasPrevStep && emit('prevStep');
  } else if (status === 'payment') {
    paymentCardRef.value?.closeOrder();
    chooseCardRef.value?.changeChooseData(-1);
    state.wapRechargeStatus = 'choose';
  }
  saveState();
}

watch(
  [() => rechargeArray.value, () => state.rechargeVisible],
  ([arr, visible], [oldArr, oldVisible]) => {
    if (!visible) return;
    if (oldVisible) {
      message.info('购买卡片列表有变化，请重新选择！');
      closeRechargeVisible(true);
    }
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  /* todo：回显缓存，暂存
  const data = getStorage({ name: EXTRA_STORAGE_NAME.INTEGRATION });
  if (data) {
    Object.assign(state, data);
    const { wapRechargeStatus } = state;
    if (webStore.isPc) {
      const { canUse, data } = judgeEchoRechargeData(RECHARGE_STORAGE_NAME.PAYMENT, false);
      if (!data) return;
      if (canUse && data) {
        const chooseData = getStorage({ name: RECHARGE_STORAGE_NAME.CHOOSE });
        if (chooseData) {
          const { index, customValue } = chooseData as IRechargeStorageData['choose'];
          await chooseCardRef.value?.getRechargeRules();
          nextTick(() => {
            chooseCardRef.value?.changeChooseData(index, customValue);
            paymentCardRef.value?.echoRechargeData(data);
          });
        }
      } else {
        nextTick(() => {
          paymentCardRef.value?.echoRechargeData(data);
        });
      }
    } else if (wapRechargeStatus === 'choose') {
      const chooseData = getStorage({ name: RECHARGE_STORAGE_NAME.CHOOSE });
      if (chooseData) {
        const { index, customValue } = chooseData as IRechargeStorageData['choose'];
        nextTick(async () => {
          await chooseCardRef.value?.getRechargeRules();
          chooseCardRef.value?.changeChooseData(index, customValue);
        });
      }
    } else if (wapRechargeStatus === 'payment') {
      const { canUse, data } = judgeEchoRechargeData(RECHARGE_STORAGE_NAME.PAYMENT, false);
      if (canUse && data) {
        nextTick(async () => {
          await chooseCardRef.value?.getRechargeRules();
          paymentCardRef.value?.echoRechargeData(data);
        });
      }
    }
  }
  */
});

// onUnmounted(() => {
//   [RECHARGE_STORAGE_NAME.CHOOSE, RECHARGE_STORAGE_NAME.PAYMENT].forEach((name) => {
//     removeStorage({ name });
//   });
// });

defineExpose<{}>({ clickRecharge });
</script>

<style lang="less" scoped>
.switch-content {
  padding: 0 1.5rem 1.5rem;

  h4 {
    position: relative;
    margin: 1.5rem 0 0.375rem;
    padding-left: 0.625rem;
    height: 1.375rem;
    font-size: 1rem;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.375rem;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 0.125rem;
      height: 1rem;
      background: #8e50ff;
      border-radius: 0.125rem;
    }

    &.pay-title {
      margin: 1.125rem 0 0.75rem;
    }
  }

  .choose-card-wrapper {
    margin-left: -0.375rem;

    :deep(.list-item) {
      .hover-bg {
        background: #3c3c3c;
      }
    }
  }

  .pay-card-wrapper {
    border-radius: 0.375rem;

    &.waiting-pay {
      background: #3c3c3c;
    }
  }
}
</style>

<style lang="less">
// 移动端适配
.recharge-switch-mobile {
  .switch-title {
    padding: 1.5rem;
  }

  .switch-content {
    .pay-card-wrapper {
      border-radius: 0;

      &.waiting-pay {
        background: none;
      }

      .recharge-pay {
        padding: 0;
      }
    }
  }
}
</style>
