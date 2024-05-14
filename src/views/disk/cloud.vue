<template>
  <Spin :spinning="spinning" wrapper-class-name="has-spin-container">
    <section class="disk-cloud" :class="webStore.getClassName('disk-cloud')">
      <nav-bar title="端脑云空间" :bread-list="breadList" sticky />

      <div class="page-content">
        <div class="warning-alert">
          <img src="@/assets/img/warning.png" alt="" />
          <span>端脑会员专享独立存储空间，限时免费！可使用至 2024 年 4 月 30 日。</span>
        </div>
        <div class="file-list">
          <div class="file-list__header">
            <div class="progress">
              <p>
                <span>可用空间：{{ formatByte(spaceSize.used) }} / {{ formatByte(spaceSize.all) }}</span>
                <Button type="link" @click="operationState.expandVisible = true">扩容</Button>
              </p>
              <Progress :percent="spaceSize.progress" :show-info="false" stroke-color="#793aea" />
            </div>
            <Button type="primary" :disabled="selectedFileIds.length === 0" @click="clickDelUserUploaded">
              删除文件
            </Button>
            <!-- todo：待后端实现 -->
            <Button v-if="false" type="primary" :disabled="selectedFileIds.length === 0" @click="clickImportFile">
              导入应用
            </Button>
            <div class="local-upload">
              <Button type="primary" @click="handleLocalUpload">本地上传</Button>
              <input ref="fileInputRef" type="file" @change="handleFileChange" multiple />
            </div>
          </div>
          <div class="file-list__content" :class="{ empty: cloudFiles.length === 0 }">
            <div
              class="item"
              v-for="item in cloudFiles"
              @click="clickRectangle(item.id)"
              :class="{ selected: selectedFileIds.includes(item.id) }"
            >
              <div class="checkbox">
                <img :class="{ hide: selectedFileIds.includes(item.id) }" src="@/assets/img/disk/rectangle.png" />
                <img
                  :class="{ hide: !selectedFileIds.includes(item.id) }"
                  src="@/assets/img/disk/rectangle-selected.png"
                />
              </div>
              <img v-if="item.icon" class="file" :src="item.icon" />
              <img v-else class="file" src="@/assets/img/disk/file.png" />
              <div class="file-detail">
                <span class="title">{{ item.name || '未命名' }}</span>
                <span class="size">{{ formatByte(item.size) }}</span>
              </div>
            </div>
            <template v-if="cloudFiles.length === 0">
              <img src="@/assets/img/disk/empty-files.png" />
              <p class="text-content">暂无文件</p>
            </template>
          </div>

          <div class="uploading-queue" v-if="uploadList.length > 0">
            <h4>{{ uploadList.length }} 个文件上传中</h4>
            <div class="detail">
              <span>{{ fakeProgress }}% · {{ averageSpeed }} MB/s</span>
              <div
                class="hover-icon-display-wrapper"
                v-if="
                  uploadList.find((i) => !i.filehash && !pauseFiles.includes(i.file)) ||
                  Object.keys(fileData).find((key) => [Status.uploading, Status.wait].includes(fileData[key].status))
                "
                @click="stopUploading('pause')"
              >
                <img src="@/assets/img/disk/pause.png" class="icon-d" />
                <img src="@/assets/img/disk/pause-hover.png" class="hover-icon" />
              </div>
              <div
                class="hover-icon-display-wrapper"
                @click="resumeUploading"
                v-if="
                  uploadList.find((i) => !i.filehash && pauseFiles.includes(i.file)) ||
                  Object.keys(fileData).find((key) => [Status.pause, Status.error].includes(fileData[key].status))
                "
              >
                <img src="@/assets/img/disk/continue.png" class="icon-d" />
                <img src="@/assets/img/disk/continue-hover.png" class="hover-icon" />
              </div>
              <div
                class="hover-icon-display-wrapper"
                @click="diskStore.cloud.abortVisbile = true"
                v-if="uploadList.length > 0"
              >
                <img src="@/assets/img/disk/cancel.png" class="icon-d" />
                <img src="@/assets/img/disk/cancel-hover.png" class="hover-icon" />
              </div>
            </div>
            <Progress :percent="fakeProgress" :show-info="false" stroke-color="#793aea" />
          </div>
        </div>
      </div>
    </section>
  </Spin>

  <custom-modal
    :visible="diskStore.cloud.abortVisbile"
    @update:visible="closeAbortUploaded"
    title="停止上传文件"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
  >
    <div class="btns-modal-content">
      <p v-if="diskStore.cloud.isNextLogout">
        文件正在上传中，退出登录会终止上传，请保持在当前页面耐心等待。确定停止上传吗？
      </p>
      <p v-else-if="nextFunc">
        文件正在上传中，切换页面会终止上传，请保持在当前页面耐心等待。确定停止上传并进入其他页面吗？
      </p>
      <p v-else>文件正在上传中，确定停止上传吗？</p>
      <div class="btns">
        <Button @click="closeAbortUploaded">取消</Button>
        <Button type="primary" @click="confirmAbortUploaded">确定</Button>
      </div>
    </div>
  </custom-modal>
  <custom-modal
    :visible="operationState.deleteVisible"
    @update:visible="closeDelUserUploaded"
    title="删除文件"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
  >
    <div class="btns-modal-content">
      <p>确定要删除文件吗？</p>
      <div class="btns">
        <Button @click="closeDelUserUploaded">取消</Button>
        <Button type="primary" @click="confirmDelUserUploaded">确定</Button>
      </div>
    </div>
  </custom-modal>
  <custom-modal
    :visible="operationState.importVisible"
    @update:visible="closeImportFile"
    title="导入应用"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
  >
    <div class="btns-modal-content import-content" v-if="!operationState.isImporting">
      <div class="select-mission">
        <label>应用编号：</label>
        <Select
          v-model:value="selectMissionId"
          placeholder="请输入应用编号"
          show-search
          @search="searchRunningMissions"
          :options="missionOptions"
        ></Select>
      </div>
      <div class="btns">
        <Button @click="closeImportFile">取消</Button>
        <Button type="primary" @click="confirmImportFile">确定</Button>
      </div>
    </div>
    <div class="btns-modal-content has-progress" v-else>
      <p>文件传输中，请勿关闭窗口……</p>
      <Progress :percent="0" :show-info="false" stroke-color="#793aea" />
      <p class="detail">43% · 23.13 MB/s</p>
      <div class="btns">
        <Button type="primary" @click="closeImportFile">停止切换</Button>
      </div>
    </div>
  </custom-modal>
  <custom-modal
    :visible="operationState.cancelImportingVisible"
    @update:visible="closeCancelImporting"
    title="停止导入"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
  >
    <div class="btns-modal-content">
      <p>导入正在进行中，确定停止吗?</p>
      <div class="btns">
        <Button @click="closeCancelImporting">取消</Button>
        <Button type="primary" @click="confirmCancelImporting">确定</Button>
      </div>
    </div>
  </custom-modal>
  <custom-modal
    v-model:visible="operationState.importSuccessVisible"
    title="导入成功"
    :show-close-icon="false"
    :width="webStore.isPc ? '26rem' : '19.4375rem'"
  >
    <div class="btns-modal-content">
      <p>模型已成功导入您的应用,请前往应用链接中使用~</p>
      <div class="btns">
        <Button @click="operationState.importSuccessVisible = false">取消</Button>
        <Button type="primary" @click="gotoImportedApp">进入应用</Button>
      </div>
    </div>
  </custom-modal>
  <custom-modal
    v-model:visible="operationState.expandVisible"
    title="联系小助手"
    :width="webStore.isPc ? '26.75rem' : '19.4375rem'"
  >
    <div class="contact-modal-content">
      <h4>限免期间每人 60G 存储空间，如需扩容请联系小助手</h4>
      <img src="@/assets/img/layout/contact/qr.png" />
      <p>微信扫一扫联系小助手</p>
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import NavBar, { type IBreadListItem } from '@/components/NavBar.vue';
import { useWebStore } from '@/stores/web';
import { useUserStore } from '@/stores/user';
import { Spin, Progress, Button, message, Select } from 'ant-design-vue';
import { ref, reactive, computed, watch, onBeforeMount, onBeforeUnmount, onMounted } from 'vue';
import { getCloudSpace, getCloudFiles, setUploadedFile, deleteUploadedFiles } from '@/api/disk/cloud';
import SparkMD5 from 'spark-md5';
import { uploadFile, checkFile, preUploadFile, checkChunk, uploadChunk, mergeChunks } from '@/api/disk/cloud';
import { getUploadedChunks } from '@/api/disk/cloud';
import type { AxiosProgressEvent } from 'axios';
import { clearTimer, formatMsg, jumpTo, formatByte } from '@/utils/common';
import CustomModal from '@/components/Modal.vue';
import { getMissionList } from '@/api/mission';
import { useMissionStore } from '@/stores/mission';
import { onBeforeRouteLeave, type NavigationGuardNext } from 'vue-router';
import { setBurialPoint } from '@/api/burial';
import { useDiskStore } from '@/stores/disk';

