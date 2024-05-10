<template>
  <section class="common-activity live-streaming" :class="webStore.getClassName('live-streaming')">
    <div class="common-activity__content live-streaming__content" :class="{ 'show-content': showContent }">
      <div class="logo-bg" @click="jumpTo('/aigc')"></div>
      <img class="bg" :src="getImageSrc('bg')" @load="loadBG" />
      <div class="time">
        <span>{{ webStore.isPc ? '直播时间：' : '' }}2 月 1 日（周四晚） 19:00 - 20:00</span>
      </div>
      <button class="after-time-btn hover-transform-wrapper" @click="gotoStudio">
        <template v-if="isStart">
          <img :src="getImageSrc('studio')" class="icon-t" />
          <img v-if="webStore.isPc" :src="getImageSrc('studio-hover')" class="hover-icon" />
        </template>
        <template v-else>
          <img :src="getImageSrc('subscribe')" class="icon-t" />
          <img v-if="webStore.isPc" :src="getImageSrc('subscribe-hover')" class="hover-icon" />
        </template>
      </button>
      <div class="lecturer" :style="{ background: `url(${getImageSrc('lecturer-bg')}) 0/100%` }">
        <h4>端脑创始人丁烨博士</h4>
        <h4>国宝级 AI 科学家</h4>
        <h4>⾹港科技⼤学博⼠ 丨 深圳市海外⾼层次⼈才</h4>
        <p>
          国家⾃然科学基⾦项⽬评审专家 丨 省部级技术发明⼀等奖<br />
          中国计算机学会科技进步特等奖 丨 40 余篇国际顶级期刊<br />
          80 余项专利
        </p>
      </div>
      <img class="title" :src="getImageSrc('welfare')" />
      <div class="common-content welfare-content">
        <div class="imgs">
          <div
            class="imgs__item"
            v-for="item in welfareList"
            :style="{ background: `url(${getImageSrc(item.name)}) 0/100%` }"
          >
            <span>{{ item.text }}</span>
          </div>
        </div>
        <button v-if="isStart" class="hover-transform-wrapper" @click="gotoStudio">
          <img :src="getImageSrc('studio')" class="icon-t" />
          <img v-if="webStore.isPc" :src="getImageSrc('studio-hover')" class="hover-icon" />
        </button>
      </div>
      <template v-if="!isStart">
        <img class="title" :src="getImageSrc('prize')" />
        <div class="common-content prize-content">
          <div class="imgs">
            <template v-for="(item, index) in prizeList">
              <div class="imgs__item" :style="{ background: `url(${getImageSrc(item.name)}) 0/100%` }">
                <span>{{ item.text }}</span>
              </div>
              <img v-if="index !== prizeList.length - 1" :src="getImageSrc('plus')" />
            </template>
          </div>
          <button class="hover-transform-wrapper" @click="gotoStudio">
            <img :src="getImageSrc('subscribe')" class="icon-t" />
            <img v-if="webStore.isPc" :src="getImageSrc('subscribe-hover')" class="hover-icon" />
          </button>
        </div>
      </template>
      <img class="title" :src="getImageSrc('course')" />
      <ul class="course-content" :style="{ background: `url(${getImageSrc('course-bg')}) 0/100% 100% no-repeat` }">
        <li>1. 谁是 AI 赢家</li>
        <li>2. 普通人如何吃到 AI 红利</li>
        <li>3. 选择端脑分布式算力平台</li>
        <li>4. 现在加入端脑算力会员</li>
      </ul>
      <p>*本次活动最终解释权归端脑科技所有</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useWebStore } from '@/stores/web';
import { images } from '@/assets/img/activity/index';
import { ref, onMounted } from 'vue';
import { jumpTo } from '@/utils/common';
import dayjs from 'dayjs';

const webStore = useWebStore();

