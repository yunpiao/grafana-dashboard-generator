import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIResponse, DashboardPlan, PanelType } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// Clean Markdown blocks
const cleanResponse = (text: string | undefined): string => {
  if (!text) throw new Error("No response from AI");
  return text.replace(/```json\n?|```/g, '').trim();
};

// Fix PromQL: replace {__name__=~"metric_a|metric_b"} with explicit metric names
const fixPromQL = (promql: string): string => {
  // Pattern: rate({__name__=~"metricA|metricB"}[5m]) -> rate(metricA[5m]) + rate(metricB[5m])
  const regex = /(\w+)\(\{__name__=~["']([^"']+)["']\}\[(\w+)\]\)/g;
  
  let result = promql;
  let match;
  
  while ((match = regex.exec(promql)) !== null) {
    const func = match[1]; // e.g., "rate"
    const metricsStr = match[2]; // e.g., "metricA|metricB"
    const interval = match[3]; // e.g., "5m"
    
    // Split by | and create individual queries
    const metrics = metricsStr.split('|').map(m => m.trim());
    const expanded = metrics.map(m => `${func}(${m}[${interval}])`).join(' + ');
    
    result = result.replace(match[0], expanded);
  }
  
  // Also handle simple {__name__=~"..."} without function wrapper
  const simpleRegex = /\{__name__=~["']([^"']+)["']\}/g;
  result = result.replace(simpleRegex, (_, metricsStr) => {
    const metrics = metricsStr.split('|').map((m: string) => m.trim());
    return metrics.join(' + ');
  });
  
  return result;
};

// Apply fix to all panels in a category
const fixCategoryPromQL = (category: { name: string; panels: any[] }): { name: string; panels: any[] } => {
  return {
    ...category,
    panels: category.panels.map(panel => ({
      ...panel,
      promql: fixPromQL(panel.promql || '')
    }))
  };
};

