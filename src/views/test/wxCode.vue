<template>
  <section class="test">
    <Input v-model:value="state.appid" placeholder="APPID" />
    <Button type="primary" @click="jump">跳转 open.weixin.qq.com</Button>
    <Button type="primary" @click="copy">复制 wx code</Button>
  </section>
</template>

<script setup lang="ts">
import { copyText, getQueryparams } from '@/utils/common';
import { Button, message, Input } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import { reactive, watch } from 'vue';

const route = useRoute();
// 注意：每获取 appid 的 code，都需要在根目录添加网页授权的 MP 文件，并且在 Dockerfile 中添加相关命令
// 目前只支持 下面这个 appid 和 payment.ts 中 的 APPID
// wx53a514a2aa8c90cf 对应 MP_verify_MNsDU7asQUlCrOa7.txt
const state = reactive({ appid: 'wx53a514a2aa8c90cf' });

watch(
  () => route.query,
  ({ appid }) => {
    if (appid) {
      state.appid = `${appid}`;
    }
  },
  { immediate: true },
);

function jump() {
  let origin = location.origin + location.pathname;
  const { MODE, VITE_TEST_URL, VITE_PROD_URL } = import.meta.env;
  if (MODE === 'development') origin = VITE_TEST_URL;
  if (MODE === 'production-local') origin = VITE_PROD_URL;

  let temp = `${origin}#/test-wxcode?appid=${state.appid}`;
  console.log('temp_now is ', temp);
  const wxQuery = getQueryparams({
    appid: state.appid,
    redirect_uri: encodeURIComponent(temp),
    response_type: 'code',
    scope: 'snsapi_base',
    state: 'STATE',
  });
  temp = `https://open.weixin.qq.com/connect/oauth2/authorize?${wxQuery}#wechat_redirect`;
  location.href = temp;
}

function copy() {
  let code = location.search.split('code=')[1]?.split('&state')[0];
  if (!code) {
    message.error('请先跳转 open.weixin.qq.com');
    return;
  }
  copyText(code);
}
</script>

<style lang="less" scoped>
.test {
  .flex-mode(column, center, flex-start);
  padding: 1.25rem;

  > * {
    margin-bottom: 0.625rem;
    height: 2.25rem;
  }
}
</style>
