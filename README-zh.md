# 📊 Metrics to Grafana Dashboard Generator

> 🤖 使用 AI 自动将 Prometheus Metrics 转换为精美的 Grafana 仪表盘

> **✨ 最新更新 (v1.1.8)**: 
> - ✅ 已修复 Dashboard 生成格式问题，可以直接导入 Grafana
> - ✅ 新增 LLM 自动重试机制，失败时会自动重试而不是直接退出
> - ✅ 增强 JSON 解析，处理 `<think>` 标签等特殊情况
> - ✅ 部分 panel 失败不影响整体生成
> - ✅ 修复数据源配置，导入后可选择任何 Prometheus 数据源
> - ✅ 修复 byRefId 错误，使用正确的 fieldConfig 配置
> - ✅ 优化 PromQL 语法规则，生成更准确的查询
> - ✅ 在页面展示 Panel Plans，透明展示 AI 分析过程
> - ✅ 用户可选择生成哪些 Panels，灵活控制，节省时间和成本
> - ✅ 前端 Metrics 预览，展示 labels/types/help，节省带宽
> - ✅ **本地 API 配置管理，支持保存多个配置，快速切换** ⭐ 最新
> 
> 详见 [最新改进总结.md](最新改进总结.md) 和 [CHANGELOG.md](CHANGELOG.md)

## ✨ 项目特点

- ✅ **零配置开始** - 粘贴 metrics，一键生成
- 🤖 **AI 驱动** - 支持 OpenAI 和 MiniMax
- 📊 **智能分析** - 自动识别监控模式
- 🎯 **精确查询** - 生成正确的 PromQL
- 🎨 **美观界面** - 现代化 Web UI
- 🔧 **灵活配置** - 多种 API 支持

## 🚀 快速开始（3 分钟）

### 使用 MiniMax API（推荐给中国用户）

```bash
# 1. 进入后端目录
cd backend

# 2. 配置 MiniMax（使用您的 token）
cat > .env << 'EOF'
LLM_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLkupHpo5giLCJVc2VyTmFtZSI6IuS6kemjmCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTgyOTc3OTY3MzU3MTY5Nzk1IiwiUGhvbmUiOiIxMzEyMTY2NTU0NyIsIkdyb3VwSUQiOiIxOTgyOTc3OTY3MzQ4NzgxNDcyIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMTAtMjggMTQ6MzE6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.y5qCRwkJgnwHQWAr38U-FcqEVNNB-qak9SUPRxyY-2257uhIE204BzA6YbECLA0GKDv5e81t40FrG9bpBM6mBqu1Lhq6Uyu7YqLzDptfRC1a8BpONKdqaEWAPZhDb_U-TbSZt-xJdEvZibXVYu3tTOTKkKY4gZJH4ulq4Fd-Zp7G-PEsJTuPuTsqY2xSfS-ZFBPbtFjDMMZYvNDAcsL_S6Y5ixntQ2cgacVLD0vByKKCuSU4A3sxrIkmqa5ERjDt9-qzRBQ5Mzr62DDgpSu-q5du91zjoMpd4AKGN-M3RwbLsx-5aa_g6qPCqRaQ2jK3xARIouZtFTmuODKoUWROew
LLM_API_BASE_URL=https://api.minimaxi.com/v1
LLM_MODEL=MiniMax-M2
PORT=3000
EOF

# 3. 启动服务
npm start

# 4. 打开浏览器
# http://localhost:3000
```

### 使用 OpenAI API

```bash
cd backend
echo "OPENAI_API_KEY=sk-your-key-here" > .env
npm start
```

## 📖 完整文档

> 📚 查看 [文档索引.md](文档索引.md) 了解所有文档

### 推荐阅读

| 文档 | 说明 | 何时阅读 |
|------|------|---------|
| [快速开始-MiniMax版.md](快速开始-MiniMax版.md) | 3 分钟快速上手 | **👈 从这里开始** |
| [最新改进总结.md](最新改进总结.md) | 最新修复和改进 | **了解新功能** |
| [常见Grafana错误修复.md](常见Grafana错误修复.md) | 错误排查指南 | 遇到问题时 |
| [数据源配置说明.md](数据源配置说明.md) | 数据源配置详解 | 导入 dashboard 时 |
| [MINIMAX_GUIDE.md](MINIMAX_GUIDE.md) | MiniMax 详细指南 | 深入了解 |

### 其他文档

- [README.md](README.md) - English documentation
- [QUICKSTART.md](QUICKSTART.md) - English quick start  
- [CHANGELOG.md](CHANGELOG.md) - 更新日志
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - 项目架构

## 🎯 工作流程

```
用户粘贴 Metrics
    ↓
解析 & 验证
    ↓
AI 分析（规划面板）
    ↓
AI 生成（逐个创建）
    ↓
组装 Dashboard JSON
    ↓
下载 & 导入 Grafana
    ↓
完成！
```

