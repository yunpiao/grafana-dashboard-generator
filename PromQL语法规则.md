# PromQL 语法规则

## 常见错误和正确写法

### ❌ 错误 1: 聚合操作符位置错误

**错误示例**:
```promql
rate(gin_requests_total[5m]) by (method, code)
```

**错误原因**: `by` 修饰符不能直接跟在 `rate()` 等函数后面。

**正确写法**:
```promql
# 方式 1: 聚合函数包裹表达式
sum(rate(gin_requests_total[5m])) by (method, code)

# 方式 2: 聚合函数前置语法
sum by (method, code) (rate(gin_requests_total[5m]))
```

---

## PromQL 聚合操作符规则

### 1. 聚合操作符必须包裹表达式

**聚合操作符列表**:
- `sum` - 求和
- `avg` - 平均值
- `max` - 最大值
- `min` - 最小值
- `count` - 计数
- `stddev` - 标准差
- `stdvar` - 方差
- `topk` - 前 k 个最大值
- `bottomk` - 前 k 个最小值
- `quantile` - 分位数

**语法格式**:
```promql
<aggregation_operator>([parameter,] <vector expression>) [without|by (<label list>)]
```

或者:
```promql
<aggregation_operator> [without|by (<label list>)] ([parameter,] <vector expression>)
```

### 2. 正确示例

#### 按标签分组求和
```promql
# ✅ 正确
sum(rate(http_requests_total[5m])) by (method, status)

# ✅ 也正确（前置语法）
sum by (method, status) (rate(http_requests_total[5m]))

# ❌ 错误
rate(http_requests_total[5m]) by (method, status)
```

#### 计算平均值
```promql
# ✅ 正确
avg(node_memory_usage) by (instance)

# ❌ 错误
node_memory_usage by (instance)
```

#### 获取最大值
```promql
# ✅ 正确
max(cpu_usage_percent) by (pod)

# ❌ 错误
cpu_usage_percent by (pod)
```

---

## 常见场景的正确写法

### 1. 请求速率（Request Rate）

```promql
# 按方法和状态码分组的请求速率
sum(rate(http_requests_total[5m])) by (method, status)

# 按服务分组的总请求速率
sum(rate(http_requests_total[5m])) by (service)

# 不分组的总请求速率
sum(rate(http_requests_total[5m]))
```

### 2. 错误率（Error Rate）

```promql
# 5xx 错误率
sum(rate(http_requests_total{status=~"5.."}[5m])) by (method)

# 错误百分比
sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
/
sum(rate(http_requests_total[5m])) by (service)
* 100
```

### 3. 延迟（Latency）

```promql
# P95 延迟（使用 histogram）
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# P99 延迟按服务分组
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
)

# 平均延迟（使用 summary）
rate(http_request_duration_seconds_sum[5m])
/
rate(http_request_duration_seconds_count[5m])
```

### 4. CPU 使用率

```promql
# 按实例的 CPU 使用率
avg(rate(process_cpu_seconds_total[5m])) by (instance) * 100

# 按 pod 的 CPU 使用率
sum(rate(container_cpu_usage_seconds_total[5m])) by (pod)
```

### 5. 内存使用

```promql
# 内存使用量（按实例）
sum(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) by (instance)

# 内存使用百分比
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)
/
node_memory_MemTotal_bytes
* 100
```

---

## Rate 函数使用规则

### 1. rate() - 每秒平均速率

```promql
# ✅ 用于 counter 类型
rate(http_requests_total[5m])

# ✅ 通常需要聚合
sum(rate(http_requests_total[5m])) by (method)

# ❌ 不要用于 gauge 类型
rate(memory_usage_bytes[5m])  # 错误！memory 是 gauge
```

### 2. irate() - 瞬时速率

```promql
# ✅ 用于快速变化的 counter
irate(http_requests_total[5m])

# ⚠️  对于告警和图表，推荐使用 rate() 而不是 irate()
```

### 3. increase() - 区间内增长量

