<template>
  <Spin :spinning="spinning" wrapper-class-name="has-spin-container">
    <section class="aigc-index" :class="webStore.getClassName('aigc-index')">
      <div class="aigc-index-content">
        <Carousel autoplay>
          <div
            v-for="(item, index) in workBanners.filter((i) => i.show)"
            :key="item.name"
            class="banner-item"
            :class="{ 'cursor-pointer': !!item.func }"
          >
            <img v-if="webStore.isPc" :src="bannerImages[item.name]" :alt="item.alt" />
            <img v-else :src="bannerImages[`wap-${item.name}`]" :alt="item.alt" />
          </div>
        </Carousel>

        <div class="titles">
          <div>
            <h1
              v-for="tab in tabList"
              :key="tab.key"
              :class="{ active: tabKey === tab.key }"
              @click="tabKey !== tab.key && beforeOperation(() => clickTab(tab.key))"
            >
              {{ tab.text }}
            </h1>
          </div>
          <Button type="primary" @click="clickCreateMyMirrorImage" v-if="tabKey === 'community'">创建我的镜像</Button>
        </div>

        <div class="classfify">
          <span
            v-for="item in classifyList"
            :class="{ active: classifyKey === item.key }"
            @click="classifyKey !== item.key && beforeOperation(() => (classifyKey = item.key))"
          >
            {{ item.text }}
          </span>
        </div>

        <div class="warning-alert">
          <img src="@/assets/img/warning.png" alt="" />
          <span>请诚信交流！若有不实则封号处理</span>
        </div>

        <div class="app-list">
          <template v-for="item in workAppList">
            <div class="app-list-item cursor-pointer used-img" @click="beforeOperation(() => clickApp(item))">
              <div class="top">
                <div class="intro-img">
                  <div class="item-img">
                    <img :src="item.jpg_url" alt="" />
                  </div>
                  <span class="title">{{ item.product_name }}</span>
                  <span class="title" style="font-size: small">价格: ¥{{ item.price/100 }} 单位：{{ item.unit }}</span>
                  <span class="describe">{{ item.comment }}</span>
                </div>
              </div>
              <p class="tip-text">使用期间如有问题可通过页面右下角进群咨询</p>
            </div>
            <!-- 官方应用展示即将上线，社区镜像不展示 -->
          </template>
        </div>
      </div>

      <Modal
        :visible="modalState.visible"
        @update:visible="closeVisible"
        width="53.125rem"
        title="购买"
        :class-name="webStore.getClassName('aigc-choose')"
        :full-modal="!webStore.isPc"
        class="common-aigc-choose-wrapper"
      >
        <div class="create-content-container common-content-container">
          <div class="little-title">第一步：核对订单信息</div>
          <a-card size="small" :title="nowItem.product_name" style="width: 300px">
            <p>价格：¥{{ nowItem.price/100 }}</p>
            <p>商品ID：{{ nowItem.id }}</p>
            <p>描述：{{ nowItem.comment }}</p>
          </a-card>
          <div class="little-title">第二步：去付款</div>
          <img src="@/assets/img/aigc/wechatPay.png" alt="" style="width: 150px; height: 150px" />
          <div class="little-title">第三步：通知卖方</div>
          <span>付款完成后，点击“已付款，通知卖家"按钮，以便卖家发货。</span>
        </div>
        <div class="buy-now-container">

          <Button type="primary" v-if="createOrderFinished" @click="confirmPay" :loading="useLoading">已经付款</Button>
          <Button type="primary" danger v-else @click="createOrder">下订单</Button>
        </div>
      </Modal>

      <recharge-integration ref="rechargeRef" :has-prev-step="modalState.hasPrevStep" @prev-step="clickRechargeBack" />

      <Modal v-model:visible="modalState.h100Visible" title="联系客服" :width="webStore.isPc ? '26rem' : '19.4375rem'">
        <div class="contact-modal-content">
          <h4>高端算力请联系专属客服购买</h4>
          <img src="@/assets/img/aigc/contact-qr.webp" />
          <p>微信扫一扫添加专属客服</p>
        </div>
      </Modal>
      <Modal
        v-model:visible="modalState.apiVisible"
        title="API 调用"
        :width="webStore.isPc ? '26rem' : '19.4375rem'"
        :show-close-icon="false"
      >
        <div class="btns-modal-content">
          <p class="warning">
            <span>
              推荐使用应用模式 SD 内置的 API 接口。如需使用端脑平台 API 接口，请查看平台的「API-接入文档」自行调用。
            </span>
          </p>
          <div class="btns" @click="modalState.apiVisible = false">
            <Button type="primary">我知道了</Button>
          </div>
        </div>
      </Modal>
      <a-modal v-model:open="showAddModal" title="填写下单信息" @ok="confirmAdd">
        <a-form
          :model="newOrderForm"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
          centered="true"
        >
          <a-form-item label="商品名称" name="name">
            {{ focusItem.product_name }}
          </a-form-item>
          <a-form-item label="商品ID" name="comment">
            {{ focusItem.id }}
          </a-form-item>
          <a-form-item label="单价（分）" name="comment">
            {{ focusItem.price }}
          </a-form-item>
          <a-form-item label="单位" name="comment">
            {{ focusItem.unit }}
          </a-form-item>
          <a-form-item label="数量" name="unit">
            <a-input v-model:value="newOrderForm.count" />
          </a-form-item>
          <a-form-item label="总价格（分）" name="price">
            {{ focusItem.price * newOrderForm.count }}
          </a-form-item>
          <a-form-item label="地址" name="price">
            <a-input v-model:value="newOrderForm.address" />
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
            <a-button type="primary" html-type="submit">Submit</a-button>
          </a-form-item>
        </a-form>
      </a-modal>
    </section>
  </Spin>
</template>

