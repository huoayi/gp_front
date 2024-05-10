<template>
  <!-- 单行可拖拽卡片列表，可滑动至上/下一个 -->
  <div class="drag-card">
    <Swiper
      v-bind="{
        slidesPerView: 'auto',
        freeMode: true,
        watchSlidesProgress: true,
        modules: [FreeMode],
        spaceBetween: 0,
      }"
      :id="containerId"
      :class="`outermost-container ${containerClass}`"
      :style="containerStyle"
      @slider-move="handleSliderMove"
      @slide-change="handleSlideChange"
      @resize="handleResize"
      @after-init="handleAfterInit"
      @update="handleAfterUpdate"
    >
      <slot>
        <!-- 这里仅举例 -->
        <template v-if="showExample">
          <swiper-slide v-for="i in 10" :key="`test-${i}`">
            <div class="test-item" :style="{ height: toRem(itemHeight), marginRight: i === 10 ? 0 : '1.5rem' }">
              {{ i }}
            </div>
          </swiper-slide>
        </template>
      </slot>
    </Swiper>
    <slot name="towards" :is-beginning="state.isBeginning" :is-end="state.isEnd">
      <template v-if="towardsType === 'btn-inset-icon'">
        <div class="towards towards-prev" :style="towardStyles.wrapperStyle">
          <Button :style="towardStyles.prevItemStyle" :disabled="state.isBeginning" @click="handleTowards('prev')">
            <template #icon>
              <left-outlined />
            </template>
          </Button>
        </div>
        <div class="towards towards-next" :style="towardStyles.wrapperStyle">
          <Button :style="towardStyles.nextItemStyle" :disabled="state.isEnd" @click="handleTowards('next')">
            <template #icon>
              <right-outlined />
            </template>
          </Button>
        </div>
      </template>
      <template v-else-if="towardsType === 'circle-btn-away-icon'">
        <div
          v-if="!state.isBeginning"
          class="towards-circle"
          :style="towardStyles.prevItemStyle"
          @click="handleTowards('prev')"
        >
          <left-outlined />
        </div>
        <div
          v-if="!state.isEnd"
          class="towards-circle towards-circle-next"
          :style="towardStyles.nextItemStyle"
          @click="handleTowards('next')"
        >
          <right-outlined />
        </div>
      </template>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import type { Swiper as SwiperInterface } from 'swiper/types';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import { clearTimer, toRem } from '@/utils/common';
import { reactive, computed, onMounted, ref, type CSSProperties, onUnmounted, watch, nextTick } from 'vue';
import { Button } from 'ant-design-vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';

// https://swiperjs.com/swiper-api
interface IProps {
  containerId: string; // 请保证 ID 在项目中唯一
  containerClass?: string;
  containerStyle?: CSSProperties;
  towardsType?: 'btn-inset-icon' | 'circle-btn-away-icon' | 'none'; // 嵌入容器的按钮 / 脱离文档流的圆形按钮（目前 UI 提供只有这两种）
  towardItemWidth?: number; // px：circle-btn-away-icon 时 高度 = 宽度
  itemHeight?: number; // px
  towardItemSpacing?: number; // px
  prevTowardItemStyle?: CSSProperties;
  nextTowardItemStyle?: CSSProperties;
  showExample?: boolean;
  initialIndex?: number;
}
export interface IDragCardProps extends IProps {}
const props = withDefaults(defineProps<IProps>(), {
  containerId: 'test-swiper-container',
  towardsType: 'btn-inset-icon',
  towardItemWidth: 50,
  itemHeight: 196,
  towardItemSpacing: 24,
  showExample: false,
  initialIndex: 0,
});
const towardStyles = computed(() => {
  const {
    itemHeight: height = 0,
    towardItemWidth: width = 0,
    towardItemSpacing: spacing = 0,
    towardsType: type,
    prevTowardItemStyle,
    nextTowardItemStyle,
  } = props;
  if (type === 'btn-inset-icon') {
    const temp = width && height ? { width: toRem(width), height: toRem(height) } : {};
    const wrapperStyle = width && spacing ? { width: toRem(width + spacing) } : {};
    return {
      // 由于两端按钮与中间内容有间距，不能让中间内容在滑动时覆盖间距，所以这里宽度设置为按钮 + 间距
      wrapperStyle,
      prevItemStyle: { ...temp, ...prevTowardItemStyle },
      nextItemStyle: { ...temp, ...nextTowardItemStyle },
    };
  } else if (type === 'circle-btn-away-icon') {
    // 按钮脱离文档，所以没有再包裹一层 div
    const temp = width ? { width: toRem(width), height: toRem(width) } : {};
    return {
      prevItemStyle: { ...temp, marginLeft: toRem(spacing), ...prevTowardItemStyle },
      nextItemStyle: { ...temp, marginRight: toRem(spacing), ...nextTowardItemStyle },
    };
  }
  return {};
});
const state = reactive({ isBeginning: true, isEnd: true });
const swiper = ref<SwiperInterface>();
const sliderMoveTimer = ref<number>();
const resizeTimer = ref<number>();
const updateTimer = ref<number>();

