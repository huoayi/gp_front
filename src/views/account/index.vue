<template>
  <section class="account-index" :class="webStore.getClassName('account')">
    <nav-bar title="账户管理" />
    <div class="page-content">
      <div class="account-value">
        <div>
          <p>账户脑力值</p>
          <div>
            <img src="@/assets/img/cep.gif" />
            <span>{{ getComma(balanceStore.showValue) }}</span>
          </div>
        </div>
        <Button type="primary" @click="openCdkModal">使用兑换码</Button>
      </div>
      <div style="background: inherit">
        <h4>购买脑力值</h4>
        <choose-card
          :initial-index="-1"
          :list="rechargeArray"
          :storage-name="RECHARGE_STORAGE_NAME.CHOOSE"
          :has-towards="webStore.isPc"
          @item-click="showPayment"
          ref="chooseCard"
        ></choose-card>
      </div>
      <div>
        <h4>账户流水</h4>
        <div class="balance-table">
          <search-table
            :prefix-data="prefixData"
            :columns="columns"
            :datasource="datasource"
            @search="getData"
            :total="totalNum"
          >
            <template #bodyCell="{ column, record, text }">
              <Button
                class="detail-btn"
                type="link"
                size="small"
                v-if="column.dataIndex === 'operation'"
                @click="clickDetail(record)"
              >
                详情
              </Button>
              <div v-else-if="column.dataIndex === 'change'" class="account-number">
                <img src="@/assets/img/cep.png" alt="" />
                <span>{{ text }}</span>
              </div>
              <div v-else-if="column.dataIndex === 'way'" :class="`way ${record.wayClassname}`">
                <span>{{ text }}</span>
              </div>
              <span v-else>{{ text }}</span>
            </template>
            <template #emptyText>
              <div class="empty-text table-empty-text">
                <img src="@/assets/img/account/empty-list.png" />
                <span class="text-content">暂无订单</span>
              </div>
            </template>
          </search-table>
        </div>
      </div>
    </div>
    <Drawer
      v-model:open="detailState.visible"
      :closable="!webStore.isPc"
      :title="webStore.isPc ? '订单详情' : ''"
      :width="webStore.isPc ? undefined : '100%'"
      class="order-detail-drawer"
    >
      <template #closeIcon>
        <img class="close-icon" src="@/assets/img/close.png" alt="" />
      </template>
      <template #extra>
        <div
          v-if="detailState.clickId !== detailState.showId"
          class="extra-close-icon hover-icon-opacity back-to-detail-icon"
          @click="backToDetail"
        >
          <img src="@/assets/img/go-back-v2.png" alt="" />
        </div>
        <div v-else-if="webStore.isPc" class="extra-close-icon hover-icon-opacity" @click="detailState.visible = false">
          <img src="@/assets/img/close.png" alt="" />
        </div>
      </template>
      <h4 class="wap-title wap-order-title" v-if="!webStore.isPc">订单详情</h4>
      <div class="order-detail">
        <template v-for="item in detailState.showData">
          <p class="title">{{ item.label }}：</p>
          <p v-if="item.type === 'show-cep-img'" class="account-number content">
            <img src="@/assets/img/cep.png" alt="" />
            <span>{{ item.value }}</span>
          </p>
          <p
            v-else-if="item.type === 'click-related'"
            class="content-hover-text"
            @click="clickRelatedDetail(item.clickData)"
          >
            {{ item.value }}
          </p>
          <p v-else class="content">{{ item.value }}</p>
        </template>
      </div>
    </Drawer>
  </section>
  <custom-modal
    :visible="visibleState.rechargePay"
    :width="webStore.isPc ? '31.25rem' : '100%'"
    :height="webStore.isPc ? 'auto' : '100%'"
    :title="webStore.isPc ? '扫码支付' : ''"
    :full-modal="!webStore.isPc"
    @update:visible="closeRechargePay"
    :class-name="webStore.getClassName('pay-modal')"
  >
    <template #title v-if="!webStore.isPc">
      <div class="close-icon-header">
        <img class="close-icon" src="@/assets/img/close.png" alt="" @click="closeRechargePay" />
      </div>
      <h4 class="wap-title wap-pay-title" v-if="!state.isPaySuccess">支付订单</h4>
    </template>
    <pay
      ref="payment"
      :storage-name="RECHARGE_STORAGE_NAME.PAYMENT"
      @order-invalid="handleOrderInvalid"
      @order-succeed="handleOrderSucceed"
    ></pay>
  </custom-modal>
  <custom-modal
    :visible="cdkState.visible"
    title="使用兑换码"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
    @update:visible="closeCDKModal"
  >
    <div class="cdk-content" :class="webStore.getClassName('cdk-content')">
      <Form>
        <Form.Item :help="cdkState.help" :validate-status="cdkState.validateStatus" class="value-item">
          <Input
            ref="cdkInputRef"
            v-model:value="cdkForm.value"
            placeholder="请输入 8 位数字或英文字母的兑换码"
            @change="checkCDK"
            @press-enter="confirmUseCdk"
            :maxlength="8"
          />
        </Form.Item>
      </Form>
      <Button type="primary" @click="confirmUseCdk" :loading="cdkState.loading">确认使用</Button>
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue';
import ChooseCard, { type IChooseExpose } from '@/components/recharge/ChooseCard.vue';
import SearchTable from '@/components/SearchTable.vue';
import type { IPrefixDataItem } from '@/components/SearchTable.vue';
import type { ColumnType } from 'ant-design-vue/lib/table';
import { Drawer, Button, Form, Input, message } from 'ant-design-vue';
import { onMounted, ref, reactive, nextTick, computed, watch, onUnmounted } from 'vue';
import { getCostBills } from '@/api/account';
import dayjs from 'dayjs';
import Pay, { type IPayExpose } from '@/components/recharge/Pay.vue';
import CustomModal from '@/components/Modal.vue';
import { useBalanceStore } from '@/stores/balance';
import {
  getComma,
  judgeEchoRechargeData,
  transferCepToRMB,
  getStorage,
  clearTimer,
  convertToCEP,
} from '@/utils/common';
import type { IPagination, IRechargeStorageData } from '@/interface/common';
import { RECHARGE_STORAGE_NAME as TEMP_NAME } from '@/json/common';
import { useWebStore } from '@/stores/web';
import { useUserStore } from '@/stores/user';
import { useConfigurationStore } from '@/stores/configuration';
import { setBurialPoint } from '@/api/burial';
import { getCdkDetail, useCdk } from '@/api/cdk';