<script setup lang="ts">
import type {
  TabKey,
  ClassifyValue,
  MissionType,
  UseWayType,
  CategoryType,
  IAppItem,
  GpuType,
  IWorkGpuListItem,
  IGpuPriceItem,
  IGpuDiscountItem,
  ICreateMissionData,
} from '@/interface/aigc';
import {
  tabList,
  officalClassifyList,
  officalAppList,
  communityClassifyList,
  communityAppList,
  useWayIntros,
  useWays,
  gpuPerformanceText,
  gpuPerformance,
  gpuTimeUnitCep,
  gpuPerformaceMapping,
  purchaseTimes,
  CEP_MAX,
  minAccount,
  timeDiscounts,
} from '@/json/aigc';
import { images as officalAppImgs } from '@/assets/img/share/registerLanding/index';
import { images as communityAppImgs } from '@/assets/img/aigc/communityApp/index';
import { modalAppImg as modalAppImgs } from '@/assets/img/aigc/modalApp/index';
import { Button, InputNumber, Spin, message, Carousel, Select, Checkbox, Tooltip } from 'ant-design-vue';
import { SwiperSlide } from 'swiper/vue';
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { getCategories, getPrices } from '@/api/aigc';
import { useBalanceStore } from '@/stores/balance';
import {
  beforeOperation,
  clearTimer,
  getComma,
  convertToCEP,
  transferCepToRMB,
  jumpTo,
  getGpuVersionText,
} from '@/utils/common';
import { useUserStore } from '@/stores/user';
import { encodeData, createMissionsBatch } from '@/api/mission';
import { useMissionStore } from '@/stores/mission';
import { useWebStore } from '@/stores/web';
import Modal from '@/components/Modal.vue';
import SingleLineDragCard from '@/components/SingleLineDragCard.vue';
import RechargeIntegration from '@/components/recharge/Integration.vue';
import { images as bannerImages } from '@/assets/img/aigc/banner/index';
import { useRouter, useRoute } from 'vue-router';
import { useConfigurationStore } from '@/stores/configuration';
import { setBurialPoint } from '@/api/burial';
import type { aigcBannerEvent } from '@/interface/common';
import { getProductList } from '@/api/product';
import { addOrder, confirmPayOrder } from '@/api/order';

const userStore = useUserStore();
const balanceStore = useBalanceStore();
const missionStore = useMissionStore();
const webStore = useWebStore();
const router = useRouter();
const route = useRoute();

const newOrderId = ref('');
const createOrderFinished = ref(false);
const focusItem = ref({});
const newOrderForm = ref({
  products_id: '',
  count: 0,
  amount: 0,
  address: '',
});
async function confirmPay() {
  const res = await confirmPayOrder({ order_id: newOrderId.value });
  if (res.code === 20000) {
    message.success('完成订单');
    createOrderFinished.value = false;
    closeVisible();
  } else {
    message.error('支付失败');
  }
}
async function onFinish() {
  const res = await addOrder({
    product_id: nowItem.value.id,
    count: Number(newOrderForm.value.count),
    amount: focusItem.value.price * newOrderForm.value.count,
    address: newOrderForm.value.address,
  });
  if (res.code === 20000) {
    message.success('下单成功');
    createOrderFinished.value = true;
    //todo 塞id
    newOrderId.value = res.data.id;
    resetOrderModal();
  } else {
    message.error('下单失败');
  }
}
function onFinishFailed() {
  console.log('onFinishFailed');
}
const showAddModal = ref(false);
function confirmAdd() {
  console.log('confirmAdd');
}
async function createOrder() {
  showAddModal.value = true;
}
function resetOrderModal() {
  newOrderForm.value.products_id = '';
  newOrderForm.value.count = 0;
  newOrderForm.value.amount = 0;
  newOrderForm.value.address = '';
  showAddModal.value = false;
}

//#region state
const defaultModalState = {
  visible: false,
  activeKey: '' as IAppItem['key'],
  useActiveKey: '' as UseWayType,
  versionActiveKey: undefined, // 主要用于同一应用大类下各版本对应的 GPU 筛选
  gpuActiveVersion: '',
  gpuDetail: {} as IWorkGpuListItem['gpuDetail'],
  billingType: undefined,
  purchaseTime: undefined,
  automaticRenewal: false,
  num: 1,
  hasPrevStep: false,
  appVideoVisible: false,
  appFileName: '',
  h100Visible: false,
  apiVisible: false,
};
interface IModalState extends ICreateMissionData {
  visible: boolean;
  versionActiveKey?: MissionType['time'];
  gpuDetail: IWorkGpuListItem['gpuDetail'];
  num: number;
  hasPrevStep: boolean;
  appFileName: string;
  h100Visible: boolean;
  apiVisible: boolean;
}
const nowItem = ref({});
const modalState = reactive<IModalState>({ ...defaultModalState });
const classifyList = computed(() => {
  const list = tabKey.value === 'community' ? communityClassifyList : officalClassifyList;
  return [{ text: '全部', key: undefined }, ...list];
});
const appList = computed(() => {
  const list = tabKey.value === 'community' ? communityAppList : officalAppList,
    key = classifyKey.value;
  return key
    ? list.filter((i) => (Array.isArray(i.classify) ? i.classify.includes(key as never) : i.classify === key))
    : list;
});
const chooseImgs = computed(() => (tabKey.value === 'community' ? communityAppImgs : officalAppImgs));
const appVersionList = ref<IAppItem['children']>(); // 要么数组有项，要么 undefined
const workAppList = ref({});
const workAppGpuList = ref<Partial<{ [key in CategoryType]: string[] }>>();
const spinning = ref(false);
const useLoading = ref(false);
const gpuList = ref<IWorkGpuListItem[]>([]); // 应用类下的所有的 GPU，missionType 可能会存在不同（与 versionActiveKey 相关）
const workGpuList = ref<IWorkGpuListItem[]>([]);
const gpusPriceList = ref<IGpuPriceItem[]>([]);
const gpuDiscountList = computed((): IGpuDiscountItem[] => {
  const { useActiveKey: uak, gpuActiveVersion: gav } = modalState;
  if (uak === 'hold') {
    // missionType：固定 key_pair
    return [{ value: '', label: '按算力计费', missionType: 'key_pair', cep: 0, discount: 6.8 }];
  } else {
    const items = gpusPriceList.value.filter((item) => item.version === gav);
    const arr = timeDiscounts.map((item) => {
      const { value, label } = item;
      const { missionType, cep = 0, discount = 0 } = items.find((i) => i.billingType === value) || {};
      return { value, label, missionType, cep, discount };
    });
    return arr;
  }
});
const showTimeBilling = computed(() => {
  const { useActiveKey: uak } = modalState;
  return uak === 'time'; // 可以显示包时长相关计费方式，目前所有应用都支持包时长
});
const sumState = computed(() => {
  const { useActiveKey: uak, gpuActiveVersion: gav, billingType: bt } = modalState;
  if (!uak) return { unitCep: 0, currentMissionType: null, discount: 0 };
  let { missionType, cep = 0, discount = '' } = gpuDiscountList.value.find((i) => i.value === bt) || {};
  let cepTemp = cep;

  if (uak === 'hold') {
    // 目前 API 模式下有 SD 的 key_pair，后端默认给的 cep 在 cheapest 接口中是 0
    // 运营计算公式：型号分钟定价/5（如 3080 每分钟定价 15 脑力值，估算费用为 3 脑力值/ 1 张图）
    cepTemp = (gpuTimeUnitCep[gav] || 13) / 5;
  }

  // unitCep 为 单价
  return { unitCep: cepTemp, currentMissionType: missionType, discount };
});
const costUnitValue = computed(() => {
  const { billingType: bt, purchaseTime: pt } = modalState;
  const { unitCep: uc } = sumState.value;
  return showTimeBilling.value && bt ? uc * (pt || 0) : uc;
});
const canUse = computed(() => {
  const { useActiveKey: uak, automaticRenewal: renewal } = modalState;

  let fixcondition = renewal || uak === 'hold';
  const currentBalance = balanceStore.value;
  let temp =
    currentBalance > costUnitValue.value &&
    ((renewal && currentBalance >= minAccount.renewal) ||
      (uak === 'hold' && currentBalance >= minAccount.hold) ||
      !fixcondition);
  return temp;
});
const unitText = computed(() => {
  const { useActiveKey: uak, gpuActiveVersion: gav, billingType: bt, purchaseTime: pt } = modalState;
  let unit = showTimeBilling.value && bt ? `${pt} ${bt ? purchaseTimes[bt]?.unit : '分钟'}` : '分钟';
  if (uak === 'hold') {
    unit = '1 张图';
  }
  return unit;
});
const dragCardIndex = ref(0);
const gpuDragCardIndex = ref(0);
// 购买
const rechargeRef = ref();
// banner
const configStore = useConfigurationStore();
const bannerHandlers: Partial<Record<aigcBannerEvent, Function>> = {
  'goto-recharge': () => beforeOperation(() => clickGotoRecharge(false)),
  'open-first-app': () => beforeOperation(openFirstApp),
  'open-node-recruit': openNodeRecruit,
  'goto-carnival': () => jumpTo('/carnival'),
  'goto-competition': () => jumpTo('/competition'),
  'goto-vote': () => jumpTo('/vote'),
  'goto-bili-aaaki': () => window.open('https://t.bilibili.com/879351702978822148?spm_id_from=333.999.0.0', '_blank'),
  'goto-live-streaming': () => jumpTo('/live-streaming'),
  'goto-spring': () => jumpTo('/spring'),
};
const workBanners = computed(() => {
  return configStore.aigcBanners.map((item) => {
    let { name, alt, event, show } = item;
    let func = event ? bannerHandlers[event] : undefined;
    return { name, alt, func, show };
  });
});
// title
const tabKey = ref<TabKey>('offical');
// classify
const classifyKey = ref<ClassifyValue>();
// burial
const pvBurialTimer = ref<number>();
//#endregion

