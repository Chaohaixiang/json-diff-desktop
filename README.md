<<<<<<< HEAD
# json-diff-desktop
JSON Diff 是一款基于 Tauri + React 的本地 JSON 对比桌面应用，支持双栏编辑、自动差异分析、行级与词级高亮，以及中英文界面和深浅色主题，适合安全对比接口返回和配置变更。

JSON Diff is a local desktop app built with Tauri and React for comparing two JSON documents side by side. It automatically highlights added, removed, and modified fields at both line and token level, with multi‑language UI and light/dark themes.
=======
## JSON Diff 桌面应用

一个基于 **Tauri 2 + React + TypeScript + TailwindCSS + Monaco Editor** 的本地 JSON 对比工具，支持中英文切换、深浅色主题、行级与词级高亮展示差异。

### 功能特性

- **双列 JSON 编辑器**：左侧 JSON A、右侧 JSON B，支持多行 JSON 粘贴与编辑。
- **实时差异分析**：每次输入变更后自动 debounce 计算 diff。
- **行 + 词级高亮**：
  - 新增行 / 值：绿色背景与亮绿色文字高亮。
  - 删除行 / 值：红色背景与亮红色文字高亮。
  - 修改行 / 值：暗黄色底 +亮黄色文字，突出改动点。
- **结果列表视图**：下方列表展示每一条变更的：JSON 路径、类型（新增/删除/修改）、值变化（`旧值 → 新值`）。
- **一键格式化**：前端按钮触发，对 JSON A/B 同时做美化缩进。
- **本地运行，无需网络**：通过 Tauri 打包为 Windows 桌面应用。

### 目录结构（核心部分）

- `src/`：前端 React 应用
  - `app/App.tsx`：应用布局与状态入口。
  - `app/components/Toolbar/Toolbar.tsx`：顶部工具栏（格式化、对比、中/EN、明/暗）。
  - `app/components/DiffViewer/DiffViewer.tsx`：上半部分双列编辑器与行/词级高亮逻辑。
  - `app/components/Editor/JsonEditor.tsx`：基于 Monaco 的 JSON 编辑器封装。
  - `app/components/ResultPanel/*`：下半部分结果列表与每一项渲染。
  - `hooks/useJsonDiff.ts`：对 `jsondiffpatch` 的封装，节流 + 错误处理。
  - `lib/diff.ts`：将 `jsondiffpatch` 的 delta 拍平成易于展示的结构。
  - `styles/globals.css`：全局主题变量、卡片布局、Monaco 高亮样式。
- `src-tauri/`：Tauri 后端与打包配置
  - `tauri.conf.json`：窗口尺寸、前端 dev URL、打包图标配置等。
  - `Cargo.toml`：Rust 侧依赖（`tauri`, `tauri-build`）。
  - `target/`：Tauri 构建输出（已在 `.gitignore` 中忽略）。

---

### 开发环境运行

1. 安装依赖（项目根目录）：

```bash
npm install
```

2. 启动桌面应用（前端 + Tauri 一起跑，支持热更新）：

```bash
npm run tauri:dev
```

Tauri 会在后台启动 `vite dev`（默认端口 `5173`）并打开一个桌面窗口。

> 如果遇到白屏，可按 `Ctrl + Shift + I` 打开 DevTools，在 `Console` 面板查看错误。

---

### 构建桌面应用

#### 前端构建

如只想构建前端静态文件（不打包成桌面应用）：

```bash
npm run build
```

输出在 `dist/` 目录中。

#### 打包为 Windows 桌面程序

1. **准备图标**（只需一次）：
   - 在 `src-tauri/icons/` 下放置：
     - `icon.png`：建议 256×256 或 512×512。
     - `icon.ico`：Windows 程序和快捷方式图标。
   - `tauri.conf.json` 中已配置：

```json
"bundle": {
  "active": true,
  "targets": "all",
  "icon": ["icons/icon.png"]
}
```

