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

// Configuration Management
const CONFIG_STORAGE_KEY = 'grafana_dashboard_api_configs';

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

let editingConfigId = null; // Track which config is being edited

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
                    📊 ${metric.sampleCount} ${t('sections.samples')}
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
}

// Get icon for metric type
function getMetricTypeIcon(type) {
    const icons = {
        'counter': '🔢',
        'gauge': '⏲️',
        'histogram': '📊',
        'summary': '📈',
        'untyped': '❓'
    };
    return icons[type] || '📊';
}

// Handle proceed to AI analysis (Step 2: Call backend)
async function handleProceedToAnalysis() {
    // Hide metrics info, show progress
    metricsInfoSection.style.display = 'none';
    showProgress(t('progress.analyzingAI'), t('progress.analyzingAIMessage'));
    proceedToAnalysisBtn.disabled = true;

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
        currentPanelPlans = data.panelPlans;
        currentMetricsSummary = data.metricsSummary;
        showPanelPlansWithSelection(data.panelPlans);

    } catch (error) {
        console.error('Analysis error:', error);
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
}

// Handle generate selected panels (Stage 2)
async function handleGenerateSelected() {
    const selectedPlans = getSelectedPlans();
    
    if (selectedPlans.length === 0) {
        showError(t('messages.selectAtLeastOne'));
        return;
    }

    // Hide panel plans and show progress
    panelPlansSection.style.display = 'none';
    showProgress(t('progress.generating'), t('progress.generatingMessage').replace('{count}', selectedPlans.length));
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
        generatedDashboard = data.dashboard;
        showResult(data, selectedPlans);

    } catch (error) {
        console.error('Panel generation error:', error);
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

    // Update message after some time
    setTimeout(() => {
        if (progressSection.style.display !== 'none') {
            progressMessage.textContent = t('progress.generatingLonger');
        }
    }, 10000);
}

// Show panel plans with checkboxes for selection
function showPanelPlansWithSelection(panelPlans) {
    if (!panelPlans || panelPlans.length === 0) return;
    
    panelPlansList.innerHTML = '';
    totalPlansCount.textContent = panelPlans.length;
    
    panelPlans.forEach((plan, index) => {
        const planCard = document.createElement('div');
        planCard.className = 'panel-plan-card selected'; // Selected by default
        planCard.dataset.index = index;
        
        const vizIcon = getVisualizationIcon(plan.suggested_visualization);
        const translatedVizType = t(`visualizations.${plan.suggested_visualization}`, plan.suggested_visualization);
        
        planCard.innerHTML = `
            <input type="checkbox" class="panel-plan-checkbox" checked data-index="${index}">
            <div class="plan-header">
                <span class="plan-number">${index + 1}</span>
                <h4>${vizIcon} ${plan.panel_title}</h4>
            </div>
            <p class="plan-description">${plan.description}</p>
            <div class="plan-details">
                <div class="plan-detail">
                    <span class="detail-label">${t('sections.type')}</span>
                    <span class="detail-value">${translatedVizType}</span>
                </div>
                <div class="plan-detail">
                    <span class="detail-label">${t('sections.useMetrics')}</span>
                    <span class="detail-value">${plan.required_metrics.join(', ')}</span>
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
                togglePanelSelection(index);
            }
        });
        
        // Add change handler for checkbox
        const checkbox = planCard.querySelector('.panel-plan-checkbox');
        checkbox.addEventListener('change', () => {
            togglePanelSelection(index);
        });
        
        panelPlansList.appendChild(planCard);
    });
    
    updateSelectionCount();
    panelPlansSection.style.display = 'block';
    panelPlansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    updateSelectionCount();
}

// Deselect all panels
function deselectAll() {
    document.querySelectorAll('.panel-plan-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.panel-plan-card').classList.remove('selected');
    });
    updateSelectionCount();
}

// Get selected panel plans
function getSelectedPlans() {
    const selected = [];
    document.querySelectorAll('.panel-plan-checkbox:checked').forEach(checkbox => {
        const index = parseInt(checkbox.dataset.index);
        selected.push(currentPanelPlans[index]);
    });
    return selected;
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
        'timeseries': '📈',
        'stat': '🔢',
        'gauge': '⏲️',
        'table': '📊',
        'bar': '📊',
        'heatmap': '🔥',
        'graph': '📉'
    };
    return icons[type] || '📊';
}

// Show result
function showResult(data, selectedPlans = null) {
    // Update stats
    panelsPlanned.textContent = selectedPlans ? selectedPlans.length : (data.metadata.totalPanelsPlanned || data.metadata.panelsCount);
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
            <strong>⚠️ ${t('messages.warningPanelsFailed').replace('{count}', data.metadata.failedPanels)}</strong>
            ${t('messages.warningPanelsSuccess').replace('{count}', data.metadata.successfulPanels)}
        `;
        const cardBody = resultSection.querySelector('.card-body');
        const actions = resultSection.querySelector('.actions');
        cardBody.insertBefore(warningDiv, actions);
    }
    
    resultSection.style.display = 'block';
    
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
    downloadBtn.textContent = '✅ ' + t('buttons.downloadSuccess');
    setTimeout(() => {
        downloadBtn.textContent = '⬇️ ' + t('buttons.download');
    }, 2000);
}

// Handle copy to clipboard
async function handleCopy() {
    if (!generatedDashboard) return;

    try {
        const dataStr = JSON.stringify(generatedDashboard, null, 2);
        await navigator.clipboard.writeText(dataStr);
        
        // Show feedback
        copyBtn.textContent = '✅ ' + t('buttons.copySuccess');
        setTimeout(() => {
            copyBtn.textContent = '📋 ' + t('buttons.copy');
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
        viewBtn.textContent = '🙈 ' + t('buttons.hideView');
    } else {
        jsonPreview.style.display = 'none';
        viewBtn.textContent = '👁️ ' + t('buttons.view');
    }
}

// Handle retry
function handleRetry() {
    errorSection.style.display = 'none';
    metricsInput.focus();
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
    editConfigTitle.textContent = '➕ ' + t('modals.addConfig');
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
    editConfigTitle.textContent = '✏️ ' + t('modals.editConfig');
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

