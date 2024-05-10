<template>
  <Layout class="main-container">
    <template v-if="webStore.isPc">
      <layout-sider />
      <Layout>
        <Layout.Header class="header">
          <layout-header @logout-visible="clickLogout" @change-pwd-visible="changePwd" />
        </Layout.Header>
        <Layout.Content class="main-content-container">
          <router-view></router-view>
          <div class="filling-container">
            <Filling />
          </div>
        </Layout.Content>
      </Layout>
    </template>
    <template v-else>
      <Layout.Header class="header">
        <wap-header @logout-visible="clickLogout" @change-pwd-visible="changePwd" />
      </Layout.Header>
      <Layout.Content class="main-content-container" :class="webStore.getClassName('main-content')">
        <router-view></router-view>
      </Layout.Content>
    </template>
  </Layout>
  <custom-modal
    :visible="firstState.visible"
    @update:visible="closeFirstRewardTip"
    class-name="transparent-modal-content"
    hide-title
    :width="webStore.isPc ? '25.625rem' : '18.0625rem'"
  >
    <div class="common-modal-content first-register" :class="webStore.getClassName('first-register')">
      <div class="top">
        <div class="content">
          <p>新人注册奖励已到账!</p>
          <div>
            <img src="@/assets/img/user/registerReward/cep.png" />
            <span>x&nbsp;</span>
            <span class="cep">{{ firstState.rewardCep }}</span>
          </div>
          <Button type="primary" @click="clickUse">立即使用</Button>
        </div>
      </div>
      <div class="close">
        <img
          class="hover-icon-opacity cursor-pointer"
          src="@/assets/img/user/registerReward/close.png"
          @click="closeFirstRewardTip"
        />
      </div>
    </div>
  </custom-modal>
  <custom-modal :visible="newsState.visible" hide-title :class="`news-mention`" width="42.5rem">
    <div class="news-content">
      <img class="close-icon hover-icon-opacity cursor-pointer" src="@/assets/img/close.png" @click="clickKnowNews" />
      <Carousel class="carousel-wrapper" autoplay arrows :autoplay-speed="5000">
        <div class="news-item" v-for="item in newsList" :key="item.iconName">
          <h4>{{ item.text }}</h4>
          <img :src="newsImages[item.iconName]" />
        </div>
        <template #prevArrow>
          <img class="arrow-icon" src="@/assets/img/news/prev.png" />
        </template>
        <template #nextArrow>
          <img class="arrow-icon" src="@/assets/img/news/next.png" />
        </template>
      </Carousel>
      <div class="know-btn">
        <Button type="primary" @click="clickKnowNews" :loading="newsState.knowLoading">立即体验</Button>
      </div>
    </div>
  </custom-modal>
  <login-modal />
  <fixed-contact />
  <change-pwd-modal v-model:visible="userState.showChangePwdModal" />
  <custom-modal
    :visible="userState.showServiceStopModal || notifyState['3080Update']"
    :class-name="`transparent-modal-content`"
    hide-title
    :width="webStore.isPc ? '31.25rem' : '17.5rem'"
  >
    <div class="service-maintain" :class="webStore.getClassName('service-maintain')">
      <div class="top">
        <template v-if="userState.showServiceStopModal">
          <h1>系统维护通知</h1>
          <div class="content">
            <p>
              亲爱的端脑云用户，为了优化大家的使用体验{{ webStore.isPc ? '\n' : '' }}端脑云将在<span class="info">
                &nbsp;{{ dayjs(SERVICE_STOP_TIME.START).format('MM 月 DD 日 HH 时 mm 分') }} —
                {{ dayjs(SERVICE_STOP_TIME.END).format('MM 月 DD 日 HH 时 mm 分') }}&nbsp;</span
              >期间进行停服更新，更新期间网站暂停服务。
            </p>
          </div>
          <ol>
            <li>1. 按分钟计费的应用，在更新期间将无法停用，您可以提前手动停用；</li>
            <li>2. 包时、天、周、月的应用在更新结束后即可继续使用，并且会保存原有的应用配置；</li>
            <li>3. 如有任何问题，欢迎点击右下角添加小助手进行反馈。</li>
          </ol>
        </template>
        <template v-else-if="notifyState['3080Update']">
          <h1>3080 停机更新公告</h1>
          <div class="content">
            <p>
              <span class="info">RTX 3080 GPU</span> 因服务器更新需要停机维护，预计停电时间为
              <span class="info">
                {{ dayjs(NOTIFY_TIME['3080Update'].START).format('MM 月 DD 日 HH 时') }} ——
                {{ dayjs(NOTIFY_TIME['3080Update'].END).format('MM 月 DD 日 HH 时') }}</span
              >
              ，停电期间 3080 型号 GPU 将期间暂停服务。
            </p>
          </div>
          <ol>
            <li>1. 正在进行中的停用将不可使用，请提前停用；</li>
            <li>2. 已保存的配置不会丢失，待恢复后重新开机即可；</li>
            <li>3. 其他 GPU 型号可正常使用。</li>
          </ol>
        </template>
        <p class="support">感谢大家的理解和支持，端脑团队会一直努力，持续优化大家的使用体验～</p>
      </div>
      <div class="close">
        <img
          class="hover-icon-opacity cursor-pointer"
          src="@/assets/img/user/registerReward/close.png"
          @click="closeServiceMaintain"
        />
      </div>
    </div>
  </custom-modal>
  <custom-modal
    :visible="activityState.visible"
    class-name="transparent-modal-content"
    hide-title
    :width="webStore.isPc ? '20.4375rem' : '16.9375rem'"
  >
    <div class="common-modal-content activity-modal-content" :class="webStore.getClassName('activity-modal-content')">
      <div class="content">
        <img src="@/assets/img/activity/modal.webp" />
        <button @click="gotoRecharge">前往购买</button>
        <span class="month">{{ activityState.month }}</span>
        <span class="day">{{ activityState.day }}</span>
        <span class="count">{{ activityState.count }}</span>
      </div>
      <div class="close">
        <img
          class="hover-icon-opacity cursor-pointer"
          src="@/assets/img/user/registerReward/close.png"
          @click="closeModalActivity"
        />
      </div>
    </div>
  </custom-modal>
  <custom-modal
    :visible="notifyState['CepUpdate']"
    class-name="transparent-modal-content"
    hide-title
    :width="webStore.isPc ? '25rem' : '17.5rem'"
  >
    <div class="common-modal-content notify-modal-content" :class="webStore.getClassName('notify-modal-content')">
      <div class="content">
        <h3>脑力值单位调整</h3>
        <p class="detail">为了优化用户体验，方便计算，平台对脑力值的单位大小进行了统一调整，细节如下：</p>
        <p>
          1. 调整后，脑力值换算人民币的比例变为 1:1 ，即 1 元 = 1 脑力值；<br />
          2. 查看余额时发现脑力值减少，不要慌张～仅仅是单位调整，算力价格并未改变，请大家放心使用
        </p>
        <Button type="primary" @click="closeNotify('CepUpdate')">我知道了</Button>
      </div>
      <div class="close">
        <img
          class="hover-icon-opacity cursor-pointer"
          src="@/assets/img/user/registerReward/close.png"
          @click="closeNotify('CepUpdate')"
        />
      </div>
    </div>
  </custom-modal>
  <custom-modal
    :visible="notifyState['ScheduledLiveStreaming']"
    class-name="transparent-modal-content"
    hide-title
    :width="webStore.isPc ? '36.75rem' : '18rem'"
  >
    <div class="common-modal-content notify-live-content" :class="webStore.getClassName('notify-live-content')">
      <div class="content" :style="{ backgroundImage: `url(${getLiveImageSrc('appointment-bg')})` }">
        <button class="hover-transform-wrapper" @click="clickLiveDetail">
          <img :src="getLiveImageSrc('look-detail')" class="icon-t" />
          <img v-if="webStore.isPc" :src="getLiveImageSrc('look-detail-hover')" class="hover-icon" />
        </button>
      </div>
      <div class="close">
        <img
          class="hover-icon-opacity cursor-pointer"
          src="@/assets/img/user/registerReward/close.png"
          @click="closeNotify('ScheduledLiveStreaming')"
        />
      </div>
    </div>
  </custom-modal>
  <custom-modal
    :visible="notifyState['GotoLiveStreming']"
    class-name="transparent-modal-content"
    hide-title
    :width="webStore.isPc ? '36.75rem' : '18rem'"
  >
    <div class="common-modal-content notify-live-content" :class="webStore.getClassName('notify-live-content')">
      <div class="content" :style="{ backgroundImage: `url(${getLiveImageSrc('studio-bg')})` }">
        <button class="hover-transform-wrapper" @click="clickLiveStudio">
          <img :src="getLiveImageSrc('goto-studio')" class="icon-t" />
          <img v-if="webStore.isPc" :src="getLiveImageSrc('goto-studio-hover')" class="hover-icon" />
        </button>
      </div>
      <div class="close">
        <img
          class="hover-icon-opacity cursor-pointer"
          src="@/assets/img/user/registerReward/close.png"
          @click="closeNotify('GotoLiveStreming')"
        />
      </div>
    </div>
  </custom-modal>

  <custom-modal
    :visible="notifyState['RegisterCompleteToLotto']"
    class-name="transparent-modal-content"
    hide-title
    :width="webStore.isPc ? '36.75rem' : '18rem'"
  >
    <div
      class="common-modal-content notify-registerlotto-content"
      :class="webStore.getClassName('notify-registerlotto-content')"
    >
      <div class="pop get">
        <span class="tips">恭喜您额外获得 1 次幸运抽奖机会！</span>
        <div class="btn" @click="registerCompleteToLotto"></div>
        <div class="close">
          <img class="icon" @click="closeNotify('RegisterCompleteToLotto')" :src="getLottoImageSrc('close')" alt="" />
        </div>
      </div>
    </div>
  </custom-modal>

  <custom-modal
    :visible="notifyState['GotoLotto']"
    class-name="transparent-modal-content"
    hide-title
    :width="webStore.isPc ? '36.75rem' : '18rem'"
  >
    <div class="common-modal-content notify-lotto-content" :class="webStore.getClassName('notify-lotto-content')">
      <div class="btn" @click="gotoLotto"></div>
      <div class="close">
        <img class="icon" @click="closeNotify('GotoLotto')" :src="getLottoImageSrc('close')" alt="" />
      </div>
    </div>
  </custom-modal>

  <recharge-integration ref="rechargeRef" />

  <custom-modal
    v-model:visible="userState.showLogoutModal"
    title="退出登录"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
  >
    <div class="btns-modal-content">
      <p>确认要退出登录吗？</p>
      <div class="btns">
        <Button @click="userState.showLogoutModal = false">取消</Button>
        <Button type="primary" @click="handleLogout">确定</Button>
      </div>
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import { Layout, Button, Carousel, message } from 'ant-design-vue';
import { reactive, watch, nextTick, onBeforeMount, ref, onUnmounted } from 'vue';
import { useUserStore, type NotifyKey } from '@/stores/user';
import { useBalanceStore } from '@/stores/balance';
import { useWebStore } from '@/stores/web';
import LayoutHeader from './Header.vue';
import LayoutSider from './Sider.vue';
import WapHeader from './WapHeader.vue';
import CustomModal from '@/components/Modal.vue';
import LoginModal from './LoginModal.vue';
import { clearTimer, getStorage, jumpTo, removeStorage, setStorage } from '@/utils/common';
import { getCostBills } from '@/api/account';
import { images as newsImages } from '@/assets/img/news/index';
import { getPopVersion, editPopVersion } from '@/api/user';
import FixedContact from './Contact.vue';
import Filling from '../Filling.vue';
import ChangePwdModal from './ChangePwdModal.vue';
import { useMissionStore } from '@/stores/mission';
import { useRouter, useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { SERVICE_STOP_TIME, NOTIFY_TIME } from '@/json/common';
import { useConfigurationStore } from '@/stores/configuration';
import { setBurialPoint } from '@/api/burial';
import RechargeIntegration from '../recharge/Integration.vue';
import { images as AcitivtyImages } from '@/assets/img/activity/index';
import { useDiskStore } from '@/stores/disk';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const balanceStore = useBalanceStore();
const missionStore = useMissionStore();
const webStore = useWebStore();
const configStore = useConfigurationStore();
const diskStore = useDiskStore();

const firstState = reactive({
  visible: false,
  rewardCep: 0,
});
const newsList: { iconName: string; text: string }[] = [
  { iconName: 'my-app', text: '我的应用 UI 升级，新版视图更加清晰，支持「续费」和「手动重启」' },
];
const newsState = reactive({
  visible: false,
  currentVersion: '', // 后端返回
  knowLoading: false,
});
const newVersion = 'V1.3.0'; // 暂由前端维护，尽量保证更改版本只能比之前的版本高【后端没对此做限制】
const userState = reactive({
  showChangePwdModal: false, // 显示修改密码弹窗
  showLogoutModal: false, // 显示退出登录弹窗
  showServiceStopModal: false, // 显示服务停止弹窗
});
// 显示公告弹窗
const notifyState = reactive<{ [key in NotifyKey]: boolean }>({} as any);
const serviceStopTimer = ref<number>();
const activityState = reactive({ visible: false, month: '', day: '', count: 0 }); // 活动弹窗
const rechargeRef = ref(); // 购买

watch(
  [() => webStore.isPc, () => userStore.isLogining],
  ([isPc, is]) => {
    // console.log('isPc', isPc, is);
    if (!is) return;
    // 开启余额检测
    balanceStore.createSocket();
    // todo：登录情况下检查 3080 停机更新、脑力值单位更新
    userStore.setNotifyState();

    nextTick(() => {
      // 首次注册，有奖励时显示提醒
      !configStore.isSpring && checkFirstRegister();
      // todo：del 端脑狂欢节：圣诞 + 元旦活动拉新、氪学家绘画大赛详情
      removeStorage({ name: 'isConfirmCarnival', type: 'local' });
      removeStorage({ name: 'isConfirmCompetition', type: 'local' });
      // 活动弹窗：狂欢节倒计时-购买
      checkModalActivity();
      // 获取购买卡片列表：需要等初始化活动先执行完毕
      configStore.initRechargeList();
      // 第一次注册，需要弹：获得抽奖次数
      if (userStore.getIsFirstRegister()) {
        userStore.notifyState['RegisterCompleteToLotto']!.isConfirmKnow = false;
      }
      // 检查公告
      checkNotify();
    });
    if (isPc && false) {
      // todo：好久没更新了
      // 只有 PC 端：获取用户知晓的版本
      getCurrentVersion();
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => route,
  (route) => {
    nextTick(() => {
      const $el = document.querySelector('.main-container .main-content-container');
      if ($el?.scrollTop && $el.scrollTop > 0) $el?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },
  { immediate: true, deep: true },
);

function changePwd(is: boolean) {
  userState.showChangePwdModal = is;
}

function clickLogout() {
  if (route.path.includes('/disk/cloud') && diskStore.cloud.hasUploading) {
    diskStore.cloud.abortVisbile = true;
    diskStore.cloud.isNextLogout = true;
  } else {
    userState.showLogoutModal = true;
  }
}

function handleLogout() {
  userStore.resetState();
  balanceStore.closeSocket();
  missionStore.resetSum();
  message.success('退出成功！');
  if (!(route.meta?.requireAuth === false)) {
    router.push({ name: 'aigc' });
  }
  const { userId: creator, phone } = userStore.userInfo || {};
  setBurialPoint({ creator, type: 'log_out', body: { phone } });
  userState.showLogoutModal = false;
}

async function checkFirstRegister() {
  let is = userStore.getIsFirstRegister();
  if (is) {
    // 查询新用户注册奖励
    const result = await getCostBills({ page_index: 1, page_size: 1, bill_way: 'active_register' });
    if (result.code !== 20000) return;
    const { list } = result.data;
    if (list?.length === 1) {
      console.log(list[0]);
      const { amount } = list[0];
      firstState.rewardCep = amount;
      if (firstState.rewardCep > 0) {
        firstState.visible = true;
      }
    }
  }
}

function registerCompleteToLotto() {
  closeNotify('RegisterCompleteToLotto');
  jumpTo('/spring');
}

function gotoLotto() {
  closeNotify('GotoLotto');
  jumpTo('/spring');
}

function clickUse() {
  closeFirstRewardTip();
  jumpTo('/aigc');
}

function closeFirstRewardTip() {
  firstState.visible = false;
  userStore.setIsFirstRegister(false);
}

function checkModalActivity() {
  const data = getStorage({ name: 'carnivalCountdown', type: 'local' });
  const { aigcBanners } = configStore;
  // 需要检查该活动是否还在
  const index = aigcBanners.findIndex((i) => i.name === 'carnival' && i.show);
  let temp = dayjs(),
    today = temp.format('YYYY-MM-DD');
  if (index !== -1) {
    const { end } = aigcBanners[index];
    let num = dayjs(end).diff(temp, 'day', true), // 浮点数
      count = Math.ceil(num);
    console.log('acitivty', num, count);
    if (count > 3) return;

    if (Object.prototype.toString.call(data) === '[object Object]') {
      const { date, value } = data;
      if (today !== date || (today === date && !value)) {
        activityState.visible = true;
      }
    } else {
      activityState.visible = true;
    }

    // 存当前年月、倒计时天数
    if (activityState.visible) {
      let month = temp.format('MM'),
        day = temp.format('DD');
      Object.assign(activityState, { month, day, count });
    }
  }
}

function gotoRecharge() {
  closeModalActivity();
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_recharge_in_carnival_countdown',
    body: { phone: userStore.userInfo?.phone, balance: balanceStore.showValue },
  });
  rechargeRef.value?.clickRecharge();
}

function closeModalActivity() {
  activityState.visible = false;
  const data = { date: dayjs().format('YYYY-MM-DD'), value: true };
  setStorage({ name: 'carnivalCountdown', data, type: 'local' });
}

async function getCurrentVersion() {
  const { code, data } = await getPopVersion();
  if (code === 20000) {
    newsState.currentVersion = data.pop_version;
    if (newsState.currentVersion !== newVersion) {
      newsState.visible = true;
    }
  }
}

async function clickKnowNews() {
  try {
    newsState.knowLoading = true;
    const { code, data } = await editPopVersion(newVersion);
    if (code === 20000) {
      newsState.visible = false;
    }
  } catch (err) {
  } finally {
    newsState.knowLoading = false;
  }
}

function closeServiceMaintain() {
  userState.showServiceStopModal = false;
  userStore.setIsConfirmKnowServiceWillStop(true);
  // todo
  closeNotify('3080Update');
}

function checkServiceWillStop() {
  const isKnow = userStore.getIsConfirmKnowServiceWillStop();
  const { is, diffSecond } = userStore.getServiceWillStop();
  if (!isKnow && is) {
    userState.showServiceStopModal = true;
  }
  if (is) {
    serviceStopTimer.value = window.setTimeout(checkServiceStop, (diffSecond + 2) * 1000);
  }
}

function checkServiceStop() {
  const isStop = userStore.checkServiceStop();
  if (isStop) {
    message.info('端脑云正在进行停服更新，更新期间网站暂停服务！', 1.5, () => {
      router.push({ name: 'service-stop' });
    });
  }
}

function closeNotify(key: NotifyKey) {
  notifyState[key] = false;
  if (key === 'RegisterCompleteToLotto') userStore.setIsFirstRegister(false);
  userStore.confirmKnowNotify(key);
  // 继续查看是否还有公告弹窗
  checkNotify();
}

function checkNotify() {
  const { notifyState: state } = userStore;
  const keys = Object.keys(state) as NotifyKey[];
  const key = keys.find((key) => {
    let temp = state[key] && !state[key]!.isConfirmKnow && state[key]!.isNow;
    if (key === 'RegisterCompleteToLotto') {
      temp = temp && userStore.getIsFirstRegister();
    }
    return temp;
  });
  key && (notifyState[key] = true);
}

function initNotifyState() {
  const keys = Object.keys(NOTIFY_TIME) as NotifyKey[];
  for (let key of keys) {
    notifyState[key] = false;
  }
}

function getLiveImageSrc(name: string) {
  let prefix = webStore.isPc ? 'live-modal-web' : 'live-modal-wap';
  let temp = `${prefix}/${name}`;
  return AcitivtyImages[temp] || AcitivtyImages[`live-modal-web/${name}`];
}

function getLottoImageSrc(name: string) {
  let prefix = webStore.isPc ? 'spring-web' : 'spring-wap';
  let temp = `${prefix}/${name}`;
  return AcitivtyImages[temp] || AcitivtyImages[`spring-web/${name}`];
}

function clickLiveDetail() {
  jumpTo('/live-streaming');
  closeNotify('ScheduledLiveStreaming');
}

function clickLiveStudio() {
  jumpTo('https://cephalon.edu.gzfeice.com/p/dxNiLG', '_blank');
  closeNotify('GotoLiveStreming');
}

onBeforeMount(() => {
  initNotifyState();
  checkServiceWillStop();
  checkServiceStop();
  configStore.initActivity();
});

onUnmounted(() => {
  clearTimer(serviceStopTimer);
});
</script>

<style lang="less">
.main-container {
  height: 100%;
  overflow-x: hidden;
  background-color: #141416;
}

.main-content-container {
  overflow-y: auto;
  background: #141416;

  .page-content {
    padding: 0 1.75rem 0 2rem;
  }

  .section() {
    padding-bottom: 1.25rem;
    min-height: 100%;
  }

  .has-spin-container {
    min-height: 100%;

    .ant-spin-container {
      height: 100%;

      > section {
        .section;
        padding-bottom: 0;
      }
    }
  }

  > section {
    .section;

    &.no-padding {
      padding: 0;
    }
  }
}

// wap
.main-content-mobile {
  background: inherit;

  .page-content {
    padding: 0 1.5rem;
    min-width: auto;
  }
}

// 顶部布局
.ant-layout {
  .header.ant-layout-header {
    padding: 0;
    height: fit-content;
    background: inherit;
  }

  .filling-container {
    padding: 1.6875rem;
    height: fit-content;
    font-size: 0.875rem;
    color: @color-text;
  }
}

.transparent-modal-content {
  .ant-modal {
    .ant-modal-content {
      background-color: transparent;
      box-shadow: none;
    }
  }
}

.common-modal-content {
  .close {
    margin-top: 1.5rem;
    text-align: center;

    img {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

.first-register {
  > * {
    padding-right: 1rem;
  }

  .top {
    .flex-mode(row, center, flex-start);
    padding-top: 12.4375rem;
    height: 26.8125rem;
    background: url(@/assets/img/user/registerReward/success.png) 0 top/100% auto no-repeat;

    .content {
      width: 19.0625rem;

      p {
        height: 1.875rem;
        font-size: 1.375rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: @color-primary;
        line-height: 1.875rem;
        text-align: center;
      }

      div {
        .flex-mode;
        margin: 1.5rem 0;

        img {
          margin-right: 0.375rem;
          width: 3.75rem;
          height: 3.75rem;
        }

        span {
          font-size: 1.5rem;
          font-family:
            PingFangSC-Semibold,
            PingFang SC;
          font-weight: 600;
          color: @color-primary;
          line-height: 2.0625rem;

          &.cep {
            font-size: 2rem;
          }
        }
      }

      button {
        width: 100%;
        height: 2.5rem;

        span {
          font-size: 1rem;
        }
      }
    }
  }

  &-mobile {
    > * {
      padding-right: 0.75rem;
    }

    .top {
      padding-top: 8.1875rem;
      height: 18.875rem;

      .content {
        bottom: 1.625rem;
        width: 14.1875rem;

        p {
          height: 1.5625rem;
          font-size: 1.125rem;
          line-height: 1.5625rem;
        }

        div {
          margin: 0.75rem 0 1.125rem;

          img {
            margin-right: 0.625rem;
            width: 3.125rem;
            height: 3.125rem;
          }

          span {
            line-height: 1.75rem;
            font-size: 1.25rem;

            &.cep {
              font-size: 1.75rem;
            }
          }
        }
      }
    }
  }
}

.activity-modal-content {
  > div {
    position: relative;
    width: 100%;

    > img {
      width: 100%;
    }

    button {
      position: absolute;
      left: 50%;
      bottom: 2.375rem;
      transform: translateX(-50%);
      width: 12.5rem;
      height: 2.5rem;
      background: linear-gradient(180deg, #fffccc 0%, #fff006 100%);
      box-shadow: 0rem 0.125rem 0.25rem 0rem rgba(15, 68, 149, 0.5);
      border-radius: 1.5625rem;
      // text
      font-size: 1rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #0064b4;
      cursor: pointer;
    }

    > span {
      position: absolute;

      &.month,
      &.day {
        top: 2.1875rem;
        left: 5.4375rem;
        height: 1.25rem;
        font-size: 0.875rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        color: #66a9ff;
        line-height: 1.25rem;
      }

      &.day {
        top: 3.25rem;
      }

      &.count {
        top: 5.125rem;
        left: 0;
        width: 100%;
        height: 17.5rem;
        font-size: 12.5rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        color: #328cff;
        line-height: 17.5rem;
        text-shadow: 0.0625rem 0.125rem 0.3125rem rgba(0, 0, 0, 0.2);
        text-align: center;
      }
    }
  }

  &-mobile {
    > div {
      button {
        bottom: 1.6875rem;
        border-radius: 1.25rem;
        // text
        font-size: 1.25rem;
      }

      > span {
        &.month,
        &.day {
          top: 1.8125rem;
          left: 4.4375rem;
          height: 1.0625rem;
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }

        &.day {
          top: 2.625rem;
        }

        &.count {
          top: 3.1875rem;
        }
      }
    }
  }
}

.notify-modal-content {
  .content {
    padding: 14.6875rem 1.5rem 1.5rem;
    background: url(@/assets/img/notify/bg.png) 0 / cover;

    h3 {
      height: 2.0625rem;
      font-size: 1.5rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #000000;
      line-height: 2.0625rem;
      text-align: center;
    }

    p {
      font-size: 0.875rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 1.25rem;
      text-align: justify;
    }

    .detail {
      margin: 0.75rem 0;
      font-size: 1rem;
      color: #000000;
      line-height: 1.375rem;
      text-align: center;
    }

    button {
      margin-top: 1.5rem;
      width: 100%;
      height: 2.5rem;
      // text
      font-size: 1rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #ffffff;
    }
  }

  &-mobile {
    .content {
      padding: 9.9375rem 0.75rem 1.5rem;
      background: url(@/assets/img/notify/wap-bg.png) 0 / cover;

      h3 {
        height: 1.5625rem;
        font-size: 1.125rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #000000;
        line-height: 1.5625rem;
      }

      p {
        font-size: 0.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
        line-height: 1.0625rem;
      }

      .detail {
        font-size: 0.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #000000;
        line-height: 1.0625rem;
      }

      button {
        margin-top: 0.75rem;
      }
    }

    .close {
      margin-top: 1rem;
    }
  }
}

.notify-live-content {
  .content {
    .flex-mode(column, flex-end);
    padding-bottom: 0.875rem;
    height: 23.4375rem;
    background-size: 100% 100%;

    button {
      width: 12.5rem;
      height: 3.375rem;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  .close {
    margin-top: 3rem;
  }

  &-mobile {
    .content {
      padding-bottom: 0.75rem;
      height: 15.3125rem;

      button {
        width: 7.5rem;
        height: 2rem;
      }
    }

    .close {
      margin-top: 1.5rem;
    }
  }
}

.notify-registerlotto-content {
  .pop {
    z-index: 900;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 25rem;
    height: 30.9375rem;
    .icon {
      width: 2.875rem;
      height: 2.875rem;
      position: absolute;
      bottom: -5%;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
    }
    .tips {
      position: absolute;
      bottom: 35%;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 1rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #9e5012;
      line-height: 1.375rem;
    }
    .btn {
      background: url('/src/assets/img/activity/spring-web/gotoLottoBtn.webp') no-repeat center / cover;
      width: 10.25rem;
      height: 3.125rem;
      position: absolute;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
    }
  }
  .get {
    background: url('/src/assets/img/activity/spring-web/registerComplete.webp') no-repeat center / 100% auto;
  }
  &-mobile {
    .pop {
      width: 18.75rem;
      height: 19.9375rem;
      .tips {
        font-size: 0.75rem;
        bottom: 30%;
        line-height: 1.0625rem;
      }
      .btn {
        width: 7.75rem;
        height: 2.375rem;
        bottom: 15%;
      }
      .icon {
        width: 1.5rem;
        height: 1.5rem;
        bottom: -10%;
      }
    }
  }
}

.notify-lotto-content {
  background: url('/src/assets/img/activity/spring-web/gotoLotto.webp') no-repeat center / 100% auto;
  z-index: 900;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25.0625rem;
  height: 30rem;
  .btn {
    position: absolute;
    bottom: 9%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    background-color: #fff;
    width: 15rem;
    height: 3.75rem;
    cursor: pointer;
  }
  .icon {
    width: 2.875rem;
    height: 2.875rem;
    position: absolute;
    bottom: -5%;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
  }

  &-mobile {
    width: 18.75rem;
    height: 19.5625rem;

    .icon {
      bottom: -10%;
    }
  }
}

.news-mention {
  .news-content {
    position: relative;
    text-align: center;

    .close-icon {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .carousel-wrapper {
      padding: 2.875rem 2.875rem 0;
      background: #282828;

      .news-item {
        h4 {
          margin-bottom: 0.1875rem;
          padding: 0 2.5rem;
          height: auto;
          font-size: 1.25rem;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.75rem;
          text-align: center;
        }

        img {
          margin-top: 0.1875rem;
          width: 100%;
          height: auto;
        }
      }

      .slick-dots {
        bottom: 0.5rem;

        li {
          width: 1.875rem;
          height: 0.375rem;
          background: #ffffff;
          border-radius: 0.1875rem;
          opacity: 0.5;

          button {
            height: fit-content;
            background: inherit;
          }

          &.slick-active {
            opacity: 1;
          }
        }
      }

      .arrow-icon {
        width: 2.5rem;
        height: 2.5rem;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        .arrow-icon {
          opacity: 1;
        }
      }
    }

    .know-btn {
      padding: 1.5rem 0;

      button {
        width: 9.375rem;
        height: 3.125rem;
        border-radius: 0.25rem;
      }
    }
  }
}

.service-maintain {
  .top {
    .flex-mode(column, flex-start, stretch);
    gap: 0.75rem;
    padding: 17rem 0 1.5rem;
    background:
      url(@/assets/img/service/maintain-back.png) 0 top/100% auto no-repeat,
      linear-gradient(to bottom, transparent 0, transparent 50%, #ffffff 50%, #ffffff 100%);
    border-radius: 0.75rem;

    > * {
      padding: 0 1.5rem;
    }

    h1 {
      height: 2.0625rem;
      font-size: 1.5rem;
      font-family:
        PingFangSC-Semibold,
        PingFang SC;
      font-weight: 600;
      color: #000000;
      line-height: 2.0625rem;
      text-align: center;
    }

    .content {
      font-size: 1rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: #000000;
      line-height: 1.375rem;
      text-align: center;
      white-space: pre-wrap;

      .info {
        color: @color-info;
      }
    }

    ol {
      font-size: 0.875rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 1.25rem;
      text-align: justify;
    }
  }

  .support {
    padding: 0;
    margin-top: 0.75rem;
    font-size: 0.875rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.45);
    line-height: 1.25rem;
    text-align: center;
  }

  .close {
    margin-top: 2rem;
    text-align: center;

    img {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  &-mobile {
    .top {
      padding: 9.8125rem 0 1rem;

      > * {
        padding: 0 0.75rem;
      }

      .content {
        font-size: 0.875rem;
        line-height: 1.25rem;
      }

      ol,
      .support {
        font-size: 0.75rem;
        line-height: 1.0625rem;
      }
    }

    .close {
      margin-top: 1.125rem;
    }
  }
}
</style>

<!-- todo：del -->
<style lang="less" scoped>
.common-modal-content {
  padding: 0;
}
</style>
