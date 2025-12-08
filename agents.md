# Agent Notes

## 项目概述

**Grafana Dashboard Generator** - 使用 LLM 自动从 Prometheus metrics 生成 Grafana Dashboard JSON。

### 技术栈
- **Frontend**: 纯 HTML/CSS/JS，i18n 支持
- **Backend**: Node.js + Express（本地开发）
- **Serverless**: Cloudflare Pages Functions（生产部署）
- **LLM**: OpenAI 兼容 API（支持自定义 baseURL）

### 目录结构
```
├── frontend/          # 静态前端文件
├── backend/src/       # 后端逻辑（本地 + 共享库）
│   ├── llmService.js      # LLM 调用（fetch-based，edge 友好）
│   ├── metricsParser.js   # Prometheus metrics 解析
│   ├── dashboardGenerator.js  # Dashboard 生成逻辑
│   └── prompts.js         # LLM prompts
├── functions/         # Cloudflare Pages Functions
│   └── api/               # API 端点
└── .github/workflows/ # CI/CD
```

### 关键 API
- `POST /api/analyze-metrics` - 分析 metrics，返回 panel 计划
- `POST /api/generate-panels` - 根据计划生成 Dashboard JSON

### 部署
- **本地**: `npm start --prefix backend`
- **生产**: 推送到 main 分支自动部署到 Cloudflare Pages

---

## Cloudflare Pages Functions 部署经验

### 问题背景
Cloudflare Pages Functions 部署失败，无法解析模块导入。

### 关键经验

#### 1. `_` 前缀目录被 Cloudflare 特殊处理
- **问题**：`functions/_lib/` 目录中的模块无法被解析
- **原因**：Cloudflare Pages 对 `_` 前缀目录有特殊处理（如 `_middleware.js`）
- **解决**：将 `_lib` 改为 `lib`

#### 2. Cloudflare Pages Functions 独立编译
- **问题**：`functions/api/*.js` 无法 import 同级 `../lib/*.js`
- **原因**：每个 Function 文件被独立编译，模块解析不跨目录
- **解决**：使用 esbuild 预先打包，将依赖内联到每个函数

#### 3. Node.js 依赖在 Edge 环境不可用
- **问题**：`openai` 包无法在 Cloudflare Workers 环境解析
- **原因**：`openai` SDK 依赖 Node.js 原生模块，不适合 edge bundling
- **解决**：改用原生 `fetch` API 直接调用 OpenAI 兼容接口

### 最终 Workflow 结构

```yaml
- name: Build Cloudflare Pages bundle
  run: |
    npm install -g esbuild
    npm ci --prefix backend
    
    # 复制共享库到 functions/lib
    mkdir -p functions/lib
    cp backend/src/*.js functions/lib/
    
    # esbuild 打包每个函数
    esbuild functions/api/analyze-metrics.js --bundle --platform=neutral --format=esm --outfile=dist/functions/api/analyze-metrics.js
    esbuild functions/api/generate-panels.js --bundle --platform=neutral --format=esm --outfile=dist/functions/api/generate-panels.js

- name: Publish to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    command: pages deploy dist --project-name=xxx
```

### Edge-friendly LLM 调用

```javascript
// 不使用 openai SDK，直接用 fetch
const response = await fetch(`${baseURL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({ model, messages, temperature, max_tokens })
});
```

### 相关 Commits
- `f5cb214` - 初始修复：移动 shared libs
- `e5c42b9` - 重命名 `_lib` → `lib`
- `3f46760` - 添加 esbuild 打包
- `4da5bd4` - 移除 openai 依赖，改用 fetch
