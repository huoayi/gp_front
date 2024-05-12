<template>
  <Menu
    theme="dark"
    class="menu-container"
    :selected-keys="state.selectedKeys"
    v-model:open-keys="state.openKeys"
    mode="inline"
  >
    <template v-for="menu in menus">
      <Menu.SubMenu v-if="menu.children" :key="menu.key" popup-class-name="sub-menu-popup">
        <template #icon>
          <div class="icon" :style="{ width: iconWidth }">
            <template v-if="menu.cIcon">
              <img :src="menu.cIcon" v-if="state.selectedKeys.includes(menu.key)" />
              <img :src="menu.selectedIcon || menu.cIcon" v-else />
            </template>
            <img v-else :src="icons[`${menu.key}${state.selectedKeys.includes(menu.key) ? '-selected' : ''}`]" />
          </div>
        </template>
        <template #title>
          <span>{{ menu.label }}</span>
        </template>
        <Menu.Item v-for="item in menu.children" :key="item.key" @click="clickItem(item.to)">
          <span>{{ item.label }}</span>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item v-else v-bind="{ key: menu.key }" @click="clickItem(menu.to)">
        <template #icon>
          <div class="icon" :style="{ width: iconWidth }">
            <template v-if="menu.cIcon">
              <img :src="menu.cIcon" v-if="state.selectedKeys.includes(menu.key)" />
              <img :src="menu.selectedIcon || menu.cIcon" v-else />
            </template>
            <img v-else :src="icons[`${menu.key}${state.selectedKeys.includes(menu.key) ? '-selected' : ''}`]" />
          </div>
        </template>
        <span>{{ menu.label }}</span>
      </Menu.Item>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { Menu } from 'ant-design-vue';
import { reactive, watch, type StyleValue } from 'vue';
import { icons } from '@/assets/img/layout/menu/index';
import { useRoute, type RouteLocationRaw } from 'vue-router';
import { setBurialPoint } from '@/api/burial';
import { useUserStore } from '@/stores/user';
import { useMissionStore } from '@/stores/mission';
import router from '@/router';

export interface IMenuItem {
  key: string;
  label: string;
  to?: string;
  cIcon?: string; // 自定义 icon
  selectedIcon?: string; // 选中时的 icon
  children?: IMenuItem[];
}
interface IProps {
  iconWidth?: string;
  menus?: IMenuItem[];
}
const props = withDefaults(defineProps<IProps>(), {
  iconWidth: '3.125rem',
  // 注意：这里默认是 pc 的 菜单。key 唯一，且与 icon file name 一样
  menus: () => [
    { key: 'aigc', label: '产品区', to: '/aigc' },
    { key: 'mission', label: '我的订单', to: '/order' },
    {
      key: 'user',
      label: '账户管理',
      to: '/user',
    },
    {
      key: 'product',
      label: '产品管理',
      to: '/product',
    },
    {
      key: 'earnings',
      label: '收益管理',
      to: '/earnings',
    },
  ],
});
const emit = defineEmits<{
  (event: 'clickItem', data: RouteLocationRaw): void;
}>();
const route = useRoute();
const userStore = useUserStore();
const missionStore = useMissionStore();

const state = reactive({
  selectedKeys: [] as string[],
  openKeys: [] as string[],
});

watch(
  [route, () => props.menus],
  ([{ path }, menus]) => {
    state.selectedKeys = [];
    state.openKeys = [];
    findItem(path, menus);
  },
  { immediate: true, deep: true },
);

function findItem(path: string, items: IMenuItem[], sub?: string) {
  for (let i = 0; i < items.length; i++) {
    const { to, key, children } = items[i];
    if (to && path === to) {
      state.selectedKeys.push(key);
      if (sub) {
        state.openKeys.push(sub);
      }
    }
    if (children && children?.length > 0) {
      findItem(path, children, key);
    }
  }
}

function clickItem(to?: string) {
  // console.log('clickItem', to);
  // router.push(to);
  missionStore.clickType = 'click';
  to && emit('clickItem', to);
}

defineExpose({
  selectedKeys: state.selectedKeys,
});
</script>

<style lang="less" scoped>
.ant-menu.menu-container {
  width: 100%;
  background: inherit;

  :deep(.ant-menu-sub) {
    background: #19191c !important;
  }

  :deep(.ant-menu-item-icon) {
    + span {
      margin-inline-start: 0;
      vertical-align: top;
    }
  }

  :deep(.ant-menu-item) {
    height: 3.125rem;
    line-height: 3.125rem;

    &:not(.ant-menu-item-only-child) {
      padding-left: 0 !important;
    }

    .ant-menu-title-content {
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
    }
  }

  :deep(.ant-menu-submenu) {
    .ant-menu-submenu-title {
      padding-left: 0 !important;
      height: 3.125rem;
      line-height: 3.125rem;
    }
  }

  .icon {
    height: 100%;

    img {
      margin: 0 auto;
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}
</style>

<style lang="less">
.sub-menu-popup {
  .ant-menu-sub {
    background: #19191c !important;
  }
}
</style>