const breadList: IBreadListItem[] = [{ text: '云盘管理' }, { text: '端脑云空间' }];

const webStore = useWebStore();
const userStore = useUserStore();
const missionStore = useMissionStore();
const userId = computed(() => userStore.userInfo?.userId || '');
// 与用户关联
const spaceSize = reactive({ used: 0, all: 0, progress: 0 }); // 字节
const cloudFiles = reactive<{ id: string; name: string; icon: string; size: number; md5: string }[]>([]);
const selectedFileIds = reactive<string[]>([]);
const spinning = ref(false);
const operationState = reactive({
  deleteVisible: false,
  deleteLoading: false,
  importVisible: false,
  isImporting: false,
  cancelImportingVisible: false,
  importSuccessVisible: false,
  expandVisible: false,
});
const selectMissionId = ref(undefined);
const searchMissionTimer = ref<number>();
const missionOptions = ref<{ value: string; label: string; url?: string }[]>([]);
const nextFunc = ref<NavigationGuardNext>();
// 跳转需要打断上传
const diskStore = useDiskStore();

//#region 与文件上传相关
const SIZE = 10 * 1024 * 1024; // 切片大小 10MB
const Status = { wait: 'wait', pause: 'pause', uploading: 'uploading', error: 'error', done: 'done', abort: 'abort' };
type StatusType = (typeof Status)[keyof typeof Status];
const SPEED_UPDATE_INTERVAL = 1000;

const worker = ref<Worker>();

interface IChunkItem {
  chunkName: string; // filehash + index
  chunk: Blob;
  index: number;
  size: number; // Byte
  status: StatusType;
  progress: number;
}
interface IFileItem {
  file: File;
  chunks?: IChunkItem[]; // 切片 数据块
  progress?: number; // 文件大小 <= SIZE 时的进度，0 ~ 100，单位为百分比
  status: StatusType;
  // 计算速度、剩余时间
  intervalTimer?: number;
  recentSpeeds: number[]; // byte/s
  currentBytesUploaded?: number; // byte
  currentUploadedProgress?: number; // 0 ~ 100，单位为百分比
  currentAverageSpeed?: number; // MB/s
  lastProgressTimestamp?: number;
  remainSeconds?: number;
}
// 考虑：可能会有多个文件一起上传
const fileInputRef = ref();
const chooseList = reactive<{ file: File; filehash?: string }[]>([]);
const hashProgress = ref(0); // 计算单个文件的哈希进度
const fileData = reactive<{ [filehash: string]: IFileItem }>({}); // filehash md5
const uploadList = computed(() =>
  chooseList.filter((item) => {
    const { filehash } = item;
    return !filehash || (filehash && fileData[filehash].status !== Status.done);
  }),
); // 待上传文件
const totalSize = computed(() => chooseList.reduce((sum, item) => sum + item.file.size, 0));
const fakeProgress = ref(0); // 总体上传进度
const averageSpeed = ref(0); // 总体平均速度
const hasStarted = ref(false); // 是否有文件开始上传
const pauseFiles = reactive<File[]>([]); // 暂存：防止 hash 未计算完毕
//#endregion

//#region 用户

