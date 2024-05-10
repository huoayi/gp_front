<template>
  <section class="share-index" :class="webStore.getClassName('share')">
    <nav-bar v-if="webStore.isPc" title="邀请好友" :bread-list="breadList" sticky />
    <div class="page-content">
      <div class="title">
        <h3>邀请好友加入端脑云，一起玩转 AIGC ，领取丰厚奖励！</h3>
        <div class="btns">
          <Button type="primary" ghost @click="lookRule">查看规则</Button>
        </div>
      </div>
      <div class="operate">
        <div class="invite">
          <div class="invite-title">
            <p>我的邀请人</p>
            <div class="img-little-title">
              <img src="@/assets/img/share/gift.png" alt="" />
              <span class="little-title">填写有效邀请人可得到 {{ convertToCEP(1000) }} 脑力值 !</span>
            </div>
          </div>
          <div class="invite-input-container">
            <div class="input input-full">
              <template v-if="parentPhone.length === 0">
                <Input
                  class="input-field invite-input"
                  type="text"
                  placeholder="请输入 6 位邀请码"
                  v-model:value="parentCode"
                  @press-enter="clickBind"
                  :maxlength="6"
                />
                <Button type="primary" class="btn" @click="clickBind" :disabled="parentCode.length !== 6">
                  立即绑定
                </Button>
              </template>
              <span class="parent-phone" v-else>{{ parentPhone }}</span>
            </div>
          </div>
        </div>
        <div class="invite">
          <div class="invite-title">
            <p>我的邀请码</p>
          </div>
          <div class="invite-input-container">
            <div class="input">
              <div class="link-container flex-center">
                <span class="link">{{ state?.prefixLink }}</span>
                <span>{{ state?.inviteCode }}</span>
              </div>
              <Button type="primary" class="btn" @click="copyLink">复制邀请链接</Button>
            </div>
            <div class="input">
              <span class="code flex-center">{{ state?.inviteCode }}</span>
              <Button type="primary" class="btn" @click="copyCode">复制邀请码</Button>
            </div>
          </div>
        </div>
      </div>
      <div class="sum">
        <div>
          <p class="text">成功邀请好友数量</p>
          <p class="num">{{ tableResults.invite.total }}</p>
        </div>
        <div>
          <p class="text">获得总脑力值奖励</p>
          <div class="cep-img">
            <img src="@/assets/img/cep.png" />
            <span class="num">{{ getComma(rewardCount) }}</span>
          </div>
        </div>
        <div v-if="false">
          <p class="text">获得总渠道奖金</p>
          <span class="num">¥ {{ 0.0 }}</span>
        </div>
      </div>
      <div class="tables">
        <div v-for="item in tableData" :key="item.key">
          <p>{{ item.title }}</p>
          <search-table
            wrap-class-name="item-table"
            :show-search="false"
            :columns="item.columns"
            v-bind="tableResults[item.key]"
            @search="(_p) => getInviteList(item, _p)"
          >
            <template #emptyText>
              <div class="empty-text table-empty-text">
                <img :src="item.emptyIcon" />
                <span class="text-content">{{ item.emptyText }}</span>
              </div>
            </template>
            <template #bodyCell="{ column, text, index, record }">
              <div
                v-if="item.key === 'invite' && column.dataIndex === 'isFirstRecharge'"
                class="first-recharge"
                :class="{ is: text }"
              >
                <!-- todo：首充 -->
                <span>{{ text ? '已购买' : '未充值' }}</span>
              </div>
              <span v-else>{{ text }}</span>
            </template>
          </search-table>
        </div>
      </div>
    </div>
  </section>
  <custom-modal v-model:visible="ruleVisible" title="邀请奖励规则">
    <div class="invite-rule">
      <div class="detail" v-if="list.length > 0">
        <div v-for="item in list">
          <img :src="shareIcons[item.icon]" />
          <p>{{ item.text }}</p>
        </div>
      </div>
      <div class="explain-right">
        <span class="extra">端脑云保留随时对规则作出调整的最终解释权</span>
      </div>
    </div>
  </custom-modal>
</template>

