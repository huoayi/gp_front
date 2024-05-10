<template>
  <div class="top">
    <span>分享注册，享受更多权益</span>
    <Button type="primary" @click="copyLink">
      <template #icon>
        <img src="@/assets/img/layout/header/link.png" class="link-icon" />
      </template>
      <span>复制链接</span>
    </Button>
  </div>
  <div class="detail" :style="{ 'grid-template-columns': `repeat(${list.length}, 1fr` }">
    <div v-for="item in list">
      <img :src="shareIcons[item.icon]" />
      <p>{{ item.text }}</p>
    </div>
  </div>
  <div class="explain-right">
    <span class="extra">端脑云保留随时对规则作出调整的最终解释权</span>
  </div>
</template>

<script setup lang="ts">
import { icons as shareIcons } from '@/assets/img/user/shareRegister/index';
import { copyText } from '@/utils/common';
import { Button, message } from 'ant-design-vue';
import { onMounted, ref, computed } from 'vue';
import { getInviteCode } from '@/api/user';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const state = ref<{ link: string; shareCep: string; firstRechargeCep: string } | null>(null);
const list = computed(() => {
  const { shareCep, firstRechargeCep } = state.value || {};
  let temp: { icon: string; text: string }[] = [{ icon: 'bind', text: '永久绑定邀请后\n享受特殊奖励权益' }];
  if (shareCep) {
    temp.push({ icon: 'share-register', text: `每邀请 1 位好友\n注册后可得 ${shareCep} 脑力值` });
  }
  if (firstRechargeCep) {
    temp.push({ icon: 'first-recharge', text: `好友首次购买后\n可再得 ${firstRechargeCep} 脑力值` });
  }
  return temp;
});

onMounted(() => {
  // 获取邀请链接信息
  getRegisterShareData();
});

async function getRegisterShareData() {
  const result = await getInviteCode();
  if (result.code === 20000) {
    const { invite_code, share_cep: shareCep, first_recharge_cep: firstRechargeCep } = result.data;
    console.log('invite code', invite_code);
    let origin = location.origin + location.pathname;
    let link = `${origin}#/share/register-landing?id=${invite_code}`;
    state.value = userStore.isActivityExist
      ? { link, shareCep, firstRechargeCep }
      : { link, shareCep: '', firstRechargeCep: '' };
  } else {
    state.value = null;
  }
}

function copyLink() {
  if (state.value?.link) {
    copyText(state.value.link);
  } else {
    message.error('获取失败，请稍后再试！');
  }
}
</script>

<style lang="less" scoped>
.top {
  .flex-mode(row, space-between);
  padding: 1rem 0;
  border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.1);

  span {
    height: 1.75rem;
    font-size: 1.125rem;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.75rem;
  }

  button {
    .has-icon-btn;

    span {
      font-size: 0.875rem;
    }
  }
}

.detail {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 1.5rem 0 1rem;

  > div {
    .flex-mode(column);

    img {
      margin: 0 0 1rem;
      width: 6.25rem;
      height: 6.25rem;
    }

    p {
      height: auto;
      text-align: center;
      font-size: 0.875rem;
      line-height: 1.5rem;
      white-space: pre-line;
    }
  }
}
</style>
