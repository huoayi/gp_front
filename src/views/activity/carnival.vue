<template>
  <!-- 圣诞 + 跨年 -->
  <section class="common-activity carnival" :class="webStore.getClassName('carnival')">
    <div class="common-activity__content carnival-content">
      <img class="bg" :src="getImageSrc('bg')" />
      <img class="logo" :src="getImageSrc('cep-logo')" @click="jumpTo('/aigc')" />

      <div class="first" :style="{ backgroundImage: `url(${getImageSrc('1')})` }">
        <div data-text="买">
          <span data-text="买">买</span><span>&nbsp;</span> <span class="value" data-text="100">100</span>
          <span>&nbsp;</span> <span data-text="元额外送价值">元额外送价值</span><span>&nbsp;</span>
          <span class="value" data-text="200">200</span><span>&nbsp;</span>
          <span data-text="元脑力值">元脑力值</span>
        </div>
        <button @click="beforeOperation(clickRecharge)">立即购买</button>
      </div>
      <div class="second" :style="{ backgroundImage: `url(${getImageSrc('2')})` }">
        <div class="get-cep">
          <div class="get-cep__item">
            <h5>你可获得</h5>
            <div :style="{ backgroundImage: `url(${getImageSrc('cep-bg')})` }">
              <label>脑力值</label>
              <div><span class="value">50</span><span>&nbsp;元</span></div>
            </div>
          </div>
          <div class="get-cep__item">
            <h5>好友获得</h5>
            <div :style="{ backgroundImage: `url(${getImageSrc('cep-bg')})` }">
              <label>脑力值</label>
              <div><span class="value">300</span><span>&nbsp;元</span></div>
            </div>
          </div>
        </div>
        <p v-if="webStore.isPc">
          {{ '邀请您的好友加入端脑，让他们在活动期间注册并购\n买 100 元，您将获得 50 元的脑力值奖励，不限次数 !' }}
        </p>
        <p v-else>邀请您的好友加入端脑，让他们在活动期间注册并购买 100 元，您将获得 50 元的脑力值奖励，不限次数 !'</p>
        <button @click="beforeOperation(copyLink)">立即邀请</button>
        <p class="invite-code">
          <span>我的邀请码：</span>
          <template v-if="userStore.isLogining && inviteState.code">
            <span>{{ inviteState.code }}</span>
            <img class="cursor-pointer" :src="getImageSrc('copy')" alt="" @click="copyText(inviteState.code)" />
          </template>
          <span class="login cursor-pointer" v-else @click="clickLogin">请先登录</span>
        </p>
      </div>
      <div class="third" :style="{ backgroundImage: `url(${getImageSrc('3')})` }">
        <div class="third__item">
          <span class="title">KOL 联名创作活动</span>
          <img :src="getImageSrc('logo-sign-jointly')" />
          <span class="connect">&</span>
          <img :src="getImageSrc('logo')" />
          <p>加入社区，展示您的创意，有机会赢取 4090 免费使用，还可与 KOL 互动和分享，让您的才华得到更多的认可！</p>
        </div>
        <div class="third__item">
          <span class="title">幸运抽奖不间断</span>
          <img :src="getImageSrc('prize-draw')" />
          <p>活动期间，社区每天组织幸运抽奖，超高中奖率！</p>
        </div>

        <div class="third__contact">
          <img :src="getImageSrc('contact')" />
          <p>{{ '扫描小助手二维码\n回复“进群”加入 Cephalon AIGC 微信交流群' }}</p>
        </div>
      </div>

      <p>*本次活动最终解释权归端脑科技所有</p>
    </div>
  </section>

  <recharge-integration ref="rechargeRef" />
  <login-modal />
</template>

<script setup lang="ts">
import { images } from '@/assets/img/activity/index';
import { useWebStore } from '@/stores/web';
import { beforeOperation, jumpTo, copyText } from '@/utils/common';
import RechargeIntegration from '@/components/recharge/Integration.vue';
import { useUserStore } from '@/stores/user';
import { ref, reactive, watch, nextTick, onBeforeMount } from 'vue';
import { setBurialPoint } from '@/api/burial';
import { useBalanceStore } from '@/stores/balance';
import { message } from 'ant-design-vue';
import { getInviteCode } from '@/api/user';
import { useConfigurationStore } from '@/stores/configuration';
import LoginModal from '@/components/layout/LoginModal.vue';