export const generateDashboardPlan = async (metrics: string, userContext?: string): Promise<DashboardPlan> => {
  const ai = getAIClient();
  
  const contextInstruction = userContext 
    ? `\n\nUSER CONTEXT / REQUIREMENTS: "${userContext}"\nPrioritize panels that align with this context.` 
    : "";

  const systemInstruction = `
    You are a Grafana Solutions Architect.
    Analyze the provided Prometheus metrics.
    Propose a logical dashboard structure with Categories (Rows) and Panels.
    
    ${contextInstruction}

    ## CRITICAL LAYOUT RULES (Grafana uses 24-column grid):

    ### Panel Sizing (MUST follow exactly):
    | Panel Type | Width | Height |
    |------------|-------|--------|
    | stat       | 6     | 4      |
    | gauge      | 6     | 4      |
    | timeseries | 12    | 8      |
    | heatmap    | 12    | 8      |
    | histogram  | 12    | 8      |

    ### Row Layout Rules:
    1. Each row's panels MUST sum to exactly 24 width
    2. All panels in the same row MUST have the same height
    3. Do NOT mix stat (height=4) and timeseries (height=8) in the same row

    ### Valid Row Examples:
    - Overview row: 4 stat panels (6+6+6+6=24, all height=4)
    - Trends row: 2 timeseries panels (12+12=24, all height=8)
    
    For each panel:
    1. Identify the best visualization type (Timeseries for counters/rates, Stat for gauges/current values, Heatmap for histograms, Histogram when buckets should be rendered as bars).
    2. Write a clear Title and Description.
    3. List the specific metric names used.
    4. Provide a "promql_hint" (e.g. "rate(http_requests_total[5m]) by (method)") - NOT the full query yet, just the logic.

    ## CRITICAL - FORBIDDEN PATTERNS (will cause Grafana errors):
    - NEVER use {__name__=~"..."} regex matching! This causes "vector cannot contain metrics with the same labelset" error.
      WRONG: rate({__name__=~"etcd_network.*_total"}[5m])
      WRONG: {__name__=~"metric_a|metric_b"}
      CORRECT: Write each metric explicitly: rate(metric_a[5m]) + rate(metric_b[5m])
    - NEVER use "sum by (__name__)" - causes labelset errors.
    - Stat/Gauge panels MUST aggregate to a single series (sum()/avg()) and filter by target service.
    - Histogram buckets: use *_bucket with rate()/increase and sum by (le).
    - NEVER put multiple comma-separated queries in a single promql_hint.
    
    Do NOT generate the full JSON yet. We are in the planning phase.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze these metrics and propose a dashboard plan:\n\n${metrics}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dashboardTitle: { type: Type.STRING },
          dashboardDescription: { type: Type.STRING },
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                panels: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Unique ID (e.g., panel_1)" },
                      title: { type: Type.STRING },
                      type: { type: Type.STRING, enum: [PanelType.Timeseries, PanelType.Stat, PanelType.Gauge, PanelType.Heatmap, PanelType.Histogram] },
                      description: { type: Type.STRING },
                      metrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                      promql_hint: { type: Type.STRING }
                    },
                    required: ["id", "title", "type", "description", "metrics", "promql_hint"]
                  }
                }
              },
              required: ["name", "panels"]
            }
          }
        },
        required: ["dashboardTitle", "dashboardDescription", "categories"]
      }
    }
  });

  try {
    return JSON.parse(cleanResponse(response.text)) as DashboardPlan;
  } catch (e) {
    throw new Error("Failed to parse dashboard plan.");
  }
};

// Helper: Generate a single panel
const generateSinglePanel = async (
  ai: GoogleGenAI, 
  metrics: string, 
  panelPlan: any
): Promise<any> => {
  const systemInstruction = `
    You are a Senior Grafana Engineer. Generate ONE panel configuration.
    
    Rules:
    1. Use the "promql_hint" as basis. If complete, use directly; if hint, expand to valid PromQL.
    2. PromQL: rate()[5m] for counters, sum by() for aggregations.
    3. For Heatmap: sum by (le) (rate(*_bucket[5m])).
    4. For Histogram: sum by (le) (increase(*_bucket[1h])).
    5. Add appropriate units (bytes, seconds, percent, reqps).
    
    FORBIDDEN (causes errors):
    - NEVER use {__name__=~"..."} - use explicit metric names with + operator instead.
    - Stat/Gauge must aggregate to single series.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Metrics: ${metrics}\n\nGenerate this panel: ${JSON.stringify(panelPlan)}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: [PanelType.Timeseries, PanelType.Stat, PanelType.Gauge, PanelType.Heatmap, PanelType.Histogram] },
          description: { type: Type.STRING },
          promql: { type: Type.STRING },
          unit: { type: Type.STRING },
          min: { type: Type.NUMBER, nullable: true },
          max: { type: Type.NUMBER, nullable: true },
          metrics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "type", "promql", "unit", "description", "metrics"]
      }
    }
  });

  const panel = JSON.parse(cleanResponse(response.text));
  // Apply PromQL fix
  panel.promql = fixPromQL(panel.promql || '');
  return panel;
};

export const generateFinalDashboard = async (metrics: string, plan: DashboardPlan): Promise<AIResponse> => {
  const ai = getAIClient();
  
  // Flatten all panels with category info
  const panelTasks: { categoryName: string; panelPlan: any }[] = [];
  plan.categories.forEach(cat => {
    cat.panels.forEach(panel => {
      panelTasks.push({ categoryName: cat.name, panelPlan: panel });
    });
  });

  // Parallel generation: one request per panel
  const panelPromises = panelTasks.map(task => 
    generateSinglePanel(ai, metrics, task.panelPlan).then(panel => ({
      categoryName: task.categoryName,
      panel
    }))
  );

  const results = await Promise.all(panelPromises);

  // Rebuild category structure
  const categoryMap = new Map<string, any[]>();
  plan.categories.forEach(cat => categoryMap.set(cat.name, []));
  
  results.forEach(({ categoryName, panel }) => {
    categoryMap.get(categoryName)?.push(panel);
  });

  const categories = plan.categories.map(cat => ({
    name: cat.name,
    panels: categoryMap.get(cat.name) || []
  }));

  return {
    dashboardTitle: plan.dashboardTitle,
    dashboardDescription: plan.dashboardDescription,
    categories
  };
};