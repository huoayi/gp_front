<template>
  <Spin size="large" :spinning="spinning" :wrapper-class-name="`vote-spinning-wrapper ${spinning ? 'show' : ''}`">
    <div class="vote-inner"></div>
  </Spin>

  <section ref="containerRef" class="common-activity vote" :class="webStore.getClassName('vote')">
    <div class="back" @click="jumpTo('/aigc')"></div>
    <div class="common-activity__content vote-content">
      <img class="bg" :src="getImageSrc('bg')" />
      <div class="description">
        <div class="bg" :style="{ backgroundImage: `url(${getImageSrc('desc')})` }"></div>
        <img :src="getImageSrc('vote-time')" />
        <p>2024 年 1 月 10 日 0 时 - 2024 年 1 月 16 日 24 时</p>
        <img :src="getImageSrc('vote-rule')" />
        <p>每人每天可投 3 票，每个作品每次仅可投 1 票</p>
        <img :src="getImageSrc('choose-rule')" />
        <p>投票结束后，将按作品的获票量降序排列，颁发奖品</p>
        <img :src="getImageSrc('reward-desc')" />
        <table>
          <tr>
            <th>排名</th>
            <th>奖励</th>
            <th>数量</th>
          </tr>
          <tr v-for="item in rewards">
            <td>{{ item.rank }}</td>
            <td>{{ item.reward }}</td>
            <td>{{ item.num }}</td>
          </tr>
        </table>
      </div>
      <div class="works" ref="worksRef">
        <div class="bg" :style="{ backgroundImage: `url(${getImageSrc('works')})` }"></div>
        <div class="works__item" v-for="item in artworks?.slice(0, 40)">
          <img :src="item.url" @click="clickImage(item.url)" />
          <h4>{{ item.name }}</h4>
          <p><scroll-number :is-init="showScroll" :num="item.num" />&nbsp;票</p>
          <template v-if="statuses.show">
            <button v-if="item.voted === true" disabled><span>已投票</span></button>
            <button v-else @click="beforeOperation(() => clickVote(item.id))">
              <thumbs-up class="like-icon" :ref="`item_${item.id}`" @after-anime="afterClickVote" />
              <span>投 TA 一票</span>
            </button>
          </template>
          <button v-else disabled>
            <span>{{ statuses.isAfter ? '活动已结束' : '活动未开启' }}</span>
          </button>
        </div>
      </div>
      <div class="rules">
        <div class="bg" :style="{ backgroundImage: `url(${getImageSrc('activity-rule')})` }"></div>
        <p>1. 要求投稿作品为参赛者的原创作品，且对其拥有独立、完整、明确、无争议的著作权；</p>
        <p>2. 活动结束后，将按作品的按获票量降序排列，排名 1 ~ 3 的参赛者分别获 “一/二/三等奖”；</p>
        <p>3. 评选奖项时，如遇获票数相同的情况，则按作品发布时间排序，发布时间晚的参赛者排名靠前；</p>
        <p>4. 最佳创意奖：活动结束后，官方将综合作品创意和质量等，评选出 10 名获奖者；</p>
        <p>5. 本次活动中，参赛者最多获得 1 个奖项，发放奖品时以价值最高的奖项为准；</p>
        <p>6. 活动中如发现违规操作或恶意刷票等行为，将取消相关参赛者的评选资格；</p>
        <p>7. 为保证活动的公平性，端脑工作人员不得参加本次活动；</p>
        <p>8. 端脑拥有投稿作品在本次活动宣传范围内非商业用途的使用权，投稿参赛即视为默认此项规则。</p>
      </div>
      <p>*本次活动最终解释权归端脑科技所有</p>
    </div>
  </section>

  <Image
    :wrapper-style="{ display: 'none' }"
    :preview="{
      visible: imageState.visible,
      onVisibleChange: setImageVisible,
      getContainer: containerRef,
    }"
    :src="imageState.src"
  />

  <login-modal />
</template>

<script setup lang="ts">
import { Spin, message, Image } from 'ant-design-vue';
import { useWebStore } from '@/stores/web';
import { images } from '@/assets/img/activity/index';
import ThumbsUp from '@/components/activity/ThumbsUp.vue';
import { onMounted, ref, getCurrentInstance, watch, onBeforeMount, reactive } from 'vue';
import { getArtworks, voteArtwork } from '@/api/activity';
import { beforeOperation, formatMsg, jumpTo, clearTimer, convertToCEP } from '@/utils/common';
import { useUserStore } from '@/stores/user';
import LoginModal from '@/components/layout/LoginModal.vue';
import ScrollNumber from '@/components/activity/ScrollNumber.vue';
import { useConfigurationStore } from '@/stores/configuration';
import { setBurialPoint } from '@/api/burial';