const clickBanner = (index: number, func?: Function) => {
  // 注：banner 可能会替换删除
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_banner',
    body: { phone: userStore.userInfo?.phone, index },
  });
  func && func();
};

const clickApp = (item: IAppItem) => {
  nowItem.value = item;
  focusItem.value = item;
  openModal(item);
};

function openNodeRecruit() {
  router.push('/node-recruit');
}

function clickTab(key: TabKey) {
  classifyKey.value = undefined;
  router.push({ path: '/aigc', query: { tab: key } });
}

function clickCreateMyMirrorImage() {
  message.info('暂不支持自定义创建镜像，请点击右下方悬浮按钮，联系小助手上传。', 3);
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_my_mirror_image',
    body: { phone: userStore.userInfo?.phone },
  });
}

function openFirstApp() {
  const item = appList.value.find((item) => item.key && workAppList.value?.includes(item.key));
  if (item) openModal(item);
}

async function openModal(item: IAppItem) {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'modal_create_app',
    body: { phone: userStore.userInfo?.phone, applicaton: item.text },
  });
  chooseApp(item);
  modalState.visible = true;
  initDragCardIndex();
}

function initDragCardIndex() {
  // 显示当前选择应用的位置
  const items = appList.value.filter((i) => i.key && workAppList.value?.includes(i.key));
  const index = items.findIndex((i) => i.key === modalState.activeKey);
  if (index === -1) {
    dragCardIndex.value = 0;
  } else if (webStore.isPc) {
    dragCardIndex.value = index < 3 ? 0 : index;
  } else {
    dragCardIndex.value = index;
  }
}

async function chooseApp(item: IAppItem) {
  let { key, children } = item;
  if (!key) return;
  modalState.activeKey = key;
  if (children && children.length > 0) {
    appVersionList.value = children;
    modalState.versionActiveKey = children[0].type;
  } else {
    appVersionList.value = undefined;
    modalState.versionActiveKey = undefined;
  }
  chooseUseWay(useWays[key][0]);
}

function chooseUseWay(key: UseWayType) {
  if (key === 'hold') {
    modalState.apiVisible = true;
  } else {
    getGpuList(key);
  }
}

function chooseVersionActiveKey() {
  const { versionActiveKey: vak } = modalState;
  workGpuList.value = gpuList.value.filter((i) => (vak ? i.missionType === vak : true));
  // 切换需要重置 GPU 性能
  const gpuItem = workGpuList.value.map((i) => i).find((i: IWorkGpuListItem) => !i.isDisabled);
  modalState.gpuActiveVersion = gpuItem?.version || '';
  modalState.gpuDetail = gpuItem?.gpuDetail || ({} as IWorkGpuListItem['gpuDetail']);
  initGpuDragCardIndex();
}

function initGpuDragCardIndex() {
  if (webStore.isPc) {
    const index = workGpuList.value.findIndex((i) => i.version === modalState.gpuActiveVersion);
    if (index === -1) {
      gpuDragCardIndex.value = 0;
    } else {
      gpuDragCardIndex.value = index < 4 ? 0 : index;
    }
  } else {
    gpuDragCardIndex.value = 0;
  }
}

function chooseBillingType() {
  const { billingType: bt } = modalState;
  if (bt && showTimeBilling.value) {
    modalState.purchaseTime = purchaseTimes[bt].time[0];
  }
}