onMounted(() => {
  // 埋点
  const { userId: creator = '', phone } = userStore.userInfo || {};
  setBurialPoint({ creator, type: 'page_view_disk_cloud', body: { phone } });
});

watch(
  () => userId.value,
  (id) => {
    if (!id) return;
    init();
  },
  { immediate: true, deep: true },
);

async function init() {
  spinning.value = true;
  await _getCloudSpace(false);
  await _getCloudFiles();
  spinning.value = false;
}

watch(
  () => uploadList.value.length,
  (len) => {
    diskStore.cloud.hasUploading = len > 0;
  },
  { immediate: true, deep: true },
);

onBeforeMount(() => {
  window.addEventListener('beforeunload', showUnloadTip);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', showUnloadTip);
});

function showUnloadTip(e: BeforeUnloadEvent) {
  // 重新加载不会保存更改
  if (uploadList.value.length > 0) {
    e.preventDefault();
    if (e) e.returnValue = '';
    return '';
  }
}

onBeforeRouteLeave((to, from, next) => {
  if (uploadList.value.length > 0) {
    nextFunc.value = next;
    diskStore.cloud.abortVisbile = true;
  } else {
    next();
  }
});

async function _getCloudSpace(spin: boolean = true) {
  spin && (spinning.value = true);
  const result = await getCloudSpace(userId.value);
  if (result.code === 20000) {
    const { used_space: used, user_space: all } = result.data;
    const progress = all === 0 ? 0 : parseInt(((used / all) * 100).toFixed());
    Object.assign(spaceSize, { used, all, progress });
  } else {
    spaceSize.all = 0;
  }
  spin && (spinning.value = false);
}

async function _getCloudFiles() {
  const result = await getCloudFiles(userId.value);
  if (result.code === 20000) {
    const { list } = result.data;
    const arr = (list || []).map((item: any) => {
      const { file_id: id, name, icon, size, md5 } = item;
      return { id, name, icon, size, md5 };
    });
    cloudFiles.length = 0;
    cloudFiles.push(...arr);
  }
}

function clickRectangle(id: string) {
  const index = selectedFileIds.indexOf(id);
  if (index === -1) {
    selectedFileIds.push(id);
  } else {
    selectedFileIds.splice(index, 1);
  }
}

function clickDelUserUploaded() {
  operationState.deleteVisible = true;
}

function closeDelUserUploaded() {
  if (operationState.deleteLoading) return;
  operationState.deleteVisible = false;
}

async function confirmDelUserUploaded() {
  if (selectedFileIds.length === 0) return;
  operationState.deleteLoading = true;
  const result = await deleteUploadedFiles(selectedFileIds);
  if (result.code === 20000) {
    selectedFileIds.length = 0;
    init();
    message.success('删除成功！');
  } else {
    message.error(formatMsg(result.msg || '删除失败'));
  }
  operationState.deleteVisible = false;
  operationState.deleteLoading = false;
}

async function getRunningMissions(id?: string) {}

function searchRunningMissions(value: string) {
  clearTimer(searchMissionTimer);
  searchMissionTimer.value = window.setTimeout(() => {
    getRunningMissions(value);
  }, 200);
}

function clickImportFile() {
  getRunningMissions();
  operationState.importVisible = true;
}

function closeImportFile() {
  const is = operationState.isImporting;
  if (is) {
    operationState.importVisible = false;
    operationState.cancelImportingVisible = true;
  } else {
    operationState.importVisible = false;
    selectMissionId.value = undefined;
  }
}

async function confirmImportFile() {
  // todo：调接口
  operationState.isImporting = true;

  setTimeout(() => {
    if (!operationState.cancelImportingVisible) {
      Object.assign(operationState, {
        isImporting: false,
        importVisible: false,
        importSuccessVisible: true,
      });
    }
  }, 500);
}

function closeCancelImporting() {
  Object.assign(operationState, {
    cancelImportingVisible: false,
    importVisible: true,
  });
}

function confirmCancelImporting() {
  // todo
  Object.assign(operationState, {
    cancelImportingVisible: false,
    isImporting: false,
  });
}

function gotoImportedApp() {
  const item = missionOptions.value?.find((i) => i.value === selectMissionId.value);
  if (item?.url) {
    jumpTo(item.url);
  } else {
    message.error('找不到进入应用的链接！');
  }
  operationState.importSuccessVisible = false;
}
//#endregion

//#region 计算文件上传进度、速度
watch(
  [() => chooseList, () => fileData],
  ([list, fileData]) => {
    const keys: string[] = [];
    list.forEach((item) => {
      const { filehash } = item;
      if (filehash && fileData[filehash].status === Status.uploading && fileData[filehash].currentAverageSpeed) {
        keys.push(filehash);
      }
    });
    if (keys.length === 0) return;
    const total = keys.reduce((sum, key) => sum + (fileData[key].currentAverageSpeed || 0), 0);
    averageSpeed.value = parseFloat((total / keys.length).toFixed(2));
  },
  { immediate: true, deep: true },
);

watch(
  [() => totalSize.value, () => fileData],
  ([tSize, fileData]) => {
    const uploadedSize = Object.keys(fileData).reduce((sum, key) => sum + (fileData[key].currentBytesUploaded || 0), 0);
    const temp = tSize ? parseFloat(((uploadedSize / tSize) * 100).toFixed(2)) : 0;
    if (temp > fakeProgress.value) {
      fakeProgress.value = temp;
    }
  },
  { immediate: true, deep: true },
);
//#endregion

/**
 * 1. 选择文件
 * 2. 上传：（1）获取文件哈希 MD5，显示获取进度【时间一般根据计算算法和文件大小而得】
 * （2）根据哈希检验文件在服务器是否存在，存在提示秒传成功结束，否则跳下一步
 * （3）hash、切片、上传并发量控制
 */
function handleLocalUpload() {
  fileInputRef.value?.click();
}

async function handleFileChange(e: any) {
  const temp = e.target?.files || {};
  const files: File[] = Object.values(temp);
  if (files.length === 0) return;
  // 判断可用空间是否足够
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const { used, all } = spaceSize;
  if (all - used - totalSize.value < total) {
    message.error('空间不足，请扩容！');
    return;
  }
  chooseList.push(...files.map((file: File) => ({ file })));
  fileInputRef.value.value = null;
  hasStarted.value = true;
  circulateUploading();
}

