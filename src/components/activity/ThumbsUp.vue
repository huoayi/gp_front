<template>
  <div class="thumbs-up" :class="{ voted }">
    <svg
      version="1.1"
      ref="likeRef"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 194 178"
      style="enable-background: new 0 0 194 178"
      xml:space="preserve"
    >
      <g ref="handWrapperRef">
        <path
          d="M119.1,70.1c0,0,20.8-1.2,28.5,0c7.7,1.2,10.3,2,13.8,6.2s2.4,10.5,1.8,12.4c-0.7,1.9-2,3.7-0.2,6
      s2.5,7.6,1.4,11.9c-1.1,4.2-3.3,6.6-3.3,6.6s0.1,11.1-3.4,16.6c-3.5,5.6-3.3,3.3-3.3,7.7s-3.5,9.2-10.4,11.8s-24,4.5-48.5,4.3
      c0,0-12.7-0.3-17.9-8.3s-3.8-21.2-3.8-21.2s-0.7-22.5-0.4-25.8s0.4-12.7,10.4-28.2H119.1z"
        />
        <path
          ref="thumbRef"
          d="M82.7,72c0,0,11.4-17.3,11.7-20.7s-0.8-12.8-0.4-18.7s2.3-8.1,9.9-8.2s14.8,5,17.3,13.8
      s-1.3,20.6-1.3,20.6s-2.1,5.6-2.4,6.8s-2.3,5,1.7,4.8l1.3,0.1"
        />
        <path
          ref="thumbMorphRef"
          style="display: none"
          d="M82.7,72c0,0,36.6-38,45.4-37c8.8,1,17.1,13,7.2,23s-15.6,12.7-19.2,19.2
      C112.6,83.6,82.7,72,82.7,72z"
        />
      </g>
      <path
        d="M36.6,150.3c0,0-4.1-2.5-5.9-11.8s-2.1-39.7-1.3-47.2s2.8-12.4,11.4-12.8s12-0.3,14.5,0.6s7,2.1,8,7.1
      c1,5-1,7.4,0.9,52.2c0,0,1.4,5.8-4.8,11.8S36.6,150.3,36.6,150.3z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';
import { onMounted, ref } from 'vue';

const emit = defineEmits<{
  (event: 'afterAnime'): void;
}>();

const voted = ref(false);
const timeline = ref<gsap.core.Timeline>();
const handWrapper = ref();
const likeRef = ref();
const thumbRef = ref();
const thumbMorphRef = ref();

function init() {
  // 由于 morphSVG 是付费，这里的动效并没有作用到
  const tl = gsap.timeline();
  timeline.value = tl;
  tl.to(likeRef.value, { duration: 0.3, rotate: 25, scale: 0.8, ease: 'power1.easeOut' });
  tl.to(handWrapper.value, { duration: 0.3, delay: -0.3, rotate: 5, y: 10, x: 5, ease: 'back.easeOut' });
  tl.to(thumbRef.value, { duration: 0.6, delay: -0.3, morphSVG: '#thumb-morph', ease: 'power3.easeOut' });
  tl.to(likeRef.value, { duration: 0.6, delay: -0.15, rotate: -25, scale: 1.2, ease: 'back.easeOut' });
  tl.to(handWrapper.value, { duration: 0.3, delay: -0.6, rotate: -10, y: -5, x: -15, ease: 'back.easeOut' });
  tl.to(thumbRef.value, {
    duration: 0.3,
    delay: -0.6,
    morphSVG: { shape: thumbRef.value, shapeIndex: 8 },
    ease: 'power1.easeOut',
  });
  tl.to(likeRef.value, { duration: 0.6, delay: -0.15, rotate: 0, scale: 1, ease: 'back.easeOut' });
  tl.to(handWrapper.value, { duration: 0.3, delay: -0.6, rotate: 0, y: 0, x: 0 });
  tl.pause();
}

function click() {
  timeline.value?.play();
  voted.value = true;
  emit('afterAnime');

  setTimeout(() => {
    timeline.value?.progress(0);
    timeline.value?.pause();
  }, 1500);
}

onMounted(() => {
  init();
});

defineExpose({ click });
</script>

<style lang="less" scoped>
.thumbs-up {
  .flex-mode;
  transition: all 300ms ease;
  border-radius: 50%;

  &.voted {
    pointer-events: none;
  }

  &:hover:not(.voted) {
    transform: scale(1.1);
  }

  svg {
    width: inherit;
    pointer-events: none;
    position: absolute;
    fill: #ffffff;
  }
}

.is-mobile {
  .thumbs-up {
    &:hover:not(.voted) {
      transform: none;
    }
  }
}
</style>
