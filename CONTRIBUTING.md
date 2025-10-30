# Contributing to Grafana Dashboard Generator

首先，感谢你考虑为这个项目做贡献！ 🎉

First off, thanks for taking the time to contribute! 🎉

## 📋 目录 / Table of Contents

- [行为准则 / Code of Conduct](#行为准则--code-of-conduct)
- [如何贡献 / How Can I Contribute?](#如何贡献--how-can-i-contribute)
- [开发环境设置 / Development Setup](#开发环境设置--development-setup)
- [提交规范 / Commit Guidelines](#提交规范--commit-guidelines)
- [代码规范 / Code Style](#代码规范--code-style)

## 行为准则 / Code of Conduct

请保持友好和尊重。我们致力于提供一个友好、安全和包容的环境。

Please be friendly and respectful. We are committed to providing a welcoming, safe, and inclusive environment.

## 如何贡献 / How Can I Contribute?

### 🐛 报告 Bug / Reporting Bugs

如果你发现了 bug，请[创建一个 issue](../../issues/new)并包含：

If you find a bug, please [create an issue](../../issues/new) with:

- 清晰的标题 / Clear title
- 详细的复现步骤 / Detailed reproduction steps
- 期望的行为 / Expected behavior
- 实际的行为 / Actual behavior
- 系统信息 / System information (OS, Node.js version, etc.)
- 错误日志 / Error logs (if applicable)

### 💡 建议新功能 / Suggesting Features

我们欢迎新想法！请[创建一个 feature request](../../issues/new)并说明：

We welcome new ideas! Please [create a feature request](../../issues/new) and explain:

- 功能描述 / Feature description
- 使用场景 / Use case
- 为什么这个功能有用 / Why this feature would be useful
- 可能的实现方式 / Possible implementation (optional)

### 🔧 提交代码 / Pull Requests

1. **Fork 这个仓库 / Fork the repository**

2. **创建分支 / Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-fix
   ```

3. **做出改变 / Make your changes**
   - 遵循代码规范 / Follow code style
   - 添加测试（如果适用）/ Add tests (if applicable)
   - 更新文档 / Update documentation

4. **提交改变 / Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **推送到你的 fork / Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **创建 Pull Request / Create a Pull Request**
   - 描述你的改变 / Describe your changes
   - 引用相关 issue / Reference related issues
   - 等待 review / Wait for review

## 开发环境设置 / Development Setup

### 前置要求 / Prerequisites

- Node.js 18+
- npm or yarn
- Git

### 安装步骤 / Installation

```bash
# 克隆你的 fork / Clone your fork
git clone https://github.com/YOUR_USERNAME/grafana.git
cd grafana

# 安装依赖 / Install dependencies
cd backend
npm install

# 配置环境变量 / Configure environment
cp .env.example .env
# 编辑 .env 添加你的 API key / Edit .env to add your API key

# 启动开发服务器 / Start development server
npm run dev
```

### 项目结构 / Project Structure

```
/grafana
├── backend/          # Node.js 后端 / Backend
│   ├── src/
│   │   ├── server.js              # Express 服务器 / Express server
│   │   ├── metricsParser.js       # Metrics 解析 / Metrics parser
│   │   ├── llmService.js          # LLM API / LLM API calls
│   │   ├── dashboardGenerator.js  # 核心生成逻辑 / Core generation
│   │   └── prompts.js             # AI Prompts
│   └── package.json
│
├── frontend/         # 前端 / Frontend
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── i18n/        # 国际化 / Internationalization
│
└── docs/            # 文档 / Documentation
```

## 提交规范 / Commit Guidelines

我们使用[约定式提交 / Conventional Commits](https://www.conventionalcommits.org/)规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 / Types

- `feat`: 新功能 / New feature
- `fix`: Bug 修复 / Bug fix
- `docs`: 文档改变 / Documentation changes
- `style`: 代码格式（不影响代码运行）/ Code style (formatting)
- `refactor`: 代码重构 / Code refactoring
- `perf`: 性能优化 / Performance improvements
- `test`: 添加测试 / Adding tests
- `chore`: 构建过程或辅助工具的变动 / Build/tooling changes
- `i18n`: 国际化 / Internationalization

### 示例 / Examples

```bash
feat(dashboard): add support for custom templates
fix(parser): handle metrics without HELP text
docs(readme): update installation instructions
i18n(zh-CN): add Chinese translations
```

## 代码规范 / Code Style

### JavaScript

- 使用 ES6+ 特性 / Use ES6+ features
- 使用 `const` 和 `let`，不使用 `var` / Use `const` and `let`, not `var`
- 使用 async/await 而非 Promise / Prefer async/await over Promises
- 使用模板字符串 / Use template literals
- 保持函数简短和专注 / Keep functions short and focused

### 命名规范 / Naming Conventions

- **函数 / Functions**: `camelCase` (e.g., `generateDashboard`)
- **变量 / Variables**: `camelCase` (e.g., `metricsList`)
- **常量 / Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **类 / Classes**: `PascalCase` (e.g., `DashboardGenerator`)

### 注释 / Comments

```javascript
// ✅ 好的注释 / Good: Explains WHY
// We need to retry because MiniMax API occasionally returns 500 errors
async function callWithRetry() { ... }

// ❌ 不好的注释 / Bad: Explains WHAT (code is self-explanatory)
// This function calls the API
async function callApi() { ... }
```

### 文件组织 / File Organization

```javascript
// 1. 导入 / Imports
import express from 'express';
import { generateDashboard } from './generator.js';

// 2. 常量 / Constants
const PORT = process.env.PORT || 3000;

// 3. 辅助函数 / Helper functions
function parseMetrics(text) { ... }

// 4. 主要函数 / Main functions
export async function main() { ... }

// 5. 导出 / Exports
export { parseMetrics };
```

## 贡献领域 / Areas to Contribute

### 🔥 高优先级 / High Priority

- [ ] 添加单元测试 / Add unit tests
- [ ] 改进错误处理 / Improve error handling
- [ ] 性能优化 / Performance optimization
- [ ] 支持更多 LLM / Support more LLM providers
- [ ] 改进 PromQL 生成质量 / Improve PromQL generation quality

### 📚 文档 / Documentation

- [ ] 添加更多使用示例 / Add more usage examples
- [ ] API 文档 / API documentation
- [ ] 视频教程 / Video tutorials
- [ ] 翻译文档 / Translate documentation

### 🎨 前端 / Frontend

- [ ] UI/UX 改进 / UI/UX improvements
- [ ] 移动端适配 / Mobile responsiveness
- [ ] 暗色模式 / Dark mode
- [ ] 更多国际化语言 / More i18n languages

### 🚀 新功能 / New Features

- [ ] Dashboard 模板库 / Dashboard templates
- [ ] 历史记录保存 / History saving
- [ ] 批量生成 / Batch generation
- [ ] Grafana Plugin / Grafana plugin
- [ ] CLI 工具 / CLI tool

## 🤝 需要帮助？ / Need Help?

- 💬 [创建 Discussion](../../discussions)
- 📧 联系维护者 / Contact maintainers
- 📖 阅读文档 / Read documentation

## 📄 许可证 / License

通过贡献，你同意你的贡献将在 MIT 许可证下发布。

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**感谢你的贡献！ / Thank you for your contributions!** 🙏

