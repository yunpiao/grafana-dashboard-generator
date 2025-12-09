/**
 * Dashboard Generator
 * Orchestrates the two-stage LLM generation process
 */

import { callLLMForJSON } from './llmService.js';
import { getSystemMessage, getAnalysisPrompt, getPanelGenerationPrompt } from './prompts.js';

/**
 * Auto-group flat panel array into logical rows by visualization type
 * @param {Array} panels - Flat array of panel plans
 * @returns {Array} Array of row objects with grouped panels
 */
function autoGroupPanelsToRows(panels) {
  // Define row categories and their panel types
  const rowConfig = {
    'Overview': {
      types: ['stat', 'gauge'],
      defaultWidth: 6,
      defaultHeight: 4
    },
    'Trends': {
      types: ['timeseries', 'graph'],
      defaultWidth: 12,
      defaultHeight: 8
    },
    'Details': {
      types: ['table', 'heatmap', 'bar'],
      defaultWidth: 24,
      defaultHeight: 10
    }
  };

  // Group panels by category
  const grouped = {
    'Overview': [],
    'Trends': [],
    'Details': []
  };

  panels.forEach(panel => {
    const vizType = panel.suggested_visualization || 'timeseries';
    let assigned = false;
    
    for (const [rowName, config] of Object.entries(rowConfig)) {
      if (config.types.includes(vizType)) {
        // Apply default dimensions if not set
        grouped[rowName].push({
          ...panel,
          width: panel.width || config.defaultWidth,
          height: panel.height || config.defaultHeight
        });
        assigned = true;
        break;
      }
    }
    
    // Fallback to Trends if no match
    if (!assigned) {
      grouped['Trends'].push({
        ...panel,
        width: panel.width || 12,
        height: panel.height || 8
      });
    }
  });

  // Build rows array, only include non-empty rows
  const rows = [];
  
  if (grouped['Overview'].length > 0) {
    rows.push({
      row_title: 'Overview',
      collapsed: false,
      panels: grouped['Overview']
    });
  }
  
  if (grouped['Trends'].length > 0) {
    rows.push({
      row_title: 'Trends',
      collapsed: false,
      panels: grouped['Trends']
    });
  }
  
  if (grouped['Details'].length > 0) {
    rows.push({
      row_title: 'Details',
      collapsed: false,
      panels: grouped['Details']
    });
  }

  // If no panels were grouped, return single row
  if (rows.length === 0) {
    return [{
      row_title: 'Dashboard',
      collapsed: false,
      panels: panels
    }];
  }

  return rows;
}

/**
 * Analyze metrics and generate panel plans with row structure (Stage 1 only)
 * @param {object} metricsSummary - Parsed metrics summary
 * @param {string} apiKey - API key or JWT token
 * @param {string} model - Model to use
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {Promise<object>} Object with rows array containing panel plans
 */
