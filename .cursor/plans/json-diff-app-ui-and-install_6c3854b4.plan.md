---
name: json-diff-app-ui-and-install
overview: 优化 JSON Diff 桌面应用的前端 UI 以贴近 figma 设计，并完善 JSON 对比逻辑展示和 Windows 安装体验。
todos: []
isProject: false
---

## 目标

- **UI 视觉重构**：让现有 React + Tailwind 前端界面更贴近你提供的 figma（图 1），并在此基础上做细节打磨（hover、光影、间距），整体风格统一为精致深色界面。
- **交互与可用性修正**：确保 JSON A/B 的输入与 diff 行为符合预期：只输入 JSON A 时 B 为空有合理提示，结果面板的结构和文案与 figma 设计一致（路径、类型、值变化拆分展示）。
- **桌面应用安装体验**：基于 Tauri 2，为 Windows 提供可安装包（带桌面快捷方式和开始菜单项），并支持正常卸载。

## 前端 UI 重构计划

- **整体布局与容器**
  - 在 `App.tsx` 中为页面外层增加更贴近 figma 的容器：上方固定应用标题栏，下方上下分为“编辑区域 + 结果区域”，增加圆角、阴影和内边距，使用统一的 max-width 居中布局。
  - 在 `globals.css` / Tailwind 配置中定义应用级背景（深色渐变或柔和暗色）和卡片容器样式，使中间主面板悬浮在背景之上。
- **顶栏（Toolbar）重构**
  - 在 `Toolbar.tsx` 中：
    - 左侧：应用图标占位 + 标题 `JSON Diff`，与 figma 一致的高度和字体权重。
    - 右侧：格式化按钮、对比按钮、语言切换和深浅色切换，调整为 pill 风格按钮，增加图标和 hover/active 态（如轻微发光或描边变化）。
    - 使用 Tailwind 自定义类封装通用按钮样式，保证整个应用一致性。
- **编辑区域（JSON A / JSON B）
  - 在 `DiffViewer.tsx` 与 `EditorPanel.tsx` 中：
    - 顶部标题条改为更明显的分栏头：左 `JSON A`，右 `JSON B`，带背景分割条、轻微渐变和清空按钮靠右。
    - 使用统一的代码编辑容器：圆角、内边距、暗色背景、细边框，与 figma 中 editor 卡片风格对齐。
    - 针对 `JsonEditor`（如果基于 Monaco）：
      - 通过 `JsonEditor` 组件传入 theme、行高、字体、滚动条样式等，营造更高级的代码区域视觉（深色 code theme）。
- **结果面板（ResultPanel）视觉与结构**
  - 在 `ResultPanel.tsx` 和 `ResultItem.tsx` 中：
    - 顶部标题区域：显示“比较结果 + 变更数量标签”，右侧是变更类型 legend（三个小圆点 + 文案），样式和颜色与 figma 对齐（绿色=新增，红色=删除，黄色=修改）。
    - 列表区域改为表格风/卡片风布局：每条结果拆为三列：JSON 路径、类型、值变化；路径使用可点击高亮样式，类型用彩色 tag，值变化区采用 `旧值 → 新值` 的对比排版。
    - 为空状态 / 错误状态增加插画式或友好提示文本，避免只显示一行干巴巴的文字。
- **主题与配色体系**
  - 在 Tailwind 配置或 `globals.css` 中：
    - 定义更细的颜色 token：`--chip-added`、`--chip-removed`、`--chip-modified`、`--panel-bg`、`--editor-bg` 等，以匹配 figma 的具体色值。
    - 确保暗色主题下的对比度足够，保证可读性和可访问性。
- **动效与微交互**
  - 为按钮、结果行、路径 tag 添加简短的 `transition`，悬浮时轻微抬升/阴影或背景色变化。
  - 页面初次加载时，为主卡片添加淡入+位移动画，增强“桌面应用”质感，同时保持性能可控（只在顶层容器上做一次）。

## JSON Diff 逻辑与展示修正

