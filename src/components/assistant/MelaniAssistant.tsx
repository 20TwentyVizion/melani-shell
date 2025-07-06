import React from "react";
const { useState, useCallback, useEffect, useRef } = React;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Using Unicode characters for icons since icon libraries are causing issues
import { useSystemMemory } from "@/lib/systemMemory";
import { useVoiceSettings } from "@/lib/voiceSettings";
import { useLLMSettings } from "@/lib/llmSettings";
import { useSmartSuggestions } from "@/lib/smartSuggestions";
import { usePredictiveText } from "@/lib/predictiveText";
import { useMemoryStore } from "@/lib/memory";
import { getMemoryEnhancedContext, generateSystemPromptEnhancement, updateMemoryWithChatMessage } from "@/lib/memory/memoryContextProvider";
import { ChatMessage as MemoryChatMessage } from "@/lib/memory/types";
import { useAssistantStore } from "@/lib/stores/assistantStore";

// Define types and interfaces used in the component
type VoiceStateType = 'idle' | 'listening' | 'processing';

// Define the structure of chat messages
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

// Define AssistantStore interface for TypeScript type checking
interface AssistantStore {
  isLoading: boolean;
  modelLoaded: boolean;
  messages: Message[];
  setLoading: (loading: boolean) => void;
  addMessage: (text: string, isUser: boolean) => void;
  getCurrentConversation: () => Message[];
  startNewConversation: () => void;
  setModelLoadStatus: (status: boolean) => void;
}

interface LLMConfig {
  provider: string;
  ollamaModel?: string;
  temperature?: number;
  maxTokens?: number;
  progressCallback?: (progress: string | number) => void;
  apiKey?: string;
  modelName?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Extended interfaces for the hooks that were causing TypeScript errors
interface SystemMemory {
  data?: any;
  addProcess?: (name: string) => void;
  removeProcess?: (name: string) => void;
}

interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  voice?: string;
}

interface SmartSuggestionsResult {
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
}

interface PredictiveTextResult {
  predictiveText: string;
  setPredictiveText: (text: string) => void;
}

interface MemoryStoreResult {
  addMemory: (content: string, source: string) => void;
}

interface LLMSettings {
  provider: string;
  ollamaModel?: string;
  temperature?: number;  // Added for type safety
  maxTokens?: number;    // Added for type safety
  apiKey?: string;
  modelName?: string;
}

interface VoiceServiceInterface {
  initialize: (config?: any) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, voice?: string) => Promise<void>;
  isSupported: () => boolean;
  onSpeechResult?: (text: string) => void;
  onStateChange?: (state: VoiceStateType) => void;
  dispose: () => void;
}

interface LLMClientInterface {
  initialize: (config: LLMConfig) => Promise<void>;
  chat: (messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }) => Promise<{ content?: string; error?: string }>;
  dispose: () => void;
}

// Using generateId from uuidUtil

// Voice service class implementation
class VoiceService implements VoiceServiceInterface {
  onSpeechResult?: (text: string) => void;
  onStateChange?: (state: VoiceStateType) => void;
  
  async initialize(config?: any): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }
  
  startListening(): void {
    if (this.onStateChange) this.onStateChange('listening');
  }
  
  stopListening(): void {
    if (this.onStateChange) this.onStateChange('idle');
  }
  
  async speak(text: string, voice?: string): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }
  
  isSupported(): boolean {
    return true;
  }
  
  dispose(): void {
    // Mock implementation
  }
}

// LLM client class implementation
class LLMClient implements LLMClientInterface {
  async initialize(config: LLMConfig): Promise<void> {
    return Promise.resolve();
  }
  
