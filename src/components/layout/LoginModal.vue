<template>
  <custom-modal
    :visible="userStore.showLoginModal"
    @update:visible="closeLoginModal"
    :title="tabs.find((item) => item.key === loginMode)?.text"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
    class-name="login-modal"
    :showBackIcon="loginMode === 'email-forget'"
    @back="changeMode('email-password')"
  >
    <div class="modal-content">
      <div class="wx-scan" v-if="loginMode === 'wx-scan'">
        <p>打开微信扫一扫，快速登录/注册</p>
        <img v-if="qrcodeUrl" :src="qrcodeUrl" />
      </div>
      <Form class="form" :model="form" ref="formRef" v-else>
        <template v-if="loginMode === 'verify-code'">
          <Form.Item
            name="phone"
            :rules="[{ required: true, message: '请输入手机号' }, { validator: (_r, _v) => validatePhone(_v) }]"
          >
            <input-account
              placeholder="仅支持中国大陆手机号"
              v-model:value="form.phone"
              v-model:not-exist="validation.notExistPhone"
              v-model:code-disabled="verifycodeState.disabled"
              :check-exist-or-not="false"
              :validate-item="() => formRef?.validateFields('phone')"
              :maxlength="11"
            >
              <template #prefix>
                <img class="icon" src="@/assets/img/user/mobile.png" />
              </template>
            </input-account>
          </Form.Item>
          <Form.Item name="code" :rules="[{ required: true, message: '请输入验证码' }]">
            <input-captcha
              :field="form"
              placeholder="请输入手机验证码"
              @update:field="(field) => Object.assign(form, field)"
              v-model:disabled="verifycodeState.disabled"
              v-model:is-clicked="verifycodeState.isClicked"
              v-model:code-status="verifycodeState.codeStatus"
              :value="form.phone"
              sms-action-type="login"
              @press-enter="() => clickLogin()"
            ></input-captcha>
          </Form.Item>
        </template>
        <template v-if="loginMode === 'account-password'">
          <Form.Item
            name="phone"
            :rules="[{ required: true, message: '请输入账号' }, { validator: (_r, _v) => validatePhone(_v) }]"
          >
            <input-account
              placeholder="仅支持中国大陆手机号"
              v-model:value="form.phone"
              v-model:not-exist="validation.notExistPhone"
              v-model:code-disabled="verifycodeState.disabled"
              :check-exist-or-not="false"
              :validate-item="() => formRef?.validateFields('phone')"
              :maxlength="11"
            />
          </Form.Item>
          <Form.Item v-if="validation.notExistPhone" name="code" :rules="[{ required: true, message: '请输入验证码' }]">
            <input-captcha
              placeholder="请输入手机验证码"
              :field="form"
              @update:field="(field) => Object.assign(form, field)"
              v-model:disabled="verifycodeState.disabled"
              v-model:is-clicked="verifycodeState.isClicked"
              v-model:code-status="verifycodeState.codeStatus"
              :value="form.phone"
              sms-action-type="register"
            ></input-captcha>
          </Form.Item>
          <Form.Item
            name="password"
            :rules="[{ required: true, message: '请输入密码' }, { validator: (_r, _v) => validatePassword(_v) }]"
          >
            <input-password
              v-model:value="form.password"
              @press-enter="!validation.notExistPhone && clickLogin()"
            ></input-password>
          </Form.Item>
          <Form.Item
            v-if="validation.notExistPhone"
            name="confirmPassword"
            :rules="[{ required: true, message: '请输入密码' }, { validator: validateConfirmPassword }]"
          >
            <input-password
              v-model:value="form.confirmPassword"
              placeholder="请再次输入密码"
              @press-enter="() => clickLogin(true)"
            ></input-password>
          </Form.Item>
        </template>
        <template v-if="loginMode === 'account-register'">
          <Form.Item
            name="phone"
            :rules="[{ required: true, message: '请输入账号' }, { validator: (_r, _v) => validatePhone(_v) }]"
          >
            <input-account
              placeholder="仅支持中国大陆手机号"
              v-model:value="form.phone"
              v-model:not-exist="validation.notExistPhone"
              v-model:code-disabled="verifycodeState.disabled"
              :check-exist-or-not="false"
              :validate-item="() => formRef?.validateFields('phone')"
              :maxlength="11"
            />
          </Form.Item>
          <Form.Item
            name="password"
            :rules="[{ required: true, message: '请输入密码' }, { validator: (_r, _v) => validatePassword(_v) }]"
          >
            <input-password v-model:value="form.password" @press-enter="clickLogin()"></input-password>
          </Form.Item>
          <Form.Item
            name="password"
            :rules="[{ required: true, message: '请再次输入密码' }, { validator: (_r, _v) => validatePassword(_v) }]"
          >
            <input-password v-model:value="form.password" @press-enter="clickLogin()"></input-password>
          </Form.Item>
        </template>
        <template v-if="loginMode === 'email-password'">
          <Form.Item
            v-if="validation.notExistEmail"
            name="phone"
            :rules="[{ required: true, message: '请输入手机号' }]"
          >
            <input-account
              placeholder="请输入手机号"
              v-model:value="form.phone"
              :validate-item="() => formRef?.validateFields('phone')"
              :need-check-api="false"
            >
              <template #prefix>
                <img class="icon icon-area-code" src="@/assets/img/user/mobile.png" />
                <Select
                  class="select-area-code"
                  v-model:value="form.areaCode"
                  :bordered="false"
                  :dropdown-match-select-width="false"
                  :options="phonePrefix"
                >
                  <template #option="{ name, value }">{{ name }} ({{ value }})</template>
                </Select>
              </template>
            </input-account>
          </Form.Item>
          <Form.Item
            name="email"
            :rules="[{ required: true, message: '请输入邮箱' }, { validator: (_r, _v) => validateEmail(_v) }]"
          >
            <input-account
              ref="emailRef"
              placeholder="请输入邮箱"
              value-type="email"
              v-model:value="form.email"
              v-model:not-exist="validation.notExistEmail"
              v-model:code-disabled="verifycodeState.disabled"
              :check-exist-or-not="false"
              :validate-item="() => formRef?.validateFields('email')"
            />
          </Form.Item>
          <Form.Item v-if="validation.notExistEmail" name="code" :rules="[{ required: true, message: '请输入验证码' }]">
            <input-captcha
              placeholder="请输入邮箱验证码"
              :field="form"
              @update:field="(field) => Object.assign(form, field)"
              v-model:disabled="verifycodeState.disabled"
              v-model:is-clicked="verifycodeState.isClicked"
              v-model:code-status="verifycodeState.codeStatus"
              :value="form.email"
              sms-action-type="register"
              :is-email-code="true"
              :mask="true"
            />
          </Form.Item>
          <Form.Item
            name="password"
            :rules="[{ required: true, message: '请输入密码' }, { validator: (_r, _v) => validatePassword(_v) }]"
          >
            <input-password
              v-model:value="form.password"
              @press-enter="!validation.notExistEmail && clickLogin()"
            ></input-password>
          </Form.Item>
          <Form.Item
            v-if="validation.notExistEmail"
            name="confirmPassword"
            :rules="[{ required: true, message: '请输入密码' }, { validator: validateConfirmPassword }]"
          >
            <input-password
              v-model:value="form.confirmPassword"
              placeholder="请再次输入密码"
              @press-enter="() => clickLogin(true)"
            ></input-password>
          </Form.Item>
        </template>
        <template v-if="loginMode === 'email-forget'">
          <Form.Item
            name="email"
            :class="{ 'not-margin-form-item': validation.notExistEmail }"
            :rules="[{ required: true, message: '请输入邮箱' }, { validator: (_r, _v) => validateEmail(_v) }]"
          >
            <input-account
              placeholder="请输入邮箱"
              value-type="email"
              v-model:value="form.email"
              v-model:not-exist="validation.notExistEmail"
              v-model:code-disabled="verifycodeState.disabled"
              :validate-item="() => formRef?.validateFields('email')"
              @handle-check-exist="changeMode('email-password', { email: form.email })"
            />
          </Form.Item>
          <Form.Item name="code" :rules="[{ required: true, message: '请输入验证码' }]">
            <input-captcha
              placeholder="请输入邮箱验证码"
              :field="form"
              @update:field="(field) => Object.assign(form, field)"
              v-model:disabled="verifycodeState.disabled"
              v-model:is-clicked="verifycodeState.isClicked"
              v-model:code-status="verifycodeState.codeStatus"
              :value="form.email"
              sms-action-type="modify"
              :is-email-code="true"
              :mask="true"
            />
          </Form.Item>
          <Form.Item
            name="password"
            :rules="[{ required: true, message: '请输入密码' }, { validator: (_r, _v) => validatePassword(_v) }]"
          >
            <input-password
              v-model:value="form.password"
              @press-enter="!validation.notExistPhone && clickLogin()"
            ></input-password>
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            :rules="[{ required: true, message: '请输入密码' }, { validator: validateConfirmPassword }]"
          >
            <input-password
              v-model:value="form.confirmPassword"
              placeholder="请再次输入密码"
              @press-enter="() => clickLogin(true)"
            ></input-password>
          </Form.Item>
        </template>
        <Form.Item name="checked" class="form-item-protocal" :rules="[{ validator: (_r, _v) => validateChecked(_v) }]">
          <div class="check-container">
            <checkbox-protocal
              :checked="form.checked"
              @update:checked="changeChecked"
              :has-error="validation.showProtocalError"
            ></checkbox-protocal>
            <a
              v-if="loginMode === 'email-password' && !validation.notExistEmail"
              class="hover-text"
              @click="changeMode('email-forget')"
            >
              忘记密码
            </a>
          </div>
        </Form.Item>
        <a href="" @click="loginMode = 'account-register'">注册</a>
        <Button type="primary" block class="operate-btn" @click="() => clickLogin()">登 录</Button>
      </Form>

      <div class="ways" v-if="loginMode !== 'email-forget'">
        <div class="title">
          <div class="line"></div>
          <span>其他登录方式</span>
          <div class="line"></div>
        </div>
        <div class="way-icon">
          <div v-for="item in showTabs">
            <div :class="webStore.getClassName('tips')" class="tips" v-if="item.img == 'email-yes'">
              <span v-if="webStore.isPc">海外用户</span><span v-else>海外</span>
            </div>
            <div :class="webStore.getClassName('tail')" class="tail" v-if="item.img == 'email-yes'"></div>
            <img :src="loginIcon[item.img]" alt="" class="cursor-pointer" @click="changeMode(item.key)" />
          </div>
        </div>
      </div>
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import CustomModal from '@/components/Modal.vue';
import { useUserStore } from '@/stores/user';
import { Form, Button, message, Select } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import InputAccount, { type IAccountExpose } from '../user/InputAccount.vue';
import InputCaptcha from '../user/InputCaptcha.vue';
import CheckboxProtocal from '../user/CheckboxProtocal.vue';
import InputPassword from '../user/InputPassword.vue';
import type { IVerifyCodeState } from '@/interface/common';
import { modalAppImg as loginIcon } from '@/assets/img/user/index';
import { computed, reactive, ref, watch, nextTick } from 'vue';
import {
  clearTimer,
  validateChecked,
  validatePassword,
  validatePhone,
  isEnv,
  clearStorageState,
  validateEmail,
  formatMsg,
} from '@/utils/common';
import { checkQrScanStatus, getQrcode, login, type LoginData, resetEmailPassword } from '@/api/user';
import { useRoute } from 'vue-router';
import { useWebStore } from '@/stores/web';
import { setBurialPoint } from '@/api/burial';
import AreaCode from '@/json/areaCode.json';

