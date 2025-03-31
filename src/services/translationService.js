// Simple translation service for English and Spanish
const translations = {
    en: {
      'How can I help you find food resources today?': 'How can I help you find food resources today?',
      'Ask about food resources...': 'Ask about food resources...',
      'Sorry, I had trouble processing your request. Please try again.': 'Sorry, I had trouble processing your request. Please try again.',
      'Loading resources...': 'Loading resources...',
      'Chat': 'Chat',
      'Map': 'Map',
      // Add more translations as needed
    },
    es: {
      'How can I help you find food resources today?': '¿Cómo puedo ayudarte a encontrar recursos alimentarios hoy?',
      'Ask about food resources...': 'Pregunta sobre recursos alimentarios...',
      'Sorry, I had trouble processing your request. Please try again.': 'Lo siento, tuve problemas procesando tu solicitud. Por favor, intenta de nuevo.',
      'Loading resources...': 'Cargando recursos...',
      'Chat': 'Chat',
      'Map': 'Mapa',
      // Add more translations as needed
    }
  };
  
  class TranslationService {
    constructor() {
      this.currentLanguage = 'en';
    }
    
    // Set current language
    setLanguage(language) {
      if (['en', 'es'].includes(language)) {
        this.currentLanguage = language;
      } else {
        console.warn(`Unsupported language: ${language}. Defaulting to English.`);
        this.currentLanguage = 'en';
      }
    }
    
    // Get current language
    getLanguage() {
      return this.currentLanguage;
    }
    
    // Translate text
    translate(text) {
      const langDict = translations[this.currentLanguage];
      return langDict[text] || text; // Fallback to original text if translation not found
    }
    
    // Detect language from text (simple implementation)
    detectLanguage(text) {
      // Spanish indicators (common Spanish words and characters)
      const spanishIndicators = ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'que', 'cómo', 'dónde', 'cuándo', 'ayuda', 'comida', 'gracias'];
      
      const words = text.toLowerCase().split(/\s+/);
      const spanishWordCount = words.filter(word => spanishIndicators.includes(word.replace(/[,.?!;:]/g, ''))).length;
      
      // Simple threshold: if more than 15% of words are Spanish indicators, assume Spanish
      return (spanishWordCount / words.length >= 0.15) ? 'es' : 'en';
    }
  }
  
  export default new TranslationService();