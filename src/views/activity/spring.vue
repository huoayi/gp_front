<template>
  <section
    class="common-activity spring"
    :class="(webStore.getClassName('spring'), showPop ? 'common-activity-showPop' : '')"
  >
    <div class="common-activity__content spring__content" :class="{ 'show-content': showContent }">
      <div class="mask" v-if="showPop"></div>

      <div
        class="logo-bg"
        @click="jumpTo('/aigc')"
        :style="{ background: `url(${getImageSrc('Logo')}) no-repeat center / cover` }"
      ></div>

      <img class="bg" :src="getImageSrc('bg')" @load="loadBG" />

      <div class="title" :style="{ background: `url(${getImageSrc('title')}) no-repeat center / cover` }"></div>

      <div class="tips">
        <div class="itemList" ref="tips">
          <div class="item" id="item1">
            <span class="user" v-if="tipsNow.phone.length > 0"
              >恭喜用户 {{ tipsNow.phone.slice(0, 3) }} **** {{ tipsNow.phone.slice(-4) }} 中奖</span
            >
            <span class="award" v-if="tipsNow.phone.length > 0">「 {{ tipsNow.prize_name }} 」！</span>
          </div>
          <div class="item" id="item2">
            <span class="user" v-if="tipsNext.phone.length > 0"
              >恭喜用户 {{ tipsNext.phone.slice(0, 3) }} **** {{ tipsNext.phone.slice(-4) }} 中奖</span
            >
            <span class="award" v-if="tipsNext.phone.length > 0">「 {{ tipsNext.prize_name }} 」！</span>
          </div>
        </div>
      </div>

      <div class="machine" :style="{ background: `url(${getImageSrc('machine')}) no-repeat center / cover` }">
        <div class="light-list">
          <div v-for="(item, index) in 10" class="light-item" :style="`transform:rotate( ${-45 + index * 36}deg);`">
            <div class="light" :class="index % 2 === 0 ? 'one' : 'two'" />
          </div>
          <img class="pie" :src="getImageSrc('pie')" alt="" />
        </div>

        <div class="thing-list" ref="pie">
          <div
            v-for="(item, index) in thingList"
            class="thing-item"
            :style="`transform:rotate( ${-22 + index * 45}deg);`"
          >
            <div class="thing-item__content">
              <span>{{ item.name }}</span>
              <img :src="getImageSrc(item.src)" />
            </div>
          </div>
          <img class="pie" :src="getImageSrc('pie')" alt="" />
        </div>
        <img class="arrow" @click.stop="beforeOperation(clickLottery)" :src="getImageSrc('arrow')" alt="" />

        <div class="rate" @click.stop="clickShowRate">
          <span>查看概率</span><img :src="getImageSrc('jumpTo')" alt="" />
        </div>

        <div class="btn" @click.stop="beforeOperation(clickLottery)"></div>

        <div class="bl-box" @click.stop="beforeOperation(clickShowAlready)">
          <img :src="getImageSrc('already')" alt="" />
          <div class="content">
            <div class="times">
              {{ total }} 个
              <img :src="getImageSrc('jump')" alt="" />
            </div>
            <span>已获得奖品</span>
          </div>
        </div>
        <div class="br-box">
          <img :src="getImageSrc('cube')" alt="" />
          <div class="content">
            <span class="times">{{ remainCount }} 次</span>
            <span>剩余抽奖次数</span>
          </div>
        </div>
      </div>

      <div class="missionList" :style="{ background: `url(${getImageSrc('missionBg')}) no-repeat center / cover` }">
        <div class="listTitle">获得更多抽奖次数</div>
        <div
          class="mission-item"
          v-for="(item, index) in missionList"
          :key="index"
          :style="{ background: `url(${getImageSrc('itemBg')}) no-repeat center / cover` }"
        >
          <img :src="getImageSrc('cube')" alt="?" />
          <div class="content">
            <div class="mission" v-if="item.condition === 'register' || item.condition === 'invite_register'">
              {{ mission[item.condition] }}
              <div v-if="!webStore.isPc">
                <div
                  @click="beforeOperation(copyLink)"
                  class="btn-invite btn"
                  v-if="item.recharge_amount === 0 && item.condition != 'register'"
                ></div>
                <div v-else-if="item.condition === 'register'"></div>
                <div
                  @click="beforeOperation(() => clickGotoRecharge(item.recharge_amount))"
                  class="btn-buy btn"
                  v-else
                ></div>
              </div>
            </div>
            <span class="mission" v-else
              >购买 {{ item.recharge_amount }} 元脑力值
              <div v-if="!webStore.isPc">
                <div
                  @click="beforeOperation(copyLink)"
                  class="btn-invite btn"
                  v-if="item.recharge_amount === 0 && item.condition != 'register'"
                ></div>
                <div v-else-if="item.condition === 'register'"></div>
                <div
                  @click="beforeOperation(() => clickGotoRecharge(item.recharge_amount))"
                  class="btn-buy btn"
                  v-else
                ></div></div
            ></span>
            <span class="reward" v-if="item.condition === 'register' || item.condition === 'invite_register'"
              >{{ text[item.condition] }} <span class="times">+{{ item.award_count }}</span></span
            >
            <span class="reward" v-else>
              <span>单次购买 {{ item.recharge_amount }} 元脑力值，抽奖次数 </span>
              <span class="times">+{{ item.award_count }}</span>
            </span>
          </div>
          <div v-if="webStore.isPc">
            <div
              @click="beforeOperation(copyLink)"
              class="btn-invite btn"
              v-if="item.recharge_amount === 0 && item.condition != 'register'"
            ></div>
            <div v-else-if="item.condition === 'register'"></div>
            <div
              @click="beforeOperation(() => clickGotoRecharge(item.recharge_amount))"
              class="btn-buy btn"
              v-else
            ></div>
          </div>
        </div>
      </div>

      <div class="rules" :style="{ background: `url(${getImageSrc('rules')}) no-repeat center / 100% auto` }">
        <span class="rulesTitle">活动规则</span>
        <span class="text">活动期间，每个账号每天抽奖次数上限为 10 次</span>
      </div>
      <div class="tail">本活动最终解释权归端脑科技所有</div>
    </div>
  </section>
  <!-- 无次数 -->
  <div class="popup notimes" v-if="showNoTime">
    <div
      class="botbtn iKnow"
      @click="
        showPop = false;
        showNoTime = false;
      "
    ></div>
  </div>
  <!-- 抽奖获得 -->
  <div class="popup get" v-if="showGet">
    <div class="content">
      <span class="thing">{{ showGift?.name }}</span>
      <img :src="getImageSrc(showGift?.src)" alt="" />
      <span v-if="showGift?.src === 'CEP'" class="tips">参与活动还可获得更多抽奖机会！</span>
      <span v-else class="tips">添加小助手领取奖品</span>
    </div>
    <div
      class="botbtn iGet"
      @click="
        showPop = false;
        showGet = false;
      "
    ></div>
  </div>

  <!-- 已经获得 -->
  <div class="popup already" :class="alreadyList.length > 0 ? '' : 'empty'" v-if="showAlready">
    <span class="title">已获得奖品</span>
    <div ref="list" class="gift-list" v-if="alreadyList.length > 0">
      <div
        class="gift-item"
        :style="{ background: `url(${getImageSrc('itemBg')}) no-repeat center / 100% 100%` }"
        v-for="(item, index) in alreadyList"
        :key="index"
      >
        <img :src="getImageSrc(hashImg[item.edges.lotto_prize?.name])" alt="" />
        <div class="content">
          <span class="award">中奖「{{ item.edges.lotto_prize?.name }}」</span>
          <span class="time">{{ dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
      </div>
    </div>
    <div v-else class="tips">暂无记录</div>
    <img
      class="icon"
      @click="
        showAlready = false;
        showPop = false;
      "
      :src="getImageSrc('close')"
      alt=""
    />
  </div>

  <!-- 查看概率 -->
  <div v-if="showRate" class="popup showRate">
    <span class="title">获得奖品概率</span>
    <div class="rate-list">
      <div
        class="rate-item"
        v-for="(item, index) in rateList"
        :key="index"
        :style="{ background: `url(${getImageSrc('rateBg')}) no-repeat center / 100% 100%` }"
      >
        <img :src="getImageSrc(item.src)" alt="" />
        <span class="award">{{ item.name }}</span>
        <span class="rate">{{ item.rate }}</span>
      </div>
    </div>
    <img
      class="icon"
      @click="
        showRate = false;
        showPop = false;
      "
      :src="getImageSrc('close')"
      alt=""
    />
  </div>

  <custom-modal
    :visible="paymentState.rechargePay"
    :width="webStore.isPc ? '31.25rem' : '100%'"
    :height="webStore.isPc ? 'auto' : '100%'"
    :title="webStore.isPc ? '扫码支付' : ''"
    :full-modal="!webStore.isPc"
    @update:visible="closeRechargePay"
    :class-name="webStore.getClassName('pay-modal')"
  >
    <template #title v-if="!webStore.isPc">
      <div class="close-icon-header">
        <img class="close-icon" src="@/assets/img/close.png" alt="" @click="closeRechargePay" />
      </div>
      <h4 class="wap-title wap-pay-title" v-if="!paymentState.isPaySuccess">支付订单</h4>
    </template>
    <pay
      ref="payment"
      :storage-name="RECHARGE_STORAGE_NAME.PAYMENT"
      @order-invalid="handleOrderInvalid"
      @order-succeed="handleOrderSucceed"
    ></pay>
  </custom-modal>
  <login-modal />
</template>

<script setup lang="ts">
import LoginModal from '@/components/layout/LoginModal.vue';
import { message } from 'ant-design-vue';
import { useWebStore } from '@/stores/web';
import { images } from '@/assets/img/activity/index';
import { ref, onMounted, reactive, watch, nextTick, onUnmounted, onBeforeMount } from 'vue';
import { jumpTo, copyText, convertToCEP, beforeOperation, getGiftPercent } from '@/utils/common';
import { setBurialPoint } from '@/api/burial';
import CustomModal from '@/components/Modal.vue';
import Pay, { type IPayExpose } from '@/components/recharge/Pay.vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/stores/user';
import { getGiftList, getLotteryRecord, doLottery, getRemainCount, getMissionList } from '@/api/activity';
import { getInviteCode } from '@/api/user';
import { useConfigurationStore } from '@/stores/configuration';
import { RECHARGE_STORAGE_NAME as TEMP_NAME } from '@/json/common';
import type { IGiftRuleItem } from '@/interface/common';
import { getRechargeRuleList } from '@/api/payment';

const RECHARGE_STORAGE_NAME = TEMP_NAME['SPRING'];

const userStore = useUserStore();
const webStore = useWebStore();
const configStore = useConfigurationStore();

const showContent = ref(false);
const showPop = ref(false);
const showAlready = ref(false);
const showRate = ref(false);
const showGet = ref(false);
const getLoading = ref(false);
const showNoTime = ref(false);
const pie = ref();
const tips = ref();
const remainCount = ref<number>(0);
const tipsNow = ref({ phone: '', prize_name: '' });
const tipsNext = ref({ phone: '', prize_name: '' });
const total = ref(0);
const missionList = ref<{ condition: string; recharge_amount: number; award_count: number }[]>([]);
const alreadyList = ref<
  {
    edges: {
      lotto_prize: {
        name:
          | 'RTX 4090'
          | '1个月 4090'
          | '1个月 3090'
          | '1个月 天河三芯'
          | '20000 脑力值'
          | '6000 脑力值'
          | '1000 脑力值'
          | '500 脑力值';
      };
    };
    updated_at: string;
  }[]
>([]);
const showGift = ref<{ name: string; src: string }>({ name: '默认数据', src: 'CEP' });
const giftList = ref([]);
const list = ref();
const pageIndex = ref(1);

const state = ref<{
  link: string;
  shareCep: number;
  firstRechargeCep: number;
  inviteCode: string;
  prefixLink: string;
} | null>({
  link: '',
  inviteCode: '',
  shareCep: 0,
  firstRechargeCep: 0,
  prefixLink: '',
});

const mission = {
  register: '注册成功',
  invite_register: '邀请注册',
};

const text = {
  register: '新用户注册成功，抽奖次数',
  invite_register: '每成功邀请一个新用户注册，抽奖次数',
};

const hashImg: Record<string, string> = {
  'RTX 4090 显卡': 'RTX 4090',
  '1 个月 4090 使用权': 'white4090',
  '1 个月 3090 使用权': 'white3090',
  '1 个月 天河三芯 使用权': 'tianhe',
  '20000 脑力值': 'money',
  '6000 脑力值': 'money',
  '1000 脑力值': 'money',
  '500 脑力值': 'money',
};

const thingList = [
  { src: 'RTX 4090', name: 'RTX 4090 显卡', rate: '1 %', order: 1, key: '特等奖' },
  { src: 'money', name: '1000 脑力值', rate: '30 %', order: 7, key: '六等奖' },
  { src: 'white4090', name: '1 个月 4090\n使用权', rate: '3 %', order: 2, key: '一等奖' },
  { src: 'money', name: '20000 脑力值', rate: '9 %', order: 5, key: '四等奖' },
  { src: 'white3090', name: '1 个月 3090\n使用权', rate: '5 %', order: 3, key: '二等奖' },
  { src: 'money', name: '6000 脑力值', rate: '15 %', order: 6, key: '五等奖' },
  { src: 'tianhe', name: '1 个月 天河三芯\n使用权', rate: '7 %', order: 4, key: '三等奖' },
  { src: 'money', name: '500 脑力值', rate: '30 %', order: 8, key: '七等奖' },
];
const rateList = [...thingList].sort((a, b) => a.order - b.order);
// 购买
const payment = ref<IPayExpose>();
const paymentState = reactive({
  rechargePay: false,
  isPaySuccess: false,
});
const giftRules = ref<IGiftRuleItem[]>();

watch(
  () => userStore.isLogining,
  (is) => {
    if (!is) return;
    setBurialPoint({
      creator: userStore.userInfo?.userId as string,
      type: 'page_view_spring',
      body: { phone: userStore.userInfo?.phone },
    });
    init();
  },
  { immediate: true, deep: true },
);

async function init() {
  await getRegisterShareData();
  await getGift();
  await getRecord();
  await getCount();
  await getRechargeRules();
}

function loadBG() {
  showContent.value = true;
}

async function getRechargeRules() {
  if (userStore.isActivityExist) {
    if (configStore.isSpring) {
      giftRules.value = [
        { giftPercent: 100, min: 100, max: 1000 },
        { giftPercent: 150, min: 1000, max: Infinity },
      ];
    } else {
      const result = await getRechargeRuleList();
      if (result.code === 20000) {
        giftRules.value = result.data.map((item: any) => {
          let { gift_percent: giftPercent, little_value: min, large_value: max } = item;
          return { giftPercent, min, max };
        });
      } else {
        giftRules.value = [];
        message.error('获取购买优惠规则失败！');
      }
    }
    return giftRules.value || [];
  } else {
    giftRules.value = [];
    return [];
  }
}

function clickGotoRecharge(amount: number) {
  const rules = giftRules.value;
  if (!(amount && rules)) return;
  paymentState.rechargePay = true;
  nextTick(() => {
    const giftPercent = getGiftPercent(amount, rules);
    const giftValue = giftPercent ? (amount * giftPercent) / 100 : 0,
      isHot = !!giftPercent && configStore.isSpring;
    payment.value?.createOrder(amount, giftValue, isHot);
  });
}

async function closeRechargePay() {
  await payment.value?.closeOrder();
  paymentState.isPaySuccess = false;
  paymentState.rechargePay = false;
}

function handleOrderInvalid() {
  paymentState.rechargePay = false;
}

const handleOrderSucceed = async () => {
  console.log('充值成功');
  getCount();
};

function getSocket(): Promise<WebSocket> {
  return new Promise((resolve) => {
    const { MODE, VITE_PROD_WSS_URL, VITE_WSS_URL } = import.meta.env;
    const wssurl = MODE === 'production-local' ? VITE_PROD_WSS_URL : VITE_WSS_URL;

    const socket = new WebSocket(`${wssurl}/game/ws`);

    socket.onopen = (e) => {
      console.log(1, 'spring ws open', e);
      resolve(socket);
    };
    socket.onmessage = (e) => {
      // console.log(e, 'onmessage');
      tipsNext.value = JSON.parse(e.data);
      const item1 = document.getElementById('item1');
      const item2 = document.getElementById('item2');
      setTimeout(() => {
        item2?.classList.add('moveup');
        item1?.classList.add('moveup');
      }, 1000);
      setTimeout(() => {
        item1?.classList.remove('moveup');
        item2?.classList.remove('moveup');
        tipsNow.value = tipsNext.value;
      }, 2000);
    };
    socket.onclose = (e) => {
      console.log(3, 'spring ws close', e);
      socket?.close();
    };
  });
}

function getImageSrc(name: string) {
  let prefix = webStore.isPc ? 'spring-web' : 'spring-wap';
  let temp = `${prefix}/${name}`;
  return images[temp] || images[`spring-web/${name}`];
}

function copyLink() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_invite_in_spring',
    body: { phone: userStore.userInfo?.phone },
  });
  if (state.value?.link) {
    copyText(state.value.link, '邀请链接已复制，快去分享吧！');
  } else {
    message.error('获取失败，请稍后再试！');
  }
}

