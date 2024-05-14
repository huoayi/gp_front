<template>
  <div class="appmain">
    <div class="carInfo">
      <a-button class="editable-add-btn" style="margin-bottom: 8px" @click="handleAdd">添加新的商品</a-button>
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
          <template v-if="['ownerPhone', 'ownerName'].includes(column.dataIndex)">
            <div>
              <a-input
                v-if="editableData[record.id]"
                v-model:value="editableData[record.id][column.dataIndex]"
                style="margin: -5px 0"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <span v-if="editableData[record.id]">
                <a-typography-link @click="save(record.id)">Save</a-typography-link>
                <a-popconfirm title="Sure to cancel?" @confirm="cancel(record.id)">
                  <a>Cancel</a>
                </a-popconfirm>
              </span>
              <span v-else>
                <a @click="edit(record.id)">修改</a>
              </span>
            </div>
            <a-popconfirm v-if="dataSource.length" title="确认删除?" @confirm="onDelete(record.id)">
              <a>删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
    <a-modal v-model:open="showAddModal" title="添加新的商品" @ok="confirmAdd">
      <a-form
        :model="newProductForm"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
        centered="true"
      >
        <a-form-item label="商品名称" name="name" :rules="[{ required: true, message: 'Please input your username!' }]">
          <a-input v-model:value="newProductForm.name" />
        </a-form-item>
        <a-form-item label="描述" name="comment" :rules="[{ required: true }]">
          <a-input v-model:value="newProductForm.comment" />
        </a-form-item>
        <a-form-item label="单位" name="unit" :rules="[{ required: true, message: 'Please input your username!' }]">
          <a-input v-model:value="newProductForm.unit" />
        </a-form-item>
        <a-form-item label="价格" name="price" :rules="[{ required: true, message: 'Please input your username!' }]">
          <a-input v-model:value="newProductForm.price" />
        </a-form-item>
        <a-form-item label="商品类型" name="type" :rules="[{ required: true, message: 'Please input your username!' }]">
          <a-select ref="select" v-model:value="newProductForm.type" style="width: 120px" @focus="focus">
            <a-select-option v-for="item in types" :value="item.value">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="商品图片" name="picture"
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
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { onMounted } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { addProduct, getMerchantProductList, getProductList } from '@/api/product';
import { message } from 'ant-design-vue';
import { useUserStore } from '@/stores/user';

const fileList = ref([]);
const headers = {
  authorization: 'token.value',
};
const types = [
  { value: 'tea', label: '茶' },
  { value: 'vegetable', label: '蔬菜' },
  {
    value: 'seedlings',
    label: '种植',
  },
  {
    value: 'fisheries',
    label: '渔业',
  },
  {
    value: 'edible-fungi',
    label: '菌类',
  },
  {
    value: 'medicinal-materials',
    label: '药材',
  },
  {
    value: 'animal-husbandry',
    label: '动物饲养',
  },
  {
    value: 'grain-and-oil-crops',
    label: '粮油作物',
  },
];

const searchInput = ref();
const columns = [
  {
    id: 'id',
    title: '商品ID',
    dataIndex: 'id',
  },
  {
    id: 'product_name',
    title: '名称',
    dataIndex: 'product_name',
  },
  {
    id: 'comment',
    title: '描述',
    dataIndex: 'comment',
  },
  {
    id: 'price',
    title: '价格',
    dataIndex: 'price',
    customFilterDropdown: true,
    onFilter: (value, record) => {
      return record.plate.toString().toLowerCase().includes(value.toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      console.log(3, visible);
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    id: 'produce_type',
    title: '类型',
    dataIndex: 'produce_type',
  },
];
const dataSource = ref([]);
const editableData = reactive({});
const showAddModal = ref(false);
const newProductForm = reactive({
  name: '',
  comment: '',
  unit: '',
  price: '',
  type: '',
  picture: '',
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

const handleChange = (info) => {
  if (info.file.status === 'done') {
    console.log('info', info);
    newProductForm.picture = 'http://59.110.65.99:9000' + info.file.response.data.url;
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }
};
const confirmAdd = () => {
  showAddModal.value = false;
};

async function onFinish() {
  console.log('onFinish');
  const res = await addProduct({
    product_name: newProductForm.name,
    jpg_url: newProductForm.picture,
    comment: newProductForm.comment,
    unit: newProductForm.unit,
    price: Number(newProductForm.price),
    produce_type: newProductForm.type,
  });
  if (res.code === 20000) {
    message.success('添加成功');
    resetModal();
  } else {
    message.error('添加失败');
  }
  console.log('res', res);
}

function resetModal() {
  newProductForm.name = '';
  newProductForm.comment = '';
  newProductForm.unit = '';
  newProductForm.price = '';
  newProductForm.type = '';
  newProductForm.picture = '';

  showAddModal.value = false;
}

async function getData() {
  const res = await getMerchantProductList({ page_index: 1, page_size: 100 });
  if (res.code === 20000) {
    dataSource.value = res.data.list;
  } else {
    message.error('获取数据失败');
  }
}

async function onDelete(id) {}

const token = ref({});
onMounted(() => {
  console.log('CarInfo mounted');
  getData();
  const store = useUserStore();
  token.value = {
    authorization: store.getToken(),
  };
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
