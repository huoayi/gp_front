<template>
  <div class="btn-become">
    <a-button style="background-color: #713de1" @click="showAddModal = true">成为商户</a-button>
  </div>
  <div style="padding: 30px">
    <a-card title="个人信息" :bordered="false" style="width: 300px">
      <p>手机号：{{ userInfo.phone }}</p>
      <p>姓名：{{ userInfo.name }}</p>
      <p>昵称：{{ userInfo.nickName }}</p>
      <p>角色：{{ userInfo.role }}</p>
    </a-card>
  </div>
  <a-modal v-model:open="showAddModal" title="成为商户" @ok="confirmAdd">
    <a-form
      :model="newMerchantForm"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
      centered="true"
    >
      <a-form-item label="手机号" name="brand" :rules="[{ required: true, message: 'Please input your phone!' }]">
        <a-input v-model:value="newMerchantForm.phone" />
      </a-form-item>
      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const showAddModal = ref(false);
const userInfo = ref({
  phone: null,
  name: null,
  nickName: null,
  role: '',
});
const newMerchantForm = reactive({
  phone: '',
  name: '',
  wechat: '',
});

async function onFinish() {}

async function confirmAdd() {}

async function onFinishFailed() {}

onMounted(async () => {
  const res = await userStore.getUserInfo();
  console.log('userInfo', res);
  console.log('phone', res.phone);
  const { phone, name, nick_name: nickName } = res;
  let role = '';
  if (res.merchant_token) {
    role = '商户';
  } else {
    role = '普通用户';
  }
  userInfo.value = {
    phone,
    name,
    nickName,
    role,
  };
});
</script>

<style scoped lang="less">
.btn-become {
  padding: 30px;
  padding-bottom: 0px;
}
</style>
