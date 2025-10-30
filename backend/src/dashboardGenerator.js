/**
 * Dashboard Generator
 * Orchestrates the two-stage LLM generation process
 */

import { callLLMForJSON } from './llmService.js';
import { getSystemMessage, getAnalysisPrompt, getPanelGenerationPrompt } from './prompts.js';

/**
 * Analyze metrics and generate panel plans (Stage 1 only)
 * @param {object} metricsSummary - Parsed metrics summary
 * @param {string} apiKey - API key or JWT token
 * @param {string} model - Model to use
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {Promise<Array>} Array of panel plans
 */
export async function analyzeMetrics(metricsSummary, apiKey, model = 'gpt-4-turbo-preview', baseURL = null) {
  console.log('Starting metrics analysis...');
  console.log(`Using model: ${model}`);
  if (baseURL) {
    console.log(`Using custom API endpoint: ${baseURL}`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Stage 1: Analyzing metrics and planning panels...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const analysisPrompt = getAnalysisPrompt(metricsSummary);
  
  // Call with retry logic (up to 3 attempts)
  const panelPlans = await callLLMForJSON(
    apiKey,
    getSystemMessage(),
    analysisPrompt,
    model,
    baseURL,
    3  // Max retries for analysis stage
  );

  if (!Array.isArray(panelPlans) || panelPlans.length === 0) {
    throw new Error('LLM did not return valid panel plans. Expected a JSON array of panel plans.');
  }

  console.log(`✅ Analysis complete: ${panelPlans.length} panels planned\n`);
  
  return panelPlans;
}

/**
 * Generate panels from selected plans and create dashboard (Stage 2)
 * @param {Array} selectedPlans - Array of selected panel plans
 * @param {object} metricsSummary - Parsed metrics summary (for context)
 * @param {string} apiKey - API key or JWT token
 * @param {string} model - Model to use
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {Promise<object>} Complete result with dashboard and metadata
 */
export async function generatePanelsFromPlans(selectedPlans, metricsSummary, apiKey, model = 'gpt-4-turbo-preview', baseURL = null) {
  console.log(`Starting panel generation for ${selectedPlans.length} selected panels...`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Stage 2: Generating individual panels...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const panels = [];
  const failedPanels = [];

  for (let i = 0; i < selectedPlans.length; i++) {
    const plan = selectedPlans[i];
    console.log(`\n[${i + 1}/${selectedPlans.length}] Generating: ${plan.panel_title}`);
    
    try {
      const generationPrompt = getPanelGenerationPrompt(plan, metricsSummary, i + 1);
      const panel = await callLLMForJSON(
        apiKey,
        getSystemMessage(),
        generationPrompt,
        model,
        baseURL,
        3  // Max retries for each panel
      );
      
      if (!panel.type || !panel.targets) {
        console.error(`  ❌ Invalid panel structure returned`);
        failedPanels.push({ title: plan.panel_title, error: 'Invalid panel structure' });
        continue;
      }
      
      panels.push(panel);
      console.log(`  ✅ Panel generated successfully`);
      
    } catch (error) {
      console.error(`  ❌ Failed to generate panel after retries: ${plan.panel_title}`);
      failedPanels.push({ title: plan.panel_title, error: error.message });
    }
  }

  if (panels.length === 0) {
    throw new Error('Failed to generate any panels. Please check the metrics and try again.');
  }

  console.log(`\n✅ Stage 2 complete: ${panels.length}/${selectedPlans.length} panels generated successfully`);
  if (failedPanels.length > 0) {
    console.log(`⚠️  ${failedPanels.length} panels failed and were skipped`);
  }

  // Create dashboard structure
  const metricNames = metricsSummary.metricNames || [];
  const dashboard = createDashboardStructure(panels, metricNames);

  console.log(`\n🎉 Dashboard generated successfully!`);
  console.log(`   - ${panels.length} panels created`);
  if (failedPanels.length > 0) {
    console.log(`   - ${failedPanels.length} panels failed (skipped)`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    dashboard,
    metadata: {
      totalPanelsPlanned: selectedPlans.length,
      successfulPanels: panels.length,
      failedPanels: failedPanels.length,
      failedPanelsList: failedPanels
    }
  };
}

/**
 * Generate a complete Grafana dashboard from metrics summary (Full flow)
 * @param {object} metricsSummary - Parsed metrics summary
 * @param {string} apiKey - API key or JWT token
 * @param {string} model - Model to use
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {Promise<object>} Complete Grafana dashboard JSON
 */
export async function generateDashboard(metricsSummary, apiKey, model = 'gpt-4-turbo-preview', baseURL = null) {
  console.log('Starting dashboard generation...');
  console.log(`Using model: ${model}`);
  if (baseURL) {
    console.log(`Using custom API endpoint: ${baseURL}`);
  }
  
  // Stage 1: Analysis - Plan which panels to create
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Stage 1: Analyzing metrics and planning panels...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const analysisPrompt = getAnalysisPrompt(metricsSummary);
  
  // Call with retry logic (up to 3 attempts)
  const panelPlans = await callLLMForJSON(
    apiKey,
    getSystemMessage(),
    analysisPrompt,
    model,
    baseURL,
    3  // Max retries for analysis stage
  );

  if (!Array.isArray(panelPlans) || panelPlans.length === 0) {
    throw new Error('LLM did not return valid panel plans. Expected a JSON array of panel plans.');
  }

  console.log(`✅ Stage 1 complete: ${panelPlans.length} panels planned\n`);

  // Stage 2: Generation - Create each panel
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Stage 2: Generating individual panels...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const panels = [];
  const failedPanels = [];
  
  for (let i = 0; i < panelPlans.length; i++) {
    const plan = panelPlans[i];
    console.log(`  📊 Generating panel ${i + 1}/${panelPlans.length}: ${plan.panel_title}`);
    
    try {
      const generationPrompt = getPanelGenerationPrompt(plan, metricsSummary, i + 1);
      
      // callLLMForJSON already has retry logic (default 3 attempts)
      const panel = await callLLMForJSON(
        apiKey,
        getSystemMessage(),
        generationPrompt,
        model,
        baseURL,
        3  // Max retries for each panel
      );
      
      // Set grid position for automatic layout
      panel.gridPos = calculateGridPosition(i, panelPlans.length);
      panel.id = i + 1;
      
      panels.push(panel);
      console.log(`  ✅ Panel generated successfully`);
      
    } catch (error) {
      console.error(`  ❌ Failed to generate panel after retries: ${plan.panel_title}`);
      console.error(`     Error: ${error.message}`);
      failedPanels.push({
        title: plan.panel_title,
        error: error.message
      });
      // Continue with other panels instead of failing completely
    }
  }
  
  if (failedPanels.length > 0) {
    console.warn(`\n⚠️  Warning: ${failedPanels.length} panel(s) failed to generate:`);
    failedPanels.forEach(fp => console.warn(`   - ${fp.title}: ${fp.error}`));
  }

  console.log(`\n✅ Stage 2 complete: ${panels.length}/${panelPlans.length} panels generated successfully`);

  // Check if we have at least some panels
  if (panels.length === 0) {
    throw new Error('Failed to generate any panels. All panel generation attempts failed. Please check your metrics and try again.');
  }

  // Assemble final dashboard
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Assembling final dashboard...');
  const dashboard = createDashboardStructure(panels, metricsSummary);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n🎉 Dashboard generated successfully!`);
  console.log(`   - ${panels.length} panels created`);
  if (failedPanels.length > 0) {
    console.log(`   - ${failedPanels.length} panels failed (skipped)`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    dashboard,
    panelPlans,
    metadata: {
      totalPanelsPlanned: panelPlans.length,
      successfulPanels: panels.length,
      failedPanels: failedPanels.length,
      failedPanelsList: failedPanels
    }
  };
}

/**
 * Calculate grid position for a panel
 * @param {number} index - Panel index
 * @param {number} total - Total number of panels
 * @returns {object} Grid position {x, y, w, h}
 */
function calculateGridPosition(index, total) {
  // Grafana grid is 24 units wide
  // Use 2 columns layout for most panels
  const panelsPerRow = 2;
  const panelWidth = 12; // 24 / 2
  const panelHeight = 8;
  
  const row = Math.floor(index / panelsPerRow);
  const col = index % panelsPerRow;
  
  return {
    x: col * panelWidth,
    y: row * panelHeight,
    w: panelWidth,
    h: panelHeight
  };
}

/**
 * Create the complete dashboard structure
 * @param {array} panels - Array of panel objects
 * @param {object} metricsSummary - Metrics summary for metadata
 * @returns {object} Complete Grafana dashboard JSON
 */
function createDashboardStructure(panels, metricsSummary) {
  const metricNames = Object.keys(metricsSummary);
  
  return {
    title: 'Auto-Generated Metrics Dashboard',
    tags: ['auto-generated', 'prometheus'],
    timezone: 'browser',
    schemaVersion: 41,
    version: 1,
    refresh: '30s',
    time: {
      from: 'now-1h',
      to: 'now'
    },
    timepicker: {
      refresh_intervals: ['5s', '10s', '30s', '1m', '5m', '15m', '30m', '1h']
    },
    panels: panels,
    templating: {
      list: [{
        current: {
          selected: false,
          text: 'default',
          value: 'default'
        },
        hide: 0,
        includeAll: false,
        label: 'Data Source',
        multi: false,
        name: 'datasource',
        options: [],
        query: 'prometheus',
        refresh: 1,
        regex: '',
        skipUrlSync: false,
        type: 'datasource'
      }]
    },
    annotations: {
      list: [{
        builtIn: 1,
        datasource: {
          type: 'datasource',
          uid: 'grafana'
        },
        enable: true,
        hide: true,
        iconColor: 'rgba(0, 211, 255, 1)',
        name: 'Annotations & Alerts',
        type: 'dashboard'
      }]
    },
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 0,
    links: [],
    liveNow: false,
    preload: false,
    description: `Auto-generated dashboard from ${metricNames.length} metrics. After import, please select your Prometheus data source from the dropdown at the top.`
  };
}

/**
 * Validate generated dashboard
 * @param {object} dashboard - Dashboard object
 * @returns {object} Validation result
 */
export function validateDashboard(dashboard) {
  const errors = [];
  
  if (!dashboard || typeof dashboard !== 'object') {
    errors.push('Dashboard is not a valid object');
    return { valid: false, errors };
  }

  if (!dashboard.title) {
    errors.push('Missing dashboard title');
  }

  if (!dashboard.panels || !Array.isArray(dashboard.panels)) {
    errors.push('Missing or invalid panels array');
  } else if (dashboard.panels.length === 0) {
    errors.push('No panels generated');
  }

  // Validate each panel has required fields
  if (dashboard.panels) {
    dashboard.panels.forEach((panel, index) => {
      if (!panel.datasource) {
        errors.push(`Panel ${index + 1} missing datasource configuration`);
      }
      if (!panel.targets || panel.targets.length === 0) {
        errors.push(`Panel ${index + 1} has no targets`);
      }
      if (panel.targets) {
        panel.targets.forEach((target, targetIndex) => {
          if (!target.datasource) {
            errors.push(`Panel ${index + 1}, target ${targetIndex + 1} missing datasource`);
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    panelCount: dashboard.panels?.length || 0
  };
}

