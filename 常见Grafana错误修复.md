# 常见 Grafana 错误修复

本文档整理了使用本工具生成 Grafana Dashboard 时常见的错误和解决方案。

---

## 错误 1: datasource not found

### 错误信息
```
datasource not found
```
导入生成的 dashboard 时 Grafana 提示此错误。

### 原因
之前的版本硬编码了 datasource uid 为 `"prometheus"`，但您的 Grafana 中可能没有这个 uid 的数据源。

### 解决方案 ✅

#### 1. 使用模板变量（已修复）
生成的 dashboard 现在使用 `$datasource` 模板变量，导入后会在顶部显示数据源选择器。

#### 2. 导入后选择数据源
1. 导入 dashboard JSON 到 Grafana
2. 在 dashboard 顶部找到 "Data Source" 下拉框
3. 选择您的 Prometheus 数据源
4. 所有 panel 会自动使用选中的数据源

#### 3. 验证修复
生成的 dashboard 应该包含：
```json
{
  "templating": {
    "list": [{
      "name": "datasource",
      "type": "datasource",
      "query": "prometheus"
    }]
  }
}
```

每个 panel 的 datasource 应该使用：
```json
{
  "datasource": {
    "type": "prometheus",
    "uid": "$datasource"  // ✅ 使用模板变量
  }
}
```

---

## 错误 2: PromQL 语法错误

### 错误信息
```
parse error: unexpected identifier "by"
```
或者查询没有返回预期的结果。

### 原因
使用了错误的 PromQL 聚合语法，例如：
```promql
❌ rate(gin_requests_total[5m]) by (method, code)
```

`by` 修饰符不能直接跟在 `rate()`、`irate()` 等函数后面。

### 正确示例
```promql
# ✅ 方式 1: 聚合函数包裹表达式
sum(rate(gin_requests_total[5m])) by (method, code)

# ✅ 方式 2: 聚合函数前置语法
sum by (method, code) (rate(gin_requests_total[5m]))
```

### 常见场景

**请求速率**:
```promql
✅ sum(rate(http_requests_total[5m])) by (method, status)
❌ rate(http_requests_total[5m]) by (method, status)
```

**错误率**:
```promql
✅ sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
❌ rate(http_requests_total{status=~"5.."}[5m]) by (service)
```

**延迟分位数**:
```promql
✅ histogram_quantile(0.95, sum(rate(latency_bucket[5m])) by (le))
❌ histogram_quantile(0.95, rate(latency_bucket[5m]) by (le))
```

### 聚合操作符列表
- `sum` - 求和
- `avg` - 平均值
- `max` - 最大值
- `min` - 最小值
- `count` - 计数
- `topk` - 前 k 个最大值
- `bottomk` - 前 k 个最小值

**规则**: 聚合操作符必须包裹整个表达式，不能直接在 rate/irate/increase 后使用 by。

详细说明请参考 [PromQL语法规则.md](PromQL语法规则.md)

---

## 错误 1: "byRefId" not found

### 错误信息
```
Error: "byRefId" not found in: anyMatch,allMatch,invertMatch,alwaysMatch,neverMatch,byType,byTypes,numeric,time,byName,byRegexp,byNames,byRegexpOrNames,byFrameRefID,first,firstTimeField,byValue
```

### 原因
在 panel 的 `fieldConfig.overrides` 中使用了不存在的匹配器 `"byRefId"`。

Grafana 中正确的匹配器名称是 **`"byFrameRefID"`**（注意大小写和完整拼写）。

### 错误示例
```json
{
  "fieldConfig": {
    "overrides": [{
      "matcher": {
        "id": "byRefId",     // ❌ 错误！不存在
        "options": "A"
      },
      "properties": [...]
    }]
  }
}
```

### 正确示例
```json
{
  "fieldConfig": {
    "overrides": [{
      "matcher": {
        "id": "byFrameRefID",  // ✅ 正确！
        "options": "A"
      },
      "properties": [...]
    }]
  }
}
```

### 解决方案

#### 方案 1：不使用 overrides（推荐）
最简单的方法是设置为空数组：
```json
{
  "fieldConfig": {
    "defaults": { ... },
    "overrides": []  // ✅ 避免兼容性问题
  }
}
```

#### 方案 2：使用正确的匹配器
如果必须使用 overrides，确保使用正确的匹配器：

**可用的匹配器类型**：
- `byName` - 按字段名称匹配
- `byRegexp` - 按正则表达式匹配
- `byType` - 按字段类型匹配（number, string, time 等）
- `byFrameRefID` - 按 query refId 匹配（**不是** byRefId）
- `byValue` - 按值匹配
- `first` - 第一个字段
- `numeric` - 数值类型字段
- `time` - 时间类型字段

### 已修复

在 v1.1.3+ 版本中，我们已经在 prompt 中添加了明确的说明：
- ✅ 默认设置 `overrides: []`
- ✅ 禁止使用 `"byRefId"`
- ✅ 如果需要使用，强调使用正确的 `"byFrameRefID"`

