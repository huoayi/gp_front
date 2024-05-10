<template>
  <Tooltip
    placement="leftBottom"
    overlay-class-name="contact-tooltip"
    @open-change="change"
    v-bind="webStore.isPc ? {} : { open: show }"
  >
    <template #title>
      <div class="contact-list" :class="{ 'no-padding': !webStore.isPc && activeKey }">
        <Tooltip
          v-for="item in list"
          :key="item.key"
          :placement="webStore.isPc ? 'left' : undefined"
          :get-popup-container="
            (triggerNode) => {
              return triggerNode.parentNode as HTMLElement;
            }
          "
          overlay-class-name="contact-tooltip-sub"
        >
          <template #title>
            <template v-if="webStore.isPc || item.key === activeKey">
              <div v-if="item.key === 'aigc-group'" class="content content-main">
                <img src="@/assets/img/layout/contact/qr.png" alt="" />
                <span>扫描小助手二维码，回复“进群”加入 Cephalon AIGC 微信交流群</span>
              </div>
              <div v-if="item.key === 'little-helper'" class="content content-main">
                <img src="@/assets/img/layout/contact/qr.png" alt="" />
                <span>如有疑问，请使用微信扫描二维码，添加小助手，进行咨询</span>
              </div>
              <div v-if="item.key === 'contact-us'" class="content content-second">
                <div>
                  <img src="@/assets/img/layout/contact/mail.png" alt="" />
                  <span>{{ state.email }}</span>
                  <div class="hover-icon-display-wrapper" @click="copyText(state.email)">
                    <img src="@/assets/img/copy.png" alt="" class="icon-d" />
                    <img src="@/assets/img/copy-hover.png" class="hover-icon" alt="" />
                  </div>
                </div>
                <div>
                  <img src="@/assets/img/layout/contact/addr.png" alt="" />
                  <span>广东省深圳市南山区前海华海金融创新中心 B 座 1211</span>
                </div>
              </div>
            </template>
          </template>
          <div
            v-if="webStore.isPc || !activeKey"
            class="item"
            @click.stop="clickItem(item.key)"
            @mouseenter="enterItem(item.type)"
          >
            <img :src="item.src" />
            <span>{{ item.text }}</span>
          </div>
        </Tooltip>
      </div>
    </template>
    <img
      class="spread-icon cursor-pointer"
      src="@/assets/img/layout/contact/spread.gif"
      alt=""
      @click.stop="clickIcon"
    />
  </Tooltip>
  <div class="contact-mask" v-if="!webStore.isPc && show" @click.stop="clickMask"></div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Tooltip } from 'ant-design-vue';
import { copyText } from '@/utils/common';
import { setBurialPoint } from '@/api/burial';
import { useUserStore } from '@/stores/user';
import AigcGroupIcon from '@/assets/img/layout/contact/aigc.png';
import ContactIcon from '@/assets/img/layout/contact/contact.png';
import ContactUsIcon from '@/assets/img/layout/contact/location.png';
import { useWebStore } from '@/stores/web';

const webStore = useWebStore();
const userStore = useUserStore();
const state = { email: 'business@cephalon.ai' };
const list = [
  { key: 'aigc-group', text: 'AIGC 交流群', src: AigcGroupIcon, type: 'page_view_community' },
  { key: 'little-helper', text: '联系小助手', src: ContactIcon, type: 'page_view_contact_helper' },
  { key: 'contact-us', text: '联系我们', src: ContactUsIcon, type: 'page_view_contact_us' },
];
const show = ref(false);
const activeKey = ref<string>('');

function change(open: boolean) {
  if (!open) {
    setTimeout(() => {
      if (activeKey.value) {
        activeKey.value = '';
      }
    }, 200);
  } else {
    show.value = true;
  }
}

function clickMask() {
  if (activeKey.value) {
    activeKey.value = '';
  } else {
    nextTick(() => {
      show.value = false;
    });
  }
}

