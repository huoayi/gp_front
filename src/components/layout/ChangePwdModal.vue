<template>
  <custom-modal
    :width="webStore.isPc ? undefined : '18.75rem'"
    :visible="visible"
    @update:visible="emit('update:visible', false)"
    title="输入密码"
  >
    <Form class="modal-content" ref="verifyOldPasswordRef" :model="passwordState">
      <p>为了你的账号安全，修改密码前需先验证旧密码。请输入“{{ userStore.getAsteriskAccount }}”的旧密码</p>
      <Form.Item class="old-password" name="oldpwd" :rules="[{ required: true, message: '请输入密码' }]">
        <input-password
          v-model:value="passwordState.oldpwd"
          placeholder="请输入旧密码"
          :show-prefix-icon="false"
          @press-enter="clickOldpwdToNext"
        />
      </Form.Item>
      <p class="forget-password">
        <span @click="clickForgetPwd">忘记密码？</span>
      </p>
      <Button
        type="primary"
        block
        size="large"
        :class="{ 'btn-disabled': !passwordState.oldpwd }"
        :disabled="!passwordState.oldpwd"
        @click="clickOldpwdToNext"
        >下一步</Button
      >
    </Form>
  </custom-modal>
  <custom-modal
    :width="webStore.isPc ? undefined : '18.75rem'"
    v-model:visible="visibleState.resetNewPassword"
    title="设置密码"
    show-back-icon
    @back="backInResetPassword"
  >
    <Form class="modal-content" ref="resetNewPasswordRef" :model="passwordState">
      <p>密码仅可由数字、英文字母或英文符号组成，且需包含其中至少两种类型，长度不少于 6 个字符</p>
      <Form.Item
        name="newpwd"
        :rules="[{ required: true, message: '请输入密码' }, { validator: (_r, _v) => validatePassword(_v) }]"
      >
        <input-password
          v-model:value="passwordState.newpwd"
          placeholder="请输入密码"
          :show-prefix-icon="false"
          @change="changeNewpwd"
        />
      </Form.Item>
      <Form.Item
        name="cnewpwd"
        :rules="[
          { required: true, message: '请输入密码' },
          { validator: (_r, _v) => validateConfirmPassword(_v, passwordState.newpwd) },
        ]"
      >
        <input-password
          v-model:value="passwordState.cnewpwd"
          placeholder="再次输入密码"
          :show-prefix-icon="false"
          @press-enter="changePwd"
        />
      </Form.Item>
      <Button type="primary" block size="large" @click="changePwd">确认</Button>
    </Form>
  </custom-modal>
  <custom-modal
    :width="webStore.isPc ? undefined : '18.75rem'"
    v-model:visible="visibleState.verifyCode"
    :title="`输入${isEmailCode ? '邮箱' : '手机号'}验证码`"
    show-back-icon
    @back="backToVerifyOldPwd"
  >
    <Form class="modal-content">
      <p>请输入发送至 {{ isEmailCode ? '' : '+86 ' }}{{ userStore.getAsteriskAccount }} 的 6 位验证码，有效期 5 分钟</p>
      <Form.Item name="code">
        <input-captcha
          ref="codeInputRef"
          type="input-items-btn"
          :field="passwordState"
          :value="userStore.getUserAccount"
          @update:field="(field) => Object.assign(passwordState, field)"
          v-model:disabled="verifycodeState.disabled"
          v-model:is-clicked="verifycodeState.isClicked"
          v-model:code-status="verifycodeState.codeStatus"
          sms-action-type="modify"
          @press-enter="clickVerifycodeToNext"
          :is-email-code="isEmailCode"
        ></input-captcha>
      </Form.Item>
      <Button
        type="primary"
        block
        size="large"
        :class="{ 'btn-disabled': passwordState.code.length !== 6 }"
        :disabled="passwordState.code.length !== 6"
        @click="clickVerifycodeToNext"
        >下一步</Button
      >
    </Form>
  </custom-modal>

  <custom-modal
    :visible="popoverVisible"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
    title="人机校验"
    :mask="true"
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
import { Button, message, Form, type FormInstance } from 'ant-design-vue';
import { reactive, ref, watch, computed } from 'vue';
import { clearTimer, formatMsg, validateConfirmPassword, validatePassword } from '@/utils/common';
import { useUserStore } from '@/stores/user';
import { useWebStore } from '@/stores/web';
import InputPassword from '@/components/user/InputPassword.vue';
import InputCaptcha from '@/components/user/InputCaptcha.vue';
import type { IVerifyCodeState } from '@/interface/common';
import { resetUserPassword, verifyUser } from '@/api/user';
import { getSecretPictrue } from '@/api/user';

const props = withDefaults(defineProps<{ visible: boolean }>(), { visible: false });
const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
}>();