async function getRegisterShareData() {
  const result = await getInviteCode();
  if (result.code === 20000) {
    const { invite_code, share_cep, first_recharge_cep } = result.data;
    let origin = location.origin + location.pathname;
    let prefixLink = `${origin}#/share/register-landing?id=`,
      link = prefixLink + invite_code;
    let shareCep = convertToCEP(share_cep),
      firstRechargeCep = convertToCEP(first_recharge_cep);
    state.value = userStore.isActivityExist
      ? { link, prefixLink, shareCep, firstRechargeCep, inviteCode: invite_code }
      : { link, prefixLink, shareCep: 0, firstRechargeCep: 0, inviteCode: invite_code };
  } else {
    state.value = null;
  }
}

async function getGift() {
  const { data: gift } = await getGiftList();
  giftList.value = gift.edges.lotto_prizes;
}

async function getMissions() {
  const { data: res3 } = await getMissionList();
  missionList.value = res3.edges.lotto_Change_rules;
}

async function getRecord() {
  const { data: res1 } = await getLotteryRecord({
    page_index: pageIndex.value,
    page_size: 10,
  });
  alreadyList.value = [...alreadyList.value, ...res1.list] as never[];
  total.value = res1.total;
}

onBeforeMount(() => {
  // spring
  configStore.initActivity();
});

