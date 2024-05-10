<template>
  <Input.Group class="search-bar" compact v-if="showSearch">
    <Select
      v-model:value="state.key"
      class="select-field prefix-select"
      @change="changePrefix"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      :dropdown-match-select-width="false"
    >
      <Select.Option
        v-for="item in prefixData"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :type="item.type"
        :itemOptions="item.options"
      >
        {{ item.label }}</Select.Option
      >
    </Select>
    <template v-if="middle">
      <Input
        v-if="middle.type === 'input'"
        v-model:value="state.value"
        class="input-field input-value"
        :placeholder="`请输入要搜索的${state.label}`"
        autocomplete="off"
        allow-clear
        @press-enter="clickSearch"
      />
      <date-picker
        v-else-if="middle.type === 'datepicker'"
        v-model:value="state.value"
        class="input-field input-value"
        show-time
        format="YYYY-MM-DD HH"
        :disabled-date="pickerDisabled"
        :get-popup-container="(triggerNode) => triggerNode.parentNode as any"
      ></date-picker>
      <range-picker
        v-else-if="middle.type === 'rangepicker'"
        v-model:value="state.value"
        class="input-field picker-value"
        show-time
        format="YYYY-MM-DD HH"
        :disabled-date="pickerDisabled"
        :get-popup-container="(triggerNode) => triggerNode.parentNode as any"
      ></range-picker>
      <Select
        v-else-if="middle.type === 'select' && middle.options"
        v-model:value="state.value"
        class="select-field not-set-background input-value"
        :placeholder="`请选择要搜索的${state.label}`"
        :options="[{ label: '全部', value: '' }, ...middle.options]"
        allow-clear
        :style="{ zIndex: 2 }"
        :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      ></Select>
    </template>
    <Button type="primary" class="search-btn" @click="clickSearch">
      <span>搜 索</span>
    </Button>
  </Input.Group>
  <div class="wrap-table" :class="wrapClassName" :style="wrapStyle">
    <slot name="tableHeader"></slot>
    <Table
      :columns="columns"
      :data-source="datasource"
      :pagination="pagination"
      style="background: inherit"
      v-bind="tableAttrs"
      @change="clickSearch"
      :class="datasource.length === 0 ? 'empty-table' : ''"
      :getPopupContainer="
        (triggerNode) => {
          return triggerNode.parentNode || body;
        }
      "
      :scroll="{ x: 'max-content' }"
    >
      <template #headerCell="{ column }">
        <slot name="headerCell" v-bind="{ column }">
          <span class="header-cell">
            <img class="img-consume" src="@/assets/img/mission/cepIcon.png" v-if="column.dataIndex === 'consume'" />
            {{ column.title }}
          </span>
        </slot>
      </template>
      <template #bodyCell="{ column, text, index, record }">
        <slot name="bodyCell" v-bind="{ column, text, index, record }">{{ text }}</slot>
      </template>
      <template #emptyText>
        <slot name="emptyText"></slot>
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { Input, Select, Button, Table, DatePicker, RangePicker } from 'ant-design-vue';
import type { SelectValue } from 'ant-design-vue/lib/select';
import type { ColumnType, TablePaginationConfig, TableProps } from 'ant-design-vue/lib/table';
import { ref, watch, reactive, onMounted } from 'vue';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { IPagination } from '@/interface/common';

export type InputType = 'input' | 'datepicker' | 'select' | 'rangepicker';
export interface IPrefixDataItem {
  value: string;
  label: string;
  type: InputType;
  options?: SelectValue;
}
interface IProps {
  showSearch?: boolean;
  prefixData?: IPrefixDataItem[];
  columns: ColumnType[];
  datasource: { [key: string]: any }[];
  total: number;
  wrapClassName?: string;
  wrapStyle?: { [key: string]: string };
  tableAttrs?: TableProps;
}
const props = withDefaults(defineProps<IProps>(), {
  showSearch: true,
  prefixData: () => [],
  columns: () => [
    // { title: 'Age', dataIndex: 'age', key: 'age' },
  ],
  datasource: () => [
    // { age: 32 }, { age: 42 }
  ],
});
const emit = defineEmits<{
  (event: 'search', params: { [key: string]: any } & IPagination): void;
}>();
const pagination: TablePaginationConfig = reactive({
  current: 1,
  pageSize: 10,
  showQuickJumper: true,
  showLessItems: true,
  showSizeChanger: true,
  onChange(page, pageSize) {
    this.current = page;
    this.pageSize = pageSize;
  },
});
const body = ref();

const state = reactive<{ key: string; value: any; label: string }>({ key: '', value: '', label: '' });
const middle = ref<{
  type: InputType;
  options?: SelectValue;
  value: string;
}>();
const filteredInfo = ref();
const sortedInfo = ref();

defineExpose({
  clearSearchValue,
  resetPagination,
  sortedInfo,
  filteredInfo,
});

onMounted(() => {
  body.value = document.querySelector('body');
});

