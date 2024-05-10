<template>
  <Spin :spinning="spinning">
    <section class="payment-index">
      <div class="content">
        <h4>正在进行购买支付…</h4>
        <div>
          <h5>
            <img src="@/assets/img/cep.png" />
            <span>{{ cep }}</span>
            <span class="gift-cep" v-if="giftCep">&nbsp;+{{ giftCep }}</span>
          </h5>
          <p class="no">
            <span>订单编号：</span>
            <span>{{ state.id }}</span>
          </p>
          <p class="sum">
            <span>应付金额：</span>
            <span class="sum-cost red">¥ {{ state.cost }}</span>
          </p>
        </div>
      </div>
      <Button class="btn" type="primary" @click="confirm" :loading="loading">确认支付</Button>
    </section>
  </Spin>
</template>

<script setup lang="ts">
import { watch, ref, reactive, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, message, Spin } from 'ant-design-vue';
import { APPID, queryRechargeOrder, type ThirdPartyType, createThirdPartyOrder } from '@/api/payment';
import type { PaymentWay } from '@/interface/common';
import { getQueryparams, transferRMBToCep } from '@/utils/common';

const router = useRouter();
const route = useRoute();

const state = reactive<{
  id: string;
  cost: number; // ￥
  giftNum: number; // ￥
  way?: PaymentWay;
  thirdType?: ThirdPartyType;
  headers?: { Authorization: string };
  status: string;
  // auth_code: string;
}>({ id: '', cost: 0, giftNum: 0, way: undefined, status: '' });
const cep = computed(() => (state.cost ? transferRMBToCep(state.cost) : 0));
const giftCep = computed(() => (state.giftNum ? transferRMBToCep(state.giftNum) : 0));
const thirdApiData = ref();
const spinning = ref(false);
const loading = ref(false);

type UsePaymentWay = Exclude<PaymentWay, 'other'>;
const typeMapping: { [key in UsePaymentWay]: ThirdPartyType } = {
  wx: 'recharge_vx',
  ali: 'recharge_alipay',
};

watch(
  () => route.query,
  (query) => {
    // 后端订单号、支付金额、赠送金额
    console.log('query', query);
    const { id, cost, gift } = query;
    if (!id) {
      message.error('当前没有订单编号！');
      return;
    } else {
      state.id = `${id}`;
    }
    if (cost) state.cost = Number(cost);
    if (gift) state.giftNum = Number(gift);
    // 1. 区分微信、支付宝客户端内置浏览器
    const { userAgent } = window.navigator;
    if (/MicroMessenger/.test(userAgent)) {
      console.log(1, '微信');
      state.way = 'wx';
    } else if (/AlipayClient/.test(window.navigator.userAgent)) {
      console.log(1, '支付宝');
      state.way = 'ali';
    } else {
      console.log(1, '其他浏览器');
      state.way = 'other';
    }
    // 获取第三方订单号
    getThirdApiData();
  },
  { immediate: true, deep: true },
);

function checkEnv() {
  const { way: payWay, tk } = route.query;
  if (!tk) {
    message.error('缺失登录凭证，无法支付！');
    return;
  }
  state.headers = { Authorization: `${tk}` };
  if (state.way === 'other') {
    message.error('请在微信或支付宝中完成支付！');
    return;
  }
  return true;
}

function checkCurrentPayEnv(currentWay: UsePaymentWay, orderType: ThirdPartyType) {
  // 以 orderType 为准
  const currentType = typeMapping[currentWay];
  if (currentType !== orderType) {
    message.error(`请在${currentWay === 'wx' ? '支付宝' : '微信'}中完成支付！`);
    return false;
  }
  return true;
}

async function getThirdApiData() {
  try {
    spinning.value = true;
    // 可以排除其他浏览器
    const temp = checkEnv();
    if (!temp) return;
    const { id, way: wayTemp, headers } = state;
    const way = wayTemp as UsePaymentWay;
    if (!headers) return;
    // 2. 获取第三方订单号
    if (!id) return;
    const result = await queryRechargeOrder(id, headers);
    if (result.code !== 20000) return;
    const { third_api_resp, status, type: third_type } = result.data;
    state.status = status;
    if (status === 'canceled') {
      message.error('订单已被取消，请重新下单！');
    } else {
      console.log(2, '订单号正在使用');
      if (third_api_resp) {
        thirdApiData.value = JSON.parse(third_api_resp);
        console.log(3, '已有第三方订单号', thirdApiData.value);
        // 需要判断当前支付环境和第三方订单号的支付环境是否一致
        state.thirdType = third_type;
        checkCurrentPayEnv(way, third_type);
      } else {
        // 创建第三方订单号
        let type = typeMapping[way] as ThirdPartyType,
          apiCode = getCode(way);
        console.log(3, '支付方式:', type, 'code:', apiCode);
        if (!apiCode) return;
        const { code, data } = await createThirdPartyOrder({ id, type, code: apiCode }, headers);
        if (code === 20000) {
          console.log(3, '创建第三方订单号 √', data);
          thirdApiData.value = data;
          state.thirdType = typeMapping[way];
        }
      }
    }
  } catch (err) {
    console.log(4, '获取第三方订单号', err);
  } finally {
    spinning.value = false;
  }
}

