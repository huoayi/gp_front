<template>
  <Spin :spinning="spinning" wrapper-class-name="has-spin-container">
    <section class="mission-list" :class="webStore.getClassName('mission')">
      <nav-bar title="我的应用" sticky class="has-tab-list">
        <div class="tab-list-content">
          <Tabs
            :active-key="state.activeTabKey"
            class="tab-list"
            v-if="tabList.length > 0"
            @tab-click="(key: any) => clickType(key)"
          >
            <Tabs.TabPane v-for="item in tabList" :key="item.key" :tab="item.text"></Tabs.TabPane>
          </Tabs>
          <div class="switch-content">
            <Tooltip
              v-for="item in viewList"
              :title="webStore.isPc ? item.tip : undefined"
              color="#434343"
              :overlay-style="{ fontSize: '.875rem' }"
            >
              <button
                class="hover-icon-display-wrapper"
                :class="{ active: state.showDataKey === item.key }"
                @click="switchView(item.key)"
              >
                <template v-if="item.key === 'card'">
                  <img src="@/assets/img/mission/card.png" class="icon-d" />
                  <img src="@/assets/img/mission/card-hover.png" class="hover-icon" />
                </template>
                <template v-else-if="item.key === 'list'">
                  <img src="@/assets/img/mission/list.png" class="icon-d" />
                  <img src="@/assets/img/mission/list-hover.png" class="hover-icon" />
                </template>
              </button>
            </Tooltip>
          </div>
        </div>
      </nav-bar>
      <!-- 由于会出现频繁切换，这里用 v-show -->
      <div class="page-content" v-show="state.showDataKey === 'card'">
        <div class="empty-text" v-if="datasource.length === 0 && !spinning">
          <img src="@/assets/img/mission/run-none.png" alt="" />
          <p class="text-content">当前没有运行中的应用，<span @click="router.push('/aigc')">去创建一个</span></p>
        </div>
        <template v-else>
          <div class="page-card-item" v-for="(item, index) in datasource" :key="item.id">
            <div class="title-content" :class="`tag-${item.statusValue}`">
              <div class="title-content-main">
                <h4>{{ item.appName }}</h4>
                <Tooltip
                  color="#434343"
                  :overlay-style="{ fontSize: '.875rem' }"
                  :title="
                    item.isWaiting
                      ? '暂无可用GPU，可继续等待或点击停用稍后再试。'
                      : item.isStarting
                      ? '应用启动需要 1～2 分钟，请耐心等待，等待时间不进行计费。'
                      : undefined
                  "
                >
                  <span class="tag">{{ item.statusText }}</span>
                </Tooltip>
              </div>
              <div class="title-content-clock" v-if="webStore.isPc && item.hasRemainFree">
                <img src="@/assets/img/mission/clock.png" />
                <span v-if="item.isEnded">已释放</span>
                <span v-else-if="item.isCloseMachine">{{ item.remainFreeTime }}后释放</span>
                <span v-else>停用 {{ SAVE_TIME }} 天后释放</span>
              </div>
            </div>
            <div class="detail-content">
              <div class="text-btns">
                <div class="text">
                  <div>
                    <span>应用编号 ：</span>
                    <div class="flex-center validate-text" v-if="item.id">
                      <span class="value">{{ item.id }}</span>
                      <span class="img hover-icon-display-wrapper" @click="copyText(item.id)">
                        <img src="@/assets/img/copy.png" alt="" class="icon-d" />
                        <img src="@/assets/img/copy-hover.png" alt="" class="hover-icon" />
                      </span>
                    </div>
                  </div>

                  <div>
                    <span>应用版本 ：</span>
                    <span class="value">{{ item.appVersion }}</span>
                  </div>
                  <div>
                    <span>GPU 性能 ：</span>
                    <span class="value gpu-value">{{ item.gpuVersionText }}</span>
                  </div>
                  <div>
                    <span>使用方式 ：</span>
                    <span class="value">{{ item.useWayText }}</span>
                  </div>
                  <div>
                    <span>计费方式 ：</span>
                    <span class="value">{{ item.chargeWay }}{{ (item.isAutoRenewal && '（自动续费）') || '' }}</span>
                  </div>
                  <div class="consumed-cep">
                    <span>已消耗 ：</span>
                    <div class="value">
                      <img src="@/assets/img/cep.gif" />
                      <Badge
                        :count="item.consume"
                        show-zero
                        :number-style="{
                          background: 'transparent',
                          color: 'inherit',
                          boxShadow: 'none',
                          padding: 0,
                        }"
                        :overflow-count="NaN"
                      ></Badge>
                      <span>（￥{{ transferCepToRMB(item.consume) }}）</span>
                    </div>
                  </div>
                  <template v-if="item.isTime && item.validateWayData">
                    <div v-for="key in Object.keys(item.validateWayData)">
                      <span>登录{{ keyText[key] }}：</span>
                      <div class="tooltip-title validate-text" v-if="item.validateWayData[key]">
                        <span class="value">{{ item.validateWayData[key] }}</span>
                        <span class="img mr hover-icon-display-wrapper" @click="copyText(item.validateWayData[key])">
                          <img src="@/assets/img/copy.png" alt="" class="icon-d" />
                          <img src="@/assets/img/copy-hover.png" alt="" class="hover-icon" />
                        </span>
                      </div>
                      <span class="value" v-else>/</span>
                    </div>
                  </template>
                  <div v-else-if="!item.isTime">
                    <span>密钥验证：</span>
                    <Tooltip
                      v-if="item.validateWayData"
                      color="#434343"
                      placement="top"
                      :overlay-style="{ maxWidth: item.isTime ? 'fit-content' : '21.25rem' }"
                    >
                      <template #title>
                        <div :class="{ 'flex-center tooltip-title-flex': !item.isKeyPair }">
                          <p v-for="key in Object.keys(item.validateWayData)" class="tooltip-title validate-text">
                            <span>{{ keyText[key] }}：</span>
                            <span>{{ item.validateWayData[key] }}</span>
                            <span class="img hover-icon-display-wrapper">
                              <img src="@/assets/img/copy.png" alt="" class="icon-d" />
                              <img
                                src="@/assets/img/copy-hover.png"
                                alt=""
                                class="hover-icon"
                                @click="copyText(item.validateWayData[key])"
                              />
                            </span>
                          </p>
                        </div>
                      </template>
                      <div
                        class="cell-operation hover-text hover-icon-display-wrapper"
                        @click="copyText(item.validateWayData)"
                      >
                        <span class="value click-value">查看密钥</span>
                      </div>
                    </Tooltip>
                    <span v-else>/</span>
                  </div>
                  <div v-if="!webStore.isPc && item.hasRemainFree">
                    <span>释放时间：</span>
                    <span class="value" v-if="item.isEnded">已释放</span>
                    <span class="value" v-else-if="item.isCloseMachine">{{ item.remainFreeTime }}后释放 </span>
                    <span class="value" v-else>停用 {{ SAVE_TIME }} 天后</span>
                  </div>
                  <div>
                    <span>启动时间 ：</span>
                    <span class="value">{{ item.startedAt }}</span>
                  </div>
                  <div v-if="item.secondTimeName">
                    <span>{{ item.secondTimeName }} ：</span>
                    <span class="value">{{ item.secondTime }}</span>
                  </div>
                </div>
                <div class="btns">
                  <template v-for="btnItem in dataButtons[index].slice(0, 3)">
                    <Tooltip color="#434343" :overlay-style="{ fontSize: '.875rem' }" :title="btnItem.tooltipText">
                      <Button
                        type="primary"
                        :danger="btnItem.danger"
                        :loading="btnItem.loading"
                        @click="btnItem.func(index)"
                      >
                        <template #icon>
                          <img :src="Images[btnItem.key]" />
                        </template>
                        <span>{{ btnItem.text }}</span>
                      </Button>
                    </Tooltip>
                  </template>
                  <Dropdown
                    v-if="dataButtons[index].length > 3"
                    :get-popup-container="(triggerNode) => triggerNode?.parentNode as any"
                    overlay-class-name="btns__dropdown"
                  >
                    <Button class="more" type="primary">
                      <template #icon>
                        <img :src="Images['more']" />
                      </template>
                      更多
                    </Button>
                    <template #overlay>
                      <Menu>
                        <Menu.Item v-for="btnItem in dataButtons[index].slice(3)">
                          <Tooltip
                            color="#434343"
                            :overlay-style="{ fontSize: '.875rem' }"
                            :title="btnItem.tooltipText"
                          >
                            <Button type="link" :loading="btnItem.loading" @click="btnItem.func(index)">
                              <span>{{ btnItem.text }}</span>
                            </Button>
                          </Tooltip>
                        </Menu.Item>
                      </Menu>
                    </template>
                  </Dropdown>
                </div>
              </div>
              <div class="using-link">
                <template v-if="item.isTime">
                  <div
                    v-if="!['SSH', 'Ascend'].includes(item.appName)"
                    class="goto cursor-pointer"
                    :class="{ disabled: !item.isRunning, 'hover-icon-opacity-wrapper': item.isRunning }"
                    @click="item.isRunning && clickGotoApp(index)"
                  >
                    <div>
                      <h4>{{ item.appName }}</h4>
                      <p>进入应用</p>
                    </div>
                    <img src="@/assets/img/jump-to.png" class="icon-o" />
                  </div>
                  <div
                    v-else
                    class="goto"
                    :class="{ disabled: !item.isRunning, 'hover-icon-opacity-wrapper': item.isRunning }"
                  >
                    <div>
                      <h4>{{ item.appName }}&nbsp;终端地址</h4>
                      <p v-if="item.openWay">
                        <span>{{ item.openWay }}</span>
                        <img
                          @click="copyText(item.sshOpenWay)"
                          class="cursor-pointer hover-icon-opacity"
                          src="@/assets/img/copy-white.webp"
                        />
                      </p>
                    </div>
                  </div>
                </template>
                <div
                  v-if="item.showFileManagement"
                  class="goto cursor-pointer"
                  :class="{ disabled: !item.isRunning, 'hover-icon-opacity-wrapper': item.isRunning }"
                  @click="
                    {
                      item.isRunning && openUrl(item.fileManagementData.fileLink + `?type=${item.appName}`);
                      clickFileManage();
                    }
                  "
                >
                  <div>
                    <h4>文件管理</h4>
                    <p>
                      <span>上传/管理模型和插件</span>
                      <Tooltip
                        v-if="item.isRunning"
                        title="使用说明"
                        color="#434343"
                        :overlay-style="{ fontSize: '.875rem' }"
                      >
                        <span
                          class="file-tip hover-icon-opacity cursor-pointer"
                          @click.stop="openUrl(item.fileManagementData?.useIntroLink)"
                        >
                          <img src="@/assets/img/tip-white.png" />
                        </span>
                      </Tooltip>
                      <span v-else class="file-tip">
                        <img src="@/assets/img/tip-white.png" />
                      </span>
                    </p>
                  </div>
                  <img src="@/assets/img/jump-to.png" class="icon-o" />
                </div>
                <div
                  class="goto cursor-pointer"
                  v-if="!item.isTime"
                  :class="{ disabled: !item.isRunning, 'hover-icon-opacity-wrapper': item.isRunning }"
                  @click="item.isRunning && openUrl(item.apiFileLink)"
                >
                  <div>
                    <h4>API 接入文档</h4>
                  </div>
                  <img src="@/assets/img/jump-to.png" class="icon-o" />
                </div>
              </div>
            </div>
            <p class="consult">使用期间如有问题可通过页面右下角进群咨询</p>
          </div>
        </template>
      </div>
      <div class="page-content" v-show="state.showDataKey === 'list'">
        <search-table
          :prefix-data="prefixData"
          :columns="columns"
          :datasource="datasource"
          @search="clickSearch"
          :key="state.activeTabKey"
          :wrap-style="{ 'padding-top': webStore.isPc ? '1.5rem' : '1.25rem' }"
          :table-attrs="{
            rowKey: 'id',
            rowSelection: { selectedRowKeys: state.selectedRowKeys, onChange: (key) => (state.selectedRowKeys = key) },
          }"
          :total="state.pageTotal"
          ref="searchTableRef"
        >
          <template #tableHeader>
            <div class="sum-btns">
              <div>
                <span>当前应用数量：</span>
                <span class="value">{{ state.pageTotal }}</span>
              </div>
              <div>
                <Button type="primary" @click="batchDownload">
                  <template #icon>
                    <img src="@/assets/img/mission/download.png" />
                  </template>
                  <span>批量下载</span>
                </Button>
                <Button type="primary" @click="() => refreshList()" :loading="spinning || autoRefreshLoading">
                  <template #icon>
                    <img src="@/assets/img/mission/reload.png" />
                  </template>
                  <span>刷新</span>
                </Button>
              </div>
            </div>
            <Alert type="info" show-icon v-if="state.selectedRowKeys.length > 0" style="margin-bottom: 1rem">
              <template #message>
                <div class="choose-num">
                  已选择 <span>{{ state.selectedRowKeys.length }}</span> 项
                </div>
              </template>
            </Alert>
          </template>
          <template #bodyCell="{ column, text, index, record }">
            <div v-if="column.dataIndex === 'operation'" class="cell-operation cell-btns">
              <template v-for="btnItem in dataButtons[index].slice(0, 2)">
                <Tooltip color="#434343" :overlay-style="{ fontSize: '.875rem' }" :title="btnItem.tooltipText">
                  <Button type="link" size="small" :loading="btnItem.loading" @click="btnItem.func(index)">
                    {{ btnItem.text }}
                  </Button>
                </Tooltip>
              </template>
              <Dropdown
                v-if="dataButtons[index].length > 2"
                :get-popup-container="(triggerNode) => triggerNode?.parentNode as any"
                overlay-class-name="btns__dropdown"
              >
                <Button type="link" size="small">更多</Button>
                <template #overlay>
                  <Menu>
                    <Menu.Item v-for="btnItem in dataButtons[index].slice(2)">
                      <Button type="link" size="small" :loading="btnItem.loading" @click="btnItem.func(index)">
                        {{ btnItem.text }}
                      </Button>
                    </Menu.Item>
                  </Menu>
                </template>
              </Dropdown>
            </div>
            <div v-else-if="column.dataIndex === 'consume'">
              <span>{{ text }}（￥{{ record.consumeRMB }}）</span>
            </div>
            <div v-else-if="column.dataIndex === 'statusText'" :class="`status-text ${record.statusValue}`">
              <span class="circle"></span>
              <span>{{ text }}</span>
            </div>
            <template v-else-if="column.dataIndex === 'openWay'">
              <Tooltip
                v-if="text && record.isTime"
                color="#434343"
                placement="top"
                :overlay-style="{ maxWidth: '18.75rem' }"
                :title="webStore.isPc || record.appName === 'SSH' ? undefined : ''"
              >
                <template #title>
                  <div class="flex-center tooltip-title validate-text">
                    <span v-if="record.appName === 'SSH'">{{ text }}</span>
                    <span class="link-text" v-else @click="openUrl(text)">{{ text }}</span>
                    <div class="hover-icon-display-wrapper img">
                      <img src="@/assets/img/copy.png" alt="" class="icon-d" />
                      <img src="@/assets/img/copy-hover.png" class="hover-icon" alt="" @click="copyText(text)" />
                    </div>
                  </div>
                </template>
                <div class="cell-operation">
                  <span class="hover-text" v-if="record.appName === 'SSH'">应用信息</span>
                  <span class="hover-text" v-else @click="record.isRunning && clickGotoApp(index)">打开应用</span>
                </div>
              </Tooltip>
              <Tooltip
                v-else-if="record.isRunning && !record.isTime"
                color="#434343"
                placement="top"
                :overlay-style="{ maxWidth: '18.75rem' }"
              >
                <template #title>
                  <p class="tooltip-title">
                    实际按子应用计费，当前子应用数量为 {{ record.subCount }}，若查询子应用暂时仅支持 API。
                  </p>
                </template>
                <div class="cell-operation api-info hover-icon-display-wrapper" @click="openUrl(record.apiFileLink)">
                  <span>API</span>
                  <img src="@/assets/img/tip.png" alt="" class="icon-d" />
                  <img src="@/assets/img/tip-hover.png" alt="" class="hover-icon" />
                </div>
              </Tooltip>
              <span v-else>/</span>
            </template>
            <template v-else-if="column.dataIndex === 'validateWay'">
              <Tooltip
                v-if="record.isRunning && record.validateWayData"
                color="#434343"
                placement="top"
                :overlay-style="{ maxWidth: record.isTime ? 'fit-content' : '21.25rem' }"
              >
                <template #title>
                  <div :class="{ 'flex-center tooltip-title-flex': !record.isKeyPair }">
                    <p v-for="key in Object.keys(record.validateWayData)" class="tooltip-title validate-text">
                      <span>{{ keyText[key] }}：</span>
                      <span>{{ record.validateWayData[key] }}</span>
                      <span class="img hover-icon-display-wrapper">
                        <img src="@/assets/img/copy.png" alt="" class="icon-d" />
                        <img
                          src="@/assets/img/copy-hover.png"
                          alt=""
                          class="hover-icon"
                          @click="copyText(record.validateWayData[key])"
                        />
                      </span>
                    </p>
                  </div>
                </template>
                <div
                  class="cell-operation hover-text hover-icon-display-wrapper"
                  @click="copyText(record.validateWayData)"
                >
                  <template v-if="record.isTime">
                    <img class="first-icon" src="@/assets/img/mission/loginVerify.png" alt="" />
                    <span>登录验证</span>
                  </template>
                  <template v-else>
                    <img class="first-icon" src="@/assets/img/mission/keyVerify.png" alt="" />
                    <span>密钥验证</span>
                  </template>
                  <img src="@/assets/img/tip.png" alt="" class="icon-d" />
                  <img src="@/assets/img/tip-hover.png" class="hover-icon" alt="" />
                </div>
              </Tooltip>
              <span v-else>/</span>
            </template>
            <div v-else-if="column.dataIndex === 'fileManagement'">
              <Tooltip
                v-if="record.isRunning && record.showFileManagement"
                color="#434343"
                placement="top"
                :overlay-style="{ maxWidth: '18.75rem' }"
              >
                <template #title>
                  <p v-for="key in Object.keys(record.fileManagementData)" class="tooltip-title validate-text">
                    <span>{{ keyText[key] }}：</span>
                    <span class="link-text" @click="openUrl(record.fileManagementData[key])">
                      {{ record.fileManagementData[key] }}
                    </span>
                    <span class="img hover-icon-display-wrapper">
                      <img src="@/assets/img/copy.png" alt="" class="icon-d" />
                      <img
                        src="@/assets/img/copy-hover.png"
                        alt=""
                        class="hover-icon"
                        @click="copyText(record.fileManagementData[key])"
                      />
                    </span>
                  </p>
                </template>
                <span class="hover-text" @click="openUrl(record.fileManagementData?.fileLink)">打开链接</span>
              </Tooltip>
              <span v-else>/</span>
            </div>
            <div v-else-if="column.dataIndex === 'chargeWay'">
              {{ text }}{{ (record.isAutoRenewal && '（自动续费）') || '' }}
            </div>
            <span v-else>{{ text }}</span>
          </template>
          <template #emptyText>
            <div class="empty-text table-empty-text">
              <template v-if="state.isSearch">
                <img src="@/assets/img/mission/search-none.png" alt="" />
                <span class="text-content">抱歉，暂无搜索结果</span>
              </template>
              <template v-else>
                <img src="@/assets/img/mission/run-none.png" alt="" />
                <p class="text-content">当前没有运行中的应用，<span @click="router.push('/aigc')">去创建一个</span></p>
              </template>
            </div>
          </template>
        </search-table>
      </div>

      <custom-modal
        v-model:visible="gotoState.visible"
        title="使用提示"
        :width="webStore.isPc ? '26rem' : '18.75rem'"
        :show-close-icon="false"
      >
        <div class="btns-modal-content">
          <p class="warning mt-12">
            <span><img src="@/assets/img/warning.png" /></span>
            <span>请诚信交流！若有不实则封号处理</span>
          </p>
          <p class="warning">
            <span><img src="@/assets/img/warning.png" /></span>
            <span>使用过程中，如果出现连续生图失败，可能是由爆显存导致，可重启 WebUI 解决该问题。</span>
          </p>
          <div class="btns" @click="gotoApp">
            <Button type="primary">我知道了</Button>
          </div>
        </div>
      </custom-modal>
      <custom-modal
        :visible="stopState.visible"
        title="停用应用"
        :show-close-icon="false"
        :width="webStore.isPc ? '26rem' : '18.75rem'"
        @update:visible="closeStopMission"
      >
        <div class="btns-modal-content">
          <tempate v-if="stopState.hasRemainFree">
            <p class="warning mt-12">
              <span><img src="@/assets/img/warning.png" /></span>
              <span>
                停用应用后，链接将不可使用，现有应用配置将保留 {{ SAVE_TIME }} 天，
                {{ SAVE_TIME }} 天后再次创建需要重新配置。
              </span>
            </p>
            <p class="warning">
              <span><img src="@/assets/img/warning.png" /></span>
              <span>配置保留期间，如果 GPU 被占用，重新开机会失败，您可以等待占用人停用或者重新创建应用。</span>
            </p>
          </tempate>
          <p v-else class="warning">
            <span><img src="@/assets/img/warning.png" /></span>
            <span>停用应用后，链接将不可使用，现有应用配置将同时失效，再次创建后需重新配置。</span>
          </p>
          <div class="btns">
            <Button @click="closeStopMission" :disabled="stopState.loading">取消</Button>
            <Button type="primary" @click="stopMission" :loading="stopState.loading">确定</Button>
          </div>
        </div>
      </custom-modal>
      <custom-modal
        v-model:visible="missionState.visible"
        width="47.4375rem"
        :title="missionState.type === 'renewal' ? '续费' : '重新开机'"
        :full-modal="!webStore.isPc"
        class="common-aigc-choose-wrapper"
      >
        <div class="renewal-content-container common-content-container">
          <div class="little-title">选择计费方式</div>
          <div class="charge-mode flex-center">
            <Select
              v-model:value="missionState.billingType"
              :getPopupContainer="(triggerNode) => triggerNode.parentNode"
              :dropdown-match-select-width="false"
              class="base-select charge-mode-select"
              placeholder="请选择计费方式"
              @change="chooseTimeBillingType"
            >
              <Select.Option v-for="item in gpuDiscountList" :key="item.value" :value="item.value">
                <span>{{ item.label }}</span>
                <img
                  class="fire-img"
                  v-if="item.value === 'time_plan_month'"
                  src="@/assets/img/aigc/modalApp/fire.png"
                  alt=""
                />
                <div class="discount" :class="{ 'discount-month': item.value === 'time_plan_month' }">
                  <span>{{ item.discount }} 折</span>
                </div>
              </Select.Option>
            </Select>
          </div>
          <template v-if="missionState.billingType">
            <div class="little-title">选择购买时长</div>
            <div class="purchase-duration">
              <Select
                v-model:value="missionState.purchaseTime"
                :getPopupContainer="(triggerNode) => triggerNode.parentNode"
                :dropdown-match-select-width="false"
                class="base-select purchase-duration-select"
                placeholder="请选择购买时长"
              >
                <Select.Option v-for="item in purchaseTimes[missionState.billingType]?.time" :value="item" :key="item">
                  {{ item }} {{ purchaseTimes[missionState.billingType]?.unit }}
                </Select.Option>
              </Select>
              <template v-if="!missionState.currentAutoRenewal || missionState.type === 'start-machine'">
                <Checkbox id="automatic-renewal" class="check-box" v-model:checked="missionState.autoRenewal" />
                <label for="automatic-renewal" class="automatic-renewal">
                  <span>自动续费</span>
                </label>
                <Tooltip :overlay-style="{ maxWidth: '17.5rem' }">
                  <template #title>
                    <div class="commom-aigc-tooltip-title">
                      <p>1. 应用到期后自动减扣账户余额进行续费</p>
                      <p>2. 可在我的应用中随时进行关闭</p>
                      <p>3. 自动续费需要账户余额大于等于 {{ convertToCEP(minAccount.renewal) }} 脑力值</p>
                    </div>
                  </template>
                  <div class="hover-icon-display-wrapper tip-png cursor-pointer">
                    <img src="@/assets/img/tip.png" alt="" class="icon-d" />
                    <img src="@/assets/img/tip-hover.png" alt="" class="hover-icon" />
                  </div>
                </Tooltip>
              </template>
            </div>
          </template>
        </div>
        <div class="buy-now-container">
          <div class="show-price">
            <div class="cost">
              <span class="title">配置费用：</span>
              <img src="@/assets/img/cep.png" alt="" />
              <span class="red cep-num">{{ getComma(convertToCEP(sumState.costUnitValue), 'auto') }}</span>
              <span>脑力值 / {{ sumState.unit }}</span>
              <span class="price-all">( 折合</span>
              <div class="rmb">
                <span class="red">&nbsp;¥ {{ getComma(transferCepToRMB(sumState.costUnitValue), 'auto') }}&nbsp;</span>
                / {{ sumState.unit }} )
              </div>
              <span
                class="discount"
                v-if="sumState.discount"
                :class="{ 'discount-month': missionState.billingType === 'time_plan_month' }"
              >
                {{ sumState.discount }} 折
              </span>
            </div>
            <div class="balance">
              <span class="title">账户余额：{{ getComma(balanceStore.showValue) }} 脑力值</span>
              <div class="hover-icon-display-wrapper" @click="clickGotoRecharge">
                <span>去购买</span>
                <img src="@/assets/img/goto.png" alt="" class="icon-d" />
                <img src="@/assets/img/goto-hover.png" class="hover-icon" />
              </div>
            </div>
          </div>
          <Button
            v-if="sumState.canUse"
            type="primary"
            @click="missionState.type === 'renewal' ? renewalMission() : sendStartMachineMessage()"
            :loading="missionState.loading || restartMissionStatus[missionState.missionId] === 'MACHINE'"
          >
            {{ missionState.type === 'renewal' ? '立即续费' : '立即开机' }}
          </Button>
          <Button type="primary" danger v-else @click="clickGotoRecharge">去购买</Button>
        </div>
      </custom-modal>
      <custom-modal
        :visible="deleteState.visible"
        title="删除应用"
        :show-close-icon="false"
        :width="webStore.isPc ? '26rem' : '18.75rem'"
        @update:visible="closeDeleteMission"
      >
        <div class="btns-modal-content">
          <p v-if="deleteState.isCloseMachine" class="warning">
            <span><img src="@/assets/img/warning.png" /></span>
            <span>应用删除后，不会再出现在列表中，同时 GPU 会被释放，确定删除应用？</span>
          </p>
          <p v-else class="warning">
            <span><img src="@/assets/img/warning.png" /></span>
            <span>应用删除后不会再出现在列表中，确定删除应用？</span>
          </p>
          <div class="btns">
            <Button @click="closeDeleteMission" :disabled="deleteState.loading">取消</Button>
            <Button type="primary" @click="confirmDeleteMission" :loading="deleteState.loading">确定</Button>
          </div>
        </div>
      </custom-modal>
      <recharge-integration
        ref="rechargeRef"
        :has-prev-step="missionState.hasPrevStep"
        @prev-step="clickRechargeBack"
      />
      <custom-modal
        v-model:visible="initializeState.visible"
        title="恢复初始化"
        :show-close-icon="false"
        :width="webStore.isPc ? '26rem' : '18.75rem'"
      >
        <div class="btns-modal-content">
          <p>恢复后应用将还原至初始状态，应用中已上传的模型和文件将被清空，确定恢复初始化？</p>
          <div class="btns">
            <Button @click="initializeState.visible = false">取消</Button>
            <Button type="primary" @click="sendInitializeMessage">确定</Button>
          </div>
        </div>
      </custom-modal>
    </section>
  </Spin>
