<template>
  <section
    class="register-landing"
    :class="[webStore.getClassName('register-landing'), isSpring ? 'register-landing--spring' : '']"
  >
    <img v-if="!isSpring" class="logo" src="@/assets/img/logo.png" />
    <div class="register-landing-content">
      <template v-if="isSpring">
        <div class="spring-bgs"></div>
        <img class="logo" src="@/assets/img/logo.png" />
      </template>

      <h1>Cephalon Cloud 端脑云</h1>
      <h4>{{ subTitle }}</h4>
      <div class="images-wrapper" v-if="webStore.isPc">
        <div class="images-carousel">
          <template v-for="(item, index) in list" :key="item.iconName">
            <div
              class="item-image"
              :style="{
                ...listData[index % listData.length].style,
                backgroundImage: `url(${images[list[index % list.length].iconName]})`,
              }"
            >
              <!-- <span class="line"></span> -->
            </div>
            <div
              class="item-content cursor-pointer"
              :style="listData[index % listData.length].contentStyle"
              @click="clickItem(index)"
            >
              <div class="detail-text" v-if="index === activeIndex">
                <h1>{{ item.text }}</h1>
                <p>{{ item.sub }}</p>
              </div>
              <h3 v-else>{{ item.title || item.text.replace(' ', '\n') }}</h3>
            </div>
          </template>
        </div>
      </div>
      <Carousel class="carousel-wrapper" :initial-slide="3" v-else>
        <div class="item" v-for="item in list">
          <img :src="images[item.iconName]" />
          <div class="item-text">
            <h5>{{ item.text }}</h5>
            <p>{{ item.sub }}</p>
          </div>
        </div>
      </Carousel>
      <p class="gift-text" v-if="isSpring">春节期间，注册即可参与幸运抽奖，赢取 RTX 4090 !</p>
      <p class="gift-text" :class="{ ' gift-text-secondary': isSpring }" v-if="state.shareCep">
        注册即送 {{ state.shareCep }} 脑力值 ，AIGC 工具免费体验！
      </p>
      <p class="gift-text" :class="{ ' gift-text-secondary': isSpring }" v-else>立即注册，还可参与更多优惠活动！</p>
      <Button type="primary" class="reg-btn" @click="immediatelyreg">立即注册</Button>
      <p class="open-text">推荐用 PC 浏览器打开下方链接 ，体验更佳！</p>
      <div class="link hover-icon-display-wrapper hover-text" @click="copyText(state.link)">
        <span>{{ state.link }}</span>
        <div v-if="isSpring">
          <img src="@/assets/img/share/registerLanding/spring/copy.png" alt="" class="icon-d" />
          <img src="@/assets/img/share/registerLanding/spring/copy-hover.png" class="hover-icon" alt="" />
        </div>
        <div v-else>
          <img src="@/assets/img/copy.png" alt="" class="icon-d" />
          <img src="@/assets/img/copy-hover.png" class="hover-icon" alt="" />
        </div>
      </div>
    </div>
    <block-background :show="webStore.isPc" v-if="!isSpring" />
  </section>
</template>

<script setup lang="ts">
import { images } from '@/assets/img/share/registerLanding';
import { computed, onBeforeMount, reactive, watch, type CSSProperties } from 'vue';
import { Button, Carousel } from 'ant-design-vue';
import BlockBackground from '@/components/BlockBackground.vue';
import { useWebStore } from '@/stores/web';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { queryInviteReward } from '@/api/user';
import { convertToCEP, copyText, openUrl, toRem } from '@/utils/common';
import { setBurialPoint } from '@/api/burial';
import { queryUserInfoByInviteId } from '@/api/invite';
import { useConfigurationStore } from '@/stores/configuration';

const userStore = useUserStore();
const webStore = useWebStore();
const route = useRoute();
const subTitle = computed(() =>
  '分布式 AIGC 算力网络，全网最高性价比？海量专业 AIGC 工具，无需部署，在线使用'.replace(
    '？',
    webStore.isPc ? '，' : '\n',
  ),
);

