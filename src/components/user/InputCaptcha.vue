<template>
  <template v-if="type === 'input-btn'">
    <Input
      ref="inputRef"
      class="input-field input-code"
      v-model:value="field.code"
      :placeholder="placeholder"
      autocomplete="off"
      :maxlength="6"
      @press-enter="emit('pressEnter')"
    >
      <template #prefix>
        <slot name="prefix">
          <img class="icon" src="@/assets/img/user/shield.png" />
        </slot>
      </template>
      <template #suffix>
        <img v-if="codeStatus === 'success'" class="icon-verify-success" src="@/assets/img/user/verify-success.png" />
      </template>
    </Input>
    <Button class="code-btn" :disabled="disabled" @click="handleBtnEvent">
      <span v-if="!countdown">{{ isClicked ? '重新发送' : '获取验证码' }}</span>
      <span v-else>{{ countdown }}s</span>
    </Button>
  </template>
  <template v-else-if="type === 'input-items-btn'">
    <div class="code-box">
      <Input
        class="input-field code-box-input"
        v-model:value="field.code"
        :maxlength="6"
        @focus="focusItemCode"
        @blur="isBlink = false"
        ref="verifycodeRef"
        autocomplete="off"
        @press-enter="emit('pressEnter')"
      />
      <div class="items" :class="{ error: codeStatus === 'failed' }">
        <template v-for="(item, index) in 6">
          <span
            :class="{
              'no-set-margin': [2, 5].includes(index),
              blink: isBlink && field.code.length === index,
              'is-inputed': field.code[index],
            }"
          >
            {{ field.code[index] }}
          </span>
          <span v-if="index === 2" class="split-line"></span>
        </template>
      </div>
    </div>
    <p class="code-box-content">
      <span class="is-obtain-code" v-if="!countdown" @click="handleBtnEvent">
        {{ isClicked ? '重新获取验证码' : '获取验证码' }}
      </span>
      <span v-else>{{ countdown }} 秒后可重新获取验证码</span>
    </p>
  </template>

  <custom-modal
    :visible="popoverVisible"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
    title="人机校验"
    :mask="props.mask"
  >
    <div class="dialog">
      <go-captcha
        v-model="popoverVisible"
        width="300px"
        height="240px"
        :image-base64="imageBase64"
        :thumb-base64="thumbBase64"
        @close="handleCloseEvent"
        @refresh="handleRefreshEvent"
        @confirm="handleConfirmEvent"
      />
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import GoCaptcha from '@/components/captcha/GoCaptcha.vue';
import CustomModal from '@/components/Modal.vue';