async function getGpuList(key: UseWayType) {
  modalState.useActiveKey = key;
  modalState.billingType = '';
  modalState.purchaseTime = undefined;
  await _getGpuList();
  chooseVersionActiveKey();
}

// 只用于获取 gpu 列表
async function _getGpuList() {
  const { useActiveKey: uak, activeKey } = modalState;
  const result = await getPrices({ mission_billing_type: uak, mission_category: activeKey });
  // mission_type 可能存在多个
  gpuList.value = (result.data || []).map((item: any) => {
    let {
      gpu_version: version,
      mission_type: missionType,
      is_deprecated: isDisabled,
      edges: gpuInfo,
      is_hot_gpu: isHotGpu,
    } = item;
    let type: GpuType = 'RTX',
      text = '';
    let temp = (['RTX', 'Ascend'] as GpuType[]).find((i) => RegExp(i).test(version));
    if (temp) {
      type = temp;
      text = version.split(temp)[1];
      // todo：让后端改
      if (text === '910ProB') text = '910';
    } else if (/^ComputilityKing-I/.test(version)) {
      type = 'ComputilityKing-I';
      // let temp = version.split('-')[1];
      // text = `算力王 ${temp}`;
      text = `天河三芯`;
    } else {
      type = 'NVIDIA';
      text = version;
    }
    let performType = gpuPerformance[version] || 's';
    let preformText = gpuPerformanceText[performType];
    let { cpu, memory, video_memory: videoMemory } = gpuInfo?.gpu || {};
    let gpuDetail = { cpu, memory, videoMemory };
    return { version, text, type, missionType, performType, preformText, isDisabled, gpuDetail, isHotGpu };
  });
}

async function getGpusPriceList() {
  const { activeKey: ak, useActiveKey: uak, versionActiveKey: vak } = modalState;
  let temp: MissionType['time'] | undefined = undefined;
  if (uak === 'time') {
    if (vak) {
      // JP
      temp = vak;
    } else if (ak) {
      // 目前大类除了 JP，其他只有唯一类型，即 SD、sd_time、sd_time_plan
      temp = `${ak.toLowerCase()}_time` as MissionType['time'];
    }
  }
  const types: MissionType['app'][] = temp ? [temp, `${temp}_plan`] : [];
  if (types.length === 0) return;
  const result = await getPrices({ mission_type: types });
  gpusPriceList.value = (result.data || []).map((item: any) => {
    let { gpu_version: version, cep, mission_type: missionType, mission_billing_type: mbt, original_cep } = item;
    let billingType = mbt === 'time' ? '' : mbt;
    let discount = ((cep / original_cep) * 10).toFixed(1);
    return { version, missionType, billingType, cep, discount };
  });
}

function getGpuItemClassName(item: IWorkGpuListItem) {
  const { version, isDisabled } = item;
  let temp = `${gpuPerformaceMapping[version]?.type}`;
  if (version === modalState.gpuActiveVersion) temp += ' active';
  if (isDisabled) temp += ' disabled';
  return temp;
}

function chooseGpu(item: IWorkGpuListItem) {
  const { version, isDisabled, gpuDetail } = item;
  if (isDisabled) return;
  modalState.gpuDetail = gpuDetail;
  modalState.gpuActiveVersion = version;
}

watch(
  [() => route.query, () => userStore.isLogining],
  ([{ tab }, is]) => {
    if (tab) {
      let temp = `${tab}`;
      let item = tabList.find((i) => i.key === temp);
      tabKey.value = item?.key || 'offical';

      // 未登录状态，访问社区镜像，跳转官方应用
      if (!is && tabKey.value !== 'offical') {
        router.replace({ path: '/aigc', query: { tab: 'offical' } });
      }
    } else {
      tabKey.value = 'offical';
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => userStore.isLogining,
  async (is) => {
    // 主要是从未登录 → 登录，记录一次 PV
    is && setPVBurialPoint();

    // 由于社区镜像针对部分用户公开
    await _getCategories();
    await _getAppGpuList();
  },
  { immediate: true, deep: true },
);

watch(
  [() => modalState.activeKey, () => modalState.useActiveKey, () => modalState.versionActiveKey],
  ([]) => {
    getGpusPriceList();
  },
  { immediate: true, deep: true },
);

watch(
  [() => missionStore.purchaseData, () => workAppList.value, () => appList.value],
  async ([data, list, apps]) => {
    if (!(list && apps && data)) return;
    let {
      activeKey: ak,
      useActiveKey: uak,
      gpuActiveVersion: gav,
      billingType,
      purchaseTime,
      automaticRenewal,
      detailMissionType: dmt,
    } = data;
    if (!ak) return;
    if (ak && (list.length === 0 || !list.includes(ak))) {
      message.info('当前选中的应用已下线！');
      missionStore.purchaseData = undefined;
      return;
    }
    const ways = useWays[ak];
    uak = ways.includes(uak) ? uak : ways[0];
    let vak: MissionType['time'] | undefined = undefined;
    appVersionList.value = undefined;
    const akItem = apps.find((i) => i.key === ak);
    if (akItem?.children) {
      let temp = /_time_plan/.test(dmt) ? dmt.slice(0, -5) : dmt;
      const cItem = akItem.children.find((i) => i.type === temp);
      if (cItem) {
        appVersionList.value = akItem.children;
        vak = cItem.type;
      }
    }

    Object.assign(modalState, { activeKey: ak, useActiveKey: uak, versionActiveKey: vak });
    await _getGpuList();
    workGpuList.value = gpuList.value.filter((i) => (vak ? i.missionType === vak : true));
    // 获取 gpu 性能和显存信息
    const workGpuArr = workGpuList.value.filter((i) => !i.isDisabled);
    const gpuItem = workGpuArr.find((i) => i.version === gav);
    if (!gpuItem) {
      if (workGpuArr[0]?.version) {
        message.info('当前选中的 GPU 性能已售罄，已换成可用的 GPU 性能！');
      } else {
        message.info('GPU 性能都已售罄！');
      }
    }
    gav = gpuItem?.version || workGpuArr[0]?.version || '';
    let gpuDetail = gpuItem?.gpuDetail || workGpuArr[0]?.gpuDetail || ({} as IWorkGpuListItem['gpuDetail']);
    Object.assign(modalState, { gpuActiveVersion: gav, gpuDetail, billingType, purchaseTime, automaticRenewal });
    modalState.visible = true;
    initDragCardIndex();
    initGpuDragCardIndex();
  },
  { immediate: true, deep: true },
);

async function makeMissions() {
  try {
    useLoading.value = true;
    const {
      activeKey,
      useActiveKey: uak,
      gpuActiveVersion: gav,
      billingType: bt,
      purchaseTime: pt,
      num,
      automaticRenewal: renewal,
    } = modalState;
    if (!activeKey) {
      message.error('请选择应用！');
    } else if (!uak) {
      message.error('请选择使用方式！');
    } else if (!gav) {
      message.error(workGpuList.value.length > 0 ? '请选择 GPU 性能！' : 'GPU 性能列表为空，请稍后再试！');
    } else if (!(num >= 1 && num <= CEP_MAX)) {
      message.error('请选择应用数量！');
    } else if (bt === undefined) {
      message.error('请选择计费方式！');
    } else if (bt && !pt) {
      message.error('请选择购买时长！');
    } else {
      const { currentMissionType: key } = sumState.value;
      if (!key) return;
      const { num: batch_size } = modalState;
      const hmacKey = userStore.getUserKey;
      if (!(key && hmacKey)) return;
      const data = {
        type: key,
        call_back_url: '',
        body: '',
        batch_size,
      };
      if (gav) Object.assign(data, { gpu_version: gav });
      if (bt) Object.assign(data, { billing_type: bt, buy_duration: pt, auto_renewal: renewal });
      const encodeResult = await encodeData(data, { 'Hmac-Key': hmacKey, URI: '/sd/v1/missions/batch' });
      if (encodeResult.code !== 20000) {
        message.error('预加密失败！');
        return;
      }
      const result = await createMissionsBatch(data, { 'Hmac-Key': hmacKey, Hmac: encodeResult.data });
      if (result.code === 20000) {
        // 更新右上角的任务列表数
        missionStore.countPossibleUsingMissions();
        closeVisible();
        message.success('创建成功！');
        missionStore.clickType = 'auto';
        router.push({ path: '/mission', query: { tab: 'running' } });
      } else if (result.code === 40001) {
        message.error('脑力值不足，请先购买！');
      }
    }
  } catch (err) {
    console.log('生成应用链接数量 fail', err);
  } finally {
    useLoading.value = false;
  }
}

function closeVisible() {
  Object.assign(modalState, defaultModalState);
  missionStore.purchaseData = undefined;
}

// 余额旁边的去购买 - 埋点
const nearBybalanceGotoRecharge = () => {
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_recharge_2',
    body: { phone: userStore.userInfo?.phone, balance: balanceStore.showValue },
  });
};

