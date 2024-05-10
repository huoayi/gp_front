<template>
  <component
    v-if="cardList.length > 0"
    :is="hasTowards ? DragCard : 'div'"
    class="choose-card"
    :class="{ 'has-towards': hasTowards }"
    v-bind="
      hasTowards
        ? {
            containerId: 'choose-list-container',
            containerStyle: { padding: '.375rem' },
            ...dragCardAttrs,
          }
        : {}
    "
  >
    <component :is="hasTowards ? SwiperSlide : 'div'" v-for="(item, index) in cardList">
      <div
        class="list-item"
        :class="{
          active: state.currentIndex === index,
          'cursor-pointer': item.type === 'text',
          'list-item-custom': item.type === 'custom',
          'has-custom-value': item.type === 'custom' && showCustomData.text,
        }"
        :style="hasTowards ? { margin: `0 ${toRem(towardListItemSpacing)} 0 0` } : {}"
        @click="clickItem(index)"
      >
        <div class="hover-bg" v-if="item.type !== 'custom-perch'">
          <div class="tag-icon" v-if="item.type === 'text' && recommendIndex === index">
            <img src="@/assets/img/recharge/recommend.png" />
            <span>推荐</span>
          </div>
          <div
            class="tag-icon"
            :class="{ 'hot-icon': item.iconType === 'hot' }"
            v-else-if="item.type === 'text' && item.giftValue"
          >
            <template v-if="item.iconType === 'hot'">
              <img src="@/assets/img/recharge/hot.png" />
              <span>赠送 {{ item.giftValue }}%</span>
            </template>
            <template v-else-if="item.iconType === 'new-user'">
              <img src="@/assets/img/recharge/new-user.png" />
              <span>新用户赠送 {{ item.giftValue }}%</span>
            </template>
            <template v-else>
              <img src="@/assets/img/recharge/gift.png" />
              <span>赠送</span>
            </template>
          </div>
          <div class="tag-icon" v-else-if="item.type === 'custom'">
            <img src="@/assets/img/recharge/edit.png" />
            <span>自定义</span>
          </div>
        </div>
        <template v-if="item.type === 'text'">
          <img class="cep-img" src="@/assets/img/recharge/cep-large.png" />
          <p class="show-text" :class="{ 'show-after-gift': item.giftText }">{{ item.text }} 脑力值</p>
          <p class="gift-text" v-if="item.giftText">+{{ item.giftText }} 脑力值</p>
          <p class="price-value">
            <span>¥&nbsp;</span>
            <span>{{ item.value }}</span>
          </p>
        </template>
        <template v-else-if="item.type === 'custom'">
          <div class="custom-img-text">
            <img class="cep-img" src="@/assets/img/recharge/cep-large.png" />
            <div class="right" v-if="showCustomData.text">
              <p class="show-text">{{ showCustomData.text }} 脑力值</p>
              <p class="gift-text" v-if="showCustomData.giftText">+{{ showCustomData.giftText }} 脑力值</p>
            </div>
          </div>
          <InputNumber
            class="custom-input"
            v-model:value="state.customValue"
            :controls="false"
            placeholder="¥ 1 ～ 50000"
            :min="1"
            :max="50000"
            @press-enter="clickCustomItem(index)"
          />
          <Button type="primary" @click="clickCustomItem(index)">确 认</Button>
        </template>
      </div>
    </component>
  </component>
</template>

<script setup lang="ts">
import { Button, InputNumber, message } from 'ant-design-vue';
import { ref, onMounted, reactive, onUnmounted, computed, watch, nextTick } from 'vue';
import { setStorage, transferRMBToCep, toRem, getGiftPercent } from '@/utils/common';
import type { IRechargeStorageData, IRechargeListItem as IListItem, IGiftRuleItem } from '@/interface/common';
import { useWebStore } from '@/stores/web';
import { getRechargeRuleList } from '@/api/payment';
import { useUserStore } from '@/stores/user';
import { SwiperSlide } from 'swiper/vue';
import DragCard, { type IDragCardProps } from '../SingleLineDragCard.vue';
import { useConfigurationStore } from '@/stores/configuration';

const userStore = useUserStore();
const webStore = useWebStore();
const configStore = useConfigurationStore();

interface IProps {
  hasTowards?: boolean;
  hasCustomizeNum?: boolean;
  recommendIndex?: number;
  list: IListItem[]; // todo：第一个卡片买 100 送 400，目前由前端控制显示，后面出代金卷时删掉
  initialIndex?: number;
  storageName: string; // 用于刷新时缓存数据，注意：请保证项目中名称唯一性
  needInitRules?: boolean; // 是否需要初始化购买优惠规则
  dragCardAttrs?: IDragCardProps;
}
const props = withDefaults(defineProps<IProps>(), {
  hasTowards: false,
  hasCustomizeNum: true,
  recommendIndex: -1,
  initialIndex: 0,
  needInitRules: true,
});
const emit = defineEmits<{
  (event: 'itemClick', value: number, giftValue: number, isHot?: boolean): void;
}>();
type CardItem =
  | {
      type: 'text';
      value: number;
      text: string;
      giftValue: number;
      giftText: string;
      isHot?: boolean;
      iconType?: IListItem['iconType'];
    }
  | { type: 'custom' | 'custom-perch' };