onMounted(async () => {
  pie.value.style.transform = `rotate(22deg)`;

  Promise.all([await getMissions(), await getSocket()]);
});

async function getCount() {
  const { data: res2 } = await getRemainCount();
  remainCount.value = res2;
}

function clickShowRate() {
  showPop.value = true;
  showRate.value = true;
}

async function clickShowAlready() {
  pageIndex.value = 1;
  alreadyList.value = [];
  await getRecord();
  setTimeout(() => {
    list.value?.addEventListener('scroll', throttle(onBottom, 200));
  }, 200);
  showPop.value = true;
  showAlready.value = true;
}

const throttle = (func: any, delay: any) => {
  let timer: any = null;
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        // @ts-ignore
        func.apply(this, arguments);
        timer = null;
      }, delay);
    }
  };
};

// 触底相应函数
const onBottom = () => {
  // 获取可视高度
  let clientHeight = list.value.clientHeight;
  // 获取滚动高度
  let scrollTop = list.value.scrollTop;
  // 滚动条高度
  let scrollHeight = list.value.scrollHeight;

  if (clientHeight + scrollTop >= scrollHeight - 30) {
    console.log('触底了');
    pageIndex.value = pageIndex.value + 1;
    // dataList.push(dataList.length + 1)
    getRecord();
  }
};

async function clickLottery() {
  try {
    if (getLoading.value) return;
    getLoading.value = true;
    if (remainCount.value <= 0) {
      showNoTime.value = true;
      showPop.value = true;
      getLoading.value = false;
      return;
    }
    const res = await doLottery();
    // 1102.5 1147.5 1192.5 1237.5 1282.5 1327.5 1372.5 1417.5
    if (res.code !== 20000) {
      message.error(res.msg);
      getLoading.value = false;
      return;
    }

    const index = thingList.findIndex((item) => item.key === res.data.level_name);
    if (index === -1) {
      getLoading.value = false;
      return;
    }
    const { name, src } = thingList[index];
    const temp = 22.5 + 3 * 360 + (thingList.length - index - 1) * 45;
    pie.value.style.transform = `rotate(${temp}deg)`;

    setTimeout(() => {
      showGift.value.name = name;
      showGift.value.src = src === 'money' ? 'CEP' : 'Cephalon Cloud';

      showGet.value = true;
      showPop.value = true;
      pie.value.style.transition = 'none';
      pie.value.style.transform = `rotate(22deg)`;
    }, 2200);
    setTimeout(() => {
      pie.value.style.transition = 'all 2s';
      getLoading.value = false;
    }, 2300);

    await getRecord();
    await getCount();
  } catch (err: any) {
    if (err.code === 429) {
      message.error('同时抽奖人数过多，请稍后再试！');
    }
    getLoading.value = false;
  }
}
</script>