2. **在 Windows 上构建 Tauri 应用**：

```bash
npm run tauri:build
```

构建完成后，会在：

- `src-tauri/target/release/json-diff.exe`：可执行程序。

> 如果你的环境没有正确安装 WiX / NSIS，可能暂时不会生成 `bundle` 安装包目录。这种情况下，可以先使用 `json-diff.exe` + 桌面快捷方式的方式本机使用。

---

### 通过桌面图标启动

当前版本已经可以通过「桌面快捷方式」启动应用（无需命令行）：

1. 构建可执行文件（任一方式）：
   - 开发模式构建：`npm run tauri:dev` 会在 `src-tauri/target/debug/` 生成调试版本；
   - 正式构建：`npm run tauri:build` 会在 `src-tauri/target/release/` 生成 `json-diff.exe`。
2. 在资源管理器中找到目标 EXE（例如：`src-tauri/target/release/json-diff.exe`）。
3. 右键 → **发送到 → 桌面快捷方式**。
4. 之后即可通过桌面图标双击启动 JSON Diff 应用。

> 如果后续补齐 Windows 安装器（WiX / NSIS），可以再在 `src-tauri/target/release/bundle/...` 中找到 `.msi` 或 `*-setup.exe`，通过安装向导自动创建开始菜单和卸载入口。

---

### 技术栈与决策

- **前端框架**：React 18 + TypeScript，函数式组件配合定制 hooks（`useJsonDiff`, `useTheme`, `useLanguage`）。
- **UI & 样式**：TailwindCSS + 自定义 CSS 变量，深色主题为主，支持切换到浅色。
- **编辑器**：`@monaco-editor/react`，封装为 `JsonEditor` 组件，支持：
  - 自动 JSON 校验、注释容错。
  - 关闭 minimap、优化行高、自动布局。
  - 通过 `lineDecorations` 和 `inlineDecorations` 实现差异高亮。
- **Diff 引擎**：`jsondiffpatch`，在 `lib/diff.ts` 中统一封装，输出扁平化的 `DiffResult`：

```ts
type DiffType = 'added' | 'removed' | 'modified';

interface DiffResult {
  path: string;      // JSON 路径，例如 "user.name" 或 "projects[0].status"
  type: DiffType;    // 变更类型
  oldValue?: unknown;
  newValue?: unknown;
}
```

- **国际化**：`i18next + react-i18next`，在 `src/i18n/` 目录下维护中英文文案，通过右上角按钮一键切换。
- **桌面壳**：Tauri 2，`tauri.conf.json` 中配置窗口大小、最小尺寸、居中、标题等。

更详细的技术说明与需求文档见 `docs/` 目录。

---

### 本仓库如何上传到 GitHub

> 前提：你的电脑已经安装了 Git 并配置好全局用户名/邮箱，并且已经在 GitHub 上创建了账号。

1. 在项目根目录初始化 Git 仓库：

```bash
cd /d "D:\AI workdata\see"
git init
```

2. 查看当前状态，确认 `.gitignore` 正常生效：

```bash
git status
```

3. 将所有需要的文件加入版本控制：

```bash
git add .
```

4. 提交一次初始版本：

```bash
git commit -m "chore: initial open source release"
```

5. 在 GitHub 网站上新建一个空仓库（不要勾选「Initialize with README」等选项），假设仓库地址为：

```text
https://github.com/<your-username>/json-diff-desktop.git
```

6. 在本地把仓库与 GitHub 关联并推送：

```bash
git remote add origin https://github.com/<your-username>/json-diff-desktop.git
git branch -M main
git push -u origin main
```

完成以上步骤后，当前项目就会出现在你的 GitHub 仓库中，你可以在 README 中补充仓库地址，或者开启 Release、Issues 等功能进行后续维护。
>>>>>>> f6bf470 (chore: initial json diff desktop app)
