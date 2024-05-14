<template>
  <div class="header-content not-show-btn-outline" ref="headContentRef">
    <!-- 有 has-hover-content 类名的容器：
      1. 要用 div 包裹正文作为容器中的第一个子元素，是为了 hover 时显示三角形，
      2. hover-content 是悬浮框内容，hover-content-shadow 是悬浮框外层阴影 -->
    <div
      v-if="userStore.isLogining"
      class="using-mission"
      :class="{
        show: missionStore.sum,
        hide: missionStore.sum === 0,
        'has-hover-content show-shutdown': showShutdown,
      }"
    >
      <div class="sum-content cursor-pointer" @click="clickUsing">
        <Badge :count="missionStore.sum" :number-style="{ color: '#ffffff', background: '#c13aea', boxShadow: 'none' }">
          <ul class="using-mission-icon">
            <li v-for="i in 5" :key="i"></li>
          </ul>
        </Badge>
        <span class="extra-txt doing-txt">已启动</span>
      </div>
      <template v-if="showShutdown">
        <div class="hover-content">
          <p>为避免闲置时持续扣费，排队和运行中的任务需要手动停用</p>
          <Button type="primary" @click="confirmKnow">
            <template #icon>
              <img src="@/assets/img/user/know.png" />
            </template>
            我知道了
          </Button>
        </div>
        <div class="hover-content-shadow"></div>
      </template>
    </div>

    <div v-if="userStore.isLogining" class="has-hover-content user">
      <div class="flex-center cursor-pointer">
        <img :src="avatar" style="border-radius: 50%" />
        <span class="extra-txt">{{ userStore.getAsteriskAccount }}</span>
      </div>
      <div class="hover-content">
        <!--        <Button @click="clickChangePwd">-->
        <!--          <template #icon>-->
        <!--            <img src="@/assets/img/layout/header/change.png" />-->
        <!--          </template>-->
        <!--          修改密码-->
        <!--        </Button>-->
        <Button @click="clickLogout">
          <template #icon>
            <img src="@/assets/img/layout/header/exit.png" />
          </template>
          退出登录
        </Button>
      </div>
      <div class="hover-content-shadow"></div>
    </div>
    <Button v-else type="primary" class="login-btn" @click="clickLogin">登录/注册</Button>
  </div>
  <recharge-integration ref="rechargeRef" />
</template>

<script setup lang="ts">
import { useBalanceStore } from '@/stores/balance';
import { useUserStore } from '@/stores/user';
import { clearTimer, getComma, jumpTo, isEnv } from '@/utils/common';
import { Badge, Button } from 'ant-design-vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMissionStore } from '@/stores/mission';
import RechargeIntegration from '../recharge/Integration.vue';
import { setBurialPoint } from '@/api/burial';

const emit = defineEmits<{
  (event: 'changePwdVisible', value: boolean): void;
  (event: 'logoutVisible', value: boolean): void;
}>();

const userStore = useUserStore();
const balanceStore = useBalanceStore();
const missionStore = useMissionStore();

const showShutdown = computed(() => !missionStore.isConfirmKnowMissionNeedManualShutdown);
const refreshTimer = ref<number>();
const headContentRef = ref<HTMLElement>();
const rechargeRef = ref(); // 购买

watch(
  () => userStore.isLogining,
  (is) => {
    console.log('header:is-login:', is);
    if (is) {
      missionStore.countPossibleUsingMissions();
      !isEnv() && refreshMissionNum(); // 定时刷新
      // 获取用户是否知道需要手动关闭任务
      missionStore.getIsConfirmKnowMissionNeedManualShutdown();
    } else {
      clearTimer(refreshTimer);
    }
  },
  { immediate: true, deep: true },
);

const clickPoints = () => {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_points',
    body: { phone: userStore.userInfo?.phone },
  });
};

const invite1 = () => {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_invite_1',
    body: { phone: userStore.userInfo?.phone },
  });
};
const invite2 = () => {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_invite_2',
    body: { phone: userStore.userInfo?.phone },
  });
};
async function refreshMissionNum() {
  clearTimer(refreshTimer);
  refreshTimer.value = window.setTimeout(async () => {
    await missionStore.countPossibleUsingMissions();
    refreshMissionNum();
  }, 5000);
}