const phonePrefix = AreaCode.sort((a, b) => a.name.localeCompare(b.name, 'zh')).map((i) => ({
  name: i.name,
  value: i.code,
}));

const route = useRoute();
const userStore = useUserStore();
const webStore = useWebStore();
const form = reactive({
  password: 'hyk130406',
  confirmPassword: '',
  phone: '18643185642',
  code: '',
  email: '',
  checked: true,
  areaCode: phonePrefix[0].value,
});
const formRef = ref<FormInstance>();
const validation = reactive({
  notExistPhone: false,
  notExistEmail: false,
  showProtocalError: false,
});
type Mode = 'wx-scan' | 'verify-code' | 'account-password' | 'email-password' | 'email-forget' | 'account-register';
const initMode = isEnv() ? 'account-password' : 'wx-scan';
const loginMode = ref<Mode>(initMode);
const tabs: { key: Mode; text: string; img: string; show?: boolean }[] = [
  { key: 'verify-code', text: '免密登录/注册', img: 'code-yes' },
  { key: 'account-password', text: '密码登录/注册', img: 'pw-yes' },
  { key: 'email-forget', text: '忘记密码', img: 'email' },
];
const loginWay: Record<Mode, string> = {
  'wx-scan': 'wechat',
  'verify-code': 'no_password',
  'account-password': 'password',
  'email-password': 'email',
  'email-forget': 'forget',
};
const verifycodeState: IVerifyCodeState = reactive({
  disabled: true,
  isClicked: false,
  codeStatus: 'none',
});
const emailRef = ref<IAccountExpose>();
const inviteId = ref();
const qrcodeTimer = ref<number>(); // 刷新二维码
const scanTimer = ref<number>();
const wxState = reactive({
  ticket: '',
  needBindPhone: false, // 已授权登录但没有绑定手机号
  qrcodeExpire: 0, // ms
});
const qrcodeUrl = computed(() =>
  wxState.ticket ? `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${wxState.ticket}` : '',
);
const showTabs = computed(() => tabs.filter((item) => item.key !== loginMode.value && item.key !== 'email-forget'));