</template>

<script setup lang="ts">
import NavBar, { type ITabListItem } from '@/components/NavBar.vue';
import SearchTable, { type IPrefixDataItem } from '@/components/SearchTable.vue';
import type { ColumnType } from 'ant-design-vue/lib/table';
import type { Key } from 'ant-design-vue/es/table/interface';
import { Alert, Button, message, Tooltip, Tabs, Modal, Select, Checkbox, Spin, Badge } from 'ant-design-vue';
import { Dropdown, Menu } from 'ant-design-vue';
import { reactive, ref, watch, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  getMissionList,
  getSubMissionsList,
  type IMissionListParams,
  delAgreementMission,
  setAgreementMission,
  createMissionOrders,
  deleteMission,
} from '@/api/mission';
import dayjs from 'dayjs';
import Duration from 'dayjs/plugin/duration';
import { utils, writeFile } from 'xlsx';
import type { IPagination } from '@/interface/common';
import type {
  MissionType,
  UseWayType,
  TimeBillingType,
  CategoryType,
  SelectTimeBillingType,
  IGpuPriceItem,
  IGpuDiscountItem,
} from '@/interface/aigc';
import { purchaseTimes, minAccount, officalAppList, communityAppList, timeDiscounts } from '@/json/aigc';
import { useUserStore } from '@/stores/user';
import { closeOffMissions } from '@/utils/mission';
import {
  copyText,
  openUrl,
  getComma,
  transferCepToRMB,
  convertToCEP,
  getStorage,
  setStorage,
  clearTimer,
  formatMsg,
  getGpuVersionText,
  jumpTo,
} from '@/utils/common';
import { useMissionStore } from '@/stores/mission';
import { useWebStore } from '@/stores/web';
import CustomModal from '@/components/Modal.vue';
import { useBalanceStore } from '@/stores/balance';
import RechargeIntegration from '@/components/recharge/Integration.vue';
import { v4 as uuidv4 } from 'uuid';
import { setBurialPoint } from '@/api/burial';
import { getCategories, getPrices } from '@/api/aigc';
import Images from '@/assets/img/mission';