- **JSON B 为空时的行为**
  - 检查 `computeDiff` 和 `useJsonDiff`：
    - 目前允许 `right` 为空对象；当只输入 `JSON A` 时，明确产品预期（比如：`JSON B` 默认为空对象，对所有字段标记为“删除/新增”？）。
    - 根据你的需求，将逻辑改为：
      - 若只填 A，B 为空：显示提示“请填写 JSON B 进行比较”；`results` 为空，不展示 diff 行。
      - 若 A 为空、B 有值：类似处理。
    - 在 `ResultPanel` 中根据这种状态显示更加友好的文案和图标。
- **结果项结构对齐 figma**
  - 在 `ResultItem.tsx` 中：
    - 按 figma 模式展示：
      - 第一列：`JSON 路径`（蓝色链接风格文案）。
      - 第二列：`类型`（新增/删除/修改，使用彩色 tag）。
      - 第三列：`值变化`，格式为 `"旧值" → "新值"` 或对应 JSON 片段，保持单行/多行展示策略与 figma 接近。
    - 为不同 `type` 提供不同背景色/边框色，和编辑器中的高亮颜色保持一致。
- **错误与校验提示**
  - 若 `computeDiff` 中 `JSON.parse` 抛错：
    - 在 `ResultPanel` 顶部显示一条明显但不打断的错误条（如红色细横幅），内容为“JSON 格式错误：xxx”，同时在编辑区域附近增加轻量提示（不阻塞编辑）。
  - 边缘情况：两个 JSON 完全相同、其中一个为空、数组/嵌套对象等，都要检查展示是否合理，必要时在 `flattenDelta` 结果上增加额外排序或过滤（已通过 type + path 排序，整体保留）。

## Windows 安装包与桌面集成

- **Tauri bundle 配置完善**
  - 在 `src-tauri/tauri.conf.json` 中：
    - 确认 `bundle.active` 为 `true`，`targets` 至少包含 `msi` 或 `nsis` 对应的 Windows 目标（视 Tauri 2 的最新配置而定）。
    - 保持 `identifier`、`productName` 等字段为发布版本预期值。
- **应用图标与资源文件**
  - 在 `src-tauri/icons/` 下准备一套多尺寸图标：`icon.png` 和 `icon.ico`（按 Tauri 官方推荐尺寸：32/128/256/512 等）。
  - 确认 `tauri.conf.json` 中的 `bundle.icon` 指向正确路径，避免之前的 `icon.ico not found` 编译错误。
- **桌面快捷方式和开始菜单项**
  - 在 Tauri Windows bundle 配置中：
    - 启用创建桌面快捷方式和开始菜单项的选项（根据 Tauri 2 对 Windows bundler 的字段，如 `windows.shortcut` 或类似配置）。
    - 确保应用在安装后可以通过桌面图标和开始菜单启动。
- **卸载流程**
  - 采用 Tauri 默认的 Windows 安装器（MSI/NSIS）自带的卸载功能：
    - 在计划中说明：用户可通过“应用和功能”或开始菜单中的卸载入口卸载；
    - 如有需要，可在图标组里加入“卸载 JSON Diff”快捷方式（视 bundler 是否支持额外卸载快捷方式）。
- **构建与测试流程文档**
  - 在 `README.md` 中补充：
    - 开发环境运行：`npm run tauri:dev`。
    - 打包命令：`npm run tauri:build`，说明生成的 Windows 安装包所在目录路径以及如何安装/卸载。

## Todos

- **ui-shell-layout**: 重构 `App.tsx` 布局与顶层容器，让主界面与 figma 整体结构对齐，并调整 Toolbar 样式。
- **editor-and-result-style**: 按 figma 重做编辑区域和结果面板的视觉（包含 `EditorPanel`、`DiffViewer`、`ResultPanel`、`ResultItem` 的排版和配色）。
- **diff-behavior-fix**: 调整 `computeDiff` 与 `useJsonDiff` 在 A/B 为空时的行为，并修正结果文案和错误提示逻辑，使其与设计稿描述一致。
- **tauri-windows-bundle**: 完善 `tauri.conf.json` 和图标资源，配置 Windows 安装包、桌面快捷方式和卸载入口，并在 README 中写明构建与安装说明。

