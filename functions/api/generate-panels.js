/**
 * Cloudflare Pages Function: Generate Panels
 * POST /api/generate-panels
 */

import { generatePanelsFromPlans, validateDashboard } from '../lib/dashboardGenerator.js';

export async function onRequestPost(context) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await context.request.json();
    const { selectedPlans, metricsSummary, openaiApiKey, apiBaseURL, modelName } = body;

    // Validate input
    if (!selectedPlans || !Array.isArray(selectedPlans) || selectedPlans.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'selectedPlans is required and must be a non-empty array'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!metricsSummary || typeof metricsSummary !== 'object') {
      return new Response(JSON.stringify({
        success: false,
        error: 'metricsSummary is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get API key (from request or environment)
    const apiKey = openaiApiKey || context.env.OPENAI_API_KEY || context.env.LLM_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'API key is required. Provide it in the request or set OPENAI_API_KEY environment variable.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get custom API base URL
    const baseURL = apiBaseURL || context.env.LLM_API_BASE_URL || null;

    // Get model name
    const model = modelName || context.env.OPENAI_MODEL || context.env.LLM_MODEL || 'gpt-4-turbo-preview';

    // Generate panels from selected plans
    console.log(`Generating panels for ${selectedPlans.length} selected plans...`);
    const result = await generatePanelsFromPlans(selectedPlans, metricsSummary, apiKey, model, baseURL);

    // Validate generated dashboard
    console.log('Validating generated dashboard...');
    const dashboardValidation = validateDashboard(result.dashboard);

    if (!dashboardValidation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Generated dashboard is invalid',
        details: dashboardValidation.errors
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const duration = Date.now() - startTime;
    console.log(`Dashboard generated successfully in ${duration}ms`);

    // Return response
    return new Response(JSON.stringify({
      success: true,
      dashboard: result.dashboard,
      metadata: {
        totalPanelsPlanned: result.metadata.totalPanelsPlanned,
        successfulPanels: result.metadata.successfulPanels,
        failedPanels: result.metadata.failedPanels,
        failedPanelsList: result.metadata.failedPanelsList,
        panelsCount: dashboardValidation.panelCount,
        generationTimeMs: duration,
        model: model
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error generating panels:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred during panel generation'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