const list = reactive([
  { iconName: 'private-video', text: 'AI 私域视频创作', sub: 'Zeroscope' },
  { iconName: 'dev-env', text: 'AI 开发环境', sub: 'Jupyter、内置 AnacondaTensorflow、Torch 等开发环境' },
  {
    iconName: 'large-model',
    text: 'Chatchat 大语言模型',
    sub: '100% 私密性保证，支持上传语料自由训练，支持分享多人使用',
  },
  { iconName: 'sd', text: 'Stable Diffusion', sub: '一键部署 AI 绘图环境，预置各种主流插件' },
  { iconName: 'super-paint', title: 'AI\n超级绘图', text: '超级 AI 绘图', sub: 'Stable Diffusion XL' },
  {
    iconName: 'senior-dev-env',
    title: 'AI\n高级开发环境',
    text: '高级 AI 开发环境',
    sub: 'Web SSH / SSH，内置 Anaconda、Tensorflow、Torch 等开发环境',
  },
  { iconName: 'more', title: '更多应用\n敬请期待', text: '更多应用敬请期待', sub: '音频处理、自动谱曲、自动编舞等' },
]);
const activeIndex = computed(() => Math.floor(list.length / 2));
const config = { width: 650, height: 520, perspective: 1000, angle: 30 }; // px deg
const angleRad = (config.angle * Math.PI) / 180;
interface IListDataItem {
  contentStyle: CSSProperties;
  style: CSSProperties;
}
const listData: IListDataItem[] = [];
const state = reactive({ link: '', shareCep: 0 });
// spring
const configStore = useConfigurationStore();
const isSpring = computed(() => !!configStore.aigcBanners.find((i) => i.name === 'spring' && i.show));

watch(
  () => route.query,
  ({ id }) => {
    state.shareCep = convertToCEP(1000); // 基础注册
    let origin = location.origin + location.pathname;
    let link = `${origin}#/aigc`;
    if (id) {
      link += `?id=${id}`;
      queryReward(`${id}`);
    }
    state.link = link;
  },
  { immediate: true, deep: true },
);

const getInviteUserInfo = async () => {
  let id = route.query.id as string;
  let userInfo = await queryUserInfoByInviteId(id);
  return userInfo;
};

onBeforeMount(async () => {
  // spring
  configStore.initActivity();
  // 初始化
  listData.length = 0;
  for (let i = 0; i < list.length; i++) {
    let temp = getItemData(i);
    listData.push(temp);
  }
  let userInfo: any = (await getInviteUserInfo()).data;
  await setBurialPoint({ creator: userInfo?.id as string, type: 'page_view_landing', body: { phone: userInfo.phone } });
});

// 新加的函数，用于埋点注册按钮
const immediatelyreg = async () => {
  openUrl(state.link);
  let { id, phone } = (await getInviteUserInfo()).data || {};
  if (!id) return;
  setBurialPoint({ creator: id, type: 'click_register', body: { phone } });
  gdt('track', 'REGISTER', { id, phone }); // 注册
};

async function queryReward(id: string) {
  const { code, data } = await queryInviteReward(id);
  if (code === 20000 && data.list?.length > 0) {
    const { reg_cep } = data.list[0];
    let regCep = userStore.isActivityExist ? reg_cep : 0;
    state.shareCep = convertToCEP(1000 + regCep); // 基础注册送 1000，绑定邀请码送 reg_cep
  }
}

