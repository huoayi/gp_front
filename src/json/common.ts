export const CODE_COUNTDOWN = 1 * 60 - 1; // 1 min
export const ORDER_COUNTDOWN = 5 * 60 - 1; // 5 min

// 会话存储：购买状态数据存在本地缓存中的属性名，退出登陆时需要清除
export const RECHARGE_STORAGE_NAME: { [key: string]: { PAYMENT: string; CHOOSE: string } } = {
  ACCOUNT: {
    PAYMENT: 'accountRechargeData',
    CHOOSE: 'accountChooseData',
  },
  AIGC: {
    PAYMENT: 'aigcRechargeData',
    CHOOSE: 'aigcChooseData',
  },
  INTEGRATION: {
    PAYMENT: 'integrationRechargeData',
    CHOOSE: 'integrationChooseData',
  },
  SPRING: {
    PAYMENT: 'springRechargeData',
    CHOOSE: 'springChooseData',
  },
};

export const EXTRA_STORAGE_NAME: Record<string, string> = {
  INTEGRATION: 'integrationState',
};

// 永久存储 todo
export const EXTRA_LOCAL_STORAGE_NAME = {
  LOGIN_CODE_COUNTDOWN: 'loginCodeCountdown',
};

// 服务停止时间
export const SERVICE_STOP_TIME = {
  START: '2023-12-21 16',
  END: '2023-12-21 17',
};

// todo：公告展示时间：由于未做提前展示处理，暂且手动
export const NOTIFY_TIME = {
  '3080Update': {
    ADV_START: '2024-1-18 20',
    START: '2024-1-19 11',
    END: '2024-1-20 11',
  },
  // todo：del
  CepUpdate: {
    START: '2024-1-18 18',
    END: '2024-1-18 18',
  },
  ScheduledLiveStreaming: {
    START: '2024-1-26 17',
    END: '2024-2-1 18:59:59',
  },
  GotoLiveStreming: {
    START: '2024-2-1 19',
    END: '2024-2-1 21:30',
  },
  RegisterCompleteToLotto: {
    START: '2024-2-9',
    END: '2024-2-25',
  },
  GotoLotto: {
    START: '2024-2-9',
    END: '2024-2-25',
  },
};
