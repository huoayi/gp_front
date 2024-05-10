<template>
  <section class="service-stop" :class="webStore.getClassName('service-stop')">
    <img class="stop-img" src="@/assets/img/service/stop.png" />
    <img class="stop-img wap" src="@/assets/img/service/wap-stop.png" />
    <p class="content">
      亲爱的端脑云用户，为了优化大家的使用体验，端脑云正在进行停服更新。预计更新时间为
      <span class="info">{{ dayjs(SERVICE_STOP_TIME.START).format('MM 月 DD 日 HH 时 mm 分') }}</span> ——
      <span class="info">{{ dayjs(SERVICE_STOP_TIME.END).format('MM 月 DD 日 HH 时 mm 分') }}</span
      >，更新期间网站暂停服务。
    </p>
    <ol>
      <li>1. 按分钟计费的应用，在更新期间将无法停用，您可以提前手动停用；</li>
      <li>2. 包时、天、周、月的应用在更新结束后即可继续使用，并且会保存原有的应用配置；</li>
      <li>3. 如有任何问题，欢迎添加下方小助手进行反馈。</li>
    </ol>
    <img class="contact-img" src="@/assets/img/service/wx-contact.png" />
    <p class="support">感谢大家的理解和支持，端脑团队会一直努力，持续优化大家的使用体验～</p>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { onMounted, ref, onUnmounted } from 'vue';
import { SERVICE_STOP_TIME } from '@/json/common';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { clearTimer } from '@/utils/common';
import { Modal } from 'ant-design-vue';
import { useWebStore } from '@/stores/web';

const router = useRouter();
const userStore = useUserStore();
const webStore = useWebStore();
const checkTimer = ref<number>();

function checkStatus() {
  const isStop = userStore.checkServiceStop();
  if (isStop) return;
  clearTimer(checkTimer, 'interval');
  Modal.info({
    title: '更新完成，欢迎继续使用端脑云～',
    centered: true,
    onOk() {
      router.push({ name: 'aigc' });
    },
  });
}

onMounted(() => {
  checkStatus();
  clearTimer(checkTimer, 'interval');
  checkTimer.value = window.setInterval(checkStatus, 5 * 1000);
});

onUnmounted(() => {
  clearTimer(checkTimer, 'interval');
});
</script>

<style lang="less" scoped>
.service-stop {
  .flex-mode(column, center, center);
  padding: 2rem;
  min-height: 100%;
  height: fit-content;
  background: @color-bg-layout;
  .stop-img {
    height: 13.25rem;

    &.wap {
      display: none;
    }
  }

  .content {
    margin: 2rem 0;
    max-width: 61.3125rem;
    width: 100%;
    font-size: 1.25rem;
    font-family:
      PingFangSC-Semibold,
      PingFang SC;
    font-weight: 600;
    color: #ffffff;
    line-height: 1.75rem;
    text-align: center;

    .info {
      color: @color-info;
    }
  }

  ol {
    max-width: 61.3125rem;
    width: 100%;
    font-size: 1rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.375rem;
    text-align: justify;
  }

  .contact-img {
    margin: 2rem 0 1.5rem;
    width: 9.375rem;
  }

  .support {
    font-size: 0.875rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.25rem;
    text-align: center;
  }
}

.service-stop-mobile {
  .stop-img {
    display: none;
    height: 10.25rem;

    &.wap {
      display: block;
    }
  }

  .content {
    margin: 1.5rem 0 0.75rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: #ffffff;
    line-height: 1.25rem;
  }

  ol {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.0625rem;
  }

  .contact-img {
    margin: 1.5rem 0 0.75rem;
    width: 6.25rem;
  }
}
</style>