const webStore = useWebStore();
const userStore = useUserStore();
const configStore = useConfigurationStore();
const instance = ref();
const artworks = ref<{ id: string; name: string; url: string; num: number; voted?: boolean }[]>();
const spinning = ref(false);
const votingId = ref('');
const worksRef = ref<HTMLElement>();
const scrollTimer = ref<number>();
const containerRef = ref<HTMLElement>();
const showScroll = ref(false);
const statuses = reactive({ isAfter: false, show: false });
const imageState = reactive({ src: '', visible: false });

const rewards = [
  { rank: '一等奖', reward: '2 个月 4090 的使用权', num: '1 名' },
  { rank: '二等奖', reward: '1 个月 3090 的使用权', num: '3 名' },
  { rank: '三等奖', reward: '2 周 3090 的使用权', num: '5 名' },
  { rank: '最佳创意奖', reward: `${convertToCEP(20000)}\n脑力值`, num: '10 名' },
];

watch(
  () => userStore.isLogining,
  (is) => {
    _getArtworks();

    if (!is) return;
    setBurialPoint({
      creator: userStore.userInfo?.userId as string,
      type: 'page_view_competition_vote',
      body: { phone: userStore.userInfo?.phone },
    });
  },
  { immediate: true, deep: true },
);

function clickImage(src: string) {
  imageState.src = src;
  setImageVisible(true);
}

function setImageVisible(value: boolean) {
  imageState.visible = value;
}

async function clickVote(id: string) {
  votingId.value = id;
  instance.value?.refs[`item_${id}`][0].click();
}

async function afterClickVote() {
  const { code, msg } = await voteArtwork(votingId.value);
  if (code === 20000) {
    message.success('投票成功！');
    votingId.value = '';
    _getArtworks();
  } else {
    message.error(formatMsg(msg));
  }
}

function getImageSrc(name: string) {
  let prefix = webStore.isPc ? 'vote-web' : 'vote-wap';
  let temp = `${prefix}/${name}`;
  return images[temp] || images[`vote-web/${name}`];
}

async function _getArtworks() {
  spinning.value = true;
  const result = await getArtworks(userStore.userInfo?.userId);
  artworks.value = result.data?.map((item: any) => {
    let {
      artwork: { id, name, url },
      vote_num: num,
      voted,
    } = item;
    return { id, name, url, num, voted };
  });
  spinning.value = false;
}

function initWorksNumber() {
  clearTimer(scrollTimer);
  scrollTimer.value = window.setTimeout(() => {
    const $el = worksRef.value;
    if (!$el) return;
    const viewPortHeight = window.innerHeight || document.documentElement.clientHeight;
    const { top } = $el.getBoundingClientRect();
    if (top < viewPortHeight) {
      // 刚进入视图
      showScroll.value = true;
      clearTimer(scrollTimer);
      containerRef.value?.removeEventListener('scroll', initWorksNumber);
    }
  }, 500);
}

function checkVoteActivitty() {
  const { aigcBanners } = configStore;
  const index = aigcBanners.findIndex((i) => i.name === 'competition-vote');
  if (index !== -1) {
    const { afterEnd: isAfter, show } = aigcBanners[index];
    Object.assign(statuses, { isAfter, show });
  } else {
    Object.assign(statuses, { isAfter: true });
  }
}

onBeforeMount(() => {
  configStore.initActivity();
  // 检查投票活动是否存在
  checkVoteActivitty();
});

onMounted(() => {
  instance.value = getCurrentInstance();
  // 滚动
  initWorksNumber();
  containerRef.value?.addEventListener('scroll', initWorksNumber);
});
</script>

<style lang="less" scoped>
.vote-spinning-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -10;

  &.show {
    z-index: 1000;
  }

  :deep(div.ant-spin) {
    max-height: none;
  }

  :deep(.ant-spin-container),
  .vote-inner {
    width: 100%;
    height: 100vh;
  }
}

.vote {
  .back {
    cursor: pointer;
    position: absolute;
    z-index: 2;
    left: calc(21 / 1920 * 100vw);
    top: calc(24 / 1920 * 100vw);
    width: calc(570 / 1920 * 100vw);
    height: calc(60 / 1920 * 100vw);
  }

  :deep(.ant-image-preview) {
    .ant-image-preview-operations {
      > li:has(.anticon-rotate-left),
      > li:has(.anticon-rotate-right) {
        display: none;
      }
    }
  }
}

