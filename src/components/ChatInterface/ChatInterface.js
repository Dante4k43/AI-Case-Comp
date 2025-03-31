import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import aiService from '../../services/aiService';
import { useLanguage } from '../../hooks/useTranslation';
import { useUser } from '../../contexts/UserContext';
import { useLocation } from '../../hooks/useLocation';

const ChatInterface = ({ onSwitchToMap, onHighlightSites }) => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { userPreferences } = useUser();
  const { userLocation } = useLocation();
  const { translate, language } = useLanguage();
  const messagesEndRef = useRef(null);
  
  // Add initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: translate('How can I help you find food resources today?'),
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [language]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle user message submission
  const handleSendMessage = async (text) => {
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsProcessing(true);
    
    try {
      // Process with AI service
      const response = await aiService.processUserQuery(
        text, 
        userLocation, 
        userPreferences
      );
      
      // Handle any actions from response
      if (response.actions.length > 0) {
        handleActions(response.actions);
      }
      
      // Highlight relevant sites on map if any
      if (response.relevantSites.length > 0) {
        onHighlightSites(response.relevantSites);
      }
      
      // Add assistant response to chat
      const assistantMessage = {
        id: `response-${Date.now()}`,
        text: response.response,
        sender: 'assistant',
        timestamp: new Date(),
        relevantSites: response.relevantSites
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: translate('Sorry, I had trouble processing your request. Please try again.'),
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle actions returned from AI
  const handleActions = (actions) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'SWITCH_TO_MAP':
          onSwitchToMap();
          break;
        case 'FILTER_MAP':
          // Apply filters to map
          break;
        case 'SHOW_DIRECTIONS':
          // Show directions to a site
          break;
        default:
          console.log("Unknown action:", action);
      }
    });
  };
  
  return (
    
      
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isProcessing={isProcessing} 
        placeholder={translate('Ask about food resources...')}
      />
    
  );
};

export default ChatInterface;