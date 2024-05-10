<template>
  <Spin :spinning="spinning" wrapper-class-name="has-spin-container">
    <section class="disk-baidu" :class="webStore.getClassName('disk-baidu')">
      <nav-bar title="百度网盘" :bread-list="breadList" sticky />
      <div class="page-content">
        <div class="warning-alert">
          <span><img src="@/assets/img/warning.png" alt="" /></span>
          <span>
            1、仅支持授权百度网盘<br />
            2、当前仅限添加1个网盘<br />
            3、百度网盘速度限制：实测超级会员瞬时速度可达 5 MB+/s
          </span>
        </div>
        <div class="authorize" v-if="token">
          <img src="@/assets/img/disk/baidu-icon.png" />
          <div class="authorize__content">
            <h4>{{ info.name }}</h4>
            <p>{{ formatByte(info.used) }} / {{ formatByte(info.total) }}</p>
            <Progress :percent="precent" :show-info="false" stroke-color="#793aea" />
          </div>
          <Button type="primary" @click="cancelVisible = true">取消授权</Button>
        </div>
        <div class="authorize-empty" v-else>
          <img src="@/assets/img/disk/baidu-empty.png" />
          <p>
            <span>暂未授权，</span>
            <span class="hover-text" @click="clickAccess">去授权</span>
          </p>
        </div>
      </div>
    </section>
  </Spin>

  <custom-modal
    v-model:visible="cancelVisible"
    title="取消授权"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
  >
    <div class="btns-modal-content">
      <p>确定要取消授权吗？</p>
      <div class="btns">
        <Button @click="cancelVisible = false">取消</Button>
        <Button type="primary" @click="handleCancel">确定</Button>
      </div>
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import NavBar, { type IBreadListItem } from '@/components/NavBar.vue';
import { useWebStore } from '@/stores/web';
import { Spin, Button, Progress, message } from 'ant-design-vue';
import CustomModal from '@/components/Modal.vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { jumpTo, formatByte, formatMsg } from '@/utils/common';
import { getOauthUrl, getAccessToken, getUserInfo, bindToken, unbindToken, refreshAccessToken } from '@/api/disk/baidu';
import { useRoute, useRouter } from 'vue-router';
import { setBurialPoint } from '@/api/burial';
import { useUserStore } from '@/stores/user';

const webStore = useWebStore();
const userStore = useUserStore();
const breadList: IBreadListItem[] = [{ text: '云盘管理' }, { text: '百度网盘' }];

const route = useRoute();
const router = useRouter();
const cancelVisible = ref(false);
const token = ref('');
const info = reactive({ used: 0, total: 0, name: '' });
const spinning = ref(false);
const isRefresh = ref(false); // 只允许刷新过一次，防止陷入死循环
const precent = computed(() => {
  const { used = 0, total } = info;
  return total ? (used / total) * 100 : 0;
});

onMounted(() => {
  // 埋点
  const { userId: creator = '', phone } = userStore.userInfo || {};
  setBurialPoint({ creator, type: 'page_view_disk_baidu', body: { phone } });
});

watch(
  () => route.query,
  async (query) => {
    if (!route.path.includes('/disk/baidu')) return;
    const { code, state } = query;
    if (code && state) {
      setAccess(code as string, state as string);
    } else {
      getAccess();
    }
  },
  { immediate: true, deep: true },
);

async function setAccess(code: string, state: string) {
  const result = await bindToken({ code, state });
  if (result.code === 20000) {
    const { access_token } = result.data;
    token.value = access_token;
    router.replace({ path: '/disk/baidu' });
    getInfo();
  } else {
    message.error(formatMsg(result.msg || '绑定失败，请稍后再试！'));
  }
}

async function getAccess() {
  spinning.value = true;
  const result = await getAccessToken();
  if (result.code === 20000) {
    const { is_bind, access_token } = result.data;
    token.value = is_bind && access_token ? access_token : '';
    await getInfo();
  }
  spinning.value = false;
}

async function getInfo() {
  if (!token.value) return;
  const result = await getUserInfo(token.value);
  if (result.code === 20000) {
    const { used, total, netdiskname: name } = result.data;
    Object.assign(info, { used, total, name });
  } else if (result.code === 40004 && !isRefresh.value) {
    // 刷新
    isRefresh.value = true;
    const { code, data, msg } = await refreshAccessToken();
    token.value = data.access_token;
    if (code === 20000 && token.value) {
      getInfo();
    } else {
      message.error(formatMsg(msg || '获取失败，请稍后再试！'));
    }
  } else {
    message.error(formatMsg(result.msg || '获取信息失败，请稍后再试！'));
  }
}

async function clickAccess() {
  const result = await getOauthUrl();
  const { url } = result.data;
  jumpTo(url);
}

async function handleCancel() {
  spinning.value = true;
  const result = await unbindToken();
  if (result.code === 20000) {
    message.success('解绑成功！');
    token.value = '';
  } else {
    message.error(formatMsg(result.msg || '解绑失败！'));
  }
  cancelVisible.value = false;
  spinning.value = false;
}
</script>

<style lang="less" scoped>
.disk-baidu {
  .authorize-empty {
    .flex-mode(column);
    margin-top: 1.5rem;
    padding: 3rem;
    height: 14.625rem;
    background: #313131;
    border-radius: 0.375rem;

    img {
      margin-bottom: 1rem;
      width: 6.25rem;
      height: 6.25rem;
    }

    p {
      height: 1.375rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.65);
      line-height: 1.375rem;
      text-align: left;
      font-style: normal;
      white-space: nowrap;
    }
  }

  .authorize {
    .flex-mode;
    gap: 1rem;
    position: relative;
    margin-top: 1.5rem;
    padding: 2rem 1.5rem 1.5rem;
    height: 8rem;
    background: #313131;
    border-radius: 0.375rem;

    img {
      width: 4.5rem;
      height: 4.5rem;
    }

    &__content {
      flex: 1;

      h4 {
        height: 1.75rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 1.25rem;
        color: #ffffff;
        line-height: 1.75rem;
        text-align: left;
        font-style: normal;
      }

      p {
        margin-top: 0.5rem;
        height: 1.25rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 0.875rem;
        color: #ffffff;
        line-height: 1.25rem;
        text-align: left;
        font-style: normal;
      }

      :deep(.ant-progress-line) {
        margin-bottom: 0;
      }
    }

    button {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 9.375rem;
      height: 3.125rem;
    }
  }
}

// h5
.disk-baidu-mobile {
  .authorize-empty {
    margin-top: 1rem;
    padding: 1rem;
    height: fit-content;

    img {
      margin-bottom: 0.75rem;
      width: 4.375rem;
      height: 4.375rem;
    }

    p {
      height: 1.25rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }

  .authorize {
    margin-top: 1rem;
    padding: 0.75rem;
    height: fit-content;

    img {
      width: 4rem;
      height: 4rem;
    }

    &__content {
      h4 {
        height: 1.375rem;
        font-size: 1rem;
        line-height: 1.375rem;
      }

      p {
        margin-top: 0.25rem;
        height: 1.0625rem;
        font-size: 0.75rem;
        line-height: 1.0625rem;
      }
    }

    button {
      top: 1.6875rem;
      right: 0.75rem;
      width: 5.5rem;
      height: 2rem;
    }
  }
}
</style>
