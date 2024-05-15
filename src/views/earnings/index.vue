<template>
  <div class="appmain">
    <div class="carInfo">
      <a-table :columns="columns" :data-source="dataSource" bordered>
        <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
          <div style="padding: 8px">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.dataIndex}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon><SearchOutlined /></template>
              Search
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)"> Reset </a-button>
          </div>
        </template>
        <template #customFilterIcon="{ filtered }">
          <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="['name'].includes(column.dataIndex)">
            <div>
              {{ record.edges.products.product_name }}
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <a-popconfirm
              v-if="dataSource.length && record.status === 'Payed'"
              title="确认发货?"
              @confirm="deliverOrderFn(record.id)"
            >
              <a>确认发货</a>
            </a-popconfirm>
            <a v-else href="" style="color: #726e6e">确认发货</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { onMounted } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { deliverOrder, getEarningList, getOrderList } from '@/api/order';
import { message } from 'ant-design-vue';

async function deliverOrderFn(id) {
  const res = await deliverOrder({ order_id: id, finish: true });
  if (res.code === 20000) {
    message.success('发货成功');
    getData();
  } else {
    message.error('发货失败');
  }
}

const searchInput = ref();
const columns = [
  {
    id: 'id',
    title: '订单ID',
    dataIndex: 'id',
  },
  {
    id: 'name',
    title: '商品名称',
    dataIndex: 'name',
  },
  {
    id: 'count',
    title: '数量',
    dataIndex: 'count',
  },
  {
    id: 'amount',
    title: '总价（分）',
    dataIndex: 'amount',
  },
  {
    id: 'address',
    title: '送货地址',
    dataIndex: 'address',
  },
  {
    id: 'status',
    title: '状态',
    dataIndex: 'status',
  },
  {
    id: 'operation',
    title: '操作',
    dataIndex: 'operation',
  },
];
const dataSource = ref([]);
const editableData = reactive({});
const showAddModal = ref(false);
const newCarForm = reactive({
  brand: '',
  model: '',
  plate: '',
  ownerPhone: '',
});
const state = reactive({
  searchText: '',
  searchedColumn: '',
});

const edit = (key) => {
  editableData[key] = cloneDeep(dataSource.value.filter((item) => key === item.id)[0]);
};
const save = async (key) => {};
const cancel = (key) => {
  delete editableData[key];
};
const handleAdd = () => {
  showAddModal.value = true;
};

function handleSearch(selectedKeys, confirm, dataIndex) {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
}

const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  state.searchText = '';
};

const confirmAdd = () => {
  showAddModal.value = false;
};

async function onFinish() {}

async function getData() {
  const res = await getEarningList({ page_index: 1, page_size: 100 });
  if (res.code === 20000) {
    console.log(111, res.data.list);
    dataSource.value = res.data.list;
  } else {
    message.error('获取数据失败');
  }
}

async function onDelete(id) {}

onMounted(() => {
  getData();
});
</script>

<style lang="less" scoped>
.carInfo {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.editable-cell {
  position: relative;

  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-row-operations a {
  margin-right: 8px;
}
</style>
