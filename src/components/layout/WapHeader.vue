<template>
  <div class="wap-header-content" :style="{ zIndex: zIndex.header }">
    <UnorderedListOutlined class="menu-icon" @click="openMenuDrawer" />
    <img src="@/assets/img/layout/logo-cep.png" />
    <div class="user-avatar" @click="state.userVisible = !state.userVisible">
      <template v-if="!state.userVisible">
        <img v-if="userStore.isLogining" src="@/assets/img/user/default-avatar.png" />
        <img v-else class="not-login-icon" src="@/assets/img/user/not-login-avatar.png" />
      </template>
      <img class="close-icon" src="@/assets/img/close.png" v-else />
    </div>
  </div>
  <Drawer
    v-model:open="state.menuVisible"
    placement="left"
    :closable="true"
    width="100%"
    :root-style="{ zIndex: zIndex.menu }"
    :header-style="{ boxShadow: 'none' }"
    :body-style="{ padding: '1.25rem' }"
  >
    <template #closeIcon>
      <img class="close-icon" src="@/assets/img/close.png" alt="" />
    </template>
    <layout-menu class="wap-layout-menu" @click-item="clickMenuItem" :menus="menus" icon-width="2.875rem" />
  </Drawer>
  <Drawer
    v-model:open="state.userVisible"
    placement="top"
    :closable="false"
    root-class-name="user-drawer-layout"
    class="user-drawer"
    height="auto"
    :root-style="{ top: 0, zIndex: zIndex.user }"
    :body-style="{ padding: '0 1.5rem' }"
  >
    <template v-if="userStore.isLogining">
      <p>用户名：{{ userStore.getAsteriskAccount }}</p>
      <p class="cursor-pointer" @click="clickChangePwd">修改密码</p>
      <p class="cursor-pointer" @click="clickLogout">退出登录</p>
    </template>
    <p v-else class="cursor-pointer" @click="clickLogin">登录/注册</p>
  </Drawer>
</template>

<script setup lang="ts">
import { Drawer } from 'ant-design-vue';
import { UnorderedListOutlined } from '@ant-design/icons-vue';
import { reactive } from 'vue';
import LayoutMenu, { type IMenuItem } from './Menu.vue';
import { jumpTo } from '@/utils/common';
import { useUserStore } from '@/stores/user';
import { icons } from '@/assets/img/layout/menu/index';
import type { RouteLocationRaw } from 'vue-router';

const emit = defineEmits<{
  (event: 'changePwdVisible', value: boolean): void;
  (event: 'logoutVisible', value: boolean): void;
}>();

const userStore = useUserStore();
const state = reactive({
  menuVisible: false,
  userVisible: false,
});
const menus: (IMenuItem & { icon?: string })[] = [
  { key: 'aigc', label: 'AIGC 应用', to: '/aigc', cIcon: icons['aigc-selected'] },
  { key: 'mission', label: '我的应用', to: '/mission', cIcon: icons['mission-selected'] },
  { key: 'account', label: '我的账户', to: '/account', cIcon: icons['account-selected'] },
  {
    key: 'disk',
    label: '云盘管理',
    cIcon: icons['disk-selected'],
    children: [
      { key: 'disk-cloud', label: '端脑云空间', to: '/disk/cloud' },
      { key: 'disk-baidu', label: '百度网盘', to: '/disk/baidu' },
    ],
  },
  {
    key: 'help',
    label: '帮助中心',
    to: 'https://cephalon.feishu.cn/docx/T6PJdE4Sjob8Egxz0bScKiqPnUb?from=from_copylink',
    cIcon: icons['help-selected'],
  },
  { key: 'api', label: 'API', to: '/api', cIcon: icons['api-selected'] },
  { key: 'wap-share', label: '邀请好友', to: '/share', cIcon: icons['wap-share'] },
];
const zIndex = { header: 998, menu: 999, user: 997 };

function openMenuDrawer() {
  const { menuVisible, userVisible } = state;
  state.menuVisible = !menuVisible;
  if (userVisible) state.userVisible = false;
}

function clickMenuItem(data: RouteLocationRaw) {
  jumpTo(data, '_blank');
  state.menuVisible = false;
}

function clickChangePwd() {
  state.userVisible = false;
  emit('changePwdVisible', true);
}

function clickLogout() {
  state.userVisible = false;
  emit('logoutVisible', true);
}

function clickLogin() {
  state.userVisible = false;
  userStore.showLoginModal = true;
}
</script>

<style lang="less" scoped>
.wap-header-content {
  position: relative;
  .flex-mode(row, space-between);
  padding: 0 1.5rem;
  height: 2.875rem;
  background-color: #1f1f1f;
  box-shadow: 0rem 0.0625rem 0rem 0rem rgba(255, 255, 255, 0.15);

  .user-avatar {
    .flex-mode(row, flex-end);
    width: 2rem;
    height: 100%;
  }

  img:not(.close-icon) {
    width: 2rem;
    height: 2rem;
  }

  img.not-login-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .menu-icon {
    font-size: 1.5rem;
    color: #ffffff;
  }
}

.user-drawer {
  p {
    height: 4.375rem;
    font-size: 1rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 4.375rem;

    &:not(:last-child) {
      border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.15);
    }
  }
}

.wap-layout-menu {
  :deep(.ant-menu-item) {
    height: 2.75rem;
    line-height: 2.75rem;
    font-size: 1.25rem;
  }

  :deep(.ant-menu-submenu) {
    .ant-menu-submenu-title {
      height: 2.75rem;
      line-height: 2.75rem;
      font-size: 1.25rem;
    }

    .ant-menu-submenu-arrow {
      &::before,
      &::after {
        width: 7px;
        height: 1.8px;
      }
    }
  }
}
</style>
<style lang="less">
.user-drawer-layout.ant-drawer {
  .ant-drawer-content-wrapper {
    top: 2.875rem;
  }
}
</style>
