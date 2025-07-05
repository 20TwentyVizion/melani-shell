/**
 * Memory System Index
 * 
 * This file exports all components of the Melani OS hierarchical memory system
 */

// Export types
export * from './types';

// Export memory manager
export { useMemoryStore } from './memoryManager';

// Export conversation analyzer
export { analyzeConversation } from './conversationAnalyzer';

// Export memory context provider
export { 
  getMemoryEnhancedContext,
  generateSystemPromptEnhancement,
  updateMemoryWithChatMessage
} from './memoryContextProvider';
