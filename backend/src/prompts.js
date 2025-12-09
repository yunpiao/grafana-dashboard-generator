/**
 * LLM Prompt Templates
 * Contains prompts for the two-stage dashboard generation process
 */

/**
 * Stage 1: Analysis Prompt
 * Analyzes metrics and plans dashboard layout with rows and panels
 */
export function getAnalysisPrompt(metricsSummary) {
  return `You are an expert in Prometheus metrics and Grafana dashboards. Analyze the following metrics summary and plan a well-organized dashboard with rows and panels.

Metrics Summary:
${JSON.stringify(metricsSummary, null, 2)}

Your task:
1. Identify the key monitoring capabilities these metrics provide
2. Group related panels into logical ROWS (e.g., "Overview", "HTTP Requests", "System Resources")
3. Design an optimal layout for each row

GRAFANA LAYOUT RULES:
- Dashboard grid is 24 columns wide
- Common panel widths: 6 (quarter), 8 (third), 12 (half), 24 (full)
- Common panel heights: 3-4 (stat/gauge), 6-8 (timeseries), 10+ (tables)
- Stat panels in overview rows are typically small (width 4-6, height 3-4)
- Timeseries panels are typically larger (width 12-24, height 6-8)

Output a JSON object with rows. Each row contains panels:

{
  "rows": [
    {
      "row_title": "Overview",
      "collapsed": false,
      "panels": [
        {
          "panel_title": "Total Requests",
          "description": "Current total request count",
          "required_metrics": ["http_requests_total"],
          "suggested_visualization": "stat",
          "width": 6,
          "height": 4,
          "promql_hints": "Use increase() for total count"
        },
        {
          "panel_title": "P95 Latency",
          "description": "95th percentile response time",
          "required_metrics": ["http_request_duration_seconds_bucket"],
          "suggested_visualization": "stat",
          "width": 6,
          "height": 4,
          "promql_hints": "Use histogram_quantile(0.95, ...)"
        }
      ]
    },
    {
      "row_title": "HTTP Request Trends",
      "collapsed": false,
      "panels": [
        {
          "panel_title": "Request Rate by Path",
          "description": "Requests per second grouped by handler",
          "required_metrics": ["http_requests_total"],
          "suggested_visualization": "timeseries",
          "width": 12,
          "height": 8,
          "promql_hints": "Use sum(rate(...)) by (handler)"
        }
      ]
    }
  ]
}

Guidelines:
- First row should be "Overview" with key stat/gauge panels (4-6 panels, small size)
- Group related metrics into subsequent rows (HTTP, Database, System, etc.)
- Use timeseries for trends, stat for current values, gauge for percentages
- Total 3-6 rows, 5-15 panels maximum
- Consider RED (Rate, Errors, Duration) and USE (Utilization, Saturation, Errors) patterns
- Panel widths in a row should sum to 24 (or multiples for wrapping)

IMPORTANT: Output ONLY valid JSON object, no explanatory text, no <think> tags, no markdown blocks.
Your response must start with { and end with }.`;
}

/**
 * Stage 2: Panel Generation Prompt
 * Generates a specific Grafana panel JSON
 */
