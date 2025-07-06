/**
 * Melani OS Memory Manager
 * 
 * This module implements the hierarchical memory system for Melani OS with three tiers:
 * 1. Short-term: Conversation context (in-memory)
 * 2. Medium-term: Session context (in-memory with optional persistence)
 * 3. Long-term: User preferences and insights (IndexedDB)
 */

import { uuidv4 } from '../utils/uuidUtil';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  BaseMemory, 
  MemoryType,
  ConversationMemory, 
  SessionMemory,
  PersistentMemory,
  ChatMessage,
  AppUsage,
  TaskInfo,
  TimeContext,
  MemoryRetrievalOptions
} from './types';

// Maximum number of messages to keep in short-term memory
const MAX_CONVERSATION_MESSAGES = 50;

// Maximum number of app usages to track in medium-term memory
const MAX_APP_USAGES = 20;

// Maximum number of recent tasks to track in medium-term memory
const MAX_RECENT_TASKS = 10;

/**
 * Interface for the memory store state
 */
interface MemoryState {
  // Short-term memory (conversation)
  conversationMemory: ConversationMemory;
  
  // Medium-term memory (session)
  sessionMemory: SessionMemory;
  
  // Long-term memory (persistent)
  persistentMemories: PersistentMemory[];
  
  // Actions for conversation memory
  addMessage: (message: ChatMessage) => void;
  updateConversationContext: (topic?: string, sentiment?: string, keywords?: string[]) => void;
  clearConversation: () => void;
  
  // Actions for session memory
  trackAppUsage: (appId: string, appName: string, action: 'open' | 'focus' | 'interact' | 'close') => void;
  recordTask: (description: string, status: 'completed' | 'in-progress' | 'abandoned', relatedApps?: string[]) => void;
  updateTimeContext: () => void;
  
  // Actions for persistent memory
  addPreference: (category: string, key: string, value: any, confidence: number) => void;
  addPattern: (pattern: string, description: string, confidence: number) => void;
  addLearning: (concept: string, insights: string, relevance: number) => void;
  
  // Memory retrieval
  retrieveMemory: <T extends BaseMemory>(options: MemoryRetrievalOptions) => T[];
  
  // Helper functions
  getEnhancedContext: () => any;
}

/**
 * Create the time context object based on the current time
 */
function createTimeContext(): TimeContext {
  const now = new Date();
  const hour = now.getHours();
  
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  
  return {
    timeOfDay,
    dayOfWeek: now.getDay(),
    weekend: now.getDay() === 0 || now.getDay() === 6,
    date: now.toISOString().split('T')[0]
  };
}

/**
 * Initialize an empty conversation memory
 */
function initConversationMemory(): ConversationMemory {
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    type: MemoryType.CONVERSATION,
    messages: [],
    topic: undefined,
    sentiment: undefined,
    keywords: []
  };
}

/**
 * Initialize an empty session memory
 */
function initSessionMemory(): SessionMemory {
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    type: MemoryType.SESSION,
    activeApps: [],
    recentTasks: [],
    timeOfDayContext: createTimeContext(),
    userInteractions: []
  };
}

/**
 * Create the memory store using Zustand
 */