.vote-content {
  > div {
    position: relative;
    margin-bottom: 6.25rem;
    padding: 5.9375rem 3.3125rem 0;
    width: 56.75rem;

    .bg {
      height: 100%;
      background-size: 100% auto;
      background-repeat: no-repeat;

      &::before,
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        background: inherit;
      }

      &::before {
        top: 6.25rem;
        bottom: 0;
        background-size: 100% 10000px;
        background-position: 0 center;
      }

      &::after {
        bottom: -3rem;
        height: 3rem;
        background-position: 0 bottom;
      }
    }
  }

  .description {
    .flex-mode(column, flex-start);
    gap: 1.5rem;
    margin-top: calc(945 / 1920 * 100vw);

    img {
      width: 100%;
      height: 2.625rem;
    }

    p {
      font-size: 1.125rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: 1.5625rem;
    }

    table {
      width: 100%;
      height: 20.125rem;
      text-align: center;

      th,
      td {
        border: 0.125rem solid #8883fd;

        &:nth-child(1),
        &:nth-child(3) {
          width: 13.5rem;
        }
      }

      th {
        height: 4.0625rem;
        font-size: 1.375rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.875rem;
      }

      td {
        height: 3.9375rem;
        font-size: 1.125rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 1.5625rem;
      }
    }
  }

  .works {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15.6875rem, 1fr));
    gap: 1.5rem;
    height: auto;

    &__item {
      position: relative;
      padding: 1rem 1rem 0.6875rem;
      width: 15.6875rem;
      height: 22.9375rem;
      z-index: 1;
      text-align: center;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        clip-path: polygon(
          0% 0.375rem,
          0.375rem 0%,
          calc(100% - 0.375rem) 0%,
          100% 0.375rem,
          100% calc(100% - 0.375rem),
          calc(100% - 0.375rem) 100%,
          0.375rem 100%,
          0% calc(100% - 0.375rem)
        );
      }

      &::before {
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.65);
        z-index: -2;
      }

      &::after {
        width: calc(100% - 0.125rem);
        height: calc(100% - 0.125rem);
        background: #8883fd;
        z-index: -1;
      }

      img {
        width: 100%;
        height: 13.6875rem;
        cursor: pointer;
      }

      h4 {
        margin: 0.5rem 0 0.25rem;
        font-size: 1.375rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.875rem;
      }

      p {
        .flex-mode;
        margin-bottom: 0.5rem;
        height: 1.5625rem;
        font-size: 1.125rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.5625rem;
      }

      button {
        .flex-mode;
        gap: 0.5rem;
        width: 100%;
        height: 2.875rem;
        background: linear-gradient(90deg, #a54eea 0%, #3337d5 100%);
        clip-path: polygon(
          0% 0.375rem,
          0.375rem 0%,
          calc(100% - 0.375rem) 0%,
          100% 0.375rem,
          100% calc(100% - 0.375rem),
          calc(100% - 0.375rem) 100%,
          0.375rem 100%,
          0% calc(100% - 0.375rem)
        );

        cursor: pointer;

        &:disabled {
          background: rgba(255, 255, 255, 0.25);
          cursor: not-allowed;
        }

        .like-icon {
          width: 1.875rem;
          height: 1.875rem;
        }

        span {
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
    }
  }

  .rules {
    margin-bottom: 6.5rem;

    p {
      font-size: 1.125rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: 1.5625rem;
      text-align: justify;
    }
  }

  > p {
    height: 1.5625rem;
    font-size: 1.125rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 1.5625rem;
  }
}