dayjs.extend(Duration);

const missionStore = useMissionStore();
const webStore = useWebStore();
const balanceStore = useBalanceStore();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

//#region common-state
const SAVE_TIME = '3'; // 停用后保留时间
type TabKey = 'all' | 'running' | 'end';
type SwitchKey = 'card' | 'list';
const state = reactive({
  activeTabKey: '' as TabKey,
  showDataKey: '' as SwitchKey,
  selectedRowKeys: [] as Key[],
  pageTotal: 0,
  params: {} as { [key: string]: any } & IPagination,
  isSearch: false,
});
const tabList: (ITabListItem<TabKey> & { values: IMissionListParams['front_state'] })[] = [
  { key: 'all', text: '全部', values: [] },
  { key: 'running', text: '运行中', values: ['waiting', 'running', 'closing'] },
  { key: 'end', text: '已关机', values: ['expired'] },
];
const viewList: { key: SwitchKey; tip: string }[] = [
  { key: 'card', tip: '卡片视图' },
  { key: 'list', tip: '列表视图' },
];
const keyText: { [key: string]: string } = {
  // table tooltip
  account: '账号',
  password: '密码',
  'Hmac-Key': '公钥',
  Hmac: '私钥',
  useIntroLink: '使用说明',
  fileLink: '文件管理',
  // card text
  gpuVersion: 'GPU 性能',
  useWay: '使用方式',
  chargeWay: '计费方式',
  loginVerify: '登录验证',
  startTime: '启动时间',
  expirationTime: '到期时间',
  // 状态
  doing: '已启动',
  waiting: '排队中',
  starting: '启动中',
  ended: '已关机',
  closing: '关闭中',
};
const datasource = ref<{ [key: string]: any }[]>([]);
const spinning = ref(false);
const autoRefreshLoading = ref(false);
const autoRefreshTimer = ref<number>();
const isLeavePage = ref(false); // 离开当前页面
const workAppList = ref<CategoryType[]>();
//#endregion