const userStore = useUserStore();
const webStore = useWebStore();
const balanceStore = useBalanceStore();
const configStore = useConfigurationStore();
const rechargeRef = ref(); // 购买
const inviteState = reactive({ code: '', link: '' });

watch(
  () => userStore.isLogining,
  (is) => {
    if (!is) return;
    setBurialPoint({
      creator: userStore.userInfo?.userId as string,
      type: 'page_view_carnival',
      body: { phone: userStore.userInfo?.phone },
    });
    getInviteData();
    nextTick(() => {
      // 获取购买卡片列表：需要等初始化活动先执行完毕
      configStore.initRechargeList();
    });
  },
  { immediate: true, deep: true },
);

onBeforeMount(() => {
  configStore.initActivity();
});

async function getInviteData() {
  const result = await getInviteCode();
  if (result.code === 20000) {
    const { invite_code: code } = result.data;
    let origin = location.origin + location.pathname;
    let link = `${origin}#/share/register-landing?id=${code}`;
    Object.assign(inviteState, { code, link });
  }
}

function getImageSrc(name: string) {
  let prefix = webStore.isPc ? 'carnival-web' : 'carnival-wap';
  let temp = `${prefix}/${name}`;
  return images[temp] || images[`carnival-web/${name}`];
}

function clickRecharge() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_recharge_in_carnival',
    body: { phone: userStore.userInfo?.phone, balance: balanceStore.showValue },
  });
  rechargeRef.value?.clickRecharge();
}

function copyLink() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_invite_in_carnival',
    body: { phone: userStore.userInfo?.phone },
  });
  if (inviteState?.link) {
    copyText(inviteState.link, '邀请链接已复制，快去分享吧！');
  } else {
    message.error('获取失败，请稍后再试！');
  }
}

function clickLogin() {
  userStore.showLoginModal = true;
}
</script>

<style lang="less" scoped>
/**
* 替换正则：(\d+)px  →  calc($1 / 1920 * 100vw)
* pc：1920，h5：375
*/

