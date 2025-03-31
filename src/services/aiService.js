// AI service for handling chat interactions

import { Configuration, OpenAIApi } from 'openai';
import { processQuery } from '../utils/queryUtils';
import { getRelevantContext } from './dataService';

// AI service for handling chat interactions
class AIService {
  constructor() {
    this.configuration = new Configuration({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  // Process user query and generate response
  async processUserQuery(query, userLocation, userPreferences) {
    try {
      // Preprocess the query
      const processedQuery = processQuery(query);
      
      // Get relevant context from data (RAG approach)
      const relevantContext = await getRelevantContext(processedQuery, userLocation);
      
      // Construct prompt with context
      const prompt = this.constructPrompt(processedQuery, relevantContext, userPreferences);
      
      // Call OpenAI API
      const response = await this.openai.createCompletion({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant for the Capital Area Food Bank..." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      return {
        response: response.data.choices[0].message.content,
        actions: this.extractActions(response.data.choices[0].message.content),
        relevantSites: this.extractRelevantSites(relevantContext, response.data.choices[0].message.content)
      };
    } catch (error) {
      console.error("Error processing query:", error);
      return {
        response: "I'm sorry, I encountered an error processing your request.",
        actions: [],
        relevantSites: []
      };
    }
  }
  
  // Helper methods
  constructPrompt(query, context, preferences) {
    // Construct appropriate prompt based on query and context
  }
  
  extractActions(response) {
    // Extract actions to perform (e.g., navigate to map, filter results)
  }
  
  extractRelevantSites(context, response) {
    // Extract relevant food distribution sites from context and response
  }
}

export default new AIService();