// 余额不足的去购买 - 埋点
const cantUseGotoRecharge = () => {
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_recharge_3',
    body: { phone: userStore.userInfo?.phone, balance: balanceStore.showValue },
  });
};

function clickGotoRecharge(hasPrev: boolean = true) {
  modalState.visible = false;
  modalState.hasPrevStep = hasPrev;
  rechargeRef.value?.clickRecharge();
}

function clickRechargeBack() {
  modalState.visible = true;
}

async function _getCategories() {
  // spinning.value = true;
  // const result = await getCategories();
  // workAppList.value = (result.data || []).map((item: any) => item.mission_category);
  // // todo：手动添加
  // workAppList.value?.push('H100_SERVER');
  // spinning.value = false;
  const res = await getProductList({ page_index: 1, page_size: 100 });
  const list = res.data.list;
  console.log('list', list);
  workAppList.value = list;
}

async function _getAppGpuList() {
  const apps = workAppList.value;
  if (apps?.length === 0) {
    workAppGpuList.value = undefined;
    return;
  }
  const result = await getPrices({ mission_billing_type: 'time' });
  let arr: Partial<{ [key in CategoryType]: string[] }> = { SD: [], JP: [], WT: [], SSH: [] }; // 这里可不填已有的应用类别，已做兼容
  (result.data || []).forEach((item: any) => {
    let { gpu_version: version, mission_category: key, is_deprecated: isDisabled } = item;
    let text = getGpuVersionText(version);
    if (!isDisabled && apps?.includes(key) && !arr[key as CategoryType]?.includes(text)) {
      arr[key as CategoryType]?.push(text) || (arr[key as CategoryType] = [text]);
    }
  });
  // todo：手动添加
  arr['H100_SERVER'] = [getGpuVersionText('H100')];
  workAppGpuList.value = arr;
}

function setPVBurialPoint() {}

onMounted(() => {
  userStore.isLogining && setPVBurialPoint();
});
</script>

<style lang="less" scoped>
section.aigc-index {
  overflow: hidden;
}

@horizontal-padding: 1.5rem;
@app-list-item-min-width: 24.625rem;
@app-list-item-show-width: 24.625rem;

@mobile-horizontal-padding: 1.5rem;
@mobile-app-list-item-min-width: 13.75rem;
@mobile-app-list-item-show-width: 20.4375rem;
@app-list-gap: 1.5rem;

