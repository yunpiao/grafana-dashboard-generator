/**
 * Express Server
 * Main entry point for the backend service
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMetrics, validateMetrics } from './metricsParser.js';
import { generateDashboard, validateDashboard, analyzeMetrics, generatePanelsFromPlans } from './dashboardGenerator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large metrics payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY
  });
});

// API endpoint: Analyze metrics and get panel plans (Stage 1)
app.post('/api/analyze-metrics', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { metricsText, openaiApiKey, apiBaseURL, modelName } = req.body;

    // Validate input
    if (!metricsText || typeof metricsText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'metricsText is required and must be a string'
      });
    }

    // Get API key (from request or environment)
    const apiKey = openaiApiKey || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required. Provide it in the request or set OPENAI_API_KEY/LLM_API_KEY environment variable.'
      });
    }
    
    // Get custom API base URL (support for MiniMax, etc.)
    const baseURL = apiBaseURL || process.env.LLM_API_BASE_URL || null;
    
    // Get model name
    const model = modelName || process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4-turbo-preview';

    // Step 1: Validate and parse metrics
    console.log('Step 1: Validating metrics...');
    const validation = validateMetrics(metricsText);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    console.log(`Metrics validated: ${validation.metricCount} metrics found`);

    // Step 2: Analyze metrics and get panel plans
    console.log('Step 2: Analyzing metrics...');
    const panelPlans = await analyzeMetrics(validation.summary, apiKey, model, baseURL);

    const duration = Date.now() - startTime;
    console.log(`Analysis completed in ${duration}ms`);

    // Return panel plans for user selection
    res.json({
      success: true,
      panelPlans: panelPlans,
      metricsSummary: validation.summary, // Will be needed for Stage 2
      metadata: {
        metricsCount: validation.metricCount,
        panelsPlanned: panelPlans.length,
        analysisTimeMs: duration,
        model: model
      }
    });

  } catch (error) {
    console.error('Error analyzing metrics:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during analysis'
    });
  }
});

// API endpoint: Generate panels from selected plans (Stage 2)
app.post('/api/generate-panels', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { selectedPlans, metricsSummary, openaiApiKey, apiBaseURL, modelName } = req.body;

    // Validate input
    if (!selectedPlans || !Array.isArray(selectedPlans) || selectedPlans.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'selectedPlans is required and must be a non-empty array'
      });
    }

    if (!metricsSummary || typeof metricsSummary !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'metricsSummary is required'
      });
    }

    // Get API key (from request or environment)
    const apiKey = openaiApiKey || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required. Provide it in the request or set OPENAI_API_KEY/LLM_API_KEY environment variable.'
      });
    }
    
    // Get custom API base URL (support for MiniMax, etc.)
    const baseURL = apiBaseURL || process.env.LLM_API_BASE_URL || null;
    
    // Get model name
    const model = modelName || process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4-turbo-preview';

    // Generate panels from selected plans
    console.log(`Generating panels for ${selectedPlans.length} selected plans...`);
    const result = await generatePanelsFromPlans(selectedPlans, metricsSummary, apiKey, model, baseURL);

    // Validate generated dashboard
    console.log('Validating generated dashboard...');
    const dashboardValidation = validateDashboard(result.dashboard);
    
    if (!dashboardValidation.valid) {
      return res.status(500).json({
        success: false,
        error: 'Generated dashboard is invalid',
        details: dashboardValidation.errors
      });
    }

    const duration = Date.now() - startTime;
    console.log(`Dashboard generated successfully in ${duration}ms`);

    // Return success response
    res.json({
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
    });

  } catch (error) {
    console.error('Error generating panels:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during panel generation'
    });
  }
});

// Main API endpoint: Generate dashboard (Full flow - kept for backward compatibility)
app.post('/api/generate-dashboard', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { metricsText, openaiApiKey, apiBaseURL, modelName } = req.body;

    // Validate input
    if (!metricsText || typeof metricsText !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'metricsText is required and must be a string'
      });
    }

    // Get API key (from request or environment)
    const apiKey = openaiApiKey || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required. Provide it in the request or set OPENAI_API_KEY/LLM_API_KEY environment variable.'
      });
    }
    
    // Get custom API base URL (support for MiniMax, etc.)
    const baseURL = apiBaseURL || process.env.LLM_API_BASE_URL || null;
    
    // Get model name
    const model = modelName || process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4-turbo-preview';

    // Step 1: Validate and parse metrics
    console.log('Step 1: Validating metrics...');
    const validation = validateMetrics(metricsText);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    console.log(`Metrics validated: ${validation.metricCount} metrics found`);

    // Step 2: Generate dashboard using LLM
    console.log('Step 2: Generating dashboard with AI...');
    const result = await generateDashboard(validation.summary, apiKey, model, baseURL);

    // Step 3: Validate generated dashboard
    console.log('Step 3: Validating generated dashboard...');
    const dashboardValidation = validateDashboard(result.dashboard);
    
    if (!dashboardValidation.valid) {
      return res.status(500).json({
        success: false,
        error: 'Generated dashboard is invalid',
        details: dashboardValidation.errors
      });
    }

    const duration = Date.now() - startTime;
    console.log(`Dashboard generated successfully in ${duration}ms`);

    // Return success response
    res.json({
      success: true,
      dashboard: result.dashboard,
      panelPlans: result.panelPlans,
      metadata: {
        metricsCount: validation.metricCount,
        panelsCount: dashboardValidation.panelCount,
        totalPanelsPlanned: result.metadata.totalPanelsPlanned,
        successfulPanels: result.metadata.successfulPanels,
        failedPanels: result.metadata.failedPanels,
        failedPanelsList: result.metadata.failedPanelsList,
        generationTimeMs: duration,
        model: model
      }
    });

  } catch (error) {
    console.error('Error generating dashboard:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  Metrics to Grafana Dashboard Generator                 ║
╚══════════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'}
API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No (required)'}

Ready to generate dashboards! 🚀
`);
});