const cardList = computed((): CardItem[] => {
  const rules = giftRules.value;
  if (rules === undefined) return [];
  const { hasCustomizeNum, list, hasTowards } = props;
  let temp: CardItem[] = [];
  (list || []).forEach((item) => {
    let { value, giftPercent: customPercent, iconType } = item;
    let text = transferRMBToCep(value);
    let giftPercent = userStore.isActivityExist ? customPercent || getGiftPercent(value, rules) : 0;
    if (giftPercent) {
      let giftValue = (value * giftPercent) / 100;
      let giftText = transferRMBToCep(giftValue);
      let isHot = configStore.isSpring ? true : !!customPercent; // is_active
      // 活动卡片保持购买金额唯一且显示最大赠送金额
      const index = temp.findIndex((i) => i.type === 'text' && i.value === value && i.giftValue);
      if (index !== -1) {
        const hasItem = temp[index];
        if (hasItem.type === 'text' && giftValue > hasItem.giftValue) {
          temp[index] = { type: 'text', value, text, giftValue, giftText, isHot, iconType };
        }
      } else {
        temp.push({ type: 'text', value, text, giftValue, giftText, isHot, iconType });
      }
    } else {
      temp.push({ type: 'text', value, text, giftValue: 0, giftText: '' });
    }
  });
  if (hasCustomizeNum) {
    temp.push({ type: 'custom' });
    if (hasTowards) {
      temp.push({ type: 'custom-perch' });
    }
  }
  return temp;
});
const state = reactive({
  currentIndex: 0,
  customValue: '',
});
const towardListItemSpacing = computed(() => {
  return webStore.isPc ? 24 : 8; // px
});
const showCustomData = computed(() => {
  if (state.customValue) {
    let val = Number(state.customValue);
    let text = transferRMBToCep(val);
    let giftPercent = getGiftPercent(val, giftRules.value || []);
    if (giftPercent) {
      let giftValue = (val * giftPercent) / 100;
      let giftText = transferRMBToCep(giftValue);
      return { text, giftValue, giftText, isHot: configStore.isSpring };
    } else {
      return { text, giftValue: 0, giftText: '' };
    }
  } else {
    return { text: '', giftValue: 0, giftText: '' };
  }
});
// 购买优惠
const giftRules = ref<IGiftRuleItem[]>();

watch(
  [() => props.initialIndex, cardList],
  ([index, list]) => {
    if (!(list && list.length > 0)) return;
    nextTick(() => {
      console.log('这里刷新 initial index', index);
      changeChooseData(index, list[index]?.type === 'custom' ? '1' : '', false);
    });
  },
  { immediate: true, deep: true },
);

async function _getRechargeRuleList() {
  if (giftRules.value) return giftRules.value;
  if (userStore.isActivityExist) {
    if (configStore.isSpring) {
      giftRules.value = [
        { giftPercent: 100, min: 100, max: 1000 },
        { giftPercent: 150, min: 1000, max: Infinity },
      ];
    } else {
      const result = await getRechargeRuleList();
      if (result.code === 20000) {
        giftRules.value = result.data.map((item: any) => {
          let { gift_percent: giftPercent, little_value: min, large_value: max } = item;
          return { giftPercent, min, max };
        });
      } else {
        giftRules.value = [];
        message.error('获取购买优惠规则失败！');
      }
    }
    return giftRules.value || [];
  } else {
    giftRules.value = [];
    return [];
  }
}

function clickItem(index: number) {
  const item = cardList.value[index];
  if (item.type === 'text' && state.currentIndex !== index) {
    changeChooseData(index);
    emit('itemClick', item.value, item.giftValue, item.isHot);
  }
}

function clickCustomItem(index: number) {
  if (state.customValue) {
    changeChooseData(index, state.customValue);
    let value = Number(state.customValue);
    const { giftValue, isHot } = showCustomData.value;
    emit('itemClick', value, giftValue, isHot);
  } else {
    message.error('请输入购买金额！');
  }
}

function saveChooseData() {
  // 保存购买选择数据
  const { storageName } = props;
  if (!storageName) return;
  const { currentIndex: index, customValue } = state;
  const temp: IRechargeStorageData['choose'] = { index, customValue };
  setStorage({ name: storageName, data: temp });
}

