import type { RouteRecordRaw } from 'vue-router';

// meta: requireAuth 是否需要登录，默认不写是 true，isWap 是否是 wap 页面，默认不写是 false
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/aigc',
    name: 'admin',
    component: () => import('@/components/layout/Index.vue'),
    children: [
      {
        path: '/aigc',
        name: 'aigc',
        component: () => import('@/views/aigc/index.vue'),
      },
      {
        path: '/mission',
        component: () => import('@/views/mission/list.vue'),
      },
      {
        path: '/account',
        component: () => import('@/views/account/index.vue'),
      },
      {
        path: '/api',
        component: () => import('@/views/config/index.vue'),
      },
      {
        path: '/share',
        component: () => import('@/views/share/record.vue'),
      },
      {
        path: '/node-recruit',
        component: () => import('@/views/node-recruit/index.vue'),
        meta: { title: '节点招募', requireAuth: false },
      },
      {
        path: '/disk/cloud',
        component: () => import('@/views/disk/cloud.vue'),
      },
      {
        path: '/disk/baidu',
        component: () => import('@/views/disk/baidu.vue'),
      },
    ],
  },
  {
    path: '/h5-payment',
    name: 'h5-payment',
    component: () => import('@/views/payment/h5.vue'),
    meta: { title: '支付订单', requireAuth: false },
  },
  {
    path: '/h5-success',
    name: 'h5-success',
    component: () => import('@/views/payment/success.vue'),
    meta: { title: '支付订单', requireAuth: false },
  },
  {
    path: '/share/register-landing',
    name: 'share-register-landing',
    component: () => import('@/views/share/registerLanding.vue'),
    meta: { title: '分享注册', requireAuth: false },
  },
  {
    path: '/vote',
    component: () => import('@/views/activity/vote.vue'),
    meta: { title: '端脑 & 氪学家 联名绘画大赛投票', requireAuth: false },
  },
  {
    path: '/competition',
    component: () => import('@/views/activity/competition.vue'),
    meta: { title: '端脑 & 氪学家 联名绘画大赛', requireAuth: false },
  },
  {
    path: '/carnival',
    component: () => import('@/views/activity/carnival.vue'),
    meta: { title: '端脑狂欢节', requireAuth: false },
  },
  {
    path: '/live-streaming',
    component: () => import('@/views/activity/liveStreaming.vue'),
    meta: { title: '端脑狂欢节', requireAuth: false },
  },
  {
    path: '/spring',
    component: () => import('@/views/activity/spring.vue'),
    meta: { title: '脑力风暴 幸运来袭', requireAuth: false },
  },
  {
    path: '/service-stop',
    name: 'service-stop',
    component: () => import('@/views/service/stop.vue'),
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/test/index.vue'),
    meta: { title: 'test', requireAuth: false },
  },
  {
    path: '/cephalon.pdf',
    name: 'cephalon-pdf',
    component: () => import('@/views/introduction/index.vue'),
    meta: { title: 'cephalon-pdf', requireAuth: false },
  },
  {
    path: '/test-wxcode',
    name: 'test-wxcode',
    component: () => import('@/views/test/wxCode.vue'),
    meta: { title: 'test wxcode', requireAuth: false },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404.vue'),
    meta: { title: '404', requireAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];

export default routes;
