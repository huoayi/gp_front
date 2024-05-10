<template>
  <span v-if="!switchBadge" ref="numberRef">0</span>
  <Badge
    v-else
    :count="num"
    :number-style="{
      background: 'transparent',
      color: 'inherit',
      boxShadow: 'none',
      padding: 0,
      fontSize: 'inherit',
      fontFamily: 'inherit',
      minWidth: 'auto',
      height: 'inherit',
    }"
    class="number-badge"
    show-zero
    :overflow-count="NaN"
  />
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { Badge } from 'ant-design-vue';
import { numScroll } from '@/utils/common';

const props = withDefaults(
  defineProps<{
    isInit: boolean;
    num: number;
  }>(),
  {
    num: 0,
  },
);

const numberRef = ref<HTMLElement>();
const switchBadge = ref(false);

watch(
  () => props.isInit,
  (isInit) => {
    if (!isInit) return;
    nextTick(() => {
      const $el = numberRef.value;
      if (!$el) return;
      numScroll($el, props.num);
      let timer = setTimeout(() => {
        switchBadge.value = true;
        clearTimeout(timer);
      }, 1500);
    });
  },
  { immediate: true, deep: true },
);
</script>

<style lang="less" scoped>
.number-badge {
  font-size: inherit;
  font-family:
    PingFangSC,
    PingFang SC;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  line-height: inherit;
}
</style>
