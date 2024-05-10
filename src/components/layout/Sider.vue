<template>
  <Layout.Sider
    class="sider"
    :width="sidebar.width"
    :class="{ 'sider-collapsed': webStore.isCollapsed }"
    :collapsed="webStore.isCollapsed"
    :collapsed-width="sidebar.collapsedWidth"
  >
    <div class="logo">
      <img
        v-if="webStore.isCollapsed"
        class="cursor-pointer"
        src="@/assets/img/layout/logo-cep.png"
        @click="jumpToAigc"
      />
      <img
        v-else
        class="cursor-pointer"
        src="@/assets/img/layout/logo.png"
        alt="Cephalon Cloud 端脑云 logo"
        @click="jumpToAigc"
      />
    </div>
    <layout-menu @click-item="(_d) => jumpTo(_d, '_blank')" />
    <div class="collapse" v-if="webStore.width > SIDER_CRITICAL_WIDTH">
      <MenuUnfoldOutlined v-if="webStore.collapsed" class="hover-icon-opacity cursor-pointer" @click="toggleCollapse" />
      <MenuFoldOutlined v-else class="hover-icon-opacity cursor-pointer" @click="toggleCollapse" />
    </div>
  </Layout.Sider>
</template>

<script setup lang="ts">
import { Layout } from 'ant-design-vue';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import { nextTick, onMounted } from 'vue';
import LayoutMenu from './Menu.vue';
import { jumpTo } from '@/utils/common';
import { useWebStore, SIDER_CRITICAL_WIDTH } from '@/stores/web';

const emit = defineEmits<{
  'header-display': [];
}>();
// 侧边栏：单位 rem
const sidebar = {
  width: '12.5rem',
  collapsedWidth: '3.75rem',
};

const webStore = useWebStore();

onMounted(() => {
  webStore.setIsCollapsed();
});

async function toggleCollapse() {
  webStore.collapsed = !webStore.collapsed;
  webStore.setIsCollapsed();
  await nextTick();
  emit('header-display');
}

function jumpToAigc() {
  jumpTo({ path: '/aigc' });
}
</script>

<style lang="less" scoped>
.sider {
  height: 100%;
  box-shadow: 0.1875rem 0rem 0.5rem 0rem rgba(0, 0, 0, 0.35);
  z-index: 1000;

  .logo {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: inherit;
    padding: 1.5625rem 1.25rem;
    height: 5.625rem;

    img {
      width: 10rem;
      height: 2.0625rem;
    }
  }

  &.ant-layout-sider,
  .ant-layout-sider-children,
  .ant-layout-sider-trigger {
    background: inherit;
  }

  .ant-layout-sider-children {
    overflow-y: auto;
  }

  &.sider-collapsed {
    .logo {
      .flex-mode;
      padding: 0;

      img {
        width: 3.125rem;
        height: 3.125rem;
      }
    }
  }

  .collapse {
    position: absolute;
    bottom: 0;
    padding: 0.9375rem 1.25rem 1.125rem;
    width: 100%;
    height: 3.3125rem;
    font-size: 1.25rem;
    background-color: inherit;
    box-shadow: 0.1875rem 0rem 0.5rem 0rem rgba(0, 0, 0, 0.35);
  }
}
</style>