const RECHARGE_STORAGE_NAME = TEMP_NAME['ACCOUNT'];

const userStore = useUserStore();
const configStore = useConfigurationStore();
const rechargeArray = computed(() =>
  configStore.rechargeList.filter(
    (item) => userStore.isActivityExist || (!userStore.isActivityExist && !item.giftPercent),
  ),
);
const balanceStore = useBalanceStore();
const webStore = useWebStore();
const prefixData: IPrefixDataItem[] = [
  { label: '订单号', value: 'id', type: 'input' },
  { label: '订单时间', value: 'order_time', type: 'rangepicker' },
  {
    label: '业务类型',
    value: 'bill_type',
    type: 'select',
    options: [
      { label: '购买', value: 'recharge_replace' },
      { label: '转账', value: 'transfer' },
      { label: '消费', value: 'consume_replace' },
      { label: '活动', value: 'active_replace' },
    ],
  },
  {
    label: '业务方式',
    value: 'bill_way',
    type: 'select',
    options: [
      // 购买
      { label: '微信支付', value: 'recharge_wechat' },
      { label: '支付宝', value: 'recharge_alipay' },
      { label: '人工', value: 'transfer_manual' },
      { label: '兑换码兑换', value: 'cdk_exchange' },
      // 消费
      { label: '任务消耗', value: 'count_replace' },
      { label: '计时消耗', value: 'time_replace' },
      // 活动
      { label: '邀请好友注册', value: 'active_share' },
      { label: '注册奖励', value: 'active_register' },
      { label: '购买赠送', value: 'active_recharge' },
      { label: '好友首次购买', value: 'first_invite_recharge' },
      { label: '活动拉新奖励', value: 'active_invite_recharge' },
      { label: '绑定邀请关系', value: 'active_bind' },
      { label: '抽奖奖励', value: 'lotto_prize' },
    ],
  },
];
const selectItemMapping: Record<string, string[] | string> = {
  count_replace: ['mission_count', 'mission_hold', 'mission_volume'],
  time_replace: [
    'mission_time',
    'mission_time_plan_hour',
    'mission_time_plan_day',
    'mission_time_plan_week',
    'mission_time_plan_month',
  ],
  consume_replace: ['mission', 'gas'],
  recharge_replace: ['recharge', 'cdk'],
  active_replace: ['active', 'lotto'],
};
const columns: ColumnType[] = [
  { dataIndex: 'id', title: '订单号' },
  { dataIndex: 'time', title: '订单时间' },
  { dataIndex: 'type', title: '业务类型' },
  { dataIndex: 'way', title: '业务方式' },
  { dataIndex: 'change', title: '脑力值变动' },
  { dataIndex: 'operation', title: '操作' },
];
const datasource = ref<{ [key: string]: any }[]>([]);
const totalNum = ref(0);
type DetailDataItem = {
  label: string;
  value: string;
  type?: 'click-related' | 'show-cep-img';
  clickData?: any;
};
const detailState = reactive({
  visible: false,
  clickId: '',
  showId: '',
  showData: {} as DetailDataItem[],
  extraList: [] as { [key: string]: any }[],
});
const visibleState = reactive({
  rechargePay: false,
});
const payment = ref<IPayExpose>();
const chooseCard = ref<IChooseExpose>();
const state = reactive({
  params: { page_index: 1, page_size: 10 } as { [key: string]: any } & IPagination,
  isPaySuccess: false,
});
const balanceChangeTimer = ref<number>();
// cdk
const cdkState = reactive({ visible: false, help: '', validateStatus: undefined, loading: false });
const cdkForm = reactive({ value: '' });
const cdkTimer = ref<number>();
const cdkInputRef = ref();