function getItemData(index: number) {
  const { width, height, angle } = config;
  const rad = angleRad;
  let diff = index - activeIndex.value;
  let abs = Math.abs(diff);
  let isMiddle = abs === 0; // 中间项
  let sign = Math.sign(diff); // 区分左右侧，sign < 0 时是左侧
  // 80px 是在视觉上估算中间项跟相邻项之间的初始高度差，再以 40px 为基数向左右侧递减高度
  let initHeightDiff = 80,
    baseHeightDiff = 40;
  let nh = isMiddle ? height : height - initHeightDiff - baseHeightDiff * abs;
  let nw = (width * nh) / height;
  let zIndex = abs * -1 + list.length;
  let rotateY = isMiddle ? 0 : sign * -1 * angle;

  let showlog = false && sign < 0 && abs === 1; // 测试使用
  let opacity = 1; // showlog ? 1 : isMiddle ? 0.1 : 0; // 同上

  // 以中间竖轴为旋转轴，也就是 Y 轴，对半拆为左右两侧区域
  // 另外：旋转 Y 轴后的宽度，在不带 perspective 情况下的计算是 nw * Math.cos(rad)
  let closex = Math.abs(calc({ oldx: -nw / 2 })); // 旋转 Y 轴后视觉上靠近的一半区域
  let farx = Math.abs(calc({ oldx: nw / 2 })); // 旋转 Y 轴后视觉上远离的一半区域
  // 以左侧项举例，需要计算在中间竖轴以左的半区域在旋转 Y 轴且视距影响下的投影宽度即 closex，
  // 来计算左侧项离中间项左边框的距离即 【width / 2 - closex】，
  // 再去以 170px 为基数向左侧依次递增
  let baseOffsetDiff = 170 * Math.cos(rad); // 这个是 170px 的投影宽度
  let ox = baseOffsetDiff * abs;
  let translateX = isMiddle ? 0 : sign * (width / 2 - closex + ox);
  if (showlog) console.log('show', nw, closex, farx, closex + farx, getWidth(nw), ox, translateX);
  // 计算移动过后的投影宽度
  let tempTx = isMiddle ? 0 : Math.abs(translateX) * -1;
  let moveClosex = Math.abs(calc({ oldx: -nw / 2, oldTx: tempTx }));
  let moveFarx = Math.abs(calc({ oldx: nw / 2, oldTx: tempTx }));
  if (showlog) console.log('fx1', moveClosex, moveFarx, moveClosex + moveFarx);
  // 矫正：由于上面的移动导致投影宽度变化。但是这里重新移动之后还是会再次影响到投影宽度
  translateX += -sign * (moveClosex - closex);
  let tempTx2 = isMiddle ? 0 : Math.abs(translateX) * -1;
  let moveClosex2 = Math.abs(calc({ oldx: -nw / 2, oldTx: tempTx2 }));
  let moveFarx2 = Math.abs(calc({ oldx: nw / 2, oldTx: tempTx2 }));
  if (showlog) console.log('fx2', moveClosex2, moveFarx2, moveClosex2 + moveFarx2);
  // 这里不再做矫正，粗略用第一次矫正即可
  // translateX += -sign * (moveClosex2 - moveClosex);
  // 除了中间项，其他项需要保持文本水平对齐
  let temph = height - initHeightDiff - baseHeightDiff * 1;
  let cnh = isMiddle ? height : temph / Math.cos(rad),
    cnw = isMiddle ? width : (width * temph) / height;
  // 以左侧项为例：存放文本内容的 div 区域需要跟对应项的左边框对齐
  let conTranslateX = isMiddle ? 0 : translateX + sign * Math.abs(cnw / 2 - moveClosex2);
  let padx = cnw - baseOffsetDiff;
  let conPadding = isMiddle ? undefined : sign > 0 ? `0 0 0 ${toRem(padx)}` : `0 ${toRem(padx)} 0 0`;
  // 其他项的背景的中间部分移动到展示区域
  let backPositionX = isMiddle ? 0 : (sign * cnw) / 2 / 2;

  return {
    style: {
      zIndex,
      transform: `translate(calc(${toRem(translateX)} - 50%), -50%) rotateY(${rotateY}deg)`,
      width: toRem(nw),
      height: toRem(nh),
      left: '50%',
      top: '50%',
      backgroundImage: `url(${images[list[index % list.length].iconName]})`,
      backgroundPosition: `${toRem(backPositionX)} 0`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      opacity,
    },
    contentStyle: {
      transform: `translate(calc(${toRem(conTranslateX)} - 50%), -50%)`,
      padding: conPadding,
      width: toRem(cnw),
      height: toRem(cnh),
      left: '50%',
      top: '50%',
      zIndex,
      justifyContent: sign === 0 ? 'center' : sign < 0 ? 'left' : 'right',
      opacity,
    },
  } as IListDataItem;
}

// 投影宽度：以中间竖轴为旋转轴，分别计算左右对应的投影宽度，相加之后就是整个区域的宽度
function getWidth(w: number) {
  let A = 0;
  let B = w;
  A -= w / 2;
  B -= w / 2;
  A = calc({ oldx: A });
  B = calc({ oldx: B });
  if (B < A) {
    let temp = A;
    A = B;
    B = temp;
  }
  let frw = B - A;
  return frw;
}

// 计算投影宽度：在 perspective 下，rotateY 和 translateX 都会影响最终的投影宽度
function calc(c: { oldx: number; oldTx?: number; log?: boolean }) {
  const { perspective } = config;
  const rad = angleRad;
  let { oldx, oldTx = 0, log = false } = c;

  let x = oldx * Math.cos(rad);
  let z = oldx * Math.sin(rad);
  log && console.log(x, '--', z);
  return ((x + oldTx) * perspective) / (perspective + z) - oldTx;
}

