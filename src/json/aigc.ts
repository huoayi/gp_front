import type {
  TabKey,
  UseWayType,
  TimeBillingType,
  CategoryType,
  IClassifyAppItem,
  AppClassify,
  SelectTimeBillingType,
} from '@/interface/aigc';

export const tabList: { key: TabKey; text: string }[] = [
  { key: 'offical', text: '产品区' },
];

type Classify<T> = { key: T; text: string };

export const officalClassifyList: Classify<AppClassify['offical']>[] = [
  { key: 'new-recommend', text: '最新上线产品' },
];

export const officalAppList: IClassifyAppItem<'offical'>[] = [
  {
    fileName: 'sd',
    text: '汴梁西瓜',
    subText: '河南特产，清甜爽口，夏日神器',
    key: 'SD',
    hasFileManagement: true,
    classify: 'ai-draw',
  },
  {
    fileName: 'sd-cmd',
    text: '潮汕橄榄',
    subText: '中国橄榄看广东，广东橄榄看潮汕',
    key: 'SD_CMD',
    hasFileManagement: true,
    classify: 'ai-draw',
  },
  {
    fileName: 'comfyui',
    text: 'ComfyUI',
    subText: '基于节点流程的 Stable Diffusion，精准的工作流定制和完善的可复现性',
    key: 'COMFYUI',
    hasFileManagement: true,
    classify: ['new-recommend', 'ai-draw'],
  },
  {
    fileName: 'fooocus',
    text: 'Fooocus',
    subText: '基于 Stable Diffusion，一款简单易用的 AI 绘图工具',
    key: 'FOOOCUS',
    hasFileManagement: true,
    classify: 'ai-draw',
  },
  {
    fileName: 'super-paint',
    text: 'Stable Diffusion XL',
    subText: '模型和插件均预置好 XL 版本',
    key: 'SD_XL',
    hasFileManagement: true,
    classify: 'ai-draw',
  },
  {
    fileName: 'lora',
    text: '秋葉版 Lora 炼丹炉',
    subText: '基于秋葉安装包定制，专业 Lora 训练器',
    key: 'LORA',
    hasFileManagement: true,
    classify: ['new-recommend', 'ai-draw'],
  },
  {
    fileName: 'large-model',
    text: 'Chatchat 大语言模型',
    subText: '100% 私密性保证，支持上传语料自由训练，支持分享多人使用',
    key: 'CHATCHAT',
    classify: ['new-recommend', 'large-model'],
  },
  {
    fileName: 'dev-env',
    text: 'Jupyter',
    subText: 'AI 开发环境，内置 Anaconda、Tensorflow、Torch 等',
    key: 'JP',
    children: [
      { type: 'jp_time', text: 'Jupyter 普通版' },
      { type: 'jp_conda_time', text: 'Jupyter Conda 版' },
      // { type: 'jp_ml_time', text: 'Jupyter ML 版' },
    ],
    classify: 'dev-tool',
  },
  {
    fileName: 'tabby',
    text: 'Tabby',
    subText: '热门代码补全应用，支持主流开发工具',
    key: 'TABBY',
    classify: 'dev-tool',
  },
  {
    fileName: 'ascend',
    text: 'Ascend',
    subText: '华为昇腾大模型开发环境，A100 级别算力规模',
    key: 'ASCEND',
    classify: 'computility',
  },
  {
    fileName: 'senior-dev-env',
    text: 'Web SSH',
    subText: '高级 AI 开发环境，内置 Anaconda、Tensorflow、Torch 等',
    key: 'WT',
    classify: 'dev-tool',
  },
  {
    fileName: 'frp-ssh',
    text: 'SSH',
    subText: '完整版终端模拟器，可以兼容自定义模型',
    key: 'SSH',
    classify: 'dev-tool',
  },
  {
    fileName: 'h100-server',
    text: 'H100 裸金属服务器',
    subText: '约 10 万/月',
    key: 'H100_SERVER',
    classify: 'computility',
    perch: true,
  },
  { fileName: 'private-video', text: 'AI 私域视频创作', subText: 'Zeroscope' },
  { fileName: 'more', text: '更多应用', subText: '视频创作、音频处理、自动谱曲、自动编舞等' },
];

export const communityClassifyList: Classify<AppClassify['community']>[] = [
  { key: 'webui', text: 'WebUI' },
  { key: 'comfyui', text: 'ComfyUI' },
];