export async function analyzeMetrics(metricsSummary, apiKey, model = 'gpt-4-turbo-preview', baseURL = null) {
  console.log('Starting metrics analysis...');
  console.log(`Using model: ${model}`);
  if (baseURL) {
    console.log(`Using custom API endpoint: ${baseURL}`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Stage 1: Analyzing metrics and planning dashboard layout...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const analysisPrompt = getAnalysisPrompt(metricsSummary);
  
  // Call with retry logic (up to 3 attempts)
  const layoutPlan = await callLLMForJSON(
    apiKey,
    getSystemMessage(),
    analysisPrompt,
    model,
    baseURL,
    3  // Max retries for analysis stage
  );

  // Handle both new format { rows: [...] } and legacy format [...]
  let rows;
  if (layoutPlan.rows && Array.isArray(layoutPlan.rows)) {
    rows = layoutPlan.rows;
  } else if (Array.isArray(layoutPlan)) {
    // Legacy format: auto-group panels by visualization type
    console.log('⚠️  LLM returned flat array, applying smart grouping...');
    rows = autoGroupPanelsToRows(layoutPlan);
  } else {
    throw new Error('LLM did not return valid layout. Expected { rows: [...] } or panel array.');
  }

  const totalPanels = rows.reduce((sum, row) => sum + (row.panels?.length || 0), 0);
  console.log(`✅ Analysis complete: ${rows.length} rows, ${totalPanels} panels planned\n`);
  
  return { rows };
}

/**
 * Generate panels from selected plans and create dashboard (Stage 2)
 * Supports both new Row-based format and legacy flat array format
 * @param {Array|object} selectedPlans - Array of panel plans OR { rows: [...] } object
 * @param {object} metricsSummary - Parsed metrics summary (for context)
 * @param {string} apiKey - API key or JWT token
 * @param {string} model - Model to use
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {Promise<object>} Complete result with dashboard and metadata
 */
export async function generatePanelsFromPlans(selectedPlans, metricsSummary, apiKey, model = 'gpt-4-turbo-preview', baseURL = null) {
  // Normalize input: convert to rows format if needed
  let rows;
  if (selectedPlans.rows && Array.isArray(selectedPlans.rows)) {
    rows = selectedPlans.rows;
  } else if (Array.isArray(selectedPlans)) {
    // Legacy flat array format
    rows = [{
      row_title: null, // No row header for legacy format
      collapsed: false,
      panels: selectedPlans
    }];
  } else {
    throw new Error('Invalid selectedPlans format. Expected array or { rows: [...] }');
  }

  const totalPlannedPanels = rows.reduce((sum, row) => sum + (row.panels?.length || 0), 0);
  console.log(`Starting panel generation for ${rows.length} rows, ${totalPlannedPanels} panels...`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Stage 2: Generating panels with row layout...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const allPanels = [];
  const failedPanels = [];
  let currentY = 0;
  let panelId = 1;
  let panelIndex = 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowPanels = row.panels || [];
    
    // Create row panel (collapsible header) if row has a title
    if (row.row_title) {
      console.log(`\n📁 Row ${rowIndex + 1}: ${row.row_title}`);
      const rowPanel = createRowPanel(panelId++, row.row_title, currentY, row.collapsed || false);
      allPanels.push(rowPanel);
      currentY += 1; // Row header takes 1 unit height
    }

    // Track x position for panels in this row
    let currentX = 0;
    let maxHeightInCurrentLine = 0;

    for (let i = 0; i < rowPanels.length; i++) {
      const plan = rowPanels[i];
      panelIndex++;
      console.log(`  [${panelIndex}/${totalPlannedPanels}] Generating: ${plan.panel_title}`);
      
      // Validate and clamp panel dimensions
      const panelWidth = Math.min(24, Math.max(1, plan.width || 12));
      const panelHeight = Math.min(20, Math.max(2, plan.height || 8));

      // Check if panel fits in current line, otherwise wrap
      if (currentX + panelWidth > 24) {
        currentY += maxHeightInCurrentLine;
        currentX = 0;
        maxHeightInCurrentLine = 0;
      }

      const gridPos = {
        x: currentX,
        y: currentY,
        w: panelWidth,
        h: panelHeight
      };

      try {
        const generationPrompt = getPanelGenerationPrompt(plan, metricsSummary, panelId, gridPos);
        const panel = await callLLMForJSON(
          apiKey,
          getSystemMessage(),
          generationPrompt,
          model,
          baseURL,
          3  // Max retries for each panel
        );
        
        if (!panel.type || !panel.targets) {
          console.error(`    ❌ Invalid panel structure returned`);
          failedPanels.push({ title: plan.panel_title, error: 'Invalid panel structure' });
          continue;
        }
        
        // Ensure correct gridPos and id
        panel.gridPos = gridPos;
        panel.id = panelId++;
        
        allPanels.push(panel);
        console.log(`    ✅ Panel generated (${panelWidth}x${panelHeight} at ${currentX},${currentY})`);
        
        // Update position tracking
        currentX += panelWidth;
        maxHeightInCurrentLine = Math.max(maxHeightInCurrentLine, panelHeight);
        
      } catch (error) {
        console.error(`    ❌ Failed to generate panel: ${plan.panel_title}`);
        failedPanels.push({ title: plan.panel_title, error: error.message });
      }
    }

    // Move to next row section
    currentY += maxHeightInCurrentLine;
  }

  if (allPanels.length === 0) {
    throw new Error('Failed to generate any panels. Please check the metrics and try again.');
  }

  const successfulPanels = allPanels.filter(p => p.type !== 'row').length;
  console.log(`\n✅ Stage 2 complete: ${successfulPanels}/${totalPlannedPanels} panels generated successfully`);
  if (failedPanels.length > 0) {
    console.log(`⚠️  ${failedPanels.length} panels failed and were skipped`);
  }

  // Create dashboard structure
  const dashboard = createDashboardStructure(allPanels, metricsSummary);

  console.log(`\n🎉 Dashboard generated successfully!`);
  console.log(`   - ${rows.length} rows`);
  console.log(`   - ${successfulPanels} panels created`);
  if (failedPanels.length > 0) {
    console.log(`   - ${failedPanels.length} panels failed (skipped)`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return {
    dashboard,
    metadata: {
      totalPanelsPlanned: totalPlannedPanels,
      successfulPanels: successfulPanels,
      failedPanels: failedPanels.length,
      failedPanelsList: failedPanels,
      rowCount: rows.length
    }
  };
}

/**
 * Create a Grafana row panel (collapsible section header)
 * @param {number} id - Panel ID
 * @param {string} title - Row title
 * @param {number} y - Y position
 * @param {boolean} collapsed - Whether row is collapsed by default
 * @returns {object} Row panel object
 */
function createRowPanel(id, title, y, collapsed = false) {
  return {
    id: id,
    type: 'row',
    title: title,
    collapsed: collapsed,
    gridPos: {
      x: 0,
      y: y,
      w: 24,
      h: 1
    },
    panels: [] // Panels inside will follow in the array
  };
}

/**
 * Generate a complete Grafana dashboard from metrics summary (Full flow)
 * Now uses Row-based layout with AI-determined panel sizes
 * @param {object} metricsSummary - Parsed metrics summary
 * @param {string} apiKey - API key or JWT token
 * @param {string} model - Model to use
 * @param {string} baseURL - Custom API base URL (optional)
 * @returns {Promise<object>} Complete Grafana dashboard JSON
 */
export async function generateDashboard(metricsSummary, apiKey, model = 'gpt-4-turbo-preview', baseURL = null) {
  // Stage 1: Analyze and get layout plan
  const layoutPlan = await analyzeMetrics(metricsSummary, apiKey, model, baseURL);
  
  // Stage 2: Generate panels from layout plan
  const result = await generatePanelsFromPlans(layoutPlan, metricsSummary, apiKey, model, baseURL);
  
  return {
    dashboard: result.dashboard,
    panelPlans: layoutPlan,
    metadata: result.metadata
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

