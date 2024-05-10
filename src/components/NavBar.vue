<template>
  <div class="nav-bar" :class="{ 'has-bread-crumb': breadList.length > 0, 'has-tab-list': tabList.length > 0, sticky }">
    <Breadcrumb>
      <Breadcrumb.Item v-for="(item, index) in breadList">
        <router-link :to="item.href" v-if="index !== breadList.length - 1 && item.href">{{ item.text }}</router-link>
        <template v-else>{{ item.text }}</template>
      </Breadcrumb.Item>
    </Breadcrumb>
    <h1>{{ title }}</h1>
    <slot>
      <Tabs :active-key="tabActiveKey" class="tab-list" v-if="tabList.length > 0" @tab-click="clickTab">
        <Tabs.TabPane v-for="item in tabList" :key="item.key" :tab="item.text"></Tabs.TabPane>
      </Tabs>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { Breadcrumb, Tabs } from 'ant-design-vue';

export interface IBreadListItem {
  href?: string;
  text: string;
}
export interface ITabListItem<T> {
  key: T;
  text: string;
}
interface IProps {
  breadList?: IBreadListItem[];
  title: string;
  tabList?: ITabListItem<any>[];
  tabActiveKey?: string;
  sticky?: boolean;
}
withDefaults(defineProps<IProps>(), { breadList: () => [], tabList: () => [], tabActiveKey: '' });
const emit = defineEmits<{
  (event: 'tabClick', key: any): void;
}>();

function clickTab(key: any) {
  emit('tabClick', key);
}
</script>

<style lang="less">
// 由于 slot 里面的组件样式无法应用 scoped 样式，所以去掉 scoped，保持 nav-bar 类名唯一
.nav-bar {
  .flex-mode(column, flex-start, flex-start);
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem 0;
  width: 100%;
  height: fit-content;

  &.sticky {
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0rem 0.5rem 1.4375rem 0rem rgba(0, 0, 0, 0.1);
  }

  &.has-bread-crumb {
    padding-bottom: 1.25rem;
    background: #313131;

    nav {
      margin-bottom: 1rem;
    }

    h1 {
      margin: 0;
    }
  }

  &.has-tab-list {
    padding: 1rem 2rem 0;
    background: #313131;

    h1 {
      margin-bottom: 0.25rem;
    }
  }

  h1 {
    margin-bottom: 0;
    height: 1.75rem;
    font-size: 1.25rem;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.75rem;
  }

  .tab-list {
    .ant-tabs-nav {
      margin-bottom: 0;

      &::before {
        border-bottom-width: 0;
      }

      .ant-tabs-tab-btn {
        color: @color-text-secondary;
      }

      .ant-tabs-tab-active {
        .ant-tabs-tab-btn {
          color: @color-info;
        }
      }

      .ant-tabs-ink-bar {
        background: @color-info;
      }
    }
  }
}

.is-mobile {
  .nav-bar {
    margin-bottom: 1rem;
    padding: 1.5rem 1.5rem 0;

    h1 {
      height: 1.375rem;
      font-size: 1rem;
      line-height: 1.375rem;
    }

    &.has-bread-crumb {
      padding-bottom: 1rem;

      nav {
        margin-bottom: 0.75rem;
      }
    }

    &.has-tab-list {
      .tab-list {
        width: 100%;

        .ant-tabs-nav-list {
          width: 100%;
          justify-content: space-between;
        }
      }
    }
  }
}
</style>
