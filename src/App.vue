<template>
  <style-provider hash-priority="high">
    <config-provider :locale="zhCN" :theme="showThemeConfig" :key="webStore.value">
      <router-view />
    </config-provider>
  </style-provider>
</template>

<script setup lang="ts">
import { ConfigProvider, StyleProvider } from 'ant-design-vue';
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { onMounted, computed, ref } from 'vue';
import { useWebStore } from './stores/web';
import { clearTimer, isEnv } from './utils/common';
import VConsole from 'vconsole';
import { useRouter } from 'vue-router';

// 本地开发调试注入 vConsole
if (false && isEnv(['development', 'test'])) {
  new VConsole();
}

dayjs.locale('zh-cn');

const themeConfig: ThemeConfig = {
  token: {
    // 源码有做 number 类型校验：不能设置 fontsize 为字符串，源码有涉及对应 padding 的计算
    colorPrimary: '#793aea',
    colorPrimaryHover: '#6931cd',
    colorPrimaryBgHover: '#3c3c3c',
    colorInfo: '#a371ff',
    colorInfoHover: '#793aea',
    colorPrimaryText: '#a371ff',
    colorPrimaryActive: '#793aea',
    colorPrimaryTextActive: '#793aea',
    wireframe: true,
    // 背景
    // 组件容器背景色：如 Button，Checkbox，DatePicker, InputNumber, Input, Table ...
    // 目前：Table 自定义为 #313131
    colorBgContainer: '#343434',
    // 布局背景色：Layout, Segmented
    colorBgLayout: '#1f1f1f',
    // 浮层容器背景色：DatePicker, Drawer, Dropdown, FloatButton, Mentions, Menu, Message, Modal, Notification, Popover, Segmented, Select, Slider, TreeSelect
    // 目前：Modal 自定义为 #313131，Message 自定义为 #292929
    colorBgElevated: '#1f1f1f',
    // 引起注意的背景色：Tooltip
    colorBgSpotlight: '#434343',
    colorPrimaryBg: 'transparent',
    colorErrorBg: 'transparent',
    colorInfoBg: '#3c3c3c',
    // 文本
    colorBgBase: '#000000',
    colorTextBase: '#ffffff',
    colorText: 'rgba(255, 255, 255, 0.85)',
    // 状态
    colorSuccess: '#5fe040',
    colorError: '#ff4d4f', // message.error 用 #e04041
    colorErrorHover: '#cd3131',
    colorWarning: '#e0ac40',
    // 边框
    borderRadius: 4,
    colorBorder: '#5d5d5d',
    colorBorderSecondary: '#636363',
    colorErrorBorderHover: '#ff867f', // input 错误悬浮
    colorInfoBorder: '#636363',
    // 阴影
    boxShadow:
      '0rem .5625rem 1.75rem .5rem rgba(0,0,0,0.2), 0rem .375rem 1rem 0rem rgba(0,0,0,0.32), 0rem .1875rem .375rem -0.25rem rgba(0,0,0,0.48)',
    // 字体
    fontSize: 16,
  },
};
const webStore = useWebStore();
const showThemeConfig = computed((): ThemeConfig => {
  const { fontSize } = webStore;
  let tokenTemp: ThemeConfig['token'] = { fontSize };
  let token = { ...themeConfig.token, ...tokenTemp };
  token.colorBgLayout = webStore.isPc ? '#1f1f1f' : '#141416';
  return { token };
});
const router = useRouter();
const timer = ref<number>();

function handleJump() {
  const { href } = location;
  // 由于 component 异步导入，route 为 undefined
  // 如果当前是 pc 但是页面是 wap 页面（目前暂没有 wap 页面），跳转到 aigc
  if (webStore.isPc && [].find((path) => href.includes(path))) {
    router.replace({ path: '/aigc' });
  }
}

onMounted(() => {
  webStore.setWebStyle();
  handleJump();
  window.addEventListener('resize', function (ev) {
    console.log(3, 'resize', ev);
    clearTimer(timer);
    timer.value = window.setTimeout(() => {
      webStore.setWebStyle();
      handleJump();
    }, 200);
  });
  window.addEventListener('orientationchange', function (ev) {
    console.log(4, 'ot change', ev);
  });
});
</script>

<style>
@import '@/assets/font/font.css';
</style>
