// Import i18n
import { initI18n, setLanguage, t, applyTranslations, getCurrentLanguage } from './i18n/i18n.js';

// Application state
let generatedDashboard = null;
let currentPanelPlans = [];
let currentMetricsSummary = null;
let currentApiConfig = null; // Store API config for Stage 2
let parsedMetricsInfo = null; // Store parsed metrics for preview
let apiConfigs = []; // Store all saved API configurations
let currentConfigIndex = -1; // Currently selected config index
let currentStep = 1; // Current workflow step (1-5)

// Configuration Management
const CONFIG_STORAGE_KEY = 'grafana_dashboard_api_configs';
const LANDING_PAGE_DISMISSED_KEY = 'grafana_dashboard_landing_dismissed';

// Load configurations from localStorage
function loadConfigs() {
    try {
        const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (stored) {
            apiConfigs = JSON.parse(stored);
            // Filter out empty configs (legacy cleanup)
            let needsSave = false;
            apiConfigs = apiConfigs.filter(config => {
                const isEmpty = !config.apiKey && !config.apiBaseURL && !config.modelName;
                if (isEmpty) {
                    needsSave = true;
                    return false;
                }
                // Remove isDefault field (legacy cleanup)
                if (config.hasOwnProperty('isDefault')) {
                    delete config.isDefault;
                    needsSave = true;
                }
                return true;
            });
            // Save if we cleaned up anything
            if (needsSave) {
                saveConfigs();
            }
        } else {
            // No stored configs - start with empty array
            apiConfigs = [];
        }
    } catch (error) {
        console.error('Failed to load configs:', error);
        apiConfigs = [];
    }
}

// Save configurations to localStorage
function saveConfigs() {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(apiConfigs));
    } catch (error) {
        console.error('Failed to save configs:', error);
    }
}

