<template>
  <section class="config-index" :class="webStore.getClassName('config')">
    <nav-bar title="配置中心" v-if="webStore.isPc" />
    <div class="page-content config-content">
      <div class="card-item">
        <img src="@/assets/img/config/secret.png" />
        <div class="right">
          <p class="title">开发者密钥</p>
          <div class="key-secret">
            <span v-if="secretKeyState.isLock">{{ getAsterisk(userStore.getUserKey, 6, -5, 8) }}</span>
            <Tooltip color="#434343" v-else placement="bottomLeft" :overlay-style="{ maxWidth: '18.75rem' }">
              <template #title>
                <div class="key-pair">
                  <p>公钥：{{ userStore.getUserKey }}</p>
                  <p>私钥：{{ secretKeyState.value }}</p>
                </div>
              </template>
              <span
                class="cursor-pointer"
                @click="copyText({ key: userStore.getUserKey, secret: secretKeyState.value })"
              >
                {{ userStore.getUserKey }}
              </span>
            </Tooltip>
            <img
              v-if="secretKeyState.isLock"
              class="hover-icon-opacity"
              src="@/assets/img/eye-close.png"
              @click="clickToUnLock"
            />
            <img v-else class="hover-icon-opacity" src="@/assets/img/eye-open.png" alt="" @click="clickToLock" />
          </div>
        </div>
      </div>
      <div class="card-item">
        <img src="@/assets/img/config/document.png" />
        <div class="right">
          <p class="title">接入文档</p>
          <div class="read-docs" @click="goDocument()">
            <span>查看端脑 API 使用文档</span>
            <img src="@/assets/img/jump-to.png" />
          </div>
        </div>
      </div>
    </div>
  </section>
  <custom-modal
    :width="webStore.isPc ? undefined : '18.75rem'"
    :visible="visibleState.unlockSecretKey"
    @update:visible="closeUnlockSecretKey"
    title="输入密码"
  >
    <Form class="modal-content" ref="unlockSecretKeyRef" :model="passwordState">
      <p>
        为了你的账号安全，解锁开发者密钥前需先验证登录密码。请输入用户“{{ userStore.getAsteriskAccount }}”的登录密码
      </p>
      <Form.Item name="unlockpwd" :rules="[{ required: true, message: '请输入密码' }]">
        <input-password
          v-model:value="passwordState.unlockpwd"
          placeholder="请输入登录密码"
          :show-prefix-icon="false"
          @press-enter="unlockVerifyPwd"
        />
      </Form.Item>
      <Button
        type="primary"
        block
        size="large"
        :class="{ disabled: !passwordState.unlockpwd }"
        :disabled="!passwordState.unlockpwd"
        @click="unlockVerifyPwd"
      >
        确 定
      </Button>
    </Form>
  </custom-modal>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
import CustomModal from '@/components/Modal.vue';
import { Button, Form, type FormInstance, message, Tooltip } from 'ant-design-vue';
import { reactive, ref, onMounted } from 'vue';
import { getHmackey, verifyUser } from '@/api/user';
import { copyText, getAsterisk } from '@/utils/common';
import { useUserStore } from '@/stores/user';
import InputPassword from '@/components/user/InputPassword.vue';
import { useWebStore } from '@/stores/web';
import { setBurialPoint } from '@/api/burial';

const userStore = useUserStore();
const webStore = useWebStore();
// 埋点
onMounted(() => {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'page_view_api',
    body: { phone: userStore.userInfo?.phone },
  });
});
// 弹框 visible
const visibleState = reactive({ unlockSecretKey: false });
// 密码相关
const passwordState = reactive({
  unlockpwd: '',
  uplockpwdCode: '', // 密钥开锁的当前密码 + 开锁凭证（暂未用）
});

const unlockSecretKeyRef = ref<FormInstance>();

// 开发者密钥
const secretKeyState = reactive({
  value: '',
  isLock: true,
});

//#region 密码
// 显示开发者密钥
function clickToUnLock() {
  visibleState.unlockSecretKey = true;
}

function clickToLock() {
  secretKeyState.isLock = true;
  passwordState.unlockpwd = '';
}

function closeUnlockSecretKey() {
  visibleState.unlockSecretKey = false;
  passwordState.unlockpwd = '';
}

async function unlockVerifyPwd() {
  try {
    await unlockSecretKeyRef.value?.validateFields();
    const { unlockpwd: pwd } = passwordState;
    const result = await verifyUser({ pwd });
    if (result.code === 40010) {
      message.error('密码错误！');
    } else if (result.code === 20000 && result.data.msg) {
      passwordState.uplockpwdCode = result.data.code;
      const hmacResult = await getHmackey();
      if (hmacResult.code !== 20000) return;
      const { secret } = hmacResult.data;
      visibleState.unlockSecretKey = false;
      secretKeyState.isLock = false;
      secretKeyState.value = secret;
    }
  } catch (err) {
    console.log('unlock pwd form', err);
  }
}