//#region 对整体
function circulateUploading() {
  if (uploadList.value.length === 0) {
    if (hasStarted.value) {
      clearUploadingState();
      message.success('上传成功！');
      init();
    }
    return;
  }

  // todo：考虑多个文件同时上传：目前仅一个
  if (Object.keys(fileData).filter((key) => fileData[key].status === Status.uploading).length > 0) {
    return;
  }

  // 只执行 wait
  const list = chooseList.filter((item) => {
    const { file, filehash } = item;
    return (
      (!filehash && !pauseFiles.includes(file)) ||
      (filehash && (!fileData[filehash] || fileData[filehash].status === Status.wait))
    );
  });
  if (list.length === 0) return;
  const { file, filehash } = list[0];
  handleUpload(file, filehash);
}

function resumeUploading() {
  const list = uploadList.value;
  for (let i = 0; i < list.length; i++) {
    const { filehash } = list[i];
    if (filehash) {
      fileData[filehash].status = Status.wait;
    }
  }
  pauseFiles.length = 0;
  circulateUploading();
}

async function stopUploading(type: 'pause' | 'abort' | 'other' = 'abort') {
  // 暂停所有正在发送的请求
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>', type);
  try {
    const hashes: string[] = [];
    for (let i = 0; i < chooseList.length; i++) {
      const { file, filehash } = chooseList[i];
      if (filehash) {
        const { status } = fileData[filehash];
        if (status === Status.uploading) {
          hashes.push(filehash);
          fileData[filehash].status = Status.pause;
        }
        if (status === Status.wait) {
          fileData[filehash].status = Status.pause;
        }
      } else if (!filehash) {
        pauseFiles.push(file); // 处于计算 hash 的过程
      }
    }
    const list = getCancelRequests(hashes);
    await Promise.all(list);
  } catch (e) {
    console.log(type, e);
  } finally {
    // 清状态
    if (type === 'abort') {
      clearUploadingState();
      message.success('停止成功！');
    } else if (type === 'pause') {
      message.success('暂停成功！');
    }
  }
}

function clearUploadingState() {
  // 清状态
  chooseList.length = 0;
  hashProgress.value = 0;
  Object.keys(fileData).forEach((key) => {
    fileData[key].intervalTimer && clearInterval(fileData[key].intervalTimer);
    delete fileData[key];
  });
  fakeProgress.value = 0;
  averageSpeed.value = 0;
  hasStarted.value = false;
}

function closeAbortUploaded() {
  diskStore.cloud.abortVisbile = false;
  diskStore.cloud.isNextLogout = false;
  nextFunc.value = undefined;
}

function confirmAbortUploaded() {
  const { isNextLogout } = diskStore.cloud;
  if (isNextLogout) {
  } else if (nextFunc.value) {
    nextFunc.value();
  }
  stopUploading('abort');
  closeAbortUploaded();
}
//#endregion

//#region 对单个文件上传
function getFileDataHash(file: File, hash?: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let filehash: string;
    if (hash) {
      filehash = hash;
    } else {
      // 计算哈希：全量计算耗时长，只计算文件前 100MB
      const fileByte = 100 * 1024 * 1024,
        size = formatByte(fileByte);
      console.time(`filehash ${size}`);
      const tempChunks = createFileChunk(file.slice(0, fileByte));
      filehash = await calculateHashSync(tempChunks);
      console.timeEnd(`filehash ${size}`);
      const pauseIndex = pauseFiles.findIndex((item) => item === file);
      const status = pauseIndex === -1 ? Status.wait : Status.pause;
      pauseIndex !== -1 && pauseFiles.splice(pauseIndex, 1);
      fileData[filehash] = { file, status, recentSpeeds: [] };
      const index = chooseList.findIndex((i) => i.file === file);
      if (index === -1) {
        reject();
      } else {
        chooseList[index].filehash = filehash;
      }
    }
    resolve(filehash);
  });
}

async function handleUpload(file: File, hash?: string) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>', 'start', file.name);
  let filehash = '';
  try {
    filehash = await getFileDataHash(file, hash);
    console.log('开始检查', filehash, fileData[filehash].status);
    if (fileData[filehash].status === Status.pause) {
      circulateUploading();
      return;
    }

    fileData[filehash].status = Status.uploading;

    // 如果列表有相同 md5
    const index = cloudFiles.findIndex((i) => i.md5 === filehash);
    if (index !== -1) {
      afterUploadedFile(filehash);
      return;
    }

    // 检查文件是否已上传
    const fileResult = await checkFile(filehash);
    if (fileResult.code === 200) {
      console.log(filehash, '秒传！');
      afterUploadedFile(filehash);
      return;
    }

    console.log('开始上传：', filehash);

    if (file.size > SIZE) {
      const uploadedResult = await getUploadedChunks(filehash);
      const uploadedList = uploadedResult.code === 200 ? uploadedResult.data : [];
      const { chunks: existingChunks } = fileData[filehash];
      if (existingChunks) {
        fileData[filehash].chunks = existingChunks.map((chunk, index) => {
          let uploaded = uploadedList.indexOf(`${index}`) > -1;
          return {
            ...chunk,
            status: uploaded ? Status.done : Status.wait,
            progress: uploaded ? 100 : 0,
          };
        });
      } else {
        // 初始化切片列表
        const fileChunks = createFileChunk(file);
        const chunks: IChunkItem[] = fileChunks.map((chunk, index) => {
          let chunkName = filehash + '-' + index,
            uploaded = uploadedList.indexOf(`${index}`) > -1;
          return {
            chunkName,
            chunk: chunk.file,
            index,
            size: chunk.file.size,
            status: uploaded ? Status.done : Status.wait,
            progress: uploaded ? 100 : 0,
          };
        });
        // console.log(2, chunks);
        fileData[filehash].chunks = chunks;
      }
      console.log('架子个数', fileData[filehash].chunks?.length);
      uploadChunks(filehash);
    } else {
      uploadWholeFile(filehash, file);
    }
    calcProgress(filehash);
  } catch (e) {
    console.log('上传错误', e);
    filehash && (fileData[filehash].status = Status.error);
  }
}

