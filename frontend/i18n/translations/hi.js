export default {
    app: {
        title: "मेट्रिक्स से Grafana डैशबोर्ड",
        subtitle: "AI का उपयोग करके अपने Prometheus मेट्रिक्स से स्वचालित रूप से सुंदर Grafana डैशबोर्ड जेनरेट करें"
    },

    stepIndicator: {
        step1: "मेट्रिक्स पेस्ट करें",
        step2: "LLM कॉन्फ़िगर करें",
        step3: "मेट्रिक्स समीक्षा",
        step4: "पैनल चुनें",
        step5: "डाउनलोड"
    },

    landing: {
        heroSubtitle: "AI-संचालित स्वचालन के साथ सेकंडों में अपने Prometheus मेट्रिक्स को सुंदर, जानकारीपूर्ण Grafana डैशबोर्ड में बदलें",
        tryNow: "अभी आज़माएं",
        painPointsTitle: "मैन्युअल डैशबोर्ड बनाने से थक गए?",
        painPointsSubtitle: "शुरू से Grafana डैशबोर्ड बनाना समय लेने वाला और त्रुटि-प्रवण है",
        painPoint1Title: "घंटों का मैन्युअल काम",
        painPoint1Desc: "प्रत्येक डैशबोर्ड के लिए PromQL क्वेरी लिखना और पैनल कॉन्फ़िगर करना घंटों का थकाऊ काम लेता है",
        painPoint2Title: "जटिल PromQL सिंटैक्स",
        painPoint2Desc: "PromQL की सीखने की अवस्था तीव्र है, जिससे कुशल क्वेरी लिखना कठिन हो जाता है",
        painPoint3Title: "असंगत डैशबोर्ड",
        painPoint3Desc: "मैन्युअल निर्माण से असंगत लेआउट और महत्वपूर्ण मेट्रिक्स छूट जाते हैं",
        howItWorksTitle: "यह कैसे काम करता है",
        howItWorksSubtitle: "अपना परफेक्ट डैशबोर्ड जेनरेट करने के तीन सरल चरण",
        step1Title: "अपने मेट्रिक्स पेस्ट करें",
        step1Desc: "अपने /metrics एंडपॉइंट से मेट्रिक्स कॉपी करें और टूल में पेस्ट करें",
        step2Title: "AI विश्लेषण",
        step2Desc: "हमारा AI आपके मेट्रिक्स का विश्लेषण करता है और इष्टतम पैनल कॉन्फ़िगरेशन की योजना बनाता है",
        step3Title: "डाउनलोड और इम्पोर्ट",
        step3Desc: "जेनरेट किया गया JSON डाउनलोड करें और सीधे Grafana में इम्पोर्ट करें",
        ctaTitle: "घंटों का काम बचाने के लिए तैयार?",
        ctaSubtitle: "एक मिनट से कम में अपना पहला डैशबोर्ड जेनरेट करें"
    },

    steps: {
        step1: {
            title: "चरण 1: अपने मेट्रिक्स पेस्ट करें",
            description: "अपने /metrics एंडपॉइंट से मेट्रिक्स कॉपी करें और नीचे पेस्ट करें"
        },
        step2: {
            title: "चरण 2: अपना LLM कॉन्फ़िगर करें",
            description: ""
        },
        step3: {
            title: "मेट्रिक्स जानकारी",
            description: "AI विश्लेषण जारी रखने से पहले निकाली गई मेट्रिक्स जानकारी की समीक्षा करें"
        },
        step4: {
            title: "नियोजित पैनल",
            description: "AI ने आपके मेट्रिक्स का विश्लेषण किया और निम्नलिखित पैनलों की योजना बनाई। जेनरेट करने के लिए चुनें:"
        },
        stepResult: {
            title: "डैशबोर्ड सफलतापूर्वक जेनरेट हुआ!",
            description: ""
        }
    },
    
    buttons: {
        generate: "डैशबोर्ड जेनरेट करना शुरू करें",
        download: "डैशबोर्ड JSON डाउनलोड करें",
        downloadSuccess: "डाउनलोड हो गया!",
        copy: "क्लिपबोर्ड पर कॉपी करें",
        copySuccess: "कॉपी हो गया!",
        view: "JSON देखें",
        hideView: "JSON छुपाएं",
        retry: "पुनः प्रयास करें",
        selectAll: "सभी चुनें",
        deselectAll: "सभी अचयनित करें",
        generateSelected: "चयनित पैनल जेनरेट करें",
        startOver: "फिर से शुरू करें",
        nextAnalysis: "अगला: AI विश्लेषण",
        backToEdit: "संपादन पर वापस जाएं",
        manageConfigs: "कॉन्फ़िगरेशन प्रबंधित करें",
        saveConfig: "वर्तमान कॉन्फ़िगरेशन सहेजें",
        addNewConfig: "नया कॉन्फ़िगरेशन जोड़ें",
        save: "सहेजें",
        cancel: "रद्द करें",
        edit: "संपादित करें",
        delete: "हटाएं",
        use: "उपयोग करें"
    },
    
    labels: {
        apiKey: "API कुंजी:",
        apiKeyShort: "API कुंजी:",
        apiBaseURL: "API बेस URL:",
        baseURLShort: "बेस URL:",
        modelName: "मॉडल का नाम:",
        modelShort: "मॉडल:",
        optional: "(वैकल्पिक)",
        savedConfig: "सहेजा गया कॉन्फ़िगरेशन:",
        enterManually: "-- मैन्युअल रूप से दर्ज करें --",
        configName: "कॉन्फ़िगरेशन का नाम",
        metricsDetected: "मेट्रिक्स का पता चला",
        panelsSelected: "पैनल चयनित",
        of: "में से",
        notSet: "(सेट नहीं)",
        editConfiguration: "कॉन्फ़िगरेशन संपादित करें",
        deleteConfiguration: "कॉन्फ़िगरेशन हटाएं"
    },
    
    placeholders: {
        apiKey: "sk-... या JWT टोकन",
        apiBaseURL: "https://api.minimaxi.com/v1",
        modelName: "gpt-4-turbo-preview / MiniMax-M2",
        configName: "उदाहरण: OpenAI प्रोडक्शन, MiniMax टेस्ट",
        metricsInput: `# HELP http_requests_total HTTP अनुरोधों की कुल संख्या
# TYPE http_requests_total counter
http_requests_total{handler="/api/v1/user",method="GET",status_code="200"} 1027
...

अपने Prometheus मेट्रिक्स यहां पेस्ट करें`
    },
    
    progress: {
        analyzing: "मेट्रिक्स का विश्लेषण हो रहा है...",
        analyzingMessage: "मेट्रिक्स की संख्या के आधार पर इसमें 30-60 सेकंड लग सकते हैं",
        analyzingAI: "AI के साथ मेट्रिक्स का विश्लेषण हो रहा है...",
        analyzingAIMessage: "AI आपके मेट्रिक्स का विश्लेषण कर रहा है और डैशबोर्ड संरचना की योजना बना रहा है",
        generating: "पैनल जेनरेट हो रहे हैं...",
        generatingMessage: "विस्तृत PromQL क्वेरी के साथ चयनित पैनल बनाए जा रहे हैं...",
        generatingLonger: "विस्तृत PromQL क्वेरी के साथ पैनल जेनरेट हो रहे हैं... सटीकता के लिए इसमें थोड़ा अधिक समय लगता है।"
    },
    
    stats: {
        totalMetrics: "कुल मेट्रिक्स:",
        uniqueLabels: "अद्वितीय लेबल:",
        metricTypes: "मेट्रिक प्रकार:",
        panelsPlanned: "नियोजित पैनल",
        panelsCreated: "बनाए गए पैनल",
        generationTime: "जेनरेशन समय",
        modelUsed: "उपयोग किया गया मॉडल",
        samples: "नमूने"
    },
    
    sections: {
        metricsList: "मेट्रिक्स सूची",
        commonLabels: "सामान्य लेबल",
        metricTypesTitle: "मेट्रिक प्रकार",
        labels: "लेबल:",
        labelsTitle: "लेबल:",
        type: "प्रकार:",
        useMetrics: "मेट्रिक्स का उपयोग करें:",
        queryHints: "क्वेरी संकेत:",
        samples: "नमूने"
    },
    
    modals: {
        manageConfigs: "API कॉन्फ़िगरेशन प्रबंधित करें",
        editConfig: "कॉन्फ़िगरेशन संपादित करें",
        addConfig: "नया कॉन्फ़िगरेशन जोड़ें",
        noConfigsTitle: "अभी तक कोई सहेजा गया कॉन्फ़िगरेशन नहीं",
        noConfigsMessage: "अपना LLM API कॉन्फ़िगरेशन सहेजने के लिए नीचे \"नया कॉन्फ़िगरेशन जोड़ें\" पर क्लिक करें",
        deleteConfirm: "क्या आप वाकई हटाना चाहते हैं"
    },
    
    messages: {
        configSaved: "कॉन्फ़िगरेशन सफलतापूर्वक सहेजा गया!",
        errorOccurred: "एक अप्रत्याशित त्रुटि हुई",
        selectAtLeastOne: "कृपया जेनरेट करने के लिए कम से कम एक पैनल चुनें",
        pasteMetricsFirst: "कृपया जेनरेट करने से पहले अपना मेट्रिक्स टेक्स्ट पेस्ट करें",
        parseError: "मेट्रिक्स पार्स करने में विफल। कृपया अपना मेट्रिक्स प्रारूप जांचें।",
        enterConfigName: "कृपया एक कॉन्फ़िगरेशन नाम दर्ज करें।",
        enterAtLeastOneValue: "कृपया कम से कम एक कॉन्फ़िगरेशन मान दर्ज करें (API कुंजी, बेस URL, या मॉडल का नाम)",
        copyFailed: "क्लिपबोर्ड पर कॉपी करने में विफल। कृपया इसके बजाय डाउनलोड करने का प्रयास करें।",
        warningPanelsFailed: "पैनल जेनरेट करने में विफल रहे और छोड़ दिए गए। डैशबोर्ड में शामिल हैं",
        warningPanelsSuccess: "सफलतापूर्वक जेनरेट किए गए पैनल।",
        noLabelsFound: "कोई लेबल नहीं मिला"
    },
    
    guide: {
        howToUse: "उपयोग कैसे करें",
        importToGrafana: "Grafana में आयात करना",
        step1: "अपने एप्लिकेशन के /metrics एंडपॉइंट तक पहुंचें (उदा., http://localhost:8080/metrics)",
        step2: "सभी मेट्रिक्स टेक्स्ट कॉपी करें और ऊपर टेक्स्टएरिया में पेस्ट करें",
        step3: "वैकल्पिक रूप से अपनी OpenAI API कुंजी प्रदान करें (यदि सर्वर पर कॉन्फ़िगर नहीं है)",
        step4: "\"डैशबोर्ड जेनरेट करना शुरू करें\" पर क्लिक करें और AI द्वारा आपके मेट्रिक्स का विश्लेषण करने की प्रतीक्षा करें",
        step5: "जेनरेट की गई JSON डाउनलोड करें और Grafana में आयात करें",
        import1: "Grafana में, डैशबोर्ड → नया → आयात पर जाएं",
        import2: "\"डैशबोर्ड JSON फ़ाइल अपलोड करें\" पर क्लिक करें या JSON सीधे पेस्ट करें",
        import3: "अपना Prometheus डेटा स्रोत चुनें",
        import4: "\"आयात\" पर क्लिक करें"
    },
    
    errors: {
        general: "त्रुटि",
        analysisFailed: "मेट्रिक्स का विश्लेषण करने में विफल",
        generationFailed: "पैनल जेनरेट करने में विफल"
    },
    
    metricTypes: {
        counter: "counter",
        gauge: "gauge",
        histogram: "histogram",
        summary: "summary",
        untyped: "untyped",
        metrics: "मेट्रिक्स"
    },
    
    visualizations: {
        timeseries: "समय श्रृंखला",
        stat: "स्टेट",
        gauge: "गेज",
        table: "तालिका",
        bar: "बार चार्ट",
        heatmap: "हीटमैप",
        graph: "ग्राफ"
    },
    
    jsonPreview: {
        title: "डैशबोर्ड JSON पूर्वावलोकन"
    }
};