@media screen and(max-width: 62.5rem) {
  .vote:not(.vote-mobile) {
    .vote-content {
      > div {
        margin-bottom: calc(100 / 1000 * 100vw);
        padding: calc(95 / 1000 * 100vw) calc(53 / 1000 * 100vw) 0;
        width: calc(908 / 1000 * 100vw);
      }

      .description {
        gap: calc(24 / 1000 * 100vw);
        margin-top: calc(945 / 1920 * 100vw);

        img {
          height: calc(42 / 1000 * 100vw);
        }

        p {
          font-size: calc(18 / 1000 * 100vw);
          line-height: calc(25 / 1000 * 100vw);
        }

        table {
          height: calc(322 / 1000 * 100vw);

          th,
          td {
            border: calc(2 / 1000 * 100vw) solid #8883fd;

            &:nth-child(1),
            &:nth-child(3) {
              width: calc(216 / 1000 * 100vw);
            }
          }

          th {
            height: calc(65 / 1000 * 100vw);
            font-size: calc(22 / 1000 * 100vw);
            line-height: calc(30 / 1000 * 100vw);
          }

          td {
            height: calc(63 / 1000 * 100vw);
            font-size: calc(18 / 1000 * 100vw);
            line-height: calc(25 / 1000 * 100vw);
          }
        }
      }

      .works {
        grid-template-columns: repeat(auto-fit, minmax(calc(251 / 1000 * 100vw), 1fr));
        gap: calc(24 / 1000 * 100vw);

        &__item {
          padding: calc(16 / 1000 * 100vw) calc(16 / 1000 * 100vw) calc(11 / 1000 * 100vw);
          width: calc(251 / 1000 * 100vw);
          height: calc(367 / 1000 * 100vw);

          img {
            height: calc(219 / 1000 * 100vw);
          }

          h4 {
            margin: calc(8 / 1000 * 100vw) 0 calc(4 / 1000 * 100vw);
            font-size: calc(22 / 1000 * 100vw);
            line-height: calc(30 / 1000 * 100vw);
          }

          p {
            height: calc(25 / 1000 * 100vw);
            margin-bottom: calc(8 / 1000 * 100vw);
            font-size: calc(18 / 1000 * 100vw);
            line-height: calc(25 / 1000 * 100vw);
          }

          button {
            gap: calc(8 / 1000 * 100vw);
            height: calc(46 / 1000 * 100vw);
            @n: calc(6 / 1000 * 100vw);
            clip-path: polygon(
              0% @n,
              @n 0%,
              calc(100% - @n) 0%,
              100% @n,
              100% calc(100% - @n),
              calc(100% - @n) 100%,
              @n 100%,
              0% calc(100% - @n)
            );

            .like-icon {
              width: calc(30 / 1000 * 100vw);
              height: calc(30 / 1000 * 100vw);
            }

            span {
              height: calc(28 / 1000 * 100vw);
              font-size: calc(20 / 1000 * 100vw);
              line-height: calc(28 / 1000 * 100vw);
            }
          }
        }
      }

      .rules {
        margin-bottom: calc(104 / 1000 * 100vw);

        p {
          font-size: calc(18 / 1000 * 100vw);
          line-height: calc(25 / 1000 * 100vw);
        }
      }

      > p {
        height: calc(25 / 1000 * 100vw);
        font-size: calc(18 / 1000 * 100vw);
        line-height: calc(25 / 1000 * 100vw);
      }
    }
  }
}

.vote-mobile {
  .back {
    left: calc(4 / 375 * 100vw);
    top: calc(3 / 375 * 100vw);
    width: calc(140 / 375 * 100vw);
    height: calc(15 / 375 * 100vw);
  }

  .vote-content {
    padding: 0 0 1.5rem;

    > div {
      margin-bottom: 2.875rem;
      padding: 2.6875rem 1.25rem 0 1.1875rem;
      width: 19.0625rem;
    }

    .bg {
      &::after {
        bottom: -1.6875rem;
        height: 1.6875rem;
        background-position: 0 bottom;
      }
    }

    .description {
      margin-top: calc(185 / 375 * 100vw);
      gap: 0.5rem;

      img {
        height: 1.5rem;
      }

      p {
        margin-bottom: 0.25rem;
        font-size: 0.75rem;
        line-height: 1.0625rem;
        white-space: nowrap;
      }

      table {
        height: 14.875rem;

        th,
        td {
          width: 5.5rem;
          padding: 0.5rem 0.625rem;
          border: 0.0625rem solid #8883fd;
          white-space: pre-line;
        }

        th {
          height: 2.375rem;
          font-size: 1rem;
          line-height: 1.375rem;
        }

        td {
          height: auto;
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }
      }
    }

    .works {
      grid-template-columns: repeat(auto-fit, minmax(7.875rem, 1fr));
      gap: 0.8125rem;

      &__item {
        padding: 0.5rem;
        width: 7.875rem;
        height: 12.3125rem;

        &::before,
        &::after {
          clip-path: polygon(
            0% 0.1875rem,
            0.1875rem 0%,
            calc(100% - 0.1875rem) 0%,
            100% 0.1875rem,
            100% calc(100% - 0.1875rem),
            calc(100% - 0.1875rem) 100%,
            0.1875rem 100%,
            0% calc(100% - 0.1875rem)
          );
        }

        img {
          height: 6.875rem;
        }

        h4 {
          margin: 0.25rem 0;
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }

        p {
          margin-bottom: 0.25rem;
          height: 1.0625rem;
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }

        button {
          gap: 0.4375rem;
          height: 1.5625rem;
          clip-path: polygon(
            0% 0.1875rem,
            0.1875rem 0%,
            calc(100% - 0.1875rem) 0%,
            100% 0.1875rem,
            100% calc(100% - 0.1875rem),
            calc(100% - 0.1875rem) 100%,
            0.1875rem 100%,
            0% calc(100% - 0.1875rem)
          );

          .like-icon {
            width: 0.9375rem;
            height: 0.9375rem;
          }

          span {
            height: 1.0625rem;
            font-size: 0.75rem;
            line-height: 1.0625rem;
          }
        }
      }
    }

    .rules {
      margin-bottom: 3rem;

      p {
        font-size: 0.75rem;
        color: #ffffff;
        line-height: 1.0625rem;
      }
    }

    > p {
      height: 1.0625rem;
      font-size: 0.75rem;
      line-height: 1.0625rem;
    }
  }
}
</style>