.carnival-content {
  .logo {
    position: absolute;
    top: 4rem;
    left: 4rem;
    width: 21.875rem;
    height: auto;
    cursor: pointer;
  }

  > div {
    margin-bottom: 4rem;
    width: 56.25rem;
    text-align: center;
    background-size: 100%;

    button {
      width: 44rem;
      height: 6.25rem;
      background: linear-gradient(180deg, #fffccc 0%, #fff006 100%);
      box-shadow: 0 0.3125rem 0.625rem 0 rgba(15, 68, 149, 0.5);
      border-radius: 3.9375rem;
      cursor: pointer;
      // text
      font-size: 2.5rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #0064b4;
    }
  }

  .first {
    margin-top: calc(898 / 1920 * 100vw);
    height: 51.4375rem;

    > div {
      margin: 28.0625rem 0 4.375rem;
      height: 5.625rem;
      line-height: 5.625rem;
      white-space: nowrap;

      span {
        position: relative;
        z-index: 1;
        width: fit-content;
        font-size: 1.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #ffffff;

        &::before {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          -webkit-text-stroke: 0.25rem #0064b4;
          line-height: normal;
        }
      }

      .value {
        font-size: 4rem;
      }
    }
  }

  .second {
    height: 69.375rem;

    .get-cep {
      .flex-mode;
      gap: 4.6875rem;
      margin: 31.3125rem 0 2rem;

      &__item {
        h5 {
          margin-bottom: 0.3125rem;
          height: 2.8125rem;
          font-size: 2rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #0064b4;
          line-height: 2.8125rem;
        }

        > div {
          .flex-mode(row, space-between);
          padding: 0.375rem 0.6875rem 0.9375rem;
          width: 18.375rem;
          height: 9.0625rem;
          background-size: 100% 100%;

          label {
            margin: 0 0.9375rem;
            width: 2.1875rem;
            height: 6.75rem;
            font-size: 1.75rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #0064b4;
            line-height: 2.25rem;
            letter-spacing: 1.75rem;
          }

          div {
            margin-left: 0.125rem;
            flex: 1;
            height: fit-content;
          }

          span {
            font-size: 1.75rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #0064b4;

            &.value {
              font-size: 4.6875rem;
            }
          }
        }
      }
    }

    p {
      height: 5rem;
      font-size: 1.75rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: 2.5rem;
      text-align: center;
      white-space: pre-line;

      &.invite-code {
        height: 2.8125rem;
        font-size: 2rem;
        font-weight: 600;
        line-height: 2.8125rem;

        img {
          width: 3.6875rem;
        }

        .login:hover {
          color: #0064b4;
          transition: color 0.3s;
        }
      }
    }

    button {
      margin: 1.5rem 0;
    }
  }

  .third {
    margin-bottom: 3rem;
    height: 84.25rem;
    text-align: center;

    &__item {
      position: relative;
      .flex-mode;
      margin-left: 7.9375rem;
      padding-top: 3.875rem;
      width: 40.3125rem;
      height: 13.875rem;

      &:first-child {
        margin-top: 26.125rem;
        padding-left: 0.1875rem;
      }

      &:nth-child(2) {
        margin-top: 4.75rem;
        height: 12.375rem;

        img {
          width: 12rem;
          height: 8.5rem;
        }

        p {
          margin-left: 3.875rem;
        }
      }

      .title {
        position: absolute;
        top: 0;
        left: 0.1875rem;
        padding: 0 2rem;
        height: 3.5rem;
        background: #fff458;
        box-shadow: 0 0.3125rem 0.625rem 0 rgba(39, 124, 178, 0.5);
        border-radius: 2.0625rem;
        // text
        font-size: 2rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #0064b4;
        line-height: 3.5rem;
      }

      img {
        width: 5.1875rem;
        height: 5.1875rem;
      }

      .connect {
        margin: 0 0.875rem 0 0.75rem;
        width: 1.9375rem;
        height: 3.5rem;
        font-size: 2.5rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #0064b4;
        line-height: 3.5rem;
      }

      p {
        margin-left: 1.75rem;
        font-size: 1.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #0064b4;
        line-height: 2.5rem;
        text-align: justify;
      }
    }

    &__contact {
      margin-top: 2.5625rem;

      img {
        margin-bottom: 1rem;
        width: 12.375rem;
      }

      p {
        font-size: 1.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 2.5rem;
        white-space: pre-line;
      }
    }
  }

  > p {
    height: 1.75rem;
    font-size: 1.25rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.75rem;
  }
}

@media screen and (max-width: 1000px) {
  .carnival-content {
    position: relative;
    z-index: 1;
    .flex-mode(column);
    padding: 0 0 3rem;
    width: 100%;
    overflow: hidden;

    .bg {
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
    }

    .logo {
      position: absolute;
      top: calc(64 / 1000 * 100vw);
      left: calc(64 / 1000 * 100vw);
      width: calc(350 / 1000 * 100vw);
      height: auto;
      cursor: pointer;
    }

    > div {
      margin-bottom: calc(64 / 1000 * 100vw);
      width: calc(900 / 1000 * 100vw);
      text-align: center;
      background-size: 100%;

      button {
        width: calc(704 / 1000 * 100vw);
        height: calc(100 / 1000 * 100vw);
        background: linear-gradient(180deg, #fffccc 0%, #fff006 100%);
        box-shadow: 0 calc(5 / 1000 * 100vw) calc(10 / 1000 * 100vw) 0 rgba(15, 68, 149, 0.5);
        border-radius: calc(63 / 1000 * 100vw);
        cursor: pointer;
        // text
        font-size: calc(40 / 1000 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 600;
        color: #0064b4;
      }
    }

    .first {
      // margin-top: calc(898 / 1000 * 100vw);
      height: calc(823 / 1000 * 100vw);

      > div {
        margin: calc(449 / 1000 * 100vw) 0 calc(70 / 1000 * 100vw);
        height: calc(90 / 1000 * 100vw);
        line-height: calc(90 / 1000 * 100vw);
        white-space: nowrap;

        span {
          position: relative;
          z-index: 1;
          width: fit-content;
          font-size: calc(28 / 1000 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #ffffff;

          &::before {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            -webkit-text-stroke: calc(4 / 1000 * 100vw) #0064b4;
            line-height: normal;
          }
        }

        .value {
          font-size: calc(64 / 1000 * 100vw);
        }
      }
    }

    .second {
      height: calc(1110 / 1000 * 100vw);

      .get-cep {
        .flex-mode;
        gap: calc(75 / 1000 * 100vw);
        margin: calc(501 / 1000 * 100vw) 0 calc(32 / 1000 * 100vw);

        &__item {
          h5 {
            margin-bottom: calc(5 / 1000 * 100vw);
            height: calc(45 / 1000 * 100vw);
            font-size: calc(32 / 1000 * 100vw);
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 600;
            color: #0064b4;
            line-height: calc(45 / 1000 * 100vw);
          }

          > div {
            .flex-mode(row, space-between);
            padding: calc(6 / 1000 * 100vw) calc(11 / 1000 * 100vw) calc(15 / 1000 * 100vw);
            width: calc(294 / 1000 * 100vw);
            height: calc(145 / 1000 * 100vw);
            background-size: 100% 100%;

            label {
              margin: 0 calc(15 / 1000 * 100vw);
              width: calc(35 / 1000 * 100vw);
              height: calc(108 / 1000 * 100vw);
              font-size: calc(28 / 1000 * 100vw);
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 600;
              color: #0064b4;
              line-height: calc(36 / 1000 * 100vw);
              letter-spacing: calc(28 / 1000 * 100vw);
            }

            div {
              margin-left: calc(2 / 1000 * 100vw);
              flex: 1;
              height: fit-content;
            }

            span {
              font-size: calc(28 / 1000 * 100vw);
              font-family:
                PingFangSC,
                PingFang SC;
              font-weight: 600;
              color: #0064b4;

              &.value {
                font-size: calc(75 / 1000 * 100vw);
              }
            }
          }
        }
      }

      p {
        height: calc(80 / 1000 * 100vw);
        font-size: calc(28 / 1000 * 100vw);
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: calc(40 / 1000 * 100vw);
        text-align: center;
        white-space: pre-line;

        &.invite-code {
          height: calc(45 / 1000 * 100vw);
          font-size: calc(32 / 1000 * 100vw);
          font-weight: 600;
          line-height: calc(45 / 1000 * 100vw);

          img {
            width: calc(59 / 1000 * 100vw);
          }

          .login:hover {
            color: #0064b4;
            transition: color 0.3s;
          }
        }
      }

      button {
        margin: calc(24 / 1000 * 100vw) 0;
      }
    }

    .third {
      margin-bottom: calc(48 / 1000 * 100vw);
      height: calc(1348 / 1000 * 100vw);
      text-align: center;

      &__item {
        position: relative;
        .flex-mode;
        margin-left: calc(127 / 1000 * 100vw);
        padding-top: calc(62 / 1000 * 100vw);
        width: calc(645 / 1000 * 100vw);
        height: calc(222 / 1000 * 100vw);

        &:first-child {
          margin-top: calc(418 / 1000 * 100vw);
          padding-left: calc(3 / 1000 * 100vw);
        }

        &:nth-child(2) {
          margin-top: calc(76 / 1000 * 100vw);
          height: calc(198 / 1000 * 100vw);

          img {
            width: calc(192 / 1000 * 100vw);
            height: calc(136 / 1000 * 100vw);
          }

          p {
            margin-left: calc(62 / 1000 * 100vw);
          }
        }

        .title {
          position: absolute;
          top: 0;
          left: calc(3 / 1000 * 100vw);
          padding: 0 calc(32 / 1000 * 100vw);
          height: calc(56 / 1000 * 100vw);
          background: #fff458;
          box-shadow: 0 calc(5 / 1000 * 100vw) calc(10 / 1000 * 100vw) 0 rgba(39, 124, 178, 0.5);
          border-radius: calc(33 / 1000 * 100vw);
          // text
          font-size: calc(32 / 1000 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #0064b4;
          line-height: calc(56 / 1000 * 100vw);
        }

        img {
          width: calc(83 / 1000 * 100vw);
          height: calc(83 / 1000 * 100vw);
        }

        .connect {
          margin: 0 calc(14 / 1000 * 100vw) 0 calc(12 / 1000 * 100vw);
          width: calc(31 / 1000 * 100vw);
          height: calc(56 / 1000 * 100vw);
          font-size: calc(40 / 1000 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #0064b4;
          line-height: calc(56 / 1000 * 100vw);
        }

        p {
          margin-left: calc(28 / 1000 * 100vw);
          font-size: calc(28 / 1000 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #0064b4;
          line-height: calc(40 / 1000 * 100vw);
          text-align: justify;
        }
      }

      &__contact {
        margin-top: calc(41 / 1000 * 100vw);

        img {
          margin-bottom: calc(16 / 1000 * 100vw);
          width: calc(198 / 1000 * 100vw);
        }

        p {
          font-size: calc(28 / 1000 * 100vw);
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #ffffff;
          line-height: calc(40 / 1000 * 100vw);
          white-space: pre-line;
        }
      }
    }

    > p {
      height: calc(28 / 1000 * 100vw);
      font-size: calc(20 / 1000 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: calc(28 / 1000 * 100vw);
    }
  }
}

.carnival-mobile {
  .carnival-content {
    padding: 0 0 1.5rem;

    .logo {
      top: 24px;
      left: 24px;
      width: auto;
      height: 23px;
    }

    > div {
      margin-bottom: 24px;
      width: 303px;

      button {
        width: 239px;
        height: 40px;
        box-shadow: 0px 2px 4px 0px rgba(15, 68, 149, 0.5);
        border-radius: 25px;
        // text
        font-size: 20px;
      }
    }

    .first {
      margin-top: calc(647 / 375 * 100vw);
      height: 19.4375rem;

      > div {
        margin: 10.4375rem 0 1.5625rem;
        height: 2.5rem;
        line-height: 2.5rem;

        span {
          width: 13.8125rem;
          font-size: 0.625rem;

          &::before {
            -webkit-text-stroke: 0.125rem #0064b4;
          }
        }

        .value {
          font-size: 1.75rem;
        }
      }
    }

    .second {
      height: 27.75rem;

      .get-cep {
        gap: 1rem;
        margin: 11rem 0 1.0625rem;

        &__item {
          h5 {
            margin-bottom: 0.125rem;
            height: 1.375rem;
            line-height: 1.375rem;
          }

          > div {
            padding: 0.125rem 0.25rem 0.375rem;
            width: 6.75rem;
            height: 3.8125rem;

            label {
              margin: 0 0.375rem;
              width: 1rem;
              height: 3rem;
              font-size: 0.75rem;
              line-height: 1rem;
              letter-spacing: 0.75rem;
            }

            div {
              margin-left: 0.125rem;
            }

            span {
              font-size: 0.625rem;

              &.value {
                font-size: 1.75rem;
              }
            }
          }
        }
      }

      p {
        padding: 0 1.75rem 0 2.0625rem;
        height: 3.1875rem;
        font-size: 0.75rem;
        line-height: 1.0625rem;
        white-space: normal;

        &.invite-code {
          height: 1.375rem;
          font-size: 1rem;
          line-height: 1.375rem;

          img {
            margin-left: 0.1875rem;
            width: 1.875rem;
          }
        }
      }

      button {
        margin: 0.75rem 0;
      }
    }

    .third {
      margin-bottom: 1rem;
      height: 29.875rem;

      &__item {
        margin-left: 2.6875rem;
        padding-top: 1.9375rem;
        width: 14rem;
        height: 5.4375rem;

        &:first-child {
          margin-top: 9rem;
          padding-left: 0;
        }

        &:nth-child(2) {
          margin-top: 1.3125rem;
          padding-top: 1.6875rem;
          height: 4.5625rem;

          img {
            width: 4.0625rem;
            height: 2.875rem;
          }

          p {
            margin-left: 1.5rem;
          }
        }

        .title {
          left: 0;
          padding: 0 1rem;
          height: 1.5625rem;
          box-shadow: 0rem 0.125rem 0.25rem 0rem rgba(39, 124, 178, 0.5);
          border-radius: 0.8125rem;
          // text
          font-size: 0.875rem;
          line-height: 1.5625rem;
        }

        img {
          width: 2.0625rem;
          height: 2.0625rem;
        }

        .connect {
          margin: 0 0.3125rem;
          width: 0.8125rem;
          height: 1.375rem;
          font-size: 1rem;
          line-height: 1.375rem;
        }

        p {
          margin-left: 0.25rem;
          font-size: 0.625rem;
          line-height: 0.875rem;
        }
      }

      &__contact {
        margin-top: 0.875rem;

        img {
          margin-bottom: 0.5625rem;
          width: 3.8125rem;
        }

        p {
          height: 2.125rem;
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }
      }
    }

    > p {
      height: 1.0625rem;
      font-size: 0.75rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
      line-height: 1.0625rem;
    }
  }
}
</style>