// Generate unique config ID
function generateConfigId() {
    return 'config_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Add new configuration
function addConfig(name, apiKey, apiBaseURL, modelName) {
    const newConfig = {
        id: generateConfigId(),
        name: name || 'New Configuration',
        apiKey: apiKey || '',
        apiBaseURL: apiBaseURL || '',
        modelName: modelName || '',
        createdAt: new Date().toISOString()
    };
    apiConfigs.push(newConfig);
    saveConfigs();
    return newConfig;
}

// Update configuration
function updateConfig(id, updates) {
    const index = apiConfigs.findIndex(c => c.id === id);
    if (index !== -1) {
        apiConfigs[index] = { ...apiConfigs[index], ...updates };
        saveConfigs();
        return true;
    }
    return false;
}

// Delete configuration
function deleteConfig(id) {
    const index = apiConfigs.findIndex(c => c.id === id);
    if (index !== -1) {
        apiConfigs.splice(index, 1);
        saveConfigs();
        return true;
    }
    return false;
}

// Get configuration by ID
function getConfigById(id) {
    return apiConfigs.find(c => c.id === id);
}

// Apply configuration to input fields
function applyConfig(config) {
    if (config) {
        apiKeyInput.value = config.apiKey || '';
        apiBaseURLInput.value = config.apiBaseURL || '';
        modelNameInput.value = config.modelName || '';
        currentConfigIndex = apiConfigs.findIndex(c => c.id === config.id);
    }
}

// DOM elements
const metricsInput = document.getElementById('metricsInput');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiBaseURLInput = document.getElementById('apiBaseURLInput');
const modelNameInput = document.getElementById('modelNameInput');
const generateBtn = document.getElementById('generateBtn');
const progressSection = document.getElementById('progressSection');
const panelPlansSection = document.getElementById('panelPlansSection');
const panelPlansList = document.getElementById('panelPlansList');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const metricsStats = document.getElementById('metricsStats');
const metricsCount = document.getElementById('metricsCount');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const viewBtn = document.getElementById('viewBtn');
const retryBtn = document.getElementById('retryBtn');
const jsonPreview = document.getElementById('jsonPreview');
const jsonContent = document.getElementById('jsonContent');
const progressTitle = document.getElementById('progressTitle');
const progressMessage = document.getElementById('progressMessage');
const terminalLogs = document.getElementById('terminalLogs');
const errorMessage = document.getElementById('errorMessage');
const panelsPlanned = document.getElementById('panelsPlanned');
const panelsCreated = document.getElementById('panelsCreated');
const generationTime = document.getElementById('generationTime');
const modelUsed = document.getElementById('modelUsed');
const selectAllBtn = document.getElementById('selectAllBtn');
const deselectAllBtn = document.getElementById('deselectAllBtn');
const generateSelectedBtn = document.getElementById('generateSelectedBtn');
const cancelGenerationBtn = document.getElementById('cancelGenerationBtn');
const selectionCount = document.getElementById('selectionCount');
const totalPlansCount = document.getElementById('totalPlansCount');
const metricsInfoSection = document.getElementById('metricsInfoSection');
const totalMetricsCount = document.getElementById('totalMetricsCount');
const uniqueLabelsCount = document.getElementById('uniqueLabelsCount');
const metricTypesCount = document.getElementById('metricTypesCount');
const metricsListContainer = document.getElementById('metricsListContainer');
const labelsListContainer = document.getElementById('labelsListContainer');
const typesListContainer = document.getElementById('typesListContainer');
const proceedToAnalysisBtn = document.getElementById('proceedToAnalysisBtn');
const backToEditBtn = document.getElementById('backToEditBtn');
const configSelector = document.getElementById('configSelector');
const manageConfigsBtn = document.getElementById('manageConfigsBtn');
const saveCurrentConfigBtn = document.getElementById('saveCurrentConfigBtn');
const configModal = document.getElementById('configModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const configList = document.getElementById('configList');
const addNewConfigBtn = document.getElementById('addNewConfigBtn');
const editConfigModal = document.getElementById('editConfigModal');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const editConfigTitle = document.getElementById('editConfigTitle');
const editConfigName = document.getElementById('editConfigName');
const editConfigApiKey = document.getElementById('editConfigApiKey');
const editConfigApiBaseURL = document.getElementById('editConfigApiBaseURL');
const editConfigModelName = document.getElementById('editConfigModelName');
const saveEditConfigBtn = document.getElementById('saveEditConfigBtn');
const cancelEditConfigBtn = document.getElementById('cancelEditConfigBtn');
const languageSelector = document.getElementById('languageSelector');
const landingPage = document.getElementById('landingPage');
const mainApp = document.getElementById('mainApp');
const heroTryNowBtn = document.getElementById('heroTryNowBtn');
const ctaTryNowBtn = document.getElementById('ctaTryNowBtn');

let editingConfigId = null; // Track which config is being edited

// Step Indicator Management
function updateStepIndicator(step) {
    currentStep = step;
    const activeLine = document.getElementById('stepActiveLine');
    const stepDots = document.querySelectorAll('.step-dot');

    // Calculate active line width: step 1=0%, step 2=25%, step 3=50%, step 4=75%, step 5=100%
    const lineWidths = { 1: 0, 2: 25, 3: 50, 4: 75, 5: 100 };
    const lineWidth = lineWidths[step] || 0;

    if (activeLine) {
        activeLine.style.width = `${lineWidth}%`;
    }

    // Update step dots appearance
    stepDots.forEach(dot => {
        const dotStep = parseInt(dot.dataset.step);
        const circle = dot.querySelector('div');
        const label = dot.querySelector('span');

        if (dotStep < step) {
            // Completed steps
            circle.className = 'w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-md transition-all duration-300';
            label.className = 'text-xs mt-1.5 text-slate-600 font-medium whitespace-nowrap';
        } else if (dotStep === step) {
            // Current step
            circle.className = 'w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold shadow-md ring-4 ring-blue-200 transition-all duration-300';
            label.className = 'text-xs mt-1.5 text-blue-600 font-semibold whitespace-nowrap';
        } else {
            // Future steps
            circle.className = 'w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-sm font-semibold transition-all duration-300';
            label.className = 'text-xs mt-1.5 text-slate-400 font-medium whitespace-nowrap';
        }
    });
}

// Event listeners
metricsInput.addEventListener('input', handleMetricsInput);
generateBtn.addEventListener('click', handleGenerate);
downloadBtn.addEventListener('click', handleDownload);
copyBtn.addEventListener('click', handleCopy);
viewBtn.addEventListener('click', toggleJsonView);
retryBtn.addEventListener('click', handleRetry);
selectAllBtn.addEventListener('click', selectAll);
deselectAllBtn.addEventListener('click', deselectAll);
generateSelectedBtn.addEventListener('click', handleGenerateSelected);
cancelGenerationBtn.addEventListener('click', handleCancelGeneration);
proceedToAnalysisBtn.addEventListener('click', handleProceedToAnalysis);
backToEditBtn.addEventListener('click', handleBackToEdit);
configSelector.addEventListener('change', handleConfigSelect);
manageConfigsBtn.addEventListener('click', openConfigModal);
saveCurrentConfigBtn.addEventListener('click', handleSaveCurrentConfig);
closeModalBtn.addEventListener('click', closeConfigModal);
addNewConfigBtn.addEventListener('click', openAddConfigModal);
closeEditModalBtn.addEventListener('click', closeEditConfigModal);
saveEditConfigBtn.addEventListener('click', handleSaveEditConfig);
cancelEditConfigBtn.addEventListener('click', closeEditConfigModal);
languageSelector.addEventListener('change', handleLanguageChange);
heroTryNowBtn.addEventListener('click', handleTryNow);
ctaTryNowBtn.addEventListener('click', handleTryNow);

// Landing Page Functions
function handleTryNow() {
    // Hide landing page, show main app
    landingPage.style.display = 'none';
    mainApp.style.display = 'block';

    // Save preference to localStorage
    localStorage.setItem(LANDING_PAGE_DISMISSED_KEY, 'true');

    // Re-initialize Lucide icons for main app
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

function checkLandingPagePreference() {
    const dismissed = localStorage.getItem(LANDING_PAGE_DISMISSED_KEY);

    if (dismissed === 'true') {
        // User has already seen landing page, go directly to app
        landingPage.style.display = 'none';
        mainApp.style.display = 'block';
    } else {
        // Show landing page
        landingPage.style.display = 'block';
        mainApp.style.display = 'none';
    }
}

// Handle metrics input
function handleMetricsInput() {
    const text = metricsInput.value.trim();
    
    if (text) {
        // Simple metric counting (count lines that look like metrics)
        const metricLines = text.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('#') && trimmed.includes(' ');
        });
        
        if (metricLines.length > 0) {
            metricsCount.textContent = metricLines.length;
            metricsStats.style.display = 'block';
        } else {
            metricsStats.style.display = 'none';
        }
    } else {
        metricsStats.style.display = 'none';
    }
}

// Parse and extract metrics information (labels, tags, help)
function parseMetricsInfo(metricsText) {
    const lines = metricsText.split('\n');
    const metricsMap = new Map();
    let currentMetricName = null;
    let currentHelp = null;
    let currentType = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) continue;
        
        // Parse HELP
        if (trimmed.startsWith('# HELP ')) {
            const match = trimmed.match(/^# HELP\s+(\S+)\s+(.+)$/);
            if (match) {
                currentMetricName = match[1];
                currentHelp = match[2];
            }
            continue;
        }
        
        // Parse TYPE
        if (trimmed.startsWith('# TYPE ')) {
            const match = trimmed.match(/^# TYPE\s+(\S+)\s+(\S+)$/);
            if (match) {
                currentMetricName = match[1];
                currentType = match[2];
            }
            continue;
        }
        
        // Skip other comments
        if (trimmed.startsWith('#')) continue;
        
        // Parse metric line: metric_name{labels} value timestamp?
        const metricMatch = trimmed.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)((\{[^}]*\})?)(\s+.*)?$/);
        if (metricMatch) {
            const metricName = metricMatch[1];
            const labelsStr = metricMatch[3] || '{}';
            
            // Extract labels
            const labels = new Set();
            const labelMatches = labelsStr.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)="[^"]*"/g);
            for (const labelMatch of labelMatches) {
                labels.add(labelMatch[1]);
            }
            
            // Store or update metric info
            if (!metricsMap.has(metricName)) {
                metricsMap.set(metricName, {
                    name: metricName,
                    help: currentHelp || '',
                    type: currentType || 'untyped',
                    labels: labels,
                    sampleCount: 1
                });
            } else {
                const info = metricsMap.get(metricName);
                info.sampleCount++;
                // Merge labels
                for (const label of labels) {
                    info.labels.add(label);
                }
            }
        }
    }
    
    // Convert to array and sort
    const metrics = Array.from(metricsMap.values()).map(m => ({
        ...m,
        labels: Array.from(m.labels).sort()
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    return {
        totalMetrics: metrics.length,
        metrics: metrics,
        uniqueLabels: [...new Set(metrics.flatMap(m => m.labels))].sort(),
        metricTypes: [...new Set(metrics.map(m => m.type))].sort()
    };
}

// Handle language change
async function handleLanguageChange(e) {
    const newLang = e.target.value;
    await setLanguage(newLang);
    applyTranslations();
    
    // Re-render dynamic content if it exists
    if (parsedMetricsInfo) {
        showMetricsInfo(parsedMetricsInfo);
    }
    if (currentPanelPlans.length > 0) {
        showPanelPlansWithSelection(currentPanelPlans);
    }
}

// Handle generate button click (Step 1: Parse and show metrics info)
function handleGenerate() {
    const metricsText = metricsInput.value.trim();

    // Validate input
    if (!metricsText) {
        showError(t('messages.pasteMetricsFirst'));
        return;
    }

    // Hide previous results/errors
    resultSection.style.display = 'none';
    panelPlansSection.style.display = 'none';
    errorSection.style.display = 'none';
    jsonPreview.style.display = 'none';

    try {
        // Parse metrics in frontend (no backend call)
        parsedMetricsInfo = parseMetricsInfo(metricsText);
        
        // Store API config for later
        currentApiConfig = {
            metricsText: metricsText,
            openaiApiKey: apiKeyInput.value.trim(),
            apiBaseURL: apiBaseURLInput.value.trim(),
            modelName: modelNameInput.value.trim()
        };
        
        // Show parsed metrics info
        showMetricsInfo(parsedMetricsInfo);

        // Update step indicator to step 2 (Configure LLM)
        updateStepIndicator(2);

    } catch (error) {
        console.error('Parse error:', error);
        showError(t('messages.parseError'));
    }
}

// Show parsed metrics information
function showMetricsInfo(info) {
    // Update summary stats
    totalMetricsCount.textContent = info.totalMetrics;
    uniqueLabelsCount.textContent = info.uniqueLabels.length;
    metricTypesCount.textContent = info.metricTypes.length;
    
    // Show metrics list
    metricsListContainer.innerHTML = '';
    info.metrics.forEach((metric, index) => {
        const metricCard = document.createElement('div');
        metricCard.className = 'metric-card';
        
        const typeIcon = getMetricTypeIcon(metric.type);
        const typeClass = `type-badge type-${metric.type}`;
        
        metricCard.innerHTML = `
            <div class="metric-header">
                <span class="metric-number">${index + 1}</span>
                <code class="metric-name">${metric.name}</code>
                <span class="${typeClass}">${typeIcon} ${metric.type}</span>
            </div>
            <div class="metric-info-line">
                ${metric.help ? `<span class="metric-help">${metric.help}</span>` : ''}
                ${metric.labels.length > 0 ? `
                    <span class="metric-labels-inline">
                        <span class="labels-title">${t('sections.labelsTitle')}</span>
                        ${metric.labels.map(l => `<code class="label-tag">${l}</code>`).join(' ')}
                    </span>
                ` : ''}
                <span class="metric-stats-inline">
                    <i data-lucide="bar-chart-3" class="w-4 h-4 inline-block"></i> ${metric.sampleCount} ${t('sections.samples')}
                </span>
            </div>
        `;
        
        metricsListContainer.appendChild(metricCard);
    });
    
    // Show labels list
    labelsListContainer.innerHTML = '';
    if (info.uniqueLabels.length > 0) {
        info.uniqueLabels.forEach(label => {
            const labelBadge = document.createElement('span');
            labelBadge.className = 'label-badge';
            labelBadge.textContent = label;
            labelsListContainer.appendChild(labelBadge);
        });
    } else {
        labelsListContainer.innerHTML = `<p class="empty-message">${t('messages.noLabelsFound')}</p>`;
    }
    
    // Show types list
    typesListContainer.innerHTML = '';
    info.metricTypes.forEach(type => {
        const typeCount = info.metrics.filter(m => m.type === type).length;
        const typeCard = document.createElement('div');
        typeCard.className = 'type-card';
        const icon = getMetricTypeIcon(type);
        const translatedType = t(`metricTypes.${type}`, type);
        typeCard.innerHTML = `
            <span class="type-icon">${icon}</span>
            <span class="type-name">${translatedType}</span>
            <span class="type-count">${typeCount} ${t('metricTypes.metrics')}</span>
        `;
        typesListContainer.appendChild(typeCard);
    });
    
    // Show metrics info section
    metricsInfoSection.style.display = 'block';
    metricsInfoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Re-initialize Lucide icons for dynamic content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Get icon for metric type
function getMetricTypeIcon(type) {
    const icons = {
        'counter': '<i data-lucide="hash" class="w-4 h-4 inline-block"></i>',
        'gauge': '<i data-lucide="gauge" class="w-4 h-4 inline-block"></i>',
        'histogram': '<i data-lucide="bar-chart-3" class="w-4 h-4 inline-block"></i>',
        'summary': '<i data-lucide="trending-up" class="w-4 h-4 inline-block"></i>',
        'untyped': '<i data-lucide="help-circle" class="w-4 h-4 inline-block"></i>'
    };
    return icons[type] || '<i data-lucide="bar-chart-3" class="w-4 h-4 inline-block"></i>';
}

// Handle proceed to AI analysis (Step 2: Call backend)
async function handleProceedToAnalysis() {
    // Hide metrics info, show progress
    metricsInfoSection.style.display = 'none';
    showProgress(t('progress.analyzingAI'), t('progress.analyzingAIMessage'));
    proceedToAnalysisBtn.disabled = true;

    // Update step indicator to step 3 (Review Metrics)
    updateStepIndicator(3);

    try {
        // Prepare API request
        const requestBody = {
            metricsText: currentApiConfig.metricsText
        };
        
        if (currentApiConfig.openaiApiKey) requestBody.openaiApiKey = currentApiConfig.openaiApiKey;
        if (currentApiConfig.apiBaseURL) requestBody.apiBaseURL = currentApiConfig.apiBaseURL;
        if (currentApiConfig.modelName) requestBody.modelName = currentApiConfig.modelName;
        
        // Call Stage 1: Analysis API
        const response = await fetch('/api/analyze-metrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || t('errors.analysisFailed'));
        }

        // Success! Store results and show panel plans
        stopTerminalLogs(true);
        currentPanelPlans = data.panelPlans;
        currentMetricsSummary = data.metricsSummary;
        showPanelPlansWithSelection(data.panelPlans);

    } catch (error) {
        console.error('Analysis error:', error);
        stopTerminalLogs(false);
        showError(error.message || t('messages.errorOccurred'));
        // Show metrics info again so user can retry
        metricsInfoSection.style.display = 'block';
    } finally {
        progressSection.style.display = 'none';
        proceedToAnalysisBtn.disabled = false;
    }
}

// Handle back to edit
function handleBackToEdit() {
    metricsInfoSection.style.display = 'none';
    parsedMetricsInfo = null;
    currentApiConfig = null;

    // Reset step indicator to step 1 (Paste Metrics)
    updateStepIndicator(1);
}

// Handle generate selected panels (Stage 2)
async function handleGenerateSelected() {
    const selectedPlans = getSelectedPlans();
    
    // Calculate total selected panels from rows
    const totalSelected = selectedPlans.rows 
        ? selectedPlans.rows.reduce((sum, row) => sum + (row.panels?.length || 0), 0)
        : 0;
    
    if (totalSelected === 0) {
        showError(t('messages.selectAtLeastOne'));
        return;
    }

    // Hide panel plans and show progress
    panelPlansSection.style.display = 'none';
    showProgressForGeneration(t('progress.generating'), t('progress.generatingMessage').replace('{count}', totalSelected));
    generateSelectedBtn.disabled = true;

    try {
        // Call Stage 2: Generate Panels API
        const requestBody = {
            selectedPlans: selectedPlans,
            metricsSummary: currentMetricsSummary,
            ...currentApiConfig
        };
        
        const response = await fetch('/api/generate-panels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || t('errors.generationFailed'));
        }

        // Success!
        stopTerminalLogs(true);
        generatedDashboard = data.dashboard;
        showResult(data, selectedPlans);

    } catch (error) {
        console.error('Panel generation error:', error);
        stopTerminalLogs(false);
        showError(error.message || t('messages.errorOccurred'));
        // Show panel plans again so user can retry
        panelPlansSection.style.display = 'block';
    } finally {
        progressSection.style.display = 'none';
        generateSelectedBtn.disabled = false;
    }
}

// Show progress indicator
function showProgress(title, message) {
    progressTitle.textContent = title;
    progressMessage.textContent = message;
    progressSection.style.display = 'block';

    // Clear previous logs and start terminal animation
    clearTerminalLogs();
    startTerminalLogs(false);

    // Re-initialize Lucide icons for the terminal icon
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Show progress indicator for panel generation (uses different log messages)
function showProgressForGeneration(title, message) {
    progressTitle.textContent = title;
    progressMessage.textContent = message;
    progressSection.style.display = 'block';

    // Clear previous logs and start terminal animation with generation messages
    clearTerminalLogs();
    startTerminalLogs(true);

    // Re-initialize Lucide icons for the terminal icon
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Terminal log animation state
let terminalLogInterval = null;
let terminalLogIndex = 0;

// Terminal log messages for different stages
const analysisLogMessages = [
    { text: 'Initializing metrics parser...', type: 'info' },
    { text: 'Parsing Prometheus metrics format...', type: 'info' },
    { text: 'Extracting metric names and labels...', type: 'info' },
    { text: 'Identifying metric types (counter, gauge, histogram)...', type: 'info' },
    { text: 'Analyzing label cardinality...', type: 'info' },
    { text: 'Grouping related metrics...', type: 'info' },
    { text: 'Connecting to AI service...', type: 'info' },
    { text: 'Sending metrics summary to LLM...', type: 'info' },
    { text: 'AI analyzing metric patterns...', type: 'processing' },
    { text: 'Determining optimal visualizations...', type: 'processing' },
    { text: 'Planning dashboard layout...', type: 'processing' },
    { text: 'Generating panel recommendations...', type: 'processing' },
    { text: 'Optimizing PromQL queries...', type: 'processing' },
    { text: 'Validating panel configurations...', type: 'info' },
    { text: 'Finalizing analysis results...', type: 'success' },
];

const generationLogMessages = [
    { text: 'Starting panel generation...', type: 'info' },
    { text: 'Loading selected panel plans...', type: 'info' },
    { text: 'Initializing Grafana dashboard template...', type: 'info' },
    { text: 'Connecting to AI service...', type: 'info' },
    { text: 'Generating PromQL expressions...', type: 'processing' },
    { text: 'Building panel configurations...', type: 'processing' },
    { text: 'Setting up visualization options...', type: 'processing' },
    { text: 'Configuring thresholds and colors...', type: 'processing' },
    { text: 'Arranging panel grid positions...', type: 'processing' },
    { text: 'Creating row groupings...', type: 'info' },
    { text: 'Applying dashboard variables...', type: 'info' },
    { text: 'Validating JSON structure...', type: 'info' },
    { text: 'Optimizing dashboard performance...', type: 'info' },
    { text: 'Finalizing dashboard JSON...', type: 'success' },
];

// Clear terminal logs
function clearTerminalLogs() {
    if (terminalLogs) {
        terminalLogs.innerHTML = '';
    }
    terminalLogIndex = 0;
    if (terminalLogInterval) {
        clearInterval(terminalLogInterval);
        terminalLogInterval = null;
    }
}

// Add a single log entry to terminal
function addTerminalLog(message, type = 'info') {
    if (!terminalLogs) return;

    const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const logEntry = document.createElement('div');
    logEntry.className = 'flex items-start gap-2 animate-fade-in';

    // Color based on type
    let textColor = 'text-slate-400';
    let prefix = '$';
    if (type === 'success') {
        textColor = 'text-green-400';
        prefix = '+';
    } else if (type === 'error') {
        textColor = 'text-red-400';
        prefix = '!';
    } else if (type === 'processing') {
        textColor = 'text-blue-400';
        prefix = '>';
    }

    logEntry.innerHTML = `
        <span class="text-slate-600 select-none">[${timestamp}]</span>
        <span class="${textColor} select-none">${prefix}</span>
        <span class="${textColor}">${message}</span>
    `;

    terminalLogs.appendChild(logEntry);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

// Start terminal log animation
function startTerminalLogs(isGeneration = false) {
    const messages = isGeneration ? generationLogMessages : analysisLogMessages;
    terminalLogIndex = 0;

    // Add first log immediately
    if (messages.length > 0) {
        addTerminalLog(messages[0].text, messages[0].type);
        terminalLogIndex = 1;
    }

    // Add subsequent logs with random delays
    terminalLogInterval = setInterval(() => {
        if (terminalLogIndex < messages.length) {
            const msg = messages[terminalLogIndex];
            addTerminalLog(msg.text, msg.type);
            terminalLogIndex++;
        } else {
            // Loop back with "Still processing..." messages
            const waitMessages = [
                { text: 'Still processing, please wait...', type: 'processing' },
                { text: 'AI is thinking...', type: 'processing' },
                { text: 'Almost there...', type: 'processing' },
                { text: 'Generating content...', type: 'processing' },
            ];
            const randomMsg = waitMessages[Math.floor(Math.random() * waitMessages.length)];
            addTerminalLog(randomMsg.text, randomMsg.type);
        }
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
}

// Stop terminal logs
function stopTerminalLogs(success = true) {
    if (terminalLogInterval) {
        clearInterval(terminalLogInterval);
        terminalLogInterval = null;
    }

    if (success) {
        addTerminalLog('Operation completed successfully!', 'success');
    } else {
        addTerminalLog('Operation failed. Please check the error message.', 'error');
    }
}

// Show panel plans with checkboxes for selection
// Supports both new { rows: [...] } format and legacy array format
function showPanelPlansWithSelection(panelPlans) {
    if (!panelPlans) return;

    // Update step indicator to step 4 (Select Panels)
    updateStepIndicator(4);

    panelPlansList.innerHTML = '';
    
    // Normalize to rows format
    let rows;
    if (panelPlans.rows && Array.isArray(panelPlans.rows)) {
        rows = panelPlans.rows;
    } else if (Array.isArray(panelPlans)) {
        // Legacy format
        rows = [{ row_title: null, panels: panelPlans }];
    } else {
        console.error('Invalid panelPlans format');
        return;
    }
    
    // Calculate total panels
    const totalPanels = rows.reduce((sum, row) => sum + (row.panels?.length || 0), 0);
    totalPlansCount.textContent = totalPanels;
    
    let globalIndex = 0;
    
    rows.forEach((row, rowIndex) => {
        // Create row header if row has a title
        if (row.row_title) {
            const rowHeader = document.createElement('div');
            rowHeader.className = 'row-header';
            rowHeader.dataset.rowIndex = rowIndex;
            const panelCount = row.panels?.length || 0;
            rowHeader.innerHTML = `
                <input type="checkbox" class="row-checkbox" checked data-row-index="${rowIndex}" title="Select/deselect all panels in this row">
                <span class="row-icon">📁</span>
                <span class="row-title">${row.row_title}</span>
                <span class="row-panel-count">${panelCount} panels</span>
                <span class="row-selection-count" data-row-index="${rowIndex}">${panelCount}/${panelCount}</span>
            `;
            
            // Add click handler for row header (excluding checkbox)
            rowHeader.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    toggleRowSelection(rowIndex);
                }
            });
            
            // Add change handler for row checkbox
            const rowCheckbox = rowHeader.querySelector('.row-checkbox');
            rowCheckbox.addEventListener('change', (e) => {
                e.stopPropagation();
                setRowSelection(rowIndex, rowCheckbox.checked);
            });
            
            panelPlansList.appendChild(rowHeader);
        }
        
        // Create container for panels in this row
        const rowPanelsContainer = document.createElement('div');
        rowPanelsContainer.className = 'row-panels-container';
        panelPlansList.appendChild(rowPanelsContainer);
        
        // Create panel cards for this row
        const rowPanels = row.panels || [];
        rowPanels.forEach((plan, panelIndex) => {
            const planCard = document.createElement('div');
            planCard.className = 'panel-plan-card selected';
            planCard.dataset.rowIndex = rowIndex;
            planCard.dataset.panelIndex = panelIndex;
            planCard.dataset.globalIndex = globalIndex;
            
            const vizIcon = getVisualizationIcon(plan.suggested_visualization);
            const translatedVizType = t(`visualizations.${plan.suggested_visualization}`, plan.suggested_visualization);
            
            // Show size info if available
            const sizeInfo = (plan.width && plan.height) 
                ? `<span class="panel-size">${plan.width}×${plan.height}</span>` 
                : '';
            
            planCard.innerHTML = `
                <input type="checkbox" class="panel-plan-checkbox" checked 
                    data-row-index="${rowIndex}" data-panel-index="${panelIndex}" data-global-index="${globalIndex}">
                <div class="plan-header">
                    <span class="plan-number">${globalIndex + 1}</span>
                    <h4>${vizIcon} ${plan.panel_title}</h4>
                    ${sizeInfo}
                </div>
                <p class="plan-description">${plan.description || ''}</p>
                <div class="plan-details">
                    <div class="plan-detail">
                        <span class="detail-label">${t('sections.type')}</span>
                        <span class="detail-value">${translatedVizType}</span>
                    </div>
                    <div class="plan-detail">
                        <span class="detail-label">${t('sections.useMetrics')}</span>
                        <span class="detail-value">${(plan.required_metrics || []).join(', ')}</span>
                    </div>
                    ${plan.promql_hints ? `
                    <div class="plan-detail">
                        <span class="detail-label">${t('sections.queryHints')}</span>
                        <span class="detail-value">${plan.promql_hints}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            
            // Add click handler for card
            planCard.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    togglePanelSelectionByGlobalIndex(globalIndex);
                }
            });
            
            // Add change handler for checkbox
            const checkbox = planCard.querySelector('.panel-plan-checkbox');
            checkbox.addEventListener('change', () => {
                togglePanelSelectionByGlobalIndex(globalIndex);
            });
            
            rowPanelsContainer.appendChild(planCard);
            globalIndex++;
        });
    });
    
    updateSelectionCount();
    panelPlansSection.style.display = 'block';
    panelPlansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Re-initialize Lucide icons for dynamic content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Toggle all panels in a row
function toggleRowSelection(rowIndex) {
    const rowCheckbox = document.querySelector(`.row-checkbox[data-row-index="${rowIndex}"]`);
    if (rowCheckbox) {
        rowCheckbox.checked = !rowCheckbox.checked;
        setRowSelection(rowIndex, rowCheckbox.checked);
    }
}

// Set selection state for all panels in a row
function setRowSelection(rowIndex, selected) {
    const panelCards = document.querySelectorAll(`.panel-plan-card[data-row-index="${rowIndex}"]`);
    
    panelCards.forEach(card => {
        const checkbox = card.querySelector('.panel-plan-checkbox');
        if (checkbox) {
            checkbox.checked = selected;
            if (selected) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
    });
    
    updateRowSelectionCount(rowIndex);
    updateSelectionCount();
}

// Update the selection count display for a specific row
function updateRowSelectionCount(rowIndex) {
    const panelCards = document.querySelectorAll(`.panel-plan-card[data-row-index="${rowIndex}"]`);
    const selectedCount = document.querySelectorAll(`.panel-plan-card[data-row-index="${rowIndex}"] .panel-plan-checkbox:checked`).length;
    const totalCount = panelCards.length;
    
    const countDisplay = document.querySelector(`.row-selection-count[data-row-index="${rowIndex}"]`);
    if (countDisplay) {
        countDisplay.textContent = `${selectedCount}/${totalCount}`;
    }
    
    // Update row checkbox state (checked, unchecked, or indeterminate)
    const rowCheckbox = document.querySelector(`.row-checkbox[data-row-index="${rowIndex}"]`);
    if (rowCheckbox) {
        if (selectedCount === 0) {
            rowCheckbox.checked = false;
            rowCheckbox.indeterminate = false;
        } else if (selectedCount === totalCount) {
            rowCheckbox.checked = true;
            rowCheckbox.indeterminate = false;
        } else {
            rowCheckbox.checked = false;
            rowCheckbox.indeterminate = true;
        }
    }
}

// Toggle panel selection by global index
function togglePanelSelectionByGlobalIndex(globalIndex) {
    const card = document.querySelector(`.panel-plan-card[data-global-index="${globalIndex}"]`);
    if (!card) return;
    
    const checkbox = card.querySelector('.panel-plan-checkbox');
    const rowIndex = parseInt(card.dataset.rowIndex);
    
    if (checkbox.checked) {
        checkbox.checked = false;
        card.classList.remove('selected');
    } else {
        checkbox.checked = true;
        card.classList.add('selected');
    }
    
    // Update row selection state
    if (!isNaN(rowIndex)) {
        updateRowSelectionCount(rowIndex);
    }
    updateSelectionCount();
}

// Toggle panel selection
function togglePanelSelection(index) {
    const card = document.querySelector(`.panel-plan-card[data-index="${index}"]`);
    const checkbox = card.querySelector('.panel-plan-checkbox');
    
    if (checkbox.checked) {
        checkbox.checked = false;
        card.classList.remove('selected');
    } else {
        checkbox.checked = true;
        card.classList.add('selected');
    }
    
    updateSelectionCount();
}

// Update selection count
function updateSelectionCount() {
    const checked = document.querySelectorAll('.panel-plan-checkbox:checked').length;
    selectionCount.textContent = checked;
    
    // Enable/disable generate button based on selection
    generateSelectedBtn.disabled = checked === 0;
}

// Select all panels
function selectAll() {
    document.querySelectorAll('.panel-plan-checkbox').forEach(checkbox => {
        checkbox.checked = true;
        checkbox.closest('.panel-plan-card').classList.add('selected');
    });
    // Update all row checkboxes
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.checked = true;
        checkbox.indeterminate = false;
        const rowIndex = checkbox.dataset.rowIndex;
        updateRowSelectionCount(parseInt(rowIndex));
    });
    updateSelectionCount();
}

// Deselect all panels
function deselectAll() {
    document.querySelectorAll('.panel-plan-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.panel-plan-card').classList.remove('selected');
    });
    // Update all row checkboxes
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.indeterminate = false;
        const rowIndex = checkbox.dataset.rowIndex;
        updateRowSelectionCount(parseInt(rowIndex));
    });
    updateSelectionCount();
}