## 📦 项目结构

```
grafana-dashboard-generator/
├── backend/                    # Node.js 后端
│   └── src/
│       ├── server.js              # Express 服务器
│       ├── metricsParser.js       # Metrics 解析
│       ├── llmService.js          # LLM API 调用
│       ├── prompts.js             # AI Prompts
│       └── dashboardGenerator.js  # 仪表盘生成
├── frontend/                   # Web 界面
│   ├── index.html
│   ├── app.js
│   └── style.css
├── scripts/                    # 工具脚本
├── docs/                       # 文档
└── 子模块/
    ├── kaggle-gemini3-writeups-explorer/  # Kaggle Writeups 浏览器 (Streamlit)
    └── prometheus-to-grafana-ai/          # Grafana Dashboard 生成器 (Gemini版)
```

## 🎨 支持的 LLM 提供商

### OpenAI
- ✅ GPT-4 Turbo（推荐）
- ✅ GPT-4
- ✅ GPT-3.5 Turbo

### MiniMax
- ✅ MiniMax-M2（推荐）
- ✅ abab6.5s-chat
- ✅ abab6.5-chat
- ✅ abab5.5s-chat

### 其他
- ✅ 任何兼容 OpenAI API 格式的服务

## 🔧 核心功能

### 1. 智能解析
- 自动识别 metric 类型（counter, gauge, histogram）
- 提取所有标签
- 保留帮助文档

### 2. AI 分析
- 识别监控模式（RED, USE, Golden Signals）
- 规划仪表盘结构
- 建议可视化类型

### 3. 精确生成
- **Counter** → `rate()` 查询
- **Gauge** → 直接查询
- **Histogram** → `histogram_quantile()` 计算百分位数
- 自动配置单位、图例、颜色

### 4. 完整输出
- 标准 Grafana Dashboard JSON
- 自动布局
- 即导即用

## 💡 使用示例

### 1. 获取 Metrics

```bash
# 从您的应用获取
curl http://localhost:8080/metrics > my-metrics.txt

# 或从 Prometheus
curl http://prometheus:9090/metrics > my-metrics.txt
```

### 2. 生成 Dashboard

访问 http://localhost:3000
1. 粘贴 metrics 内容
2. （可选）配置 API
3. 点击生成
4. 下载 JSON

### 3. 导入 Grafana

Grafana → Dashboards → Import → 上传 JSON

## 📊 生成示例

输入 29 个 metrics，AI 会生成：
- 📈 HTTP 请求速率图表
- ⏱️ 延迟百分位数图表
- 💾 内存使用趋势
- 🗄️ 数据库连接池状态
- 📦 队列处理性能
- 💰 缓存命中率
- ... 等更多

## 🎯 适用场景

- ✅ 快速搭建监控仪表盘
- ✅ 学习 PromQL 查询
- ✅ 监控新服务
- ✅ 生成监控模板
- ✅ 自动化运维

## 💰 成本估算

### MiniMax
- 小型（10-20 metrics）：约 ¥0.5-1
- 中型（50-100 metrics）：约 ¥2-3
- 大型（200+ metrics）：约 ¥5-10

### OpenAI GPT-4
- 小型：~$0.10-0.20
- 中型：~$0.30-0.50
- 大型：~$0.80-1.50

## 🔒 安全性

- ✅ API Key 仅用于请求
- ✅ 不存储任何数据
- ✅ 支持环境变量
- ✅ 可自托管部署

## 🛠️ 技术栈

- **后端**: Node.js 18+, Express 4
- **前端**: 原生 HTML/CSS/JavaScript
- **AI**: OpenAI SDK (兼容多种 API)
- **解析**: 自定义 Prometheus 解析器

## 📝 常见问题

### Q: 支持哪些 metrics 格式？
A: 标准 Prometheus text 格式。

### Q: 生成需要多久？
A: 通常 30-90 秒，取决于 metrics 数量。

### Q: 可以自定义生成结果吗？
A: 高级用户可以修改 `prompts.js` 文件。

### Q: 生成的仪表盘质量如何？
A: 使用 GPT-4/MiniMax-M2 时质量很高，可直接使用。

### Q: 是否开源？
A: 是的，MIT 许可证。

## 🎓 学习资源

- [Prometheus 文档](https://prometheus.io/docs/)
- [Grafana 文档](https://grafana.com/docs/)
- [PromQL 教程](https://prometheus.io/docs/prometheus/latest/querying/basics/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

## 🎉 立即开始

选择您的方式：

1. **MiniMax 用户**（推荐）：
   - 查看 [快速开始-MiniMax版.md](快速开始-MiniMax版.md)

2. **OpenAI 用户**：
   - 查看 [快速开始.md](快速开始.md) 或 [QUICKSTART.md](QUICKSTART.md)

3. **了解更多**：
   - 查看 [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)

**祝您使用愉快！** 🚀📊