function clickItem(key: string) {
  if (webStore.isPc || activeKey.value === key) return;
  activeKey.value = key;
}

function clickIcon() {
  if (activeKey.value) {
    activeKey.value = '';
  }
}

function enterItem(type?: string) {
  if (!type) return;
  _setBurialPoint(type);
}

function _setBurialPoint(type: string) {
  const { userId: creator, phone } = userStore.userInfo || {};
  setBurialPoint({ creator, type, body: { phone } });
}
</script>

<style lang="less" scoped>
.spread-icon {
  position: fixed;
  right: 3rem;
  bottom: 1.75rem;
  width: 2.625rem;
  height: 3.125rem;
  z-index: 999;
}

.contact-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
  background-color: rgba(0, 0, 0, 0.3);
}

.contact-list {
  padding: 0.75rem 0;
  width: 10.5rem;
  background: #434343;
  box-shadow:
    0rem 0.5625rem 1.75rem 0.125rem rgba(0, 0, 0, 0.2),
    0rem 0.375rem 1rem -0.125rem rgba(0, 0, 0, 0.32),
    0rem 0.1875rem 0.375rem -0.25rem rgba(0, 0, 0, 0.48);
  border-radius: 0.375rem;

  &.no-padding {
    padding: 0;
  }

  .item {
    position: relative;
    padding: 0 1.25rem;
    height: 2.5rem;
    font-size: 1rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 2.5rem;
    white-space: nowrap;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0.75rem;
      right: 0.75rem;
      z-index: -1;
      border-radius: 0.25rem;
    }

    &:hover::before {
      background: #4d4d4d;
    }

    img {
      margin-right: 0.75rem;
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  .content {
    padding: 1.5rem;
    width: fit-content;

    &-main {
      .flex-mode();
      width: 22.5rem;

      > img {
        width: 5.25rem;
        height: auto;
      }

      > span {
        margin-left: 0.75rem;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 1.25rem;
        text-align: justify;
      }
    }

    &-second {
      .flex-mode(column, center, flex-start);
      gap: 0.75rem;

      > div {
        .flex-mode;

        img {
          width: 0.875rem;
          height: 0.875rem;
        }

        > img {
          margin-right: 0.5rem;
        }

        span {
          height: 1.25rem;
          font-size: 0.875rem;
          font-family:
            PingFangSC-Regular,
            PingFang SC;
          font-weight: 400;
          color: #ffffff;
          line-height: 1.25rem;
          white-space: nowrap;

          + div {
            .flex-mode;
            margin-left: 0.5rem;
            cursor: pointer;
          }
        }
      }
    }
  }
}

.is-mobile {
  .spread-icon {
    right: 1.5rem;
    bottom: 2rem;
  }

  .contact-list {
    width: 9.25rem;

    .item {
      height: 2.25rem;
      font-size: 0.875rem;
      line-height: 2.25rem;

      img {
        margin-right: 0.5rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .content {
      padding: 1rem;

      &-main {
        width: 16.5625rem;

        > span {
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }
      }

      &-second {
        > div {
          img {
            width: 0.75rem;
            height: 0.75rem;
          }

          span {
            height: 1.0625rem;
            font-size: 0.75rem;
            line-height: 1.0625rem;
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
// 设置 overlay-style 会出现抖动
.ant-tooltip.contact-tooltip {
  left: auto !important;
  right: 6.6875rem !important;
  padding-right: 0;
  max-width: unset;

  .ant-tooltip-inner {
    padding: 0;
    min-width: auto;
    min-height: auto;
  }

  .ant-tooltip-arrow {
    display: none;
  }

  &-sub {
    left: auto !important;
    right: 11.5rem !important;
    padding-right: 0;
    max-width: unset;
  }
}

.is-mobile {
  .ant-tooltip.contact-tooltip {
    right: 4.875rem !important;
    padding-bottom: 0;

    &-sub {
      right: 0 !important;
      padding-bottom: 0;
    }
  }
}
</style>