function changeChooseData(index: number, customValue?: string, isSave: boolean = true) {
  if (index === state.currentIndex) return;
  if (index < 0) {
    if (cardList.value[state.currentIndex]?.type === 'custom') {
      state.customValue = '';
    }
    state.currentIndex = -1;
  } else {
    state.currentIndex = index;
    if (typeof customValue !== 'undefined') {
      state.customValue = customValue;
    }
  }
  isSave && saveChooseData();
}

export interface IChooseExpose {
  changeChooseData: (index: number, customValue?: string) => void;
  getRechargeRules: () => Promise<IGiftRuleItem[]>;
}

defineExpose<IChooseExpose>({
  changeChooseData,
  getRechargeRules: _getRechargeRuleList,
});

onMounted(async () => {
  const { needInitRules } = props;
  if (needInitRules) await _getRechargeRuleList();
});

onUnmounted(() => {
  state.currentIndex = 0;
  state.customValue = '';
});
</script>

<style lang="less" scoped>
.choose-card {
  .flex-mode(row, flex-start);
  flex-wrap: wrap;
  background: inherit;

  .list-item {
    .flex-mode(column, flex-start);
    .list-item-hover-container();
    margin: 0 1.25rem 1.25rem 0;
    min-width: 11.25rem;
    width: 11.25rem;
    height: 12.25rem;
    transition: border 0.3s;

    &-custom {
      transition: all 1s;

      * {
        transition: all 1s;
      }
    }

    .cep-img {
      max-width: 3.75rem;
      width: 3.75rem;
      height: 3.75rem;
    }

    > img {
      margin-top: 2rem;
    }

    .show-text {
      margin: 0.125rem 0 0.5rem;
      height: 2.3125rem;
      font-size: 1.625rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 2.3125rem;
      white-space: nowrap;

      &.show-after-gift {
        margin: 0.125rem 0 0.25rem;
      }
    }

    .gift-text {
      margin-bottom: 0.375rem;
      height: 1.25rem;
      font-size: 0.875rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: @color-info;
      line-height: 1.25rem;
    }

    .price-value {
      font-size: 1rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: @color-text-secondary;
      line-height: 1.0625rem;

      span:nth-child(1) {
        font-size: 0.75rem;
      }
    }

    &.has-custom-value {
      width: 18.5625rem;
    }

    .custom-img-text {
      .flex-mode;
      margin-top: 2rem;
      height: 3.75rem;

      .right {
        margin-left: 0.625rem;
        transition: all 1s;

        .show-text {
          margin: 0;
        }

        .gift-text {
          margin: 0.125rem 0 0;
        }
      }
    }

    .custom-input {
      margin: 0.625rem 0;
      width: 7.625rem;
      height: 2rem;
      background: #3c3c3c;
      border-radius: 0.125rem;
      font-size: 0.875rem;

      :deep(input) {
        text-align: center;
      }
    }

    .tag-icon {
      position: absolute;
      top: -0.0625rem;
      left: -0.0625rem;
      .flex-mode;
      padding: 0 0.625rem 0 0.5rem;
      height: 1.5625rem;
      background: @color-primary;
      border-radius: 0.375rem 0rem 0.8125rem 0rem;

      &.hot-icon {
        padding: 0 0.625rem 0 0.3125rem;
        img {
          margin-right: 0.1875rem;
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      img {
        margin-right: 0.3125rem;
        width: 0.9375rem;
        height: 0.9375rem;
      }

      span {
        height: 1.25rem;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.25rem;
      }
    }
  }
}

.is-mobile {
  .choose-card {
    .list-item {
      .list-item-hover-container(0.625rem, 0rem, 0rem);
      margin: 0 0.5rem 0.5rem 0;
      min-width: 9.9375rem;
      width: 9.9375rem;
      height: 11.5rem;
      background: #313131;
      border-radius: 0.375rem;

      .show-text {
        height: 1.375rem;
        font-size: 1rem;
        line-height: 1.375rem;
      }

      .price-value {
        height: 1.375rem;
        font-size: 1rem;
        line-height: 1.375rem;

        span:nth-child(1) {
          font-size: 0.75rem;
        }
      }

      .custom-input {
        width: 7.5rem;
        height: 1.5rem;
        font-size: 0.75rem;

        :deep(input) {
          height: 1.375rem;
        }
      }

      button {
        width: 4.75rem;
        font-size: 0.75rem;
      }

      .tag-icon {
        img {
          margin-right: 0.25rem;
          width: 0.6875rem;
          height: 0.75rem;
        }

        span {
          height: 1.0625rem;
          font-size: 0.75rem;
          line-height: 1.0625rem;
        }
      }
    }

    &:not(.has-towards) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;

      .list-item {
        margin: 0;
        min-width: auto;
        width: auto;
      }
    }
  }
}
</style>
