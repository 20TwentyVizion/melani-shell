/**
 * Conversation Analyzer for Melani OS
 * 
 * This utility analyzes conversations to extract insights such as:
 * - Topics
 * - Sentiment
 * - Keywords
 * - User preferences
 * - Patterns
 */

import { ChatMessage } from './types';

/**
 * Results from conversation analysis
 */
export interface ConversationInsights {
  topic?: string;
  sentiment?: string;
  keywords: string[];
  possiblePreferences: Array<{
    category: string;
    key: string;
    value: any;
    confidence: number;
  }>;
}

/**
 * Basic keyword extraction based on term frequency
 */
function extractKeywords(text: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 
    'should', 'can', 'could', 'may', 'might', 'must', 'shall', 'to', 
    'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'from', 
    'this', 'that', 'these', 'those', 'it', 'they', 'them', 'their'
  ]);
  
  // Tokenize and clean text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with space
    .split(/\s+/)              // Split on whitespace
    .filter(word => 
      word.length > 2 &&       // Only words longer than 2 chars
      !stopWords.has(word) &&  // Remove stop words
      !/^\d+$/.test(word)      // Remove pure numbers
    );
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Convert to array, sort by frequency, and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
}

/**
 * Simple sentiment analysis using basic word lists
 */
function analyzeSentiment(text: string): string {
  const positiveWords = new Set([
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'awesome', 
    'fantastic', 'happy', 'glad', 'like', 'love', 'enjoy', 'thanks', 
    'thank', 'appreciate', 'helpful', 'perfect', 'yes', 'please'
  ]);
  
  const negativeWords = new Set([
    'bad', 'terrible', 'awful', 'horrible', 'poor', 'hate', 'dislike', 
    'annoying', 'disappointed', 'sorry', 'worst', 'wrong', 'no', 'not'
  ]);
  
  // Tokenize text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.has(word)) positiveCount++;
    if (negativeWords.has(word)) negativeCount++;
  });
  
  // Determine sentiment
  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

/**
 * Try to determine the main topic of conversation
 */
function extractTopic(messages: ChatMessage[]): string | undefined {
  if (messages.length === 0) return undefined;
  
  // Get the first few user messages as they often set the topic
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .slice(-3)
    .map(msg => msg.content);
  
  if (userMessages.length === 0) return undefined;
  
  // Extract keywords from all user messages combined
  const combinedText = userMessages.join(' ');
  const keywords = extractKeywords(combinedText);
  
  // If we have keywords, use the most frequent as the topic
  if (keywords.length > 0) {
    return keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1);
  }
  
  return undefined;
}

/**
 * Extract potential user preferences from the conversation
 */
function extractPossiblePreferences(messages: ChatMessage[]): Array<{
  category: string;
  key: string;
  value: any;
  confidence: number;
}> {
  const preferences: Array<{
    category: string;
    key: string;
    value: any;
    confidence: number;
  }> = [];
  
  // Look for specific preference patterns
  messages.forEach(msg => {
    if (msg.role !== 'user') return;
    const text = msg.content.toLowerCase();
    
    // Check for color preferences
    if (text.includes('favorite color') || text.includes('prefer color')) {
      const colorRegex = /\b(red|blue|green|yellow|black|white|purple|pink|orange)\b/i;
      const match = text.match(colorRegex);
      
      if (match) {
        preferences.push({
          category: 'appearance',
          key: 'favoriteColor',
          value: match[0].toLowerCase(),
          confidence: 0.8
        });
      }
    }
    
    // Check for theme preferences
    if (text.includes('dark mode') || text.includes('light mode')) {
      const isDarkMode = text.includes('dark mode') && !text.includes('don\'t like dark mode');
      
      preferences.push({
        category: 'appearance',
        key: 'theme',
        value: isDarkMode ? 'dark' : 'light',
        confidence: 0.7
      });
    }
    
    // Check for app preferences
    if (text.includes('favorite app') || text.includes('prefer using')) {
      const appRegex = /\b(browser|notes|calendar|editor|terminal|music|video)\b/i;
      const match = text.match(appRegex);
      
      if (match) {
        preferences.push({
          category: 'apps',
          key: 'favorite',
          value: match[0].toLowerCase(),
          confidence: 0.6
        });
      }
    }
  });
  
  return preferences;
}

/**
 * Analyze a conversation to extract insights
 */
export function analyzeConversation(messages: ChatMessage[]): ConversationInsights {
  if (messages.length === 0) {
    return {
      topic: undefined,
      sentiment: undefined,
      keywords: [],
      possiblePreferences: []
    };
  }
  
  // Get recent user messages for analysis
  const recentUserMessages = messages
    .filter(msg => msg.role === 'user')
    .slice(-5);
  
  if (recentUserMessages.length === 0) {
    return {
      topic: undefined,
      sentiment: undefined,
      keywords: [],
      possiblePreferences: []
    };
  }
  
  // Combine recent user messages
  const combinedText = recentUserMessages
    .map(msg => msg.content)
    .join(' ');
  
  // Extract keywords
  const keywords = extractKeywords(combinedText);
  
  // Analyze sentiment
  const sentiment = analyzeSentiment(combinedText);
  
  // Extract topic
  const topic = extractTopic(messages);
  
  // Extract possible preferences
  const possiblePreferences = extractPossiblePreferences(messages);
  
  return {
    topic,
    sentiment,
    keywords,
    possiblePreferences
  };
}