<script setup lang="ts">
import { Button, message, Input } from 'ant-design-vue';
import NavBar, { type IBreadListItem } from '@/components/NavBar.vue';
import SearchTable from '@/components/SearchTable.vue';
import type { ColumnType } from 'ant-design-vue/es/table';
import { reactive, onMounted, ref, computed } from 'vue';
import inviteEmpty from '@/assets/img/share/invite-empty-list.png';
import rewardEmpty from '@/assets/img/share/reward-empty-list.png';
import type { IPagination } from '@/interface/common';
import {
  getInviteCode,
  getInviteUserGiftList,
  getInviteUserList,
  getInviteUserGiftCount,
  bindInvite,
  getInvitePhone,
} from '@/api/user';
import dayjs from 'dayjs';
import { copyText, getAsterisk, getComma, convertToCEP } from '@/utils/common';
import { useWebStore } from '@/stores/web';
import CustomModal from '@/components/Modal.vue';
import { useUserStore } from '@/stores/user';
import { icons as shareIcons } from '@/assets/img/user/shareRegister/index';
import { setBurialPoint } from '@/api/burial';
import { useBalanceStore } from '@/stores/balance';

const webStore = useWebStore();
const userStore = useUserStore();
const balanceStore = useBalanceStore();

const breadList: IBreadListItem[] = [{ text: '账户管理' }, { text: '邀请好友' }];

type TableKey = 'invite' | 'reward';
interface ITableItem {
  key: TableKey;
  title: string;
  columns: ColumnType[];
  emptyIcon: string;
  emptyText: string;
  searchFunc: Function;
  itemFunc: Function;
}
const tableData: ITableItem[] = [
  {
    key: 'invite',
    title: '邀请列表',
    columns: [
      { dataIndex: 'phone', title: '注册 ID' },
      { dataIndex: 'time', title: '注册时间' },
      { dataIndex: 'isFirstRecharge', title: '是否购买' },
    ],
    emptyIcon: inviteEmpty,
    emptyText: '暂无邀请',
    searchFunc: getInviteUserList,
    itemFunc: (item: any) => {
      let { phone, created_at, is_recharge: isFirstRecharge } = item;
      return {
        phone: getAsterisk(phone, 3, -4),
        time: dayjs(created_at).format('YYYY.MM.DD HH:mm:ss'),
        isFirstRecharge,
      };
    },
  },
  {
    key: 'reward',
    title: '奖励记录',
    columns: [
      { dataIndex: 'event', title: '奖励事件' },
      { dataIndex: 'time', title: '奖励时间' },
      { dataIndex: 'value', title: '奖励脑力值' },
    ],
    emptyIcon: rewardEmpty,
    emptyText: '暂无奖励',
    searchFunc: getInviteUserGiftList,
    itemFunc: (item: any) => {
      let { way, created_at, amount } = item;

      // todo：手机号
      return {
        event: rewardWayMapping[way] || '',
        time: dayjs(created_at).format('YYYY.MM.DD HH:mm:ss'),
        value: getComma(convertToCEP(amount)),
      };
    },
  },
];
const rewardWayMapping: Record<string, string> = {
  active_share: '好友完成绑定',
  first_invite_recharge: '好友完成购买', // todo：首充
  active_invite_recharge: '活动拉新奖励',
  active_bind: '绑定邀请关系',
};
const tableResults: Record<TableKey, { total: number; datasource: Record<string, any>[] }> = reactive({
  invite: { total: 0, datasource: [] },
  reward: { total: 0, datasource: [] },
});
const rewardCount = ref(0);
// 邀请奖励规则
const state = ref<{
  link: string;
  shareCep: number;
  firstRechargeCep: number;
  inviteCode: string;
  prefixLink: string;
} | null>({
  link: '',
  inviteCode: '',
  shareCep: 0,
  firstRechargeCep: 0,
  prefixLink: '',
});
const list = computed(() => {
  const { shareCep, firstRechargeCep } = state.value || {};
  let temp: { icon: string; text: string }[] = [];
  if (shareCep) {
    temp.push({ icon: 'share-register', text: `每邀请 1 位好友\n注册后可得 ${shareCep} 脑力值` });
  }
  if (firstRechargeCep) {
    temp.push({ icon: 'first-recharge', text: `好友首次购买后\n可再得 ${firstRechargeCep} 脑力值` });
  }
  return temp;
});
const ruleVisible = ref(false);
const parentCode = ref<string>('');
const parentPhone = ref<string>('');

async function getInviteList(item: ITableItem, params: IPagination) {
  const { key, searchFunc, itemFunc } = item;
  if (!searchFunc) return;
  const { data, code } = await searchFunc(params);
  if (code !== 20000) return;
  tableResults[key].datasource = data.list?.map(itemFunc) || [];
  tableResults[key].total = data.total;
}

