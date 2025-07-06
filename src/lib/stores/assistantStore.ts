import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils/uuidUtil';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ConversationMetadata {
  id: string;
  title: string;
  snippet: string;
  lastMessageTime: Date;
  messageCount: number;
}

export interface AssistantState {
  // Main conversation state
  currentConversationId: string | null;
  conversations: Record<string, Message[]>;
  conversationMetadata: ConversationMetadata[];
  
  // UI state (not persisted)
  isLoading: boolean;
  modelLoaded: boolean;
  loadingProgress: string;
  
  // Actions
  startNewConversation: () => string;
  addMessage: (text: string, isUser: boolean, conversationId?: string) => void;
  clearCurrentConversation: () => void;
  deleteConversation: (conversationId: string) => void;
  setCurrentConversation: (conversationId: string) => void;
  
  // Model loading actions
  setModelLoaded: (loaded: boolean) => void;
  setLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: string) => void;
  
  // Selectors
  getCurrentConversation: () => Message[];
  getConversations: () => ConversationMetadata[];
}

// Helper to create conversation title from first message
const generateConversationTitle = (firstMessage: string): string => {
  const titleText = firstMessage.substring(0, 30);
  return titleText + (firstMessage.length > 30 ? '...' : '');
};

// Helper to update conversation metadata
const updateConversationMetadata = (
  messages: Message[],
  existingMetadata?: ConversationMetadata
): ConversationMetadata => {
  const firstMsg = messages[0] || { text: 'New conversation', timestamp: new Date() };
  const lastMsg = messages[messages.length - 1] || firstMsg;
  
  return {
    id: existingMetadata?.id || generateId(),
    title: existingMetadata?.title || generateConversationTitle(firstMsg.text),
    snippet: lastMsg.text.substring(0, 40) + (lastMsg.text.length > 40 ? '...' : ''),
    lastMessageTime: lastMsg.timestamp,
    messageCount: messages.length,
  };
};

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentConversationId: null,
      conversations: {},
      conversationMetadata: [],
      isLoading: false,
      modelLoaded: false,
      loadingProgress: '',
      
      // Actions
      startNewConversation: () => {
        const newId = generateId();
        
        set(state => ({
          currentConversationId: newId,
          conversations: {
            ...state.conversations,
            [newId]: []
          },
          conversationMetadata: [
            {
              id: newId,
              title: 'New conversation',
              snippet: '',
              lastMessageTime: new Date(),
              messageCount: 0
            },
            ...state.conversationMetadata
          ]
        }));
        
        return newId;
      },
      
      addMessage: (text, isUser, conversationId) => {
        const { currentConversationId, conversations } = get();
        const targetId = conversationId || currentConversationId;
        
        // If no conversation is active, create one
        if (!targetId) {
          const newId = get().startNewConversation();
          get().addMessage(text, isUser, newId);
          return;
        }
        
        // Add message to conversation
        const newMessage = {
          id: generateId(),
          text,
          isUser,
          timestamp: new Date()
        };
        
        const updatedMessages = [
          ...(conversations[targetId] || []),
          newMessage
        ];
        
        set(state => {
          // Update conversations
          const updatedConversations = {
            ...state.conversations,
            [targetId]: updatedMessages
          };
          
          // Update metadata
          const existingMetadataIndex = state.conversationMetadata.findIndex(m => m.id === targetId);
          const existingMetadata = existingMetadataIndex >= 0 ? state.conversationMetadata[existingMetadataIndex] : undefined;
          const updatedMetadata = updateConversationMetadata(updatedMessages, existingMetadata);
          
          const metadataList = [...state.conversationMetadata];
          if (existingMetadataIndex >= 0) {
            metadataList[existingMetadataIndex] = updatedMetadata;
          } else {
            metadataList.unshift(updatedMetadata);
          }
          
          return {
            conversations: updatedConversations,
            conversationMetadata: metadataList
          };
        });
      },
      
      clearCurrentConversation: () => {
        const { currentConversationId } = get();
        if (!currentConversationId) return;
        
        set(state => {
          const updatedConversations = { ...state.conversations };
          updatedConversations[currentConversationId] = [];
          
          const metadataIndex = state.conversationMetadata.findIndex(m => m.id === currentConversationId);
          const updatedMetadata = [...state.conversationMetadata];
          if (metadataIndex >= 0) {
            updatedMetadata[metadataIndex] = {
              ...updatedMetadata[metadataIndex],
              snippet: '',
              lastMessageTime: new Date(),
              messageCount: 0
            };
          }
          
          return {
            conversations: updatedConversations,
            conversationMetadata: updatedMetadata
          };
        });
      },
      
      deleteConversation: (conversationId) => {
        const { currentConversationId, conversations, conversationMetadata } = get();
        
        // Create new conversations object without the deleted one
        const updatedConversations = { ...conversations };
        delete updatedConversations[conversationId];
        
        // Remove from metadata
        const updatedMetadata = conversationMetadata.filter(m => m.id !== conversationId);
        
        // If we're deleting the current conversation, set current to next available or null
        let nextCurrentId = currentConversationId;
        if (currentConversationId === conversationId) {
          nextCurrentId = updatedMetadata.length > 0 ? updatedMetadata[0].id : null;
        }
        
        set({
          conversations: updatedConversations,
          conversationMetadata: updatedMetadata,
          currentConversationId: nextCurrentId
        });
      },
      
      setCurrentConversation: (conversationId) => {
        set({ currentConversationId: conversationId });
      },
      
      // UI state actions
      setModelLoaded: (loaded) => {
        set({ modelLoaded });
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      setLoadingProgress: (loadingProgress) => {
        set({ loadingProgress });
      },
      
      // Selectors
      getCurrentConversation: () => {
        const { currentConversationId, conversations } = get();
        return currentConversationId ? (conversations[currentConversationId] || []) : [];
      },
      
      getConversations: () => {
        return get().conversationMetadata;
      }
    }),
    {
      name: 'melani-assistant-storage',
      version: 1,
      partialize: (state) => ({
        // Only persist these fields
        currentConversationId: state.currentConversationId,
        conversations: state.conversations,
        conversationMetadata: state.conversationMetadata,
      }),
    }
  )
);
