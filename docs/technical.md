## JSON Diff 桌面应用 - 技术说明

### 1. 前端架构概览

- **框架**：React 18 + TypeScript。
- **状态管理**：采用组件内部状态 + 自定义 hooks（`useJsonDiff`, `useTheme`, `useLanguage`），未引入全局状态库。
- **路由**：单页面，无路由需求。
- **样式**：TailwindCSS + `src/styles/globals.css` 自定义变量与组件类。
- **编辑器**：`@monaco-editor/react` 封装为 `JsonEditor` 组件。

主要组件与关系如下：

- `App.tsx`
  - 管理 JSON 文本、主题、语言等状态。
  - 调用 `useJsonDiff` 获取 diff 结果。
  - 渲染：
    - `Toolbar`
    - `DiffViewer`（上半部分编辑区）
    - `ResultPanel`（下半部分结果列表）

### 2. Diff 计算与数据结构

- 底层使用 `jsondiffpatch`：在 `src/lib/diff.ts` 中统一封装。
- 通过 `differ.diff(leftObj, rightObj)` 得到原始 delta，再递归拍平成一维数组：

```ts
type DiffType = 'added' | 'removed' | 'modified';

export interface DiffResult {
  path: string;      // 例如 "user.name" 或 "projects[0].status"
  type: DiffType;    // 'added' | 'removed' | 'modified'
  oldValue?: unknown;
  newValue?: unknown;
}
```

- `useJsonDiff(left, right)`：
  - 内部维护 `{ results, error, loading }` 状态。
  - 使用 `useMemo` 封装输入，`useEffect` + `setTimeout` 做 300ms 的节流。
  - 处理几种情况：
    - 两侧都为空：`results = []`，`error = null`。
    - 只填一侧：`error = MISSING_SIDE_ERROR`，用于结果面板显示「请在左右两侧都粘贴 JSON 后再进行比对」。
    - 两侧都有内容：调用 `computeDiff`，将异常（JSON.parse 错误）写入 `error`。

### 3. 行级与词级高亮实现

- 编辑器层：`JsonEditor.tsx`
  - 对 `@monaco-editor/react` 的轻封装，支持：
    - `lineDecorations: { lineNumber, className }[]`
    - `inlineDecorations: { lineNumber, startColumn, endColumn, className }[]`
  - 在 `useEffect` 中，通过 `editor.deltaDecorations` 将这些装饰应用到 Monaco 模型。
  - 自定义 CSS 类在 `globals.css` 中定义，例如：
    - `.editor-line-added`
    - `.editor-line-removed`
    - `.editor-line-modified`
    - `.editor-inline-added`
    - `.editor-inline-removed`
    - `.editor-inline-modified`

- 上层计算：`DiffViewer.tsx`
  - 接收 `left`, `right`, `results` 三个参数。
  - 对左右两侧分别调用 `buildDecorationsForSide(json, side, results)`：
    - 行号推断：
      - 从 `DiffResult.path` 中取最后一段键名（例如 `user.name` → `name`）。
      - 在对应 JSON 文本的每一行中查找 `"name"`，匹配的行号即为目标行。
    - 词位置推断：
      - 对 `oldValue` / `newValue` 使用 `JSON.stringify` 得到文本。
      - 在对应行中查找该文本首次出现的位置，计算出 `startColumn`、`endColumn`。
    - 根据 `type` 与 `side` 决定装饰：
      - `added`：右侧行 + 新值词高亮。
      - `removed`：左侧行 + 旧值词高亮。
      - `modified`：两侧行都高亮，左侧旧值、右侧新值分别高亮。

> 该策略在普通对象与浅层数组场景下效果良好；对于非常复杂或重复键结构，行号推断可能不完全精确，但不会影响功能正确性，只影响高亮精度。

### 4. 结果面板逻辑

- 组件：`ResultPanel.tsx` + `ResultItem.tsx`
- 主要逻辑：
  - `results` 按类型优先级排序：`modified` → `added` → `removed`，然后按 `path` 字母序排序。
  - 顶部标题区显示「比对结果」和变更多数。
  - 右侧 Legend 使用三种颜色标记新增/删除/修改。
  - 根据状态决定展示内容：
    - `error` 存在：显示错误条（普通错误 vs 缺失一侧 JSON）。
    - 无输入：显示引导文案。
    - 无差异：显示「完全一致」。
    - 有差异：渲染 `ResultItem` 列表。

### 5. 国际化与主题

- 国际化：
  - `src/i18n/index.ts` 初始化 i18next。
  - `zh.json` 与 `en.json` 分别维护所有界面文案。
  - 使用 `useLanguage` hook 结合 `localStorage` 存储当前语言，Toolbar 上按钮负责切换。

- 主题：
  - `useTheme` hook 管理 `dark` / `light` 两种主题，写入 `<html data-theme="...">` 属性。
  - `globals.css` 中通过 `[data-theme='light']` 和默认 `:root` 定义两套颜色变量。

### 6. Tauri 配置与桌面集成

- `src-tauri/tauri.conf.json`：
  - `build`：指定 `beforeDevCommand`、`beforeBuildCommand` 与前端 `devUrl`。Tauri dev 会自动运行 `npm run dev` 并加载 `http://localhost:5173`。
  - `app.windows[0]`：设置窗口标题、尺寸、最小宽高、是否居中等。
  - `bundle`：当前仅开启基础打包和图标配置；WiX/NSIS 安装器配置可根据需要在未来补充。

- 当前版本已验证：
  - `npm run tauri:dev`：开发调试、自动热更新。
  - `npm run tauri:build`：生成 `src-tauri/target/release/json-diff.exe` 可执行程序。
  - 用户可通过右键「发送到桌面快捷方式」来达成桌面图标启动。

### 7. 测试与质量保障

- 已配置 `vitest`，可在后续补充单元测试与组件测试。
- ESLint + Prettier 已集成：
  - `npm run lint`：静态检查。
  - `npm run format`：自动格式化。

### 8. 未来技术演进方向

- 更精确的行/词级映射：结合 AST 或 JSON pointer，以提升高亮准确度。
- 引入简单的全局状态库（如 Zustand）以支持未来多 Tab 场景。
- 增加导入/导出 JSON 文件、拖拽上传、URL 请求拉取 JSON 等高级能力。
