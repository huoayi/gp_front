<template>
  <div class="protocal">
    <Checkbox id="protocal-box" class="check-box" :class="{ error: hasError }" :checked="checked" @change="change" />
    <label for="protocal-box" class="text">
      <span class="read">阅读并</span>
      <span>同意</span>
      <a class="hover-text" :href="protocals.server" target="_blank">《服务条款》</a>
      <span>与</span>
      <a class="hover-text" :href="protocals.privacy" target="_blank">《隐私政策》</a>
    </label>
  </div>
</template>

<script setup lang="ts">
import { Checkbox } from 'ant-design-vue';

interface IProps {
  checked: boolean;
  hasError: boolean;
}
defineProps<IProps>();
const emit = defineEmits<{
  (event: 'update:checked', value: boolean): void;
}>();

const protocals = {
  server: 'https://cephalon.feishu.cn/docx/TnMDdcZ9EoyuO3xiTJKcGXnqnZg',
  privacy: 'https://cephalon.feishu.cn/docx/ReRrdnuHioqMBdxp6pEcD4Jsn2L',
};

function change(e: any) {
  emit('update:checked', e.target.checked);
}
</script>

<style lang="less" scoped>
.protocal {
  .flex-mode(row, flex-start);

  .check-box {
    line-height: normal;

    &.error {
      :deep(.ant-checkbox-inner) {
        border-color: #dc4446;
      }
    }

    :deep(.ant-checkbox-inner) {
      &::after {
        inset-inline-start: unset;
        margin-left: 21.5%;
      }
    }
  }

  .text {
    margin-left: 0.4375rem;
    height: 1.4375rem;
    line-height: 1.375rem;
    font-size: inherit;
    cursor: pointer;

    span {
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
    }
  }
}

.is-mobile {
  .protocal {
    :deep(.ant-checkbox-inner) {
      width: 0.875rem;
      height: 0.875rem;
    }

    .read {
      display: none;
    }
  }
}
</style>
