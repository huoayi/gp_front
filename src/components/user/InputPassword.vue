<template>
  <Input.Password
    class="input-field"
    :value="value"
    @update:value="(val) => emit('update:value', val)"
    :placeholder="placeholder"
    autocomplete="new-password"
    @press-enter="() => emit('pressEnter')"
  >
    <template #prefix>
      <slot name="prefix">
        <img class="prefix-icon" src="@/assets/img/user/lock.png" v-if="showPrefixIcon" />
      </slot>
    </template>
    <template #iconRender="show">
      <div>
        <img v-if="show" class="eye-icon cursor-pointer hover-icon-opacity" src="@/assets/img/eye-open.png" />
        <img v-else class="eye-icon cursor-pointer hover-icon-opacity" src="@/assets/img/eye-close.png" alt="" />
      </div>
    </template>
  </Input.Password>
</template>

<script setup lang="ts">
import { Input } from 'ant-design-vue';

interface IProps {
  value: string;
  placeholder?: string;
  showPrefixIcon?: boolean;
}
withDefaults(defineProps<IProps>(), { value: '', placeholder: '请输入密码', showPrefixIcon: true });
const emit = defineEmits<{
  (event: 'update:value', value: string): void;
  (event: 'pressEnter'): void;
}>();
</script>

<style lang="less" scoped>
.prefix-icon {
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
}

.eye-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.is-mobile {
  .eye-icon {
    width: 1rem;
    height: 1rem;
    filter: opacity(0.85);
  }
}
</style>