// 表格详情按钮点击事件
function clickDetail(record: any) {
  detailState.visible = true;
  const { id, orderDetail } = record;
  detailState.clickId = id;
  detailState.showId = id;
  detailState.showData = orderDetail;
}

// 详情弹框中的 关联购买订单号 或 关联活动订单号 的点击事件
function clickRelatedDetail(serialNumber: string) {
  detailState.visible = false;
  setTimeout(async () => {
    detailState.showId = serialNumber;
    let temp =
      [...detailState.extraList, ...datasource.value].find((item) => item.id === serialNumber)?.orderDetail || [];
    if (temp.length === 0) {
      const result = await getCostBills({ page_index: 1, page_size: 1, id: serialNumber });
      if (result.code === 20000 && result.data.total === 1) {
        let item = getDataItem(result.data.list[0]);
        detailState.extraList.push(item);
        detailState.showData = item.orderDetail;
      } else {
        detailState.showData = [];
      }
    } else {
      detailState.showData = temp;
    }
    detailState.visible = true;
  }, 100);
}

function backToDetail() {
  const { clickId } = detailState;
  clickRelatedDetail(clickId);
}

async function getData(params: { [key: string]: any }) {
  let { page_index, page_size, ...temp } = params;
  let paramsTemp = { page_index, page_size };
  if (temp.start && temp.end) {
    Object.assign(paramsTemp, { bill_time_begin: temp.start, bill_time_end: temp.end });
  } else {
    Object.assign(paramsTemp, temp);
  }
  if (temp.bill_type) {
    let newValue = selectItemMapping[temp.bill_type];
    newValue && Object.assign(paramsTemp, { bill_type: newValue });
  }
  if (temp.bill_way) {
    let newValue = selectItemMapping[temp.bill_way];
    newValue && Object.assign(paramsTemp, { bill_way: newValue });
  }
  state.params = paramsTemp;
  // console.log(paramsTemp)
  const result = await getCostBills(paramsTemp);
  if (result.code !== 20000) return;
  const { list, total } = result.data;
  totalNum.value = total;
  datasource.value = (list || []).map((item: any) => getDataItem(item));
}

