# 📸 Screenshots 截图目录

## 📋 需要的截图清单

### 必须有的截图 (优先级 P0)

1. **01-home.png** - 首页界面
   - 显示欢迎文字和主要步骤
   - 空的 metrics 输入框
   - 清晰的 UI 布局

2. **02-metrics-preview.png** - Metrics 预览
   - 粘贴了 metrics 后的状态
   - 显示解析的信息：metric 数量、类型、标签
   - "继续分析" 按钮

3. **03-panel-plans.png** - AI 分析结果
   - 显示多个 Panel Plans 卡片
   - 每个卡片显示面板名称、描述、查询预览
   - 全选/取消按钮

4. **04-generating.png** - 生成中状态
   - Loading 动画
   - 进度提示
   - 或显示生成成功的消息

5. **05-download.png** - 下载页面
   - 显示成功消息
   - 下载按钮
   - 生成的 dashboard 信息

6. **06-grafana-import.png** - Grafana 导入界面
   - 在 Grafana 中上传 JSON 的界面
   - 显示导入选项

7. **07-final-dashboard.png** - 最终 Dashboard 效果
   - 在 Grafana 中显示的完整 Dashboard
   - 包含多个面板
   - 有数据的图表

### 重要的截图 (优先级 P1)

8. **08-config-management.png** - 配置管理
   - API 配置界面
   - 显示已保存的配置

9. **09-language-switch.png** - 多语言支持
   - 显示语言切换功能

10. **10-mobile-view.png** - 移动端界面
    - 响应式设计展示

### 可选的截图 (优先级 P2)

11. **comparison.png** - 对比图
    - 手动 vs AI 生成的时间对比
    - 或功能对比

12. **architecture.png** - 架构图
    - 系统架构示意图

---

## 📐 截图规范

### 尺寸要求
- **主要截图**: 1920x1080 (16:9)
- **特写截图**: 1200x800 或实际尺寸
- **社交媒体**: 1200x630 (Twitter/Facebook)

### 质量要求
- **格式**: PNG (保留清晰度)
- **分辨率**: 至少 144 DPI
- **文件大小**: 单个文件 < 500KB (优化后)

### 内容要求
- ✅ 使用真实但脱敏的数据
- ✅ 界面完整，没有遮挡
- ✅ 字体清晰可读
- ✅ 颜色对比度好
- ❌ 不包含敏感信息
- ❌ 不使用 Lorem Ipsum 等假数据

---

## 🎨 美化建议

### 浏览器设置
1. **使用 Chrome 无痕模式**
   - 干净的界面
   - 没有插件干扰

2. **隐藏不必要的元素**
   ```javascript
   // 在控制台执行
   document.querySelector('.navbar').style.display = 'none';
   ```

3. **调整窗口大小**
   - 1920x1080 (或其他标准尺寸)
   - 使用浏览器开发工具的响应式模式

### 内容准备

**示例 Metrics:**
```
# 使用真实但通用的 metric 名称
http_requests_total
http_request_duration_seconds
database_connections
memory_usage_bytes
cpu_usage_percent
...
```

**隐藏敏感信息:**
- API Keys (用 `sk-xxxx...xxxx` 代替)
- 域名 (用 `example.com` 代替)
- IP 地址 (用 `192.168.x.x` 代替)

---

## 🛠️ 截图工具

### macOS
- **Command + Shift + 4** (系统自带)
- **Command + Shift + 3** (全屏)
- **CleanShot X** (推荐，付费)
- **Skitch** (免费，可标注)

### Windows
- **Win + Shift + S** (系统自带)
- **Snipping Tool** (系统自带)
- **ShareX** (免费，功能强大)
- **Greenshot** (免费)

### 跨平台
- **Flameshot** (开源)
- **Lightshot**

### 浏览器扩展
- **Awesome Screenshot**
- **Fireshot** (可以截取整个页面)
- **Nimbus Screenshot**

---

## ✂️ 后期处理

### 图片优化