```promql
# ✅ 5分钟内的增长量
increase(http_requests_total[5m])

# ✅ 聚合
sum(increase(http_requests_total[1h])) by (service)
```

---

## Histogram 和 Summary

### 1. Histogram Quantile

```promql
# ✅ 正确：必须按 le 分组
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# ✅ 按多个标签分组
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, method, service)
)

# ❌ 错误：缺少 le 标签
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (method)
)
```

### 2. Summary

```promql
# ✅ 直接使用预计算的分位数
http_request_duration_seconds{quantile="0.95"}

# ✅ 计算平均值
rate(http_request_duration_seconds_sum[5m])
/
rate(http_request_duration_seconds_count[5m])
```

---

## Without 和 By 的区别

### by - 保留指定标签

```promql
# 只保留 method 和 status 标签
sum(rate(http_requests_total[5m])) by (method, status)

# 结果: {method="GET", status="200"}
```

### without - 删除指定标签

```promql
# 删除 instance 标签，保留其他所有标签
sum(rate(http_requests_total[5m])) without (instance)

# 结果: {method="GET", status="200", service="api"}
```

---

## 常见错误总结

### ❌ 错误写法

```promql
# 1. 聚合操作符位置错误
rate(metric[5m]) by (label)

# 2. 对 gauge 使用 rate
rate(memory_usage[5m])

# 3. histogram_quantile 缺少 le
histogram_quantile(0.95, rate(metric_bucket[5m]))

# 4. 直接对原始 metric 使用 by
http_requests_total by (method)

# 5. 在聚合后使用 rate
sum(http_requests_total) by (method)  # 应该先 rate 再 sum
```

### ✅ 正确写法

```promql
# 1. 聚合包裹表达式
sum(rate(metric[5m])) by (label)

# 2. gauge 直接使用或使用 delta
delta(memory_usage[5m])

# 3. histogram_quantile 包含 le
histogram_quantile(0.95, 
  sum(rate(metric_bucket[5m])) by (le)
)

# 4. 使用聚合操作符
sum(http_requests_total) by (method)

# 5. 先 rate 再聚合
sum(rate(http_requests_total[5m])) by (method)
```

---

## 最佳实践

### 1. Counter 指标

```promql
# ✅ 始终使用 rate() 或 increase()
sum(rate(counter_metric[5m])) by (label)

# ✅ 不要直接使用原始 counter
```

### 2. Gauge 指标

```promql
# ✅ 可以直接使用
avg(gauge_metric) by (label)

# ✅ 或使用 delta 计算变化
delta(gauge_metric[5m])
```

### 3. 时间窗口选择

```promql
# 短期趋势: 1-5 分钟
rate(metric[1m])

# 中期趋势: 5-15 分钟
rate(metric[5m])

# 长期趋势: 1 小时+
rate(metric[1h])
```

### 4. 标签选择

```promql
# ✅ 使用 = 精确匹配
metric{label="value"}

# ✅ 使用 =~ 正则匹配
metric{label=~"value.*"}

# ✅ 使用 != 排除
metric{label!="value"}

# ✅ 使用 !~ 正则排除
metric{label!~"test.*"}
```

---

## 调试技巧

### 1. 逐步构建查询

```promql
# 第 1 步: 查看原始 metric
http_requests_total

# 第 2 步: 添加 rate
rate(http_requests_total[5m])

# 第 3 步: 添加聚合
sum(rate(http_requests_total[5m])) by (method)

# 第 4 步: 添加过滤
sum(rate(http_requests_total{status="200"}[5m])) by (method)
```

### 2. 验证结果

```promql
# 检查时间序列数量
count(metric)

# 检查标签值
group by (label) (metric)

# 检查是否有数据
count(rate(metric[5m]) > 0)
```

---

## 参考资源

- [Prometheus 官方文档 - PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [PromQL 操作符](https://prometheus.io/docs/prometheus/latest/querying/operators/)
- [PromQL 函数](https://prometheus.io/docs/prometheus/latest/querying/functions/)

