export default {
    app: {
        title: "Metrics to Grafana Dashboard",
        subtitle: "Automatically generate beautiful Grafana dashboards from your Prometheus metrics using AI"
    },

    stepIndicator: {
        step1: "Paste Metrics",
        step2: "Configure LLM",
        step3: "Review Metrics",
        step4: "Select Panels",
        step5: "Download"
    },

    landing: {
        heroSubtitle: "Transform your Prometheus metrics into beautiful, insightful Grafana dashboards in seconds with AI-powered automation",
        tryNow: "Try it Now",
        painPointsTitle: "Tired of Manual Dashboard Creation?",
        painPointsSubtitle: "Creating Grafana dashboards from scratch is time-consuming and error-prone",
        painPoint1Title: "Hours of Manual Work",
        painPoint1Desc: "Writing PromQL queries and configuring panels takes hours of tedious work for each dashboard",
        painPoint2Title: "Complex PromQL Syntax",
        painPoint2Desc: "PromQL has a steep learning curve, making it hard to write efficient queries",
        painPoint3Title: "Inconsistent Dashboards",
        painPoint3Desc: "Manual creation leads to inconsistent layouts and missing important metrics",
        howItWorksTitle: "How It Works",
        howItWorksSubtitle: "Three simple steps to generate your perfect dashboard",
        step1Title: "Paste Your Metrics",
        step1Desc: "Copy metrics from your /metrics endpoint and paste them into the tool",
        step2Title: "AI Analysis",
        step2Desc: "Our AI analyzes your metrics and plans optimal panel configurations",
        step3Title: "Download & Import",
        step3Desc: "Download the generated JSON and import directly into Grafana",
        ctaTitle: "Ready to Save Hours of Work?",
        ctaSubtitle: "Generate your first dashboard in under a minute"
    },

    steps: {
        step1: {
            title: "Step 1: Paste Your Metrics",
            description: "Copy metrics from your /metrics endpoint and paste them below"
        },
        step2: {
            title: "Step 2: Config Your LLM",
            description: ""
        },
        step3: {
            title: "Metrics Information",
            description: "Review the extracted metrics information before continuing to AI analysis"
        },
        step4: {
            title: "Planned Panels",
            description: "AI analyzed your metrics and planned the following panels. Select which ones to generate:"
        },
        stepResult: {
            title: "Dashboard Generated Successfully!",
            description: ""
        }
    },
    
    buttons: {
        generate: "Start Generating Dashboard",
        download: "Download Dashboard JSON",
        downloadSuccess: "Downloaded!",
        copy: "Copy to Clipboard",
        copySuccess: "Copied!",
        view: "View JSON",
        hideView: "Hide JSON",
        retry: "Try Again",
        selectAll: "Select All",
        deselectAll: "Deselect All",
        generateSelected: "Generate Selected Panels",
        startOver: "Start Over",
        nextAnalysis: "Next: AI Analysis",
        backToEdit: "Back to Edit",
        manageConfigs: "Manage Configurations",
        saveConfig: "Save Current Config",
        addNewConfig: "Add New Configuration",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        use: "Use"
    },
    
    labels: {
        apiKey: "API Key:",
        apiKeyShort: "API Key:",
        apiBaseURL: "API Base URL:",
        baseURLShort: "Base URL:",
        modelName: "Model Name:",
        modelShort: "Model:",
        optional: "(optional)",
        savedConfig: "Saved Configuration:",
        enterManually: "-- Enter Manually --",
        configName: "Configuration Name",
        metricsDetected: "metrics detected",
        panelsSelected: "panels selected",
        of: "of",
        notSet: "(not set)",
        editConfiguration: "Edit configuration",
        deleteConfiguration: "Delete configuration"
    },
    
    placeholders: {
        apiKey: "sk-... or JWT token",
        apiBaseURL: "https://api.minimaxi.com/v1",
        modelName: "gpt-4-turbo-preview / MiniMax-M2",
        configName: "e.g., OpenAI Production, MiniMax Test",
        metricsInput: `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{handler="/api/v1/user",method="GET",status_code="200"} 1027
...

Paste your Prometheus metrics here`
    },
    
    progress: {
        analyzing: "Analyzing metrics...",
        analyzingMessage: "This may take 30-60 seconds depending on the number of metrics",
        analyzingAI: "Analyzing metrics with AI...",
        analyzingAIMessage: "AI is analyzing your metrics and planning the dashboard structure",
        generating: "Generating panels...",
        generatingMessage: "Creating selected panels with detailed PromQL queries...",
        generatingLonger: "Generating panels with detailed PromQL queries... This takes a bit longer for accuracy."
    },
    
    stats: {
        totalMetrics: "Total Metrics:",
        uniqueLabels: "Unique Labels:",
        metricTypes: "Metric Types:",
        panelsPlanned: "Panels Planned",
        panelsCreated: "Panels Created",
        generationTime: "Generation Time",
        modelUsed: "Model Used",
        samples: "samples"
    },
    
    sections: {
        metricsList: "Metrics List",
        commonLabels: "Common Labels",
        metricTypesTitle: "Metric Types",
        labels: "Labels:",
        labelsTitle: "Labels:",
        type: "Type:",
        useMetrics: "Use Metrics:",
        queryHints: "Query Hints:",
        samples: "samples"
    },
    
    modals: {
        manageConfigs: "Manage API Configurations",
        editConfig: "Edit Configuration",
        addConfig: "Add New Configuration",
        noConfigsTitle: "No saved configurations yet",
        noConfigsMessage: "Click \"Add New Configuration\" below to save your LLM API configuration",
        deleteConfirm: "Are you sure you want to delete"
    },
    
    messages: {
        configSaved: "Configuration saved successfully!",
        errorOccurred: "An unexpected error occurred",
        selectAtLeastOne: "Please select at least one panel to generate",
        pasteMetricsFirst: "Please paste your metrics text before generating",
        parseError: "Failed to parse metrics. Please check your metrics format.",
        enterConfigName: "Please enter a configuration name.",
        enterAtLeastOneValue: "Please enter at least one configuration value (API Key, Base URL, or Model Name)",
        copyFailed: "Failed to copy to clipboard. Please try downloading instead.",
        warningPanelsFailed: "panels failed to generate and were skipped. Dashboard contains",
        warningPanelsSuccess: "successfully generated panels.",
        noLabelsFound: "No labels found"
    },
    
    guide: {
        howToUse: "How to Use",
        importToGrafana: "Importing to Grafana",
        step1: "Access your application's /metrics endpoint (e.g., http://localhost:8080/metrics)",
        step2: "Copy all the metrics text and paste it in the textarea above",
        step3: "Optionally provide your OpenAI API key (if not configured on the server)",
        step4: "Click \"Start Generating Dashboard\" and wait for the AI to analyze your metrics",
        step5: "Download the generated JSON and import it into Grafana",
        import1: "In Grafana, go to Dashboards → New → Import",
        import2: "Click \"Upload dashboard JSON file\" or paste the JSON directly",
        import3: "Select your Prometheus data source",
        import4: "Click \"Import\""
    },
    
    errors: {
        general: "Error",
        analysisFailed: "Failed to analyze metrics",
        generationFailed: "Failed to generate panels"
    },
    
    metricTypes: {
        counter: "counter",
        gauge: "gauge",
        histogram: "histogram",
        summary: "summary",
        untyped: "untyped",
        metrics: "metrics"
    },
    
    visualizations: {
        timeseries: "Time Series",
        stat: "Stat",
        gauge: "Gauge",
        table: "Table",
        bar: "Bar Chart",
        heatmap: "Heatmap",
        graph: "Graph"
    },
    
    jsonPreview: {
        title: "Dashboard JSON Preview"
    }
};