function calcProgress(filehash: string) {
  if (!fileData[filehash].lastProgressTimestamp) {
    const { chunks } = fileData[filehash];
    fileData[filehash].currentBytesUploaded = chunks
      ? chunks.reduce((sum, c) => sum + (c.size * c.progress) / 100, 0)
      : 0;
    fileData[filehash].lastProgressTimestamp = Date.now();

    fileData[filehash].intervalTimer = window.setInterval(() => {
      // 上传多少文件大小
      const { file, chunks, progress = 0, currentBytesUploaded = 0, lastProgressTimestamp = 0 } = fileData[filehash];
      let temp = chunks
          ? chunks.map((c) => (c.size * c.progress) / 100).reduce((sum, size) => sum + size, 0)
          : (file.size * progress) / 100,
        timestamp = Date.now();
      let elapsedTime = (timestamp - lastProgressTimestamp) / 1000;
      let speed = (temp - currentBytesUploaded) / elapsedTime;

      console.log('calc', filehash, temp, currentBytesUploaded, elapsedTime, speed, file.size);

      fileData[filehash].recentSpeeds.push(speed);
      if (fileData[filehash].recentSpeeds.length > 10) {
        fileData[filehash].recentSpeeds.unshift();
      }
      fileData[filehash].currentBytesUploaded = temp;
      fileData[filehash].currentUploadedProgress = parseFloat(((temp / file.size) * 100).toFixed(2));
      fileData[filehash].lastProgressTimestamp = timestamp;
      let avgSpeed =
        fileData[filehash].recentSpeeds.reduce((sum, speed) => sum + speed, 0) /
        fileData[filehash].recentSpeeds.length /
        (1024 * 1024); // MB/s
      avgSpeed = parseFloat(avgSpeed.toFixed(2));
      fileData[filehash].currentAverageSpeed = avgSpeed;
      fileData[filehash].remainSeconds = Math.ceil((file.size - temp) / (1024 * 1024) / avgSpeed);
    }, SPEED_UPDATE_INTERVAL);
  }
}

async function uploadChunks(filehash: string, preload: boolean = true) {
  // 上传存储【分片上传流程是，先开一个架子，把碎片文件一点一点放架子上，最后告诉架子可以收起来】
  /**
   * 随机数：随机待传数组
   * （1）云空间共用，存在同一时间不同用户上传同一个文件的可能；
   * （2）考虑：后续做独享，由于允许多端登录，随机选择待传切片是优选
   * （3）对请求报错次数累加有影响：下一个切片上传不一定随机到上个报错的切片
   */
  try {
    const { chunks = [] } = fileData[filehash];
    if (chunks.length === 0) return;
    preload && (await preUploadFile(filehash)); // 架子
    console.log('架子 OK！', filehash);
    await sendRequest(filehash, chunks); // 上传切片清单
    console.log('上传切片清单 OK！', filehash);
    const result = await mergeChunks({ filehash, total: chunks.length });
    if (![201, 202].includes(result.code)) {
      throw new Error('合并切片出错！');
    } else {
      // 201 是本人合并，202 别人上传并已经合并好了，203 在合成中，403 不能合成，500 缺碎片文件，404 没这个文件
      console.log('合并切片 OK！', filehash);
      afterUploadedFile(filehash);
    }
  } catch (e: any) {
    // 上传有被 reject 的
    console.log('上传切片失败', e);
    if (e?.message) {
      message.error(e.message);
    } else {
      message.error('上传切片失败！');
    }
  } finally {
    clearFileTimer(filehash);
  }
}

/**
 * @param filehash
 * @param file
 * @param retrys 上传失败可重试次数
 */
function uploadWholeFile(filehash: string, file: File, retrys = 1) {
  // 上传
  let retryCount = 0;

  const start = async () => {
    try {
      console.time('upload');
      const result = await uploadFile({ filehash, file, onProgress: createProgressHandler(filehash) });
      console.timeEnd('upload');
      if (result.code === 203) {
        throw new Error('文件存在预上传！');
      } else if (result.code !== 201) {
        retryCount++;
        console.log(filehash, retryCount, '次报错');
        if (retryCount > retrys) {
          throw new Error('上传整个文件失败！');
        } else {
          start();
        }
      } else {
        console.log('上传整个文件 OK！', filehash);
        afterUploadedFile(filehash);
      }
    } catch (e: any) {
      console.log('upload whole', filehash, e);
      if (e?.message) {
        message.error(e.message);
      } else {
        message.error('上传文件失败！');
      }
      if (fileData[filehash]?.status === Status.uploading) {
        fileData[filehash].status = Status.error;
        fileData[filehash].progress = 0; // 需要重置
      }
    } finally {
      clearFileTimer(filehash);
    }
  };

  start();
}

async function afterUploadedFile(filehash: string) {
  try {
    const { file, chunks } = fileData[filehash];
    const { size, name } = file;
    const result = await setUploadedFile({ user_id: userId.value, name, size, md5: filehash });
    if (result.code !== 20000) {
      message.error('上传出错，请重试！');
      // 暂停所有请求
      stopUploading('other');
      throw new Error('关联上传文件出错了');
    }
    const { is_enough } = result.data;
    if (!is_enough) {
      _getCloudSpace();
      message.error('空间不足，请扩容！');
      // 暂停所有请求
      stopUploading('other');
      return;
    }

    fileData[filehash].status = Status.done;
    if (!chunks) {
      fileData[filehash].progress = 100;
    }
    // 防止 timer 提前结束，导致没有更新已经上传的字节和进度
    fileData[filehash].currentBytesUploaded = size;
    setCurrentUploadedProgress(filehash);

    init();
    circulateUploading(); // 循环
  } catch (e) {
    console.log(e); // 可能有连接中止
    message.error('上传出错，请重试！');
    fileData[filehash].status = Status.error;
    // 暂停所有请求
    stopUploading('other');
  }
}

function clearFileTimer(filehash: string) {
  // 有可能被删了：circulateUploading
  if (fileData[filehash]) {
    if (fileData[filehash].intervalTimer) {
      clearInterval(fileData[filehash].intervalTimer);
      fileData[filehash].intervalTimer = undefined;
    }
    fileData[filehash].lastProgressTimestamp = undefined;
  }
}