<style lang="less" scoped>
.common-activity {
  .spring__content {
    justify-content: flex-start;
    padding: 15.625rem 18.75rem;
    padding-top: calc(250 / 1920 * 100vw);
    padding-bottom: 2rem;

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100%;
      filter: brightness(0.5);
      z-index: 1000;
    }

    .logo-bg {
      cursor: pointer;
      position: absolute;
      top: 4rem;
      left: 4.6875rem;
      width: 18.75rem;
      height: 3.125rem;
    }

    .title {
      width: calc(1360 / 1920 * 100vw);
      height: calc(303 / 1920 * 100vw);
    }

    .tips {
      overflow: hidden;
      width: calc(1292 / 1920 * 100vw);
      height: 3.5625rem;
      margin: 1.5625rem 0;
      background: linear-gradient(90deg, rgba(255, 213, 96, 0) 0%, #ffd560 50%, rgba(255, 213, 96, 0) 100%);
      text-align: center;
      display: flex;
      flex-direction: column;

      @keyframes moveUp {
        to {
          transform: translateY(-100%);
        }
      }

      .moveup {
        animation: 1s moveUp both;
      }

      .itemList {
        height: 100%;

        .item {
          .flex-mode();

          height: 100%;
          flex: 0;

          span {
            color: rgba(161, 30, 25, 1);
            white-space: nowrap;
          }

          .user {
            font-size: 1rem;
            line-height: 1.375rem;
          }

          .award {
            font-size: 1.5rem;
            line-height: 1.375rem;
          }
        }
      }
    }

    .machine {
      width: 56.25rem;
      height: 75.5rem;
      position: relative;

      .btn {
        cursor: pointer;
        position: absolute;
        width: 48.9375rem;
        height: 9.75rem;
        // height: 100%;
        bottom: 19.5%;
        left: 7.3%;
        z-index: 999;
        background: url('/src/assets/img/activity/spring-web/lottery.webp') no-repeat center / cover;
      }

      .btn:hover {
        cursor: pointer;
        background: url('/src/assets/img/activity/spring-web/lotteryHover.webp') no-repeat center / cover;
      }

      .rate {
        cursor: pointer;
        position: absolute;
        z-index: 999;
        bottom: 36%;
        right: 10%;
        .flex-mode;
        gap: 0.3125rem;

        span {
          font-size: 1rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a13419;
          line-height: 1.375rem;
        }

        img {
          width: 1rem;
          height: 1.0625rem;
        }
      }

      .bl-box {
        position: absolute;
        cursor: pointer;
        .flex-mode;
        // gap: .625rem;
        bottom: 4%;
        left: 7%;
        gap: 2.625rem;
        padding: 1.25rem 3.125rem;
        // padding-left: 0;

        img {
          width: 6.125rem;
          height: 6.125rem;
        }

        .content {
          .flex-mode(column,center,flex-start);
          gap: 0.25rem;

          .times {
            font-size: 2rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #a13419;
            line-height: 2.8125rem;
            .flex-mode;
            gap: 0.3125rem;
            img {
              width: 1.5rem;
              height: 1.5rem;
            }
          }

          span {
            font-size: 1.25rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: 1.75rem;
          }
        }
      }

      .br-box {
        position: absolute;
        .flex-mode;
        gap: 2rem;
        bottom: 4%;
        right: 10%;

        img {
          width: 8.625rem;
          height: 8.625rem;
        }

        .content {
          .flex-mode(column,center,flex-start);
          gap: 0.25rem;
        }

        span {
          font-size: 1.25rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a13419;
          line-height: 1.75rem;
        }

        .times {
          font-size: 2rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #a13419;
          line-height: 2.8125rem;
        }
      }

      .light-list {
        // padding: 1.875rem;
        position: absolute;
        top: 6.3%;
        left: 17.2%;
        z-index: 0;

        .light-item {
          width: 30.625rem;
          height: 30.625rem;
          position: absolute;
          bottom: 50.5%;
          left: 49.5%;
          transform-origin: bottom left;

          .light {
            width: 5.0625rem;
            height: 5.0625rem;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            // animation: switch 2s linear infinite;
          }
          .one {
            animation: switch1 2s infinite;
          }
          .two {
            animation: switch2 2s infinite;
          }
          @keyframes switch1 {
            from {
              background: url('/src/assets/img/activity/spring-web/yellowLight.webp') no-repeat center / cover;
            }
            50% {
              background: url('/src/assets/img/activity/spring-web/yellowLight.webp') no-repeat center / cover;
            }
            50.5% {
              background: url('/src/assets/img/activity/spring-web/purpleLight.webp') no-repeat center / cover;
            }
            to {
              background: url('/src/assets/img/activity/spring-web/purpleLight.webp') no-repeat center / cover;
            }
          }
          @keyframes switch2 {
            from {
              background: url('/src/assets/img/activity/spring-web/purpleLight.webp') no-repeat center / cover;
            }
            50% {
              background: url('/src/assets/img/activity/spring-web/purpleLight.webp') no-repeat center / cover;
            }
            50.5% {
              background: url('/src/assets/img/activity/spring-web/yellowLight.webp') no-repeat center / cover;
            }
            to {
              background: url('/src/assets/img/activity/spring-web/yellowLight.webp') no-repeat center / cover;
            }
          }
        }

        .pie {
          width: 38.25rem;
          height: 38.125rem;
        }
      }

      .thing-list {
        position: absolute;
        top: 6%;
        left: 17.2%;
        transition: all 2s;
        .thing-item {
          width: 17.5rem;
          height: 17.5rem;
          position: absolute;
          bottom: 50%;
          left: 50%;
          z-index: 2;
          transform-origin: bottom left;

          &__content {
            .flex-mode(column, flex-end);
            padding-bottom: 84px;
            width: 100%;
            height: 100%;
            transform: rotate(45deg);
          }

          span {
            width: 100%;
            font-size: 1.25rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: 24px;
            position: static;
            text-align: center;
            white-space: pre;
          }
          img {
            margin-top: 0.5rem;
            position: static;
            width: 5.875rem;
            height: 5.875rem;
          }
        }
        .pie {
          width: 38.25rem;
          height: 38.125rem;
        }
      }

      .arrow {
        cursor: pointer;
        width: 10.75rem;
        height: 14.0625rem;
        position: absolute;
        top: 20%;
        left: 41.5%;
        z-index: 5;
      }
    }

    .missionList {
      width: 56.25rem;
      height: 57.875rem;
      margin-top: 2.9375rem;
      padding: 3rem;
      padding-top: 7.0625rem;
      .flex-mode(column,none,center);
      position: relative;
      gap: 0.8125rem;
      .listTitle {
        position: absolute;
        font-size: 2.5rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #fffdd5;
        line-height: 3.5rem;
        text-shadow: 0rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5);
        top: 2%;
        left: 50%;
        transform: translateX(-50%);
      }
      .mission-item {
        width: 50rem;
        height: 8.75rem;
        // .flex-mode(row,space-around,center);
        display: flex;
        align-items: center;
        padding: 0 2rem;
        img {
          width: 8.625rem;
          height: 8.625rem;
        }
        .btn {
          cursor: pointer;
          width: 8.1875rem;
          height: 2.5rem;
        }

        .btn-invite {
          background: url('/src/assets/img/activity/spring-web/gotoInvite.webp') no-repeat center / cover;
        }
        .btn-buy {
          background: url('/src/assets/img/activity/spring-web/gotoBuy.webp') no-repeat center / cover;
        }

        .btn-invite:hover {
          background: url('/src/assets/img/activity/spring-web/gotoInviteHover.webp') no-repeat center / cover;
        }
        .btn-buy:hover {
          background: url('/src/assets/img/activity/spring-web/gotoBuyHover.webp') no-repeat center / cover;
        }
        .content {
          height: 100%;
          .flex-mode(column,center,flex-start);
          // gap: 1.25rem;
          margin-left: 0.75rem;
          // margin-right: 4.5rem;
          flex: 1;
          .mission {
            font-size: 2rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #a13419;
            line-height: 2.8125rem;
          }

          .reward {
            font-size: 1.25rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: 1.75rem;
            white-space: nowrap;

            .times {
              font-size: 2.5rem;
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 500;
              color: #ff3144;
              line-height: 3.5rem;
            }
          }
        }
      }
    }

    .rules {
      margin-top: 2.5rem;
      width: 56.25rem;
      height: 13.9375rem;
      position: relative;
      .flex-mode(column);
      .rulesTitle {
        position: absolute;
        font-size: 2.5rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #fffdd5;
        line-height: 3.5rem;
        text-shadow: 0rem 0.125rem 0.25rem rgba(0, 0, 0, 0.5);
        top: 5%;
        left: 50%;
        transform: translateX(-50%);
      }
      .text {
        position: absolute;
        top: 60%;
        font-size: 1.25rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #a13419;
        line-height: 1.75rem;
      }
    }

    .tail {
      margin-top: 2rem;
      font-size: 1.25rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #a13419;
      line-height: 1.75rem;
    }
  }
}

.common-activity-showPop {
  // background-color: rgba(0, 0, 0, 0.5);
  filter: brightness(0.5);
}

.popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50rem;
  height: 50.625rem;
  .botbtn {
    cursor: pointer;
    width: 12.5rem;
    height: 3.8125rem;
    position: absolute;
    bottom: 13%;
    left: 50%;
    transform: translateX(-50%);
  }
}

.notimes {
  background: url('/src/assets/img/activity/spring-web/notime.webp') no-repeat center / cover;
  .iKnow {
    background: url('/src/assets/img/activity/spring-web/iKnow.webp') no-repeat center / cover;
  }
  .iKnow:hover {
    background: url('/src/assets/img/activity/spring-web/iKnowHover.webp') no-repeat center / cover;
  }
}

.get {
  background: url('/src/assets/img/activity/spring-web/getSome.webp') no-repeat center / cover;
  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .flex-mode(column);
    .thing {
      font-size: 2rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #a13419;
      line-height: 2.8125rem;
    }
    img {
      // width: 11.375rem;
      height: 11.375rem;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .tips {
      font-size: 1rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #a13419;
      line-height: 1.375rem;
      white-space: nowrap;
    }
  }
  .iGet {
    background: url('/src/assets/img/activity/spring-web/get.webp') no-repeat center / cover;
  }
  .iGet:hover {
    background: url('/src/assets/img/activity/spring-web/getHover.webp') no-repeat center / cover;
  }
}

.already {
  width: 44.625rem;
  height: 47.5rem;
  background: url('/src/assets/img/activity/spring-web/alreadyList.webp') no-repeat center / cover;
  .title {
    position: absolute;
    top: 24%;
    left: 50%;
    transform: translate(-50%);
    font-size: 1.375rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 600;
    color: #fffdd5;
    line-height: 2rem;
    text-shadow: 0rem 0.0625rem 0.1875rem rgba(0, 0, 0, 0.5);
  }
  .gift-list {
    position: absolute;
    top: 30%;
    left: 51%;
    transform: translateX(-50%);
    width: 29.4375rem;
    height: 28.125rem;
    // .flex-mode(column);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    overflow: auto;
    img {
      width: 4.6875rem;
      height: 4.3125rem;
    }
    .gift-item {
      width: 28.4375rem;
      // width: 100%;
      min-height: 5.0625rem;
      padding-left: 1.5rem;
      .flex-mode(row,flex-start,center);
      // flex: 0;
      gap: 1rem;
      .content {
        .flex-mode(column,center,flex-start);
        // span{color: #ffd560;}
        .award {
          font-size: 1.25rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          color: #a13419;
          line-height: 1.75rem;
        }
        .time {
          font-size: 0.875rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a13419;
          line-height: 1.25rem;
        }
      }
    }
  }
  .gift-list::-webkit-scrollbar {
    width: 0;
  }
  .icon {
    cursor: pointer;
    width: 2.875rem;
    height: 2.875rem;
    position: absolute;
    bottom: 0%;
    left: 50%;
    transform: translateX(-50%);
  }
}

