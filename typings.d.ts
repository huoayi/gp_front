/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const wx: any;

declare const ap = {
  version: string,
  getAuthCode: Function(...args),
  tradePay: Function(...args),
  alert: Function(...args),
  popWindow: Function(...args),
};

declare module '*.mov';

declare const gdt: any;