// Get selected panel plans in Row format
function getSelectedPlans() {
    // Get all checked checkboxes with their row/panel indices
    const checkedBoxes = document.querySelectorAll('.panel-plan-checkbox:checked');
    
    // Normalize currentPanelPlans to rows format
    let originalRows;
    if (currentPanelPlans.rows && Array.isArray(currentPanelPlans.rows)) {
        originalRows = currentPanelPlans.rows;
    } else if (Array.isArray(currentPanelPlans)) {
        // Legacy format
        originalRows = [{ row_title: null, collapsed: false, panels: currentPanelPlans }];
    } else {
        return { rows: [] };
    }
    
    // Build selected rows structure
    const selectedRows = [];
    const rowSelections = new Map(); // rowIndex -> Set of panelIndices
    
    checkedBoxes.forEach(checkbox => {
        const rowIndex = parseInt(checkbox.dataset.rowIndex);
        const panelIndex = parseInt(checkbox.dataset.panelIndex);
        
        if (!rowSelections.has(rowIndex)) {
            rowSelections.set(rowIndex, new Set());
        }
        rowSelections.get(rowIndex).add(panelIndex);
    });
    
    // Build rows with only selected panels (sorted by rowIndex to maintain order)
    const sortedRowIndices = [...rowSelections.keys()].sort((a, b) => a - b);
    sortedRowIndices.forEach(rowIndex => {
        const panelIndices = rowSelections.get(rowIndex);
        const originalRow = originalRows[rowIndex];
        if (!originalRow) return;
        
        const selectedPanels = [];
        panelIndices.forEach(panelIndex => {
            if (originalRow.panels && originalRow.panels[panelIndex]) {
                selectedPanels.push(originalRow.panels[panelIndex]);
            }
        });
        
        if (selectedPanels.length > 0) {
            selectedRows.push({
                row_title: originalRow.row_title,
                collapsed: originalRow.collapsed || false,
                panels: selectedPanels
            });
        }
    });
    
    return { rows: selectedRows };
}