//#region table
const subOptions = {
  charge: [
    { label: '按分钟计费', value: 'time' },
    { label: '按算力消耗计费', value: 'hold', isTime: false }, // 后端有 count、hold、volume
    { label: '按小时计费', value: 'time_plan_hour' },
    { label: '按天计费', value: 'time_plan_day' },
    { label: '按周计费', value: 'time_plan_week' },
    { label: '按月计费', value: 'time_plan_month' },
  ],
  app: [...officalAppList, ...communityAppList]
    .filter((i) => i.key)
    .map((i) => ({ label: i.text, value: i.key, children: i.children, hasFileManagement: i.hasFileManagement })),
  useWay: [
    { label: '应用模式', value: 'app' },
    { label: 'API 模式', value: 'api' },
  ],
};
const prefixData = computed((): IPrefixDataItem[] => [
  { label: '应用编号', value: 'id', type: 'input' },
  {
    label: '应用名称',
    value: 'front_type',
    type: 'select',
    options: appSubOptions.value,
  },
  {
    label: '使用方式',
    value: 'front_way',
    type: 'select',
    options: subOptions.useWay,
  },
  {
    label: '计费方式',
    value: 'front_mission_billing_type',
    type: 'select',
    options: subOptions.charge as any,
  },
  { label: '应用时间', value: 'mission_time', type: 'rangepicker' },
]);
const appSubOptions = computed(() => subOptions.app.filter((i) => i.value && workAppList.value?.includes(i.value)));
const searchTableRef = ref();
const columns: ColumnType[] = [
  { dataIndex: 'id', title: '应用编号' }, // 任务号
  { dataIndex: 'appName', title: '应用名称' }, // CategoryType
  { dataIndex: 'appVersion', title: '应用版本' },
  { dataIndex: 'useWayText', title: '使用方式' }, // 应用模式（目前是指在 ex 平台调用）和 API 模式（用户自身以 http request 调用）
  { dataIndex: 'statusText', title: '应用状态' },
  { dataIndex: 'gpuVersionText', title: 'GPU 性能' },
  { dataIndex: 'chargeWay', title: '计费方式' },
  { dataIndex: 'createdAt', title: '创建时间' },
  { dataIndex: 'startedAt', title: '开始时间', sorter: true, showSorterTooltip: false },
  { dataIndex: 'expiredAt', title: '到期时间', sorter: true, showSorterTooltip: false },
  { dataIndex: 'finishedAt', title: '停用时间', sorter: true, showSorterTooltip: false },
  { dataIndex: 'remainFreeTime', title: '释放时间' },
  { dataIndex: 'consume', title: '脑力值消耗' },
  { dataIndex: 'openWay', title: '打开方式' },
  { dataIndex: 'fileManagement', title: '文件管理' },
  { dataIndex: 'validateWay', title: '验证方式' },
  { dataIndex: 'operation', title: '操作' },
  // eg. filter
  // filters 如果没有 key，将以 dataIndex 作为属性名，连同选中的值赋给 table @press-enter 对应方法接收的 filter 参数
  // {
  //   dataIndex: 'front_status',
  //   title: '应用状态',
  //   filters: [
  //     { text: '已撤销', value: 'canceled' },
  //     { text: '已失败', value: 'failed' },
  //   ],
  //   filterMultiple: false,
  // },
];
const batchData = computed((): { [key: string]: any }[] =>
  datasource.value.filter((item) => state.selectedRowKeys.includes(item.id)),
);
//#endregion