.aigc-index {
  .aigc-index-content {
    padding: @horizontal-padding;
    height: 100%;
    overflow: auto;

    :deep(.nav-bar) {
      padding-left: 0;
      padding-right: 0;
    }

    .banner-item {
      img {
        width: 100%;
        height: auto;
        border-radius: 0.375rem;
      }
    }

    :deep(.slick-slider) {
      .slick-dots {
        bottom: 1rem;

        li {
          width: 1.875rem;
          height: 0.375rem;
          background: #ffffff;
          border-radius: 0.1875rem;
          opacity: 0.5;

          button {
            height: fit-content;
            background: inherit;
          }

          &.slick-active {
            opacity: 1;
          }
        }
      }
    }
  }

  .titles {
    .flex-mode(row, space-between);
    margin: 2.5rem 0 2rem;
    height: 2rem;

    > div {
      .flex-mode(row, flex-start);
      gap: 2.5rem;

      h1 {
        position: relative;
        font-size: 1.25rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: @color-text-secondary;
        line-height: 1.75rem;
        transition: color 0.3s;
        cursor: pointer;

        &:hover,
        &.active {
          color: #ffffff;
        }

        &.active::after {
          width: calc(100% - 1rem);
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -0.625rem;
          left: 50%;
          width: 0rem;
          height: 0.125rem;
          background: #8e50ff;
          border-radius: 0.0625rem;
          transform: translateX(-50%);
          transition: width 0.3s;
        }
      }
    }

    button {
      font-size: 0.875rem;
    }
  }

  .classfify {
    .flex-mode(row, flex-start);
    flex-wrap: wrap;
    gap: 0.75rem 3.5rem;
    margin-bottom: 1.5rem;
    padding: 0 1.625rem;

    span {
      position: relative;
      z-index: 1;
      height: 2rem;
      font-size: 0.875rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
      line-height: 2rem;
      cursor: pointer;
      transition: color 0.3s;

      &::after {
        content: '';
        position: absolute;
        z-index: -1;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: calc(100% + 2rem);
        height: 2rem;
        border-radius: 0.25rem;
        transition: background 0.3s;
      }

      &:hover {
        color: #ffffff;
      }

      &.active {
        color: #ffffff;

        &::after {
          background: #793aea;
        }
      }
    }
  }

  .app-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: @app-list-gap;
    margin-top: 1.5rem;

    &-item {
      .flex-mode(column, space-between, stretch);
      padding: 0.75rem 0.75rem 1.5rem;
      min-width: @app-list-item-min-width;
      min-height: 22.25rem;
      background: #313131;
      border-radius: 0.375rem;

      &.unused {
        padding-bottom: 0;

        .intro-img {
          &::after {
            z-index: 0;
          }

          .item-img {
            -webkit-filter: grayscale(85%) brightness(70%);
            filter: grayscale(85%) brightness(70%);
            pointer-events: none;
          }
        }
      }

      .intro-img {
        position: relative;
        z-index: 1;
        .flex-mode(column, flex-end, center);
        width: 100%;
        height: 18.5rem;
        overflow: hidden;
        border-radius: 0.375rem;

        &::after {
          content: '';
          position: absolute;
          z-index: -1;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%);
        }

        .item-img {
          position: absolute;
          z-index: -2;
          top: 0;
          width: 100%;
          transition: all 0.5s;

          > img {
            width: 100%;
          }
        }

        .title {
          margin-bottom: 0.25rem;
          white-space: nowrap;
          font-size: 1.25rem;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.75rem;
        }

        .describe {
          margin-bottom: 0.75rem;
          width: calc(100% - 2.5rem);
          font-size: 0.875rem;
          font-family:
            PingFangSC-Regular,
            PingFang SC;
          font-weight: 400;
          color: @color-text-secondary;
          line-height: 1.25rem;
          text-align: center;
        }
      }

      .choose-gpu-wrapper {
        .flex-mode;
        margin: 1.5rem 0;
        min-height: 4.25rem;

        .choose-gpu {
          .flex-mode(row, flex-start, stretch);

          .title {
            width: 5.0625rem;
            height: 100%;
            white-space: nowrap;
            font-size: 0.875rem;
            font-family:
              PingFangSC-Regular,
              PingFang SC;
            font-weight: 400;
            color: #ffffff;
            line-height: 1.75rem;
          }

          .gpus-container {
            flex: 1;
            .flex-mode(row, flex-start, flex-start);
            flex-wrap: wrap;
            gap: 0.75rem;

            button {
              padding: 0 0.375rem;
              width: 5.5rem;
              height: 1.75rem;
              background: linear-gradient(225deg, #ffffff 0%, #bababa 100%);
              border-radius: 0.25rem;
              .flex-mode();

              > span {
                white-space: nowrap;
                font-size: 0.875rem;
                font-family:
                  PingFangSC-Medium,
                  PingFang SC;
                font-weight: 500;
                color: #313131;
                line-height: 1.25rem;
              }
            }
          }
        }
      }

      .tip-text {
        height: 1.25rem;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        color: @color-text-secondary;
        line-height: 1.25rem;
        text-align: center;
      }

      .disabled-btn {
        flex: 1;
        .flex-mode;

        button {
          width: 9.125rem;
          height: 3.375rem;
          background: #3c3c3c;
          border-radius: 0.375rem;
          border-color: transparent;
        }
      }
    }

    .used-img {
      &:hover {
        .item-img {
          transform: scale(1.1);
        }
      }
    }
  }

  .none-app {
    .flex-mode(column);
    margin-top: 1.5rem;
    color: @color-text-secondary;

    img {
      margin-bottom: 1rem;
      width: 6.25rem;
    }
  }

  &-mobile {
    .aigc-index-content {
      padding: @mobile-horizontal-padding;

      :deep(.slick-slider) {
        .slick-dots {
          bottom: 0.75rem;

          li {
            width: 0.9375rem;
            height: 0.1875rem;
            border-radius: 0.125rem;
          }
        }
      }
    }

    .titles {
      margin: 1.5rem 0 1.75rem;

      > div {
        gap: 2rem;

        h1 {
          font-size: 1rem;
          line-height: 1.375rem;

          &.active::after {
            width: calc(100% - 1.375rem);
          }
        }
      }
    }

    .classfify {
      gap: 0.25rem 2rem;
      margin-bottom: 0.75rem;
      padding: 0 0.75rem;

      span {
        height: 1.5625rem;
        font-size: 0.75rem;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.65);
        line-height: 1.5625rem;

        &::after {
          width: calc(100% + 1.5rem);
          height: 1.5625rem;
        }
      }
    }

    .app-list {
      &-item {
        padding: 0.625rem 0.625rem 1rem;
        // width: @mobile-app-list-item-show-width;
        min-width: @mobile-app-list-item-min-width;
        min-height: 23.5625rem;

        .intro-img {
          height: 15.3125rem;

          .title {
            margin-bottom: 0.125rem;
            height: 1.375rem;
            font-size: 1rem;
            line-height: 1.375rem;
          }

          .describe {
            font-size: 0.75rem;
            line-height: 1.0625rem;
          }
        }

        .choose-gpu-wrapper {
          margin: 1rem 0;
          min-height: 3.625rem;

          .choose-gpu {
            .title {
              width: 4.375rem;
              font-size: 0.75rem;
              line-height: 1.5rem;
            }

            .gpus-container {
              gap: 0.4375rem;

              button {
                width: 4.625rem;
                height: 1.5rem;
                border-radius: 0.1875rem;

                > span {
                  font-size: 0.75rem;
                }
              }
            }
          }
        }

        .tip-text {
          height: 1rem;
          font-size: 0.75rem;
          line-height: 1rem;
        }

        .disabled-btn {
          button {
            width: 6.5rem;
            height: 2.5rem;
          }
        }
      }
    }

    .stamp-text {
      top: 0.125rem;
      left: 0.6875rem;
      width: 4.375rem;
      height: 4.375rem;

      span {
        font-size: 0.75rem;
        line-height: 1.0625rem;
      }
    }
  }
}