export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversationMemory: initConversationMemory(),
      sessionMemory: initSessionMemory(),
      persistentMemories: [],
      
      // Conversation memory actions
      addMessage: (message: ChatMessage) => set(state => {
        const messages = [...state.conversationMemory.messages, message]
          .slice(-MAX_CONVERSATION_MESSAGES);
        
        return {
          conversationMemory: {
            ...state.conversationMemory,
            messages,
            timestamp: Date.now()
          }
        };
      }),
      
      updateConversationContext: (topic?: string, sentiment?: string, keywords?: string[]) => set(state => ({
        conversationMemory: {
          ...state.conversationMemory,
          topic: topic || state.conversationMemory.topic,
          sentiment: sentiment || state.conversationMemory.sentiment,
          keywords: keywords || state.conversationMemory.keywords,
          timestamp: Date.now()
        }
      })),
      
      clearConversation: () => set({
        conversationMemory: initConversationMemory()
      }),
      
      // Session memory actions
      trackAppUsage: (appId: string, appName: string, action: 'open' | 'focus' | 'interact' | 'close') => set(state => {
        const { activeApps } = state.sessionMemory;
        
        // Find existing app usage or create new one
        let appIndex = activeApps.findIndex(app => app.appId === appId);
        let updatedApps = [...activeApps];
        
        if (appIndex === -1 && action !== 'close') {
          // App not found, add new entry if not closing
          updatedApps = [
            {
              appId,
              appName,
              timeOpened: Date.now(),
              focusTime: action === 'focus' ? Date.now() : 0,
              interactions: action === 'interact' ? 1 : 0
            },
            ...updatedApps
          ].slice(0, MAX_APP_USAGES);
        } else if (appIndex !== -1) {
          // Update existing app usage
          const app = { ...updatedApps[appIndex] };
          
          switch (action) {
            case 'open':
              app.timeOpened = Date.now();
              break;
            case 'focus':
              app.focusTime = Date.now();
              break;
            case 'interact':
              app.interactions += 1;
              break;
            case 'close':
              app.timeClosed = Date.now();
              break;
          }
          
          updatedApps[appIndex] = app;
        }
        
        return {
          sessionMemory: {
            ...state.sessionMemory,
            activeApps: updatedApps,
            timestamp: Date.now()
          }
        };
      }),
      
      recordTask: (description: string, status: 'completed' | 'in-progress' | 'abandoned', relatedApps?: string[]) => set(state => {
        const task: TaskInfo = {
          id: uuidv4(),
          description,
          status,
          startTime: Date.now(),
          endTime: status === 'completed' ? Date.now() : undefined,
          relatedApps
        };
        
        const recentTasks = [task, ...state.sessionMemory.recentTasks]
          .slice(0, MAX_RECENT_TASKS);
        
        return {
          sessionMemory: {
            ...state.sessionMemory,
            recentTasks,
            timestamp: Date.now()
          }
        };
      }),
      
      updateTimeContext: () => set(state => ({
        sessionMemory: {
          ...state.sessionMemory,
          timeOfDayContext: createTimeContext(),
          timestamp: Date.now()
        }
      })),
      
      // Persistent memory actions
      addPreference: (category: string, key: string, value: any, confidence: number) => set(state => {
        // Create a new persistent memory or find existing one to update
        let persistentMemory = state.persistentMemories.find(m => m.type === MemoryType.PERSISTENT);
        
        if (!persistentMemory) {
          // Create new persistent memory
          persistentMemory = {
            id: uuidv4(),
            timestamp: Date.now(),
            type: MemoryType.PERSISTENT,
            preferences: [],
            frequentPatterns: [],
            learnings: []
          };
        }
        
        // Find existing preference or add new one
        const preferences = [...persistentMemory.preferences];
        const existingIndex = preferences.findIndex(p => p.category === category && p.key === key);
        
        if (existingIndex !== -1) {
          // Update existing preference
          preferences[existingIndex] = {
            ...preferences[existingIndex],
            value,
            confidence: Math.max(preferences[existingIndex].confidence, confidence),
            lastUpdated: Date.now()
          };
        } else {
          // Add new preference
          preferences.push({
            category,
            key,
            value,
            confidence,
            lastUpdated: Date.now()
          });
        }
        
        // Update persistent memory
        const updatedMemory = {
          ...persistentMemory,
          preferences,
          timestamp: Date.now()
        };
        
        // Update state with new or updated persistent memory
        const updatedMemories = state.persistentMemories.filter(m => m.id !== persistentMemory?.id);
        updatedMemories.push(updatedMemory);
        
        return {
          persistentMemories: updatedMemories
        };
      }),
      
      addPattern: (pattern: string, description: string, confidence: number) => set(state => {
        // Find or create persistent memory
        let persistentMemory = state.persistentMemories.find(m => m.type === MemoryType.PERSISTENT);
        
        if (!persistentMemory) {
          // Create new persistent memory
          persistentMemory = {
            id: uuidv4(),
            timestamp: Date.now(),
            type: MemoryType.PERSISTENT,
            preferences: [],
            frequentPatterns: [],
            learnings: []
          };
        }
        
        // Find existing pattern or add new one
        const patterns = [...persistentMemory.frequentPatterns];
        const existingIndex = patterns.findIndex(p => p.pattern === pattern);
        
        if (existingIndex !== -1) {
          // Update existing pattern
          patterns[existingIndex] = {
            ...patterns[existingIndex],
            description,
            confidence: Math.max(patterns[existingIndex].confidence, confidence),
            occurrences: patterns[existingIndex].occurrences + 1,
            lastObserved: Date.now()
          };
        } else {
          // Add new pattern
          patterns.push({
            pattern,
            description,
            confidence,
            occurrences: 1,
            lastObserved: Date.now()
          });
        }
        
        // Update persistent memory
        const updatedMemory = {
          ...persistentMemory,
          frequentPatterns: patterns,
          timestamp: Date.now()
        };
        
        // Update state with new or updated persistent memory
        const updatedMemories = state.persistentMemories.filter(m => m.id !== persistentMemory?.id);
        updatedMemories.push(updatedMemory);
        
        return {
          persistentMemories: updatedMemories
        };
      }),
      
      addLearning: (concept: string, insights: string, relevance: number) => set(state => {
        // Find or create persistent memory
        let persistentMemory = state.persistentMemories.find(m => m.type === MemoryType.PERSISTENT);
        
        if (!persistentMemory) {
          // Create new persistent memory
          persistentMemory = {
            id: uuidv4(),
            timestamp: Date.now(),
            type: MemoryType.PERSISTENT,
            preferences: [],
            frequentPatterns: [],
            learnings: []
          };
        }
        
        // Find existing learning or add new one
        const learnings = [...persistentMemory.learnings];
        const existingIndex = learnings.findIndex(l => l.concept === concept);
        
        if (existingIndex !== -1) {
          // Update existing learning
          learnings[existingIndex] = {
            ...learnings[existingIndex],
            insights,
            relevance: Math.max(learnings[existingIndex].relevance, relevance),
            lastApplied: Date.now()
          };
        } else {
          // Add new learning
          learnings.push({
            concept,
            insights,
            relevance,
            lastApplied: Date.now()
          });
        }
        
        // Update persistent memory
        const updatedMemory = {
          ...persistentMemory,
          learnings,
          timestamp: Date.now()
        };
        
        // Update state with new or updated persistent memory
        const updatedMemories = state.persistentMemories.filter(m => m.id !== persistentMemory?.id);
        updatedMemories.push(updatedMemory);
        
        return {
          persistentMemories: updatedMemories
        };
      }),
      
      // Memory retrieval function
      retrieveMemory: <T extends BaseMemory>(options: MemoryRetrievalOptions): T[] => {
        const { type, limit, from, to, query, relevance } = options;
        const state = get();
        
        let results: BaseMemory[] = [];
        
        // Get memories based on type
        if (!type || type === MemoryType.CONVERSATION) {
          results.push(state.conversationMemory);
        }
        
        if (!type || type === MemoryType.SESSION) {
          results.push(state.sessionMemory);
        }
        
        if (!type || type === MemoryType.PERSISTENT) {
          results = [...results, ...state.persistentMemories];
        }
        
        // Filter by timestamp if specified
        if (from || to) {
          results = results.filter(memory => {
            const timestamp = memory.timestamp;
            if (from && timestamp < from) return false;
            if (to && timestamp > to) return false;
            return true;
          });
        }
        
        // Sort by timestamp (most recent first)
        results.sort((a, b) => b.timestamp - a.timestamp);
        
        // Apply limit if specified
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }
        
        return results as T[];
      },
      
      // Get enhanced context for AI
      getEnhancedContext: () => {
        const state = get();
        const { timeOfDayContext } = state.sessionMemory;
        
        // Get most used apps
        const mostUsedApps = state.sessionMemory.activeApps
          .sort((a, b) => b.interactions - a.interactions)
          .slice(0, 3)
          .map(app => app.appName);
        
        // Generate smart suggestions based on context
        const smartSuggestions = generateSuggestions(state);
        
        return {
          currentTime: new Date().toLocaleTimeString(),
          timeOfDay: timeOfDayContext.timeOfDay,
          dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()),
          mostUsedApps,
          smartSuggestions,
          activeConversation: state.conversationMemory.topic || 'general assistance'
        };
      }
    }),
    {
      name: 'melani-memory-storage',
      partialize: (state) => ({
        // Only persist long-term memories to localStorage
        persistentMemories: state.persistentMemories
      }),
    }
  )
);

