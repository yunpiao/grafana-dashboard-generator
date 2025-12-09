# PRD: Grafana Dashboard Generator

> 详细技术规格文档，供 LLM 复现项目使用

## 1. 产品概述

**一句话描述**：通过 LLM 将 Prometheus metrics 文本自动转换为可直接导入 Grafana 的 Dashboard JSON。

**目标用户**：DevOps、SRE、后端开发者

**核心价值**：无需手写 PromQL，30-60秒生成生产可用的 Dashboard。

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (纯静态)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ index.html  │  │  style.css  │  │        app.js           │  │
│  │  (UI结构)   │  │   (样式)    │  │ (前端解析+API调用+i18n) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP API
┌───────────────────────────▼─────────────────────────────────────┐
│                      Backend (Node.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ server.js    │  │metricsParser │  │  dashboardGenerator    │ │
│  │ (Express API)│  │   .js        │  │  .js (两阶段编排)      │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ llmService   │  │  prompts.js  │                             │
│  │ .js (HTTP)   │  │ (Prompt模板) │                             │
│  └──────────────┘  └──────────────┘                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │ OpenAI-compatible API
┌───────────────────────────▼─────────────────────────────────────┐
│                    LLM Provider                                  │
│         OpenAI / MiniMax / DeepSeek / 任意兼容API                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

```
grafana-dashboard-generator/
├── frontend/
│   ├── index.html          # 主页面
│   ├── style.css           # 样式
│   ├── app.js              # 前端逻辑 (~1000行)
│   └── i18n/
│       ├── i18n.js         # 国际化模块
│       └── translations/   # 翻译文件 (en.json, zh.json, ...)
├── backend/
│   ├── src/
│   │   ├── server.js           # Express 服务入口
│   │   ├── metricsParser.js    # Prometheus metrics 解析器
│   │   ├── llmService.js       # LLM HTTP 调用 (fetch-based)
│   │   ├── dashboardGenerator.js # 两阶段生成编排
│   │   └── prompts.js          # LLM Prompt 模板
│   ├── package.json
│   └── Dockerfile
├── functions/              # Cloudflare Pages Functions (Serverless)
│   └── api/
│       ├── analyze-metrics.js
│       ├── generate-panels.js
│       └── health.js
├── examples/
│   ├── dashboard-comparison-example.json
│   └── test-metrics-example.txt
└── docker-compose.yml
```

---

## 4. 数据结构定义

### 4.1 Prometheus Metrics 输入格式

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{handler="/api/v1/user",method="GET",status_code="200"} 1027
http_requests_total{handler="/api/v1/user",method="POST",status_code="201"} 54

# HELP http_request_duration_seconds HTTP request latency
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{handler="/api/v1/user",le="0.1"} 800
http_request_duration_seconds_bucket{handler="/api/v1/user",le="0.5"} 950
http_request_duration_seconds_sum{handler="/api/v1/user"} 127.5
http_request_duration_seconds_count{handler="/api/v1/user"} 1027
```

### 4.2 Metrics Summary (解析后)

```typescript
interface MetricsSummary {
  [metricName: string]: {
    type: 'counter' | 'gauge' | 'histogram' | 'summary' | 'untyped';
    help: string;
    labels: string[];  // 去重排序后的 label 名称列表
  }
}

// 示例
{
  "http_requests_total": {
    "type": "counter",
    "help": "Total number of HTTP requests",
    "labels": ["handler", "method", "status_code"]
  },
  "http_request_duration_seconds": {
    "type": "histogram",
    "help": "HTTP request latency",
    "labels": ["handler", "le"]
  }
}
```

### 4.3 Panel Plan (Stage 1 输出)

```typescript
interface PanelPlan {
  panel_title: string;           // 面板标题
  description: string;           // 面板描述
  required_metrics: string[];    // 需要的 metric 名称
  suggested_visualization: 'timeseries' | 'stat' | 'gauge' | 'table' | 'bar' | 'heatmap';
  promql_hints: string;          // PromQL 查询提示
}

// 示例
{
  "panel_title": "HTTP Request Rate",
  "description": "Shows the rate of HTTP requests per second, grouped by method and status",
  "required_metrics": ["http_requests_total"],
  "suggested_visualization": "timeseries",
  "promql_hints": "Use rate() with 5m window, group by method and status_code"
}
```

### 4.4 Grafana Panel JSON (Stage 2 输出)

```typescript
interface GrafanaPanel {
  id: number;
  type: string;
  title: string;
  description: string;
  datasource: {
    type: 'prometheus';
    uid: '$datasource';  // 模板变量，允许用户选择数据源
  };
  gridPos: { x: number; y: number; w: number; h: number };
  targets: Array<{
    datasource: { type: 'prometheus'; uid: '$datasource' };
    expr: string;       // PromQL 表达式
    legendFormat: string;
    refId: string;
  }>;
  fieldConfig: {
    defaults: {
      unit: string;
      color: { mode: string };
      custom: object;
      thresholds: object;
    };
    overrides: [];  // 必须为空数组以保证兼容性
  };
  options: object;
}
```

### 4.5 Complete Dashboard JSON

```typescript
interface GrafanaDashboard {
  title: string;
  tags: string[];
  timezone: 'browser';
  schemaVersion: 41;  // Grafana 12.0+
  version: 1;
  refresh: '30s';
  time: { from: 'now-1h'; to: 'now' };
  panels: GrafanaPanel[];
  templating: {
    list: [{
      type: 'datasource';
      name: 'datasource';
      query: 'prometheus';
      // ... 允许用户选择 Prometheus 数据源
    }]
  };
  annotations: object;
}
```

---

## 5. API 接口规范

### 5.1 POST /api/analyze-metrics (Stage 1)

**请求**:
```json
{
  "metricsText": "# HELP ...\n# TYPE ...\n...",
  "openaiApiKey": "sk-xxx",           // 可选，服务端未配置时必填
  "apiBaseURL": "https://api.openai.com/v1",  // 可选，自定义 API 地址
  "modelName": "gpt-4-turbo-preview"  // 可选
}
```

**响应 (成功)**:
```json
{
  "success": true,
  "panelPlans": [
    {
      "panel_title": "HTTP Request Rate",
      "description": "...",
      "required_metrics": ["http_requests_total"],
      "suggested_visualization": "timeseries",
      "promql_hints": "..."
    }
  ],
  "metricsSummary": { /* MetricsSummary 对象 */ },
  "metadata": {
    "metricsCount": 42,
    "panelPlansCount": 8,
    "model": "gpt-4-turbo-preview"
  }
}
```

### 5.2 POST /api/generate-panels (Stage 2)

**请求**:
```json
{
  "selectedPlans": [ /* PanelPlan[] */ ],
  "metricsSummary": { /* MetricsSummary */ },
  "openaiApiKey": "sk-xxx",
  "apiBaseURL": "...",
  "modelName": "..."
}
```

**响应 (成功)**:
```json
{
  "success": true,
  "dashboard": { /* 完整 GrafanaDashboard JSON */ },
  "metadata": {
    "totalPanelsPlanned": 8,
    "successfulPanels": 7,
    "failedPanels": 1,
    "failedPanelsList": [{ "title": "...", "error": "..." }],
    "generationTimeMs": 45320,
    "model": "gpt-4-turbo-preview"
  }
}
```

### 5.3 GET /api/health

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "hasOpenAIKey": true
}
```

---

## 6. 核心算法

### 6.1 Metrics 解析器 (metricsParser.js)

```javascript
// 解析逻辑
1. 按行分割输入文本
2. 解析 "# HELP metric_name description" 行 → 提取 help
3. 解析 "# TYPE metric_name type" 行 → 提取 type
4. 解析 metric 行 "metric_name{label1="v1"} value" → 提取 labels
5. 合并同名 metric 的所有 labels（去重）
6. 返回 MetricsSummary 对象
```

### 6.2 两阶段生成流程 (dashboardGenerator.js)

```
Stage 1: analyzeMetrics()
├─ 输入: MetricsSummary
├─ 调用 LLM (getAnalysisPrompt)
├─ 解析 JSON 响应
├─ 输出: PanelPlan[]
│
Stage 2: generatePanelsFromPlans()
├─ 输入: selectedPlans[], MetricsSummary
├─ 循环每个 PanelPlan:
│   ├─ 调用 LLM (getPanelGenerationPrompt)
│   ├─ 解析 JSON 响应
│   ├─ 失败则记录并继续下一个
│   └─ 成功则加入 panels[]
├─ 计算 gridPos (2列布局，每个 panel 12x8)
├─ 组装 Dashboard 结构
└─ 输出: { dashboard, metadata }
```

### 6.3 LLM 调用 (llmService.js)

```javascript
// 关键特性
1. 使用原生 fetch API（非 openai SDK，兼容 edge 环境）
2. 自动重试机制（最多3次，指数退避 2s/4s/6s）
3. JSON 响应解析：
   - 移除 <think> 标签（部分模型会输出思考过程）
   - 提取 markdown 代码块中的 JSON
   - 定位 { } 或 [ ] 边界
   - JSON.parse
```

---

## 7. LLM Prompt 设计

### 7.1 Stage 1 Analysis Prompt

```
你是 Prometheus 和 Grafana 专家。分析以下 metrics 摘要，规划监控面板。

Metrics Summary:
{JSON}

任务：
1. 识别关键监控能力
2. 将相关 metrics 分组
3. 建议可视化类型

输出 JSON 数组，每个元素包含：
- panel_title: 面板标题
- description: 描述
- required_metrics: 需要的 metric 名称数组
- suggested_visualization: timeseries/gauge/stat/table/bar/heatmap
- promql_hints: PromQL 查询提示

指南：
- 聚焦最重要可操作的 metrics
- 趋势用 timeseries，当前值用 gauge，单数字用 stat
- 按 RED（Rate/Errors/Duration）或 USE 模式分组
- 5-15 个面板，质量优先

IMPORTANT: 仅输出有效 JSON 数组，无额外文本。
```

### 7.2 Stage 2 Panel Generation Prompt

```
你是 Grafana 面板创建专家。生成完整的 Grafana Panel JSON。

Panel 需求：
{PanelPlan JSON}

可用 Metrics 上下文：
{相关 metrics 的 type/help/labels}

PROMQL 语法规则（关键）：
1. 聚合操作符必须包裹表达式：
   ✅ sum(rate(metric[5m])) by (label)
   ❌ rate(metric[5m]) by (label)  // 错误！

2. Counter vs Gauge：
   - Counter（只增）: 必须用 rate()/irate()/increase()
   - Gauge（可增减）: 直接使用或 delta()

3. Histogram 分位数：
   ✅ histogram_quantile(0.95, sum(rate(bucket[5m])) by (le))
   // 必须包含 by (le)

4. 常见模式：
   - 请求速率: sum(rate(requests_total[5m])) by (method)
   - 错误率: sum(rate(errors{status=~"5.."}[5m])) / sum(rate(requests[5m])) * 100
   - P95 延迟: histogram_quantile(0.95, sum(rate(latency_bucket[5m])) by (le))

生成完整 Grafana Panel JSON，必须包含：
- datasource: { type: "prometheus", uid: "$datasource" }
- targets 数组（每个 target 也要有 datasource）
- fieldConfig.overrides 必须为空数组 []

CRITICAL: 仅输出有效 JSON，无 markdown，无注释。
```

---

## 8. 前端用户流程

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: 输入 Metrics                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Textarea: 粘贴 Prometheus metrics 文本]        │   │
│  └─────────────────────────────────────────────────┘   │
│  [API Key]  [Base URL]  [Model]                        │
│                    [解析 Metrics]                       │
└────────────────────────┬────────────────────────────────┘
                         ▼ (前端解析，无后端调用)
