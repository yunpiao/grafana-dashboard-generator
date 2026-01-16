import { AIResponse, DashboardPlan } from "../types";

// API configuration from localStorage
// Note: localStorage is used for convenience in this demo app.
// For production, consider server-side API key management.
interface ApiConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

const getApiConfig = (): ApiConfig => {
  return {
    apiKey: localStorage.getItem('openai_api_key') || '',
    baseURL: localStorage.getItem('api_base_url') || '',
    model: localStorage.getItem('model_name') || 'gpt-4-turbo-preview'
  };
};

// Build request headers with API key in Authorization header
const buildHeaders = (config: ApiConfig): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }
  return headers;
};

// Convert backend response to frontend DashboardPlan format
const convertToDashboardPlan = (backendResponse: any): DashboardPlan => {
  const rows = backendResponse.panelPlans?.rows || [];

  return {
    dashboardTitle: backendResponse.panelPlans?.dashboardTitle || 'Generated Dashboard',
    dashboardDescription: backendResponse.panelPlans?.dashboardDescription || '',
    categories: rows.map((row: any) => ({
      name: row.name || row.rowTitle || 'Untitled Row',
      panels: (row.panels || []).map((panel: any, idx: number) => ({
        id: panel.id || `panel_${idx}`,
        title: panel.title || '',
        type: panel.type || 'timeseries',
        description: panel.description || '',
        metrics: panel.metrics || [],
        promql_hint: panel.promql_hint || panel.promqlHint || ''
      }))
    }))
  };
};

// Stage 1: Analyze metrics and get panel plans
export const generateDashboardPlan = async (metrics: string): Promise<DashboardPlan> => {
  const config = getApiConfig();

  const response = await fetch('/api/analyze-metrics', {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify({
      metricsText: metrics,
      apiBaseURL: config.baseURL || undefined,
      modelName: config.model
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze metrics');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Analysis failed');
  }

  // Store metricsSummary for Stage 2
  sessionStorage.setItem('metricsSummary', JSON.stringify(data.metricsSummary));

  return convertToDashboardPlan(data);
};

// Stage 2: Generate final dashboard from plan
export const generateFinalDashboard = async (
  metrics: string,
  plan: DashboardPlan
): Promise<AIResponse> => {
  const config = getApiConfig();

  // Get metricsSummary from Stage 1 with error handling
  let metricsSummary: Record<string, unknown> = {};
  try {
    metricsSummary = JSON.parse(sessionStorage.getItem('metricsSummary') || '{}');
  } catch {
    metricsSummary = {};
  }

  // Convert plan to backend format
  const selectedPlans = {
    dashboardTitle: plan.dashboardTitle,
    dashboardDescription: plan.dashboardDescription,
    rows: plan.categories.map(cat => ({
      name: cat.name,
      panels: cat.panels.map(p => ({
        id: p.id,
        title: p.title,
        type: p.type,
        description: p.description,
        metrics: p.metrics,
        promql_hint: p.promql_hint
      }))
    }))
  };

  const response = await fetch('/api/generate-panels', {
    method: 'POST',
    headers: buildHeaders(config),
    body: JSON.stringify({
      selectedPlans,
      metricsSummary,
      apiBaseURL: config.baseURL || undefined,
      modelName: config.model
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate dashboard');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Generation failed');
  }

  // Convert backend dashboard to AIResponse format
  return convertToAIResponse(data.dashboard, plan);
};

// Convert Grafana dashboard JSON to AIResponse
const convertToAIResponse = (dashboard: any, plan: DashboardPlan): AIResponse => {
  const panels = dashboard.panels || [];

  // Group panels by row
  const categories = plan.categories.map(cat => ({
    name: cat.name,
    panels: cat.panels.map(planPanel => {
      const generated = panels.find((p: any) =>
        p.title === planPanel.title || p.id === planPanel.id
      );

      return {
        title: generated?.title || planPanel.title,
        type: generated?.type || planPanel.type,
        description: generated?.description || planPanel.description,
        promql: generated?.targets?.[0]?.expr || '',
        unit: generated?.fieldConfig?.defaults?.unit || 'short',
        metrics: planPanel.metrics
      };
    })
  }));

  return {
    dashboardTitle: dashboard.title || plan.dashboardTitle,
    dashboardDescription: dashboard.description || plan.dashboardDescription,
    categories
  };
};