import { getSmsCode, getSecretPictrue } from '@/api/user';
import { clearTimer } from '@/utils/common';
import { CODE_COUNTDOWN } from '@/json/common';
import { Input, Button } from 'ant-design-vue';
import { ref, onUnmounted, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { SmsActionType, CodeStatus } from '@/interface/common';
import { useWebStore } from '@/stores/web';

interface IProps {
  type?: 'input-btn' | 'input-items-btn';
  placeholder?: string;
  value?: string;
  smsActionType: SmsActionType;
  field: { code: string };
  disabled: boolean;
  isClicked: boolean;
  codeStatus: CodeStatus;
  isEmailCode?: boolean;
  // 人机校验的遮罩
  mask?: boolean;
}
const props = withDefaults(defineProps<IProps>(), { type: 'input-btn', placeholder: '请输入验证码', mask: false });
const emit = defineEmits<{
  (event: 'update:field', value: { code: string }): void;
  (event: 'update:disabled', value: boolean): void;
  (event: 'update:isClicked', value: boolean): void;
  (event: 'update:codeStatus', value: CodeStatus): void;
  (event: 'pressEnter'): void;
}>();

const webStore = useWebStore();
const countdown = ref();
const countdownTimer = ref<number>();
const inputRef = ref();
const isBlink = ref();

// 人机校验相关
const popoverVisible = ref(false);
const captBase64 = ref('');
const captThumbBase64 = ref('');
const captKey = ref('');
const captStatus = ref('default');

const imageBase64 = ref('');
const thumbBase64 = ref('');
const secretKey = ref('');
const dotsString = ref('');

function handleConfirm(dots: { x: number; y: number }[]) {
  if (dots.length <= 0) {
    message.error(`请进行人机验证再操作`);
    return;
  }

  let dotArr: number[] = [];
  dots.forEach((item: { x: number; y: number }) => {
    dotArr.push(item.x - 11);
    dotArr.push(item.y + 22);
  });
  dotsString.value = dotArr.join(',');
  getCode();
}

async function handleBtnEvent() {
  captBase64.value = '';
  captThumbBase64.value = '';
  captKey.value = '';
  setTimeout(async () => {
    popoverVisible.value = true;
    const { b64, tb64, secret_key } = (await getSecretPictrue()).data;
    imageBase64.value = b64;
    thumbBase64.value = tb64;
    secretKey.value = secret_key;
  }, 0);
}

function handleRefreshEvent() {
  captStatus.value = 'check';
  handleBtnEvent();
}

function handleConfirmEvent(data: any) {
  handleConfirm(data);
  popoverVisible.value = false;
}

function handleCloseEvent() {
  popoverVisible.value = false;
}

async function getCode(postSecretKey?: string, postDotsString?: string) {
  const { value, smsActionType: action_type, isEmailCode } = props;
  if (!value) {
    if (isEmailCode) {
      message.error('找不到发邮件的邮箱！');
    } else {
      message.error('找不到发短信的手机号！');
    }
    return;
  }

  try {
    const data = isEmailCode
      ? {
          email: value,
          action_type,
          secret_key: postSecretKey || secretKey.value,
          point_dots: postDotsString || dotsString.value,
        }
      : {
          phone: value,
          action_type,
          secret_key: postSecretKey || secretKey.value,
          point_dots: postDotsString || dotsString.value,
        };
    const result = await getSmsCode(data);
    if (result.code !== 20000) {
      message.error(result.msg);
      return;
    }
    // success
    localStorage.setItem('captchaCountdown', new Date().getTime().toString());
    inputRef.value?.focus();
    countdown.value = CODE_COUNTDOWN;
    emit('update:disabled', true);
    if (!props.isClicked) emit('update:isClicked', true);
    _clearTimer();
    countdownTimer.value = window.setInterval(() => {
      if (countdown.value !== 0) {
        countdown.value--;
      } else {
        emit('update:disabled', false);
        _clearTimer();
      }
    }, 1000);
  } catch (err) {
    console.log('sms code', err);
  }
}

function focusItemCode() {
  isBlink.value = true;
  if (props.codeStatus === 'failed') {
    emit('update:field', { code: '' });
    emit('update:codeStatus', 'none');
  }
}

function resetCountdown() {
  countdown.value = 0;
}

function _clearTimer() {
  clearTimer(countdownTimer, 'interval');
}

onUnmounted(() => {
  _clearTimer();
});

onMounted(() => {
  const oldDate = parseInt(localStorage.getItem('captchaCountdown') as string) || new Date().getTime() - 61000;
  if (new Date().getTime() - oldDate < 60000) {
    // @ts-ignore
    countdown.value = 60 - ((new Date().getTime() - oldDate) / 1000).toFixed(0);
    countdownTimer.value = window.setInterval(() => {
      if (countdown.value !== 0) {
        countdown.value--;
      } else {
        emit('update:disabled', false);
        _clearTimer();
      }
    }, 1000);
  }
});
defineExpose({ getCode, clearCodeTimer: _clearTimer, countdown, resetCountdown });
</script>

<style lang="less" scoped>
.input-code {
  width: calc(100% - 8.125rem);
}

.code-btn {
  margin-left: 0.625rem;
  width: 7.5rem;
  height: 2.5rem;
  vertical-align: bottom;
  transition:
    border 0.3s,
    color 0.3s;
  // text
  font-family:
    PingFangSC-Regular,
    PingFang SC;
  font-weight: 400;
}

.code-box {
  position: relative;
  z-index: 1;
  margin-bottom: 1rem;

  .code-box-input {
    opacity: 0;
  }

  .items {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    .flex-mode(row, space-between);
    width: 100%;
    height: 2.5rem;
    line-height: 2.5rem;

    span {
      width: 2.5rem;
      height: 100%;
      background: @color-bg-container;
      border-radius: 0.1875rem;
      border: 0.0625rem solid @color-border;
      font-size: 1.125rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      line-height: inherit;
      text-align: center;
      transition: border 0.3s;

      &:not(.no-set-margin) {
        margin-right: 1.75rem;
      }

      &.split-line {
        margin: 0 1rem;
        width: 1.25rem;
        height: 0.125rem;
        background: #d8d8d8;
      }

      @keyframes fade {
        from {
          opacity: 1;
        }

        50% {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      &.blink {
        position: relative;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 1.125rem;
          width: 0.0625rem;
          background-color: gray;
          animation: fade 1000ms infinite;
        }
      }

      &.is-inputed {
        border: 0.0625rem solid @color-primary;
      }
    }

    &.error {
      span {
        border: 0.0625rem solid #ff4d4f;
      }
    }
  }
}

.code-box-content {
  font-size: 0.75rem;
  font-family:
    PingFangSC-Regular,
    PingFang SC;
  font-weight: 400;
  color: @color-text-secondary;
  line-height: 1.0625rem;
  text-align: justify;

  span.is-obtain-code {
    color: @color-primary;
    cursor: pointer;
  }
}

.is-mobile {
  .code-btn {
    width: 6.3rem;
    margin-left: calc(100% - (100% - 6.9rem) - 6.3rem);
  }

  .input-code {
    width: calc(100% - 6.9rem);
  }

  .code-box {
    margin-bottom: 0.875rem;
  }

  .code-box-input {
    height: 1.875rem;
  }

  .items {
    height: 1.875rem;
    line-height: normal;

    span {
      .flex-mode;
      width: 1.875rem;
      font-size: 0.875rem;

      &:not(.no-set-margin) {
        margin-right: 0.5rem;
      }
    }
  }
}
</style>