function getDataItem(item: any) {
  let {
    type: typeTemp, // recharge transfer mission active
    way: wayKey,
    serial_number: id,
    edges: { transfer_order, mission_order },
    is_add,
    amount,
    created_at,
  } = item;
  let isRecharge = typeTemp === 'recharge';
  let isMission = typeTemp === 'mission';
  let isActivity = typeTemp === 'active';
  let time = dayjs(created_at).format('YYYY.MM.DD HH:mm:ss'),
    type = (prefixData.find((item) => item.value === 'bill_type')?.options as any[])?.find((item) => {
      let mapping = selectItemMapping[item.value];
      return mapping ? mapping.includes(typeTemp) : item.value === typeTemp;
    })?.label,
    rmb = transferCepToRMB(amount),
    change = `${is_add ? '+' : '-'}${getComma(convertToCEP(amount))}`,
    wayObj = (prefixData.find((item) => item.value === 'bill_way')?.options as any[])?.find((item) => {
      let mapping = selectItemMapping[item.value];
      return mapping ? mapping.includes(wayKey) : item.value === wayKey;
    });
  let way = wayObj?.label,
    wayClassname = wayObj?.value.replace(/_/g, '-');
  let orderDetail: DetailDataItem[] = isRecharge
    ? [
        { label: '订单号', value: id },
        { label: '订单时间', value: time },
        { label: '业务类型', value: type },
        { label: '购买金额', value: `￥${rmb.toFixed(2)}` },
        { label: '脑力值变动', value: change, type: 'show-cep-img' },
        { label: '业务方式', value: way },
      ]
    : [
        { label: '订单号', value: id },
        { label: '订单时间', value: time },
        { label: '业务类型', value: type },
        { label: '脑力值变动', value: change, type: 'show-cep-img' },
        { label: '业务方式', value: way },
      ];
  // 购买：第三方订单号、关联活动订单号（如有则跳转活动订单，暂时不展示）；
  // 活动：关联购买订单号（如有，即购买赠送：可以点击转到购买订单号的详情，暂时不展示）
  // 任务：任务订单号
  let relatedOrder: any = null;
  if (isRecharge) {
    orderDetail.push({ label: '第三方订单号', value: transfer_order?.serial_number });
    // 关联活动订单号
    if (relatedOrder) {
      let value = relatedOrder.serial_number;
      orderDetail.push({
        label: '关联活动订单号',
        value,
        type: 'click-related',
        clickData: value,
      });
    }
  }
  if (isActivity) {
    if (wayKey === 'active_recharge' && relatedOrder) {
      let value = relatedOrder.serial_number;
      orderDetail.push({
        label: '关联购买订单号',
        value,
        type: 'click-related',
        clickData: value,
      });
    }
  }
  if (isMission) {
    orderDetail.push({ label: '任务订单号', value: mission_order?.mission_id });
  }

  return {
    id,
    time,
    type,
    way,
    wayClassname,
    change,
    orderDetail,
  };
}

function showPayment(value: number, giftValue: number, isHot?: boolean) {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_recharge',
    body: { phone: userStore.userInfo?.phone, amount: value },
  });
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'page_view_recharge',
    body: { phone: userStore.userInfo?.phone, balance: balanceStore.showValue },
  });
  console.log('showPayment value', value);
  visibleState.rechargePay = true;
  nextTick(() => {
    payment.value?.createOrder(value, giftValue, isHot);
  });
}

async function closeRechargePay() {
  await payment.value?.closeOrder();
  chooseCard.value?.changeChooseData(-1);
  state.isPaySuccess = false;
  visibleState.rechargePay = false;
}