.stamp-text {
  .flex-mode;
  position: absolute;
  top: 0.25rem;
  left: 0.9375rem;
  padding-top: 0.25rem;
  width: 4.75rem;
  height: 4.75rem;
  background: url(@/assets/img/aigc/communityApp/stamp-icon.png) center / 100% no-repeat;

  span {
    font-size: 0.875rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.25rem;
    white-space: nowrap;
  }
}

.create-content-container {
  height: 29.3125rem;

  .app-item {
    .flex-mode(column, flex-start, center);
    margin-right: 0.75rem;
    padding: 0 1rem;
    width: 14.5rem;
    height: 17rem;
    background: #3c3c3c;
    border-radius: 0.375rem;
    border: 0.125rem solid transparent;
    transition: border 0.3s;

    &.chosen {
      border: 0.125rem solid @color-primary;
    }

    &:hover:not(.chosen) {
      .img {
        img {
          transform: scale(1.1);
        }
      }
    }

    .img {
      position: relative;
      margin-top: 1rem;
      width: 12.5rem;
      height: 10rem;
      overflow: hidden;
      border-radius: 0.125rem;

      img {
        width: 100%;
        height: 100%;
        transition: transform 0.4s;
      }

      .stamp-text {
        top: 0rem;
        left: 0rem;
        padding-top: 0.125rem;
        width: 4.375rem;
        height: 4.375rem;

        span {
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }
      }
    }

    .name {
      margin-top: 1rem;
      font-size: 1rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      line-height: 1.375rem;
      color: white;
      text-align: center;
      white-space: pre;
    }

    .describe {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: @color-text-secondary;
      line-height: 1.0625rem;
      text-align: center;
    }
  }

  .gpu-list {
    :deep(.gpu-item) {
      .list-item-hover-container(0.375rem, 0.25rem, 0.25rem);
      padding: 1rem 0;
      width: 9.375rem;
      height: 10.1875rem;
      border-radius: 0.375rem;
      text-align: center;
      cursor: pointer;

      .hover-bg {
        background: #3c3c3c;
        border-width: 0;
        transition:
          width 0.2s,
          height 0.2s,
          border-color 0.2s;
        overflow: hidden;
      }

      .hot-icon {
        position: absolute;
        top: 1.25rem * sin(45deg);
        left: calc(100% - 1.25rem * sin(45deg));
        width: 100%;
        height: 1.0625rem;
        font-size: 0.75rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.0625rem;
        background: @color-primary;
        transform-origin: 0 0;
        transform: rotate(45deg) translate(-50%, -50%);
      }

      .sold-out {
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;

        img {
          width: 6.25rem;
          height: 6.25rem;
        }
      }

      &.disabled {
        cursor: auto;

        .sold-out {
          .flex-mode;
        }

        .item-content {
          filter: opacity(0.25);
        }

        p {
          background: linear-gradient(270deg, #ffffff 1%, #ffffff 100%);
          .bg-clip-text-color;
        }

        .line::after {
          width: 100%;
        }
      }

      .img {
        margin: 0 auto;
        width: 7.25rem;
        height: 3.75rem;
        background: url(@/assets/img/aigc/gpu/back.png) center/100% no-repeat;

        img {
          width: 100%;
          height: 100%;
        }
      }

      h6 {
        margin: 0.5rem 0 0.375rem;
        height: 1.875rem;
        font-size: 1.375rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.875rem;
      }

      p {
        margin-bottom: 0.625rem;
        height: 1.0625rem;
        font-size: 0.75rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        line-height: 1.0625rem;
        background: linear-gradient(270deg, #9f69ff 1%, #e378ff 100%);
        .bg-clip-text-color;
      }

      @line-after-width-xxxl: 100%;
      @line-after-width-xxl: 6.5rem;
      @line-after-width-xl: 5.625rem;
      @line-after-width-l: 5.1875rem;
      @line-after-width-king-I: 4.3125rem;
      @line-after-width-m: 3.4375rem;
      @line-after-width-s: 2.5625rem;

      .line-after-animation(@name: line-after, @active-width: 7.375rem, @func: cubic-bezier(0.1, 0.6, 0.2, 0)) {
        animation: @name 1s @func;

        @keyframes @name {
          0% {
            width: 100%;
          }

          80%,
          100% {
            width: calc(100% - @active-width);
          }

          90% {
            width: calc(100% - @active-width - 0.4375rem);
          }
        }
      }

      .line {
        position: relative;
        margin: 0 auto;
        width: 7.375rem;
        height: 0.125rem;

        span {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(
            270deg,
            rgba(255, 63, 63, 1),
            rgba(255, 103, 23, 1),
            rgba(255, 232, 154, 1),
            rgba(187, 255, 154, 1)
          );
          background-size: 100% 100%;
          background-repeat: no-repeat;
          z-index: 1;
        }

        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        &::before {
          z-index: 3;
          background-image: linear-gradient(to right, transparent 0.375rem, #313131 0.0625rem);
          background-size: 0.4375rem 100%;
        }

        &::after {
          z-index: 2;
          left: auto;
          right: 0;
          background-color: #979797;
          width: 0;
          min-width: 0;
          max-width: 100%;
        }
      }

      &:not(.disabled) {
        cursor: pointer;

        &:hover,
        &.active {
          .img {
            background: url(@/assets/img/aigc/gpu/back-light.gif) center/100% no-repeat;
          }
        }

        &.xxxl {
          &:hover {
            .line::after {
              .line-after-animation(after-xxxl, @line-after-width-xxxl, ease-in-out);
            }
          }
        }

        &.xxl {
          p {
            background: linear-gradient(270deg, @color-primary 0%, #ffffff 100%);
            .bg-clip-text-color;
          }

          .line::after {
            width: calc(100% - @line-after-width-xxl);
          }

          &:hover {
            .line::after {
              .line-after-animation(after-xxl, @line-after-width-xxl);
            }
          }
        }

        &.xl {
          p {
            background: linear-gradient(270deg, #4a3aea 0%, #ffffff 100%);
            .bg-clip-text-color;
          }

          .line::after {
            width: calc(100% - @line-after-width-xl);
          }

          &:hover {
            .line::after {
              .line-after-animation(after-xl, @line-after-width-xl);
            }
          }
        }

        &.l {
          p {
            background: linear-gradient(270deg, #3a80ea 0%, #ffffff 100%);
            .bg-clip-text-color;
          }

          .line::after {
            width: calc(100% - @line-after-width-l);
          }

          &:hover {
            .line::after {
              .line-after-animation(after-l, @line-after-width-l);
            }
          }
        }

        &.king-I {
          p {
            background: linear-gradient(270deg, #3aaeea 0%, #ffffff 100%);
            .bg-clip-text-color;
          }

          .line::after {
            width: calc(100% - @line-after-width-king-I);
          }

          &:hover {
            .line::after {
              .line-after-animation(after-king-I, @line-after-width-king-I);
            }
          }
        }

        &.m {
          p {
            background: linear-gradient(270deg, #3aeab5 0%, #ffffff 100%);
            .bg-clip-text-color;
          }

          .line::after {
            width: calc(100% - @line-after-width-m);
          }

          &:hover {
            .line::after {
              .line-after-animation(after-m, @line-after-width-m);
            }
          }
        }

        &.s,
        &.xs {
          p {
            background: linear-gradient(270deg, #77ff96 0%, #ffffff 100%);
            .bg-clip-text-color;
          }

          .line::after {
            width: calc(100% - @line-after-width-s);
          }

          &:hover {
            .line::after {
              .line-after-animation(after-s, @line-after-width-s);
            }
          }
        }
      }
    }

    :deep(.towards) {
      button:not(:disabled) {
        background: #3c3c3c;
      }
    }
  }

  .gpu-detail {
    padding: 0 1.5rem;
    width: 100%;
    height: 5.125rem;
    background: #3c3c3c;
    border-radius: 0.375rem;
    .flex-mode(row, space-between);

    .item {
      width: 3.1875rem;
      height: 3.625rem;
      gap: 0.625rem;
      .flex-mode(column);

      font-size: 0.875rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: @color-text-secondary;
      line-height: 1.25rem;
    }

    .data {
      white-space: nowrap;

      > span {
        font-size: 1.375rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.875rem;
      }
    }
  }

  .choose-number {
    .flex-mode(row, flex-start, center);
    gap: 0.5rem;

    button {
      .flex-mode;
      padding: 0;
      width: 2rem;
      height: 2rem;
      background: #3c3c3c;
      border-radius: 0.125rem;
      border: 0.0625rem solid #636363;

      &.disabled {
        filter: opacity(0.4);
      }

      > img {
        width: 0.75rem;
        height: 0.75rem;
      }
    }

    .number {
      width: 3.4375rem;
      height: 2rem;
      background: #3c3c3c;
      border-radius: 0.125rem;
      border: 0.0625rem solid #636363;

      :deep(input) {
        text-align: center;
      }
    }
  }

  .choose-way {
    .flex-mode(row, space-between, center);
    gap: 0.75rem;

    .way-item {
      .flex-mode(column);
      .list-item-hover-container(0.375rem, 0.25rem, 0.25rem, #3c3c3c);
      width: 24.6875rem;
      height: 7.5rem;
      border-radius: 0.375rem;

      .name {
        .flex-mode;
        margin-bottom: 0.375rem;

        > img {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.5rem;
        }

        > span {
          font-size: 1.375rem;
          font-family:
            PingFangSC-Medium,
            PingFang SC;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.875rem;
        }
      }

      .describe {
        font-size: 0.875rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        color: #ffffff;
        line-height: 1.25rem;
      }
    }
  }
}

// pc 端：列
.set-pc-column(@n: 5, @item-width: @app-list-item-show-width, @gap: @app-list-gap, @horizontal-paddings: @horizontal-padding * 2) {
  @media (max-width: calc(@sidebar-collapsed-width + @item-width * (@n + 1) + @gap * @n + @horizontal-paddings + 0.0625rem)) {
    .aigc-index {
      .app-list {
        grid-template-columns: repeat(@n, 1fr);
      }
    }
  }

  @media (max-width: calc(@sidebar-width + @item-width * (@n + 1) + @gap * @n + @horizontal-paddings + 0.0625rem)) {
    body:not(.is-collapsed) {
      .aigc-index {
        .app-list {
          grid-template-columns: repeat(@n, 1fr);
        }
      }
    }
  }
}

.set-pc-column(5);
.set-pc-column(4);
.set-pc-column(3);
.set-pc-column(2);
.set-pc-column(1);

// 移动端：列
.set-mobile-column(@n: 1, @item-width: @mobile-app-list-item-show-width, @gap: @app-list-gap, @horizontal-paddings: @mobile-horizontal-padding * 2) {
  @media (max-width: calc(@item-width * (@n + 1) + @gap * @n + @horizontal-paddings + 0.0625rem)) {
    // 加 body.is-mobile 是因为上面 pc 端的样式会覆盖掉移动端的样式
    body.is-mobile {
      .aigc-index-mobile {
        .app-list {
          grid-template-columns: repeat(@n, 1fr);
        }
      }
    }
  }
}

.set-mobile-column(5);
.set-mobile-column(4);
.set-mobile-column(3);
.set-mobile-column(2);
.set-mobile-column(1);
</style>

<style lang="less">
.aigc-choose-mobile {
  .create-content-container {
    .choose-way {
      justify-content: center;
      gap: 0.75rem;

      .way-item {
        flex: 1;
        width: 9.8125rem;
        height: 5.9375rem;
        text-align: center;
        .flex-mode(column, flex-start, center);

        .name {
          margin-top: 1.5rem;

          > img {
            width: 1.25rem;
            height: 1.25rem;
            margin-right: 0.5rem;
          }

          > span {
            font-size: 1rem;
            line-height: 1.375rem;
          }
        }

        .describe {
          padding: 0 0.5rem;
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }
      }
    }

    .not-pc-gpu-list {
      margin-top: 0.75rem;
      margin-bottom: 1.5rem;
      .flex-mode(row, flex-start);
      flex-wrap: wrap;
      gap: 0.75rem;

      .gpu-item {
        overflow: hidden;
      }
    }
  }
}
</style>