function getCancelRequests(hashes: string[]) {
  const abortList: Promise<any>[] = [];
  for (let i = 0; i < hashes.length; i++) {
    const filehash = hashes[i],
      item = fileData[filehash];
    if (!item) continue;
    const { file, chunks } = item;
    // 清除定时器
    clearFileTimer(filehash);
    abortList.push(checkFile(filehash, true));
    if (file.size > SIZE) {
      abortList.push(getUploadedChunks(filehash, true));
      if (chunks && chunks.length > 0) {
        abortList.push(preUploadFile(filehash, true));
        const list = chunks.filter((i) => i.status === Status.uploading);
        abortList.push(
          ...list
            .map((i) => [
              checkChunk({ filehash, index: i.index }, true),
              uploadChunk({ filehash, index: i.index, file: i.chunk }, true),
            ])
            .flat(),
        );
        abortList.push(mergeChunks({ filehash, total: chunks.length }, true));
      }
    } else {
      abortList.push(uploadFile({ filehash, file }, true));
    }
  }
  return abortList;
}

async function handlePause(file: File, hash?: string) {
  try {
    if (hash) {
      const { status } = fileData[hash];
      if (status === Status.uploading) {
        fileData[hash].status = Status.pause;
        const list = getCancelRequests([hash]);
        await Promise.all(list);
      } else if (status === Status.wait) {
        fileData[hash].status = Status.pause;
      }
    } else {
      pauseFiles.push(file);
    }
  } catch (e) {
    console.log('暂停：', hash, e);
  } finally {
    circulateUploading();
  }
}

function clickResume(file: File, hash?: string) {
  // 进入排队，并不是立即执行
  if (hash) {
    fileData[hash].status = Status.wait;
  } else {
    const pauseIndex = pauseFiles.findIndex((item) => item === file);
    pauseIndex !== -1 && pauseFiles.splice(pauseIndex, 1);
  }
  circulateUploading();
}

async function clickDelete(file: File, hash?: string) {
  try {
    if (hash) {
      fileData[hash].status = Status.pause;
      const list = getCancelRequests([hash]);
      await Promise.all(list);
    } else {
      pauseFiles.push(file);
    }
  } catch {
  } finally {
    hash && delete fileData[hash];
    const index = chooseList.findIndex((i) => i.file === file);
    if (index === -1) return;
    chooseList.splice(index, 1);
    if (chooseList.length === 0) {
      clearUploadingState();
    } else {
      circulateUploading();
    }
  }
}

/**
 * 异步并发控制策略，并发量控制成 4
 * @param filehash 文件哈希
 * @param chunks 总 chunks
 * @param max 最大可占用通道数
 * @param retrys 上传失败可重试次数
 */
async function sendRequest(filehash: string, chunks: IChunkItem[], max = 4, retrys = 3) {
  return new Promise((resolve, reject) => {
    const urls = chunks.filter((i) => i.status === Status.wait || i.status === Status.error); // 待传 chunks
    let len = urls.length;
    if (len === 0) resolve(null); // 不用再发送分片请求
    let counter = 0;
    const retryArr: any[] = [];

    const start = async () => {
      // 有请求，有通道
      while (counter < len && max > 0) {
        // 是否暂停文件上传
        if (fileData[filehash].status !== Status.uploading) {
          console.log(-2, filehash);
          const { status } = fileData[filehash];
          const str =
            status === Status.pause
              ? '暂停文件上传 -2'
              : status === Status.error
              ? '存在请求报错 -2'
              : status === Status.abort
              ? '上传中断 -2'
              : '其他 -2';
          return reject(str);
        }
        // 重新计算待传 chunks
        const list = urls.filter((i) => i.status === Status.wait || i.status === Status.error);
        if (list.length === 0) {
          // 此时没有待上传，但不一定没有正在上传
          console.log(-1, filehash);
          break;
        }
        max--; // 占用通道
        const i = Math.floor(Math.random() * list.length); // 随机数
        const { chunk, index } = list[i];
        console.log(index, typeof retryArr[index] === 'number' ? 'restart' : 'start');
        chunks[index].status = Status.uploading;
        // 检查是否已上传
        checkChunk({ filehash, index })
          .then((result) => {
            if (result.code === 200) {
              // 已上传
              chunks[index].status = Status.done;
              chunks[index].progress = 100;
              counter++;
              max++; // 释放通道
              console.log(index, '秒传');
              if (counter === len) resolve(null);
              else if (max === 1) start();
            } else if (fileData[filehash].status === Status.uploading) {
              // 上传切片
              uploadChunk({ filehash, index, file: chunk, onProgress: createProgressHandler(filehash, index) })
                .then((result) => {
                  console.log(66, result);
                  chunks[index].status = Status.done;
                  chunks[index].progress = 100;
                  counter++;
                  max++; // 释放通道
                  console.log(index, '上传 OK');
                  if (counter === len) resolve(null);
                  else if (max === 1) start();
                })
                .catch((e) => {
                  console.log('upload', filehash, index, e);
                  // 上传失败
                  chunks[index].status = Status.error;
                  // chunks[index].progress = -1;

                  if (fileData[filehash]?.status === Status.uploading) {
                    if (typeof retryArr[index] !== 'number') {
                      retryArr[index] = 0;
                    }
                    // 次数累加
                    retryArr[index]++;
                    // 一个请求报错次数
                    console.log(index, retryArr[index], '次报错');
                    if (retryArr[index] > retrys) {
                      // 文件上传失败
                      fileData[filehash].status = Status.error;
                      return reject('存在请求报错'); // 考虑 abort 所有别的
                    }
                    max++; // 仅释放当前占用的通道
                    start();
                  }
                });
            }
          })
          .catch((e) => {
            console.log('check', filehash, index, e);
            // 上传失败
            chunks[index].status = Status.error;
            // chunks[index].progress = -1;
          });
      }
    };
    start();
  });
}