export const communityAppList: IClassifyAppItem<'community'>[] = [
  {
    fileName: 'comfyui-ke',
    text: 'ComfyUI 氪学家版',
    subText: '氪学家定制版 ComfyUI，预置大量模型、节点和完整工作流',
    key: 'COMFYUI_KE',
    stampText: '氪学家版',
    hasFileManagement: true,
    classify: 'comfyui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion 番茄版',
    subText: '一键部署 Al 绘图环境，番茄定制版 Stable Diffusion',
    key: 'SD_TOMATO',
    stampText: '番茄版',
    classify: 'webui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion BingoAI 版',
    subText: '一键部署 AI 绘图环境，BingoAI 定制版 Stable Diffusion',
    key: 'SD_BINGO',
    stampText: 'Bingo AI',
    hasFileManagement: true,
    classify: 'webui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion 哒哒猫版',
    subText: '一键部署 AI 绘图环境，哒哒猫定制版 Stable Diffusion',
    key: 'SD_CAT',
    stampText: '哒哒猫',
    hasFileManagement: true,
    classify: 'webui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion 炎推 AI 版',
    subText: '一键部署 AI 绘图环境，炎推 AI 定制版 Stable Diffusion',
    key: 'SD_FIRE',
    stampText: '炎推 AI',
    classify: 'webui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion 阿坤学 AI 版',
    subText: '一键部署 AI 绘图环境，阿坤学 AI 定制版 Stable Diffusion',
    key: 'SD_CHICK',
    stampText: '阿坤 AI',
    hasFileManagement: true,
    classify: 'webui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion 上语 AI 学院',
    subText: '一键部署 AI 绘图环境，上语 AI 学院定制版 Stable Diffusion',
    key: 'SD_WU_SHAN',
    stampText: '上语 AI',
    hasFileManagement: true,
    classify: 'webui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion 小郎君说漫画',
    subText: '一键部署 AI 绘图环境，小郎君说漫画定制版 Stable Diffusion',
    key: 'SD_LANG',
    stampText: '小郎君',
    hasFileManagement: true,
    classify: 'webui',
  },
  {
    fileName: 'sd-mirror',
    text: 'Stable Diffusion 上进 AI',
    subText: '一键部署 AI 绘图环境，上进 AI 定制版 Stable Diffusion',
    key: 'SD_SHANG_JIN',
    stampText: '上进 AI',
    hasFileManagement: true,
    classify: 'webui',
  },
  {
    fileName: 'sd-xc',
    text: 'Stable Diffusion 速推镜像',
    subText: '内置各类大模型和 lora、EB，快速生成符合需求的各类图像',
    key: 'SD_XIAO_CHUN',
    stampText: '晓春 AI',
    hasFileManagement: true,
    classify: 'webui',
  },
  {
    fileName: 'comfyui-wyf',
    text: 'ComfyUI 吴杨峰 设计师版',
    subText: '包含多个设计师常用工作流',
    key: 'COMFYUI_WU',
    stampText: '吴杨峰',
    hasFileManagement: true,
    classify: 'comfyui',
  },
];

export const useWayIntros: {
  [key in UseWayType]: { imgName: string; text: string; subText: string; useText: string };
} = {
  time: {
    imgName: 'app-icon',
    text: '应用模式',
    subText: '无须开发，即开即用',
    useText: '点击 “立即使用” 将生成应用 URL 地址并开始计费',
  },
  hold: {
    imgName: 'api-icon',
    text: 'API 模式',
    subText: '开发者模式，按算力消耗计费',
    useText: '点击 “立即使用” 将生成密钥并开始计费',
  },
};

export const useWays: { [key in CategoryType]: UseWayType[] } = {
  SD: ['time', 'hold'], // API 模式：仅静态弹窗，不调接口
  SD_CMD: ['time', 'hold'],
  WT: ['time', 'hold'],
  JP: ['time', 'hold'],
  SSH: ['time', 'hold'],
  SD_TOMATO: ['time', 'hold'],
  SD_BINGO: ['time', 'hold'],
  TABBY: ['time', 'hold'],
  FOOOCUS: ['time', 'hold'],
  SD_CAT: ['time', 'hold'],
  SD_FIRE: ['time', 'hold'],
  COMFYUI: ['time', 'hold'],
  ASCEND: ['time', 'hold'],
  SD_XL: ['time', 'hold'],
  SD_CHICK: ['time', 'hold'],
  H100_SERVER: [],
  CHATCHAT: ['time', 'hold'],
  COMFYUI_KE: ['time', 'hold'],
  SD_WU_SHAN: ['time', 'hold'],
  SD_LANG: ['time', 'hold'],
  LORA: ['time', 'hold'],
  SD_SHANG_JIN: ['time', 'hold'],
  SD_XIAO_CHUN: ['time', 'hold'],
  COMFYUI_WU: ['time', 'hold'],
};

export const gpuPerformanceText = {
  xs: '经济适用',
  s: '一般够用',
  m: '性能足够',
  'king-I': '媲美 4080',
  l: '性能优秀',
  xl: '性能出色',
  xxl: '强劲性能',
  xxxl: '极其强劲',
};

export const gpuPerformance: { [key: string]: keyof typeof gpuPerformanceText } = {
  A100: 'xxxl',
  A800: 'xxxl',
  RTX4090: 'xxl',
  V100: 'xl',
  RTX3090: 'l',
  'ComputilityKing-I': 'king-I',
  RTX3080: 'm',
  RTX4060Ti: 'm',
  RTX3070: 's',
  P40: 'xs',
  RTX2060: 'xs',
  Ascend910ProB: 'xxxl',
};

// gpu 在按分钟计费下的单价
export const gpuTimeUnitCep: { [key: string]: number } = {
  RTX3080: 15,
  RTX3090: 30,
  RTX4090: 40,
  A800: 160,
  A100: 240,
};

export const gpuPerformaceMapping: { [version: string]: { type: string; text: string } } = {};
Object.keys(gpuPerformance).forEach((key) => {
  let type = gpuPerformance[key];
  gpuPerformaceMapping[key] = { type, text: gpuPerformanceText[type] };
});

export const purchaseTimes: { [key in TimeBillingType]: { time: number[]; unit: string } } = {
  time_plan_hour: { time: [1, 2, 3, 5, 8, 12], unit: '小时' },
  time_plan_day: { time: [1, 2, 3, 4, 5, 6], unit: '天' },
  time_plan_week: { time: [1, 2, 3], unit: '周' },
  time_plan_month: { time: [1, 2, 3, 6, 12], unit: '个月' },
};

export const CEP_MAX = 10;

export const timeDiscounts: { value: SelectTimeBillingType; label: string }[] = [
  { value: '', label: '按分钟计费' },
  { value: 'time_plan_hour', label: '按小时计费' },
  { value: 'time_plan_day', label: '按天计费' },
  { value: 'time_plan_week', label: '按周计费' },
  { value: 'time_plan_month', label: '按月计费' },
];

// 限制创建任务的最低账户余额：单位为厘
export const minAccount = { hold: 1000, renewal: 20000 };
