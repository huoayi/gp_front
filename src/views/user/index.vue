<template>
  <div class="btn-become">
    <a-button v-if="userInfo.role !== 'merchant'" style="background-color: #713de1" @click="showAddModal = true"
      >成为商户</a-button
    >
  </div>
  <div style="padding: 30px">
    <a-card title="个人信息" :bordered="false" style="width: 300px">
      <p>手机号：{{ userInfo.phone }}</p>
      <p>姓名：{{ userInfo.name }}</p>
      <p>昵称：{{ userInfo.nickName }}</p>
      <p>角色：{{ roleShow[userInfo.role] }}</p>
      <a-button style="margin-top: 20px" @click="showEditModal = true">修改个人信息</a-button>
    </a-card>
  </div>
  <div style="padding: 30px">
    <a-card title="商户信息" v-if="userInfo.role == 'merchant'" :bordered="false" style="width: 300px">
      <p>商户店名：{{ merchantInfo.merchantName }}</p>
      <p>所在省份：{{ merchantInfo.provence }}</p>
      <p>店铺描述：{{ merchantInfo.comment }}</p>
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
      <a-form-item label="商户名称" name="name" :rules="[{ required: true, message: 'Please input your phone!' }]">
        <a-input v-model:value="newMerchantForm.name" />
      </a-form-item>
      <a-form-item label="省份" name="type">
        <a-select ref="select" v-model:value="newMerchantForm.provence" style="width: 120px" @focus="focus">
          <a-select-option v-for="item in provences" :value="item.value">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="商户描述" name="brand">
        <a-input v-model:value="newMerchantForm.comment" />
      </a-form-item>
      <a-form-item label="商户图片" name="picture"
        ><a-upload
          v-model:file-list="fileList"
          name="file"
          action="http://10.63.10.19:8040/v1/set-photo"
          :headers="token"
          @change="handleChange"
        >
          <a-button>
            <upload-outlined></upload-outlined>
            Click to Upload
          </a-button>
        </a-upload></a-form-item
      >
      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal v-model:open="showEditModal" title="修改个人信息" @ok="confirmEdit">
    <a-form
      :model="userInfoForm"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinishEdit"
      @finishFailed="onFinishEditFailed"
      centered="true"
    >
      <a-form-item label="姓名" name="name">
        <a-input v-model:value="userInfoForm.name" />
      </a-form-item>
      <a-form-item label="昵称" name="nickName">
        <a-input v-model:value="userInfoForm.nickName" />
      </a-form-item>
      <a-form-item label="头像文件" name="picture"
        ><a-upload
          v-model:file-list="userFileList"
          name="file"
          action="http://10.63.10.19:8040/v1/set-photo"
          :headers="token"
          @change="handleUserChange"
        >
          <a-button>
            <upload-outlined></upload-outlined>
            Click to Upload
          </a-button>
        </a-upload></a-form-item
      >
      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">确认修改</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { message } from 'ant-design-vue';
import { becomeMerchant, editUserInfo, getMerchantInfo } from '@/api/myUser';

const userStore = useUserStore();
const provences = [
  { value: '安徽', label: '安徽' },
  { value: '北京', label: '北京' },
  { value: '重庆', label: '重庆' },
  { value: '福建', label: '福建' },
  { value: '甘肃', label: '甘肃' },
  { value: '广东', label: '广东' },
  { value: '广西', label: '广西' },
  { value: '贵州', label: '贵州' },
  { value: '海南', label: '海南' },
  { value: '黑龙江', label: '黑龙江' },
  { value: '河北', label: '河北' },
  { value: '河南', label: '河南' },
  { value: '湖北', label: '湖北' },
  { value: '湖南', label: '湖南' },
  { value: '江苏', label: '江苏' },
  { value: '江西', label: '江西' },
  { value: '吉林', label: '吉林' },
  { value: '辽宁', label: '辽宁' },
  { value: '内蒙古', label: '内蒙古' },
  { value: '宁夏', label: '宁夏' },
  { value: '青海', label: '青海' },
  { value: '山东', label: '山东' },
  { value: '山西', label: '山西' },
  { value: '陕西', label: '陕西' },
  { value: '上海', label: '上海' },
  { value: '四川', label: '四川' },
  { value: '天津', label: '天津' },
  { value: '新疆', label: '新疆' },
  { value: '云南', label: '云南' },
  { value: '浙江', label: '浙江' },
];
const fileList = ref([]);
const userFileList = ref([]);
const showAddModal = ref(false);

const merchantInfo = ref({
  merchantName: '',
  provence: '',
  comment: '',
});

const userInfo = ref({
  phone: null,
  name: null,
  nickName: null,
  role: '',
});
const newMerchantForm = reactive({
  jpg: '',
  comment: '',
  provence: '',
  name: '',
});

const showEditModal = ref(false);
const userInfoForm = ref({
  jpg: '',
  name: '',
  nickName: '',
});
function confirmEdit() {}
async function onFinishEdit() {
  const { name, nickName: nick_name, jpg: jpg_url } = userInfoForm.value;
  const res = await editUserInfo({ nick_name, name, jpg_url });
  console.log('res', res);
  if (res.code === 20000) {
    message.success('修改信息成功');
    showEditModal.value = false;
  } else {
    message.error('修改信息失败');
  }
}
function onFinishEditFailed() {}
function focus() {}
const handleUserChange = (info) => {
  if (info.file.status === 'done') {
    console.log('info', info);
    userInfoForm.value.jpg = 'http://59.110.65.99:9000' + info.file.response.data.url;
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};
async function onFinish() {
  console.log('newMerchantForm', newMerchantForm);
  const { name: merchant_name, provence, comment, jpg: jpg_url } = newMerchantForm;
  const res = await becomeMerchant({ merchant_name, provence, comment, jpg_url });
  console.log('res', res);
  if (res.code === 20000) {
    message.success('成为商户成功');
    const merchantToken = res.data.merchant_token;
    userStore.setMerchantToken('Bearer ' + merchantToken);
    showAddModal.value = false;
  } else {
    message.error('添加失败');
  }
}

async function confirmAdd() {}

async function onFinishFailed() {}

const handleChange = (info) => {
  if (info.file.status === 'done') {
    console.log('info', info);
    newMerchantForm.jpg = 'http://59.110.65.99:9000' + info.file.response.data.url;
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};

function getUserInfo() {}

const roleShow = {
  personal: '普通用户',
  merchant: '商户',
};
const token = ref({});
onMounted(async () => {
  const store = useUserStore();
  token.value = {
    authorization: store.getToken(),
  };
  const res = await userStore.getUserInfo();
  console.log('userInfo', res);
  console.log('phone', res.phone);
  const { phone, name, nick_name: nickName, user_type: role } = res;
  userInfo.value = {
    phone,
    name,
    nickName,
    role,
  };
  if (userInfo.value.role === 'merchant') {
    const res = await getMerchantInfo();
    const { merchant_name: merchantName, provence, comment } = res.data;
    merchantInfo.value = {
      merchantName,
      provence,
      comment,
    };
  }
});
</script>

<style scoped lang="less">
.btn-become {
  padding: 30px;
  padding-bottom: 0px;
}
</style>