//#region card & operations
// 续费、重新开机：共用弹窗
const missionState = reactive({
  type: 'renewal' as 'renewal' | 'start-machine',
  visible: false,
  loading: false,
  hasPrevStep: false,
  // 数据项中获取
  missionId: '',
  missionCategory: '' as CategoryType,
  missionUseWay: '' as UseWayType,
  missionGpuVersion: '',
  missionType: '' as MissionType['app'],
  currentAutoRenewal: false,
  // 表单
  billingType: '' as SelectTimeBillingType,
  purchaseTime: undefined as number | undefined,
  autoRenewal: false,
});
const gpuPriceList = ref<IGpuPriceItem[]>([]);
const gpuDiscountList = computed((): IGpuDiscountItem[] => {
  const arr = timeDiscounts.map((item) => {
    const { value, label } = item;
    const { missionType, cep = 0, discount = 0 } = gpuPriceList.value.find((i) => i.billingType === value) || {};
    return { value, label, missionType, cep, discount };
  });
  return arr;
});
const sumState = computed(() => {
  const { billingType: bt, autoRenewal: renewal, purchaseTime: pt } = missionState;
  let { cep: unitCep = 0, discount = '' } = gpuDiscountList.value.find((i) => i.value === bt) || {};
  let unit = `${pt || ''} ${bt ? purchaseTimes[bt].unit : '分钟'}`;
  let costUnitValue = unitCep * (pt || 1);
  let fixcondition = renewal;
  const currentBalance = balanceStore.value;
  let canUse =
    currentBalance > costUnitValue && ((fixcondition && currentBalance >= minAccount.renewal) || !fixcondition);
  // unitCep 为 单价
  return { unitCep, unit, discount, canUse, costUnitValue };
});
// 进入应用
const gotoState = reactive({ visible: false, openUrl: '' });
// 停用
const stopState = reactive({ visible: false, loading: false, stopIds: [] as string[], hasRemainFree: false }); // stopIds 只有一个
/**
 * 共用 socket（发送/接收消息的 event_id 不同）
 * 1. 重启 UI：发送是 1，接收是 2
 * 2. 重新开机：发送是 3，接收是 4、5
 * 2. 恢复初始化：发送是 6，接收是 7
 */
const restartState = reactive<{ socket: WebSocket | null; isSended: boolean; createdCount: number; wsUuid: string }>({
  socket: null,
  isSended: false, // true 表示 ws 连接正常
  createdCount: 0,
  wsUuid: '',
});
/**
 * 注：操作需要相互互斥
 * 1. 重启 UI 和重新开机不会出现在同一个任务上，（重新开机是有弹窗确认）
 * 2. 重启 UI 和初始化会有可能同时出现在同一个任务上，存在冲突
 * 3. 以上三种操作都是属于互斥关系，需要字段识别当前操作
 * 4. status 表示 mission_id 有以上某个操作，也用于 button loading
 */
const restartMissionStatus = reactive<{ [missionId: string]: 'UI' | 'MACHINE' | 'INIT' }>({});
const restartMissionTimers = reactive<{ [missionId: string]: number }>({});
// 恢复初始化：按分钟计费不会有此操作
const initializeState = reactive({ visible: false, id: '' });

// 购买
const rechargeRef = ref();
// 滚动加载
const scrollTimer = ref<number>();
// 删除
const deleteState = reactive({ visible: false, loading: false, id: '', isCloseMachine: false });

// 按钮显示
const buttons: { key: string; text: string; danger?: boolean; tooltipText?: string; func: Function }[] = [
  { key: 'instruction', text: '使用说明', func: () => {} },
  { key: 'stop', text: '停用', func: (index: number) => singleStop(index) },
  { key: 'restart', text: '重启', func: (index: number) => sendRestartUIMessage(index) },
  { key: 'renewal', text: '续费', func: (index: number) => clickMission(index) },
  { key: 'cancel', text: '关闭自动续费', func: (index: number) => closeAutoRenewal(index) },
  { key: 'start', text: '开启自动续费', func: (index: number) => openAutoRenewal(index) },
  { key: 'initialize', text: '恢复初始化', func: (index: number) => clickInitialize(index) },
  { key: 'log', text: '查看日志', func: (index: number) => clickLog(index) },
  {
    key: 'purchase',
    text: '再次购买',
    tooltipText: '停用后的应用再次购买即为创建新应用，原应用中自行上传的模型和配置不会保存。',
    func: (index: number) => clickPurchase(index),
  },
  { key: 'start-machine', text: '重新开机', func: (index: number) => clickMission(index, 'start-machine') },
  { key: 'delete', text: '删除', danger: true, func: (index: number) => clickDelete(index) },
];
const dataButtons = computed(() =>
  datasource.value.map((item) => {
    const {
      id,
      isWaiting,
      isStarting,
      isRunning,
      isPlanTime,
      isTime,
      isAutoRenewal,
      isEnded,
      isCloseMachine,
      fileManagementData,
    } = item;
    const mayStarting = isWaiting || isStarting || isRunning;
    const status = restartMissionStatus[id];
    const temp = buttons
      .map((btnItem) => {
        const { key, text, danger, tooltipText, func } = btnItem;
        let show = true,
          loading = false;
        switch (key) {
          case 'instruction':
            show = mayStarting && false;
            break;
          case 'stop':
            show = mayStarting && ((isPlanTime && !isRunning) || !isPlanTime);
            break;
          case 'restart':
            show = isRunning && isTime && (!status || status === 'UI');
            loading = status === 'UI';
            break;
          case 'renewal':
            show = mayStarting && isPlanTime && !isAutoRenewal;
            break;
          case 'cancel':
            show = mayStarting && isPlanTime && isAutoRenewal;
            break;
          case 'start':
            show = mayStarting && isPlanTime && !isAutoRenewal;
            break;
          case 'initialize':
            show = isRunning && isPlanTime && (!status || status === 'INIT');
            loading = status === 'INIT';
            break;
          case 'log':
            show = fileManagementData?.logLink; // isRunning 下
            break;
          case 'purchase':
            show = isEnded;
            break;
          case 'start-machine':
            show = isCloseMachine;
            loading = status === 'MACHINE';
            break;
          case 'delete':
            show = isEnded || isCloseMachine;
            break;
        }
        return { key, text, danger, tooltipText, show, loading, func };
      })
      .filter((b) => b.show);
    return temp;
  }),
);
//#endregion

function clickType(key: TabKey) {
  const query = { tab: key, view: state.showDataKey };
  searchTableRef.value?.clearSearchValue();
  router.push({ path: '/mission', query });
}

function switchView(key: SwitchKey) {
  const query = { tab: state.activeTabKey, view: key };
  searchTableRef.value?.clearSearchValue();
  router.push({ path: '/mission', query });
}

function clickSearch(params: any) {
  state.isSearch = true;
  refreshList(params);
}

async function getData(params: { [key: string]: any } & IPagination, setSpinning: boolean = true) {}

function getTimeText(time: string) {
  return !time || time === '0001-01-01T00:00:00Z' ? '/' : dayjs(time).format('YYYY.MM.DD HH:mm:ss');
}

function singleStop(index: number) {
  const { id, hasRemainFree } = datasource.value[index];
  Object.assign(stopState, { stopIds: [id], hasRemainFree, visible: true });
  // 埋点
  const { userId: creator = '', phone = '' } = userStore.userInfo || {};
  setBurialPoint({
    creator,
    type: 'click_stop',
    body: { phone, missionId: [id] },
  });
}

async function stopMission() {
  try {
    stopState.loading = true;
    const { stopIds: ids } = stopState;

    // 埋点
    const { userId: creator = '', phone = '' } = userStore.userInfo || {};
    setBurialPoint({
      creator,
      type: 'click_stop_confirm',
      body: { phone, missionId: ids },
    });

    const isDeleted = await closeOffMissions(userStore.getUserKey, ids);
    if (!isDeleted) return;
    refreshList();
    // 重置选择项
    ids.forEach((id) => {
      let index = state.selectedRowKeys.findIndex((i) => i === id);
      if (index !== -1) {
        state.selectedRowKeys.splice(index, 1);
      }
    });
    message.success('操作成功！'); // 后端实际停用有延迟
    stopState.visible = false;
    missionStore.countPossibleUsingMissions();
  } catch (err) {
  } finally {
    stopState.loading = false;
  }
}

function closeStopMission() {
  if (stopState.loading) return;
  stopState.visible = false;
}

function getDownloadData(data: { [key: string]: any }[]) {
  const currentColumns = columns.filter((i) => i.dataIndex !== 'operation');
  const keys = currentColumns.map((i) => `${i.dataIndex}`);
  const values = currentColumns.map((i) => i.title);
  const temp = data.map((item) => keys.map((key) => item[key]));
  return [values, ...temp];
}

function batchDownload() {
  if (batchData.value.length === 0) {
    message.error('请先选择应用！');
    return;
  }
  const data = getDownloadData(batchData.value);
  downloadXlsx(data);
}

function downloadXlsx(data: string[][]) {
  if (data.length === 0) return;
  const ws = utils.aoa_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');
  writeFile(wb, `${state.activeTabKey || 'all'}_data.xlsx`);
  message.success('下载成功！');
}

async function refreshList(params?: any, setSpinning?: boolean) {
  await getData(params || state.params, setSpinning);
  autoRefreshList();
}

function autoRefreshList() {
  clearTimer(autoRefreshTimer);
  autoRefreshTimer.value = window.setTimeout(async () => {
    if (isLeavePage.value) {
      clearTimer(autoRefreshTimer);
      return;
    }
    if (userStore.isLogining) {
      if (spinning.value) {
        autoRefreshList();
      } else {
        // console.log(1, 'auto refresh');
        console.log(2, 'auto refresh');
        await getData(state.params, false);
        autoRefreshList();
      }
    } else {
      clearTimer(autoRefreshTimer);
    }
  }, 5000);
}