┌─────────────────────────────────────────────────────────┐
│  Step 2: 预览 Metrics 信息                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 42 metrics | 🏷️ 15 labels | 📈 4 types      │   │
│  │ ┌───────────────────────────────────────────┐   │   │
│  │ │ http_requests_total [counter]            │   │   │
│  │ │ Help: Total HTTP requests                │   │   │
│  │ │ Labels: handler, method, status_code     │   │   │
│  │ └───────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│              [返回编辑]  [开始 AI 分析]                  │
└────────────────────────┬────────────────────────────────┘
                         ▼ (调用 /api/analyze-metrics)
┌─────────────────────────────────────────────────────────┐
│  Step 3: 选择 Panel 计划                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑️ 1. HTTP Request Rate [timeseries]           │   │
│  │ ☑️ 2. Error Rate [stat]                        │   │
│  │ ☐ 3. Latency P95 [timeseries]                  │   │
│  │ ☑️ 4. ...                                      │   │
│  └─────────────────────────────────────────────────┘   │
│  已选: 3/8    [全选] [取消全选] [生成选中面板]          │
└────────────────────────┬────────────────────────────────┘
                         ▼ (调用 /api/generate-panels)
┌─────────────────────────────────────────────────────────┐
│  Step 4: 下载结果                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ 生成成功！                                   │   │
│  │ 计划: 8 | 成功: 7 | 耗时: 45.3s | 模型: GPT-4  │   │
│  └─────────────────────────────────────────────────┘   │
│  [⬇️ 下载 JSON]  [📋 复制]  [👁️ 预览]               │
└─────────────────────────────────────────────────────────┘
```

---

## 9. 部署方式

### 9.1 Docker Compose（推荐本地/自托管）

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PORT=3000
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 9.2 Cloudflare Pages（Serverless）

```
部署结构:
dist/
├── index.html, style.css, app.js, i18n/  (静态文件)
└── functions/
    └── api/
        ├── analyze-metrics.js  (esbuild 打包)
        ├── generate-panels.js
        └── health.js

