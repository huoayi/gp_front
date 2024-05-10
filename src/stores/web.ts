import { defineStore } from 'pinia';

interface IState {
  value: 'pc' | 'h5';
  orientationAngle?: ScreenOrientation['angle']; // 屏幕是否翻转
  fontSize: number; // ui 组件
  width: number;
  isCollapsed: boolean; // 决定是否折叠菜单
  collapsed: boolean; // 保存用户是否点击了折叠菜单按钮的状态
}

export const SIDER_CRITICAL_WIDTH = 768; // 临界宽度：小于等于临界宽度时，侧边栏收起
export const useWebStore = defineStore('web', {
  state: (): IState => ({
    value: 'pc',
    orientationAngle: undefined,
    fontSize: 16,
    width: 1992,
    isCollapsed: false,
    collapsed: false,
  }),
  getters: {
    isPc(state) {
      return state.value === 'pc';
    },
    // 页面组件类名
    getClassName(state) {
      return (prefix: string) => {
        // console.log('get class name:', prefix);
        if (state.value === 'h5') {
          let temp = `${prefix}-mobile`;
          if (state.orientationAngle === 90 || state.orientationAngle === 270) {
            temp += ` ${prefix}-mobile-landscape`;
          }
          return temp;
        } else {
          return '';
        }
      };
    },
  },
  actions: {
    // 设置 web 样式
    setWebStyle() {
      console.log('------------------------- - set web style');
      const {
        orientation: wot,
        screen: { orientation: sot },
        innerWidth: iWidth,
        innerHeight: iHeight,
      } = window;
      // 顺时针：正向竖屏
      // iphone6 wot：0 -90 180 90，没有 sot a
      // huawei wot: 0 -90 ? 90，sot a: 0 270 ? 90
      // 水平翻转 180° 只触发 orientationChange 而没触发 resize
      // 水平或竖直互翻，先触发 orientationChange 后 resize
      console.log('window oritentation:', wot, 'sot angle:', sot?.angle);
      let angle = typeof wot === 'number' ? Math.abs(wot) : undefined;
      this.orientationAngle = angle;
      console.log('userAgent:\n', navigator.userAgent, '\nangle:', angle);
      // 判断浏览器
      const is = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
      );
      // screen width height
      this.width = iWidth;
      // let isShowMobile = is && ((width <= height && angle !== 90) || (width > height && angle === 90 && width < 1024));
      let isShowMobile = (is && iWidth < 1440) || (!is && iWidth <= 600);
      console.log('mobile-match:', is, '\nwindow:', iWidth, iHeight, '\nresult:', isShowMobile);
      if (isShowMobile) {
        this.value = 'h5';
        this.fontSize = 14;
        document.body.classList.add('is-mobile');
        document.documentElement.style.fontSize = `16px`;
      } else {
        this.value = 'pc';
        this.fontSize = 16;
        document.body.classList.remove('is-mobile');
        document.documentElement.style.removeProperty('font-size');
      }
      this.setIsCollapsed();
    },
    // 设置折叠菜单
    setIsCollapsed() {
      this.isCollapsed = this.isPc
        ? this.width <= SIDER_CRITICAL_WIDTH || (this.width > SIDER_CRITICAL_WIDTH && this.collapsed)
        : false;
      if (this.isCollapsed) {
        document.body.classList.add('is-collapsed');
      } else {
        document.body.classList.remove('is-collapsed');
      }
    },
  },
});
