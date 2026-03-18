# MyTools

一个纯前端、本地处理优先的自用 JSON 工具站。第 1 轮聚焦 JSON 格式化、压缩与校验，使用 React + TypeScript + Vite，所有 JSON 处理都在浏览器本地完成，不包含后端、登录或云同步。

## 第 1 轮完成状态

第 1 轮已达到可提交状态，当前包含：

- 应用主布局、顶部栏、左侧导航和首页
- `/formatter` 的格式化、压缩、复制结果、示例数据、清空
- `/validator` 的校验、示例数据、清空
- Monaco Editor 双栏工作区
- 本地自动保存最近输入、恢复最近页面
- JSON 核心工具函数与 Vitest 基础测试

## 本地运行

```bash
npm install
npm run dev
```

本地检查命令：

```bash
npm run build
npm run test
npm run lint
```

## 第 1 轮范围

- 首页工作台
- 左侧导航 + 顶部栏主布局
- `/formatter` 格式化 / 压缩页
- `/validator` JSON 校验页
- Monaco Editor
- 本地 `localStorage` 持久化最近输入
- 最近访问页面恢复
- JSON 工具函数与 Vitest 基础测试

## 目录说明

- `src/app`: 路由与应用级布局
- `src/pages`: 页面入口
- `src/components`: 通用 UI 组件
- `src/features/formatter`: 格式化 / 压缩特性逻辑
- `src/features/validator`: 校验特性逻辑
- `src/shared/utils`: JSON、存储、示例数据、剪贴板等共享工具
- `src/shared/types`: 跨模块共享类型

## 本地存储设计

- `my-tools:formatter-input`: 保存格式化页最近一次输入
- `my-tools:validator-input`: 保存校验页最近一次输入
- `my-tools:last-route`: 保存最近访问页面

当 `localStorage` 不可用时，会自动退回到内存兜底，不阻断当前会话内操作。

## 设计取舍

- 先用 `localStorage` 保存最近输入与最近路由，满足自用场景，不引入更重的状态管理。
- 样式集中在 `src/index.css`，这一轮减少样式文件数量，先把结构稳定下来。
- 校验提示基于 `JSON.parse` 错误信息做轻量推断，优先可用性，不在第 1 轮引入更复杂解析器。
- 未来功能只保留导航预留，不提前实现状态或数据模型，避免过度设计。

## 变更说明

- `src/app`: 路由、布局和启动恢复入口
- `src/components`: 工作区、编辑器、结果面板、状态栏、操作栏
- `src/features/formatter`: 格式化与压缩的页面友好封装
- `src/features/validator`: 校验结果的页面友好封装
- `src/shared/utils/json.ts`: 第 1 轮核心 JSON 处理逻辑
- `src/shared/utils/storage.ts`: 本地存储与兜底逻辑
- `tests/json.test.ts`: 核心 JSON 工具测试

## 手动验证清单

1. 执行 `npm run dev` 后，能正常进入应用，看到顶部栏、侧边导航和首页或最近访问页。
2. 进入 `/formatter`，输入合法 JSON，点击“格式化”，右侧显示 2 空格缩进结果。
3. 在 `/formatter` 点击“压缩”，右侧显示单行 JSON。
4. 在 `/formatter` 输入非法 JSON，点击“格式化”或“压缩”，右侧不应保留旧结果。
5. 在 `/formatter` 点击“复制结果”，状态栏显示复制成功提示。
6. 在 `/formatter` 点击“示例数据”，刷新后仍能恢复输入；点击“清空”后刷新不应恢复。
7. 进入 `/validator`，输入合法 JSON，点击“校验”，右侧显示 `JSON 合法`。
8. 在 `/validator` 输入非法 JSON，点击“校验”，右侧显示错误摘要、位置和提示文案。
9. 在 `/validator` 点击“示例数据”，刷新后仍能恢复输入；点击“清空”后刷新不应恢复。
10. 访问 `/formatter` 或 `/validator` 后回到 `/`，应自动恢复到最近访问页面。
11. 执行 `npm run test`、`npm run build`、`npm run lint` 都通过。

## 已知问题

- 当前 `copyText` 只走 `navigator.clipboard`，在部分受限浏览器环境下没有降级复制方案。
- `localStorage` 不可用时只能保证当前会话可用，无法跨刷新恢复。
- 第 1 轮的校验提示基于原生异常信息推断，覆盖常见情况，但不是完整 JSON 诊断器。

## 第 2 轮建议切入点

优先建议做 `JSON Diff`。原因是：

- 现有双栏工作区、结果面板和状态栏可以直接复用。
- `shared/utils` 已经有 JSON 解析基础，继续扩展成本最低。
- 相比 JSONPath 和转换器，Diff 更符合日常调接口和排查数据差异的高频场景。