关键点:
1. 使用 esbuild 打包 functions，内联所有依赖
2. 不使用 openai SDK（依赖 Node.js），直接用 fetch
3. 环境变量在 Cloudflare Pages 控制台设置
```

---

## 10. 技术要求

| 项目 | 规格 |
|------|------|
| Frontend | 纯 HTML/CSS/JS，无框架 |
| Backend | Node.js 18+，Express |
| LLM 调用 | fetch API（非 SDK），兼容 edge |
| 数据存储 | 无（无状态） |
| API 配置 | localStorage 存储用户配置 |
| i18n | 支持 en/zh/es/ar/hi |
| 重试机制 | 最多3次，指数退避 |
| 部分失败 | 单 Panel 失败不影响整体 |

---

## 11. 关键实现细节

### 11.1 JSON 响应解析

```javascript
function parseJSONResponse(response) {
  let jsonStr = response;
  
  // 1. 移除 <think> 标签
  jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/gi, '');
  
  // 2. 提取 markdown 代码块
  const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) jsonStr = match[1];
  
  // 3. 定位 JSON 边界
  const start = Math.min(
    jsonStr.indexOf('{') !== -1 ? jsonStr.indexOf('{') : Infinity,
    jsonStr.indexOf('[') !== -1 ? jsonStr.indexOf('[') : Infinity
  );
  const end = jsonStr[start] === '{' ? jsonStr.lastIndexOf('}') : jsonStr.lastIndexOf(']');
  jsonStr = jsonStr.substring(start, end + 1);
  
  return JSON.parse(jsonStr);
}
```

### 11.2 Grid 布局计算

```javascript
function calculateGridPosition(index, total) {
  const panelsPerRow = 2;
  const panelWidth = 12;  // Grafana grid 24 列
  const panelHeight = 8;
  
  return {
    x: (index % panelsPerRow) * panelWidth,
    y: Math.floor(index / panelsPerRow) * panelHeight,
    w: panelWidth,
    h: panelHeight
  };
}
```

### 11.3 datasource 模板变量

```javascript
// Dashboard 必须包含 datasource 模板变量
templating: {
  list: [{
    type: 'datasource',
    name: 'datasource',
    query: 'prometheus',
    label: 'Data Source'
  }]
}

// 每个 Panel 和 Target 引用变量
datasource: { type: 'prometheus', uid: '$datasource' }
```

---

## 12. 约束与限制

1. **依赖外部 LLM API** - 用户需提供 API Key
2. **生成耗时** - 大量 metrics 时 30-60s
3. **PromQL 准确性** - LLM 生成的查询可能需微调
4. **Token 限制** - 单次请求 max_tokens=8000
5. **无历史记录** - 无状态，不保存生成历史
