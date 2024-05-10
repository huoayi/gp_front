<template>
  <section class="payment-index">
    <div class="content">
      <h4 class="pay-success">
        <img src="@/assets/img/payment/success.png" />
        <span>支付成功！</span>
      </h4>
      <div>
        <h5 class="price">
          <span class="red">¥ </span>
          <span class="red">{{ state.cost === 0 ? state.cost : state.cost.toFixed(2) }}</span>
        </h5>
        <p class="no">
          <span>订单编号：</span>
          <span>{{ state.id }}</span>
        </p>
        <p class="point">
          <span>脑力值到账：</span>
          <img src="@/assets/img/cep.png" />
          <span>{{ cep }}</span>
          <span class="gift-cep" v-if="giftCep">&nbsp;+{{ giftCep }}</span>
        </p>
      </div>
    </div>
    <Button class="btn" type="primary" @click="close">关闭</Button>
  </section>
</template>

<script setup lang="ts">
import type { PaymentWay } from '@/interface/common';
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from 'ant-design-vue';
import { transferRMBToCep } from '@/utils/common';

const route = useRoute();
const state = reactive<{ id: string; cost: number; giftNum: number; way?: PaymentWay }>({
  id: '',
  cost: 0,
  giftNum: 0,
  way: undefined,
});
const cep = computed(() => (state.cost ? transferRMBToCep(state.cost) : 0));
const giftCep = computed(() => (state.giftNum ? transferRMBToCep(state.giftNum) : 0));

watch(
  () => route.query,
  (query) => {
    // 支付金额、赠送金额、后端订单号
    console.log('query', query);
    const { id, cost, gift, way } = query;
    state.id = id ? `${id}` : '';
    state.way = way as any;
    if (cost) state.cost = Number(cost);
    if (gift) state.giftNum = Number(gift);
  },
  { immediate: true, deep: true },
);

function close() {
  if (state.way === 'wx') {
    wx.closeWindow();
  } else if (state.way === 'ali') {
    ap.popWindow();
  }
}
</script>

<style lang="less" scoped>
@import url(./css/index.less);
</style>