async function getRegisterShareData() {
  const result = await getInviteCode();
  if (result.code === 20000) {
    const { invite_code, share_cep, first_recharge_cep } = result.data;
    console.log('invite code', invite_code);
    let origin = location.origin + location.pathname;
    let prefixLink = `${origin}#/share/register-landing?id=`,
      link = prefixLink + invite_code;
    let shareCep = convertToCEP(share_cep),
      firstRechargeCep = convertToCEP(first_recharge_cep);
    state.value = userStore.isActivityExist
      ? { link, prefixLink, shareCep, firstRechargeCep, inviteCode: invite_code }
      : { link, prefixLink, shareCep: 0, firstRechargeCep: 0, inviteCode: invite_code };
  } else {
    state.value = null;
  }
}

function getGiftCount() {
  getInviteUserGiftCount().then((res) => {
    if (res.code === 20000) {
      rewardCount.value = convertToCEP(res.data.total_invite_gift_cep);
    }
  });
}

function copyLink() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_invite_now',
    body: { phone: userStore.userInfo?.phone },
  });
  if (state.value?.link) {
    copyText(state.value.link, '邀请链接已复制，快去分享吧！');
  } else {
    message.error('获取失败，请稍后再试！');
  }
}

function copyCode() {
  if (state.value?.inviteCode) {
    copyText(state.value.inviteCode, '邀请码已经复制！');
  } else {
    message.error('获取失败，请稍后再试！');
  }
}

function lookRule() {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_rule',
    body: { phone: userStore.userInfo?.phone },
  });
  if (list.value.length > 0) {
    ruleVisible.value = true;
  } else {
    message.info('当前奖励规则为空！');
  }
}

async function clickBind() {
  console.log('绑定');
  if (parentCode.value.length !== 6) return;
  const res = await bindInvite(parentCode.value);
  if (res.code === 20000) {
    message.success('绑定成功！');
    getInvitePhoneFn();
    getGiftCount();
    getInviteList(tableData[1], { page_index: 1, page_size: 10 });
    balanceStore.updateValue(userStore.getToken());
  } else {
    message.error('绑定失败！');
  }
}

async function getInvitePhoneFn() {
  const res: any = await getInvitePhone();
  if (res.code === 20000) {
    parentPhone.value = res.data.parent_phone;
    parentCode.value = res.data.parent_phone;
  }
}

onMounted(() => {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'page_view_invite',
    body: { phone: userStore.userInfo?.phone },
  });
  tableData.forEach((item) => getInviteList(item, { page_index: 1, page_size: 10 }));
  // 获取邀请链接、规则
  getRegisterShareData();
  // 获取奖励总数
  getGiftCount();
  // 获取邀请人的手机号
  getInvitePhoneFn();
});
</script>