// Handle cancel generation
function handleCancelGeneration() {
    panelPlansSection.style.display = 'none';
    currentPanelPlans = [];
    currentMetricsSummary = null;
    currentApiConfig = null;
}

// Get visualization icon
function getVisualizationIcon(type) {
    const icons = {
        'timeseries': '<i data-lucide="trending-up" class="w-4 h-4 inline-block"></i>',
        'stat': '<i data-lucide="hash" class="w-4 h-4 inline-block"></i>',
        'gauge': '<i data-lucide="gauge" class="w-4 h-4 inline-block"></i>',
        'table': '<i data-lucide="table" class="w-4 h-4 inline-block"></i>',
        'bar': '<i data-lucide="bar-chart-3" class="w-4 h-4 inline-block"></i>',
        'heatmap': '<i data-lucide="flame" class="w-4 h-4 inline-block"></i>',
        'graph': '<i data-lucide="line-chart" class="w-4 h-4 inline-block"></i>'
    };
    return icons[type] || '<i data-lucide="bar-chart-3" class="w-4 h-4 inline-block"></i>';
}

// Show result
function showResult(data, selectedPlans = null) {
    // Update step indicator to step 5 (Download)
    updateStepIndicator(5);

    // Calculate planned panels count from Row format or legacy
    let plannedCount = data.metadata.totalPanelsPlanned || data.metadata.panelsCount;
    if (selectedPlans && selectedPlans.rows) {
        plannedCount = selectedPlans.rows.reduce((sum, row) => sum + (row.panels?.length || 0), 0);
    } else if (selectedPlans && Array.isArray(selectedPlans)) {
        plannedCount = selectedPlans.length;
    }
    
    // Update stats
    panelsPlanned.textContent = plannedCount;
    panelsCreated.textContent = data.metadata.successfulPanels || data.metadata.panelsCount;
    generationTime.textContent = `${(data.metadata.generationTimeMs / 1000).toFixed(1)}s`;
    modelUsed.textContent = data.metadata.model || 'GPT-4';
    
    // Remove any existing warning messages
    const existingWarning = resultSection.querySelector('.warning-message');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    // Show warning if some panels failed
    if (data.metadata.failedPanels > 0) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'warning-message';
        warningDiv.innerHTML = `
            <strong><i data-lucide="alert-triangle" class="w-4 h-4 inline-block"></i> ${t('messages.warningPanelsFailed').replace('{count}', data.metadata.failedPanels)}</strong>
            ${t('messages.warningPanelsSuccess').replace('{count}', data.metadata.successfulPanels)}
        `;
        const cardBody = resultSection.querySelector('.card-body');
        const actions = resultSection.querySelector('.actions');
        cardBody.insertBefore(warningDiv, actions);
    }
    
    resultSection.style.display = 'block';

    // Re-initialize Lucide icons for dynamic content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Handle download