async function resetState(s?: SwiperInterface) {
  const { isBeginning, isEnd } = s || swiper.value || {};
  console.log(props.containerId, 5, isBeginning, isEnd);
  if (typeof isBeginning === 'boolean') state.isBeginning = !!isBeginning;
  if (typeof isEnd === 'boolean') state.isEnd = !!isEnd;
}

function handleSliderMove(s: SwiperInterface) {
  // @slider-move 触发时会先执行 @slide-change
  clearTimer(sliderMoveTimer);
  sliderMoveTimer.value = window.setTimeout(() => {
    console.log(props.containerId, 3, 'move slide');
    resetState(s);
  }, 200);
}

function handleSlideChange(s: SwiperInterface) {
  // 点击 prev / next 时也会触发 @slide-change，并结合 @slider-move 触发特性，这里判定只执行 handleSliderMove
  console.log(props.containerId, 2, 'slide change');
  // resetState(s);
  handleSliderMove(s);
}

function handleResize(s: SwiperInterface) {
  // @after-init 执行后会执行 @resize，但是作为弹窗时初始化是不会触发 @resize，所以需要 @after-init
  // swiper.value?.addEventListener('resize') 获取到的 isBeginning 和 isEnd 都为 undefined，理论是因为动态样式数据
  clearTimer(resizeTimer);
  resizeTimer.value = window.setTimeout(() => {
    console.log(props.containerId, 1, 'resize slide');
    swiper.value?.slideTo(props.initialIndex || 0);
    resetState(s);
  }, 200);
}

function handleAfterInit(s: SwiperInterface) {
  console.log(props.containerId, 1, 'after init');
  resetState(s);
}

function handleAfterUpdate(s: SwiperInterface) {
  // 更新 swiper-slide 列表数据后，需要重新计算 isBeginning 和 isEnd
  clearTimer(updateTimer);
  updateTimer.value = window.setTimeout(() => {
    console.log(props.containerId, 4, 'update slide');
    resetState(s);
  }, 200);
}

function handleTowards(type: 'prev' | 'next') {
  if (type === 'prev') {
    swiper.value?.slidePrev();
  } else {
    swiper.value?.slideNext();
  }
}

onMounted(() => {
  const { containerId: id } = props;
  if (!id) return;
  const $el = document.querySelector(`#${id}`) as any;
  console.log(props.containerId, 0, 'mount', $el?.swiper);
  swiper.value = $el?.swiper;
});

onUnmounted(() => {
  clearTimer(sliderMoveTimer);
  clearTimer(resizeTimer);
  clearTimer(updateTimer);
});

defineExpose({ swiper });

watch(
  [() => props.initialIndex],
  ([val]) => {
    nextTick(() => {
      console.log(222, val, 333, swiper.value);
      swiper.value?.slideTo(val || 0);
    });
  },
  { immediate: true, deep: true },
);
</script>

<style lang="less">
.drag-card {
  position: relative;
  .flex-mode;
  background: inherit;

  .outermost-container {
    flex: 1;
    order: 2;

    // 滑块
    .swiper-slide {
      width: fit-content;
    }

    // 演示
    .test-item {
      .flex-mode;
      width: 11.25rem;
      height: 12.25rem;
      background: @color-bg-secondary;
      font-size: 1rem;
      border-radius: 0.5rem;
    }
  }

  .towards {
    background: inherit;
    padding: 0.375rem 0;
    order: 1;

    &.towards-next {
      text-align: right;
      order: 3;
    }

    > button {
      // 由 style 决定
      // min-width: 3.125rem;
      // width: 3.125rem;
      padding: 0;
      height: 12.25rem;
      background: rgba(49, 49, 49, 0.65);
      border-radius: 0.375rem;
      border: 0.125rem solid transparent;

      &:disabled {
        border-color: transparent;
      }
    }
  }

  .towards-circle {
    position: absolute;
    z-index: 10;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    .flex-mode;
    width: 2.5rem;
    height: 2.5rem;
    background: #8e50ff;
    border-radius: 50%;
    font-size: 1.375rem;
    cursor: pointer;
    transition: all 0.3s;

    &-next {
      left: auto;
      right: 0;
    }

    &:hover {
      background: @color-primary;
    }
  }
}
</style>
