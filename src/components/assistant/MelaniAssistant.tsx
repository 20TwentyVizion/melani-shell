import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, Mic, MicOff, Volume2, Brain, Lightbulb, Download } from "lucide-react";
import { useSystemMemory } from "@/lib/systemMemory";
import { useVoiceSettings } from "@/lib/voiceSettings";
import { useLLMSettings } from "@/lib/llmSettings";
import { useSmartSuggestions } from "@/lib/smartSuggestions";
import { usePredictiveText } from "@/lib/predictiveText";
import { useMemoryStore } from "@/lib/memory";
import { getMemoryEnhancedContext, generateSystemPromptEnhancement, updateMemoryWithChatMessage } from "@/lib/memory/memoryContextProvider";
import { ChatMessage as MemoryChatMessage } from "@/lib/memory/types";

// Define types and interfaces used in the component
type VoiceStateType = 'idle' | 'listening' | 'processing';

interface Message {
  text: string;
  isUser: boolean;
  id: string;
}

interface LLMConfig {
  provider: string;
  ollamaModel?: string;
  temperature?: number;
  maxTokens?: number;
  progressCallback?: (progress: string | number) => void;
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

interface LLMSettings {
  provider: string;
  ollamaModel?: string;
  temperature?: number;  // Added for type safety
  maxTokens?: number;    // Added for type safety
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

// Simple UUID generator function to replace uuid package dependency
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
  // State declarations
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = React.useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = React.useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = React.useState<string>("");
  const [voiceState, setVoiceState] = React.useState<VoiceStateType>("idle");
  const [memoryContext, setMemoryContext] = React.useState<string>("");
  const [showSuggestions, setShowSuggestions] = React.useState<boolean>(false);
  const [predictiveSuggestions, setPredictiveSuggestions] = React.useState<Array<string>>([]);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);

  // Refs for LLM client and voice service
  const llmClientRef = React.useRef<LLMClientInterface>(new LLMClient());
  const voiceServiceRef = React.useRef<VoiceServiceInterface>(new VoiceService());

  // Custom hooks
  const systemMemory = useSystemMemory();
  const voiceSettings = useVoiceSettings();
  const llmSettings = useLLMSettings();
  const { suggestions, setSuggestions } = useSmartSuggestions();
  const { predictiveText, setPredictiveText } = usePredictiveText();
  const { addMemory } = useMemoryStore();

  // Initialize LLM
  const initializeLLM = async () => {
    try {
      setIsLoading(true);
      systemMemory.addProcess?.("LLM Initialization");
      await llmClientRef.current.initialize({
        provider: llmSettings.provider,
        ollamaModel: llmSettings.ollamaModel,
        progressCallback: (progress) => setLoadingProgress(progress),
      });
      setIsModelLoaded(true);
    } catch (error: any) {
      setLoadingProgress(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      systemMemory.removeProcess?.("LLM Initialization");
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
    } catch (error: any) {
      console.error("Error initializing voice service:", error);
    }
  };

  // Handle speech result
  const handleSpeechResult = (text: string) => {
    setInput(text);
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

  // Voice icon component
  const VoiceIcon = () => {
    if (voiceState === 'listening') {
      return <MicOff className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Show predictive suggestions when typing
    if (e.target.value.trim().length > 2) {
      // Example of generating predictive suggestions
      const matchingSuggestions = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(e.target.value.toLowerCase())
      ).slice(0, 5);
      
      setPredictiveSuggestions(matchingSuggestions);
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
    setInput(suggestion);
    setPredictiveSuggestions([]);
    setShowSuggestions(false);
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      id: generateId(),
    };

    // Add user message to UI
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and suggestions
    setInput("");
    setPredictiveSuggestions([]);
    setShowSuggestions(false);

    try {
      setIsLoading(true);
      
      // Retrieve context from memory
      const contextData = await getMemoryEnhancedContext(userMessage.text);
      setMemoryContext(contextData || "");
      
      // Create chat messages array for the LLM
      const chatMessages: ChatMessage[] = [
        { 
          role: 'system', 
          content: generateSystemPromptEnhancement(contextData)
        },
        ...messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userMessage.text }
      ];
      
      // Send to LLM
      const response = await llmClientRef.current.chat(chatMessages, {
        temperature: llmSettings.temperature,
        maxTokens: llmSettings.maxTokens
      });
      
      if (response.content) {
        const assistantMessage: Message = {
          text: response.content,
          isUser: false,
          id: generateId(),
        };
        
        // Add assistant message to UI
        setMessages(prev => [...prev, assistantMessage]);
        
        // Store conversation in memory
        updateMemoryWithChatMessage({
          id: userMessage.id,
          query: userMessage.text,
          response: response.content,
          timestamp: new Date().toISOString()
        } as MemoryChatMessage);
        
        // If voice is enabled and set to auto-speak, read response aloud
        if (voiceSettings.enabled && voiceSettings.autoSpeak) {
          voiceServiceRef.current.speak(response.content, voiceSettings.voice);
        }
      }
      
      if (response.error) {
        const errorMessage: Message = {
          text: `Error: ${response.error}`,
          isUser: false,
          id: generateId(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        text: `Error: ${error.message || 'Unknown error'}`,
        isUser: false,
        id: generateId(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
  React.useEffect(() => {
    initializeLLM();
    initializeVoiceService();
    
    // Cleanup on unmount
    return () => {
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, []);

  // Main component UI
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden bg-black/50 border-white/20">
      <CardHeader className="p-4 flex-none border-b border-white/10">
        <CardTitle className="flex items-center text-white gap-2 text-lg">
          <Bot className="w-5 h-5" />
          <span>Melani Assistant</span>
        </CardTitle>
        <div className="text-xs text-gray-400">
          {getProviderDisplayName()}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!isModelLoaded && loadingProgress && (
          <div className="mb-4 p-3 bg-blue-500/20 rounded-lg">
            <div className="text-sm text-blue-200">{loadingProgress}</div>
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
                  <Lightbulb className="w-3 h-3" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={
                voiceState === 'listening' ? "Listening..." :
                voiceState === 'processing' ? "Processing..." :
                isModelLoaded ? "Type your message..." : "Loading model..."
              }
              className="glass-effect"
              disabled={!isModelLoaded || isLoading || voiceState === 'listening'}
              onKeyPress={handleKeyPress}
              onFocus={() => input.length > 1 && setShowSuggestions(true)}
            />
            
            {isVoiceInputEnabled && voiceServiceRef.current?.isSupported() && (
              <Button
                onClick={handleVoiceToggle}
                className={getVoiceButtonClass()}
                disabled={!isModelLoaded || isLoading}
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
              disabled={!isModelLoaded || isLoading || voiceState === 'listening'}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MelaniAssistant;
