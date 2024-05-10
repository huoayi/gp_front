<template>
  <div class="filling">
    <span>©2023-2028 端脑科技（深圳）有限公司</span>
    <!-- ICP 备案 -->
    <a class="icp" href="https://beian.miit.gov.cn" target="_blank">粤 ICP 备 2023092687 号</a>
    <!-- 公安备案 -->
    <a
      class="security"
      target="_blank"
      href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=44030502010438"
    >
      <img src="@/assets/img/public-security.png" />
      <span>粤公网安备 44030502010438 号</span>
    </a>
  </div>
</template>

<style lang="less" scoped>
.filling {
  .flex-mode;
  gap: 0.75rem 1.5rem;
  flex-wrap: wrap;
  // height: 1.375rem;
  // 随父组件样式
  // font-size: 1rem;
  // color: #ffffff;
  font-family:
    PingFangSC-Regular,
    PingFang SC;
  font-weight: 400;

  .icp {
    color: inherit;

    // todo
    &.icp-user {
      position: absolute;
      bottom: 1.5rem;
      filter: opacity(0.65);
    }
  }

  .security {
    .flex-mode;
    color: inherit;

    img {
      width: auto;
      height: 100%;
    }

    span {
      margin-left: 0.25rem;
    }
  }
}
</style>
