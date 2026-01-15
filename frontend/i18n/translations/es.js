export default {
    app: {
        title: "Metricas a Dashboard de Grafana",
        subtitle: "Genera automaticamente hermosos dashboards de Grafana a partir de tus metricas de Prometheus usando IA"
    },

    stepIndicator: {
        step1: "Pegar Metricas",
        step2: "Configurar LLM",
        step3: "Revisar Metricas",
        step4: "Seleccionar Paneles",
        step5: "Descargar"
    },

    landing: {
        heroSubtitle: "Transforma tus métricas de Prometheus en hermosos e informativos dashboards de Grafana en segundos con automatización impulsada por IA",
        tryNow: "Pruébalo Ahora",
        painPointsTitle: "¿Cansado de Crear Dashboards Manualmente?",
        painPointsSubtitle: "Crear dashboards de Grafana desde cero consume tiempo y es propenso a errores",
        painPoint1Title: "Horas de Trabajo Manual",
        painPoint1Desc: "Escribir consultas PromQL y configurar paneles toma horas de trabajo tedioso para cada dashboard",
        painPoint2Title: "Sintaxis PromQL Compleja",
        painPoint2Desc: "PromQL tiene una curva de aprendizaje pronunciada, dificultando escribir consultas eficientes",
        painPoint3Title: "Dashboards Inconsistentes",
        painPoint3Desc: "La creación manual lleva a layouts inconsistentes y métricas importantes faltantes",
        howItWorksTitle: "Cómo Funciona",
        howItWorksSubtitle: "Tres simples pasos para generar tu dashboard perfecto",
        step1Title: "Pega tus Métricas",
        step1Desc: "Copia métricas de tu endpoint /metrics y pégalas en la herramienta",
        step2Title: "Análisis de IA",
        step2Desc: "Nuestra IA analiza tus métricas y planifica configuraciones óptimas de paneles",
        step3Title: "Descarga e Importa",
        step3Desc: "Descarga el JSON generado e impórtalo directamente en Grafana",
        ctaTitle: "¿Listo para Ahorrar Horas de Trabajo?",
        ctaSubtitle: "Genera tu primer dashboard en menos de un minuto"
    },

    steps: {
        step1: {
            title: "Paso 1: Pega tus Métricas",
            description: "Copia las métricas de tu endpoint /metrics y pégalas a continuación"
        },
        step2: {
            title: "Paso 2: Configura tu LLM",
            description: ""
        },
        step3: {
            title: "Información de Métricas",
            description: "Revisa la información de métricas extraída antes de continuar con el análisis de IA"
        },
        step4: {
            title: "Paneles Planificados",
            description: "La IA analizó tus métricas y planificó los siguientes paneles. Selecciona cuáles generar:"
        },
        stepResult: {
            title: "¡Dashboard Generado con Éxito!",
            description: ""
        }
    },
    
    buttons: {
        generate: "Comenzar a Generar Dashboard",
        download: "Descargar JSON del Dashboard",
        downloadSuccess: "¡Descargado!",
        copy: "Copiar al Portapapeles",
        copySuccess: "¡Copiado!",
        view: "Ver JSON",
        hideView: "Ocultar JSON",
        retry: "Intentar de Nuevo",
        selectAll: "Seleccionar Todo",
        deselectAll: "Deseleccionar Todo",
        generateSelected: "Generar Paneles Seleccionados",
        startOver: "Empezar de Nuevo",
        nextAnalysis: "Siguiente: Análisis de IA",
        backToEdit: "Volver a Editar",
        manageConfigs: "Administrar Configuraciones",
        saveConfig: "Guardar Configuración Actual",
        addNewConfig: "Agregar Nueva Configuración",
        save: "Guardar",
        cancel: "Cancelar",
        edit: "Editar",
        delete: "Eliminar",
        use: "Usar"
    },
    
    labels: {
        apiKey: "Clave API:",
        apiKeyShort: "Clave API:",
        apiBaseURL: "URL Base de la API:",
        baseURLShort: "URL Base:",
        modelName: "Nombre del Modelo:",
        modelShort: "Modelo:",
        optional: "(opcional)",
        savedConfig: "Configuracion Guardada:",
        enterManually: "-- Ingresar Manualmente --",
        configName: "Nombre de la Configuracion",
        metricsDetected: "metricas detectadas",
        panelsSelected: "paneles seleccionados",
        of: "de",
        notSet: "(no establecido)",
        editConfiguration: "Editar configuracion",
        deleteConfiguration: "Eliminar configuracion"
    },
    
    placeholders: {
        apiKey: "sk-... o token JWT",
        apiBaseURL: "https://api.minimaxi.com/v1",
        modelName: "gpt-4-turbo-preview / MiniMax-M2",
        configName: "ej., Producción OpenAI, Prueba MiniMax",
        metricsInput: `# HELP http_requests_total Número total de solicitudes HTTP
# TYPE http_requests_total counter
http_requests_total{handler="/api/v1/user",method="GET",status_code="200"} 1027
...

Pega aquí tus métricas de Prometheus`
    },
    
    progress: {
        analyzing: "Analizando métricas...",
        analyzingMessage: "Esto puede tardar 30-60 segundos dependiendo del número de métricas",
        analyzingAI: "Analizando métricas con IA...",
        analyzingAIMessage: "La IA está analizando tus métricas y planificando la estructura del dashboard",
        generating: "Generando paneles...",
        generatingMessage: "Creando paneles seleccionados con consultas PromQL detalladas...",
        generatingLonger: "Generando paneles con consultas PromQL detalladas... Esto toma un poco más de tiempo para mayor precisión."
    },
    
    stats: {
        totalMetrics: "Métricas Totales:",
        uniqueLabels: "Etiquetas Únicas:",
        metricTypes: "Tipos de Métricas:",
        panelsPlanned: "Paneles Planificados",
        panelsCreated: "Paneles Creados",
        generationTime: "Tiempo de Generación",
        modelUsed: "Modelo Usado",
        samples: "muestras"
    },
    
    sections: {
        metricsList: "Lista de Metricas",
        commonLabels: "Etiquetas Comunes",
        metricTypesTitle: "Tipos de Metricas",
        labels: "Etiquetas:",
        labelsTitle: "Etiquetas:",
        type: "Tipo:",
        useMetrics: "Usar Metricas:",
        queryHints: "Sugerencias de Consulta:",
        samples: "muestras"
    },
    
    modals: {
        manageConfigs: "Administrar Configuraciones de API",
        editConfig: "Editar Configuración",
        addConfig: "Agregar Nueva Configuración",
        noConfigsTitle: "Aún no hay configuraciones guardadas",
        noConfigsMessage: "Haz clic en \"Agregar Nueva Configuración\" a continuación para guardar tu configuración de API LLM",
        deleteConfirm: "¿Estás seguro de que quieres eliminar"
    },
    
    messages: {
        configSaved: "¡Configuración guardada con éxito!",
        errorOccurred: "Ocurrió un error inesperado",
        selectAtLeastOne: "Por favor selecciona al menos un panel para generar",
        pasteMetricsFirst: "Por favor pega tu texto de métricas antes de generar",
        parseError: "Error al analizar métricas. Por favor verifica el formato de tus métricas.",
        enterConfigName: "Por favor ingresa un nombre de configuración.",
        enterAtLeastOneValue: "Por favor ingresa al menos un valor de configuración (Clave API, URL Base o Nombre del Modelo)",
        copyFailed: "Error al copiar al portapapeles. Por favor intenta descargarlo en su lugar.",
        warningPanelsFailed: "paneles no se pudieron generar y fueron omitidos. El dashboard contiene",
        warningPanelsSuccess: "paneles generados con éxito.",
        noLabelsFound: "No se encontraron etiquetas"
    },
    
    guide: {
        howToUse: "Cómo Usar",
        importToGrafana: "Importar a Grafana",
        step1: "Accede al endpoint /metrics de tu aplicación (ej., http://localhost:8080/metrics)",
        step2: "Copia todo el texto de métricas y pégalo en el área de texto de arriba",
        step3: "Opcionalmente proporciona tu clave API de OpenAI (si no está configurada en el servidor)",
        step4: "Haz clic en \"Comenzar a Generar Dashboard\" y espera a que la IA analice tus métricas",
        step5: "Descarga el JSON generado e impórtalo en Grafana",
        import1: "En Grafana, ve a Dashboards → Nuevo → Importar",
        import2: "Haz clic en \"Subir archivo JSON del dashboard\" o pega el JSON directamente",
        import3: "Selecciona tu fuente de datos de Prometheus",
        import4: "Haz clic en \"Importar\""
    },
    
    errors: {
        general: "Error",
        analysisFailed: "Error al analizar métricas",
        generationFailed: "Error al generar paneles"
    },
    
    metricTypes: {
        counter: "counter",
        gauge: "gauge",
        histogram: "histogram",
        summary: "summary",
        untyped: "untyped",
        metrics: "métricas"
    },
    
    visualizations: {
        timeseries: "Serie Temporal",
        stat: "Estadística",
        gauge: "Medidor",
        table: "Tabla",
        bar: "Gráfico de Barras",
        heatmap: "Mapa de Calor",
        graph: "Gráfico"
    },
    
    jsonPreview: {
        title: "Vista Previa del JSON del Dashboard"
    }
};