<style lang="less" scoped>
.share-index {
  .title {
    .flex-mode(row, space-between);
    margin-bottom: 1rem;
    padding: 2.75rem 2rem;
    background:
      url(@/assets/img/share/back.png) right/auto 100% no-repeat,
      @color-bg-secondary;
    border-radius: 0.375rem;

    h3 {
      margin-right: 1rem;
      font-size: 1.75rem;
      font-family:
        PingFangSC-Semibold,
        PingFang SC;
      font-weight: 600;
      color: #ffffff;
      line-height: 2.5rem;
    }

    .btns {
      .flex-mode(row, flex-end);

      button {
        width: 9.125rem;
        height: 3.375rem;

        &:first-child {
          margin-right: 2rem;
        }
      }
    }
  }

  .operate {
    .flex-mode(row, flex-start, stretch);
    flex-wrap: wrap;
    gap: 1rem 0;
    margin-bottom: 1rem;

    .invite {
      padding: 2rem;
      .flex-mode(column, center, flex-start);
      background: #313131;
      border-radius: 0.375rem;
      overflow: hidden;

      &:last-child {
        margin-right: 0;
      }

      .invite-title {
        .flex-mode(row, flex-start);

        margin-bottom: 1.5rem;
        height: 2.3125rem;
        font-size: 1.625rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 2.3125rem;
        white-space: nowrap;

        .img-little-title {
          .flex-mode(row, flex-start);

          > img {
            width: 1.5rem;
            height: 1.5rem;
            margin-left: 1rem;
            margin-right: 0.5rem;
          }

          .little-title {
            font-size: 1rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.375rem;
          }
        }
      }

      .invite-input-container {
        width: 100%;
        .flex-mode(row,space-between);
        gap: 1.5rem;
      }

      .input {
        .flex-mode(row, flex-start, center);
        gap: 1rem;

        &:first-child {
          width: calc(100% - 1rem - 17.8125rem);
        }

        &-full {
          flex: 1;
        }

        .invite-input {
          text-align: center;
          flex: 1;
          height: 3.125rem;
          background: #3c3c3c;
          border-radius: 0.375rem;
          border: 0.0625rem solid #636363;
        }

        .btn {
          padding: 0 2rem;
          height: 3.125rem;
        }

        .parent-phone {
          width: 100%;
          height: 3.125rem;
          background: #3c3c3c;
          border-radius: 0.375rem;
          white-space: nowrap;
          border: 0.0625rem solid #636363;
          line-height: 3.125rem;
          text-align: center;
        }

        .link-container {
          padding: 0 1.125rem;
          width: calc(100% - 1rem - 10rem);
          height: 3.125rem;
          background: #3c3c3c;
          border-radius: 0.375rem;
          white-space: nowrap;
          border: 0.0625rem solid #636363;

          span {
            height: 100%;
            line-height: 3rem;
          }

          .link {
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }

        .code {
          padding: 0 2.125rem;
          max-width: 7.875rem;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          height: 3.125rem;
          background: #3c3c3c;
          border-radius: 0.375rem;
          border: 0.0625rem solid #636363;
        }
      }
    }
  }

  .operate,
  .sum,
  .tables {
    .flex-mode(row, flex-start, stretch);

    > div {
      @m-right: 1rem;
      width: calc((100% - @m-right) / 2);
      margin-right: @m-right;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .sum {
    > div {
      .flex-mode(column);
      height: 11.625rem;
      background: #313131;
      border-radius: 0.375rem;

      .text {
        margin-bottom: 1.5rem;
        height: 2.3125rem;
        font-size: 1.625rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 2.3125rem;
      }

      .num {
        font-size: 2rem;
        font-family:
          PingFangSC-Semibold,
          PingFang SC;
        font-weight: 600;
        color: #ffffff;
        line-height: 2.8125rem;
      }

      .cep-img {
        .flex-mode;

        img {
          margin-right: 1rem;
          width: 2.5rem;
          height: 2.5rem;
        }
      }
    }
  }

  .tables {
    flex-wrap: wrap;

    p {
      margin: 2.5rem 0 1.5rem;
      height: 1.75rem;
      font-size: 1.25rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.75rem;
    }

    :deep(.item-table) {
      padding: 1rem;
    }

    .first-recharge {
      position: relative;
      padding: 0.375rem 0.5rem;
      width: fit-content;

      span {
        height: 1.25rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        line-height: 1.25rem;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #85ffa7;
        border-radius: 0.25rem;
        opacity: 0.25;
      }

      &.is::after {
        background: #ff85c2;
        border-radius: 0.25rem;
        opacity: 0.25;
      }
    }
  }

  .empty-text {
    img {
      width: 5.6875rem;
      height: 5.875rem;
    }
  }
}

.share-mobile {
  padding: 1.5rem 0;

  .title {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background:
      url(@/assets/img/share/wap-back.png) right/auto 100% no-repeat,
      @color-bg-secondary;

    h3 {
      font-size: 1rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.375rem;
      text-align: center;
    }

    .btns {
      justify-content: center;

      button {
        width: 7.625rem;
        height: 2.5rem;
        border-radius: 0.3125rem;

        &:first-child {
          margin-right: 1rem;
        }
      }
    }
  }

  .operate {
    .flex-mode(column, flex-start);
    gap: 1rem;

    .invite {
      padding: 1rem;
      margin: 0;
      width: 100%;

      .invite-title {
        .flex-mode(column, center, flex-start);
        gap: 0.75rem;
        margin: 0 0 0.75rem;
        height: auto;

        > p {
          font-size: 1rem;
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.375rem;
        }

        .img-little-title {
          > img {
            margin: 0;
            margin-right: 0.25rem;
            width: 1rem;
            height: 1rem;
          }

          .little-title {
            font-size: 0.75rem;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.0625rem;
          }
        }
      }

      .invite-input-container {
        .flex-mode(column, flex-start, flex-start);
        gap: 0.75rem;
      }

      .input {
        .flex-mode(row, flex-start);
        gap: 0.75rem;
        width: 100%;

        &:first-child {
          width: 100%;
        }

        .link-container {
          flex: 1;
          height: 2rem;
          background: #3c3c3c;
          border-radius: 0.125rem;
          border: 0.0625rem solid #636363;

          span {
            line-height: 1.875rem;
          }
        }

        .code {
          flex: 1;
          max-width: none;
          height: 2rem;
          background: #3c3c3c;
          border-radius: 0.125rem;
          border: 0.0625rem solid #636363;
        }

        .btn {
          padding: 0 1rem;
          height: 2rem;
          border-radius: 0.25rem;
          margin-left: 0;
        }

        .invite-input {
          width: 12.1875rem;
          height: 2rem;
          background: #3c3c3c;
          border-radius: 0.125rem;
          border: 0.0625rem solid #636363;
        }
      }
    }
  }

  .sum {
    > div {
      height: 4.9375rem;

      .text {
        margin-bottom: 0.5rem;
        height: 1.0625rem;
        font-size: 0.75rem;
        line-height: 1.0625rem;
      }

      .num {
        font-size: 1rem;
        line-height: 1.375rem;
      }

      .cep-img {
        img {
          margin-right: 0.5rem;
          width: 1rem;
          height: 1rem;
        }
      }
    }
  }

  .tables {
    p {
      margin: 1.5rem 0 1rem;
      height: 1.375rem;
      font-size: 1rem;
      line-height: 1.375rem;
    }

    .first-recharge {
      padding: 0.3125rem 0.4375rem;
    }
  }
}

@media (max-width: calc(@sidebar-collapsed-width + 64rem)) {
  .share-index {
    .tables {
      display: block;

      > div {
        width: 100%;
      }

      > div:first-child {
        margin-right: 0;
      }
    }
  }
}

@media (max-width: calc(@sidebar-width + 64rem)) {
  body:not(.is-collapsed) {
    .share-index {
      .tables {
        > div {
          width: 100%;
        }

        > div:first-child {
          margin-right: 0;
        }
      }
    }
  }
}

@media (max-width: calc(@sidebar-collapsed-width + 48rem)) {
  .share-index {
    .title {
      display: block;

      h3 {
        margin-bottom: 1rem;
      }
    }
  }
}

@media (max-width: calc(@sidebar-width + 48rem)) {
  body:not(.is-collapsed) {
    .share-index {
      .title {
        display: block;

        h3 {
          margin-bottom: 1rem;
        }
      }
    }
  }
}

@media (max-width: calc(@sidebar-collapsed-width + 39.375rem * 2 + 3.75rem)) {
  .share-index {
    .operate {
      > div {
        width: 100%;
      }

      > div:first-child {
        margin-right: 0;
      }
    }
  }
}

@media (max-width: calc(@sidebar-width + 39.375rem * 2 + 3.75rem)) {
  body:not(.is-collapsed) {
    .share-index {
      .operate {
        > div {
          width: 100%;
        }

        > div:first-child {
          margin-right: 0;
        }
      }
    }
  }
}

@media (max-width: calc(@sidebar-collapsed-width + 47.5rem)) {
  .share-index:not(.share-mobile) {
    .operate {
      .invite {
        .invite-input-container {
          .flex-mode(column, center, stretch);

          > div.input {
            width: 100%;

            .code {
              max-width: none;
              flex: 1;
            }

            .btn {
              width: 10rem;
            }
          }
        }
      }
    }
  }
}

@media (max-width: calc(@sidebar-width + 47.5rem)) {
  body:not(.is-collapsed) {
    .share-index:not(.share-mobile) {
      .operate {
        .invite {
          .invite-input-container {
            .flex-mode(column, center, stretch);

            > div {
              width: 100%;

              .code {
                max-width: none;
                flex: 1;
              }

              .btn {
                width: 10rem;
              }
            }
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
.invite-rule {
  padding: 2rem 1.25rem;

  .detail {
    .flex-mode(row, space-evenly);
    margin-bottom: 2rem;

    > div {
      text-align: center;

      img {
        margin-bottom: 1rem;
        width: 6.25rem;
        height: 6.25rem;
      }

      p {
        width: 8.75rem;
        height: auto;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Regular,
          PingFang SC;
        font-weight: 400;
        line-height: 1.5rem;
        white-space: pre-line;
      }
    }
  }
}

.is-mobile {
  .invite-rule {
    padding: 1rem;

    .detail {
      margin-bottom: 1rem;

      > div {
        img {
          margin-bottom: 0rem;
        }

        p {
          font-size: 0.75rem;
        }
      }
    }
  }
}
</style>
