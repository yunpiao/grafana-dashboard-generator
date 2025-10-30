/**
 * Cloudflare Pages Function: Analyze Metrics
 * POST /api/analyze-metrics
 */

import { validateMetrics } from '../../_functions-lib/metricsParser.js';
import { analyzeMetrics } from '../../_functions-lib/dashboardGenerator.js';

export async function onRequestPost(context) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await context.request.json();
    const { metricsText, openaiApiKey, apiBaseURL, modelName } = body;

    // Validate input
    if (!metricsText || typeof metricsText !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: 'metricsText is required and must be a string'
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
        error: 'API key is required. Provide it in the request or set OPENAI_API_KEY environment variable in Cloudflare Pages settings.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get custom API base URL
    const baseURL = apiBaseURL || context.env.LLM_API_BASE_URL || null;

    // Get model name
    const model = modelName || context.env.OPENAI_MODEL || context.env.LLM_MODEL || 'gpt-4-turbo-preview';

    // Validate and parse metrics
    console.log('Validating metrics...');
    const validation = validateMetrics(metricsText);

    if (!validation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: validation.error
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Metrics validated: ${validation.metricCount} metrics found`);

    // Analyze metrics and get panel plans
    console.log('Analyzing metrics...');
    const panelPlans = await analyzeMetrics(validation.summary, apiKey, model, baseURL);

    const duration = Date.now() - startTime;
    console.log(`Analysis completed in ${duration}ms`);

    // Return response
    return new Response(JSON.stringify({
      success: true,
      panelPlans: panelPlans,
      metricsSummary: validation.summary,
      metadata: {
        metricsCount: validation.metricCount,
        panelsPlanned: panelPlans.length,
        analysisTimeMs: duration,
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
    console.error('Error analyzing metrics:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'An unexpected error occurred during analysis'
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