/**
 * Generate contextual suggestions based on the current memory state
 */
function generateSuggestions(state: MemoryState): string[] {
  const suggestions: string[] = [];
  const { sessionMemory, persistentMemories } = state;
  
  // Time-based suggestions
  const { timeOfDay } = sessionMemory.timeOfDayContext;
  if (timeOfDay === 'morning') {
    suggestions.push('Check your calendar');
    suggestions.push('Review today\'s tasks');
  } else if (timeOfDay === 'afternoon') {
    suggestions.push('Take a short break');
    suggestions.push('Prioritize remaining tasks');
  } else if (timeOfDay === 'evening') {
    suggestions.push('Summarize day\'s progress');
    suggestions.push('Prepare for tomorrow');
  }
  
  // App usage based suggestions
  const mostUsedApp = sessionMemory.activeApps[0]?.appName;
  if (mostUsedApp) {
    suggestions.push(`Continue working with ${mostUsedApp}`);
  }
  
  // Add user preference based suggestions if available
  const persistentMemory = persistentMemories.find(m => m.type === MemoryType.PERSISTENT);
  if (persistentMemory && persistentMemory.preferences.length > 0) {
    const favoriteApp = persistentMemory.preferences
      .find(p => p.category === 'apps' && p.key === 'favorite');
      
    if (favoriteApp) {
      suggestions.push(`Open ${favoriteApp.value}`);
    }
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
}