function handleOrderInvalid() {
  chooseCard.value?.changeChooseData(-1);
  visibleState.rechargePay = false;
}

function handleOrderSucceed() {
  state.isPaySuccess = true;
}

async function checkCDK() {
  const { value } = cdkForm;
  if (value) {
    clearTimer(cdkTimer);
    cdkTimer.value = window.setTimeout(async () => {
      // 格式
      if (/^[a-zA-Z0-9]{8}$/.test(value)) {
        const { code, data } = await getCdkDetail(value);
        if (code === 20000) {
          const { status, get_cep } = data;
          if (status === 'normal') {
            Object.assign(cdkState, { help: `可兑换 ${get_cep} 脑力值`, validateStatus: 'success' });
          } else if (status === 'used') {
            Object.assign(cdkState, { help: '兑换码已使用', validateStatus: 'error' });
          } else {
            Object.assign(cdkState, { help: '兑换码无效', validateStatus: 'error' });
          }
        } else {
          Object.assign(cdkState, { help: '兑换码无效', validateStatus: 'error' });
        }
      } else {
        Object.assign(cdkState, { help: '格式错误', validateStatus: 'error' });
      }
    }, 200);
  } else {
    Object.assign(cdkState, { help: '请输入兑换码', validateStatus: 'error' });
  }
}

async function openCdkModal() {
  cdkState.visible = true;
  await nextTick();
  cdkInputRef.value?.focus();
}

function closeCDKModal() {
  cdkState.visible = false;
  cdkForm.value = '';
  Object.assign(cdkState, { visible: false, help: '', validateStatus: undefined });
}

async function confirmUseCdk() {
  try {
    cdkState.loading = true;
    const { value } = cdkForm;
    const { help, validateStatus } = cdkState;
    if (!value && !help) checkCDK();
    if (help && validateStatus !== 'success') return;
    const { code } = await useCdk(value);
    if (code === 20000) {
      message.success('兑换成功！');
      balanceStore.updateValue(userStore.getToken());
      closeCDKModal();
    } else {
      message.error('兑换失败');
    }
  } catch (e) {
    console.log('use cdk', e);
  } finally {
    cdkState.loading = false;
  }
}

// 监听余额变化
watch(
  () => balanceStore.value,
  (value) => {
    clearTimer(balanceChangeTimer);
    balanceChangeTimer.value = window.setTimeout(() => {
      getData(state.params);
    }, 200);
  },
  { immediate: true, deep: true },
);

onMounted(async () => {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'page_view_my_account',
    body: { phone: userStore.userInfo?.phone },
  });
  const { canUse, data } = judgeEchoRechargeData(RECHARGE_STORAGE_NAME.PAYMENT);
  if (canUse && data) {
    const chooseData = getStorage({ name: RECHARGE_STORAGE_NAME.CHOOSE });
    if (chooseData) {
      const { index, customValue } = chooseData as IRechargeStorageData['choose'];
      chooseCard.value?.changeChooseData(index, customValue);
      visibleState.rechargePay = true;
      nextTick(() => {
        payment.value?.echoRechargeData(data);
      });
    }
  }
});

onUnmounted(() => {
  clearTimer(balanceChangeTimer);
});
</script>