.empty {
  background: url('/src/assets/img/activity/spring-web/empty.webp') no-repeat center / cover;
  .tips {
    position: absolute;
    top: 70%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.875rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    color: #a13419;
    line-height: 1.25rem;
  }
}

.showRate {
  width: 740px;
  height: 840px;
  background: url('/src/assets/img/activity/spring-web/alreadyList.webp') no-repeat center / cover;
  .title {
    position: absolute;
    top: 23%;
    left: 50%;
    transform: translate(-50%);
    font-size: 1.375rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 600;
    color: #fffdd5;
    line-height: 2rem;
    text-shadow: 0rem 0.0625rem 0.1875rem rgba(0, 0, 0, 0.5);
  }
  .rate-list {
    max-width: 31.75rem;
    // flex: 0;
    position: absolute;
    width: 100%;
    .flex-mode();
    gap: 1rem;
    flex-wrap: wrap;
    top: 31%;
    left: 50%;
    transform: translateX(-50%);
    .rate-item {
      width: 140px;
      height: 150px;
      .flex-mode(column);
      padding: 0 10px;
      gap: 0.25rem;
      img {
        width: 4.375rem;
        height: 4.375rem;
      }
      .award {
        font-size: 0.875rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        color: #a13419;
        line-height: 1.25rem;
        text-align: center;
        white-space: pre;
      }

      .rate {
        font-size: 0.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #a13419;
        line-height: 1.0625rem;
      }
    }
    .rate-item:first-child {
      // flex: 0;
      margin-left: 4.375rem;
      // margin:  0 6.25rem;
    }
    .rate-item:nth-child(2) {
      margin-right: 3.125rem;
    }
  }
  .icon {
    cursor: pointer;
    width: 2.875rem;
    height: 2.875rem;
    position: absolute;
    bottom: 0%;
    left: 50%;
    transform: translateX(-50%);
  }
}

.wap-pay-title {
  padding: 1.5rem 1.5rem 0.125rem;
}