function clickItem(index: number) {
  // 只判断移动一个
  if (index === activeIndex.value) return;
  if (index > activeIndex.value) {
    const prevs = list.splice(0, 1);
    list.push(...prevs);
  } else {
    const nexts = list.splice(-1);
    list.unshift(...nexts);
  }
}
</script>

<style lang="less" scoped>
.register-landing {
  z-index: 1;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #170e1d 0%, #0d0d0e 100%);
  text-align: center;
  overflow: hidden auto;

  .logo {
    position: fixed;
    z-index: 2;
    top: 1.8125rem;
    left: 1.25rem;
    width: 10rem;
    height: 2.0625rem;
  }

  &-content {
    position: relative;
    z-index: 1;
    padding: 5rem 0;
  }

  &::-webkit-scrollbar {
    width: 0rem;
    height: 0rem;
  }

  h1 {
    margin-bottom: 1.125rem;
    font-size: 2.375rem;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 3.3125rem;
  }

  h4 {
    font-size: 1.625rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    line-height: 2.3125rem;
  }

  .images-wrapper {
    padding: 2rem;
    width: 100%;

    .images-carousel {
      position: relative;
      margin: 0 auto;
      width: 40.625rem;
      height: 32.5rem;
      perspective: 62.5rem;

      > * {
        transition:
          all 1s,
          background-position 0s,
          padding 0s,
          z-index 0s;
      }

      .item-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-shadow:
          -1rem 0rem 1.125rem 0rem rgba(0, 0, 0, 0.5),
          1rem 0.125rem 1.125rem 0rem rgba(0, 0, 0, 0.5);
        border-radius: 0.375rem;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%);
        }

        // 测试使用：辅助线
        .line {
          position: absolute;
          z-index: 20;
          left: 50%;
          width: 0.125rem;
          height: 100%;
          transform: translate(-50%, 0);
          background: blue;
        }
      }

      .item-content {
        // .br(green);
        position: absolute;
        top: 0;
        left: 0;
        .flex-mode;
        align-items: flex-end;

        h3 {
          margin-bottom: 4.375rem;
          width: 100%;
          height: 4.125rem;
          font-size: 1.5rem;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          font-weight: 500;
          color: @color-text;
          line-height: 2.0625rem;
          white-space: pre-line;
          text-align: center;
        }

        .detail-text {
          margin-bottom: 2rem;
          text-align: center;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          color: #ffffff;
          white-space: nowrap;

          h1 {
            margin-bottom: 0.5rem;
            height: 2.8125rem;
            font-size: 2rem;
            font-weight: 500;
            line-height: 2.8125rem;
          }

          p {
            height: 1.5625rem;
            font-size: 1.125rem;
            font-weight: 400;
            line-height: 1.5625rem;
          }
        }
      }
    }
  }

  .gift-text {
    font-size: 2.375rem;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 3.3125rem;
  }

  .reg-btn {
    margin: 1.5rem 0 2rem;
    width: 9.125rem;
    height: 3.375rem;
    background: #793aea;
    border-radius: 0.375rem;
  }

  .open-text {
    height: 1.75rem;
    font-size: 1.25rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    line-height: 1.75rem;
  }

  .link {
    .flex-mode;
    margin: 0.875rem auto 0;
    width: fit-content;
    height: 1.375rem;
    font-size: 1rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    line-height: 1.375rem;

    img {
      margin-left: 0.5rem;
      width: 1rem;
      height: 1rem;
    }
  }

  &--spring {
    .register-landing-content {
      padding: 0 0 2.1875rem;
    }

    .logo {
      position: static;
      margin: 0.875rem 0 2.0625rem;
    }

    .images-wrapper {
      .images-carousel {
        .item-image {
          box-shadow: none;
        }
      }
    }

    .gift-text-secondary {
      margin-top: 0.75rem;
      font-size: 1.5rem;
      line-height: 2.0625rem;
    }

    .open-text {
      color: #ffffff;
    }

    .link {
      color: #ffdb69;

      &:hover {
        color: #ffeaa8;
      }
    }

    .spring-bgs {
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        url(@/assets/img/share/registerLanding/spring/lantern-left.webp) 0 0 / 24.0625rem 22.9375rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/lantern-right.webp) 100% 0 / 21.625rem 20.4375rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/frame-left.webp) 0 100% / 24.0625rem 19.5625rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/frame-right.webp) 100% 100% / 21.625rem 18.625rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/edge-top.webp) 0 0/ 1.4375rem 4.1875rem repeat-x,
        url(@/assets/img/share/registerLanding/spring/edge-bottom.webp) 0 100% / 1.4375rem 1.75rem repeat-x,
        url(@/assets/img/share/registerLanding/spring/edge-left.png) 0 0 / 1.5625rem 1.1875rem repeat-y,
        url(@/assets/img/share/registerLanding/spring/edge-right.png) 100% 0 / 1.5625rem 1.1875rem repeat-y,
        url(@/assets/img/share/registerLanding/spring/figure.jpg) center / cover no-repeat;
    }
  }
}

