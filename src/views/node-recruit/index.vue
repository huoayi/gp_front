<template>
  <div :class="webStore.getClassName('node-recruit-content') ? 'node-recruit-content-mobile' : 'node-recruit-content'">
    <div class="title-module">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'">Cephalon&nbsp;节点招募计划</span>
    </div>

    <div :class="webStore.getClassName('date-module') ? 'date-module-mobile' : 'date-module'">
      <div class="date-time">
        2023&nbsp;年&nbsp;11&nbsp;月&nbsp;1&nbsp;日&nbsp;-&nbsp;2024&nbsp;年&nbsp;1&nbsp;月&nbsp;31&nbsp;日
      </div>
    </div>
    <div class="introduction-module-one">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'"
        >因端脑网络算力持续紧缺，处于供不应求状态，端脑网络现正式向用户开放为期三个月的节点招募计划 !
        首批接入的早期节点，将获得最优质的服务和更高的结算收益。</span
      >

      <div class="content">
        <span> 1.&nbsp;节点分成比例由&nbsp;70&nbsp;%&nbsp;上调至最高&nbsp;90&nbsp;%&nbsp;! </span>
        <hr />
        <span>
          2.&nbsp;现在预定&nbsp;Cephalon&nbsp;魔盒系列产品，可享受全额保本计划，可无理由&nbsp;100&nbsp;%&nbsp;全额退款&nbsp;!
        </span>
      </div>
    </div>
    <div class="introduction-module-two">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'"
        >Q1：节点收益怎么计算&nbsp;?&nbsp;收益有多高&nbsp;？</span
      >
      <div class="content">
        <span class="paragraph_2"
          >1.&nbsp;不同型号&nbsp;GPU&nbsp;和机器配置，收益不同，详情可点击右后下角咨询小助手;
        </span>

        <span
          >2.&nbsp;早期节点扩展阶段，平台将按照&nbsp;GPU&nbsp;型号标准定价（不考虑平台活动）的&nbsp;80&nbsp;%&nbsp;-&nbsp;90&nbsp;%&nbsp;结算节点收益，结算比例根据&nbsp;GPU&nbsp;型号和机器配置进行变动;</span
        >
        <span>3.&nbsp;节点接入网络后，可在小程序中实时查看收益，并进行提现等操作;</span>
      </div>
      <div class="form-img">
        <Carousel dots-class="dots" autoplay>
          <img
            :class="webStore.getClassName('pic')"
            v-if="webStore.isPc"
            src="@/assets/img/node-recruit/profits.png"
            alt=""
          />
          <template v-else>
            <img :class="webStore.getClassName('pic')" src="@/assets/img/node-recruit/3080.webp" alt="" />
            <img :class="webStore.getClassName('pic')" src="@/assets/img/node-recruit/天河三芯.webp" alt="" />
            <img :class="webStore.getClassName('pic')" src="@/assets/img/node-recruit/3090.webp" alt="" />
            <img :class="webStore.getClassName('pic')" src="@/assets/img/node-recruit/4090.webp" alt="" />
          </template>
        </Carousel>
      </div>
    </div>
    <div class="introduction-module-two">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'"
        >Q2：魔盒硬件什么配置&nbsp;?&nbsp;什么价位&nbsp;?</span
      >

      <span class="paragraph_2">1.&nbsp;价格请点击右下角咨询小助手；</span>
      <span>2.&nbsp;配置如下：</span>
      <div class="form-img">
        <Carousel dots-class="dots" autoplay>
          <img
            :class="webStore.getClassName('pic')"
            v-if="webStore.isPc"
            src="@/assets/img/node-recruit/表格2.webp"
            alt=""
          />
          <template v-else>
            <img :class="webStore.getClassName('pic')" src="@/assets/img/node-recruit/x.webp" alt="" />
            <img :class="webStore.getClassName('pic')" src="@/assets/img/node-recruit/pro.webp" alt="" />
            <img :class="webStore.getClassName('pic')" src="@/assets/img/node-recruit/pro-max.webp" alt="" />
          </template>
        </Carousel>
      </div>
    </div>
    <div class="introduction-module-one">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'">Q3：什么是全额保本计划 ？</span>
      <!-- <br /> -->
      <span>
        1. 为了最大程度保障早期节点的权益，在招募活动期间购买魔盒系列产品的用户均可享受 100% 全额保本回购福利；</span
      >
      <span> 2. 用户购买魔盒的 6 个月 - 1 年内，端脑科技支持用月户的购买原价进行机器回购； </span>
      <span> 3. 检查机器无损坏后，端脑科技将在 5 个工作日内支付回购款； </span>
    </div>
    <div class="introduction-module-one">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'">Q4：节点怎么接入 ？怎么退出 ？</span>
      <!-- <br /> -->
      <span> 1. 接入时需要注册 Cephalon 平台账号；</span>
      <span>
        2. 自有机器需授权端脑的技术人员远程操作安装 CephalonOS 系统并进行性能测试后接入网络，此服务不收取任何费用；
      </span>
      <span> 3. 魔盒系列机器已预装 OS 系统，插上 GPU 、电源、网线后，用小程序扫码即可加入网络； </span>
      <span>
        4. 接入后的 3 个月内不支持退出网络， 3 个月后退出网络，需提前 5 个工作日提出申请，否则会影响收益的提现；
      </span>
    </div>
    <div class="introduction-module-one">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'">Q5：节点接入后有什么要求 ？</span>
      <!-- <br /> -->
      <span> 1. 目前调度系统只支持节点完全托管；</span>
      <span> 2. 需要 24 小时开机，保持节点机器和网络的平稳运行； </span>
      <span>
        3. 若出现因意外情况导致断网、断线，将会影响已经接到任务的结算金额，需在 2
        小时内解决，超时将会造成任务的丢失影响节点收益；
      </span>
      <span>
        4.
        端脑网络调度系统会对节点的稳定性进行评分，断线次数多或时间长将导致评分下降，进而影响节点在任务分配系统的优先级；
      </span>
    </div>
    <div class="introduction-module-one">
      <span :class="webStore.getClassName('title') ? 'title-mobile' : 'title'">Q6：是否存在安全性问题 ？</span>
      <!-- <br /> -->
      <span> 1. 端脑的算力网络保证只为 AIGC 应用提供算力，不存在任何安全风险；</span>
      <span> 2. 端脑科技承诺不会用节点算力去进行其它类型任务； </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWebStore } from '@/stores/web';