const welfareList = [
  { name: 'welfare-4090', text: '4090 使用权免费送' },
  { name: 'welfare-tianhe', text: '天河三芯使用权免费送' },
  { name: 'welfare-purchase', text: '购买脑力值买 1 送 1' },
  { name: 'welfare-interaction', text: '参与互动\n海量脑力值发不停' },
  { name: 'welfare-activity', text: '现在参与预约活动\n立即领取 3000 脑力值！' },
];
const prizeList = [
  { name: 'prize-assistant', text: '微信添加小助手\n回复“直播群”即可进群' },
  { name: 'prize-assistant', text: '扫码预约直播间\n领取3000脑力值奖励' },
];
// pc 背景加载需要时间
const showContent = ref(false);
// 直播时间：结束时间是估计的，所以不算
const liveBroadcast = { start: '2024-2-1 19:00:00', end: '2024-2-1 20:30:00' };
const startTimer = ref<number>();
const isStart = ref(false);

function getImageSrc(name: string) {
  let prefix = webStore.isPc ? 'live-streaming-web' : 'live-streaming-wap';
  let temp = `${prefix}/${name}`;
  return images[temp] || images[`live-streaming-web/${name}`];
}

function loadBG() {
  showContent.value = true;
}

function gotoStudio() {
  jumpTo('https://cephalon.edu.gzfeice.com/p/dxNiLG', '_blank'); // 预约、直播同一个链接
}

function init() {
  const { start } = liveBroadcast;
  let current = dayjs();
  let diff = current.diff(start);
  if (diff < 0) {
    // 还没到开始时间
    startTimer.value = window.setTimeout(() => {
      isStart.value = true;
    }, -1 * diff);
  } else {
    isStart.value = true;
  }
}

onMounted(init);
</script>