function clickMission(index: number, type: (typeof missionState)['type'] = 'renewal') {
  const {
    id,
    isPlanTime,
    billingType: bt, // time | time_plan_***
    appType: missionCategory,
    useWay: missionUseWay,
    gpuVersion: missionGpuVersion,
    missionType,
    isAutoRenewal,
  } = datasource.value[index];
  let temp: SelectTimeBillingType = isPlanTime ? bt : ''; // 当前是 isTime 包含 isPlanTime
  Object.assign(missionState, {
    type,
    visible: true,
    missionId: id,
    missionCategory,
    missionUseWay,
    missionGpuVersion,
    missionType,
    currentAutoRenewal: isAutoRenewal,
    // 设置表单默认值
    billingType: temp,
    purchaseTime: temp ? purchaseTimes[temp].time[0] : undefined,
    autoRenewal: isAutoRenewal,
  });
}

async function getGpuPriceList() {
  const { missionCategory: mc, missionType: mt, missionGpuVersion: gpu_version } = missionState;
  // 需要处理 JP
  const types: MissionType['app'][] = [];
  let temp =
    mc === 'JP'
      ? (mt.replace(/_plan/g, '') as MissionType['time'])
      : (`${mc.toLowerCase()}_time` as MissionType['time']);
  types.push(temp, `${temp}_plan`);
  const result = await getPrices({ mission_type: types, gpu_version });
  gpuPriceList.value = (result.data || []).map((item: any) => {
    let { gpu_version: version, cep, mission_type: missionType, mission_billing_type: mbt, original_cep } = item;
    let billingType = mbt === 'time' ? '' : mbt;
    let discount = ((cep / original_cep) * 10).toFixed(1);
    return { version, missionType, billingType, cep, discount };
  });
}

function chooseTimeBillingType() {
  const { billingType: bt } = missionState;
  if (bt) {
    missionState.purchaseTime = purchaseTimes[bt].time[0];
  } else {
    missionState.purchaseTime = undefined;
  }
}

async function renewalMission() {
  try {
    missionState.loading = true;
    const { missionId: id, billingType: bt, purchaseTime, autoRenewal, currentAutoRenewal } = missionState;
    if (!bt) {
      message.error('请选择计费方式！');
    } else if (!purchaseTime) {
      message.error('请选择购买时长！');
    } else {
      // 当前是开启自动续费是不展示自动续费复选框的
      if (!currentAutoRenewal && autoRenewal) {
        let type = bt.split('time_plan_')[1];
        const renewalResult = await setAgreementMission({ mission_id: id, type });
        if (renewalResult.code !== 20000) {
          message.error('自动续费失败！');
          return;
        }
      }
      const result = await createMissionOrders({
        mission_id: id,
        mission_billing_type: bt,
        buy_duration: purchaseTime,
      });
      if (result.code === 20000) {
        message.success('续费成功！');
        refreshList();
        missionState.visible = false;
      }
    }
  } catch (err) {
  } finally {
    missionState.loading = false;
  }
}

function clickGotoRecharge() {
  missionState.visible = false;
  missionState.hasPrevStep = true;
  rechargeRef.value?.clickRecharge();
}

function clickRechargeBack() {
  missionState.visible = true;
}

async function sendRestartUIMessage(index: number) {
  const { id } = datasource.value[index];
  const socket = await getRestartSocket();
  socket.send(
    JSON.stringify({
      event_id: 1,
      data: { mission_id: id },
    }),
  );

  restartMissionStatus[id] = 'UI';

  // 30s 内未收到服务端推送的消息，默认重启完成
  restartMissionTimers[id] = window.setTimeout(() => {
    console.log(id, '30 秒内未收到服务端推送的消息');
    deleteRestartMission(id);
    message.success('重启已完成！');
  }, 30 * 1000);
}

function getRestartSocket(): Promise<WebSocket> {
  return new Promise((resolve) => {
    const { socket: currentSocket } = restartState;
    if (currentSocket) resolve(currentSocket);
    const { MODE, VITE_PROD_WSS_URL, VITE_WSS_URL } = import.meta.env;
    const wssurl = MODE === 'production-local' ? VITE_PROD_WSS_URL : VITE_WSS_URL;
    // wss://www.rosabi.cn/user-center/v1/ws/{id}
    const wsUuid = getRestartWsUuid(),
      socket = new WebSocket(`${wssurl}/ws/${wsUuid}`);
    // console.log('restart', wsUuid, socket);
    Object.assign(restartState, { socket, wsUuid });
    socket.onopen = (e) => {
      console.log(1, 'restart ws open', e);
      // socket.send('');
      resolve(socket);
    };
    socket.onmessage = (e) => {
      const result = JSON.parse(e.data);
      console.log(2, 'restart ws message', result);
      if (!(result && result.data)) return;
      restartState.isSended = true;

      if (result.code !== 0) {
        message.error(formatMsg(result.message));
        // 清除 loading
        const { mission_id: id } = result.data;
        if (id) deleteRestartMission(id);
        return;
      }

      const { event_id, data } = result.data;
      if (event_id === 2) {
        // 重启结果
        const { device_name, mission_id: id, result: status } = data;
        if (!(id && device_name === wsUuid)) return;

        // 接收到消息，就不需要弹前端的 30s 【重启已完成】
        deleteRestartMission(id);

        if (status === 'succeed') {
          message.success('已重启应用！');
        } else {
          message.error('重启失败，请稍后重试！');
        }
      } else if (event_id === 4 || event_id === 5) {
        // 开机结果 | 开机过程：GPU 没有被占用
        const { device_name, old_mission_id: oid, new_mission_id: nid, result: status, err_msg } = data;
        if (!(oid && device_name === wsUuid)) return;

        if (event_id === 4) {
          // 接收到消息，就不需要弹前端的 3min 【GPU 被占用，开机失败】
          deleteRestartMission(oid);

          if (status === 'succeed') {
            refreshList();
            message.success('已开机成功！');
          } else {
            let msg = formatMsg(err_msg || '开机失败，请稍后重试！');
            message.error(msg);
          }
        } else if (event_id === 5) {
          console.log(oid, 'GPU 未被占用，正在恢复任务');
        }
      } else if (event_id === 7) {
        // 恢复初始化结果
        const { device_name, mission_id: id, result: status, err_msg } = data;
        if (!(id && device_name === wsUuid)) return;

        // 接收到消息，就不需要弹前端的 5min 【恢复结果】
        deleteRestartMission(id);

        if (status === 'succeed') {
          message.success('已恢复成功！');
        } else {
          message.error(formatMsg(err_msg || '恢复失败，请稍后尝试！'));
        }
      }
    };
    socket.onclose = (e) => {
      console.log(3, 'restart ws close', e);
      restartState.socket = null;
      socket?.close();
      // 重新创建
      if (restartState.createdCount < 1) {
        restartState.createdCount++;
        getRestartSocket();
      } else if (!restartState.isSended) {
        message.error('监测重启和重新开机生效情况失败，请尝试刷新页面！');
      }
    };
  });
}

function getRestartWsUuid() {
  const sessionUuid = getStorage({ name: 'restartWsUuid', dataType: 'string' });
  if (sessionUuid) return sessionUuid;
  const wsUuid = uuidv4();
  setStorage({ name: 'restartWsUuid', data: wsUuid });
  return wsUuid;
}

function deleteRestartMission(id: string) {
  delete restartMissionStatus[id];
  window.clearTimeout(restartMissionTimers[id]);
  delete restartMissionTimers[id];
}

async function sendStartMachineMessage() {
  console.log(1, 'start machine');
  try {
    missionState.loading = true;
    const { missionId: id, billingType: bt, purchaseTime: pt, autoRenewal, missionType } = missionState;
    if (bt && !pt) {
      message.error('请选择购买时长！');
    } else {
      // 开机是一直展示自动续费复选框的
      const socket = await getRestartSocket();
      let send = { event_id: 3, data: {} as any };
      let mission_type = getMissionType(missionType, !!bt);
      if (bt) {
        // 包时计费
        send.data = {
          mission_id: id,
          mission_type,
          billing_type: bt,
          buy_duration: pt,
          auto_renewal: autoRenewal,
          white_device_ids: [],
          black_device_ids: [],
        };
      } else {
        // 分钟计费
        send.data = {
          mission_id: id,
          mission_type,
          billing_type: 'time',
          white_device_ids: [],
          black_device_ids: [],
        };
      }
      socket.send(JSON.stringify(send));
      restartMissionStatus[id] = 'MACHINE';
      message.success('正在开机中，请耐心等待！');
      missionState.visible = false;

      // 3min 内未收到服务端推送的消息，默认 GPU 已被占用
      restartMissionTimers[id] = window.setTimeout(
        () => {
          console.log(id, '3min 内未收到服务端推送的消息');
          deleteRestartMission(id);
          message.error('GPU 已被占用，开机失败！');
        },
        3 * 60 * 1000,
      );
    }
  } catch (err) {
  } finally {
    missionState.loading = false;
  }
}

function closeAutoRenewal(index: number) {
  Modal.confirm({
    title: '确定关闭自动续费？',
    content: '关闭后，应用到期时将直接停用。',
    width: '26rem',
    cancelText: '取 消',
    okText: '确 定',
    centered: true,
    async onOk() {
      const { renewalId: id } = datasource.value[index];
      const result = await delAgreementMission(id);
      if (result.code === 20000) {
        message.success('关闭成功！');
        refreshList();
      } else {
        message.error('关闭失败！');
      }
    },
    onCancel() {},
  });
}

