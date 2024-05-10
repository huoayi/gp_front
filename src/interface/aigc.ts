// 有 time 和 time_plan 的只需写前缀，比如 sd_time 和 sd_time_plan：前缀为 sd；如果只有其中一个，请在 AppType 中写
type TimeType = 'time' | 'time_plan';
type TimePrefix =
  | 'sd'
  | 'sd_cmd'
  | 'jp'
  | 'wt'
  | 'ssh'
  | 'sd_tomato'
  | 'sd_bingo'
  | 'tabby'
  | 'fooocus'
  | 'jp_conda'
  | 'jp_ml'
  | 'sd_cat'
  | 'sd_fire'
  | 'comfyui'
  | 'ascend'
  | 'sd_xl'
  | 'sd_chick'
  | 'chatchat'
  | 'comfyui_ke'
  | 'sd_wu_shan'
  | 'sd_lang'
  | 'lora'
  | 'sd_shang_jin'
  | 'sd_xiao_chun'
  | 'comfyui_wu';

type AppType = {
  time: `${TimePrefix}_${Exclude<TimeType, 'time_plan'>}`;
  timePlan: `${TimePrefix}_${Exclude<TimeType, 'time'>}`;
  count: 'key_pair';
}; // 目前用于声明，值来源于接口，time 属性值存在使用

export type MissionType = {
  basic: 'txt2img' | 'img2img' | 'extra-single-image'; // 只用于声明，值来源于接口
  time: AppType['time'];
  app: AppType[keyof AppType];
  category: // 用于声明和使用，值需要从后端得知
  | 'SD'
    | 'SD_CMD'
    | 'JP'
    | 'WT'
    | 'SSH'
    | 'SD_TOMATO'
    | 'SD_BINGO'
    | 'TABBY'
    | 'FOOOCUS'
    | 'SD_CAT'
    | 'SD_FIRE'
    | 'COMFYUI'
    | 'ASCEND'
    | 'SD_XL'
    | 'SD_CHICK'
    | 'H100_SERVER'
    | 'CHATCHAT'
    | 'COMFYUI_KE'
    | 'SD_WU_SHAN'
    | 'SD_LANG'
    | 'LORA'
    | 'SD_SHANG_JIN'
    | 'SD_XIAO_CHUN'
    | 'COMFYUI_WU';
  // 后端的计次：count 对应文生图、图生图、单独放大图，hold 对应 key_pair（目前只有 sd 存在，即创建任务选中 api 模式时，属于占位任务），volume 对应 sd_api
  // 其中 hold 的子任务会包括 conut 和 volume，本平台目前只涉及 time 和 hold 的使用
  billing: 'time' | 'count' | 'hold' | 'volume'; // 值来源于接口
  timeBilling: 'time_plan_hour' | 'time_plan_day' | 'time_plan_week' | 'time_plan_month'; // 值来源于接口
};

export type MissionStatus = 'waiting' | 'doing' | 'succeed' | 'canceled' | 'failed' | 'supplying' | 'closing';

export type UseWayType = Exclude<MissionType['billing'], 'count' | 'volume'>; // 总的计费类型：应用模式和 API 模式，也就是计时和计次的任务
export type TimeBillingType = MissionType['timeBilling'];
export type SelectTimeBillingType = TimeBillingType | undefined | '';
export type CategoryType = MissionType['category'];

export interface IAppItem {
  fileName: string; // icon
  text: string;
  subText?: string;
  key?: CategoryType;
  stampText?: string; // 印章文字
  children?: {
    type: MissionType['time'];
    text: string;
  }[]; // 基于基础镜像如 sd、jupyter 等衍生出额外带有其他功能的镜像，整合成【应用版本】选择项
  hasFileManagement?: boolean; // 是否有文件管理
  perch?: boolean; // 前端占位使用，并非真的应用
}

export type AppClassify = {
  offical: 'new-recommend' | 'ai-draw' | 'large-model' | 'dev-tool' | 'computility';
  community: 'webui' | 'comfyui';
};

export type TabKey = keyof AppClassify;
export type ClassifyValue = AppClassify[TabKey];

export interface IClassifyAppItem<T extends keyof AppClassify> extends IAppItem {
  classify?: AppClassify[T] | AppClassify[T][];
}

export type GpuType = 'RTX' | 'NVIDIA' | 'ComputilityKing-I' | 'Ascend';

export interface IWorkGpuListItem {
  version: string;
  text: string;
  type: GpuType;
  missionType: MissionType['time'];
  performType: string;
  preformText: string;
  isDisabled: boolean;
  gpuDetail: { cpu: string; memory: string; videoMemory: string };
  isHotGpu: boolean;
}

export interface IGpuPriceItem {
  version: string;
  missionType?: MissionType['app'];
  billingType: SelectTimeBillingType;
  cep: number;
  discount: number | string; // x.x
}

export interface IGpuDiscountItem extends Omit<IGpuPriceItem, 'version' | 'billingType'> {
  value: SelectTimeBillingType;
  label: string;
}

export interface ICreateMissionData {
  activeKey: IAppItem['key'];
  useActiveKey: UseWayType;
  gpuActiveVersion: string;
  // 注意：这里主要用的是包时长的类型，为空串表示为计时／计次类型，为 undefined 表示用户未选择
  billingType: SelectTimeBillingType;
  purchaseTime: number | undefined;
  automaticRenewal: boolean;
}