.register-landing-mobile {
  .logo {
    position: static;
    margin-top: 0.75rem;
    width: 6rem;
    height: 1.25rem;
  }

  .register-landing-content {
    padding: 1.5rem;

    h1 {
      margin-bottom: 0.75rem;
      font-size: 1rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.5rem;
    }

    h4 {
      height: 3rem;
      font-size: 0.875rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.5rem;
      white-space: pre-line;
    }

    .carousel-wrapper {
      margin: 2rem 0 3.5rem;

      .item {
        position: relative;
        width: 100%;
        height: fit-content;
        border-radius: 0.1875rem;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%);
        }

        img {
          width: 100%;
          height: auto;
        }

        &-text {
          position: absolute;
          bottom: 0.9375rem;
          width: 100%;
          z-index: 2;

          h5 {
            margin-bottom: 0.25rem;
            height: 1.375rem;
            font-size: 1rem;
            font-family:
              PingFangSC-Medium,
              PingFang SC;
            font-weight: 500;
            color: #ffffff;
            line-height: 1.375rem;
          }

          p {
            padding: 0 1rem;
            font-size: 0.75rem;
            font-family:
              PingFangSC-Regular,
              PingFang SC;
            font-weight: 400;
            color: #ffffff;
            line-height: 1.0625rem;
          }
        }
      }

      :deep(.slick-dots) {
        bottom: -1.375rem;

        li {
          width: 0.375rem;
          height: 0.125rem;
          background: #ffffff;
          border-radius: 0.0625rem;
          opacity: 0.45;

          button {
            height: fit-content;
            background: inherit;
          }

          &.slick-active {
            width: 0.625rem;
            opacity: 1;
          }
        }
      }
    }

    .gift-text {
      font-size: 1rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.5rem;
    }

    .reg-btn {
      width: 7.625rem;
      height: 2.5rem;
      border-radius: 0.3125rem;
    }

    .open-text {
      height: 1.0625rem;
      font-size: 0.75rem;
      color: #ffffff;
      line-height: 1.0625rem;
    }

    .link {
      width: 20.4375rem;
      height: 1.0625rem;
      font-size: 0.75rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      line-height: 1.0625rem;

      img {
        margin-left: 0.25rem;
        width: 0.75rem;
        height: 0.75rem;
      }
    }
  }

  &.register-landing--spring {
    .register-landing-content {
      padding: 0 1.5rem 4rem;
    }

    .logo {
      margin: 0.5625rem 0 1.6875rem;
    }

    .gift-text-secondary {
      font-size: 0.875rem;
      line-height: 1.5rem;
    }

    .reg-btn {
      margin: 2rem 0 2.125rem;
    }

    .spring-bgs {
      background:
        url(@/assets/img/share/registerLanding/spring/wap-lantern-left.webp) 0 0 / 6.5625rem 9.75rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/wap-lantern-right.webp) 100% 0 / 8.0625rem 9.75rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/wap-frame-left.webp) 0 100% / 5.375rem 6.5rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/wap-frame-right.webp) 100% 100% / 4.875rem 6.5rem no-repeat,
        url(@/assets/img/share/registerLanding/spring/wap-edge-top.png) 0 0/ 1rem 2.625rem repeat-x,
        url(@/assets/img/share/registerLanding/spring/wap-edge-bottom.png) 0 100% / 0.625rem 1.125rem repeat-x,
        url(@/assets/img/share/registerLanding/spring/wap-edge-left.png) 0 0 / 0.9375rem 1.125rem repeat-y,
        url(@/assets/img/share/registerLanding/spring/wap-edge-right.png) 100% 0 / 0.9375rem 1.125rem repeat-y,
        url(@/assets/img/share/registerLanding/spring/wap-figure.png) center / cover no-repeat;
    }
  }
}
</style>