function setCurrentUploadedProgress(filehash: string) {
  let temp = 0;
  if (filehash && fileData[filehash]) {
    const { file, chunks, progress } = fileData[filehash];
    if (chunks) {
      const loaded = chunks.map((item) => (item.size * item.progress) / 100).reduce((acc, cur) => acc + cur);
      temp = parseFloat(((loaded / file.size) * 100).toFixed(2));
    } else {
      temp = progress || 0;
    }
  }
  fileData[filehash].currentUploadedProgress = temp;
}

function createProgressHandler(filehash: string, index?: number) {
  return (e: AxiosProgressEvent) => {
    let temp = e.total ? parseFloat(((e.loaded / e.total) * 100).toFixed(2)) : -1;

    if (fileData[filehash].chunks && index) {
      fileData[filehash].chunks![index].progress = temp;
    } else {
      fileData[filehash].progress = temp;
    }
  };
}

// 数据块
function createFileChunk(file: File | Blob, size = SIZE) {
  // 生成文件块
  const chunks = [];
  let cur = 0;
  while (cur < file.size) {
    chunks.push({ file: file.slice(cur, cur + size) });
    cur += size;
  }
  return chunks;
}
//#endregion

//#region 计算哈希
// 用于获取切片 hash
function calculateHash(file: File | Blob, offset = file.length): Promise<any> {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    const temp = file.slice(0, offset);
    reader.readAsArrayBuffer(temp);
    reader.onload = (e: any) => {
      spark.append(e.target.result);
      resolve(spark.end());
    };
  });
}

// 抽样数据，大概 1 个 G 1 秒，如果还嫌慢，可以考虑分片 + web-worker 的方式
// 这种方式偶尔会误判 不过大体效率不错
// 可以考虑和全部的 hash 配合，因为 samplehash 不存在，就一定不存在，存在才有可能误判，有点像布隆过滤器
// console.time('samplehash');
// const samplehash = await calculateHashSample(file);
// console.timeEnd('samplehash');
// console.log(2, '抽样', samplehash);
// console.time('idleHash');
// const idleHash = await calculateHashIdle(tempChunks);
// console.timeEnd('idleHash');
// console.log(2, 'idle', idleHash);
// console.time('workerHash');
// const workerHash = await calculateHashWorker(tempChunks);
// console.timeEnd('workerHash');
// console.log(2, 'worker', workerHash);

// 如果是全量数据，与 wins · certutil -hashfile 文件名 MD5 · 计算得出的值会一致
function calculateHashSync(chunks: { file: File | Blob }[]): Promise<any> {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    let count = 0;

    const loadNext = (index: number) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(chunks[index].file);
      reader.onload = (e: any) => {
        // 累加器 不能依赖index，
        count++;
        // 增量计算md5
        spark.append(e.target.result);
        if (count === chunks.length) {
          // 通知主线程，计算结束
          resolve(spark.end());
          hashProgress.value = 100;
        } else {
          // 每个区块计算结束，通知进度即可
          hashProgress.value += 100 / chunks.length;

          // 计算下一个
          loadNext(count);
        }
      };
    };
    // 启动
    loadNext(0);
  });
  // 不计算之前的 方便一会拆解
}

function calculateHashSample(file: File): Promise<any> {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    // 文件大小
    const size = file.size;
    let offset = 2 * 1024 * 1024;

    let chunks = [file.slice(0, offset)];

    // 前面100K

    let cur = offset;
    while (cur < size) {
      // 最后一块全部加进来
      if (cur + offset >= size) {
        chunks.push(file.slice(cur, cur + offset));
      } else {
        // 中间的 前中后去两个字节
        const mid = cur + offset / 2;
        const end = cur + offset;
        chunks.push(file.slice(cur, cur + 2));
        chunks.push(file.slice(mid, mid + 2));
        chunks.push(file.slice(end - 2, end));
      }
      // 前取两个字节
      cur += offset;
    }
    // 拼接
    reader.readAsArrayBuffer(new Blob(chunks));

    // 最后100K
    reader.onload = (e: any) => {
      spark.append(e.target.result);

      resolve(spark.end());
    };
  });
}

async function calculateHashIdle(chunks: { file: File | Blob }[]) {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    let count = 0;
    const appendToSpark = async (file: File | Blob) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e: any) => {
          spark.append(e.target.result);
          resolve(null);
        };
      });
    };
    const workLoop: IdleRequestCallback = async (deadline) => {
      // 有任务，并且当前帧还没结束
      while (count < chunks.length && deadline.timeRemaining() > 1) {
        await appendToSpark(chunks[count].file);
        count++;
        // 没有了 计算完毕
        if (count < chunks.length) {
          // 计算中
          hashProgress.value = Number(((100 * count) / chunks.length).toFixed(2));
          // console.log(this.hashProgress)
        } else {
          // 计算完毕
          hashProgress.value = 100;
          resolve(spark.end());
        }
      }
      window.requestIdleCallback(workLoop);
    };
    window.requestIdleCallback(workLoop);
  });
}

function calculateHashWorker(chunks: { file: File | Blob }[]) {
  return new Promise((resolve) => {
    // web-worker 防止卡顿主线程
    worker.value = new Worker('/js/hash.js');
    worker.value.postMessage({ chunks });
    worker.value.onmessage = (e) => {
      const { progress, hash } = e.data;
      hashProgress.value = Number(progress.toFixed(2));
      if (hash) {
        resolve(hash);
      }
    };
  });
}
//#endregion
</script>

