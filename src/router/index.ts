import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import routes from './routes';
import { useWebStore } from '@/stores/web';
import { message } from 'ant-design-vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const store = useUserStore();
  // 检查服务是否停止
  const isStop = store.checkServiceStop();
  if (isStop) {
    if (to.name !== 'service-stop') {
      next({ name: 'service-stop' });
    } else {
      next();
    }
    return;
  } else if (to.name === 'service-stop') {
    next({ name: 'aigc' });
    return;
  }

  // 活动是否存在
  await store.getIsActivityExist();

  const webStore = useWebStore();
  // 这里需要跟 App.vue 中的 handleJump 方法保持一致
  // 手动输入地址栏，当前是 pc 但页面是 wap 页面，跳转到 aigc
  if (webStore.isPc && to.meta.isWap) {
    next({ name: 'aigc' });
    return;
  }

  // 需要检测 token：但不显示 loginModal
  const isInTokenWhiteList = ['/carnival', '/vote', '/spring'].includes(to.path);

  // 白名单
  if (to.meta.requireAuth === false) {
    next();
    if (!((to.matched.length > 1 && to.matched[0].name === 'admin') || isInTokenWhiteList)) {
      // 同 aigc 一样，需要检测 token
      return;
    }
  }
  // aigc 为后台首页，可以不需要登录就可以访问，但是检测到有 token 还是需要获取用户信息
  const isAigc = to.name === 'aigc',
    fromIsAigc = from.name === 'aigc';
  if (isAigc) next();

  const token = store.getToken();
  if (token) {
    const info = await store.getUserInfo();
    if (info) {
      // 登录后置
      next();
    } else {
      console.log('Error: userinfo failed ...');
      store.setToken('');
      // next({ name: 'aigc' });
    }
  } else if (!isAigc) {
    if (fromIsAigc && !isInTokenWhiteList) {
      store.showLoginModal = true;
    } else {
      // 考虑用户自身使用非 aigc 的地址贴到地址栏去访问的情况
      next({ name: 'aigc' });
    }
  }
});

router.onError((err) => {
  console.log('router err:', err);
  if (err.toString().indexOf('Failed to fetch dynamically imported module') > -1) {
    message.info('资源加载中，请刷新页面！');
  }
});

export default router;