<style lang="less" scoped>
.account-index {
  .page-content {
    background: inherit;
  }

  h4 {
    margin: 2.5rem 0 1.5rem;
    height: 1.75rem;
    font-size: 1.25rem;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.75rem;
  }

  .account-value {
    .flex-mode(row, space-between);
    padding: 0 2rem 0 2.25rem;
    height: 9rem;
    border-radius: 0.375rem;
    background:
      url(@/assets/img/account/back.png) right/auto 100% no-repeat,
      #313131;

    > div {
      p {
        margin-bottom: 1.5rem;
        height: 1.75rem;
        font-size: 1.25rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.75rem;
      }

      div {
        .cep-img-value(2.625rem, 1rem);

        span {
          height: 2.75rem;
          font-size: 2rem;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          font-weight: 500;
          color: #ffffff;
          line-height: 2.75rem;
        }
      }
    }

    button {
      width: 9.125rem;
      height: 3.375rem;
      border-radius: 0.375rem;
      // text
      font-size: 1rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
    }
  }

  .empty-text {
    img {
      width: 5.875rem;
      height: 5.5625rem;
    }
  }

  .detail-btn {
    font-size: inherit;
  }

  // 表格 - 业务方式
  .way {
    position: relative;
    padding: 0.375rem 0.5rem;
    width: fit-content;
    height: 2rem;
    z-index: 1;

    &::after {
      content: '';
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 0.25rem;
      opacity: 0.25;
    }

    &.recharge-wechat::after {
      background: #85ff9c;
    }

    &.recharge-alipay::after {
      background: #85f1ff;
    }

    &.transfer-manual::after {
      background: #85fff3;
    }

    &.cdk-exchange::after {
      background: #65ffa0;
    }

    &.count-replace::after {
      background: #ff85d4;
    }

    &.time-replace::after {
      background: #ff8585;
    }

    &.lotto-prize::after {
      background: #85B0FF;
    }

    &.active-share::after,
    &.first-invite-recharge::after {
      background: #beff85;
    }

    &.active-register::after {
      background: #85ceff;
    }

    &.active-recharge::after {
      background: #85ffcf;
    }

    &.active-bind::after {
      background: #85ebff;
    }

    &.active-invite-recharge::after {
      background: #26ddd1;
    }

    span {
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
    }
  }
}

.wap-order-title {
  margin-bottom: 1rem;
}

.wap-pay-title {
  padding: 1.5rem 1.5rem 0.125rem;
}

.order-detail {
  p {
    &:not(:last-child) {
      margin-bottom: 0.625rem;
    }

    &.title {
      width: 17.625rem;
      height: 1.375rem;
      font-size: 0.875rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: @color-text-tertiary;
      line-height: 1.375rem;
    }

    &.content {
      color: @color-text;
    }

    &.content-hover-text {
      .hover-text;
    }
  }
}

.account-mobile {
  h4 {
    margin: 1.5rem 0 1rem;
    height: 1.375rem;
    height: auto;
    font-size: 1rem;
    line-height: 1.375rem;
    background: inherit;
  }

  .account-value {
    padding: 0 1rem;
    height: 5.25rem;
    background:
      url(@/assets/img/account/wap-back.png) right/auto 100% no-repeat,
      #313131;

    > div {
      p {
        margin-bottom: 0.5rem;
        height: 1.375rem;
        font-size: 1rem;
        line-height: 1.375rem;
      }

      div {
        .cep-img-value(1.125rem, 0.25rem);

        span {
          height: 1.375rem;
          font-size: 1rem;
          line-height: 1.375rem;
        }
      }
    }

    button {
      width: 6.375rem;
      height: 2rem;
      background: #793aea;
      font-size: 0.875rem;
      font-weight: 400;
    }
  }
}

.cdk-content {
  padding: 1.5rem;

  :deep(.value-item) {
    margin-bottom: 0;

    .ant-form-show-help {
      height: 1.5rem;
    }
  }

  input {
    height: 2.5rem;
  }

  button {
    width: 100%;
    height: 2.5rem;
  }

  &-mobile {
    padding: 1rem;

    :deep(.value-item) {
      margin-bottom: 0;

      .ant-form-show-help {
        height: 1.25rem;
      }
    }
  }
}
</style>

<style lang="less">
// 覆盖 Pay.vue 样式
.pay-modal-mobile {
  .ant-modal {
    .modal-title {
      .flex-mode(row, flex-start);
      background: inherit;

      .name {
        position: static;
        transform: none;
      }
    }
  }
}

.is-mobile {
  .order-detail-drawer {
    .order-detail {
      p {
        &:not(:last-child) {
          margin-bottom: 0.5rem;
        }
      }
    }

    .back-to-detail-icon {
      img {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }
}
</style>