---

## 错误 2: datasource not found

### 错误信息
```
datasource not found
```

### 原因
硬编码了 datasource uid，但 Grafana 中不存在该 uid 的数据源。

### 解决方案
✅ 已在 v1.1.3 中修复 - 使用 `$datasource` 模板变量

详见 [数据源配置说明.md](数据源配置说明.md)

---

## 错误 3: JSON Parse Error

### 错误信息
```
JSON Parse Error: SyntaxError: Unexpected end of JSON input
```

### 原因
LLM 返回了不完整或包含非 JSON 内容（如 `<think>` 标签）的响应。

### 解决方案
✅ 已在 v1.1.2 中修复 - 自动重试 + 智能 JSON 解析

详见 [重试机制说明.md](重试机制说明.md)

---

## 错误 4: Invalid panel type

### 错误信息
```
Panel plugin not found: xxx
```

### 原因
使用了 Grafana 不支持的 panel 类型。

### 常用的 Panel 类型
- `timeseries` - 时序图表（推荐，替代旧的 graph）
- `gauge` - 仪表盘
- `stat` - 单值显示
- `table` - 表格
- `bargauge` - 条形仪表
- `piechart` - 饼图
- `heatmap` - 热力图
- `logs` - 日志面板

### 避免使用
- ❌ `graph` - 已弃用，使用 `timeseries` 替代
- ❌ `singlestat` - 已弃用，使用 `stat` 替代

---

## 错误 5: Invalid unit

### 常用单位类型

**数值**：
- `short` - 自动格式化（k, M, G）
- `none` - 无单位
- `percent` - 百分比（0-100）
- `percentunit` - 百分比（0-1）

**时间**：
- `s` - 秒
- `ms` - 毫秒
- `ns` - 纳秒
- `µs` - 微秒

**数据大小**：
- `bytes` - 字节
- `decbytes` - 十进制字节
- `bits` - 比特
- `kbytes` - 千字节

**速率**：
- `Bps` - 字节/秒
- `Bps` - 比特/秒
- `pps` - 包/秒
- `reqps` - 请求/秒
- `ops` - 操作/秒

---

## 调试技巧

### 1. 检查生成的 JSON
在导入前，先检查 JSON 格式：
```bash
# 使用 jq 验证 JSON
cat dashboard.json | jq .
```

### 2. 查看 Grafana 日志
如果导入失败，查看 Grafana 日志获取详细错误：
```bash
# Docker
docker logs grafana

# 系统服务
journalctl -u grafana-server -f
```

### 3. 使用 Grafana 的 JSON Model
在 Dashboard Settings → JSON Model 中可以看到当前 dashboard 的完整 JSON，对比学习。

### 4. 逐步导入
如果导入失败：
1. 先创建一个最简单的 dashboard
2. 在 Grafana 中手动添加一个 panel
3. 导出 JSON，对比差异
4. 修正生成器的配置

---

## 预防措施

### 1. 使用模板变量
- ✅ 数据源使用 `$datasource`
- ✅ 避免硬编码任何 uid 或 id

### 2. 保持简单
- ✅ 使用空的 `overrides: []`
- ✅ 避免过于复杂的配置
- ✅ 优先使用 defaults 而不是 overrides

### 3. 使用标准配置
- ✅ 使用最新的 panel 类型（timeseries, stat）
- ✅ 使用标准的单位名称
- ✅ 遵循 Grafana 最佳实践

### 4. 测试验证
- ✅ 生成后先在测试环境导入
- ✅ 检查是否有错误提示
- ✅ 确认所有 panel 都能正常显示

---

## 版本兼容性

当前生成器配置：
- `schemaVersion`: 41
- `pluginVersion`: 12.0.1
- 适用于 Grafana 9.0+

如果使用较旧版本的 Grafana，可能需要调整：
- 降低 schemaVersion
- 使用旧的 panel 类型
- 简化配置选项

---

## 获取帮助

如果遇到其他错误：

1. **查看控制台日志**
   - 后端日志会显示详细的错误信息
   - 前端控制台可能有 Grafana 的警告

2. **检查文档**
   - [Grafana 官方文档](https://grafana.com/docs/)
   - [Panel Plugin 文档](https://grafana.com/docs/grafana/latest/panels-visualizations/)

3. **检查生成的 JSON**
   - 对比 Grafana 导出的 JSON
   - 使用 JSON diff 工具

4. **简化测试**
   - 只保留一个 panel
   - 使用最简单的配置
   - 逐步添加复杂度

---

## 总结

大多数错误都是由于：
1. ❌ 使用了错误的字段名（如 byRefId）
2. ❌ 硬编码了不存在的 id/uid
3. ❌ 使用了过时的 panel 类型
4. ❌ JSON 格式错误

通过使用：
1. ✅ 正确的字段名和匹配器
2. ✅ 模板变量而不是硬编码
3. ✅ 最新的 panel 类型
4. ✅ 自动重试和验证

可以避免绝大多数问题。