const userStore = useUserStore();
const webStore = useWebStore();
const visibleState = reactive({
  resetNewPassword: false,
  verifyCode: false,
});
// 修改密码
const passwordState = reactive({
  oldpwd: '', // 更改密码的旧密码
  newpwd: '',
  cnewpwd: '',
  resetpwdCode: '', // 更改密码的新密码 + 更改凭证
  code: '', // 忘记密码的验证码
});
const resetPwdPrev = ref<'old-pwd' | 'verify-code'>();
const verifycodeState: IVerifyCodeState = reactive({
  disabled: true,
  isClicked: false,
  codeStatus: 'none',
});
const verifyOldPasswordRef = ref<FormInstance>();
const resetNewPasswordRef = ref<FormInstance>();
const codeInputRef = ref();
const newpwdTimer = ref<number>();
const isEmailCode = computed(() => userStore.userInfo?.userType === 'email');
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

watch(
  [() => props.visible, visibleState],
  ([changePwdVisible, visibleState]) => {
    let temp: Record<string, boolean> = { changePwdVisible, ...visibleState };
    let arr = Object.keys(temp).filter((key) => temp[key]);
    if (arr.length === 0) {
      console.log('reset change pwd state');
      Object.assign(passwordState, { oldpwd: '', code: '', resetpwdCode: '', newpwd: '', cnewpwd: '' });
      verifyOldPasswordRef.value?.clearValidate();
      resetNewPasswordRef.value?.clearValidate();
    }
  },
  { immediate: true, deep: true },
);

function backInResetPassword() {
  if (resetPwdPrev.value === 'old-pwd') {
    emit('update:visible', true);
  } else {
    visibleState.verifyCode = true;
  }
  visibleState.resetNewPassword = false;
}

function backToVerifyOldPwd() {
  emit('update:visible', true);
  visibleState.verifyCode = false;
}

function changeNewpwd() {
  clearTimer(newpwdTimer);
  newpwdTimer.value = window.setTimeout(async () => {
    await resetNewPasswordRef.value?.validateFields('cnewpwd');
  }, 500);
}

async function changePwd() {
  try {
    await resetNewPasswordRef.value?.validateFields();
    const { newpwd: new_pwd, resetpwdCode: code } = passwordState;
    const result = await resetUserPassword({ new_pwd, code });
    if (result.code === 40010) {
      message.error('密码不合法，请重新输入！');
    } else if (result.code === 40011) {
      message.error('操作延时，请重新验证！');
      backInResetPassword();
      Object.assign(passwordState, { oldpwd: '', code: '', resetpwdCode: '', newpwd: '', cnewpwd: '' });
    } else if (result.code === 20000) {
      message.success('密码修改成功！');
      visibleState.resetNewPassword = false;
      Object.assign(passwordState, { oldpwd: '', code: '', resetpwdCode: '', newpwd: '', cnewpwd: '' });
      codeInputRef.value?.resetCountdown();
      codeInputRef.value?.clearCodeTimer();
    }
  } catch (err) {
    console.log('reset pwd form', err);
  }
}

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
  // clickForgetPwd();
  emit('update:visible', false);
  setTimeout(() => {
    if (codeInputRef.value && !codeInputRef.value.countdown) {
      codeInputRef.value.getCode(secretKey.value, dotsString.value);
    }
  }, 0);
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

async function clickForgetPwd() {
  passwordState.code = '';
  emit('update:visible', false);
  Object.assign(verifycodeState, { isClicked: false, codeStatus: 'none' });
  Object.assign(visibleState, { verifyCode: true });
  const oldDate = parseInt(localStorage.getItem('captchaCountdown') as string) || new Date().getTime() - 61000;
  if (new Date().getTime() - oldDate < 60000) {
    return;
  }
  handleBtnEvent();
}

async function clickOldpwdToNext() {
  try {
    await verifyOldPasswordRef.value?.validateFields();
    const result = await verifyUser({ pwd: passwordState.oldpwd });
    if (result.code === 40010) {
      message.error('密码错误！');
    } else if (result.code === 20000 && result.data.msg) {
      passwordState.resetpwdCode = result.data.code;
      resetPwdPrev.value = 'old-pwd';
      emit('update:visible', false);
      visibleState.resetNewPassword = true;
    }
  } catch (err) {
    console.log('old pwd to next form', err);
  }
}

async function clickVerifycodeToNext() {
  try {
    verifycodeState.codeStatus = 'none';
    const result = await verifyUser({ code: passwordState.code, is_email: isEmailCode.value });
    if (result.code === 20000 && result.data.msg) {
      passwordState.resetpwdCode = result.data.code;
      resetPwdPrev.value = 'verify-code';
      Object.assign(visibleState, { verifyCode: false, resetNewPassword: true });
    } else {
      verifycodeState.codeStatus = 'failed';
      message.error(formatMsg(result.msg));
    }
  } catch (e) {
    console.log('reset code', e);
  }
}
</script>

<style lang="less" scoped>
.modal-content {
  p {
    margin-bottom: 0.875rem;
    font-size: 0.75rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: @color-text-secondary;
    line-height: 1.0625rem;
    text-align: justify;
  }

  .forget-password {
    margin-bottom: 0.875rem;

    span {
      font-size: 0.75rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      line-height: 1.0625rem;
      .hover-text;
    }
  }
}

.is-mobile {
  .modal-content {
    .forget-password {
      margin-bottom: 1rem;
    }

    .old-password,
    :deep(.code-box) {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