function handleDownload() {
    if (!generatedDashboard) return;

    const dataStr = JSON.stringify(generatedDashboard, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `grafana-dashboard-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show feedback
    downloadBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5 inline-block"></i> ' + t('buttons.downloadSuccess');
    lucide.createIcons();
    setTimeout(() => {
        downloadBtn.innerHTML = '<i data-lucide="download" class="w-5 h-5 inline-block"></i> ' + t('buttons.download');
        lucide.createIcons();
    }, 2000);
}

// Handle copy to clipboard
async function handleCopy() {
    if (!generatedDashboard) return;

    try {
        const dataStr = JSON.stringify(generatedDashboard, null, 2);
        await navigator.clipboard.writeText(dataStr);
        
        // Show feedback
        copyBtn.innerHTML = '<i data-lucide="check" class="w-5 h-5 inline-block"></i> ' + t('buttons.copySuccess');
        lucide.createIcons();
        setTimeout(() => {
            copyBtn.innerHTML = '<i data-lucide="clipboard" class="w-5 h-5 inline-block"></i> ' + t('buttons.copy');
            lucide.createIcons();
        }, 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        alert(t('messages.copyFailed'));
    }
}

// Toggle JSON view
function toggleJsonView() {
    if (!generatedDashboard) return;

    if (jsonPreview.style.display === 'none') {
        jsonContent.textContent = JSON.stringify(generatedDashboard, null, 2);
        jsonPreview.style.display = 'block';
        viewBtn.innerHTML = '<i data-lucide="eye-off" class="w-5 h-5 inline-block"></i> ' + t('buttons.hideView');
        lucide.createIcons();
    } else {
        jsonPreview.style.display = 'none';
        viewBtn.innerHTML = '<i data-lucide="eye" class="w-5 h-5 inline-block"></i> ' + t('buttons.view');
        lucide.createIcons();
    }
}

// Handle retry
function handleRetry() {
    errorSection.style.display = 'none';
    metricsInput.focus();

    // Reset step indicator to step 1 (Paste Metrics)
    updateStepIndicator(1);
}

// Check server health on load
async function checkHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('Server health:', data);
        
        if (!data.hasOpenAIKey) {
            console.warn('OpenAI API key not configured on server. Users will need to provide their own.');
        }
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

// Configuration Management UI Functions

// Render config selector dropdown
function renderConfigSelector() {
    configSelector.innerHTML = '<option value="">-- Enter Manually --</option>';
    
    apiConfigs.forEach((config, index) => {
        const option = document.createElement('option');
        option.value = config.id;
        option.textContent = config.name;
        if (index === currentConfigIndex) {
            option.selected = true;
        }
        configSelector.appendChild(option);
    });
}

// Handle config selection
function handleConfigSelect(e) {
    const configId = e.target.value;
    if (configId) {
        const config = getConfigById(configId);
        applyConfig(config);
    } else {
        // Manual entry
        currentConfigIndex = -1;
    }
}

// Open config management modal
function openConfigModal() {
    renderConfigList();
    configModal.style.display = 'flex';
}

// Close config management modal
function closeConfigModal() {
    configModal.style.display = 'none';
}

// Render config list in modal
function renderConfigList() {
    configList.innerHTML = '';
    
    // Filter out completely empty configs
    const validConfigs = apiConfigs.filter(config => {
        return config.apiKey || config.apiBaseURL || config.modelName;
    });
    
    if (validConfigs.length === 0) {
        configList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">📝 ${t('modals.noConfigsTitle')}</p>
                <p style="font-size: 0.875rem;">${t('modals.noConfigsMessage')}</p>
            </div>
        `;
        return;
    }
    
    validConfigs.forEach(config => {
        const configCard = document.createElement('div');
        configCard.className = 'config-item';
        const isSelected = config.id === configSelector.value;
        
        const maskedKey = config.apiKey ? 
            config.apiKey.substring(0, 8) + '...' + config.apiKey.substring(config.apiKey.length - 4) : 
            t('labels.notSet');
        
        configCard.innerHTML = `
            <input type="radio" name="selectedConfig" class="config-radio" value="${config.id}" ${isSelected ? 'checked' : ''}>
            <div class="config-content">
                <div class="config-item-header">
                    <h4>${config.name}</h4>
                    <div class="config-item-actions">
                        <button class="config-action-btn config-edit-btn" onclick="handleEditConfig('${config.id}')" title="${t('labels.editConfiguration')}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="config-action-btn config-delete-btn" onclick="handleDeleteConfig('${config.id}')" title="${t('labels.deleteConfiguration')}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="config-item-details">
                    <span class="config-detail-compact"><strong>${t('labels.apiKeyShort')}</strong> <code>${maskedKey}</code></span>
                    ${config.apiBaseURL ? `<span class="config-detail-compact"><strong>${t('labels.baseURLShort')}</strong> <code>${config.apiBaseURL}</code></span>` : ''}
                    ${config.modelName ? `<span class="config-detail-compact"><strong>${t('labels.modelShort')}</strong> <code>${config.modelName}</code></span>` : ''}
                </div>
            </div>
        `;
        
        // Add click handler for radio button
        const radio = configCard.querySelector('.config-radio');
        radio.addEventListener('change', () => {
            handleUseConfig(config.id);
        });
        
        // Make card clickable to select
        configCard.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons or their children
            if (!e.target.closest('button') && e.target.tagName !== 'INPUT') {
                radio.checked = true;
                handleUseConfig(config.id);
            }
        });
        
        configList.appendChild(configCard);
    });
}