function confirm() {
  const temp = checkEnv();
  if (!temp) return;
  const { status, way: wayTemp, thirdType } = state;
  const way = wayTemp as UsePaymentWay;
  if (!thirdType) return;
  if (status === 'canceled') {
    message.error('订单已被取消，请重新下单！');
    return;
  }
  const { pay_info } = thirdApiData.value || {};
  if (!(thirdApiData.value && pay_info)) {
    console.log(5, '获取不到 pay_info');
    if (state.status === 'succeed') {
      message.info('订单已经完成，请重新下单！');
    } else {
      message.error('订单异常问题，请联系管理员！');
    }
    return;
  }
  const check = checkCurrentPayEnv(way, thirdType);
  if (!check) return;
  if (state.way === 'wx') {
    callwx();
  } else if (state.way === 'ali') {
    callAli();
  }
}

function getCode(way: UsePaymentWay) {
  console.log(3, 'search:', location.search, 'router.query:', route.query);
  if (way === 'wx') {
    return getWxCode();
  } else if (way === 'ali') {
    return getAliCode();
  }
}

function getWxCode() {
  let codeTemp = location.search.split('code=')[1]?.split('&state')[0];
  if (codeTemp) return codeTemp;
  // 重定向到网页授权页面
  const wxQuery = getQueryparams({
    appid: APPID.WX,
    redirect_uri: encodeURIComponent(location.href),
    response_type: 'code',
    scope: 'snsapi_base',
    state: 'STATE',
  });
  // https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?${wxQuery}#wechat_redirect`;
}

async function callwx() {
  try {
    loading.value = true;
    const { pay_info } = thirdApiData.value;
    // 调支付控件
    const { appId, timeStamp: timestamp, nonceStr, package: pack, signType, paySign } = JSON.parse(pay_info);
    if (!wx) return;
    wx.config({
      debug: false, // 开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来，若要查看传入的参数，可以在 pc 端打开，参数信息会通过 log 打出，仅在 pc 端时才会打印。
      appId, // 必填，公众号的唯一标识
      timestamp, // 必填，生成签名的时间戳
      nonceStr, // 必填，生成签名的随机串
      signType,
      signature: paySign, // 必填，签名
      jsApiList: ['chooseWXPay'], // 必填，需要使用的 JS 接口列表
    });
    wx.chooseWXPay({
      appId,
      timestamp,
      nonceStr,
      package: pack,
      signType,
      paySign,
      success(res: any) {
        if (res.errMsg === 'chooseWXPay:ok') {
          message.success('支付成功！');
        }
      },
      fail(err: any) {
        message.error('支付失败：', err);
      },
      cancel() {
        // message.warning('取消支付！');
      },
    });
  } catch (err) {
    console.log(6, 'call wx err', err);
    message.error(`${err}`);
  } finally {
    loading.value = false;
  }
}

function getAliCode() {
  let codeTemp = route.query.auth_code;
  if (codeTemp) return `${codeTemp}`;
  // 重定向到网页授权页面
  const aliQuery = getQueryparams({
    app_id: APPID.ALI,
    scope: 'auth_user',
    redirect_uri: encodeURIComponent(location.href),
  });
  location.href = `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?${aliQuery}`;
}

function callAli() {
  try {
    loading.value = true;
    const { pay_info } = thirdApiData.value;
    // 调支付控件
    const { tradeNO } = JSON.parse(pay_info);
    if (!ap) return;
    console.log('get the ap');
    ap.tradePay(
      {
        tradeNO,
      },
      function (res: any) {
        // ap.alert(res.resultCode);
        if (res.resultCode === '9000') {
          // 支付成功后的操作
          console.log('succeed');
          router.push({
            path: '/h5-success',
            query: {
              id: state.id,
              cost: state.cost,
              way: state.way,
            },
          });
        } else if (res.resultCode === '6001') {
          // 用户取消支付后的操作
          console.log('cancel');
        } else {
          // 支付失败后的操作
          console.log('fail');
        }
      },
    );
  } catch (err) {
    message.error(`${err}`);
  } finally {
    loading.value = false;
  }
}

onUnmounted(async () => {
  const { id: order_id, headers } = state;
  if (order_id && headers) {
    // 待修改订单支付状态
  }
});
</script>

<style lang="less" scoped>
@import url(./css/index.less);
</style>
