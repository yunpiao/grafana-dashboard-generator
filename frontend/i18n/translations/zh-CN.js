export default {
    app: {
        title: "Prometheus Metrics 转 Grafana 仪表板",
        subtitle: "使用 AI 自动从 Prometheus Metrics 生成精美的 Grafana 仪表板"
    },

    stepIndicator: {
        step1: "粘贴指标",
        step2: "配置 LLM",
        step3: "审查指标",
        step4: "选择面板",
        step5: "下载"
    },

    landing: {
        heroSubtitle: "使用 AI 自动化技术，在几秒钟内将 Prometheus Metrics 转换为精美、直观的 Grafana 仪表板",
        tryNow: "立即体验",
        painPointsTitle: "厌倦了手动创建仪表板？",
        painPointsSubtitle: "从零开始创建 Grafana 仪表板既耗时又容易出错",
        painPoint1Title: "数小时的手动工作",
        painPoint1Desc: "为每个仪表板编写 PromQL 查询和配置面板需要数小时的繁琐工作",
        painPoint2Title: "复杂的 PromQL 语法",
        painPoint2Desc: "PromQL 学习曲线陡峭，难以编写高效的查询",
        painPoint3Title: "不一致的仪表板",
        painPoint3Desc: "手动创建导致布局不一致，容易遗漏重要指标",
        howItWorksTitle: "工作原理",
        howItWorksSubtitle: "三个简单步骤生成完美仪表板",
        step1Title: "粘贴您的 Metrics",
        step1Desc: "从 /metrics 端点复制指标数据并粘贴到工具中",
        step2Title: "AI 分析",
        step2Desc: "AI 分析您的指标并规划最佳面板配置",
        step3Title: "下载并导入",
        step3Desc: "下载生成的 JSON 并直接导入 Grafana",
        ctaTitle: "准备好节省数小时的工作了吗？",
        ctaSubtitle: "一分钟内生成您的第一个仪表板"
    },

    steps: {
        step1: {
            title: "步骤 1：粘贴您的 Metrics",
            description: "从 /metrics 端点复制 Metrics 数据并粘贴到下方"
        },
        step2: {
            title: "步骤 2：配置您的 LLM",
            description: ""
        },
        step3: {
            title: "Metrics 信息",
            description: "在继续 AI 分析之前查看提取的 Metrics 信息"
        },
        step4: {
            title: "计划的面板",
            description: "AI 已分析您的 Metrics 并规划了以下面板。选择要生成的面板："
        },
        stepResult: {
            title: "仪表板生成成功！",
            description: ""
        }
    },
    
    buttons: {
        generate: "开始生成仪表盘",
        download: "下载仪表板 JSON",
        downloadSuccess: "下载成功！",
        copy: "复制到剪贴板",
        copySuccess: "复制成功！",
        view: "查看 JSON",
        hideView: "隐藏 JSON",
        retry: "重试",
        selectAll: "全选",
        deselectAll: "取消全选",
        generateSelected: "生成选中的面板",
        startOver: "重新开始",
        nextAnalysis: "下一步：AI 分析",
        backToEdit: "返回编辑",
        manageConfigs: "管理配置",
        saveConfig: "保存当前配置",
        addNewConfig: "添加新配置",
        save: "保存",
        cancel: "取消",
        edit: "编辑",
        delete: "删除",
        use: "使用"
    },
    
    labels: {
        apiKey: "API 密钥：",
        apiKeyShort: "API 密钥:",
        apiBaseURL: "API 基础 URL：",
        baseURLShort: "基础 URL:",
        modelName: "模型名称：",
        modelShort: "模型:",
        optional: "（可选）",
        savedConfig: "保存的配置：",
        enterManually: "-- 手动输入 --",
        configName: "配置名称",
        metricsDetected: "个 Metrics 已检测",
        panelsSelected: "个面板已选择",
        of: "共",
        notSet: "（未设置）",
        editConfiguration: "编辑配置",
        deleteConfiguration: "删除配置"
    },
    
    placeholders: {
        apiKey: "sk-... 或 JWT token",
        apiBaseURL: "https://api.minimaxi.com/v1",
        modelName: "gpt-4-turbo-preview / MiniMax-M2",
        configName: "例如：OpenAI 生产环境、MiniMax 测试",
        metricsInput: `# HELP http_requests_total HTTP 请求总数
# TYPE http_requests_total counter
http_requests_total{handler="/api/v1/user",method="GET",status_code="200"} 1027
...

在此粘贴您的 Prometheus Metrics 数据`
    },
    
    progress: {
        analyzing: "正在分析 Metrics...",
        analyzingMessage: "根据 Metrics 数量，这可能需要 30-60 秒",
        analyzingAI: "正在使用 AI 分析 Metrics...",
        analyzingAIMessage: "AI 正在分析您的 Metrics 并规划仪表板结构",
        generating: "正在生成面板...",
        generatingMessage: "正在创建选中的面板和详细的 PromQL 查询...",
        generatingLonger: "正在生成包含详细 PromQL 查询的面板...为了准确性，这需要更长时间。"
    },
    
    stats: {
        totalMetrics: "总 Metrics 数：",
        uniqueLabels: "唯一标签数：",
        metricTypes: "Metric 类型：",
        panelsPlanned: "规划的面板",
        panelsCreated: "创建的面板",
        generationTime: "生成时间",
        modelUsed: "使用的模型",
        samples: "个样本"
    },
    
    sections: {
        metricsList: "Metrics 列表",
        commonLabels: "常用标签",
        metricTypesTitle: "Metric 类型",
        labels: "标签：",
        labelsTitle: "标签：",
        type: "类型：",
        useMetrics: "使用 Metrics：",
        queryHints: "查询提示：",
        samples: "个样本"
    },
    
    modals: {
        manageConfigs: "管理 API 配置",
        editConfig: "编辑配置",
        addConfig: "添加新配置",
        noConfigsTitle: "尚未保存配置",
        noConfigsMessage: "点击下方的「添加新配置」来保存您的 LLM API 配置",
        deleteConfirm: "您确定要删除"
    },
    
    messages: {
        configSaved: "配置保存成功！",
        errorOccurred: "发生了意外错误",
        selectAtLeastOne: "请至少选择一个面板来生成",
        pasteMetricsFirst: "请在生成之前粘贴您的 Metrics 数据",
        parseError: "解析 Metrics 失败。请检查您的数据格式。",
        enterConfigName: "请输入配置名称。",
        enterAtLeastOneValue: "请至少输入一个配置值（API 密钥、基础 URL 或模型名称）",
        copyFailed: "复制到剪贴板失败。请尝试下载。",
        warningPanelsFailed: "个面板生成失败，已跳过。仪表板包含",
        warningPanelsSuccess: "个成功生成的面板。",
        noLabelsFound: "未找到标签"
    },
    
    guide: {
        howToUse: "使用方法",
        importToGrafana: "导入到 Grafana",
        step1: "访问您应用程序的 /metrics 端点（例如：http://localhost:8080/metrics）",
        step2: "复制所有 Metrics 数据并粘贴到上方的文本框中",
        step3: "可选择提供您的 OpenAI API 密钥（如果服务器未配置）",
        step4: "点击「开始生成仪表盘」并等待 AI 分析您的 Metrics",
        step5: "下载生成的 JSON 并导入到 Grafana",
        import1: "在 Grafana 中，转到 仪表板 → 新建 → 导入",
        import2: "点击「上传仪表板 JSON 文件」或直接粘贴 JSON",
        import3: "选择您的 Prometheus 数据源",
        import4: "点击「导入」"
    },
    
    errors: {
        general: "错误",
        analysisFailed: "分析 Metrics 失败",
        generationFailed: "生成面板失败"
    },
    
    metricTypes: {
        counter: "counter",
        gauge: "gauge",
        histogram: "histogram",
        summary: "summary",
        untyped: "untyped",
        metrics: "个 Metrics"
    },
    
    visualizations: {
        timeseries: "时间序列",
        stat: "统计值",
        gauge: "仪表盘",
        table: "表格",
        bar: "柱状图",
        heatmap: "热力图",
        graph: "图表"
    },
    
    jsonPreview: {
        title: "仪表板 JSON 预览"
    }
};