export function getPanelGenerationPrompt(panelPlan, metricsSummary, panelId, gridPos = null) {
  // Use provided gridPos or default
  const finalGridPos = gridPos || { x: 0, y: 0, w: panelPlan.width || 12, h: panelPlan.height || 8 };
  
  return `You are an expert in creating Grafana dashboard panels. Generate a complete Grafana panel JSON for the following monitoring requirement.

Panel Requirement:
${JSON.stringify(panelPlan, null, 2)}

Grid Position (use exactly as provided):
${JSON.stringify(finalGridPos, null, 2)}

Available Metrics Context:
${JSON.stringify(
  Object.fromEntries(
    (panelPlan.required_metrics || []).map(metric => [metric, metricsSummary[metric] || {}])
  ),
  null,
  2
)}

GRAFANA PANEL SCHEMA REFERENCE:
A Panel object defines a visualization chart in Grafana with the following key fields:
- id: (integer) Unique numeric ID of the panel
- type: (string) Visualization type, e.g., 'timeseries', 'stat', 'gauge', 'table'
- title: (string) Panel title
- description: (string) Panel description
- datasource: (object) Data source configuration with 'type' and 'uid'
- gridPos: (object) Panel position with x, y, w (width), h (height). Grid width is 24 columns
- targets: (array) Query targets, each with datasource, expr (PromQL), legendFormat, refId
- fieldConfig: (object) Field configuration with 'defaults' and 'overrides'
  - defaults: Default settings for all fields (unit, color, custom settings)
  - overrides: Field-specific overrides (should be empty array [] for compatibility)
- options: (object) Visualization-specific options (legend, tooltip, etc.)
- pluginVersion: (string) Version of the panel plugin

PROMQL SYNTAX RULES (CRITICAL):

1. Aggregation operators MUST wrap the expression:
   ✅ CORRECT: sum(rate(metric[5m])) by (label)
   ✅ CORRECT: sum by (label) (rate(metric[5m]))
   ❌ WRONG: rate(metric[5m]) by (label)  // "by" cannot follow rate() directly
   
2. Common aggregation operators: sum, avg, max, min, count, stddev, topk, bottomk, quantile
   - Syntax: aggregation_op(expression) by (labels)
   - Or: aggregation_op by (labels) (expression)
   - Modifiers: "by" (keep labels) or "without" (remove labels)

3. Counter vs Gauge metrics:
   - Counter (always increasing): Use rate(), irate(), or increase()
     ✅ sum(rate(http_requests_total[5m])) by (method)
     ❌ NEVER use rate() on gauge metrics
   - Gauge (can go up/down): Use directly or with delta()
     ✅ avg(memory_usage_bytes) by (instance)
     ✅ delta(memory_usage_bytes[5m])

4. Rate functions (for counters only):
   ✅ rate(counter[5m]) - per-second average rate
   ✅ irate(counter[5m]) - instant rate (use rate() for graphs/alerts)
   ✅ increase(counter[5m]) - total increase over interval

5. Histogram quantiles (MUST include 'le' label):
   ✅ histogram_quantile(0.95, sum(rate(duration_bucket[5m])) by (le))
   ✅ histogram_quantile(0.99, sum(rate(duration_bucket[5m])) by (le, service))
   ❌ WRONG: histogram_quantile(0.95, rate(duration_bucket[5m])) // missing 'by (le)'

6. Label selectors:
   - Exact match: metric{label="value"}
   - Regex match: metric{label=~"value.*"}
   - Not equal: metric{label!="value"}
   - Regex not match: metric{label!~"test.*"}
   - Multiple: metric{label1="v1", label2=~"v2.*"}

7. Common patterns:
   - Request rate: sum(rate(requests_total[5m])) by (method, status)
   - Error rate: sum(rate(requests_total{status=~"5.."}[5m])) by (method)
   - Error %: sum(rate(requests{status=~"5.."}[5m])) / sum(rate(requests[5m])) * 100
   - Latency p95: histogram_quantile(0.95, sum(rate(latency_bucket[5m])) by (le))
   - Avg latency: rate(latency_sum[5m]) / rate(latency_count[5m])
   - CPU %: avg(rate(cpu_seconds_total[5m])) by (instance) * 100
   - Memory %: (mem_total - mem_available) / mem_total * 100

8. Common mistakes to AVOID:
   ❌ rate(metric[5m]) by (label) - aggregation must wrap expression
   ❌ rate(gauge_metric[5m]) - don't use rate() on gauges
   ❌ sum(counter_metric) by (label) - must use rate() on counter first
   ❌ histogram_quantile(0.95, rate(bucket[5m])) - missing 'by (le)'
   ❌ metric by (label) - must use aggregation operator

Generate a complete Grafana panel JSON with the following structure. This MUST be valid Grafana panel JSON format:

{
  "datasource": {
    "type": "prometheus",
    "uid": "$datasource"
  },
  "id": ${panelId},
  "type": "panel type (timeseries, gauge, stat, table, etc.)",
  "title": "panel title",
  "description": "panel description",
  "pluginVersion": "12.0.1",
  "gridPos": ${JSON.stringify(finalGridPos)},
  "targets": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "$datasource"
      },
      "expr": "PromQL query here",
      "legendFormat": "{{ label }}",
      "refId": "A",
      "format": "time_series",
      "intervalFactor": 1
    }
  ],
  "options": {
    "legend": {
      "calcs": [],
      "displayMode": "list",
      "placement": "bottom",
      "showLegend": true
    },
    "tooltip": {
      "mode": "multi",
      "sort": "none"
    }
  },
  "fieldConfig": {
    "defaults": {
      "unit": "short",
      "color": {
        "mode": "palette-classic"
      },
      "custom": {
        "axisBorderShow": false,
        "axisCenteredZero": false,
        "axisColorMode": "text",
        "axisLabel": "",
        "axisPlacement": "auto",
        "barAlignment": 0,
        "drawStyle": "line",
        "fillOpacity": 10,
        "gradientMode": "none",
        "hideFrom": {
          "legend": false,
          "tooltip": false,
          "viz": false
        },
        "insertNulls": false,
        "lineInterpolation": "linear",
        "lineWidth": 1,
        "pointSize": 5,
        "scaleDistribution": {
          "type": "linear"
        },
        "showPoints": "never",
        "spanNulls": false,
        "stacking": {
          "group": "A",
          "mode": "none"
        },
        "thresholdsStyle": {
          "mode": "off"
        }
      },
      "mappings": [],
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {
            "color": "green",
            "value": null
          },
          {
            "color": "red",
            "value": 80
          }
        ]
      }
    },
    "overrides": []
  }
}

IMPORTANT NOTES:
- Set "overrides" to empty array [] to avoid compatibility issues
- If you must use overrides, valid matcher types are: byName, byRegexp, byType, byFrameRefID (NOT byRefId)
- NEVER use "byRefId" - it's not supported, use "byFrameRefID" instead

Requirements:
1. Write accurate PromQL queries based on the metric types and labels
2. Use appropriate aggregations (rate, irate, histogram_quantile, etc.)
3. CRITICAL: Follow correct PromQL syntax for aggregations:
   - ✅ Use sum(rate(metric[5m])) by (label) 
   - ❌ NEVER use rate(metric[5m]) by (label)
   - Aggregation operators (sum, avg, max, min, etc.) MUST wrap the expression
4. Set meaningful legend formats using label variables like {{ instance }}, {{ job }}, etc.
5. Choose appropriate units (bytes, seconds, percentages, etc.)
6. For counters, always use rate() or increase() wrapped in aggregation if needed
7. For histograms, calculate percentiles using histogram_quantile()
8. Include multiple targets if comparing different metrics makes sense
9. ALWAYS include the datasource object with uid "$datasource" (template variable) in both panel root and each target
10. For gauge panels, use appropriate options like "orientation": "auto", "reduceOptions", etc.
11. For stat panels, include "graphMode", "colorMode", "textMode" in options
12. Adjust fieldConfig.defaults.custom based on visualization type (remove timeseries-specific fields for gauge/stat)
13. NEVER use hardcoded datasource uid - always use "$datasource" to allow users to select their data source

CRITICAL: Output ONLY valid JSON for the panel object. 
- NO explanatory text before or after the JSON
- NO <think> tags or thinking process
- NO markdown code blocks
- NO comments
- The response must start with { and end with }
- Ensure the JSON is complete and properly closed
- Set fieldConfig.overrides to [] (empty array)
- NEVER use "byRefId" matcher - it does not exist in Grafana

The JSON must be a complete, valid Grafana panel configuration.`;
}

