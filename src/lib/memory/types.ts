/**
 * Melani OS Memory System Types
 * 
 * This module defines the types used by Melani's hierarchical memory system.
 * The system uses a three-tier approach:
 * 1. Short-term: Immediate conversation context (current chat)
 * 2. Medium-term: Session-based memory (active during current session)
 * 3. Long-term: Persistent preferences and insights (stored in IndexedDB)
 */

/**
 * Base memory interface that all memory types extend
 */
export interface BaseMemory {
  id: string;
  timestamp: number;
  type: MemoryType;
}

/**
 * Types of memory in the hierarchical system
 */
export enum MemoryType {
  CONVERSATION = 'conversation',  // Short-term: Current conversation
  SESSION = 'session',           // Medium-term: Current session
  PERSISTENT = 'persistent',     // Long-term: Stored in IndexedDB
}

/**
 * Short-term conversation memory
 * Holds immediate context from the current conversation
 */
export interface ConversationMemory extends BaseMemory {
  type: MemoryType.CONVERSATION;
  messages: ChatMessage[];
  topic?: string;
  sentiment?: string;
  keywords?: string[];
}

/**
 * Medium-term session memory
 * Tracks user behavior and context within the current session
 */
export interface SessionMemory extends BaseMemory {
  type: MemoryType.SESSION;
  activeApps: AppUsage[];
  recentTasks: TaskInfo[];
  timeOfDayContext: TimeContext;
  userInteractions: Interaction[];
}

/**
 * Long-term persistent memory
 * Stores user preferences and insights that persist across sessions
 */
export interface PersistentMemory extends BaseMemory {
  type: MemoryType.PERSISTENT;
  preferences: UserPreference[];
  frequentPatterns: UsagePattern[];
  learnings: AILearning[];
  relationships?: RelationshipMap;
}

// Supporting types for the memory system

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AppUsage {
  appId: string;
  appName: string;
  timeOpened: number;
  timeClosed?: number;
  focusTime: number;
  interactions: number;
}

export interface TaskInfo {
  id: string;
  description: string;
  status: 'completed' | 'in-progress' | 'abandoned';
  startTime: number;
  endTime?: number;
  relatedApps?: string[];
}

export interface TimeContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
  weekend: boolean;
  date: string;
}

export interface Interaction {
  type: 'click' | 'voice' | 'typing' | 'gesture';
  target?: string;
  timestamp: number;
  duration?: number;
}

export interface UserPreference {
  category: string;
  key: string;
  value: any;
  confidence: number; // 0-1 indicating how confident the system is about this preference
  lastUpdated: number;
}

export interface UsagePattern {
  pattern: string;
  description: string;
  confidence: number;
  occurrences: number;
  lastObserved: number;
  triggers?: string[];
}

export interface AILearning {
  concept: string;
  insights: string;
  relevance: number; // 0-1 indicating how relevant this learning is to user behavior
  lastApplied?: number;
}

export interface RelationshipMap {
  [key: string]: {
    type: 'app' | 'task' | 'context';
    strength: number; // 0-1 indicating relationship strength
    connections: string[]; // IDs of related entities
  };
}

/**
 * Memory retrieval options for querying the memory system
 */
export interface MemoryRetrievalOptions {
  type?: MemoryType;
  limit?: number;
  from?: number;
  to?: number;
  query?: string;
  relevance?: number; // Minimum relevance threshold (0-1)
}