<style lang="less" scoped>
.disk-cloud {
  .file-list {
    .flex-mode(column, center, stretch);
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: #313131;
    border-radius: 0.375rem;

    &__header {
      .flex-mode(row, flex-start);
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;

      .progress {
        flex: 1;
        min-width: 31.25rem;

        p {
          .flex-mode(row, space-between);

          span {
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 500;
            font-size: 1rem;
            color: #ffffff;
            line-height: 1.375rem;
            text-align: left;
            font-style: normal;
            white-space: nowrap;
          }

          button {
            padding: 0;
            width: fit-content;
            height: 1.375rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            font-size: 1rem;
            line-height: 1.375rem;
            text-align: left;
            font-style: normal;
          }
        }
      }

      button {
        width: 9.375rem;
        height: 3.125rem;
      }

      .local-upload {
        position: relative;
        overflow: hidden;

        input {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          z-index: -1;
        }
      }
    }

    &__content {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(9.75rem, 1fr));
      gap: 1.5rem;

      .item {
        position: relative;
        .flex-mode(column);
        padding: 2rem 0.75rem 1.5rem;
        height: 13.875rem;
        border-radius: 0.375rem;
        text-align: center;
        cursor: pointer;
        transition: background 0.2s;

        &:hover,
        &.selected {
          background: #4c4c4c;

          .checkbox {
            opacity: 1;
          }
        }

        .checkbox {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          width: 1rem;
          height: 1rem;
          opacity: 0;

          img {
            position: absolute;
            width: 100%;
            height: 100%;
            transition: opacity 0.2s;

            &.hide {
              opacity: 0;
            }
          }
        }

        .file {
          width: 3.75rem;
          height: 4.5625rem;
        }

        .title {
          margin: 1.5rem 0 0.5rem;
          width: 100%;
          height: 2.75rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 1rem;
          color: #ffffff;
          line-height: 1.375rem;
          text-align: center;
          font-style: normal;
          // 省略号
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .size {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 0.75rem;
          color: #a371ff;
          line-height: 1.0625rem;
          text-align: center;
          font-style: normal;
        }
      }

      &.empty {
        .flex-mode(column);
        padding: 5.3125rem 0;

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
          text-align: center;
          font-style: normal;
        }
      }
    }

    .uploading-queue {
      position: fixed;
      bottom: 9.375rem;
      margin: 0 -1rem 0 0;
      padding: 1.5rem 1.3125rem 1rem 1.5rem;
      align-self: flex-end;

      width: 22.5rem;
      // height: 7.4375rem;
      background: #434343;
      box-shadow:
        0rem 0.5625rem 1.75rem 0.125rem rgba(0, 0, 0, 0.2),
        0rem 0.375rem 1rem -0.125rem rgba(0, 0, 0, 0.32),
        0rem 0.1875rem 0.375rem -0.25rem rgba(0, 0, 0, 0.48);
      border-radius: 0.375rem;

      h4 {
        height: 1.375rem;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 1rem;
        color: #ffffff;
        line-height: 1.375rem;
        text-align: left;
        font-style: normal;
      }

      .detail {
        .flex-mode(row, flex-start, flex-end);
        gap: 0.75rem;
        margin: 0.5625rem 0 0.25rem;
        height: 1.25rem;

        span {
          flex: 1;
          height: 1.0625rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.0625rem;
          text-align: left;
          font-style: normal;
        }

        img {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
        }
      }
    }
  }
}

:deep(.ant-progress-line) {
  margin-bottom: 0;
}

.has-progress {
  p {
    margin-bottom: 0.25rem;
  }

  .detail {
    margin: 0.25rem 0 0;
    height: 1.0625rem;
    font-family:
      PingFangSC,
      PingFang SC;
    font-weight: 400;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.0625rem;
    font-style: normal;
  }

  .btns {
    button {
      width: 11.125rem;
      flex: none;
    }
  }
}

.import-content {
  .select-mission {
    .flex-mode;

    label {
      height: 1.375rem;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 500;
      font-size: 1rem;
      color: #ffffff;
      line-height: 1.375rem;
      text-align: left;
      font-style: normal;
      white-space: nowrap;
    }

    :deep(.ant-select) {
      flex: 1;

      .ant-select-selector {
        height: 3.3125rem;
        border-radius: 0.375rem;

        .ant-select-selection-item,
        .ant-select-selection-search,
        .ant-select-selection-placeholder {
          .flex-mode(row, flex-start);
        }
      }
    }
  }
}

@media screen and (max-width: 43.75rem) {
  .disk-cloud:not(.disk-cloud-mobile) {
    .file-list {
      &__header {
        .progress {
          min-width: auto;
          flex: none;
          width: 100%;
        }
      }
    }
  }
}

// h5
.disk-cloud-mobile {
  .file-list {
    margin: 1rem 0;
    padding: 1rem;

    &__header {
      gap: 0.75rem;
      margin-bottom: 1rem;

      .progress {
        min-width: 18.4375rem;
      }

      button {
        width: 5.5rem;
        height: 2rem;
      }
    }

    &__content {
      grid-template-columns: repeat(auto-fill, minmax(18.5rem, 1fr));
      gap: 0.75rem;

      .item {
        flex-direction: row;
        padding: 0.75rem;
        height: 5.3125rem;

        &:hover {
          background: none;
        }

        &.selected {
          background: #4c4c4c;
        }

        .checkbox {
          position: relative;
          top: auto;
          left: auto;
          opacity: 1;
          order: 1;

          img {
            left: 0;
          }
        }

        .file {
          width: 3.125rem;
          height: 3.8125rem;
        }

        .file-detail {
          flex: 1;
          .flex-mode(column, space-between, flex-start);
          margin: 0 0.75rem 0 1rem;
          height: 100%;
        }

        .title {
          margin: 0 0 0.25rem;
          height: 2.5rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          text-align: left;
          font-style: normal;
        }
      }

      &.empty {
        padding: 1.25rem 0;

        img {
          margin-bottom: 0.25rem;
          width: 4.375rem;
          height: 4.375rem;
        }

        p {
          height: 1.25rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
      }
    }

    .uploading-queue {
      bottom: 6.125rem;
      padding: 1rem 1rem 0.75rem;
      width: 15.3125rem;

      h4 {
        height: 1.25rem;
        font-size: 0.875rem;
        color: #ffffff;
        line-height: 1.25rem;
      }

      .detail {
        margin-top: 0.75rem;
      }
    }
  }
}

@media screen and (max-width: 23.4375rem) {
  .disk-cloud-mobile {
    .file-list {
      &__header {
        .progress {
          min-width: auto;
          flex: none;
          width: 100%;
        }
      }

      &__content {
        grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
      }
    }
  }
}

.is-mobile {
  .import-content {
    .select-mission {
      label {
        height: 1.25rem;
        font-size: 0.875rem;
        color: #ffffff;
        line-height: 1.25rem;
      }

      :deep(.ant-select) {
        .ant-select-selector {
          height: 2.75rem;
        }
      }
    }
  }
}
</style>
