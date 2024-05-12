import './assets/css/reset.less';
import './assets/css/common.less';
import 'ant-design-vue/dist/reset.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { message } from 'ant-design-vue';
import Antd from 'ant-design-vue';

import App from './App.vue';
import router from './router';

message.config({
  duration: 2,
  maxCount: 1,
  rtl: true,
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Antd);

app.mount('#app');