**压缩工具:**
- [TinyPNG](https://tinypng.com/) - 在线压缩
- [ImageOptim](https://imageoptim.com/) - Mac 应用
- [Squoosh](https://squoosh.app/) - Google 工具

**目标:**
- 保持清晰度
- 减小文件大小
- 适合网页加载

### 添加标注

**工具:**
- **Skitch** (Mac/Windows)
- **Snagit** (付费，专业)
- **Canva** (在线，免费)

**标注建议:**
- 使用箭头指示重点
- 添加简短说明文字
- 使用高对比度颜色（如红色、黄色）
- 不要过度标注

### 制作对比图

**工具:**
- **Photoshop** (专业)
- **GIMP** (免费)
- **Canva** (在线)

**模板:**
```
[Before]          [After]
手动配置           AI 生成
2-4 小时          3 分钟
容易出错          准确可靠
重复劳动          一键完成
```

---

## 🎬 GIF 动画

### 需要的 GIF

1. **demo.gif** - 完整流程 (15-20 秒)
   - 粘贴 metrics
   - AI 分析
   - 选择面板
   - 生成下载

2. **quick-demo.gif** - 超快演示 (5 秒)
   - 快速展示主要步骤

3. **panel-selection.gif** - 面板选择 (5 秒)
   - 展示勾选面板的交互

### GIF 规范

**尺寸:**
- 宽度: 800-1000px
- 高度: 按比例
- 文件大小: < 10MB

**帧率:**
- 10-15 FPS (流畅且文件小)
- 循环播放

**优化:**
- 减少颜色数量
- 删除不必要的帧
- 使用 [Gifski](https://gif.ski/) 压缩

---

## 📋 截图检查清单

### 拍摄前
- [ ] 清理浏览器缓存和历史
- [ ] 准备好示例数据
- [ ] 调整窗口大小
- [ ] 测试完整流程
- [ ] 关闭不相关的标签页

### 拍摄中
- [ ] 确保界面完整
- [ ] 检查字体大小（是否清晰）
- [ ] 检查颜色对比度
- [ ] 确保没有敏感信息
- [ ] 多拍几张备选

### 拍摄后
- [ ] 检查清晰度
- [ ] 优化文件大小
- [ ] 添加必要的标注
- [ ] 重命名为规范的文件名
- [ ] 保存原始文件（备份）

---

## 📂 文件命名规范

```
格式: [序号]-[描述].png

示例:
01-home.png
02-metrics-preview.png
03-panel-plans.png
04-generating.png
05-download.png
06-grafana-import.png
07-final-dashboard.png

GIF:
demo.gif
quick-demo.gif
panel-selection.gif
```

---

## 🌟 示例：好的截图 vs 差的截图

### ✅ 好的截图
- 高分辨率
- 界面完整
- 内容真实
- 重点突出
- 没有干扰元素
- 文字清晰可读

### ❌ 差的截图
- 分辨率低，模糊
- 界面不完整
- 使用假数据
- 没有重点
- 包含敏感信息
- 字体太小看不清

---

## 🚀 快速开始

### 今天就可以做

1. **准备环境** (10 分钟)
   ```bash
   cd frontend
   # 启动服务
   open index.html
   ```

2. **准备数据** (5 分钟)
   - 复制 `test-metrics-example.txt` 的内容
   - 或使用你自己的真实 metrics

3. **开始截图** (30 分钟)
   - 按照上面的清单逐一截图
   - 保存到 `screenshots/` 目录

4. **优化图片** (15 分钟)
   - 使用 TinyPNG 压缩
   - 检查效果

5. **更新 README** (5 分钟)
   - 在 README.md 中添加截图
   ```markdown
   ## Screenshots
   
   ![Home](screenshots/01-home.png)
   ![Metrics Preview](screenshots/02-metrics-preview.png)
   ...
   ```

**总时间: ~1 小时**

---

## 💡 专业技巧

### 1. 使用浏览器设备模拟
```
Chrome DevTools → 切换设备模拟器
- 选择 "Responsive"
- 设置精确尺寸: 1920x1080
- 截图
```

### 2. 隐藏滚动条
```css
/* 在开发者工具中添加 */
body::-webkit-scrollbar {
  display: none;
}
```

### 3. 制作高质量 GIF
```bash
# 使用 FFmpeg 和 Gifski
ffmpeg -i screen-recording.mov -vf "fps=15,scale=1000:-1" frames%04d.png
gifski -o demo.gif frames*.png
```

### 4. 批量优化图片
```bash
# macOS: 使用 ImageOptim CLI
imageoptim screenshots/*.png

# 或使用 TinyPNG API
```

---

**记住: 高质量的截图是最好的营销材料！花时间做好它！** 📸✨