import { Carousel } from 'ant-design-vue';
const webStore = useWebStore();
</script>

<style lang="less" scoped>
// h5适配
.node-recruit-content-mobile {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 1.5rem;
  // 标题样式
  .title-mobile {
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    font-size: 1rem;
    line-height: 1.375rem;
  }
  // 正文
  span {
    font-size: 0.875rem;
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.25rem;
  }

  .title-module {
    text-align: center;
    .title-mobile {
      margin-bottom: 0.5rem;
      margin-top: 1rem;
      font-size: 1.25rem;
      line-height: 1.75rem;
    }
  }
  .date-module-mobile {
    text-align: center;
    margin-top: 0.5rem;

    .date-time {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }

  .introduction-module-one {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;

    .title-mobile {
      // margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .content-mobile {
      // margin-top: .5rem;
      margin-bottom: 0.5rem;
    }
  }
  .introduction-module-two {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;

    .title-mobile {
      // margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    .content {
      display: flex;
      flex-direction: column;
      margin-top: 0.5rem;
    }
    .form-img {
      margin-top: 1rem;
      margin-bottom: 0.8125rem;
      :deep(.dots) {
        position: relative;
        bottom: -0.75rem;
        button {
          background-color: #fff;
        }
      }
      img {
        padding-right: 10px;
        width: 100%;
      }
    }
  }
}

// web
.node-recruit-content {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 4.375rem 2.625rem 0 1.5rem;
  // 标题样式
  .title {
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    color: #ffffff;
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  // 正文样式
  span {
    font-family:
      PingFangSC-Regular,
      PingFang SC;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    line-height: 1.375rem;
  }
  .title-module {
    text-align: center;
    .title {
      font-size: 2.375rem;
      line-height: 3.3125rem;
    }
  }

  .date-module {
    text-align: center;
    margin-top: 0.75rem;
    .date-time {
      font-size: 1rem;
      line-height: 1.375rem;
    }
  }
  .introduction-module-one {
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    margin-top: 1.5rem;

    .title {
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
      line-height: 28px;
    }
    span {
      line-height: 1.25rem;
    }
  }
  .introduction-module-two {
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    margin-top: 1.5rem;
    .content {
      display: flex;
      flex-direction: column;
    }
    .title {
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
    }
    span {
      line-height: 1.4rem;
    }
    .form-img {
      margin-top: 1.5rem;
      :deep(.dots) {
        position: relative;
        bottom: -0.75rem;
        button {
          background-color: #fff;
        }
      }
      img {
        padding-right: 10px;
        width: 100%;
      }
    }
  }
}
</style>