<style lang="less" scoped>
.live-streaming__content {
  justify-content: flex-start;

  .logo-bg {
    position: absolute;
    top: calc(71 / 1920 * 100vw);
    left: calc(88 / 1920 * 100vw);
    width: calc(405 / 1920 * 100vw);
    height: calc(82 / 1920 * 100vw);
    cursor: pointer;
  }

  .time {
    align-self: flex-start;
    .flex-mode(row, flex-start);
    margin-top: calc(594 / 1920 * 100vw);
    margin-left: calc(159 / 1920 * 100vw);
    padding-left: calc(145 / 1920 * 100vw);
    width: calc(1034 / 1920 * 100vw);
    height: calc(62 / 1920 * 100vw);
    background: linear-gradient(270deg, rgba(111, 0, 217, 0) 0%, #5500c4 51%, rgba(60, 0, 177, 0) 100%);

    span {
      font-size: calc(32 / 1920 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
    }
  }

  button {
    margin-top: 2.5rem;
    width: calc(400 / 1920 * 100vw);
    height: calc(108 / 1920 * 100vw);
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
    }

    &.after-time-btn {
      margin: calc(24 / 1920 * 100vw) 0 calc(8 / 1920 * 100vw) calc(437 / 1920 * 100vw);
      align-self: flex-start;
    }
  }

  .lecturer {
    padding-top: 14.875rem;
    width: 86.1875rem;
    height: 52.625rem;
    text-align: center;

    h4 {
      margin-bottom: 1.5rem;
      height: 2.8125rem;
      font-size: 2rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 600;
      color: #ffffff;
      line-height: 2.8125rem;
    }

    p {
      font-size: 2rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: 2.8125rem;
    }
  }

  .title {
    margin: 3.125rem 0 2.75rem;
    width: 100%;
    height: 6.125rem;
  }

  .common-content {
    text-align: center;

    .imgs {
      .flex-mode;
      gap: 1.5rem 0.5625rem;
      flex-wrap: wrap;
      width: calc(18.375rem * 3 + 0.5625rem * 2);

      &__item {
        .flex-mode(column, flex-end);
        padding-bottom: 1.5rem;
        width: 18.375rem;
        height: 20.875rem;
        text-align: center;

        span {
          .flex-mode;
          height: 3.5rem;
          font-size: 1.25rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.75rem;
          white-space: pre;
        }
      }
    }
  }

  .prize-content {
    .imgs {
      gap: 1rem;

      > img {
        width: 2.5rem;
        height: 2.5rem;
      }
    }
  }

  .course-content {
    .flex-mode(row, flex-start);
    flex-wrap: wrap;
    gap: 4rem;
    margin-top: 0.1875rem;
    padding: 5.8125rem 5rem;
    width: 56.25rem;
    height: 20.625rem;

    li {
      height: 2.5rem;
      font-size: 1.75rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 2.5rem;
      white-space: nowrap;

      &:nth-child(2n + 1) {
        width: 21.375rem;
      }
    }
  }

  > p {
    margin-top: 2.5625rem;
    height: 1.75rem;
    font-size: 1.25rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 1.75rem;
  }
}

@media screen and (max-width: 84.5rem) {
  .live-streaming:not(.live-streaming-mobile) {
    .live-streaming__content {
      .lecturer {
        padding-top: calc(238 / 1352 * 100vw);
        width: calc(1379 / 1352 * 100vw);
        height: calc(842 / 1352 * 100vw);

        h4 {
          margin-bottom: calc(24 / 1352 * 100vw);
          height: calc(45 / 1352 * 100vw);
          font-size: calc(32 / 1352 * 100vw);
          line-height: calc(45 / 1352 * 100vw);
        }

        p {
          font-size: calc(32 / 1352 * 100vw);
          line-height: calc(45 / 1352 * 100vw);
        }
      }

      .title {
        margin: calc(50 / 1352 * 100vw) 0 calc(44 / 1352 * 100vw);
        height: calc(98 / 1352 * 100vw);
      }

      .common-content {
        text-align: center;

        .imgs {
          gap: calc(24 / 1352 * 100vw) calc(9 / 1352 * 100vw);
          width: calc(calc(294 / 1352 * 100vw) * 3 + calc(9 / 1352 * 100vw) * 2);

          &__item {
            padding-bottom: calc(24 / 1352 * 100vw);
            width: calc(294 / 1352 * 100vw);
            height: calc(334 / 1352 * 100vw);

            span {
              height: calc(56 / 1352 * 100vw);
              font-size: calc(20 / 1352 * 100vw);
              line-height: calc(28 / 1352 * 100vw);
            }
          }
        }
      }

      .prize-content {
        .imgs {
          gap: calc(16 / 1352 * 100vw);

          > img {
            width: calc(40 / 1352 * 100vw);
            height: calc(40 / 1352 * 100vw);
          }
        }
      }

      .course-content {
        gap: calc(64 / 1352 * 100vw);
        margin-top: calc(3 / 1352 * 100vw);
        padding: calc(93 / 1352 * 100vw) calc(80 / 1352 * 100vw);
        width: calc(900 / 1352 * 100vw);
        height: calc(330 / 1352 * 100vw);

        li {
          height: calc(40 / 1352 * 100vw);
          font-size: calc(28 / 1352 * 100vw);
          line-height: calc(40 / 1352 * 100vw);

          &:nth-child(2n + 1) {
            width: calc(342 / 1352 * 100vw);
          }
        }
      }

      > p {
        margin-top: calc(41 / 1352 * 100vw);
        height: calc(28 / 1352 * 100vw);
        font-size: calc(20 / 1352 * 100vw);
        line-height: calc(28 / 1352 * 100vw);
      }
    }
  }
}

.live-streaming-mobile {
  .live-streaming__content {
    .logo-bg {
      top: calc(11 / 375 * 100vw);
      left: calc(14 / 375 * 100vw);
      width: calc(80 / 375 * 100vw);
      height: calc(17 / 375 * 100vw);
    }

    .time {
      margin-top: calc(130 / 375 * 100vw);
      margin-left: 0;
      padding-left: calc(33 / 375 * 100vw);
      width: calc(255 / 375 * 100vw);
      height: calc(20 / 375 * 100vw);

      span {
        font-size: calc(12 / 375 * 100vw);
      }
    }

    button {
      margin-top: calc(16 / 375 * 100vw);
      width: calc(120 / 375 * 100vw);
      height: calc(32 / 375 * 100vw);

      &.after-time-btn {
        margin: calc(10 / 375 * 100vw) 0 0 calc(68 / 375 * 100vw);
      }
    }

    .lecturer {
      padding-top: 4.625rem;
      width: 23.4375rem;
      height: 18.1875rem;

      h4 {
        margin-bottom: 0.25rem;
        height: 1.0625rem;
        font-size: 0.75rem;
        line-height: 1.0625rem;

        &:nth-child(1) {
          margin-bottom: 0.1875rem;
          height: 1.25rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
      }

      p {
        height: 3.1875rem;
        font-size: 0.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 1.0625rem;
      }
    }

    .title {
      margin: 2rem 0 1.5rem;
      height: 2.4375rem;
    }

    .common-content {
      .imgs {
        gap: 0.5rem;
        width: 100%;

        &__item {
          padding-bottom: 0.6875rem;
          width: 10.125rem;
          height: 11.5rem;

          span {
            height: 2.125rem;
            font-size: 0.75rem;
            line-height: 1.0625rem;
          }
        }
      }
    }

    .prize-content {
      .imgs {
        gap: 0.3125rem;

        > img {
          width: 1rem;
          height: 1rem;
        }
      }
    }

    .course-content {
      gap: 1.1875rem 0.4375rem;
      margin-top: 0;
      padding: 2rem 1.25rem;
      width: 20.9375rem;
      height: 7.3125rem;

      li {
        height: 1.0625rem;
        font-size: 0.75rem;
        line-height: 1.0625rem;

        &:nth-child(2n + 1) {
          width: 9.1875rem;
        }
      }
    }

    > p {
      margin-top: 1.5rem;
      height: 1.0625rem;
      font-size: 0.75rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: 1.0625rem;
    }
  }
}

@media screen and (max-width: 23.4375rem) {
  .live-streaming-mobile {
    .live-streaming__content {
      .lecturer {
        padding-top: calc(74 / 375 * 100vw);
        width: calc(375 / 375 * 100vw);
        height: calc(291 / 375 * 100vw);

        h4 {
          margin-bottom: calc(4 / 375 * 100vw);
          height: calc(17 / 375 * 100vw);
          font-size: calc(12 / 375 * 100vw);
          line-height: calc(17 / 375 * 100vw);

          &:nth-child(1) {
            margin-bottom: calc(3 / 375 * 100vw);
            height: calc(20 / 375 * 100vw);
            font-size: calc(14 / 375 * 100vw);
            line-height: calc(20 / 375 * 100vw);
          }
        }

        p {
          height: calc(51 / 375 * 100vw);
          font-size: calc(12 / 375 * 100vw);
          line-height: calc(17 / 375 * 100vw);
        }
      }

      .title {
        margin: calc(32 / 375 * 100vw) 0 calc(24 / 375 * 100vw);
        height: calc(39 / 375 * 100vw);
      }

      .common-content {
        .imgs {
          gap: calc(8 / 375 * 100vw);
          width: 100%;

          &__item {
            padding-bottom: calc(11 / 375 * 100vw);
            width: calc(162 / 375 * 100vw);
            height: calc(184 / 375 * 100vw);

            span {
              height: calc(34 / 375 * 100vw);
              font-size: calc(12 / 375 * 100vw);
              line-height: calc(17 / 375 * 100vw);
            }
          }
        }
      }

      .prize-content {
        .imgs {
          gap: calc(5 / 375 * 100vw);

          > img {
            width: calc(16 / 375 * 100vw);
            height: calc(16 / 375 * 100vw);
          }
        }
      }

      .course-content {
        gap: calc(19 / 375 * 100vw) calc(7 / 375 * 100vw);
        margin-top: 0;
        padding: calc(32 / 375 * 100vw) calc(20 / 375 * 100vw);
        width: calc(335 / 375 * 100vw);
        min-height: calc(117 / 375 * 100vw);
        height: auto;

        li {
          height: calc(17 / 375 * 100vw);
          font-size: calc(12 / 375 * 100vw);
          line-height: calc(17 / 375 * 100vw);

          &:nth-child(2n + 1) {
            width: calc(147 / 375 * 100vw);
          }
        }
      }

      > p {
        margin-top: calc(24 / 375 * 100vw);
        height: calc(17 / 375 * 100vw);
        font-size: calc(12 / 375 * 100vw);
        line-height: calc(17 / 375 * 100vw);
      }
    }
  }
}
</style>