function openAutoRenewal(index: number) {
  const { id, isPlanTime, billingType: temp } = datasource.value[index];
  let billingType: TimeBillingType = temp;
  let unit = purchaseTimes[billingType].unit;
  Modal.confirm({
    title: '确定为应用开启自动续费？',
    content: `开启后，应用到期时将自动续费 1 个${unit}，请确认账户余额充足。`,
    width: '26rem',
    cancelText: '取 消',
    okText: '确 定',
    centered: true,
    async onOk() {
      let type = isPlanTime && /^time_plan_/.test(billingType) ? billingType.split('time_plan_')[1] : '';
      if (type) {
        const result = await setAgreementMission({ mission_id: id, type });
        if (result.code === 20000) {
          message.success('开启成功！');
          refreshList();
        } else {
          message.error('开启失败！');
        }
      }
    },
    onCancel() {},
  });
}

function clickInitialize(index: number) {
  const { id } = datasource.value[index];
  Object.assign(initializeState, { visible: true, id });
}

async function sendInitializeMessage() {
  const { id } = initializeState;
  const socket = await getRestartSocket();
  socket.send(
    JSON.stringify({
      event_id: 6,
      data: { mission_id: id },
    }),
  );

  restartMissionStatus[id] = 'INIT';

  initializeState.visible = false;

  // 5min 内未收到服务端推送的消息，默认恢复成功
  restartMissionTimers[id] = window.setTimeout(
    () => {
      console.log(id, '5min 秒内未收到服务端推送的消息');
      deleteRestartMission(id);
      message.success('初始化已完成，页面重启中，请稍等 1 - 2 分钟后刷新页面！');
    },
    5 * 60 * 1000,
  );
}

function clickLog(index: number) {
  const { fileManagementData } = datasource.value[index];
  jumpTo(fileManagementData?.logLink, '_blank');
}

function clickPurchase(index: number) {
  const {
    appType: activeKey,
    useWay,
    gpuVersion: gpuActiveVersion,
    billingType,
    buyDuration: purchaseTime,
    isAutoRenewal: automaticRenewal,
    missionType: detailMissionType, // sd_time、sd_time_plan、sd_cmd_time ...
  } = datasource.value[index];
  missionStore.purchaseData = {
    activeKey,
    useActiveKey: useWay === 'app' ? 'time' : 'hold',
    gpuActiveVersion,
    billingType: /^time_plan_/.test(billingType) ? billingType : '',
    purchaseTime,
    automaticRenewal,
    detailMissionType,
  };
  const query = communityAppList.some((i) => i.key === activeKey) ? { tab: 'community' } : {};
  router.push({ path: '/aigc', query });
}

function clickDelete(index: number) {
  const { id, isCloseMachine } = datasource.value[index];
  Object.assign(deleteState, { visible: true, id, isCloseMachine });
}

async function confirmDeleteMission() {
  try {
    deleteState.loading = true;
    const { id } = deleteState;
    if (!id) return;
    const result = await deleteMission(id);
    if (result.code === 20000) {
      message.success('删除成功！');
      refreshList();
      deleteState.visible = false;
    } else {
      message.error(formatMsg(result.msg));
    }
  } catch {
  } finally {
    deleteState.loading = false;
  }
}

function closeDeleteMission() {
  if (deleteState.loading) return;
  deleteState.visible = false;
}

const clickFileManage = () => {
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_file_manage',
    body: { phone: userStore.userInfo?.phone },
  });
};

function clickGotoApp(index: number) {
  const { appType, openWay } = datasource.value[index];
  // 埋点
  setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'click_app_link',
    body: { phone: userStore.userInfo?.phone, application: appType },
  });
  if (/^SD/.test(appType)) {
    // 仅 SD 会打开提示弹窗
    gotoState.visible = true;
    gotoState.openUrl = openWay;
  } else {
    openUrl(openWay);
  }
}

function gotoApp() {
  openUrl(gotoState.openUrl);
  gotoState.visible = false;
}

function getMissionType(type: string, isTimePlan: boolean = true) {
  if (isTimePlan) {
    return /time_plan$/.test(type) ? type : `${type}_plan`;
  } else {
    return /time_plan$/.test(type) ? type.slice(0, -5) : type;
  }
}

async function _getCategories() {
  // 由于社区镜像存在半公开
  const result = await getCategories();
  workAppList.value = (result.data || []).map((item: any) => item.mission_category);
}

onMounted(async () => {
  // 应用名称
  _getCategories();
  // 当前是 card 视图，触底发请求
  const $el = document.querySelector('.main-container .main-content-container');
  $el?.addEventListener('scroll', function (e) {
    clearTimer(scrollTimer);
    scrollTimer.value = window.setTimeout(() => {
      // console.dir($el);
      if (state.showDataKey !== 'card') return;
      console.log('card scroll');
      const { clientHeight: ch, scrollTop: st, scrollHeight: sh } = $el;
      if (sh - (ch + st) <= 200) {
        // 继续加载
        console.log(ch, st, sh);
        if (datasource.value.length !== state.pageTotal) {
          const { page_index, page_size } = state.params;
          if (page_index * page_size < state.pageTotal) {
            state.params.page_size += 10;
          }
          refreshList();
        }
      }
    }, 200);
  });
  // 埋点
  let clickType = missionStore.clickType;
  await setBurialPoint({
    creator: userStore.userInfo?.userId as string,
    type: 'page_view_my_app',
    body: { phone: userStore.userInfo?.phone, jumpType: clickType },
  });
  missionStore.clickType = 'click';
});

onUnmounted(() => {
  clearTimer(scrollTimer);
  isLeavePage.value = true;
  clearTimer(autoRefreshTimer);
});

watch(
  () => missionState.missionType,
  () => {
    getGpuPriceList();
  },
  { immediate: true, deep: true },
);

watch(
  [() => route.path, () => route.query],
  ([path, { tab, view }]) => {
    if (path !== '/mission') return;
    spinning.value = true;
    state.activeTabKey = 'all';
    if (tab) {
      let temp = `${tab}` as TabKey;
      const filters = tabList.map((i) => i.key);
      state.activeTabKey = filters.includes(temp) ? temp : 'all';
    }
    state.showDataKey = 'card';
    if (view) {
      let temp = `${view}` as SwitchKey;
      state.showDataKey = ['card', 'list'].includes(temp) ? temp : 'card';
    }

    state.selectedRowKeys = [];
    state.params = { page_index: 1, page_size: 10 };
    state.isSearch = false;

    nextTick(() => {
      searchTableRef.value?.resetPagination({ current: 1, pageSize: 10 });
    });
    refreshList();
  },
  { immediate: true, deep: true },
);
</script>

