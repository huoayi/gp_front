<template>
  <section class="common-activity competition" :class="webStore.getClassName('competition')">
    <div class="back" @click="jumpTo('/aigc')"></div>
    <div class="common-activity__content competition-content">
      <img class="bg" :src="getImageSrc('bg')" />

      <div class="first" :style="{ backgroundImage: `url(${getImageSrc('participateWay')})` }">
        <ul class="list">
          <li class="item" v-for="(item, index) in participateWayList">
            <div class="left">
              <span class="index">0{{ index + 1 }}</span>
              <div class="bor"></div>
            </div>
            <div class="dot-line" :class="index !== 3 ? '' : 'last'">
              <span v-if="index == 2" class="text"
                >参赛作品需添加 “CEP” 的 LOGO （
                <button class="click-text" @click="downloadCodeImg">点击下载</button> LOGO ），尺寸要求：1024*1024
                px</span
              >
              <span class="text" v-else>{{ item }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="second" :style="{ backgroundImage: `url(${getImageSrc('selectWay')})` }">
        <span>官方会将符合要求的作品，上传至 Cephalon 网站进行公开投票，活动结束后，按获票数排名颁发奖励</span>
      </div>

      <div class="third" :style="{ backgroundImage: `url(${getImageSrc('reward')})` }">
        <table border="1" class="table">
          <thead>
            <tr>
              <th class="rank">排名</th>
              <th class="reward">奖励</th>
              <th class="number">数量</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>一等奖</td>
              <td>2 个月 4090 的使用权</td>
              <td>1 名</td>
            </tr>
            <tr>
              <td>二等奖</td>
              <td>1 个月 3090 的使用权</td>
              <td>3 名</td>
            </tr>
            <tr>
              <td>三等奖</td>
              <td>2 周 3090 的使用权</td>
              <td>5 名</td>
            </tr>
            <tr>
              <td>最佳创意奖</td>
              <td>{{ convertToCEP(20000) }} <br v-if="!webStore.isPc" />脑力值</td>
              <td>10 名</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="fouth" :style="{ backgroundImage: `url(${getImageSrc('rule')})` }">
        <span>1. 投稿作品需符合活动主题和参与规则，否则判定为无效；</span>
        <span>2. 要求投稿作品为参赛者的原创作品，且对其拥有独立、完整、明确、无争议的著作权；</span>
        <span>3. 收到作品后，官方人员将从每个人的作品集中挑选 1 张上传至 Cephalon 官网进行公开投票；</span>
        <span>4. 活动结束后，将按作品的按获票量降序排列，排名 1 ~ 3 的参赛者分别获 “一/二/三等奖”；</span>
        <span>5. 同一参赛者不同账号发布多篇作品的情况，获票排名时仅计算该参赛者获票最高的作品，不重复；</span>
        <span>计算，不累加计算；</span>
        <span>6. 评选奖项时，如遇获票数相同的情况，则按作品发布时间排序，发布时间晚的参赛者排名靠前；</span>
        <span>7. 最佳创意奖：活动结束后，官方将综合作品创意和质量等，评选出 10 名获奖者；</span>
        <span>8. 本次活动中，参赛者最多获得 1 个奖项，发放奖品时以价值最高的奖项为准；</span>
        <span>9. 活动中如发现违规操作或恶意刷票等行为，将取消相关参赛者的评选资格；</span>
        <span>10. 曾在各类绘画比赛中获奖的作品，谢绝参与；</span>
        <span>11. 为保证活动的公平性，端脑工作人员不得参加本次活动；</span>
        <span>12. 端脑拥有投稿作品在本次活动宣传范围内非商业用途的使用权，投稿参赛即视为默认此项规则。</span>
      </div>
      <p>*本次活动最终解释权归端脑科技所有</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { images } from '@/assets/img/competition/index';
import { useWebStore } from '@/stores/web';
import { convertToCEP, jumpTo } from '@/utils/common';
import { useUserStore } from '@/stores/user';
import { ref, watch, onBeforeMount } from 'vue';
import { setBurialPoint } from '@/api/burial';
import { useConfigurationStore } from '@/stores/configuration';
import logoOne from '@/assets/img/competition/typeone.png';
import logoTwo from '@/assets/img/competition/typetwo.png';

const userStore = useUserStore();
const webStore = useWebStore();
const configStore = useConfigurationStore();
const participateWayList = ref([
  '观看氪学家12 月 22 日发布的视频教程',
  '通过 Cephalon 创作「 超级英雄圣诞形象 」的参赛作品',
  '参赛作品需添加 “CEP” 的 LOGO （ 点击下载 LOGO ），尺寸要求：1024*1024 px',
  '将参赛作品命名为 “注册 Cephalon 手机号+昵称” ，发送至邮箱 seven@cephalon.ai ',
]);

function downloadCodeImg() {
  console.log('下载图片');
  var a = document.createElement('a');
  a.download = 'logoOne';
  // 设置图片地址
  a.href = logoOne;
  a.click();
  a.download = 'logoTwo';
  a.href = logoTwo;
  a.click();
}

watch(
  () => userStore.isLogining,
  (is) => {
    if (!is) return;
    setBurialPoint({
      creator: userStore.userInfo?.userId as string,
      type: 'page_view_competition',
      body: { phone: userStore.userInfo?.phone },
    });
  },
  { immediate: true, deep: true },
);

onBeforeMount(() => {
  configStore.initActivity();
});

function getImageSrc(name: string) {
  let prefix = webStore.isPc ? 'competition-web' : 'competition-wap';
  let temp = `${prefix}/${name}`;
  console.log(images[temp] || images[`competition-web/${name}`]);

  return images[temp] || images[`competition-web/${name}`];
}
</script>

<style lang="less" scoped>
/**
* 替换正则：(\d+)px  →  calc($1 / 1920 * 100vw)
* pc：1920，h5：375
*/
.back {
  cursor: pointer;
  position: absolute;
  z-index: 2;
  left: calc(21 / 1920 * 100vw);
  top: calc(24 / 1920 * 100vw);
  width: calc(570 / 1920 * 100vw);
  height: calc(60 / 1920 * 100vw);
}

.competition-content {
  padding-bottom: 0;

  .bg {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
  }

  > div {
    margin-bottom: 3.25rem;
    width: 56.75rem;
    text-align: center;
    background-size: 100%;
  }

  span,
  th,
  td {
    position: relative;
    z-index: 1;
    width: fit-content;
    font-size: 1.125rem;
    line-height: 1.5625rem;
    font-family:
      PingFangSC,
      PingFang SC;
    white-space: nowrap;
  }

  .first {
    margin-top: calc(945 / 1920 * 100vw);
    box-sizing: border-box;
    padding: 5.9375rem 3.75rem 2rem 0;
    .flex-mode(column);
    background-repeat: no-repeat;
    .list {
      .flex-mode(column,center,flex-start);
      .dot-line {
        transform: translateX(5.25rem);
        border-left: 1px dashed white;
        .text {
          position: relative;
          left: 1.6875rem;
          display: block;
          transform: translateY(-120%);
          .click-text {
            cursor: pointer;
            color: #ffeb82;
          }
          .click-text:hover {
            color: #ffdb20;
          }
        }
      }
      .last {
        border: none;
      }
      .item {
        .flex-mode(column,center,flex-start);
        margin-left: -1.875rem;
        .left {
          height: 100%;
          max-width: 6rem;
          flex: 1;
          .flex-mode();
          gap: 1.5rem;
          .index {
            min-width: 3rem;
            font-size: 2rem;
            line-height: 2.625rem;
            font-family: YouSheBiaoTiHei;
            color: #ffffff;
            line-height: 2.625rem;
            text-align: right;
          }
          .bor {
            width: 1.5rem;
            height: 1.5rem;
            border: 0.125rem solid #ffffff;
            border-radius: 50%;
          }
        }
      }
    }
  }

  .second {
    background-repeat: no-repeat;
    box-sizing: border-box;
    padding: 7.3125rem 3.75rem 3.2rem 3.625rem;
  }

  .third {
    background-repeat: no-repeat;
    text-align: center;
    box-sizing: border-box;
    padding: 5.9375rem 3.75rem 2.9rem 3.625rem;
    .table {
      width: 100%;
      tr,
      td,
      th {
        border: 0.0625rem solid #8883fd;
        height: 4.0625rem;
      }
      .rank {
        width: calc(216 / 1920 * 100vw);
      }
      .reward {
        width: calc(365 / 1920 * 100vw);
      }
      .number {
        width: calc(216 / 1920 * 100vw);
      }
    }
  }

  .fouth {
    background-repeat: no-repeat;
    margin-bottom: 3rem;
    box-sizing: border-box;
    padding: 6.0625rem 3.125rem 3.75rem 3.625rem;
    flex-wrap: wrap;

    span {
      font-size: 1.125rem;
      line-height: 1.5625rem;
      display: flex;
      align-items: flex-start;
      white-space: normal;
      justify-content: left;
      float: left;
    }
  }

  > p {
    margin-bottom: 3.5rem;
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

@media (max-width: 1000px) {
  .competition-content {
    > div {
      margin-bottom: calc(52 / 1920 * 100vw);
      width: calc(908 / 1000 * 100vw);
      text-align: center;
      background-size: 100%;
    }

    span,
    th,
    td {
      position: relative;
      z-index: 1;
      width: fit-content;
      font-size: calc(18 / 1000 * 100vw);
      line-height: calc(25 / 1000 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      white-space: nowrap;
    }

    .first {
      margin-top: calc(945 / 1920 * 100vw);
      height: calc(396 / 1000 * 100vw);
      box-sizing: border-box;
      padding: calc(95 / 1000 * 100vw) calc(60 / 1000 * 100vw) calc(32 / 1000 * 100vw) 0;
      .flex-mode(column);
      background-repeat: no-repeat;
      // transform: translateY(50%);
      .list {
        .flex-mode(column,center,flex-start);
        .dot-line {
          transform: translateX(calc(84 / 1000 * 100vw));
          border-left: 1px dashed white;
          .text {
            position: relative;
            left: calc(27 / 1000 * 100vw);
            display: block;
            transform: translateY(-120%);
            .clickText {
              color: #ffeb82;
            }
            .clickText:hover {
              color: #ffdb20;
            }
          }
        }
        .last {
          border: none;
        }
        .item {
          .flex-mode(column,center,flex-start);
          margin-left: -30px;
          .left {
            height: 100%;
            max-width: calc(96 / 1000 * 100vw);
            flex: 1;
            .flex-mode();
            gap: calc(24 / 1000 * 100vw);
            .index {
              min-width: calc(48 / 1000 * 100vw);
              font-size: calc(32 / 1000 * 100vw);
              line-height: calc(42 / 1000 * 100vw);
              font-family: YouSheBiaoTiHei;
              color: #ffffff;
              line-height: calc(42 / 1000 * 100vw);
              text-align: right;
            }
            .bor {
              width: calc(24 / 1000 * 100vw);
              height: calc(24 / 1000 * 100vw);
              border: calc(2 / 1000 * 100vw) solid #ffffff;
              border-radius: 50%;
            }
          }
        }
      }
    }

    .second {
      height: calc(195 / 1000 * 100vw);
      background-repeat: no-repeat;
      box-sizing: border-box;
      padding: calc(105 / 1000 * 100vw) calc(60 / 1000 * 100vw) calc(60 / 1000 * 100vw) calc(58 / 1000 * 100vw);
    }

    .third {
      background-repeat: no-repeat;
      height: calc(470 / 1000 * 100vw);
      text-align: center;
      box-sizing: border-box;
      padding: calc(95 / 1000 * 100vw) calc(60 / 1000 * 100vw) calc(60 / 1000 * 100vw) calc(58 / 1000 * 100vw);
      .table {
        width: 100%;
        tr,
        td,
        th {
          border: 1px solid #8883fd;
          height: calc(65 / 1000 * 100vw);
        }
      }
    }

    .fouth {
      background-repeat: no-repeat;
      margin-bottom: calc(48 / 1920 * 100vw);
      box-sizing: border-box;
      padding: calc(97 / 1000 * 100vw) calc(50 / 1000 * 100vw) calc(60 / 1000 * 100vw) calc(58 / 1000 * 100vw);
      flex-wrap: wrap;

      span {
        font-size: calc(18 / 1000 * 100vw);
        line-height: calc(25 / 1000 * 100vw);
        display: flex;
        align-items: flex-start;
        white-space: normal;
        justify-content: left;
        float: left;
      }
    }

    > p {
      margin-bottom: calc(22 / 375 * 100vw);
      height: calc(28 / 1000 * 100vw);
      font-size: calc(20 / 1000 * 100vw);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: calc(28 / 1000 * 100vw);
    }
  }
}

.competition-mobile {
  .back {
    left: calc(7 / 375 * 100vw);
    top: calc(7 / 375 * 100vw);
    width: calc(140 / 375 * 100vw);
    height: calc(15 / 375 * 100vw);
  }
  .competition-content {
    > div {
      margin-bottom: 1.1875rem;
      width: 19rem;
    }
    span,
    th,
    td {
      position: relative;
      z-index: 1;
      width: fit-content;
      font-size: 0.75rem;
      line-height: 1.0625rem;
      font-family:
        PingFangSC,
        PingFang SC;
      white-space: nowrap;
    }

    .first {
      margin-top: calc(267 / 375 * 100vw);
      height: 17.9375rem;
      box-sizing: border-box;
      padding: 2.5rem 1.875rem 1.3125rem 1.1875rem;

      .list {
        width: 100%;
        .flex-mode(column,center,flex-start);
        gap: 0.625rem;

        .item {
          width: 100%;
          margin-left: 0;
          .left {
            height: 100%;
            .flex-mode();
            min-width: 3.125rem;
            gap: 0.5rem;
            justify-content: flex-end;

            .index {
              min-width: 1.6875rem;
              font-size: 1.125rem;
              line-height: calc(42 / 1920 * 100vw);
              font-family: YouSheBiaoTiHei;
              color: #ffffff;
              line-height: calc(42 / 1920 * 100vw);
              text-align: right;
            }
            .bor {
              width: 0.9375rem;
              height: 0.9375rem;
              border: 0.0625rem solid #ffffff;
              border-radius: 50%;
            }
          }

          .dot-line {
            max-height: 2.1875rem;
            transform: translate(2.5625rem, 0.3125rem);

            .text {
              width: 12.1875rem;
              transform: translate(1.0625rem, -1.25rem);

              text-align: left;
              white-space: normal;
            }
          }
          .last {
            border: none;
          }
          span {
            white-space: normal;
          }
        }
      }

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
      height: 6.1875rem;
      box-sizing: border-box;
      padding: 2.6875rem 0.875rem 1.375rem 0.875rem;
      display: flex;
      justify-content: flex-start;
      span {
        white-space: normal;
        text-align: left;
      }
    }

    .third {
      margin-bottom: 1rem;
      height: 19.0625rem;
      background-repeat: no-repeat;
      text-align: center;
      box-sizing: border-box;
      padding: 2.5rem 1.25rem 1.6875rem 1.1875rem;
      .table {
        width: 100%;
        tr,
        td,
        th {
          width: 5.5rem;
          border: 0.0625rem solid #8883fd;
          height: 2.375rem;
          white-space: normal;
          padding: 0.4375rem 0.5rem;
        }
        th {
          font-size: 1rem;
          font-weight: 500;
        }
      }
    }

    .fouth {
      background-repeat: no-repeat;
      height: 29.875rem;
      .flex-mode(column,left,flex-start);
      text-align: left;
      box-sizing: border-box;
      padding: 2.6875rem 1.0625rem 1.6875rem 1.1875rem;
      flex-wrap: wrap;

      span {
        white-space: normal;
      }
    }

    > p {
      margin-bottom: 1.375rem;
      height: 1.0625rem;
      font-size: 0.75rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      color: white;
      line-height: 1.0625rem;
    }
  }
}
</style>