watch(
  () => route.query,
  ({ id }) => {
    if (id) {
      inviteId.value = id;
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => userStore.showLoginModal,
  (show) => {
    if (show) {
      // 初始状态
      loginMode.value = initMode;
      loginMode.value === 'wx-scan' && initScan();
      // 埋点：无身份的状态
      setBurialPoint({ creator: 'null', type: 'click_log_in', body: {} });
    }
  },
  { immediate: true, deep: true },
);

function clearWxTimers() {
  clearTimer(qrcodeTimer, 'interval');
  clearTimer(scanTimer, 'interval');
}

function closeLoginModal() {
  clearWxTimers();
  userStore.showLoginModal = false;
}

function changeMode(mode: Mode, saveForm?: Partial<typeof form>) {
  try {
    if (loginMode.value === mode) return;
    if (loginMode.value === 'wx-scan') {
      clearWxTimers();
    }
    if (mode === 'wx-scan') {
      initScan();
    } else {
      formRef.value?.clearValidate();
      // 切换清除输入内容和状态
      Object.assign(
        form,
        {
          password: '',
          confirmPassword: '',
          phone: '',
          code: '',
          email: '',
          checked: false,
          areaCode: phonePrefix[0].value,
        },
        saveForm,
      );
      Object.assign(validation, { notExistPhone: false, notExistEmail: false, showProtocalError: false });
      Object.assign(verifycodeState, { disabled: true, isClicked: false, codeStatus: 'none' });
      // 检验
      nextTick(() => {
        const { email } = form;
        if (email) {
          emailRef.value?.checkAccount();
        }
      });
    }
    loginMode.value = mode;
  } catch (err: any) {
    console.log('change mode err', err);
  }
}

function validateConfirmPassword(rule: any, value: string) {
  if (value && form.password && value !== form.password) {
    return Promise.reject('两次密码输入不一致');
  }
  return Promise.resolve();
}

async function changeChecked(value: boolean) {
  try {
    form.checked = value;
    await formRef.value?.validateFields('checked');
    validation.showProtocalError = false;
  } catch (err: any) {
    if (err.errorFields.length > 0) {
      validation.showProtocalError = true;
    }
  }
}

function loginSuccess(data: any) {
  console.log('login success', data);
  userStore.setUserInfo(data);
  userStore.setToken(`Bearer ${data.token}`);
  if (data.merchant_token) {
    userStore.setMerchantToken(`Bearer ${data.merchant_token}`);
  }
  userStore.showLoginModal = false;
  const { id, phone } = data;
  setBurialPoint({ creator: id, type: 'log_in', body: { phone, way: loginWay[loginMode.value] } });
  message.success('登录成功！');
  // 登录成功清缓存数据
  clearStorageState();
  Object.assign(form, {
    password: '',
    confirmPassword: '',
    phone: '',
    code: '',
    checked: false,
  });
  Object.assign(verifycodeState, { disabled: true, isClicked: false, codeStatus: 'none' });
}

async function clickLogin(setInviteId: boolean = true) {
  try {
    validation.showProtocalError = !form.checked;
    await formRef.value?.validateFields();
    const { password: pwd, confirmPassword: cpwd, phone, code, email, areaCode } = form;
    // if (loginMode.value === 'email-forget') {
    //   const result = await resetEmailPassword({ email, code, pwd, confirm_pwd: cpwd });
    //
    //   if (result.code === 20000) {
    //     verifycodeState.codeStatus = 'success';
    //     loginSuccess(result.data);
    //   } else {
    //     message.error(formatMsg(result.msg));
    //   }
    //   return;
    // }
    // const { needBindPhone, ticket } = wxState;
    const isRegister = validation.notExistPhone;
    // const isEmailRegister = validation.notExistEmail;
    let temp: LoginData = { phone, pwd, way: 'phone_pwd' };

    // if (loginMode.value === 'verify-code') {
    //   temp = { phone, code, way: 'phone_code' };
    // } else if (loginMode.value === 'account-password') {
    //   temp = { phone, pwd, way: 'phone_pwd' };
    //   if (isRegister) {
    //     temp.code = code;
    //     temp.confirm_pwd = cpwd;
    //   }
    // } else if (loginMode.value === 'email-password') {
    //   temp = { email, pwd, way: 'email_pwd' };
    //   if (isEmailRegister) {
    //     temp.phone = phone;
    //     temp.code = code;
    //     temp.confirm_pwd = cpwd;
    //     temp.area_code = areaCode;
    //   }
    // }
    // needBindPhone && (temp.ticket = ticket);
    const result = await login(temp, isRegister && setInviteId ? inviteId.value : undefined);
    if (result.code === 20000) {
      verifycodeState.codeStatus = 'success';
      loginSuccess(result.data);
      userStore.setIsFirstRegister(isRegister);
    } else if (result.code === 30013) {
      // 邀请码错误，重新执行
      clickLogin(false);
    } else if (!result.msg) {
      message.error(formatMsg('登录失败，请稍后再试！'));
    }
  } catch (err) {
    console.log('form', err);
  }
}

// wx-scan
async function getQrcodeUrl() {
  try {
    const result = await getQrcode();
    if (result.code !== 20000) return;
    const { ticket, expire_seconds } = result.data;
    wxState.ticket = ticket;
    wxState.qrcodeExpire = expire_seconds * 1000;
  } catch (err) {
    clearTimer(qrcodeTimer, 'interval');
  }
}

async function getScanStatus() {
  try {
    const { ticket } = wxState;
    const result = await checkQrScanStatus(ticket);
    if (result.code !== 20000) return;
    const { is_exist } = result.data;
    if (is_exist) {
      clearTimer(scanTimer, 'interval');
      const qrResult = await login({ ticket, way: 'ticket' });
      if (qrResult.code === 40005 || qrResult.code === 40007) {
        message.info('该微信未绑定过账号，请先绑定手机号！');
        wxState.needBindPhone = true;
        loginMode.value = 'verify-code';
      } else if (qrResult.code === 20000) {
        loginSuccess(qrResult.data);
      }
    }
  } catch {
    clearTimer(scanTimer, 'interval');
  }
}

async function initScan() {
  await getQrcodeUrl();
  if (wxState.qrcodeExpire) {
    qrcodeTimer.value = window.setInterval(async () => {
      await getQrcodeUrl();
    }, wxState.qrcodeExpire);
    scanTimer.value = window.setInterval(async () => {
      await getScanStatus();
    }, 1000);
  }
}
</script>

<style lang="less">
.login-modal {
  .modal-content {
    padding: 1.5rem 1.5rem 1.5rem;

    .ant-form-item {
      margin-bottom: 1.5rem;
    }
  }

  .tabs {
    .flex-mode(row, space-between);
    margin-bottom: 1.5rem;
    padding: 1.25rem 0 0.875rem;
    height: 3.5rem;
    white-space: nowrap;

    > div {
      position: relative;
      height: 1.375rem;
      font-size: 1rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: @color-text-secondary;
      line-height: 1.375rem;
      cursor: pointer;

      &::after {
        content: '';
        position: absolute;
        bottom: -0.875rem;
        left: 50%;
        transform: translateX(-50%);
        width: 0rem;
        height: 0.125rem;
        background: #8e50ff;
        transition: width 0.3s;
        border-radius: 0.0625rem;
      }

      .recommend {
        position: absolute;
        left: calc(100% - 0.125rem);
        bottom: 0.875rem;
        width: 2.5rem;
        height: 1.375rem;
        background: #793aea;
        border-radius: 0.6875rem;
        text-align: center;
        font-size: 0.75rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
      }

      &.active,
      &:hover {
        color: @color-text;
      }

      &.active::after {
        width: 100%;
      }
    }
  }

  .wx-scan {
    img {
      display: block;
      margin: 1.5rem auto 0;
      width: 10.375rem;
      height: 10.375rem;
      background: #d8d8d8;
      border-radius: 0.375rem;
    }

    p {
      height: 1.375rem;
      font-size: 1rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.375rem;
      text-align: center;
    }
  }

  .form {
    .input-field {
      .icon {
        margin-right: 0.5rem;
        width: 1rem;
        height: 1rem;

        &-verify-success {
          width: 1.1875rem;
          height: 1.1875rem;
        }

        &-area-code {
          margin-right: 0;
        }
      }

      .select-area-code {
        margin-right: 0.4375rem;

        &::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          width: 0.0625rem;
          height: 1.25rem;
          background: #5d5d5d;
        }
      }
    }

    .operate-btn {
      height: 2.5rem;
      font-size: 1rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
    }

    .not-margin-form-item {
      margin-bottom: 0;
    }

    .form-item-protocal {
      .ant-form-item-control-input {
        min-height: auto;
      }

      .check-container {
        .flex-mode(row, space-between);

        > span {
          font-size: 0.875rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: #a371ff;
          line-height: 1.375rem;
        }
      }
    }
  }

  .ways {
    padding: 1.5rem 0 0 0;

    .title {
      .flex-mode(row);
      gap: 1rem;

      .line {
        width: 7.5rem;
        height: 0.0625rem;
        background: #5d5d5d;
      }

      > span {
        white-space: nowrap;
        font-size: 1rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.65);
        line-height: 1.5rem;
      }
    }

    .way-icon {
      margin-top: 1rem;
      .flex-mode();
      gap: 4rem;
      position: relative;
      .tail {
        position: absolute;
        width: 0;
        height: 0;
        z-index: 0;
        border: 0.625rem solid transparent;
        border-right: 0.625rem solid transparent;
        border-left: 0.9375rem solid transparent;
        border-bottom-color: #793aea;
        right: 3.75rem;
        top: -1.0625rem;
        transform: rotate(-25deg);
      }
      .tips {
        z-index: 1;
        position: absolute;
        font-size: 0.75rem;
        line-height: 1.0625rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        background-color: #793aea;
        top: -1.5rem;
        right: 1.425rem;
      }

      .tail-mobile {
        right: 0.9rem;
        top: -0.9625rem;
        transform: rotate(-30deg);
      }

      .tips-mobile {
        top: -1.35rem;
        right: 0;
      }

      img {
        filter: grayscale(1);
        width: 1.5rem;
        height: 1.5rem;
        transition: filter 0.25s;

        &:hover {
          filter: grayscale(0);
        }
      }
    }
  }
}

.is-mobile {
  .login-modal {
    .tabs {
      justify-content: flex-start;
      gap: 3.4375rem;
      margin-bottom: 1rem;
      padding: 0.6875rem 0 0.75rem;
      height: 2.5rem;

      > div {
        height: 1.25rem;
        font-size: 0.875rem;
        line-height: 1.25rem;

        &::after {
          bottom: -0.5625rem;
        }

        .recommend {
          display: none;
        }
      }
    }

    .wx-scan {
      img {
        margin-bottom: 1rem;
        width: 9.75rem;
        height: 9.75rem;
      }

      p {
        height: 1.125rem;
        font-size: 0.75rem;
        line-height: 1.125rem;
      }
    }

    .ways {
      padding-top: 1rem;
      .title {
        > span {
          font-size: 0.75rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.125rem;
        }
      }

      .way-icon {
        > img {
          filter: grayscale(1);
        }
      }
    }

    .check-container {
      > a {
        white-space: nowrap;
      }
    }
  }
}
</style>