function clickUsing() {
  jumpTo({ path: '/mission', query: { tab: 'running' } });
  const { userId: creator, phone } = userStore.userInfo || {};
  setBurialPoint({ creator, type: 'click_ongoing', body: { phone } });
}

function clickLogin() {
  userStore.showLoginModal = true;
}

function clickChangePwd() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_change_password',
    body: { phone: userStore.userInfo?.phone },
  });
  emit('changePwdVisible', true);
}

const avatar = ref('');
onMounted(async () => {
  const info = await userStore.getUserInfo();
  console.log('info:', info);
  avatar.value = info.jpg_url;
});

function clickLogout() {
  const store = useUserStore();
  store.resetState();
  emit('logoutVisible', true);
}

async function confirmKnow() {
  missionStore.setIsConfirmKnowMissionNeedManualShutdown(true);
}

function clickRecharge() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_recharge_1',
    body: { phone: userStore.userInfo?.phone, balance: balanceStore.showValue },
  });
  rechargeRef.value?.clickRecharge();
}

onUnmounted(() => {
  clearTimer(refreshTimer);
});
</script>

<style lang="less" scoped>
.header-content {
  .flex-mode(row, flex-end);
  height: 4rem;
  line-height: normal;

  > * {
    .flex-mode;

    &:not(.not-margin) {
      margin-right: 2.5rem;
    }

    &:not(.account-number) {
      img {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }

  img {
    + *:not(.has-activity) {
      margin-left: 0.5rem;
    }
  }

  span:not(.ant-badge) {
    height: 1.5rem;
    font-size: 0.875rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: @color-text;
    line-height: 1.5rem;
    white-space: nowrap;
  }

  @hover-content-bg-color: #292929;

  .has-hover-content {
    position: relative;

    @hover-content-box-shadow:
      0rem 0.5625rem 1.75rem 0.125rem rgba(0, 0, 0, 0.2),
      0rem 0.375rem 1rem -0.125rem rgba(0, 0, 0, 0.32),
      0rem 0.1875rem 0.375rem -0.25rem rgba(0, 0, 0, 0.48);

    > div:first-child {
      position: relative;

      // 三角形
      &::after {
        content: '';
        position: absolute;
        bottom: -0.75rem;
        left: 50%;
        transform: translate(-50%, 50%) rotate(45deg);
        width: 0.75rem;
        height: 0.75rem;
        background: @hover-content-bg-color;
        box-shadow: @hover-content-box-shadow;
        opacity: 0;
        z-index: -1;
      }
    }

    .hover-content,
    .hover-content-shadow {
      position: absolute;
      top: 2.25rem;
      border-radius: 0.25rem;
      opacity: 0;
      z-index: -1;
    }

    .hover-content {
      background: @hover-content-bg-color;
    }

    .hover-content-shadow {
      box-shadow: @hover-content-box-shadow;
    }

    &:hover {
      margin-top: 0.75rem;
      padding-bottom: 0.75rem;

      > div:first-child::after {
        opacity: 1;
        z-index: 1002;
      }

      .hover-content {
        opacity: 1;
        z-index: 1003;
      }

      .hover-content-shadow {
        opacity: 1;
        z-index: 1001;
      }
    }
  }

  .share-register {
    &-content {
      height: 1.5rem;

      .has-activity-icon {
        margin-top: -1.25rem;
        width: auto;
        height: 2.875rem;
      }
    }
  }

  .using-mission {
    transition: margin-right 1s;

    .sum-content {
      .flex-mode;
      height: 1.5rem;
    }

    &.hide {
      margin-right: 0;

      .using-mission-icon {
        width: 0;
      }

      .doing-txt {
        max-width: 0;
      }
    }

    &.show {
      .using-mission-icon {
        width: 1.5rem;
      }

      .doing-txt {
        margin-left: 0.5rem;
        max-width: unset;
      }
    }

    .doing-txt {
      transition:
        width 1s,
        margin-left 1s;
      width: fit-content;
      overflow: hidden;
    }

    .using-mission-icon {
      width: 0;
      height: 1.5rem;
      text-align: center;
      overflow: hidden;

      > li {
        display: inline-block;
        height: 100%;
        margin-right: 0.125rem;
        width: 0.1875rem;
        background-color: @color-info;
        border-radius: 0.0919rem;
        -webkit-animation: stretchdelay 1.2s infinite ease-in-out;
        animation: stretchdelay 1.2s infinite ease-in-out;

        &:last-child {
          margin-right: 0;
        }

        &:nth-child(2) {
          -webkit-animation-delay: -1.1s;
          animation-delay: -1.1s;
        }

        &:nth-child(3) {
          -webkit-animation-delay: -1s;
          animation-delay: -1s;
        }

        &:nth-child(4) {
          -webkit-animation-delay: -0.9s;
          animation-delay: -0.9s;
        }

        &:nth-child(5) {
          -webkit-animation-delay: -0.8s;
          animation-delay: -0.8s;
        }
      }

      @keyframes stretchdelay {
        0%,
        40%,
        100% {
          -webkit-transform: scaleY(0.4);
          transform: scaleY(0.4);
        }

        20% {
          -webkit-transform: scaleY(1);
          transform: scaleY(1);
        }
      }
    }

    :deep(.ant-badge-count) {
      box-sizing: content-box;
      top: -0.125rem;
      border-radius: 0.4375rem;
      background-color: #ff4a4a;
      padding: 0 0.3125rem;
      min-width: auto;
      height: 1rem;
      line-height: 1rem;
      font-size: 0.75rem;
    }

    &.show-shutdown {
      > div:nth-child(1) {
        &::after {
          opacity: 1;
          z-index: 1002;
        }
      }

      .hover-content {
        opacity: 1;
        z-index: 1003;
      }

      .hover-content-shadow {
        opacity: 1;
        z-index: 1001;
      }
    }

    .hover-content,
    .hover-content-shadow {
      left: -1.375rem;
      width: 19.5rem;
      height: 9rem;
    }

    .hover-content {
      padding: 1.5rem;
      text-align: end;

      p {
        margin-bottom: 1rem;
        width: 16.625rem;
        // height: 1.5rem;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        color: @color-text;
        line-height: 1.5rem;
        text-align: start;
      }

      > button {
        .has-icon-btn;
        display: inline-flex;
      }
    }
  }

  .account-number {
    img {
      margin-right: 0;
      width: 1.5rem;
      height: 1.5rem;
    }

    .hover-content,
    .hover-content-shadow {
      width: 14rem;
      height: 7.375rem;
      .flex-mode(column, flex-start);

      .title {
        margin-top: 1rem;
        white-space: nowrap;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.375rem;
      }

      .btns {
        .flex-mode();
        margin-top: 1.5rem;
        height: 2rem;
        gap: 1rem;

        > Button {
          border: 0;
          width: 5.5rem;
          height: 2rem;
          border-radius: 0.25rem;

          font-size: 0.875rem;
          font-family:
            PingFangSC-Regular,
            PingFang SC;
          font-weight: 400;
          color: #ffffff;
        }
      }
    }
  }

  .user {
    > img {
      border-radius: 50%;
    }

    .hover-content,
    .hover-content-shadow {
      position: absolute;
      .flex-mode(column);
      width: 6.375rem;
      height: 5.25rem;
    }

    .hover-content {
      padding: 0.25rem;

      button {
        .has-icon-btn(0.5rem, 0.9375rem, 0.875rem);
        width: 5.875rem;
        height: 2.375rem;
        background: @hover-content-bg-color;
        border-color: transparent;
        color: @color-text-secondary;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;

        img {
          filter: opacity(0.7);
        }

        &:hover {
          background: #303030;
          color: #ffffff;

          img {
            filter: opacity(1);
          }
        }
      }
    }
  }

  .login-btn {
    margin-left: 1.6875rem;
    width: 5.9375rem;
    height: 2rem;
    font-size: 0.875rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: #ffffff;
  }
}

@media (max-width: 62rem) {
  .header-content {
    .has-hover-content {
      .hover-content,
      .hover-content-shadow {
        left: auto;
        right: auto;
      }
    }
  }
}
</style>

<style lang="less">
@header-width: 42.5rem;

@media (max-width: calc(@sidebar-collapsed-width + @header-width)) {
  .is-collapsed {
    .header-content {
      .extra-txt {
        display: none;
      }
    }
  }
}

@media (max-width: calc(@sidebar-width + @header-width)) {
  body:not(.is-collapsed) {
    .header-content {
      .extra-txt {
        display: none;
      }
    }
  }
}
</style>