// Handle save current config
function handleSaveCurrentConfig() {
    const apiKey = apiKeyInput.value.trim();
    const apiBaseURL = apiBaseURLInput.value.trim();
    const modelName = modelNameInput.value.trim();
    
    if (!apiKey && !apiBaseURL && !modelName) {
        alert(t('messages.enterAtLeastOneValue'));
        return;
    }
    
    const name = prompt(t('labels.configName') + ':', 'New Configuration');
    if (!name || !name.trim()) return;
    
    const newConfig = addConfig(name.trim(), apiKey, apiBaseURL, modelName);
    renderConfigSelector();
    
    // Select the newly created config
    configSelector.value = newConfig.id;
    currentConfigIndex = apiConfigs.findIndex(c => c.id === newConfig.id);
    
    alert(t('messages.configSaved'));
}

// Open add new config modal
function openAddConfigModal() {
    editingConfigId = null;
    editConfigTitle.innerHTML = '<i data-lucide="plus" class="w-5 h-5 inline-block"></i> ' + t('modals.addConfig');
    lucide.createIcons();
    editConfigName.value = '';
    editConfigApiKey.value = '';
    editConfigApiBaseURL.value = '';
    editConfigModelName.value = '';
    editConfigModal.style.display = 'flex';
}

// Handle edit config
window.handleEditConfig = function(configId) {
    const config = getConfigById(configId);
    if (!config) return;
    
    editingConfigId = configId;
    editConfigTitle.innerHTML = '<i data-lucide="edit-3" class="w-5 h-5 inline-block"></i> ' + t('modals.editConfig');
    lucide.createIcons();
    editConfigName.value = config.name;
    editConfigApiKey.value = config.apiKey;
    editConfigApiBaseURL.value = config.apiBaseURL || '';
    editConfigModelName.value = config.modelName || '';
    
    closeConfigModal();
    editConfigModal.style.display = 'flex';
};