  async chat(messages: ChatMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<{ content?: string; error?: string }> {
    return { content: "This is a mock response from LLMClient" };
  }
  
  dispose(): void {
    // Mock implementation
  }
}

// MelaniAssistant Component
const MelaniAssistant: React.FC = () => {
  // Local state for UI and fallbacks
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  
  // Access the store directly - TypeScript-safe approach
  // This avoids the "not callable" errors
  const assistantStoreHook = useAssistantStore;
  const rawStore = typeof assistantStoreHook === 'function' ? assistantStoreHook() : null;
  
  // Create TypeScript-safe wrapper functions
  const setLoading = useCallback((loading: boolean) => {
    if (rawStore && typeof rawStore.setLoading === 'function') {
      rawStore.setLoading(loading);
    } else {
      setIsLoading(loading); 
    }
  }, [rawStore]);
  
  const addMessage = useCallback((text: string, isUser: boolean) => {
    if (rawStore && typeof rawStore.addMessage === 'function') {
      rawStore.addMessage(text, isUser);
    } else {
      console.log('Adding message (fallback):', { text, isUser });
    }
  }, [rawStore]);
  
  const getCurrentConversation = useCallback(() => {
    if (rawStore && typeof rawStore.getCurrentConversation === 'function') {
      return rawStore.getCurrentConversation();
    } 
    console.log('Getting conversation (fallback)');
    return [];
  }, [rawStore]);
  
  const startNewConversation = useCallback(() => {
    if (rawStore && typeof rawStore.startNewConversation === 'function') {
      rawStore.startNewConversation();
    } else {
      console.log('Starting new conversation (fallback)');
    }
  }, [rawStore]);
  
  const setModelLoadStatus = useCallback((status: boolean) => {
    if (rawStore && typeof rawStore.setModelLoadStatus === 'function') {
      rawStore.setModelLoadStatus(status);
    } else {
      console.log('Setting model load status (fallback):', status);
      setModelLoaded(status);
    }
  }, [rawStore]);
  
  // Local state that doesn't need persistence
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<VoiceStateType>('idle');
  const [inputText, setInputText] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [smartResponse, setSmartResponse] = useState<string>("");

  // Get current messages from the store
  const messages = getCurrentConversation();
  
  // For predictive text suggestions
  const [predictiveSuggestions, setPredictiveSuggestions] = useState<Array<string>>([]);

  // Refs for LLM client and voice service
  const llmClientRef = useRef<LLMClientInterface>(new LLMClient());
  const voiceServiceRef = useRef<VoiceServiceInterface>(new VoiceService());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom hooks with proper type assertions to avoid TypeScript errors
  const systemMemory = useSystemMemory() as SystemMemory;
  const voiceSettings = useVoiceSettings() as VoiceSettings;
  const llmSettings = useLLMSettings() as LLMSettings;
  
  // TypeScript interface augmentation for LLM settings
  interface EnhancedLLMSettings extends LLMSettings {
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    modelName?: string;
  }
  const { suggestions, setSuggestions } = useSmartSuggestions() as SmartSuggestionsResult;
  const { predictiveText, setPredictiveText } = usePredictiveText() as PredictiveTextResult;
  const { addMemory } = useMemoryStore() as MemoryStoreResult;

  // Initialize LLM client
  const initializeLLM = async () => {
    try {
      setModelLoadStatus(false);
      setLoadingProgress("Initializing AI model...");
      
      const progressCallback = (progress: string | number) => {
        setLoadingProgress(typeof progress === "number" ? `Loading model... ${Math.round(progress * 100)}%` : String(progress));
      };
      
      // Get LLM settings with safe access - TypeScript-safe approach
      const defaultSettings: LLMSettings = {
        provider: 'mock',
        temperature: 0.7,
        maxTokens: 2048
      };
      
      // Use the llmSettings already defined at component level (line 218)
      // Instead of calling hooks inside this function which violates React's Rules of Hooks
      
      // Safe access to potentially undefined properties
      const safeSettings: LLMSettings = {
        provider: llmSettings?.provider || defaultSettings.provider,
        ollamaModel: llmSettings?.ollamaModel || 'llama2',
        temperature: llmSettings?.temperature || defaultSettings.temperature,
        maxTokens: llmSettings?.maxTokens || defaultSettings.maxTokens,
        apiKey: llmSettings?.apiKey || '',
        modelName: llmSettings?.modelName || ''
      };
      
      // Get model configuration safely
      const provider = safeSettings.provider || 'mock';
      const ollamaModel = safeSettings.ollamaModel || 'llama2';
      const isOllama = provider === 'ollama';
      const isOpenAI = provider === 'openai';
      
      // Create LLM client if not already created
      if (!llmClientRef.current) {
        llmClientRef.current = createLLMClient(provider);
      }
      
      // Initialize with safe defaults
      await llmClientRef.current?.initialize({
        provider,
        ollamaModel,
        temperature: llmSettings.temperature || 0.7,
        maxTokens: llmSettings.maxTokens || 2048,
        apiKey: llmSettings.apiKey || '',
        modelName: llmSettings.modelName || '',
        progressCallback
      });
      
      setModelLoadStatus(true);
      setLoadingProgress("");
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
      setLoadingProgress(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Initialize voice service
  const initializeVoiceService = async () => {
    if (!voiceSettings.enabled) return;
    
    try {
      voiceServiceRef.current.onSpeechResult = handleSpeechResult;
      voiceServiceRef.current.onStateChange = handleVoiceStateChange;
      await voiceServiceRef.current.initialize({
        voice: voiceSettings.voice,
      });
      setIsVoiceInputEnabled(voiceServiceRef.current.isSupported());
    } catch (error) {
      console.error("Error initializing voice service:", error);
    }
  };

  // Handle speech result
  const handleSpeechResult = (text: string) => {
    setInputText(text);
    if (text.trim()) {
      setVoiceState('processing');
      handleSend();
    }
  };

  // Handle voice state change
  const handleVoiceStateChange = (state: VoiceStateType) => {
    setVoiceState(state);
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
    } else {
      voiceServiceRef.current.startListening();
    }
  };

  // Get voice button class based on state
  const getVoiceButtonClass = () => {
    if (voiceState === 'listening') {
      return "bg-red-500 hover:bg-red-600";
    }
    if (voiceState === 'processing') {
      return "bg-yellow-500 hover:bg-yellow-600";
    }
    return "bg-blue-500 hover:bg-blue-600";
  };

  // Voice icon component using Unicode emoji
  const VoiceIcon = () => {
    if (voiceState === 'listening') {
      return <span className="h-4 w-4">🎤</span>; // Microphone emoji
    }
    return <span className="h-4 w-4">🎙️</span>; // Studio microphone emoji
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Show predictive suggestions when typing
    if (e.target.value.trim().length > 2) {
      // Example of generating predictive suggestions
      const suggestionArray = Array.isArray(suggestions) ? suggestions : [];
      const filteredSuggestions = suggestionArray
        .filter(suggestion => suggestion.toLowerCase().includes(e.target.value.toLowerCase()))
        .slice(0, 3);
      
      setPredictiveSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setPredictiveSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    setPredictiveSuggestions([]);
    setShowSuggestions(false);
  };

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: Date.now(),
    };

    // Add user message to the store
    addMessage(userMessage.text, true);
    
    // Clear input and suggestions
    setInputText("");
    setPredictiveSuggestions([]);
    setShowSuggestions(false);

    try {
      setLoading(true);
      
      // Retrieve context from memory
      const contextData = await getMemoryEnhancedContext(userMessage.text);
      
      // Retrieve context from memory with safe access
      const getMemoryEnhancedContext = async (query: string): Promise<any> => {
        if (!memoryManager) return {};
        
        try {
          // Safe access with type checking
          if (typeof memoryManager.getMemoriesForPrompt === 'function') {
            return await memoryManager.getMemoriesForPrompt(query);
          }
          return {};
        } catch (error) {
          console.error('Failed to get memory enhanced context:', error);
          return {};
        }
      };
      
      // Create system prompt with contextData
      let contextDataStr = '';
      if (contextData) {
        try {
          contextDataStr = JSON.stringify(contextData);
        } catch (e) {
          console.error('Failed to stringify context data:', e);
        }
      }
      const systemPrompt = `You are Melani, an advanced AI assistant. ${contextDataStr}`;

      // Create chat messages array for the LLM
      const chatMessages: ChatMessage[] = [
        { 
          id: 'sys-' + Date.now(),
          text: systemPrompt,
          isUser: false,
          timestamp: Date.now(),
        },
        ...messages.map(m => ({
          id: m.id,
          text: m.text,
          isUser: m.isUser,
          timestamp: m.timestamp,
        })),
        userMessage
      ];
      
      // Send to LLM with defaults
      const response = await llmClientRef.current?.chat(chatMessages, {
        temperature: 0.7,
        maxTokens: 2048
      });
      
      // LLM callback functions
      const handleResponse = (response: { content?: string; error?: string }) => {
        setLoading(false);
        
        if (response.error) {
          // Handle error
          console.error('LLM Error:', response.error);
          return;
        }
        
        if (response.content) {
          // Add assistant message to the store
          addMessage(response.content, false);
          
          // Auto-speak response if enabled
          if (voiceSettings.autoSpeak && voiceServiceRef.current) {
            voiceServiceRef.current.speak(response.content, voiceSettings.voice);
          }
          
          // Update memory with the conversation
          try {
            updateMemoryWithChatMessage({
              id: 'msg-' + Date.now(),
              content: response.content || '',
              role: 'assistant',
              timestamp: Date.now(),
            });
          } catch (error) {
            console.error('Error updating memory with assistant message', error);
          }
        }
      };

      handleResponse(response);
    } catch (error) {
      console.error('Error sending message to LLM:', error);
    } finally {
      setLoading(false);
      setVoiceState('idle');
    }
  };

  // Get provider display name
  const getProviderDisplayName = () => {
    if (llmSettings.provider === 'ollama') {
      return `Ollama (${llmSettings.ollamaModel || 'default'})`;
    }
    return llmSettings.provider;
  };

  // Initialize on component mount
  useEffect(() => {
    // Ensure we have a conversation if none exists
    if (messages.length === 0) {
      // Start a new conversation with welcome message
      startNewConversation();
      addMessage("Hello! I'm Melani, your AI assistant. How can I help you today?", false);
    }
    
    // Initialize components
    if (!modelLoaded) {
      initializeLLM();
    }
    
    if (voiceSettings.enabled && !isVoiceInputEnabled) {
      initializeVoiceService();
      setIsVoiceInputEnabled(true);
    }
    
    // Cleanup function
    return () => {
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, [initializeLLM, initializeVoiceService, modelLoaded, voiceSettings.enabled, messages.length, startNewConversation, addMessage]);

  // Main component UI
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden bg-black/50 border-white/20">
      <CardHeader className="p-4 flex-none border-b border-white/10">
        <CardTitle className="flex items-center text-white gap-2 text-lg">
          <span className="text-blue-400 mr-2">🤖</span>
          <span>Melani Assistant</span>
        </CardTitle>
        <div className="text-xs text-gray-400">
          {getProviderDisplayName()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!modelLoaded && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg">
            <div className="text-sm text-blue-200">Initializing AI model...</div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.isUser
                    ? 'bg-white/10 text-white'
                    : 'bg-black/30 text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-black/30 text-white rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          {/* Predictive suggestions */}
          {predictiveSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-black/80 rounded-lg border border-white/20 max-h-32 overflow-y-auto">
              {predictiveSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="h-5 w-5">➤</span>
                  <span className="text-yellow-400 mr-1">💡</span>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && inputText.trim() && handleSend()}
              placeholder={
                voiceState === 'listening' ? "Listening..." :
                voiceState === 'processing' ? "Processing..." :
                (modelLoaded as boolean) ? "Type your message..." : "Loading model..."
              }
              className="glass-effect"
              disabled={!modelLoaded || isLoading || voiceState === 'listening'}
            />
            
            {isVoiceInputEnabled && voiceServiceRef.current?.isSupported() && (
              <Button
                onClick={handleVoiceToggle}
                className={getVoiceButtonClass()}
                disabled={!modelLoaded || isLoading}
                title={
                  voiceState === 'listening' ? "Stop listening" :
                  voiceState === 'processing' ? "Processing..." :
                  "Start voice input"
                }
              >
                <VoiceIcon />
              </Button>
            )}
            
            <Button
              onClick={handleSend}
              className="bg-white/10 hover:bg-white/20"
              disabled={!modelLoaded || isLoading || voiceState === 'listening'}
            >
              <span className="h-4 w-4">➤</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MelaniAssistant;
