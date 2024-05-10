# Cephalon Exchange

### 项目技术栈

vue3 + vue-router4 + pinia + typescript + ant-design-vue + axios

### 开发环境

- 本地确保安装 yarn
  ```
  npm install yarn -g
  ```
- 安装依赖
  ```
  yarn
  ```
- 启动
  ```
  yarn start
  ```
- 构建
  ```
  yarn build:master
  ```

### 项目结构

```
├── src
│   ├── api --- 放置请求函数
│   ├── assets --- 放置一些图片、样式等静态文件
│   ├── components --- 全局通用组件编写
│   ├── interface --- 接口定义
│   ├── json  --- 静态数据
│   ├── router --- 路由文件
│   ├── stores --- 状态管理文件
│   ├── utils --- 放置工具方法
│   ├── views --- 页面组件编写
└── index.html --- vite 打包入口文件
```

### 注意事项

- 代码格式化：
  - 本地开发工具确保安装 Prettier 插件
- InputCaptcha 组件：
  - 尽量不使用 `v-model:field` ，而是使用 `:field` 和 `@update:field`（在构建时 vite 会抛出字段为常量的提示信息）
- 本地测试支付：
  - 由于支付宝后台配置网页授权只有一个，目前是正式环境的，因此需要测试支付宝支付时使用 `yarn start:prod` 调用正式环境接口
  - 微信支付配置可多个，因此调测试或正式接口无限制
- 本地测试微信扫码登录：
  - 微信服务器配置回调地址只有一个，目前是正式环境的，因此需要做相关更改时，请与后端协同调试
- 微信网页授权获取用户 code：
  - 参照 @/views/test/wxCode.vue
  - https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
- Antdv message config：
  - 目前只在 src/main.ts 设置相关配置，更改会影响所有引用 message 的地方；如果需要存在不同配置的 message，可以尝试使用 Antdv 提供的 useMessage
- 侧边栏宽度需要维护两处常量，并保持一致：
  - values.less 中的 `@sidebar-width` 和 `@sidebar-collapsed-width`
  - Sider.vue 的 `sidebar` 中对应的 `width` 和 `collapsedWidth`
- 登录后置：
  - 判断用户操作是否需要登录才能继续：使用 @/utils/common.ts 中的 `beforeOperation` 方法
- 测试环境自动部署：
  - 后端添加了 .github 文件夹及 docker-compose.yaml、Dockerfile 文件，有相关疑问请询问后端
  - 用法：将分支 test 或 feat/optimize（根据 docker-image-test.yml 中 push: branches）推到远程仓库 https://github.com/false-z/exchange.git，在 https://github.com/false-z/exchange/actions 中可查看部署情况
- 日期 & dayjs
  - IOS 不识别 dayjs('2024.1.1')，可以识别 dayjs('2024-1-1')
- 接口响应结果处理（错误提示语）
  - 以 3 / 4 开头，给后端接口响应结果的 msg
    - 如需排除某些情况下需要不弹出 msg，在 @/utils/request.ts 中做限制
    - 当 msg 不存在或者替换后端的 msg，可在具体业务场景下设置错误提示语（只允许同一时间弹出一条消息提示语）
  - 以 5 开头不展示具体的错误，会抛出异常

### 文件命名规范

- 目录
  采用：`小驼峰方式`，如有复数结构（文件夹包含子文件夹）时采用复数命名法，如 components、assets
- 页面组件、变量、js、ts、 css、less
  采用：`小驼峰方式`
- 可复用组件
  采用：`大驼峰方式` 或者 `小写 + 中划线` 的方式，如 MyComponent.vue 或 my-component.vue
- 标签类名、图片
  采用：`小写 + 中划线` 的方式

### 代码提交命名规范

- 基本格式&nbsp;&nbsp;`<type>: <description>`
- type
  | 类型 | 类型描述 | 类型 | 类型描述 |
  | ---- | ---- | ---- | ---- |
  | feat | 新功能 / 新需求 | fix | 修复 bug |
  | style | 代码风格，如格式化 | docs | 描述文档变更 |
  | refactor | 重构代码 | chore | 更改脚手架 |
  | test | 测试相关提交 | del | 删除无用代码 |