@media screen and (max-width: 1200px) {
  .common-activity {
    .spring__content {
      justify-content: flex-start;
      padding: calc(250 / 1920 * 100vw) calc(300 / 1920 * 100vw);
      padding-bottom: calc(32 / 1920 * 100vw);
      .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100%;
        // background-color: #fff;
        filter: brightness(0.5);
        z-index: 1000;
      }

      .logo-bg {
        position: absolute;
        top: calc(64 / 1920 * 100vw);
        left: calc(75 / 1920 * 100vw);
        width: calc(300 / 1920 * 100vw);
        height: calc(50 / 1920 * 100vw);
      }

      .bg {
      }

      .title {
        width: calc(1360 / 1920 * 100vw);
        // width: 1360px;
        // width: auto;
        height: calc(303 / 1920 * 100vw);
        // height: 303px;
      }
      .tips {
        width: calc(1292 / 1920 * 100vw);
        background: linear-gradient(90deg, rgba(255, 213, 96, 0) 0%, #ffd560 50%, rgba(255, 213, 96, 0) 100%);
        text-align: center;
        .flex-mode();
      }

      .machine {
        width: calc(900 / 1200 * 100vw);
        height: calc(1210 / 1200 * 100vw);
        position: relative;
        .btn {
          cursor: pointer;
          position: absolute;
          width: calc(783 / 1200 * 100vw);
          height: calc(156 / 1200 * 100vw);
          // height: 100%;
          bottom: 19.5%;
          left: 7.3%;
          z-index: 999;
          background: url('/src/assets/img/activity/spring-web/lottery.webp') no-repeat center / cover;
        }
        .btn:hover {
          cursor: pointer;
          background: url('/src/assets/img/activity/spring-web/lotteryHover.webp') no-repeat center / cover;
        }
        .rate {
          cursor: pointer;
          position: absolute;
          z-index: 999;
          bottom: 36%;
          right: 10%;
          .flex-mode;
          gap: calc(5 / 1200 * 100vw);
          span {
            font-size: calc(16 / 1200 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: calc(22 / 1200 * 100vw);
          }
          img {
            width: calc(16 / 1200 * 100vw);
            height: calc(17 / 1200 * 100vw);
          }
        }
        .bl-box {
          position: absolute;
          cursor: pointer;
          .flex-mode;
          // gap: 10px;
          bottom: 4%;
          left: 7%;
          gap: calc(42 / 1200 * 100vw);
          padding: calc(20 / 1200 * 100vw) calc(50 / 1200 * 100vw);
          // padding-left: 0;
          img {
            width: calc(98 / 1200 * 100vw);
            height: calc(98 / 1200 * 100vw);
          }
          .content {
            .flex-mode(column,center,flex-start);
            gap: calc(4 / 1200 * 100vw);
            .times {
              font-size: calc(32 / 1200 * 100vw);
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 600;
              color: #a13419;
              line-height: calc(45 / 1200 * 100vw);
              .flex-mode;
              gap: 5px;
              img {
                width: calc(24 / 1200 * 100vw);
                height: calc(24 / 1200 * 100vw);
              }
            }
            span {
              font-size: calc(20 / 1200 * 100vw);
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 400;
              color: #a13419;
              line-height: calc(28 / 1200 * 100vw);
            }
          }
        }
        .br-box {
          position: absolute;
          .flex-mode;
          gap: calc(32 / 1200 * 100vw);
          bottom: 4%;
          right: 10%;
          img {
            width: calc(138 / 1200 * 100vw);
            height: calc(138 / 1200 * 100vw);
          }
          .content {
            .flex-mode(column,center,flex-start);
            gap: calc(4 / 1200 * 100vw);
          }
          span {
            font-size: calc(20 / 1200 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: calc(28 / 1200 * 100vw);
          }
          .times {
            font-size: calc(32 / 1200 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #a13419;
            line-height: calc(45 / 1200 * 100vw);
          }
        }

        .light-list {
          // padding: 30px;
          position: absolute;
          top: 6%;
          left: 17.2%;
          .light-item {
            width: calc(490 / 1200 * 100vw);
            height: calc(490 / 1200 * 100vw);

            position: absolute;
            bottom: 50%;
            left: 50%;
            z-index: 2;
            transform-origin: bottom left;

            .light {
              width: calc(81 / 1200 * 100vw);
              height: calc(81 / 1200 * 100vw);
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
          .pie {
            width: calc(612 / 1200 * 100vw);
            height: calc(610 / 1200 * 100vw);
          }
        }
        .thing-list {
          position: absolute;
          top: 6%;
          left: 17.2%;
          transition: all 2s;
          .thing-item {
            width: calc(280 / 1200 * 100vw);
            height: calc(280 / 1200 * 100vw);
            position: absolute;
            bottom: 50%;
            left: 50%;
            z-index: 2;

            transform-origin: bottom left;

            &__content {
              padding-bottom: calc(84 / 1200 * 100vw);
            }

            span {
              font-size: calc(20 / 1200 * 100vw);
              line-height: calc(28 / 1200 * 100vw);

              top: 30%;
              left: 50%;
            }
            img {
              margin-top: calc(8 / 1200 * 100vw);
              width: calc(94 / 1200 * 100vw);
              height: calc(94 / 1200 * 100vw);
              top: 50%;
              left: 50%;
            }
          }
          .pie {
            width: calc(612 / 1200 * 100vw);
            height: calc(610 / 1200 * 100vw);
          }
        }
        .arrow {
          width: calc(172 / 1200 * 100vw);
          height: calc(225 / 1200 * 100vw);
          position: absolute;
          top: 20%;
          left: 41.5%;
        }
      }

      .missionList {
        width: calc(900 / 1200 * 100vw);
        height: calc(926 / 1200 * 100vw);
        margin-top: calc(47 / 1200 * 100vw);
        padding: calc(48 / 1200 * 100vw);
        padding-top: calc(113 / 1200 * 100vw);
        .flex-mode(column,none,center);
        position: relative;
        gap: calc(13 / 1200 * 100vw);
        .listTitle {
          position: absolute;
          font-size: calc(40 / 1200 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #fffdd5;
          line-height: calc(56 / 1200 * 100vw);
          text-shadow: 0px calc(2 / 1200 * 100vw) calc(4 / 1200 * 100vw) rgba(0, 0, 0, 0.5);
          top: 2%;
          left: 50%;
          transform: translateX(-50%);
        }
        .mission-item {
          width: calc(800 / 1200 * 100vw);
          height: calc(140 / 1200 * 100vw);
          // .flex-mode(row,space-around,center);
          display: flex;
          align-items: center;
          padding: 0 calc(32 / 1200 * 100vw);
          img {
            width: calc(138 / 1200 * 100vw);
            height: calc(138 / 1200 * 100vw);
          }
          .btn {
            cursor: pointer;
            width: calc(131 / 1200 * 100vw);
            height: calc(40 / 1200 * 100vw);
          }

          .btn-invite {
            background: url('/src/assets/img/activity/spring-web/gotoInvite.webp') no-repeat center / cover;
          }
          .btn-buy {
            background: url('/src/assets/img/activity/spring-web/gotoBuy.webp') no-repeat center / cover;
          }

          .btn-invite:hover {
            background: url('/src/assets/img/activity/spring-web/gotoInviteHover.webp') no-repeat center / cover;
          }
          .btn-buy:hover {
            background: url('/src/assets/img/activity/spring-web/gotoBuyHover.webp') no-repeat center / cover;
          }
          .content {
            height: 100%;
            .flex-mode(column,center,flex-start);
            // gap: 20px;
            margin-left: 12px;
            // margin-right: 72px;
            flex: 1;
            .mission {
              font-size: calc(32 / 1200 * 100vw);
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 600;
              color: #a13419;
              line-height: calc(45 / 1200 * 100vw);
            }

            .reward {
              font-size: calc(20 / 1200 * 100vw);
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 400;
              color: #a13419;
              line-height: calc(28 / 1200 * 100vw);
              .times {
                font-size: calc(40 / 1200 * 100vw);
                font-family:
                  PingFangSC,
                  PingFang SC;
                font-weight: 500;
                color: #ff3144;
                line-height: calc(56 / 1200 * 100vw);
              }
            }
          }
        }
      }

      .rules {
        margin-top: calc(40 / 1200 * 100vw);
        width: calc(900 / 1200 * 100vw);
        height: calc(223 / 1200 * 100vw);
        position: relative;
        .flex-mode(column);
        .rulesTitle {
          position: absolute;
          font-size: calc(40 / 1200 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #fffdd5;
          line-height: calc(56 / 1200 * 100vw);
          text-shadow: 0px calc(2 / 1200 * 100vw) calc(4 / 1200 * 100vw) rgba(0, 0, 0, 0.5);
          top: 5%;
          left: 50%;
          transform: translateX(-50%);
        }
        .text {
          position: absolute;
          top: 60%;
          font-size: calc(20 / 1200 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a13419;
          line-height: calc(28 / 1200 * 100vw);
        }
      }

      .tail {
        margin-top: calc(32 / 1200 * 100vw);
        font-size: calc(20 / 1200 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #a13419;
        line-height: calc(28 / 1200 * 100vw);
      }
    }
  }

  .common-activity-showPop {
    // background-color: rgba(0, 0, 0, 0.5);
    filter: brightness(0.5);
  }
}

@media screen and (max-width: 800px) {
  .popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(800 / 1200 * 100vw);
    height: calc(810 / 1200 * 100vw);
    .botbtn {
      width: calc(200 / 1200 * 100vw);
      height: calc(61 / 1200 * 100vw);
      position: absolute;
      bottom: 13%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .notimes {
    background: url('/src/assets/img/activity/spring-web/notime.webp') no-repeat center / cover;
    .iKnow {
      background: url('/src/assets/img/activity/spring-web/iKnow.webp') no-repeat center / cover;
    }
  }

  .get {
    background: url('/src/assets/img/activity/spring-web/getSome.webp') no-repeat center / cover;
    .content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .flex-mode(column);
      .thing {
        font-size: calc(32 / 1200 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #a13419;
        line-height: calc(45 / 1200 * 100vw);
      }
      img {
        // width: calc(153 / 1200 * 100vw);
        height: calc(182 / 1200 * 100vw);
        margin-top: calc(20 / 1200 * 100vw);
        margin-bottom: calc(8 / 1200 * 100vw);
      }
      .tips {
        font-size: calc(16 / 1200 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #a13419;
        line-height: calc(22 / 1200 * 100vw);
      }
    }
    .iGet {
      background: url('/src/assets/img/activity/spring-web/get.webp') no-repeat center / cover;
    }
  }

  .already {
    width: calc(714 / 1200 * 100vw);
    height: calc(760 / 1200 * 100vw);
    background: url('/src/assets/img/activity/spring-web/alreadyList.webp') no-repeat center / cover;
    .title {
      position: absolute;
      top: 24%;
      left: 50%;
      transform: translate(-50%);
      font-size: calc(22 / 1200 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #fffdd5;
      line-height: calc(32 / 1200 * 100vw);
      text-shadow: 0px calc(1 / 1200 * 100vw) calc(3 / 1200 * 100vw) rgba(0, 0, 0, 0.5);
    }
    .gift-list {
      position: absolute;
      top: 30%;
      left: 51%;
      transform: translateX(-50%);
      width: calc(471 / 1200 * 100vw);
      height: calc(450 / 1200 * 100vw);
      // .flex-mode(column);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(12 / 1200 * 100vw);

      overflow: auto;
      img {
        width: calc(75 / 1200 * 100vw);
        height: calc(69 / 1200 * 100vw);
      }
      .gift-item {
        width: calc(455 / 1200 * 100vw);
        // width: 100%;
        min-height: calc(81 / 1200 * 100vw);
        padding-left: calc(24 / 1200 * 100vw);
        .flex-mode(row,flex-start,center);
        // flex: 0;
        gap: calc(16 / 1200 * 100vw);
        .content {
          .flex-mode(column,center,flex-start);
          // span{color: #ffd560;}
          .award {
            font-size: calc(20 / 1200 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 500;
            color: #a13419;
            line-height: calc(28 / 1200 * 100vw);
          }
          .time {
            font-size: calc(14 / 1200 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: calc(20 / 1200 * 100vw);
          }
        }
      }
    }
    .gift-list::-webkit-scrollbar {
      width: 0;
    }
    .icon {
      cursor: pointer;
      width: calc(46 / 1200 * 100vw);
      height: calc(46 / 1200 * 100vw);
      position: absolute;
      bottom: 0%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .empty {
    background: url('/src/assets/img/activity/spring-web/empty.webp') no-repeat center / cover;
    .tips {
      position: absolute;
      top: 70%;
      left: 50%;
      transform: translateX(-50%);
      font-size: calc(14 / 1200 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #a13419;
      line-height: calc(20 / 1200 * 100vw);
    }
  }

  .showRate {
    width: calc(740 / 1200 * 100vw);
    height: calc(860 / 1200 * 100vw);
    background: url('/src/assets/img/activity/spring-web/alreadyList.webp') no-repeat center / cover;
    .title {
      position: absolute;
      top: 24%;
      left: 50%;
      transform: translate(-50%);
      font-size: calc(22 / 1200 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #fffdd5;
      line-height: calc(32 / 1200 * 100vw);
      text-shadow: 0px calc(1 / 1200 * 100vw) calc(3 / 1200 * 100vw) rgba(0, 0, 0, 0.5);
    }
    .rate-list {
      max-width: calc(508 / 1200 * 100vw);
      // flex: 0;
      position: absolute;
      width: 100%;
      .flex-mode();
      gap: calc(16 / 1200 * 100vw);
      flex-wrap: wrap;
      top: 31%;
      left: 50%;
      transform: translateX(-50%);
      .rate-item {
        width: calc(130 / 1200 * 100vw);
        height: calc(150 / 1200 * 100vw);
        .flex-mode(column);
        gap: calc(4 / 1200 * 100vw);
        img {
          width: calc(70 / 1200 * 100vw);
          height: calc(70 / 1200 * 100vw);
        }
        .award {
          font-size: calc(14 / 1200 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          color: #a13419;
          line-height: calc(20 / 1200 * 100vw);
        }

        .rate {
          font-size: calc(12 / 1200 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a13419;
          line-height: calc(17 / 1200 * 100vw);
        }
      }
      .rate-item:first-child {
        // flex: 0;
        margin-left: calc(70 / 1200 * 100vw);
        // margin:  0 100px;
      }
      .rate-item:nth-child(2) {
        margin-right: calc(50 / 1200 * 100vw);
      }
    }
    .icon {
      cursor: pointer;
      width: calc(46 / 1200 * 100vw);
      height: calc(46 / 1200 * 100vw);
      position: absolute;
      bottom: 0%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

.is-mobile {
  .spring__content {
    justify-content: flex-start;
    padding: calc(79 / 375 * 100vw) calc(7 / 375 * 100vw);
    padding-bottom: calc(16 / 375 * 100vw);
    .logo-bg {
      position: absolute;
      top: calc(24 / 375 * 100vw);
      left: calc(24 / 375 * 100vw);
      width: calc(100 / 375 * 100vw);
      height: calc(20 / 375 * 100vw);
    }

    .bg {
    }

    .title {
      width: calc(350 / 375 * 100vw);
      // width: 1360px;
      // width: auto;
      height: calc(78 / 375 * 100vw);
      // height: 303px;
    }
    .tips {
      width: calc(375 / 375 * 100vw);
      height: calc(24 / 375 * 100vw);
      margin: calc(8 / 375 * 100vw) 0;
      background: linear-gradient(90deg, rgba(255, 213, 96, 0) 0%, #ffd560 50%, rgba(255, 213, 96, 0) 100%);
      text-align: center;
      .flex-mode();
      // justify-content: center;
      // align-items: center;
      .itemList {
        .item {
          span {
            color: rgba(161, 30, 25, 1);
          }
          .user {
            font-size: calc(12 / 375 * 100vw);
            line-height: calc(17 / 375 * 100vw);
          }

          .award {
            font-size: calc(14 / 375 * 100vw);
            line-height: calc(17 / 375 * 100vw);
          }
        }
      }
    }

    .machine {
      width: calc(362 / 375 * 100vw);
      height: calc(485 / 375 * 100vw);
      position: relative;
      .btn {
        cursor: pointer;
        position: absolute;
        width: calc(314 / 375 * 100vw);
        height: calc(63 / 375 * 100vw);
        // height: 100%;
        bottom: 19.5%;
        left: 7.3%;
        z-index: 999;
        background: url('/src/assets/img/activity/spring-web/lottery.webp') no-repeat center / cover;
      }
      .btn:hover {
        cursor: pointer;
        background: url('/src/assets/img/activity/spring-web/lotteryHover.webp') no-repeat center / cover;
      }
      .rate {
        position: absolute;
        z-index: 999;
        bottom: 35.5%;
        right: 7.5%;
        .flex-mode;
        gap: calc(5 / 375 * 100vw);
        span {
          font-size: calc(12 / 375 * 100vw);
          line-height: calc(17 / 375 * 100vw);
        }
        img {
          width: 0;
          height: 0;
        }
      }
      .bl-box {
        position: absolute;
        .flex-mode;
        // gap: 10px;
        bottom: 4%;
        left: 7%;
        gap: calc(8 / 375 * 100vw);
        padding: calc(7 / 375 * 100vw) calc(20 / 375 * 100vw);
        // padding-left: 0;
        img {
          width: calc(40 / 375 * 100vw);
          height: calc(40 / 375 * 100vw);
        }
        .content {
          .flex-mode(column,center,flex-start);
          gap: calc(2 / 375 * 100vw);
          .times {
            font-size: calc(14 / 375 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #a13419;
            line-height: calc(20 / 375 * 100vw);
            .flex-mode;
            gap: 5px;
            img {
              width: calc(10 / 375 * 100vw);
              height: calc(10 / 375 * 100vw);
            }
          }
          span {
            font-size: calc(12 / 375 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: calc(17 / 375 * 100vw);
          }
        }
      }
      .br-box {
        position: absolute;
        .flex-mode;
        gap: calc(8 / 375 * 100vw);
        bottom: 4%;
        right: 8%;
        img {
          width: calc(55 / 375 * 100vw);
          height: calc(55 / 375 * 100vw);
        }
        .content {
          .flex-mode(column,center,flex-start);
          gap: calc(4 / 375 * 100vw);
        }
        span {
          font-size: calc(12 / 375 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a13419;
          line-height: calc(17 / 375 * 100vw);
        }
        .times {
          font-size: calc(14 / 375 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #a13419;
          line-height: calc(20 / 375 * 100vw);
        }
      }

      .light-list {
        // padding: 30px;
        position: absolute;
        top: 6%;
        left: 17.2%;
        z-index: 0;
        .light-item {
          width: calc(197 / 375 * 100vw);
          height: calc(197 / 375 * 100vw);
          // background-color: #efefef;
          // border: 1px solid black;
          // opacity: 0.1;
          position: absolute;
          bottom: 50.5%;
          left: 50%;
          z-index: 2;
          // transform: rotate(-45deg);
          transform-origin: bottom left;

          .light {
            width: calc(33 / 375 * 100vw);
            height: calc(33 / 375 * 100vw);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
        .pie {
          // display: none;
          // width: 100px;
          // height: 100px;
          // transform: rotate(45deg) ;
          width: calc(246 / 375 * 100vw);
          height: calc(246 / 375 * 100vw);
          // transition: all 2s;
          // position: absolute;
          // z-index: 0;
        }
      }
      .thing-list {
        position: absolute;
        top: 6%;
        left: 17.2%;
        z-index: 1;
        transition: all 2s;
        .thing-item {
          // width: 280px;
          // height: 280px ;
          width: calc(110 / 375 * 100vw);
          height: calc(110 / 375 * 100vw);
          // background-color: #efefef;
          // border: 1px solid black;
          // opacity: 0.1;
          position: absolute;
          bottom: 50%;
          left: 50%;
          z-index: 2;
          // transform: rotate(-45deg);
          transform-origin: bottom left;

          &__content {
            padding-bottom: calc(24 / 375 * 100vw);
          }

          span {
            // white-space:;
            // white-space: nowrap;
            // color: black;
            font-size: calc(10 / 375 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: calc(15 / 375 * 100vw);
            // position: absolute;
            top: 33%;
            left: 50%;
            // transform: translate(-50%, -50%);
          }
          img {
            margin-top: calc(4 / 375 * 100vw);
            // position: absolute;
            width: calc(40 / 375 * 100vw);
            height: calc(40 / 375 * 100vw);
            top: 50%;
            left: 50%;
            // transform: translate(-50%, -50%);
          }
        }
        .pie {
          width: calc(246 / 375 * 100vw);
          height: calc(246 / 375 * 100vw);
          // transform: rotate(45deg) ;
          // transition: all 2s;
          // position: absolute;
          // z-index: 0;
        }
      }
      .arrow {
        width: calc(60 / 375 * 100vw);
        height: calc(79 / 375 * 100vw);
        position: absolute;
        top: 22%;
        left: 51.5%;
        // display: none;
        transform: translateX(-50%);
      }
    }

    .missionList {
      width: calc(360 / 375 * 100vw);
      height: calc(370 / 375 * 100vw);
      margin-top: calc(24 / 375 * 100vw);
      padding: calc(20 / 375 * 100vw);
      padding-top: calc(44 / 375 * 100vw);
      .flex-mode(column,none,center);
      position: relative;
      gap: calc(6 / 375 * 100vw);
      .listTitle {
        position: absolute;
        font-size: calc(16 / 375 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #fffdd5;
        line-height: calc(22 / 375 * 100vw);
        text-shadow: 0px calc(1 / 375 * 100vw) calc(2 / 375 * 100vw) rgba(0, 0, 0, 0.5);
        top: 2%;
        left: 50%;
        transform: translateX(-50%);
      }
      .mission-item {
        width: calc(321 / 375 * 100vw);
        height: calc(57 / 375 * 100vw);
        // .flex-mode(row,space-around,center);
        display: flex;
        align-items: center;
        padding: 0 calc(8 / 375 * 100vw);
        img {
          width: calc(55 / 375 * 100vw);
          height: calc(55 / 375 * 100vw);
        }
        .btn {
          width: calc(53 / 375 * 100vw);
          height: calc(16 / 375 * 100vw);
        }

        .btn-invite {
          background: url('/src/assets/img/activity/spring-web/gotoInvite.webp') no-repeat center / cover;
        }
        .btn-buy {
          background: url('/src/assets/img/activity/spring-web/gotoBuy.webp') no-repeat center / cover;
        }

        .btn-invite:hover {
          background: url('/src/assets/img/activity/spring-web/gotoInviteHover.webp') no-repeat center / cover;
        }
        .btn-buy:hover {
          background: url('/src/assets/img/activity/spring-web/gotoBuyHover.webp') no-repeat center / cover;
        }
        .content {
          height: 100%;
          .flex-mode(column,center,flex-start);
          // gap: 20px;

          margin-left: 4px;
          // margin-right: 72px;
          flex: 1;
          .mission {
            width: 100%;
            .flex-mode(row,space-between,center);
            font-size: calc(14 / 375 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #a13419;
            line-height: calc(20 / 375 * 100vw);
          }

          .reward {
            font-size: calc(12 / 375 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: calc(17 / 375 * 100vw);
            .times {
              font-size: calc(16 / 375 * 100vw);
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 500;
              color: #ff3144;
              line-height: calc(22 / 375 * 100vw);
            }
          }
        }
      }
    }

    .rules {
      margin-top: calc(24 / 375 * 100vw);
      width: calc(360 / 375 * 100vw);
      height: calc(99 / 375 * 100vw);
      position: relative;
      .flex-mode(column);
      .rulesTitle {
        position: absolute;
        font-size: calc(16 / 375 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #fffdd5;
        line-height: calc(22 / 375 * 100vw);
        text-shadow: 0px calc(1 / 375 * 100vw) calc(2 / 375 * 100vw) rgba(0, 0, 0, 0.5);
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
      }
      .text {
        position: absolute;
        top: 60%;
        font-size: calc(12 / 375 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #a13419;
        line-height: calc(17 / 375 * 100vw);
      }
    }

    .tail {
      margin-top: calc(16 / 375 * 100vw);
      font-size: calc(12 / 375 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #a13419;
      line-height: calc(17 / 375 * 100vw);
    }
  }
  .common-activity-showPop {
    // background-color: rgba(0, 0, 0, 0.5);
    filter: brightness(0.5);
  }

  .popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(375 / 375 * 100vw);
    height: calc(378 / 375 * 100vw);
    .botbtn {
      width: calc(101 / 375 * 100vw);
      height: calc(30 / 375 * 100vw);
      position: absolute;
      bottom: 13%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .notimes {
    background: url('/src/assets/img/activity/spring-web/notime.webp') no-repeat center / cover;
    .iKnow {
      background: url('/src/assets/img/activity/spring-web/iKnow.webp') no-repeat center / cover;
    }
  }

  .get {
    background: url('/src/assets/img/activity/spring-web/getSome.webp') no-repeat center / cover;
    .content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      .flex-mode(column);
      .thing {
        font-size: calc(16 / 375 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #a13419;
        line-height: calc(22 / 375 * 100vw);
      }
      img {
        height: calc(90 / 375 * 100vw);
        margin-top: calc(8 / 375 * 100vw);
        margin-bottom: calc(4 / 375 * 100vw);
      }
      .tips {
        font-size: calc(12 / 375 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #a13419;
        line-height: calc(17 / 375 * 100vw);
      }
    }
    .iGet {
      background: url('/src/assets/img/activity/spring-web/get.webp') no-repeat center / cover;
    }
  }

  .already {
    width: calc(374 / 375 * 100vw);
    height: calc(399 / 375 * 100vw);
    background: url('/src/assets/img/activity/spring-web/alreadyList.webp') no-repeat center / cover;
    .title {
      position: absolute;
      top: 24%;
      left: 50%;
      transform: translate(-50%);
      font-size: calc(12 / 375 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #fffdd5;
      line-height: calc(17 / 375 * 100vw);
      text-shadow: 0px calc(1 / 375 * 100vw) calc(3 / 375 * 100vw) rgba(0, 0, 0, 0.5);
    }
    .gift-list {
      position: absolute;
      top: 31%;
      left: 51%;
      transform: translateX(-50%);
      width: calc(260 / 375 * 100vw);
      height: calc(220 / 375 * 100vw);
      // .flex-mode(column);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(6 / 375 * 100vw);

      overflow: auto;
      img {
        width: calc(55 / 375 * 100vw);
        height: calc(55 / 375 * 100vw);
      }
      .gift-item {
        width: calc(235 / 375 * 100vw);
        // width: 100%;
        min-height: calc(57 / 375 * 100vw);
        padding-left: calc(16 / 375 * 100vw);
        .flex-mode(row,flex-start,center);
        // flex: 0;
        gap: calc(16 / 375 * 100vw);
        .content {
          .flex-mode(column,center,flex-start);
          // span{color: #ffd560;}
          gap: calc(4 / 375 * 100vw);
          .award {
            font-size: calc(12 / 375 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 500;
            color: #a13419;
            line-height: calc(17 / 375 * 100vw);
          }
          .time {
            font-size: calc(12 / 375 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: #a13419;
            line-height: calc(17 / 375 * 100vw);
          }
        }
      }
    }
    .gift-list::-webkit-scrollbar {
      width: 0;
    }
    .icon {
      cursor: pointer;
      width: calc(25 / 375 * 100vw);
      height: calc(25 / 375 * 100vw);
      position: absolute;
      bottom: 0%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .empty {
    background: url('/src/assets/img/activity/spring-web/empty.webp') no-repeat center / cover;
    .tips {
      position: absolute;
      top: 70%;
      left: 50%;
      transform: translateX(-50%);
      font-size: calc(12 / 375 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #a13419;
      line-height: calc(17 / 375 * 100vw);
    }
  }

  .showRate {
    width: calc(375 / 375 * 100vw);
    height: calc(535 / 375 * 100vw);
    background: url('/src/assets/img/activity/spring-web/alreadyList.webp') no-repeat center / cover;
    .title {
      position: absolute;
      top: 24%;
      left: 50%;
      transform: translate(-50%);
      font-size: calc(12 / 375 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #fffdd5;
      line-height: calc(17 / 375 * 100vw);
      text-shadow: 0px calc(1 / 375 * 100vw) calc(3 / 375 * 100vw) rgba(0, 0, 0, 0.5);
    }
    .rate-list {
      max-width: calc(320 / 375 * 100vw);
      // flex: 0;
      position: absolute;
      width: 100%;
      .flex-mode();
      gap: calc(5 / 375 * 100vw);
      flex-wrap: wrap;
      top: 31%;
      left: 50%;
      transform: translateX(-50%);
      .rate-item {
        width: calc(90 / 375 * 100vw);
        height: calc(100 / 375 * 100vw);
        .flex-mode(column);
        gap: calc(4 / 375 * 100vw);
        img {
          width: calc(40 / 375 * 100vw);
          height: calc(40 / 375 * 100vw);
        }
        .award {
          font-size: calc(12 / 375 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          color: #a13419;
          line-height: calc(17 / 375 * 100vw);
        }

        .rate {
          font-size: calc(12 / 375 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a13419;
          line-height: calc(17 / 375 * 100vw);
        }
      }
      .rate-item:first-child {
        // flex: 0;
        margin-left: calc(50 / 375 * 100vw);
        // margin:  0 100px;
      }
      .rate-item:nth-child(2) {
        margin-right: calc(30 / 375 * 100vw);
      }
    }
    .icon {
      cursor: pointer;
      width: calc(25 / 375 * 100vw);
      height: calc(25 / 375 * 100vw);
      position: absolute;
      bottom: 0%;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>