<style lang="less" scoped>
.mission-list {
  .tab-list-content {
    .flex-mode(row, space-between);
    width: 100%;

    .switch-content {
      .flex-mode;
      gap: 0.5rem;

      button {
        padding: 0.25rem 0.5rem;
        height: 1.9375rem;
        border-radius: 0.375rem;
        transition: background 0.3s;
        cursor: pointer;

        img {
          width: 1.5rem;
          height: 1.5rem;
          transition: display 1s;
        }

        &.active {
          background: #3c3c3c;

          .icon-d {
            display: none;
          }

          .hover-icon {
            display: inline;
          }
        }
      }
    }
  }

  .sum-btns {
    .flex-mode(row, space-between);
    margin-bottom: 1.5rem;

    > div {
      .flex-mode;

      .value {
        color: @color-info;
      }

      > button {
        .flex-mode;

        &:not(:last-child) {
          margin-right: 1.5rem;
        }

        img {
          margin-right: 0.5rem;
          width: 0.875rem;
          height: 0.875rem;
        }
      }
    }
  }

  .choose-num {
    color: @color-text-secondary;

    span {
      color: @color-primary;
    }
  }

  .cell-operation {
    .flex-mode(row, flex-start, center);
    white-space: nowrap;

    &.cell-btns {
      gap: 0.625rem;

      .ant-dropdown-open {
        color: #793aea;
      }
    }

    :deep(.ant-btn) {
      padding: 0;
      font-size: inherit;
    }

    &.api-info {
      .hover-text;
    }

    img {
      margin-left: 0.25rem;
      width: 0.875rem;
      height: 0.875rem;
    }

    .first-icon {
      margin-left: 0;
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  .empty-text {
    .flex-mode(column);
    height: 14.625rem;
    background: #313131;
    border-radius: 0.375rem;

    img {
      margin-bottom: 1.5rem;
      width: 5.875rem;
    }

    .text-content {
      color: @color-text-secondary;

      > span {
        .hover-text;
      }
    }
  }

  @doing-color: #52c41a;
  @waiting-color: #f0ad34;
  @starting-color: #347cf0;
  @ended-color: #ff4d4f;
  @closing-color: #949494;

  .status-text {
    .flex-mode(row, flex-start);

    .circle {
      margin-right: 0.625rem;
      width: 0.5rem;
      height: 0.5rem;
      background: @closing-color;
      border-radius: 50%;
    }

    &.doing .circle {
      background: @doing-color;
    }

    &.waiting .circle {
      background: @waiting-color;
    }

    &.starting .circle {
      background: @starting-color;
    }

    &.ended .circle {
      background: @ended-color;
    }
  }

  .page-card-item {
    margin-bottom: 1.5rem;
    padding: 0 1.5rem 1.5rem;
    background: #313131;
    border-radius: 0.375rem;

    .title-content {
      .flex-mode(row, space-between);
      margin-bottom: 1.5rem;
      height: 4.75rem;
      border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;

      font-size: 1.25rem;
      font-family:
        PingFangSC-Medium,
        PingFang SC;
      font-weight: 500;
      color: #ffffff;
      line-height: 1.75rem;

      &-main {
        .flex-mode(row, flex-start);
        margin-right: 2rem;
      }

      &-clock {
        .flex-mode;
        gap: 0.5rem;

        img {
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      &.tag-doing {
        h4::before,
        .tag {
          background: @doing-color;
        }
      }

      &.tag-waiting {
        h4::before,
        .tag {
          background: @waiting-color;
        }
      }

      &.tag-starting {
        h4::before,
        .tag {
          background: @starting-color;
        }
      }

      &.tag-ended {
        h4::before,
        .tag {
          background: @ended-color;
        }
      }

      h4 {
        position: relative;
        padding-left: 0.625rem;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 0.125rem;
          height: 1rem;
          background: @closing-color;
          border-radius: 0.125rem;
        }
      }

      .tag {
        margin: 0 0.75rem;
        padding: 0 0.4375rem;
        height: 1.25rem;
        background: @closing-color;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-family:
          PingFangSC-Medium,
          PingFang SC;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.25rem;
        text-align: center;
      }
    }

    .detail-content {
      .flex-mode(row, space-between);
      gap: 1.5rem;
      flex-wrap: wrap;

      .text-btns {
        .text {
          .flex-mode(row, flex-start);
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          max-width: 41.875rem;
          gap: 1.5rem 9.375rem;

          > div {
            .flex-mode(row, flex-start);
            width: 16rem;
            color: #ffffff;
            font-family:
              PingFangSC-Medium,
              PingFang SC;

            span {
              font-size: 1rem;
              font-weight: 500;
              line-height: 1.375rem;
              white-space: nowrap;

              &.gpu-value {
                padding: 0 0.6875rem;
                height: 1.75rem;
                background: linear-gradient(225deg, #ffffff 0%, #bababa 100%);
                border-radius: 0.25rem;
                font-size: 0.875rem;
                font-weight: 500;
                color: #313131;
                line-height: 1.75rem;
              }

              &.click-value {
                .hover-text;
              }
            }

            .value {
              font-weight: 400;
              color: @color-text;
            }

            &.consumed-cep {
              .value {
                .flex-mode;

                :deep(.ant-badge) {
                  font-size: inherit;
                  font-family: inherit;
                  color: inherit;

                  .ant-badge-count {
                    min-width: auto;
                    font-size: inherit;
                    font-family: inherit;
                    color: inherit;
                  }
                }

                img {
                  margin-right: 0.25rem;
                  width: 1.25rem;
                }
              }
            }
          }
        }

        .btns {
          .flex-mode(row, flex-start);
          flex-wrap: wrap;
          gap: 0.75rem 1.5rem;

          button {
            height: 2rem;
            border-radius: 0.25rem;
            .has-icon-btn;
            font-size: 0.875rem;
            font-family:
              PingFangSC-Regular,
              PingFang SC;
            font-weight: 400;
            transition: transform 0.3s;

            &.more {
              img {
                transform: rotate(180deg);
              }

              &.ant-dropdown-open {
                background: #6931cd;

                img {
                  transform: none;
                }
              }
            }
          }
        }
      }

      .using-link {
        .flex-mode(row, flex-start, flex-start);
        flex-wrap: wrap;
        max-width: 21.25rem;
        gap: 1.5rem;

        .goto {
          .flex-mode(row, space-between);
          padding: 0 1.5rem;
          width: 21.25rem;
          height: 4.75rem;
          background: @color-primary;
          border-radius: 0.375rem;
          color: #ffffff;
          font-family:
            PingFangSC-Medium,
            PingFang SC;

          h4 {
            height: 1.75rem;
            font-size: 1.25rem;
            font-weight: 500;
            line-height: 1.75rem;
            white-space: nowrap;
          }

          p {
            .flex-mode(row, flex-start);
            margin-top: 0.25rem;
            font-size: 0.875rem;
            font-weight: 400;

            span {
              &.file-tip,
              + img {
                margin-left: 0.375rem;
              }

              &.file-tip {
                .flex-mode;
              }
            }

            img {
              width: 0.875rem;
              height: 0.875rem;
            }
          }

          img {
            width: 1.25rem;
            height: 1.25rem;
          }

          &.disabled {
            background: #3c3c3c;
            color: rgba(255, 255, 255, 0.65);
            cursor: auto;

            img {
              opacity: 0.65;
            }
          }
        }
      }
    }

    .consult {
      margin-top: 1.6875rem;
      height: 1.0625rem;
      font-size: 0.75rem;
      font-family:
        PingFangSC-Regular,
        PingFang SC;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.65);
      line-height: 1.0625rem;
      text-align: center;
    }
  }

  :deep(.btns__dropdown) {
    font-size: inherit;

    .ant-dropdown-menu {
      background: #793aea;
      font-size: inherit;

      &-item {
        padding: 0.1875rem 0.75rem;
        font-size: inherit;

        &:hover {
          background: #8e50ff;
        }

        button {
          padding: 0rem;
          color: #ffffff;
        }
      }
    }
  }
}

@media (max-width: calc(@sidebar-width + 2rem * 2 + 66.25rem)) {
  body:not(.is-collapsed) {
    .mission-list {
      .page-card-item {
        .using-link {
          max-width: none;
        }
      }
    }
  }
}

@media (max-width: calc(@sidebar-collapsed-width + 2rem * 2 + 66.25rem)) {
  .mission-list {
    .page-card-item {
      .detail-content {
        .using-link {
          max-width: none;
        }
      }
    }
  }
}

.tooltip-title {
  font-size: 0.875rem;

  &-flex {
    justify-content: flex-start;
    flex-wrap: wrap;

    > *:not(:last-child) {
      margin-right: 0.75rem;
    }
  }

  .link-text {
    .hover-text;
  }
}

.validate-text {
  > span,
  .img {
    vertical-align: middle;
  }

  .img {
    display: inline-flex;
    margin-left: 0.25rem;
    cursor: pointer;

    &.mr {
      margin-right: 0.25rem;
    }

    img {
      width: 0.875rem;
      height: 0.875rem;
    }
  }
}

.mission-mobile {
  .tab-list-content {
    .tab-list {
      margin-right: 2rem;
      flex: 1;
      max-width: 14.0625rem;
    }
  }

  .sum-btns {
    margin-bottom: 1rem;

    > div {
      > button {
        padding: 0;
        width: 1.5rem;
        height: 1.5rem;

        &:not(:last-child) {
          margin-right: 0.5rem;
        }

        span {
          display: none;
        }

        img {
          margin-right: 0;
          width: 0.75rem;
          height: 0.75rem;
        }
      }
    }
  }

  .empty-text {
    height: 8.375rem;
    background: #313131;
    border-radius: 0.375rem;

    &.table-empty-text {
      height: fit-content;
    }

    &.table-empty-text img,
    img {
      margin-bottom: 0.8125rem;
      width: 4.375rem;
    }
  }

  .page-card-item {
    padding: 0 0 1.5rem;

    .title-content,
    .detail-content {
      padding: 0 0.75rem;
    }

    .title-content {
      margin-bottom: 0.75rem;
      height: 2.875rem;
      font-size: 1rem;
      line-height: 1.375rem;

      .tag {
        margin-left: 0.5rem;
        padding: 0 0.25rem;
        height: 1.1875rem;
        font-size: 0.75rem;
        line-height: 1.1875rem;
      }
    }

    .detail-content {
      .text-btns {
        .text {
          .flex-mode(column);
          gap: 0.75rem;

          > div {
            width: 100%;

            span {
              height: 1.25rem;
              font-size: 0.875rem;
              font-weight: 400;
              line-height: 1.25rem;

              &.gpu-value {
                padding: 0 0.5625rem;
                height: 1.5rem;
                border-radius: 0.1875rem;
                font-size: 0.75rem;
                color: #313131;
                line-height: 1.5rem;
              }
            }

            .value {
              color: @color-text-secondary;
            }
          }
        }

        .btns {
          gap: 0.75rem;
        }
      }

      .using-link {
        max-width: none;
        gap: 0.75rem;
        flex: 1;

        .goto {
          padding: 0 0.75rem;
          min-width: 16.25rem;
          width: 100%;
          height: 4.625rem;
          border-radius: 0.375rem;

          h4 {
            height: 1.375rem;
            font-size: 1rem;
            line-height: 1.375rem;
          }

          p {
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }
        }
      }
    }

    .consult {
      margin-top: 1.25rem;
    }
  }

  &-landscape {
    .page-card-item {
      .detail-content {
        .using-link {
          justify-content: flex-end;

          .goto {
            max-width: 16.25rem;
          }
        }
      }
    }
  }
}
</style>