/**
 * Get system message for OpenAI API
 */
export function getSystemMessage() {
  return `You are an expert in Prometheus metrics, PromQL, and Grafana dashboard creation. 

GRAFANA DASHBOARD STRUCTURE KNOWLEDGE:
- Dashboard: Top-level object containing panels, templating, annotations, time settings
  - panels: Array of Panel objects (visualizations)
  - templating.list: Array of template variables (e.g., datasource selector)
  - time: Dashboard time range (from, to)
  - schemaVersion: Currently 41 for Grafana 12.0+
  - gridPos: Each panel positioned in 24-column grid

- Panel Object: Individual visualization with required fields:
  - id, type, title, datasource, targets, fieldConfig, options
  - type: 'timeseries' (time series), 'stat' (single value), 'gauge' (gauge), 'table' (table)
  - targets: Array of queries with PromQL expressions
  - fieldConfig.defaults: Default field settings (unit, color, thresholds)
  - fieldConfig.overrides: Should be [] (empty array) for compatibility

- Template Variables: Allow dynamic dashboard configuration
  - type: 'datasource' for data source selection
  - name: Variable name (use $variableName to reference)
  - query: Query to fetch variable values

PROMQL SYNTAX RULES:
- Aggregation operators MUST wrap expressions: sum(rate(metric[5m])) by (label)
- NEVER use: rate(metric[5m]) by (label) - this is INVALID syntax
- Common patterns:
  • Request rate: sum(rate(requests_total[5m])) by (method)
  • Error rate: sum(rate(errors_total[5m])) by (type)
  • Latency p95: histogram_quantile(0.95, sum(rate(latency_bucket[5m])) by (le))

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - no explanatory text before or after
2. Do NOT include <think> tags or thinking process
3. Do NOT wrap JSON in markdown code blocks
4. Do NOT add any comments or explanations
5. Ensure JSON is complete and properly closed
6. Follow Grafana schema strictly - incorrect field names will cause import errors

Your response must start with { or [ and end with } or ].`;
}