// Handle save edit config
function handleSaveEditConfig() {
    const name = editConfigName.value.trim();
    const apiKey = editConfigApiKey.value.trim();
    const apiBaseURL = editConfigApiBaseURL.value.trim();
    const modelName = editConfigModelName.value.trim();
    
    if (!name) {
        alert(t('messages.enterConfigName'));
        return;
    }
    
    if (!apiKey && !apiBaseURL && !modelName) {
        alert(t('messages.enterAtLeastOneValue'));
        return;
    }
    
    if (editingConfigId) {
        // Update existing config
        updateConfig(editingConfigId, {
            name: name,
            apiKey: apiKey,
            apiBaseURL: apiBaseURL,
            modelName: modelName
        });
    } else {
        // Add new config
        addConfig(name, apiKey, apiBaseURL, modelName);
    }
    
    renderConfigSelector();
    closeEditConfigModal();
    openConfigModal();
}

// Close edit config modal
function closeEditConfigModal() {
    editConfigModal.style.display = 'none';
    editingConfigId = null;
}

// Handle use config
window.handleUseConfig = function(configId) {
    const config = getConfigById(configId);
    applyConfig(config);
    configSelector.value = configId;
    closeConfigModal();
};

// Handle delete config
window.handleDeleteConfig = function(configId) {
    const config = getConfigById(configId);
    if (!config) return;
    
    if (!confirm(`${t('modals.deleteConfirm')} "${config.name}"?`)) {
        return;
    }
    
    deleteConfig(configId);
    renderConfigList();
    renderConfigSelector();
    
    // If deleted config was selected, clear selection
    if (currentConfigIndex >= 0 && apiConfigs[currentConfigIndex]?.id === configId) {
        configSelector.value = '';
        currentConfigIndex = -1;
    }
};

// Initialize app
async function initializeApp() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Check landing page preference first
    checkLandingPagePreference();

    // Initialize i18n first
    const currentLang = await initI18n();
    languageSelector.value = currentLang;

    // Apply translations to static elements
    applyTranslations();

    // Initialize config management
    loadConfigs();
    renderConfigSelector();

    // Auto-load the last saved config if exists
    const validConfigs = apiConfigs.filter(c => c.apiKey || c.apiBaseURL || c.modelName);
    if (validConfigs.length > 0) {
        // Load the most recent config (last in array)
        const lastConfig = validConfigs[validConfigs.length - 1];
        applyConfig(lastConfig);
        configSelector.value = lastConfig.id;
    }

    // Check server health
    checkHealth();
}

// Start the app
initializeApp();

