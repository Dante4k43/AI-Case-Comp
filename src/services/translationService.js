// src/services/translationService.js

const translations = {
  en: {
    'How can I help you find food resources today?': 'How can I help you find food resources today?',
    'Ask about food resources...': 'Ask about food resources...',
    'Sorry, I had trouble processing your request. Please try again.': 'Sorry, I had trouble processing your request. Please try again.',
    'Loading resources...': 'Loading resources...',
    'Chat': 'Chat',
    'Map': 'Map',
  },
  es: {
    'How can I help you find food resources today?': '¿Cómo puedo ayudarte a encontrar recursos alimentarios hoy?',
    'Ask about food resources...': 'Pregunta sobre recursos alimentarios...',
    'Sorry, I had trouble processing your request. Please try again.': 'Lo siento, tuve problemas procesando tu solicitud. Por favor, intenta de nuevo.',
    'Loading resources...': 'Cargando recursos...',
    'Chat': 'Chat',
    'Map': 'Mapa',
  }
};

class TranslationService {
  constructor() {
    this.currentLanguage = 'en';
  }

  setLanguage(language) {
    if (['en', 'es'].includes(language)) {
      this.currentLanguage = language;
    } else {
      console.warn(`Unsupported language: ${language}. Defaulting to English.`);
      this.currentLanguage = 'en';
    }
  }

  getLanguage() {
    return this.currentLanguage;
  }

  detectLanguage(text) {
    const spanishIndicators = ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'que', 'cómo', 'dónde', 'cuándo', 'ayuda', 'comida', 'gracias'];
    const words = text.toLowerCase().split(/\s+/);
    const count = words.filter(word => spanishIndicators.includes(word.replace(/[,.?!;:]/g, ''))).length;
    return (count / words.length >= 0.15) ? 'es' : 'en';
  }

  translate(text) {
    const dict = translations[this.currentLanguage] || {};
    return dict[text] || text;
  }

  // Simulated English translator
  translateToEnglish(text) {
    return text; // You could use a real API like DeepL or Google Translate in production
  }

  // Translate English bot response back to user language
  translateToUser(text) {
    if (this.currentLanguage === 'es') {
      return `🗣️ (EN ➜ ES translation coming soon...) ${text}`;
    }
    return text;
  }
}

module.exports = new TranslationService();