// Lightweight i18n implementation
const STORAGE_KEY = 'grafana_dashboard_language';
const DEFAULT_LANGUAGE = 'en';

const SUPPORTED_LANGUAGES = [
    { code: 'zh-CN', name: '中文', dir: 'ltr' },
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
    { code: 'es', name: 'Español', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' }
];

let currentLanguage = DEFAULT_LANGUAGE;
let translations = {};

// Get nested property from object using dot notation
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Detect browser language
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Check for exact match
    if (SUPPORTED_LANGUAGES.find(l => l.code === browserLang)) {
        return browserLang;
    }
    
    // Check for language prefix match (e.g., 'zh' matches 'zh-CN')
    const langPrefix = browserLang.split('-')[0];
    const matched = SUPPORTED_LANGUAGES.find(l => l.code.startsWith(langPrefix));
    
    return matched ? matched.code : DEFAULT_LANGUAGE;
}

// Load language file dynamically
export async function loadLanguage(lang) {
    try {
        const module = await import(`./translations/${lang}.js`);
        translations = module.default;
        currentLanguage = lang;
        
        // Update document direction for RTL languages
        const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
        document.documentElement.dir = langInfo?.dir || 'ltr';
        document.documentElement.lang = lang;
        
        return translations;
    } catch (error) {
        console.error(`Failed to load language: ${lang}`, error);
        
        // Fallback to English
        if (lang !== DEFAULT_LANGUAGE) {
            return loadLanguage(DEFAULT_LANGUAGE);
        }
        
        throw error;
    }
}

// Translate function
export function t(key, fallback = '') {
    const value = getNestedValue(translations, key);
    return value !== undefined ? value : (fallback || key);
}

// Get current language
export function getCurrentLanguage() {
    return currentLanguage;
}

// Set language and save preference
export async function setLanguage(lang) {
    try {
        await loadLanguage(lang);
        localStorage.setItem(STORAGE_KEY, lang);
        return true;
    } catch (error) {
        console.error('Failed to set language:', error);
        return false;
    }
}

// Get supported languages
export function getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
}

// Initialize i18n
export async function initI18n() {
    // Priority: localStorage > browser language > default
    const savedLang = localStorage.getItem(STORAGE_KEY);
    const lang = savedLang || detectBrowserLanguage();
    
    await loadLanguage(lang);
    return lang;
}

// Apply translations to DOM elements
export function applyTranslations() {
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // Don't override actual input values, only placeholders via data-i18n-placeholder
        } else {
            // Preserve emoji/icons at the start if they exist
            const text = element.textContent.trim();
            const emojiMatch = text.match(/^([\u{1F300}-\u{1F9FF}]|\p{Emoji_Presentation})+\s*/u);
            
            if (emojiMatch) {
                element.textContent = emojiMatch[0] + translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
}