// 看文档
function goDocument() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_api_file',
    body: { phone: userStore.userInfo?.phone },
  });
  window.open('https://cephalon.feishu.cn/docx/XLrVd6I2Gox6huxZU9lcaguZn58');
}
</script>

<style lang="less" scoped>
@card-item-min-width: 27.125rem;
@card-gap: 1.5rem;
@mobile-card-item-show-width: 20.4375rem;
@mobile-card-gap: 1rem;

.config-index {
  .config-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: @card-gap;

    .card-item {
      .flex-mode(row, flex-start);
      flex: 1;
      min-width: 27.125rem;
      height: 9.375rem;
      background: #313131;
      border-radius: 0.375rem;

      > img {
        width: 9.375rem;
        height: 9.375rem;
      }

      > div {
        margin-left: 1.5rem;

        .title {
          margin-bottom: 1.125rem;
          height: 1.5rem;
          font-size: 1rem;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.5rem;
        }

        div {
          .flex-mode(row, flex-start);

          span {
            margin-right: 1rem;
            font-size: 0.875rem;
            font-family:
              PingFangSC-Regular,
              PingFang SC;
            font-weight: 400;
            line-height: 1.375rem;
          }

          img {
            width: 1.25rem;
            height: 1.25rem;
            cursor: pointer;
          }
        }

        .pwd-rewrite {
          width: 13.75rem;
          height: 1.875rem;
          line-height: 1.875rem;

          span {
            width: auto;
            height: 1.375rem;
          }
        }

        .key-secret {
          span {
            padding: 0.25rem 1rem;
            width: 10.875rem;
            background: #3c3c3c;
            border-radius: 0.25rem;
            line-height: 1.875rem;
            .single-line-ellipsis;
          }

          .cursor-pointer {
            cursor: pointer;
          }
        }

        .read-docs {
          cursor: pointer;

          span {
            margin-right: 0.625rem;
          }

          img {
            width: 0.875rem;
            height: 0.875rem;
          }
        }
      }
    }
  }
}

// 移动端：列
.set-mobile-column(@n: 1, @item-width: @mobile-card-item-show-width, @gap: @mobile-card-gap, @horizontal-paddings: 1.5rem * 2) {
  @media (max-width: calc(@item-width * (@n + 1) + @gap * @n + @horizontal-paddings + 0.0625rem)) {
    .aigc-index-mobile {
      .app-list {
        grid-template-columns: repeat(@n, 1fr);
      }
    }
  }
}

.set-mobile-column(3);
.set-mobile-column(2);
.set-mobile-column(1);

// pc 端：列
.set-pc-column(@n: 3, @item-width: @card-item-min-width, @gap: @card-gap, @horizontal-paddings: calc(2rem + 1.25rem)) {
  @media (max-width: calc(@sidebar-collapsed-width + @item-width * (@n + 1) + @gap * @n + @horizontal-paddings + 0.0625rem)) {
    .config-index {
      .config-content {
        grid-template-columns: repeat(@n, 1fr);
      }
    }
  }

  @media (max-width: calc(@sidebar-width + @item-width * (@n + 1) + @gap * @n + @horizontal-paddings + 0.0625rem)) {
    body:not(.is-collapsed) {
      .config-index {
        .config-content {
          grid-template-columns: repeat(@n, 1fr);
        }
      }
    }
  }
}

.set-pc-column(3);
.set-pc-column(2);
.set-pc-column(1);

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
}

// 密钥对提示框
.key-pair {
  width: fit-content;

  p {
    line-height: 1.6;
    margin-bottom: 0rem;
  }
}

.config-mobile {
  padding: 1rem 0;

  .config-content {
    .card-item {
      min-width: auto;
      width: 100%;
      height: 8rem;
      overflow-x: hidden;

      > img {
        margin: 0.5rem 0 0 0.5rem;
        width: auto;
        height: calc(100% - 0.5rem);
      }

      > div {
        margin-left: 1rem;
        flex: 1;

        .title {
          margin-bottom: 1.5rem;
        }

        div {
          span {
            margin-right: 0.5rem;
            font-size: 0.75rem;
            line-height: 1.375rem;
          }

          img {
            width: 1rem;
            height: 1rem;
          }
        }

        .pwd-rewrite {
          width: auto;
          height: 1.25rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }

        .key-secret {
          span {
            padding: 0 0.75rem;
            width: 8.875rem;
            height: 1.875rem;
            font-size: 0.75rem;
          }

          img {
            width: 1.25rem;
            height: 1.25rem;
          }
        }

        .read-docs {
          img {
            width: 0.75rem;
            height: 0.75rem;
          }
        }
      }
    }
  }
}
</style>
