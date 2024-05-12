<template>
  <Input
    class="input-field"
    :value="value"
    :placeholder="placeholder"
    @update:value="(_v) => emit('update:value', _v)"
    @change="checkAccount"
    autocomplete="off"
    :maxlength="maxlength"
  >
    <template #prefix>
      <slot name="prefix">
        <img class="icon" v-if="valueType === 'email'" src="@/assets/img/user/email.png" />
        <img class="icon" v-else src="@/assets/img/user/account.png" />
      </slot>
    </template>
  </Input>
  <template v-if="checkExistOrNot && value">
    <div class="info-tip" v-if="checkType === 'login' && notExist">
      <span>{{ valueType === 'phone' ? '手机号' : '邮箱' }}未注册，</span>
      <span class="text" @click="emit('handleCheckExist')">前往注册</span>
    </div>
  </template>
</template>

<script setup lang="ts">
import { Input } from 'ant-design-vue';
import { onUnmounted, ref } from 'vue';
import { clearTimer } from '@/utils/common';
import { checkPhoneExist, checkEmailExist } from '@/api/user';

interface IProps {
  valueType?: 'phone' | 'email';
  value: string;
  validateItem: Function;
  codeDisabled?: boolean;
  placeholder?: string;
  ticket?: string;
  inviteId?: string;
  checkExistOrNot?: boolean;
  maxlength?: number;
  needCheckApi?: boolean;
}
type ICheckType = { checkType: 'login'; notExist?: boolean }; // 登录注册一体，不需要判断 checkType 为 register 的情况
const props = withDefaults(defineProps<IProps & ICheckType>(), {
  valueType: 'phone',
  checkExistOrNot: true,
  checkType: 'login',
  needCheckApi: true,
});
const emit = defineEmits<{
  (event: 'update:value', value: string): void;
  (event: 'update:exist', value: boolean): void;
  (event: 'update:notExist', value: boolean): void;
  (event: 'update:codeDisabled', value: boolean): void;
  (event: 'check:value', value: string): void;
  (event: 'handleCheckExist'): void;
}>();
const checkTimer = ref<number>();

function checkAccount() {
  emit('update:exist', false);
  emit('update:notExist', false);
  clearTimer(checkTimer);
  checkTimer.value = window.setTimeout(async () => {
    try {
      const { valueType, value, validateItem, checkType, checkExistOrNot, needCheckApi } = props;
      await validateItem();
      // 检查手机号/邮箱是否存在
      if (!needCheckApi) return;
      const checkFunc = valueType === 'email' ? checkEmailExist : null;
      const { code, data } = await checkFunc({ [valueType]: value } as any);
      if (code === 20000) {
        if (checkType === 'login') {
          emit('update:notExist', !data.is_exist);
          emit('update:codeDisabled', checkExistOrNot ? !data.is_exist : false);
          let oldDate = parseInt(localStorage.getItem('captchaCountdown') as string) || new Date().getTime() - 61000;
          if (new Date().getTime() - oldDate < 60000) emit('update:codeDisabled', true);
        }
      }
    } catch (err: any) {
      if (err.errorFields.length > 0) {
        emit('update:codeDisabled', true);
      }
    }
  }, 300);
}

export interface IAccountExpose {
  checkAccount: Function;
}

defineExpose<IAccountExpose>({ checkAccount });

onUnmounted(() => {
  clearTimer(checkTimer);
});
</script>

<style lang="less" scoped>
.info-tip {
  height: 1.5rem;
  line-height: 1.5rem;

  .text {
    .hover-text;
  }
}

.is-mobile {
  .info-tip {
    height: 1.3125rem;
    line-height: 1.3125rem;
  }
}
</style>
