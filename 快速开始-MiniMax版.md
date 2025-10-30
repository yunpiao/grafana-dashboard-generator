# 🚀 快速开始 - MiniMax 版本

## 使用您的 MiniMax API 立即开始！

根据您提供的 MiniMax 配置，这是专门为您准备的快速启动指南。

## 📋 您的 MiniMax 配置信息

- ✅ **API Key (JWT Token)**: 已提供
- ✅ **API 地址**: `https://api.minimaxi.com/v1`
- ✅ **模型**: `MiniMax-M2`

## 🎯 三步启动

### 第 1 步：配置环境变量

在 `backend` 目录创建 `.env` 文件：

```bash
cd backend
```

**复制并粘贴以下内容**（已包含您的配置）：

```bash
cat > .env << 'EOF'
# MiniMax API 配置
LLM_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLkupHpo5giLCJVc2VyTmFtZSI6IuS6kemjmCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTgyOTc3OTY3MzU3MTY5Nzk1IiwiUGhvbmUiOiIxMzEyMTY2NTU0NyIsIkdyb3VwSUQiOiIxOTgyOTc3OTY3MzQ4NzgxNDcyIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMTAtMjggMTQ6MzE6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.y5qCRwkJgnwHQWAr38U-FcqEVNNB-qak9SUPRxyY-2257uhIE204BzA6YbECLA0GKDv5e81t40FrG9bpBM6mBqu1Lhq6Uyu7YqLzDptfRC1a8BpONKdqaEWAPZhDb_U-TbSZt-xJdEvZibXVYu3tTOTKkKY4gZJH4ulq4Fd-Zp7G-PEsJTuPuTsqY2xSfS-ZFBPbtFjDMMZYvNDAcsL_S6Y5ixntQ2cgacVLD0vByKKCuSU4A3sxrIkmqa5ERjDt9-qzRBQ5Mzr62DDgpSu-q5du91zjoMpd4AKGN-M3RwbLsx-5aa_g6qPCqRaQ2jK3xARIouZtFTmuODKoUWROew
LLM_API_BASE_URL=https://api.minimaxi.com/v1
LLM_MODEL=MiniMax-M2

# 服务器配置
PORT=3000
NODE_ENV=development
EOF
```

### 第 2 步：启动服务

```bash
npm start
```

您将看到：

```
╔══════════════════════════════════════════════════════════╗
║  Metrics to Grafana Dashboard Generator                 ║
╚══════════════════════════════════════════════════════════╝

Server running on: http://localhost:3000
Using model: MiniMax-M2
Using custom API endpoint: https://api.minimaxi.com/v1
...
Ready to generate dashboards! 🚀
```

### 第 3 步：生成仪表盘

1. **打开浏览器**：http://localhost:3000

2. **粘贴测试数据**：
   - 打开项目根目录的 `test-metrics-example.txt`
   - 复制全部内容
   - 粘贴到网页的文本框

3. **点击生成**：
   - 点击 "✨ Generate Dashboard" 按钮
   - 等待 30-90 秒（MiniMax 正在生成）
   - 下载生成的 JSON 文件

4. **导入 Grafana**：
   - Grafana → Dashboards → Import
   - 上传 JSON 文件
   - 选择 Prometheus 数据源
   - 完成！

## 🎨 可选：不同的模型选择

MiniMax 提供多种模型，您可以在 `.env` 中修改：

```env
# 高性能（推荐）
LLM_MODEL=MiniMax-M2

# 经济实惠
LLM_MODEL=abab6.5s-chat

# 平衡选择
LLM_MODEL=abab6.5-chat
```

或在 Web 界面的 "Model Name" 输入框中指定。

## 📊 测试您的配置

运行简单测试：

```bash
# 在 backend 目录
npm test
```

您应该看到：
```
✅ Metrics are valid!
   Found 29 metrics
```

## 🔍 常见问题

### Q: Token 是否会过期？
A: JWT Token 可能有有效期，如果遇到认证错误，请从 MiniMax 控制台重新获取。

### Q: 生成速度如何？
A: MiniMax-M2 通常需要 30-90 秒生成一个完整仪表盘，取决于 metrics 数量。

### Q: 成本如何？
A: 请参考 MiniMax 官方定价。通常每次生成消耗 2000-8000 tokens。

### Q: 可以切换回 OpenAI 吗？
A: 可以！只需修改 `.env` 文件：
```env
OPENAI_API_KEY=sk-your-openai-key
# 注释或删除 LLM_API_BASE_URL
```

## 🎉 完成！

您的 Metrics to Grafana Dashboard Generator 已经配置好 MiniMax API，可以开始使用了！

### 下一步建议：

1. **尝试真实数据**：
   - 从您的应用获取真实 metrics
   - 粘贴到工具中生成仪表盘
   - 导入到 Grafana 查看效果

2. **探索更多功能**：
   - 尝试不同的模型
   - 调整生成参数
   - 自定义 Prompt（高级）

3. **阅读完整文档**：
   - [MINIMAX_GUIDE.md](MINIMAX_GUIDE.md) - MiniMax 详细指南
   - [README.md](README.md) - 完整项目文档
   - [CHANGELOG.md](CHANGELOG.md) - 更新日志

---

**准备好了吗？开始生成您的第一个 AI 驱动的 Grafana 仪表盘！** 🚀📊