watch(
  [() => props.showSearch, () => props.prefixData],
  ([show, data]) => {
    if (show && data.length > 0) {
      const { value, type, options, label } = data[0];
      state.key = value;
      state.label = label;
      changeStateValue(type);
      middle.value = { type, options, value: '' };
    } else {
      state.key = '';
      state.value = '';
      state.label = '';
      middle.value = undefined;
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => props.total,
  (total) => {
    pagination.total = total;
  },
  { immediate: true, deep: true },
);

function changePrefix(value: SelectValue, item: any) {
  const { type, itemOptions: options, label } = item;
  state.label = label;
  middle.value = { type, options, value: '' };
  changeStateValue(type);
}

function changeStateValue(type: InputType) {
  let temp: any = '';
  if (type === 'select') {
    temp = '';
  } else if (type === 'datepicker') {
    temp = dayjs();
  } else if (type === 'rangepicker') {
    let date = dayjs().format('YYYY-MM-DD');
    let start = `${date} 00:00:00`,
      end = `${date} 23:59:59`;
    temp = [dayjs(start), dayjs(end)];
  }
  state.value = temp;
}

function clickSearch(paginationGet?: any, filters?: any, sorter?: any, extra?: any) {
  let { key, value } = state;
  let { current, pageSize } = paginationGet;
  let page_index = current || 1,
    page_size = pageSize || 10;
  let params = { page_index, page_size };
  Object.assign(pagination, { current: page_index, pageSize: page_size });
  if (value || typeof value === 'boolean') {
    const item = props.prefixData.find((item) => item.type === 'rangepicker' && item.value === key);
    // console.log(1, key, value, item);
    if (item && value.length === 2) {
      // 这里固定是属性名 start 和 end，具体到搜索条件时，请在应用之处修改
      let start = dayjs(value[0]).format('YYYY-MM-DD HH') + ':00:00';
      start = dayjs(start).toISOString();
      let end = dayjs(value[1]).format('YYYY-MM-DD HH') + ':59:59';
      end = dayjs(end).toISOString();
      Object.assign(params, { start, end });
    } else {
      Object.assign(params, { [key]: value });
    }
  }
  if (sorter && Object.keys(sorter).length > 0) {
    console.log('sorter', sorter);
    const { field, columnKey, order } = sorter;
    const name = columnKey || field;
    // 固定排序属性值为 asc 、 desc、空
    const newItem = { [name]: order ? (order === 'ascend' ? 'asc' : 'desc') : '' };
    Object.assign(params, newItem);
  }
  for (const key in filters) {
    if (filters[key] === null) {
      delete filters[key];
    }
  }
  if (filters && Object.keys(filters).length > 0) {
    console.log('filters', filters);
    params = { ...params, ...filters };
  }
  console.log('search', key, params);
  emit('search', params);
}

function pickerDisabled(now: Dayjs) {
  const temp = dayjs().format('YYYY-MM-DD') + ' 23:59:01';
  return now.isAfter(dayjs(temp));
}

function clearSearchValue() {
  console.log('clearSearchValue ok');
  state.value = '';
}

function resetPagination(config: TablePaginationConfig) {
  Object.assign(pagination, config);
}
</script>

<style lang="less" scoped>
.ant-input-group.search-bar {
  .flex-mode;
  margin-bottom: 1.25rem;
  width: 100%;
  height: 5rem;
  background: #313131;
  border-radius: 0.375rem;

  .ant-form-item {
    margin: 0;
  }

  .prefix-select {
    :deep(.ant-select-selector) {
      background-color: @color-primary;
      border-radius: 0.375rem 0rem 0rem.375rem !important;
      border-top-color: transparent;
      border-left-color: transparent;
      border-bottom-color: transparent;
      font-size: inherit;

      .ant-select-selection-placeholder,
      .ant-select-selection-item {
        font-size: inherit;
      }

      .ant-select-selection-item {
        justify-content: center;
      }
    }
  }

  .input-value {
    width: 22.9375rem;

    :deep(.ant-select-selector) {
      border-radius: 0rem !important;
    }

    :deep(.ant-picker-input) {
      height: 100%;
    }
  }

  .picker-value {
    width: 22.9375rem;
  }

  .search-btn {
    height: 2.5rem;
    border-radius: 0 0.375rem 0.375rem 0;

    span {
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
    }
  }
}

.wrap-table {
  padding: 1rem 2rem;
  background: #313131;
  border-radius: 0.375rem;

  :deep(.ant-table) {
    font-size: 0.875rem;

    .ant-table-thead {
      font-size: 1rem;
    }
  }

  :deep(.ant-select-dropdown) {
    background-color: #292929;
  }

  :deep(.ant-dropdown .ant-table-filter-dropdown .ant-table-filter-dropdown-btns) {
    border-top: 0.0625rem solid #3f3f3f;
    background-color: #292929;
  }

  .img-consume {
    //.flex-mode(column);
    height: 1.25rem;
    width: 1.25rem;
    margin-right: 0.0625rem;
  }
  .header-cell {
    .flex-mode(row, flex-start);

    .sort-arrow {
      cursor: pointer;
      margin-left: 0.375rem;
      img {
        width: 0.4375rem;
        height: 0.4375rem;
      }
      width: 0.4375rem;
      height: 0.875rem;
      .flex-mode(column);
    }
  }

  .empty-table {
    :deep(.ant-table) {
      .ant-table-tbody > tr:first-child > td,
      .ant-table-tbody > tr:last-child > td {
        border-bottom: 0;
      }
    }
  }

  :deep(.ant-table-container) {
    &::before,
    &::after {
      box-shadow: none !important;
    }
  }
}

.is-mobile {
  .ant-input-group.search-bar {
    margin-bottom: 0.5rem;
    padding: 0 1rem;
    height: 4.0625rem;

    > * {
      padding-top: 0;
      padding-bottom: 0;
      height: 2.0625rem;
      font-size: 0.75rem;
    }

    .select-field {
      :deep(.ant-select-item-option) {
        font-size: 0.75rem;
      }
    }

    :deep(.ant-picker-panel-layout) {
      font-size: 0.75rem;

      .ant-btn {
        font-size: inherit;
      }
    }
  }

  .wrap-table {
    padding: 0.5rem;

    .header-cell {
      white-space: nowrap;
    }

    :deep(.ant-table) {
      font-size: 0.75rem;

      .ant-table-thead {
        font-size: 0.875rem;
      }
    }
  }
}
</style>
