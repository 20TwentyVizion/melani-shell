/**
 * Memory Context Provider for Melani OS
 * 
 * This module integrates the memory system with the AI assistant,
 * providing contextual information to enhance AI responses.
 */

import { ChatMessage, MemoryType } from './types';
import { useMemoryStore } from './memoryManager';
import { analyzeConversation } from './conversationAnalyzer';

// Get a typed reference to the store for use in non-React contexts
const getMemoryStore = () => useMemoryStore.getState();

/**
 * Context data to enhance AI responses
 */
export interface MemoryEnhancedContext {
  timeContext: {
    timeOfDay: string;
    dayOfWeek: string;
    date: string;
    isWeekend: boolean;
  };
  appContext: {
    activeApps: string[];
    recentlyUsed: string[];
  };
  userContext: {
    preferences: Record<string, any>;
    patterns: string[];
  };
  conversationContext: {
    topic?: string;
    sentiment?: string;
    keywords: string[];
    messageCount: number;
  };
  systemResources: {
    cpuUsage?: number;
    memoryUsage?: number;
    batteryLevel?: number;
  };
}

/**
 * Generate a system prompt enhancement based on memory context
 */
export function generateSystemPromptEnhancement(): string {
  const memoryStore = getMemoryStore();
  const { 
    conversationMemory, 
    sessionMemory, 
    persistentMemories 
  } = memoryStore;
  
  // Get persistent memory if available
  const persistentMemory = persistentMemories.length > 0 ? persistentMemories[0] : null;
  
  // Extract user preferences
  const userPreferences: string[] = [];
  if (persistentMemory && persistentMemory.preferences.length > 0) {
    persistentMemory.preferences.forEach(pref => {
      if (pref.confidence > 0.7) {
        userPreferences.push(`${pref.category}/${pref.key}: ${pref.value}`);
      }
    });
  }
  
  // Extract usage patterns
  const patterns: string[] = [];
  if (persistentMemory && persistentMemory.frequentPatterns.length > 0) {
    persistentMemory.frequentPatterns
      .filter(pattern => pattern.confidence > 0.7)
      .slice(0, 3)
      .forEach(pattern => {
        patterns.push(pattern.description);
      });
  }
  
  // Generate time context
  const { timeOfDayContext } = sessionMemory;
  const now = new Date();
  const timeContext = `It is currently ${timeOfDayContext.timeOfDay} (${now.toLocaleTimeString()}) on ${now.toLocaleDateString()}, which is a ${timeOfDayContext.weekend ? 'weekend' : 'weekday'}.`;
  
  // Generate app context
  const activeApps = sessionMemory.activeApps
    .filter(app => app.timeClosed === undefined)
    .map(app => app.appName);
    
  const appContext = activeApps.length > 0 
    ? `User is currently using: ${activeApps.join(', ')}.` 
    : '';
  
  // Analyze current conversation
  const conversationInsights = analyzeConversation(conversationMemory.messages);
  const conversationContext = conversationInsights.topic 
    ? `The current conversation is about: ${conversationInsights.topic}.` 
    : '';
  
  const sentimentContext = conversationInsights.sentiment && conversationInsights.sentiment !== 'neutral'
    ? `The user's sentiment appears to be ${conversationInsights.sentiment}.`
    : '';
  
  // Combine all context sections
  const contextSections = [
    timeContext,
    appContext,
    conversationContext,
    sentimentContext
  ].filter(section => section.length > 0);
  
  // Add preferences if available
  if (userPreferences.length > 0) {
    contextSections.push(`User preferences: ${userPreferences.join(', ')}.`);
  }
  
  // Add patterns if available
  if (patterns.length > 0) {
    contextSections.push(`Observed patterns: ${patterns.join(', ')}.`);
  }
  
  return contextSections.join(' ');
}

/**
 * Get enhanced context data for the AI assistant
 */
export function getMemoryEnhancedContext(): MemoryEnhancedContext {
  const memoryStore = getMemoryStore();
  const {
    conversationMemory,
    sessionMemory,
    persistentMemories
  } = memoryStore;
  
  // Get persistent memory if available
  const persistentMemory = persistentMemories.length > 0 ? persistentMemories[0] : null;
  
  // Extract time context
  const { timeOfDayContext } = sessionMemory;
  const now = new Date();
  
  // Format active apps
  const activeApps = sessionMemory.activeApps
    .filter(app => app.timeClosed === undefined)
    .map(app => app.appName);
    
  // Format recently used apps
  const recentlyUsedApps = sessionMemory.activeApps
    .sort((a, b) => {
      const aTime = a.timeClosed || Date.now();
      const bTime = b.timeClosed || Date.now();
      return bTime - aTime;
    })
    .slice(0, 5)
    .map(app => app.appName);
  
  // Format user preferences
  const preferences: Record<string, any> = {};
  if (persistentMemory) {
    persistentMemory.preferences.forEach(pref => {
      if (!preferences[pref.category]) {
        preferences[pref.category] = {};
      }
      preferences[pref.category][pref.key] = pref.value;
    });
  }
  
  // Format usage patterns
  const patterns = persistentMemory 
    ? persistentMemory.frequentPatterns
      .filter(pattern => pattern.confidence > 0.6)
      .map(pattern => pattern.description)
    : [];
    
  // Analyze conversation
  const conversationInsights = analyzeConversation(conversationMemory.messages);
  
  // Try to get system resource information
  let cpuUsage: number | undefined;
  let memoryUsage: number | undefined;
  let batteryLevel: number | undefined;
  
  // Use browser Navigator API if available to get battery info
  if (typeof navigator !== 'undefined' && navigator.getBattery) {
    // Using an IIFE to handle the Promise safely
    (async () => {
      try {
        const battery = await navigator.getBattery();
        if (battery) {
          batteryLevel = battery.level * 100;
        }
      } catch (error) {
        // Ignore errors if battery API is not supported
        console.warn('Battery API not supported', error);
      }
    })();
  }
  
  // Return the enhanced context
  return {
    timeContext: {
      timeOfDay: timeOfDayContext.timeOfDay,
      dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now),
      date: now.toLocaleDateString(),
      isWeekend: timeOfDayContext.weekend
    },
    appContext: {
      activeApps,
      recentlyUsed: recentlyUsedApps
    },
    userContext: {
      preferences,
      patterns
    },
    conversationContext: {
      topic: conversationInsights.topic,
      sentiment: conversationInsights.sentiment,
      keywords: conversationInsights.keywords,
      messageCount: conversationMemory.messages.length
    },
    systemResources: {
      cpuUsage,
      memoryUsage,
      batteryLevel
    }
  };
}

/**
 * Update memory system based on new chat messages
 */
export function updateMemoryWithChatMessage(message: ChatMessage): void {
  const memoryStore = getMemoryStore();
  
  // Add message to conversation memory
  memoryStore.addMessage(message);
  
  // Analyze conversation for insights
  const conversationInsights = analyzeConversation(memoryStore.conversationMemory.messages);
  
  // Update conversation context
  memoryStore.updateConversationContext(
    conversationInsights.topic,
    conversationInsights.sentiment,
    conversationInsights.keywords
  );
  
  // Process possible preferences and add to persistent memory
  conversationInsights.possiblePreferences.forEach(pref => {
    memoryStore.addPreference(
      pref.category,
      pref.key,
      pref.value,
      pref.confidence
    );
  });
  
  // Update time context
  memoryStore.updateTimeContext();
}
