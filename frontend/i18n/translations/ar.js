export default {
    app: {
        title: "المقاييس إلى لوحة معلومات Grafana",
        subtitle: "قم بإنشاء لوحات معلومات Grafana جميلة تلقائيًا من مقاييس Prometheus الخاصة بك باستخدام الذكاء الاصطناعي"
    },

    stepIndicator: {
        step1: "لصق المقاييس",
        step2: "تكوين LLM",
        step3: "مراجعة المقاييس",
        step4: "اختيار اللوحات",
        step5: "تحميل"
    },

    landing: {
        heroSubtitle: "حوّل مقاييس Prometheus الخاصة بك إلى لوحات معلومات Grafana جميلة ومفيدة في ثوانٍ باستخدام الأتمتة المدعومة بالذكاء الاصطناعي",
        tryNow: "جربه الآن",
        painPointsTitle: "هل سئمت من إنشاء لوحات المعلومات يدويًا؟",
        painPointsSubtitle: "إنشاء لوحات معلومات Grafana من الصفر يستغرق وقتًا طويلاً وعرضة للأخطاء",
        painPoint1Title: "ساعات من العمل اليدوي",
        painPoint1Desc: "كتابة استعلامات PromQL وتكوين اللوحات تستغرق ساعات من العمل الممل لكل لوحة معلومات",
        painPoint2Title: "بناء جملة PromQL المعقد",
        painPoint2Desc: "PromQL لديه منحنى تعلم حاد، مما يجعل من الصعب كتابة استعلامات فعالة",
        painPoint3Title: "لوحات معلومات غير متسقة",
        painPoint3Desc: "الإنشاء اليدوي يؤدي إلى تخطيطات غير متسقة ومقاييس مهمة مفقودة",
        howItWorksTitle: "كيف يعمل",
        howItWorksSubtitle: "ثلاث خطوات بسيطة لإنشاء لوحة المعلومات المثالية",
        step1Title: "الصق مقاييسك",
        step1Desc: "انسخ المقاييس من نقطة النهاية /metrics والصقها في الأداة",
        step2Title: "تحليل الذكاء الاصطناعي",
        step2Desc: "يحلل الذكاء الاصطناعي مقاييسك ويخطط لتكوينات اللوحات المثلى",
        step3Title: "تحميل واستيراد",
        step3Desc: "قم بتحميل JSON المُنشأ واستيراده مباشرة إلى Grafana",
        ctaTitle: "هل أنت مستعد لتوفير ساعات من العمل؟",
        ctaSubtitle: "أنشئ لوحة المعلومات الأولى في أقل من دقيقة"
    },

    steps: {
        step1: {
            title: "الخطوة 1: الصق مقاييسك",
            description: "انسخ المقاييس من نقطة النهاية /metrics والصقها أدناه"
        },
        step2: {
            title: "الخطوة 2: قم بتكوين LLM الخاص بك",
            description: ""
        },
        step3: {
            title: "معلومات المقاييس",
            description: "راجع معلومات المقاييس المستخرجة قبل المتابعة إلى تحليل الذكاء الاصطناعي"
        },
        step4: {
            title: "اللوحات المخططة",
            description: "قام الذكاء الاصطناعي بتحليل مقاييسك وخطط للوحات التالية. حدد أيها تريد إنشاء:"
        },
        stepResult: {
            title: "تم إنشاء لوحة المعلومات بنجاح!",
            description: ""
        }
    },
    
    buttons: {
        generate: "بدء إنشاء لوحة المعلومات",
        download: "تحميل JSON لوحة المعلومات",
        downloadSuccess: "تم التحميل!",
        copy: "نسخ إلى الحافظة",
        copySuccess: "تم النسخ!",
        view: "عرض JSON",
        hideView: "إخفاء JSON",
        retry: "حاول مرة أخرى",
        selectAll: "تحديد الكل",
        deselectAll: "إلغاء تحديد الكل",
        generateSelected: "إنشاء اللوحات المحددة",
        startOver: "البدء من جديد",
        nextAnalysis: "التالي: تحليل الذكاء الاصطناعي",
        backToEdit: "العودة إلى التحرير",
        manageConfigs: "إدارة التكوينات",
        saveConfig: "حفظ التكوين الحالي",
        addNewConfig: "إضافة تكوين جديد",
        save: "حفظ",
        cancel: "إلغاء",
        edit: "تحرير",
        delete: "حذف",
        use: "استخدام"
    },
    
    labels: {
        apiKey: "مفتاح API:",
        apiKeyShort: "مفتاح API:",
        apiBaseURL: "عنوان URL الأساسي لـ API:",
        baseURLShort: "URL الأساسي:",
        modelName: "اسم النموذج:",
        modelShort: "النموذج:",
        optional: "(اختياري)",
        savedConfig: "التكوين المحفوظ:",
        enterManually: "-- أدخل يدويًا --",
        configName: "اسم التكوين",
        metricsDetected: "المقاييس المكتشفة",
        panelsSelected: "اللوحات المحددة",
        of: "من",
        notSet: "(غير محدد)",
        editConfiguration: "تحرير التكوين",
        deleteConfiguration: "حذف التكوين"
    },
    
    placeholders: {
        apiKey: "sk-... أو رمز JWT",
        apiBaseURL: "https://api.minimaxi.com/v1",
        modelName: "gpt-4-turbo-preview / MiniMax-M2",
        configName: "على سبيل المثال، OpenAI الإنتاج، MiniMax الاختبار",
        metricsInput: `# HELP http_requests_total إجمالي عدد طلبات HTTP
# TYPE http_requests_total counter
http_requests_total{handler="/api/v1/user",method="GET",status_code="200"} 1027
...

الصق مقاييس Prometheus الخاصة بك هنا`
    },
    
    progress: {
        analyzing: "جارٍ تحليل المقاييس...",
        analyzingMessage: "قد يستغرق هذا 30-60 ثانية حسب عدد المقاييس",
        analyzingAI: "جارٍ تحليل المقاييس باستخدام الذكاء الاصطناعي...",
        analyzingAIMessage: "الذكاء الاصطناعي يقوم بتحليل مقاييسك وتخطيط بنية لوحة المعلومات",
        generating: "جارٍ إنشاء اللوحات...",
        generatingMessage: "جارٍ إنشاء اللوحات المحددة مع استعلامات PromQL التفصيلية...",
        generatingLonger: "جارٍ إنشاء اللوحات مع استعلامات PromQL التفصيلية... يستغرق هذا وقتًا أطول قليلاً للدقة."
    },
    
    stats: {
        totalMetrics: "إجمالي المقاييس:",
        uniqueLabels: "التسميات الفريدة:",
        metricTypes: "أنواع المقاييس:",
        panelsPlanned: "اللوحات المخططة",
        panelsCreated: "اللوحات المنشأة",
        generationTime: "وقت الإنشاء",
        modelUsed: "النموذج المستخدم",
        samples: "عينات"
    },
    
    sections: {
        metricsList: "قائمة المقاييس",
        commonLabels: "التسميات الشائعة",
        metricTypesTitle: "أنواع المقاييس",
        labels: "التسميات:",
        labelsTitle: "التسميات:",
        type: "النوع:",
        useMetrics: "استخدام المقاييس:",
        queryHints: "تلميحات الاستعلام:",
        samples: "عينات"
    },
    
    modals: {
        manageConfigs: "إدارة تكوينات API",
        editConfig: "تحرير التكوين",
        addConfig: "إضافة تكوين جديد",
        noConfigsTitle: "لا توجد تكوينات محفوظة حتى الآن",
        noConfigsMessage: "انقر فوق \"إضافة تكوين جديد\" أدناه لحفظ تكوين LLM API الخاص بك",
        deleteConfirm: "هل أنت متأكد أنك تريد حذف"
    },
    
    messages: {
        configSaved: "تم حفظ التكوين بنجاح!",
        errorOccurred: "حدث خطأ غير متوقع",
        selectAtLeastOne: "يرجى تحديد لوحة واحدة على الأقل للإنشاء",
        pasteMetricsFirst: "يرجى لصق نص المقاييس الخاص بك قبل الإنشاء",
        parseError: "فشل تحليل المقاييس. يرجى التحقق من تنسيق المقاييس الخاصة بك.",
        enterConfigName: "يرجى إدخال اسم التكوين.",
        enterAtLeastOneValue: "يرجى إدخال قيمة تكوين واحدة على الأقل (مفتاح API أو عنوان URL الأساسي أو اسم النموذج)",
        copyFailed: "فشل النسخ إلى الحافظة. يرجى محاولة التحميل بدلاً من ذلك.",
        warningPanelsFailed: "فشل إنشاء اللوحات وتم تخطيها. تحتوي لوحة المعلومات على",
        warningPanelsSuccess: "اللوحات التي تم إنشاؤها بنجاح.",
        noLabelsFound: "لم يتم العثور على تسميات"
    },
    
    guide: {
        howToUse: "كيفية الاستخدام",
        importToGrafana: "الاستيراد إلى Grafana",
        step1: "قم بالوصول إلى نقطة النهاية /metrics لتطبيقك (على سبيل المثال، http://localhost:8080/metrics)",
        step2: "انسخ كل نص المقاييس والصقه في منطقة النص أعلاه",
        step3: "اختياريًا قدم مفتاح OpenAI API الخاص بك (إذا لم يتم تكوينه على الخادم)",
        step4: "انقر فوق \"بدء إنشاء لوحة المعلومات\" وانتظر حتى يقوم الذكاء الاصطناعي بتحليل مقاييسك",
        step5: "قم بتنزيل JSON الذي تم إنشاؤه واستورده إلى Grafana",
        import1: "في Grafana، انتقل إلى لوحات المعلومات → جديد → استيراد",
        import2: "انقر فوق \"تحميل ملف JSON لوحة المعلومات\" أو الصق JSON مباشرة",
        import3: "حدد مصدر بيانات Prometheus الخاص بك",
        import4: "انقر فوق \"استيراد\""
    },
    
    errors: {
        general: "خطأ",
        analysisFailed: "فشل تحليل المقاييس",
        generationFailed: "فشل إنشاء اللوحات"
    },
    
    metricTypes: {
        counter: "counter",
        gauge: "gauge",
        histogram: "histogram",
        summary: "summary",
        untyped: "untyped",
        metrics: "المقاييس"
    },
    
    visualizations: {
        timeseries: "سلسلة زمنية",
        stat: "إحصائية",
        gauge: "مقياس",
        table: "جدول",
        bar: "مخطط شريطي",
        heatmap: "خريطة حرارية",
        graph: "رسم بياني"
    },
    
    jsonPreview: {
        title: "معاينة JSON لوحة المعلومات"
    }
};


