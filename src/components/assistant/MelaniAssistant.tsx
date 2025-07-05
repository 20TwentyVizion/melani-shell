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

// Simple UUID generator function to replace uuid package dependency
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// MelaniAssistant Component
const MelaniAssistant: React.FC = () => {
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
      systemMemory.addProcess("LLM Initialization");
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
      systemMemory.removeProcess("LLM Initialization");
    }
  };

  // Initialize voice service
  const initializeVoiceService = async () => {
    if (!voiceSettings.enabled) return;
    
    try {
      voiceServiceRef.current = new VoiceService();
      
      await voiceServiceRef.current.initialize({
        voice: voiceSettings.voice,
      });
      
      voiceServiceRef.current.onSpeechResult = (text) => {
        setInput(text);
      };
      
      voiceServiceRef.current.onStateChange = (state) => {
        setVoiceState(state);
      };
      
    } catch (error: any) {
      console.error("Error initializing voice service:", error);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (voiceState === "idle") {
      voiceServiceRef.current.startListening();
    } else {
      voiceServiceRef.current.stopListening();
    }
  };

  // Handle voice output
  const handleVoiceOutput = async (text: string) => {
    if (!voiceSettings.enabled || !voiceSettings.autoSpeak) return;
    try {
      await voiceServiceRef.current.speak(text, voiceSettings.voice);
    } catch (error) {
      console.error("Error in voice output:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      id: generateId(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Get memory-enhanced context
      const context = await getMemoryEnhancedContext(input);
      setMemoryContext(context);
      
      // Prepare chat messages for LLM
      const chatMessages: ChatMessage[] = [
        { role: "system", content: generateSystemPromptEnhancement(context) },
        ...messages.map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: input },
      ];
      
      // Send to LLM
      const response = await llmClientRef.current.chat(chatMessages, {
        temperature: llmSettings.temperature,
        maxTokens: llmSettings.maxTokens,
      });
      
      if (response.content) {
        const assistantMessage: Message = {
          text: response.content,
          isUser: false,
          id: generateId(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Update memory with chat message
        const memoryMessage: MemoryChatMessage = {
          role: "assistant",
          content: response.content,
        };
        
        await updateMemoryWithChatMessage(memoryMessage);
        
        // Handle voice output
        await handleVoiceOutput(response.content);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Predictive text
    if (value.length > 3) {
      setPredictiveText(value);
    } else {
      setPredictiveText("");
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Use smart suggestion
  const useSmartSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  // Use predictive text
  const usePredictiveTextSuggestion = () => {
    if (predictiveText) {
      setInput(predictiveText);
      setPredictiveText("");
    }
  };

  // Download chat history
  const downloadChatHistory = () => {
    const chatHistory = messages
      .map((msg) => `${msg.isUser ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n\n");
    
    const blob = new Blob([chatHistory], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `melani-chat-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialize on component mount
  React.useEffect(() => {
    initializeLLM();
    initializeVoiceService();
    
    return () => {
      // Cleanup
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, [initializeLLM, initializeVoiceService]);

  // Update voice state when voiceSettings change
  React.useEffect(() => {
    initializeVoiceService();
  }, [initializeVoiceService]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <span>Melani Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            {memoryContext && (
              <Brain
                className="h-5 w-5 text-blue-500 cursor-pointer"
                title="Memory enhanced responses active"
              />
            )}
            {predictiveText && (
              <Lightbulb
                className="h-5 w-5 text-yellow-500 cursor-pointer"
                onClick={usePredictiveTextSuggestion}
                title="Click to use predictive text"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              disabled={!voiceSettings.enabled}
            >
              {voiceState === "listening" ? (
                <Mic className="h-5 w-5 text-red-500" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={downloadChatHistory}>
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>How can I help you today?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${message.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"}`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}

        {/* Smart suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => useSmartSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>{typeof loadingProgress === "string" ? loadingProgress : `Loading... ${loadingProgress}%`}</span>
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isLoading || !isModelLoaded}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim() || !isModelLoaded}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Predictive text suggestion */}
        {predictiveText && input && (
          <div className="text-sm text-muted-foreground mt-1">
            {input}
            <span className="text-gray-500">
              {predictiveText.slice(input.length)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

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
    try {
      voiceServiceRef.current.onSpeechResult = (text) => {
        setInput(text);
        // Auto-send if enabled
        if (voiceSettings.autoSpeak) {
          setTimeout(() => {
            if (text.trim().length > 0) {
              sendMessage();
            }
          }, 500);
        }
      };

      voiceServiceRef.current.onStateChange = (state) => {
        setVoiceState(state);
      };

      await voiceServiceRef.current.initialize();
      setIsVoiceInputEnabled(voiceSettings.enabled);
    } catch (error) {
      console.error("Failed to initialize voice service:", error);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
    } else {
      voiceServiceRef.current.startListening();
    }
  };

  // Handle voice output
  const handleVoiceOutput = async (text: string) => {
    if (voiceSettings.autoSpeak && text.trim()) {
      try {
        await voiceServiceRef.current.speak(text, voiceSettings.voice);
      } catch (error) {
        console.error("Voice output error:", error);
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      id: generateId(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);

    // Update memory context with user message
    const userChatMessage: MemoryChatMessage = {
      role: "user",
      content: input,
    };
    await updateMemoryWithChatMessage(userChatMessage);

    try {
      setIsLoading(true);
      
      // Get memory-enhanced context for better responses
      const memoryContext = await getMemoryEnhancedContext(userChatMessage.content);
      setMemoryContext(memoryContext);

      // Create the messages array for the LLM
      const chatMessages: ChatMessage[] = [
        { role: "system", content: generateSystemPromptEnhancement(memoryContext) },
        ...messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: userMessage.text },
      ];

      const response = await llmClientRef.current.chat(chatMessages, {
        temperature: llmSettings.temperature || 0.7,
        maxTokens: llmSettings.maxTokens || 1000,
      });

      if (response.content) {
        const assistantMessage: Message = {
          text: response.content,
          isUser: false,
          id: generateId(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Store in memory
        const assistantChatMessage: MemoryChatMessage = {
          role: "assistant",
          content: response.content,
        };
        await updateMemoryWithChatMessage(assistantChatMessage);

        // Handle voice output
        handleVoiceOutput(response.content);
      } else if (response.error) {
        setMessages((prev) => [
          ...prev,
          {
            text: `Error: ${response.error}`,
            isUser: false,
            id: generateId(),
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message || "Unknown error"}`,
          isUser: false,
          id: generateId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Show suggestions based on input
    if (e.target.value.length > 0) {
      setShowSuggestions(true);
      setPredictiveSuggestions(predictiveText.filter(text => 
        text.toLowerCase().includes(e.target.value.toLowerCase())
      ).slice(0, 3));
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    sendMessage();
  };

  // Handle predictive text suggestion
  const usePredictiveTextSuggestion = (text: string) => {
    setInput((prev) => `${prev}${text.slice(prev.length)} `);
  };

  // Download chat history
  const downloadChatHistory = () => {
    const history = messages.map((msg) => 
      `${msg.isUser ? 'You' : 'Assistant'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([history], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melani-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle voice button class
  const getVoiceButtonClass = () => {
    if (voiceState === 'listening') {
      return 'bg-red-500 hover:bg-red-600 animate-pulse';
    } else if (voiceState === 'processing') {
      return 'bg-yellow-500 hover:bg-yellow-600';
    }
    return 'bg-white/10 hover:bg-white/20';
  };

  // Get voice icon based on state
  const VoiceIcon = () => {
    if (voiceState === 'listening' || voiceState === 'processing') {
      return <MicOff className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  // Get provider display name
  const getProviderDisplayName = () => {
    if (llmSettings.provider === 'gemini') {
      return 'Gemini';
    } else if (llmSettings.provider === 'ollama') {
      return `Ollama (${llmSettings.ollamaModel || 'default'})`;
    }
    return llmSettings.provider;
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    toggleVoiceInput();
  };

  // Handle send button click
  const handleSend = () => {
    sendMessage();
  };

  // Initialize on mount
  React.useEffect(() => {
    initializeLLM();
    initializeVoiceService();
    
    return () => {
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, []);

  // Render component
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-black/80 to-gray-900/80 border-white/10">
      <CardHeader className="border-b border-white/10 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-lg font-medium text-white">Melani Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={downloadChatHistory}
              title="Download chat history"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Memory-enhanced context"
              disabled={!memoryContext}
            >
              <Brain className="h-4 w-4" />
            </Button>
            {voiceSettings.autoSpeak && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Voice output enabled"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-white/60 ml-2">
              {getProviderDisplayName()}
            </span>
          </div>
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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isVoiceInputEnabled, setIsVoiceInputEnabled] = React.useState<boolean>(false);
  const [isModelLoaded, setIsModelLoaded] = React.useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = React.useState<string | number>("");
  const [voiceState, setVoiceState] = React.useState<VoiceStateType>("idle");
  const [memoryContext, setMemoryContext] = React.useState<string>("");
  const [showSuggestions, setShowSuggestions] = React.useState<boolean>(false);
  const [predictiveSuggestions, setPredictiveSuggestions] = React.useState<string[]>([]);
  const [input, setInput] = React.useState("");

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
      systemMemory.addProcess("LLM Initialization");
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
      systemMemory.removeProcess("LLM Initialization");
    }
  };

  // Initialize voice service
  const initializeVoiceService = async () => {
    if (!voiceSettings.enabled) return;
    
    try {
      voiceServiceRef.current = new VoiceService();
      
      await voiceServiceRef.current.initialize({
        voice: voiceSettings.voice,
      });
      
      voiceServiceRef.current.onSpeechResult = (text) => {
        setInput(text);
      };
      
      voiceServiceRef.current.onStateChange = (state) => {
        setVoiceState(state);
      };
      
    } catch (error: any) {
      console.error("Error initializing voice service:", error);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (voiceState === "idle") {
      voiceServiceRef.current.startListening();
    } else {
      voiceServiceRef.current.stopListening();
    }
  };

  // Handle voice output
  const handleVoiceOutput = async (text: string) => {
    if (!voiceSettings.enabled || !voiceSettings.autoSpeak) return;
    try {
      await voiceServiceRef.current.speak(text, voiceSettings.voice);
    } catch (error) {
      console.error("Error in voice output:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      id: generateId(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Get memory-enhanced context
      const context = await getMemoryEnhancedContext(input);
      setMemoryContext(context);
      
      // Prepare chat messages for LLM
      const chatMessages: ChatMessage[] = [
        { role: "system", content: generateSystemPromptEnhancement(context) },
        ...messages.map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: input },
      ];
      
      // Send to LLM
      const response = await llmClientRef.current.chat(chatMessages, {
        temperature: llmSettings.temperature,
        maxTokens: llmSettings.maxTokens,
      });
      
      if (response.content) {
        const assistantMessage: Message = {
          text: response.content,
          isUser: false,
          id: generateId(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Update memory with chat message
        const memoryMessage: MemoryChatMessage = {
          role: "assistant",
          content: response.content,
        };
        
        await updateMemoryWithChatMessage(memoryMessage);
        
        // Handle voice output
        await handleVoiceOutput(response.content);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Predictive text
    if (value.length > 3) {
      setPredictiveText(value);
    } else {
      setPredictiveText("");
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Use smart suggestion
  const useSmartSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
  };

  // Use predictive text
  const usePredictiveTextSuggestion = () => {
    if (predictiveText) {
      setInput(predictiveText);
      setPredictiveText("");
    }
  };

  // Download chat history
  const downloadChatHistory = () => {
    const chatHistory = messages
      .map((msg) => `${msg.isUser ? "User" : "Assistant"}: ${msg.text}`)
      .join("\n\n");
    
    const blob = new Blob([chatHistory], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `melani-chat-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialize on component mount
  React.useEffect(() => {
    initializeLLM();
    initializeVoiceService();
    
    return () => {
      // Cleanup
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, []);

  // Update voice state when voiceSettings change
  React.useEffect(() => {
    initializeVoiceService();
  }, [voiceSettings.enabled, voiceSettings.voice]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <span>Melani Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            {memoryContext && (
              <Brain
                className="h-5 w-5 text-blue-500 cursor-pointer"
                title="Memory enhanced responses active"
              />
            )}
            {predictiveText && (
              <Lightbulb
                className="h-5 w-5 text-yellow-500 cursor-pointer"
                onClick={usePredictiveTextSuggestion}
                title="Click to use predictive text"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              disabled={!voiceSettings.enabled}
            >
              {voiceState === "listening" ? (
                <Mic className="h-5 w-5 text-red-500" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={downloadChatHistory}>
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>How can I help you today?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${message.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"}`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}

        {/* Smart suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => useSmartSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>{typeof loadingProgress === "string" ? loadingProgress : `Loading... ${loadingProgress}%`}</span>
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isLoading || !isModelLoaded}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim() || !isModelLoaded}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Predictive text suggestion */}
        {predictiveText && input && (
          <div className="text-sm text-muted-foreground mt-1">
            {input}
            <span className="text-gray-500">
              {predictiveText.slice(input.length)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

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
    try {
      voiceServiceRef.current.onSpeechResult = (text) => {
        setInput(text);
        // Auto-send if enabled
        if (voiceSettings.autoSpeak) {
          setTimeout(() => {
            if (text.trim().length > 0) {
              sendMessage();
            }
          }, 500);
        }
      };

      voiceServiceRef.current.onStateChange = (state) => {
        setVoiceState(state);
      };

      await voiceServiceRef.current.initialize();
      setIsVoiceInputEnabled(voiceSettings.enabled);
    } catch (error) {
      console.error("Failed to initialize voice service:", error);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
    } else {
      voiceServiceRef.current.startListening();
    }
  };

  // Handle voice output
  const handleVoiceOutput = async (text: string) => {
    if (voiceSettings.autoSpeak && text.trim()) {
      try {
        await voiceServiceRef.current.speak(text, voiceSettings.voice);
      } catch (error) {
        console.error("Voice output error:", error);
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      id: generateId(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);

    // Update memory context with user message
    const userChatMessage: MemoryChatMessage = {
      role: "user",
      content: input,
    };
    await updateMemoryWithChatMessage(userChatMessage);

    try {
      setIsLoading(true);
      
      // Get memory-enhanced context for better responses
      const memoryContext = await getMemoryEnhancedContext(userChatMessage.content);
      setMemoryContext(memoryContext);

      // Create the messages array for the LLM
      const chatMessages: ChatMessage[] = [
        { role: "system", content: generateSystemPromptEnhancement(memoryContext) },
        ...messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: userMessage.text },
      ];

      const response = await llmClientRef.current.chat(chatMessages, {
        temperature: llmSettings.temperature || 0.7,
        maxTokens: llmSettings.maxTokens || 1000,
      });

      if (response.content) {
        const assistantMessage: Message = {
          text: response.content,
          isUser: false,
          id: generateId(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Store in memory
        const assistantChatMessage: MemoryChatMessage = {
          role: "assistant",
          content: response.content,
        };
        await updateMemoryWithChatMessage(assistantChatMessage);

        // Handle voice output
        handleVoiceOutput(response.content);
      } else if (response.error) {
        setMessages((prev) => [
          ...prev,
          {
            text: `Error: ${response.error}`,
            isUser: false,
            id: generateId(),
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message || "Unknown error"}`,
          isUser: false,
          id: generateId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Show suggestions based on input
    if (e.target.value.length > 0) {
      setShowSuggestions(true);
      setPredictiveSuggestions(predictiveText.filter(text => 
        text.toLowerCase().includes(e.target.value.toLowerCase())
      ).slice(0, 3));
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    sendMessage();
  };

  // Handle predictive text suggestion
  const usePredictiveTextSuggestion = (text: string) => {
    setInput((prev) => `${prev}${text.slice(prev.length)} `);
  };

  // Download chat history
  const downloadChatHistory = () => {
    const history = messages.map((msg) => 
      `${msg.isUser ? 'You' : 'Assistant'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([history], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melani-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle voice button class
  const getVoiceButtonClass = () => {
    if (voiceState === 'listening') {
      return 'bg-red-500 hover:bg-red-600 animate-pulse';
    } else if (voiceState === 'processing') {
      return 'bg-yellow-500 hover:bg-yellow-600';
    }
    return 'bg-white/10 hover:bg-white/20';
  };

  // Get voice icon based on state
  const VoiceIcon = () => {
    if (voiceState === 'listening' || voiceState === 'processing') {
      return <MicOff className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  // Get provider display name
  const getProviderDisplayName = () => {
    if (llmSettings.provider === 'gemini') {
      return 'Gemini';
    } else if (llmSettings.provider === 'ollama') {
      return `Ollama (${llmSettings.ollamaModel || 'default'})`;
    }
    return llmSettings.provider;
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    toggleVoiceInput();
  };

  // Handle send button click
  const handleSend = () => {
    sendMessage();
  };

  // Initialize on mount
  React.useEffect(() => {
    initializeLLM();
    initializeVoiceService();
    
    return () => {
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, []);

  // Render component
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-black/80 to-gray-900/80 border-white/10">
      <CardHeader className="border-b border-white/10 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-lg font-medium text-white">Melani Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={downloadChatHistory}
              title="Download chat history"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Memory-enhanced context"
              disabled={!memoryContext}
            >
              <Brain className="h-4 w-4" />
            </Button>
            {voiceSettings.autoSpeak && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Voice output enabled"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-white/60 ml-2">
              {getProviderDisplayName()}
            </span>
          </div>
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
// Voice state enum
type VoiceStateType = 'idle' | 'listening' | 'processing';

// Required interfaces for the component
interface LLMConfig {
  provider: string;
  ollamaModel?: string;
  temperature?: number;
  maxTokens?: number;
  progressCallback?: (progress: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface VoiceIcon {
  className?: string;
}

// Main MelaniAssistant component
const MelaniAssistant: React.FC = () => {
  // State management
  const [input, setInput] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = React.useState<boolean>(false);
  const [voiceState, setVoiceState] = React.useState<VoiceStateType>('idle');
  const [isModelLoaded, setIsModelLoaded] = React.useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = React.useState<string>("");
  
  // Memory integration
  const [useMemoryContext, setUseMemoryContext] = React.useState<boolean>(true);
  
  // Smart suggestions integration
  const [predictiveSuggestions, setPredictiveSuggestions] = React.useState<string[]>([]);
  const [voiceInputEnabled, setVoiceInputEnabled] = React.useState<boolean>(true);
  
  // Hooks
  const systemMemory = useSystemMemory();
  const predictiveText = usePredictiveText();
  const smartSuggestions = useSmartSuggestions();
  const memoryStore = useMemoryStore();
  
  // Voice settings
  const voiceSettings = useVoiceSettings();
  
  // LLM settings
  const llmSettings = useLLMSettings();
  
  // Refs
  const llmClientRef = React.useRef<any>(null);
  const voiceServiceRef = React.useRef<any>(null);
  
  // Initialize LLM client
  React.useEffect(() => {
    const initializeLLM = async () => {
      if (systemMemory && systemMemory.addProcess) {
        systemMemory.addProcess('Initializing LLM');
      }
      
      try {
        // Create config object for LLM
        const config: LLMConfig = {
          provider: llmSettings?.provider || 'gemini',
          ollamaModel: llmSettings?.ollamaModel || "llama3",
          progressCallback: (progress) => setLoadingProgress(progress)
        };
        
        if (llmClientRef.current && typeof llmClientRef.current.initialize === 'function') {
          await llmClientRef.current.initialize(config);
          setIsModelLoaded(true);
          
          // Update memory with LLM initialization
          if (useMemoryContext && memoryStore && typeof memoryStore.updateMemoryWithActivity === 'function') {
            memoryStore.updateMemoryWithActivity({
              type: 'system',
              action: 'llm_initialized',
              data: { provider: config.provider }
            });
          }
        }
      }
      } catch (error) {
        console.error('Failed to initialize LLM:', error);
      } finally {
        systemMemory.removeProcess('Initializing LLM');
      }
    };
    
    initializeLLM();
    
    return () => {
      if (llmClientRef.current) {
        llmClientRef.current.dispose();
      }
    };
  }, [llmSettings.provider, llmSettings.ollamaModel, systemMemory, memoryStore, useMemoryContext]);
  
  // Initialize voice service
  React.useEffect(() => {
    if (voiceSettings.voiceInputEnabled || voiceSettings.voiceOutputEnabled) {
      voiceServiceRef.current = new VoiceService();
      
      if (voiceServiceRef.current) {
        voiceServiceRef.current.initialize();
        
        const handleSpeechResult = (text: string) => {
          setInput(text);
          if (text.trim().length > 0) {
            handleSend(text);
          }
        };
        
        const handleStateChange = (state: VoiceState) => {
          setVoiceState(state);
        };
        
        voiceServiceRef.current.onSpeechResult = handleSpeechResult;
        voiceServiceRef.current.onStateChange = handleStateChange;
      }
      
      // Update memory with voice service initialization
      if (useMemoryContext) {
        memoryStore.updateMemoryWithActivity({
          type: 'system',
          action: 'voice_service_initialized',
          data: { 
            inputEnabled: voiceSettings.voiceInputEnabled, 
            outputEnabled: voiceSettings.voiceOutputEnabled 
          }
        });
      }
    }
    
    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.dispose();
      }
    };
  }, [voiceSettings.voiceInputEnabled, voiceSettings.voiceOutputEnabled, memoryStore, useMemoryContext]);
  
  // Handle sending messages
  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input;
    if (!userMessage.trim() || !llmClientRef.current || !isModelLoaded) return;
    
    // Add phrase to predictive text model
    predictiveText.addPhrase(userMessage);
    
    // Create message object with unique ID
    const messageId = generateId();
    const userMessageObj: Message = {
      text: userMessage,
      isUser: true,
      id: messageId
    };
    
    // Add to UI
    setMessages(prev => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      // Track in memory
      if (useMemoryContext) {
        systemMemory.addProcess('Processing chat request');
        
        // Update memory with user message
        const memoryChatMessage: MemoryChatMessage = {
          id: messageId,
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        };
        
        await updateMemoryWithChatMessage(memoryChatMessage);
        
        // Get enhanced context for system prompt
        const memoryContext = await getMemoryEnhancedContext();
        const systemPromptEnhancement = generateSystemPromptEnhancement(memoryContext);
        
        // Base system prompt
        const basePrompt = "You are Melani, an advanced AI assistant. Be helpful, concise, and friendly.";
        
        // Combine with memory enhancement if enabled
        const systemPrompt = useMemoryContext 
          ? `${basePrompt}\n\n${systemPromptEnhancement}` 
          : basePrompt;
        
        // Send to LLM with memory-enhanced context
        const chatMessages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ 
            role: m.isUser ? 'user' : 'assistant', 
            content: m.text 
          })),
          { role: 'user', content: userMessage }
        ];
        
        const response = await llmClientRef.current.chat(chatMessages, { 
          temperature: Number(llmSettings.temperature) || 0.7, 
          maxTokens: Number(llmSettings.maxTokens) || 1024 
        });
        
        if (response.error) {
          console.error('LLM error:', response.error);
          setMessages(prev => [...prev, { 
            text: `Sorry, I encountered an error: ${response.error}`, 
            isUser: false,
            id: generateId() 
          }]);
        } else if (response.content) {
          const responseText = response.content.trim();
          
          // Update UI with response
          const assistantMessageObj: Message = {
            text: responseText,
            isUser: false,
            id: generateId()
          };
          
          setMessages(prev => [...prev, assistantMessageObj]);
          
          // Update memory with assistant response
          if (useMemoryContext) {
            const memoryAssistantMessage: MemoryChatMessage = {
              id: assistantMessageObj.id,
              role: 'assistant',
              content: responseText,
              timestamp: new Date().toISOString()
            };
            
            await updateMemoryWithChatMessage(memoryAssistantMessage);
          }
          
          // Handle voice output if enabled
          if (voiceSettings.voiceOutputEnabled && voiceServiceRef.current) {
            voiceServiceRef.current.speak(responseText, voiceSettings.selectedVoice || undefined);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, an unexpected error occurred.', 
        isUser: false,
        id: generateId() 
      }]);
    } finally {
      setIsLoading(false);
      systemMemory.removeProcess('Processing chat request');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Show suggestions if input is not empty
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleVoiceButtonClick = () => {
    if (!voiceServiceRef.current || !voiceSettings.voiceInputEnabled) return;
    
    if (voiceState === VoiceState.Listening) {
      voiceServiceRef.current.stopListening();
    } else {
      voiceServiceRef.current.startListening();
    }
  };
  
  const getVoiceIcon = () => {
    if (!voiceSettings.voiceInputEnabled) return <Mic className="text-gray-400" />;
    
    switch(voiceState) {
      case VoiceState.Listening:
        return <MicOff />;
      case VoiceState.Processing:
        return <Volume2 className="animate-pulse" />;
      default:
        return <Mic />;
    }
  };
  
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Bot className="mr-2" />
          Melani Assistant
          {useMemoryContext && (
            <span className="ml-2 text-xs flex items-center text-green-500">
              <Brain size={14} className="mr-1" /> Memory Enabled
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Bot size={40} className="mx-auto mb-2" />
                <p>How can I assist you today?</p>
                <p className="text-xs mt-1">Type a message or use voice input</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-tl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-2 border-t relative">
          {showSuggestions && smartSuggestions.getSuggestions && input.trim().length > 0 && (
            <div className="absolute bottom-full left-0 w-full p-2 bg-white border rounded-t-lg shadow-lg">
              <div className="flex flex-wrap gap-2">
                {smartSuggestions.getSuggestions(input).map((suggestion: string, index: number) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => {
                      setInput(suggestion);
                      handleSend(suggestion);
                    }}
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleVoiceButtonClick}
              disabled={!voiceSettings.voiceInputEnabled}
              className={`${voiceState === VoiceState.Listening ? 'text-red-500 animate-pulse' : ''}`}
            >
              {getVoiceIcon()}
            </Button>
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading || !isModelLoaded}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading || !isModelLoaded}
              size="icon"
            >
              <Send />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setUseMemoryContext(prev => !prev)}
              title={useMemoryContext ? "Disable memory context" : "Enable memory context"}
            >
              <Brain className={useMemoryContext ? "text-green-500" : "text-gray-400"} />
            </Button>
          </div>
          {!isModelLoaded && (
            <div className="text-xs text-center mt-1 text-gray-400">
              Initializing AI model...
              <Download className="inline ml-1 w-3 h-3 animate-bounce" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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
    try {
      voiceServiceRef.current.onSpeechResult = (text) => {
        setInput(text);
        // Auto-send if enabled
        if (voiceSettings.autoSpeak) {
          setTimeout(() => {
            if (text.trim().length > 0) {
              sendMessage();
            }
          }, 500);
        }
      };

      voiceServiceRef.current.onStateChange = (state) => {
        setVoiceState(state);
      };

      await voiceServiceRef.current.initialize();
      setIsVoiceInputEnabled(voiceSettings.enabled);
    } catch (error) {
      console.error("Failed to initialize voice service:", error);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
    } else {
      voiceServiceRef.current.startListening();
    }
  };

  // Handle voice output
  const handleVoiceOutput = async (text: string) => {
    if (voiceSettings.autoSpeak && text.trim()) {
      try {
        await voiceServiceRef.current.speak(text, voiceSettings.voice);
      } catch (error) {
        console.error("Voice output error:", error);
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      id: generateId(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);

    // Update memory context with user message
    const userChatMessage: MemoryChatMessage = {
      role: "user",
      content: input,
    };
    await updateMemoryWithChatMessage(userChatMessage);

    try {
      setIsLoading(true);
      
      // Get memory-enhanced context for better responses
      const memoryContext = await getMemoryEnhancedContext(userChatMessage.content);
      setMemoryContext(memoryContext);

      // Create the messages array for the LLM
      const chatMessages: ChatMessage[] = [
        { role: "system", content: generateSystemPromptEnhancement(memoryContext) },
        ...messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: userMessage.text },
      ];

      const response = await llmClientRef.current.chat(chatMessages, {
        temperature: llmSettings.temperature || 0.7,
        maxTokens: llmSettings.maxTokens || 1000,
      });

      if (response.content) {
        const assistantMessage: Message = {
          text: response.content,
          isUser: false,
          id: generateId(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Store in memory
        const assistantChatMessage: MemoryChatMessage = {
          role: "assistant",
          content: response.content,
        };
        await updateMemoryWithChatMessage(assistantChatMessage);

        // Handle voice output
        handleVoiceOutput(response.content);
      } else if (response.error) {
        setMessages((prev) => [
          ...prev,
          {
            text: `Error: ${response.error}`,
            isUser: false,
            id: generateId(),
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message || "Unknown error"}`,
          isUser: false,
          id: generateId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Show suggestions based on input
    if (e.target.value.length > 0) {
      setShowSuggestions(true);
      setPredictiveSuggestions(predictiveText.filter(text => 
        text.toLowerCase().includes(e.target.value.toLowerCase())
      ).slice(0, 3));
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    sendMessage();
  };

  // Handle predictive text suggestion
  const usePredictiveTextSuggestion = (text: string) => {
    setInput((prev) => `${prev}${text.slice(prev.length)} `);
  };

  // Download chat history
  const downloadChatHistory = () => {
    const history = messages.map((msg) => 
      `${msg.isUser ? 'You' : 'Assistant'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([history], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melani-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle voice button class
  const getVoiceButtonClass = () => {
    if (voiceState === 'listening') {
      return 'bg-red-500 hover:bg-red-600 animate-pulse';
    } else if (voiceState === 'processing') {
      return 'bg-yellow-500 hover:bg-yellow-600';
    }
    return 'bg-white/10 hover:bg-white/20';
  };

  // Get voice icon based on state
  const VoiceIcon = () => {
    if (voiceState === 'listening' || voiceState === 'processing') {
      return <MicOff className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  // Get provider display name
  const getProviderDisplayName = () => {
    if (llmSettings.provider === 'gemini') {
      return 'Gemini';
    } else if (llmSettings.provider === 'ollama') {
      return `Ollama (${llmSettings.ollamaModel || 'default'})`;
    }
    return llmSettings.provider;
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    toggleVoiceInput();
  };

  // Handle send button click
  const handleSend = () => {
    sendMessage();
  };

  // Initialize on mount
  React.useEffect(() => {
    initializeLLM();
    initializeVoiceService();
    
    return () => {
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, []);

  // Render component
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-black/80 to-gray-900/80 border-white/10">
      <CardHeader className="border-b border-white/10 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-lg font-medium text-white">Melani Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={downloadChatHistory}
              title="Download chat history"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Memory-enhanced context"
              disabled={!memoryContext}
            >
              <Brain className="h-4 w-4" />
            </Button>
            {voiceSettings.autoSpeak && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Voice output enabled"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-white/60 ml-2">
              {getProviderDisplayName()}
            </span>
          </div>
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
interface MessageProps {
  text: string;
  isUser: boolean;
  id: string;
}

// Define message type for our component
interface Message extends MessageProps {}

const MelaniAssistant: React.FC = () => {
  // State management
  const [input, setInput] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = React.useState<boolean>(false);
  const [voiceState, setVoiceState] = React.useState<VoiceState>(VoiceState.Idle);
  const [isModelLoaded, setIsModelLoaded] = React.useState<boolean>(false);
  
  // Memory integration
  const [useMemoryContext, setUseMemoryContext] = React.useState<boolean>(true);
  const { addProcess, removeProcess } = useSystemMemory();
  const { predictText, addPhrase } = usePredictiveText();
  const { getSuggestions } = useSmartSuggestions();
  const { updateMemoryWithActivity, updateMemory } = useMemoryStore();
  
  // Voice settings
  const { voiceInputEnabled, voiceOutputEnabled, selectedVoice } = useVoiceSettings();
  
  // LLM settings
  const { provider, temperature, maxTokens, ollamaModel } = useLLMSettings();
  
  // Refs
  const llmClientRef = React.useRef<LLMClient | null>(null);
  const voiceServiceRef = React.useRef<VoiceService | null>(null);
  
  // Initialize LLM client
  React.useEffect(() => {
    const initializeLLM = async () => {
      addProcess('Initializing LLM');
      
      try {
        llmClientRef.current = new LLMClient({
          provider,
          temperature,
          maxTokens,
          ollamaModel
        });
        
        await llmClientRef.current.initialize();
        setIsModelLoaded(true);
        
        // Update memory with LLM initialization
        if (useMemoryContext) {
          updateMemoryWithActivity({
            type: 'system',
            action: 'llm_initialized',
            data: { provider }
          });
        }
      } catch (error) {
        console.error('Failed to initialize LLM:', error);
      } finally {
        removeProcess('Initializing LLM');
      }
    };
    
    initializeLLM();
    
    return () => {
      if (llmClientRef.current) {
        llmClientRef.current.dispose();
      }
    };
  }, [provider, temperature, maxTokens, ollamaModel, addProcess, removeProcess, updateMemoryWithActivity, useMemoryContext]);
  
  // Initialize voice service
  React.useEffect(() => {
    if (voiceInputEnabled || voiceOutputEnabled) {
      voiceServiceRef.current = new VoiceService();
      
      if (voiceServiceRef.current) {
        voiceServiceRef.current.initialize();
        
        const handleSpeechResult = (text: string) => {
          setInput(text);
          if (text.trim().length > 0) {
            handleSend(text);
          }
        };
        
        const handleStateChange = (state: VoiceState) => {
          setVoiceState(state);
        };
        
        voiceServiceRef.current.onSpeechResult = handleSpeechResult;
        voiceServiceRef.current.onStateChange = handleStateChange;
      }
      
      // Update memory with voice service initialization
      if (useMemoryContext) {
        updateMemoryWithActivity({
          type: 'system',
          action: 'voice_service_initialized',
          data: { inputEnabled: voiceInputEnabled, outputEnabled: voiceOutputEnabled }
        });
      }
    }
    
    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.dispose();
      }
    };
  }, [voiceInputEnabled, voiceOutputEnabled, updateMemoryWithActivity, useMemoryContext]);
  
  // Handle sending messages
  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input;
    if (!userMessage.trim() || !llmClientRef.current || !isModelLoaded) return;
    
    // Add phrase to predictive text model
    addPhrase(userMessage);
    
    // Create message object with unique ID
    const messageId = generateId();
    const userMessageObj: Message = {
      text: userMessage,
      isUser: true,
      id: messageId
    };
    
    // Add to UI
    setMessages(prev => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    
    // Track in memory
    if (useMemoryContext) {
      addProcess('Processing chat request');
      
      // Update memory with user message
      const memoryChatMessage: MemoryChatMessage = {
        id: messageId,
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      
      await updateMemoryWithChatMessage(memoryChatMessage);
      
      // Get enhanced context for system prompt
      const memoryContext = await getMemoryEnhancedContext();
      const systemPromptEnhancement = generateSystemPromptEnhancement(memoryContext);
      
      // Base system prompt
      const basePrompt = "You are Melani, an advanced AI assistant. Be helpful, concise, and friendly.";
      
      // Combine with memory enhancement if enabled
      const systemPrompt = useMemoryContext 
        ? `${basePrompt}\n\n${systemPromptEnhancement}` 
        : basePrompt;
      
      try {
        // Send to LLM with memory-enhanced context
        const chatMessages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ 
            role: m.isUser ? 'user' : 'assistant', 
            content: m.text 
          })),
          { role: 'user', content: userMessage }
        ];
        
        const response = await llmClientRef.current.chat(chatMessages, { 
          temperature, 
          maxTokens 
        });
        
        if (response.error) {
          console.error('LLM error:', response.error);
          setMessages(prev => [...prev, { 
            text: `Sorry, I encountered an error: ${response.error}`, 
            isUser: false,
            id: generateId() 
          }]);
        } else if (response.content) {
          const responseText = response.content.trim();
          
          // Update UI with response
          const assistantMessageObj: Message = {
            text: responseText,
            isUser: false,
            id: generateId()
          };
          
          setMessages(prev => [...prev, assistantMessageObj]);
          
          // Update memory with assistant response
          if (useMemoryContext) {
            const memoryAssistantMessage: MemoryChatMessage = {
              id: assistantMessageObj.id,
              role: 'assistant',
              content: responseText,
              timestamp: new Date().toISOString()
            };
            
            await updateMemoryWithChatMessage(memoryAssistantMessage);
          }
          
          // Handle voice output if enabled
          if (voiceOutputEnabled && voiceServiceRef.current) {
            voiceServiceRef.current.speak(responseText, selectedVoice || undefined);
          }
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, { 
          text: 'Sorry, an unexpected error occurred.', 
          isUser: false,
          id: generateId() 
        }]);
      } finally {
        setIsLoading(false);
        removeProcess('Processing chat request');
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Show suggestions if input is not empty
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleVoiceButtonClick = () => {
    if (!voiceServiceRef.current || !voiceInputEnabled) return;
    
    if (voiceState === VoiceState.Idle) {
      voiceServiceRef.current.startListening();
    } else if (voiceState === VoiceState.Listening) {
      voiceServiceRef.current.stopListening();
    }
  };
  
  const getVoiceIcon = () => {
    if (!voiceInputEnabled) return <Mic className="text-gray-400" />;
    
    if (voiceState === VoiceState.Listening) {
      return <MicOff />;
    } else if (voiceState === VoiceState.Processing) {
      return <Volume2 className="animate-pulse" />;
    } else {
      return <Mic />;
    }
  };
  
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Bot className="mr-2" />
          Melani Assistant
          {useMemoryContext && (
            <span className="ml-2 text-xs flex items-center text-green-500">
              <Brain size={14} className="mr-1" /> Memory Enabled
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Bot size={40} className="mx-auto mb-2" />
                <p>How can I assist you today?</p>
                <p className="text-xs mt-1">Type a message or use voice input</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-tl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-2 border-t relative">
          {showSuggestions && getSuggestions && input.trim().length > 0 && (
            <div className="absolute bottom-full left-0 w-full p-2 bg-white border rounded-t-lg shadow-lg">
              <div className="flex flex-wrap gap-2">
                {getSuggestions(input).map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => {
                      setInput(suggestion);
                      handleSend(suggestion);
                    }}
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleVoiceButtonClick}
              disabled={!voiceInputEnabled}
              className={`${voiceState === VoiceState.Listening ? 'text-red-500 animate-pulse' : ''}`}
            >
              {getVoiceIcon()}
            </Button>
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading || !isModelLoaded}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading || !isModelLoaded}
              size="icon"
            >
              <Send />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setUseMemoryContext(prev => !prev)}
              title={useMemoryContext ? "Disable memory context" : "Enable memory context"}
            >
              <Brain className={useMemoryContext ? "text-green-500" : "text-gray-400"} />
            </Button>
          </div>
          {!isModelLoaded && (
            <div className="text-xs text-center mt-1 text-gray-400">
              Initializing AI model...
              <Download className="inline ml-1 w-3 h-3 animate-bounce" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

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
    try {
      voiceServiceRef.current.onSpeechResult = (text) => {
        setInput(text);
        // Auto-send if enabled
        if (voiceSettings.autoSpeak) {
          setTimeout(() => {
            if (text.trim().length > 0) {
              sendMessage();
            }
          }, 500);
        }
      };

      voiceServiceRef.current.onStateChange = (state) => {
        setVoiceState(state);
      };

      await voiceServiceRef.current.initialize();
      setIsVoiceInputEnabled(voiceSettings.enabled);
    } catch (error) {
      console.error("Failed to initialize voice service:", error);
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
    } else {
      voiceServiceRef.current.startListening();
    }
  };

  // Handle voice output
  const handleVoiceOutput = async (text: string) => {
    if (voiceSettings.autoSpeak && text.trim()) {
      try {
        await voiceServiceRef.current.speak(text, voiceSettings.voice);
      } catch (error) {
        console.error("Voice output error:", error);
      }
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      id: generateId(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowSuggestions(false);

    // Update memory context with user message
    const userChatMessage: MemoryChatMessage = {
      role: "user",
      content: input,
    };
    await updateMemoryWithChatMessage(userChatMessage);

    try {
      setIsLoading(true);
      
      // Get memory-enhanced context for better responses
      const memoryContext = await getMemoryEnhancedContext(userChatMessage.content);
      setMemoryContext(memoryContext);

      // Create the messages array for the LLM
      const chatMessages: ChatMessage[] = [
        { role: "system", content: generateSystemPromptEnhancement(memoryContext) },
        ...messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        })),
        { role: "user", content: userMessage.text },
      ];

      const response = await llmClientRef.current.chat(chatMessages, {
        temperature: llmSettings.temperature || 0.7,
        maxTokens: llmSettings.maxTokens || 1000,
      });

      if (response.content) {
        const assistantMessage: Message = {
          text: response.content,
          isUser: false,
          id: generateId(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Store in memory
        const assistantChatMessage: MemoryChatMessage = {
          role: "assistant",
          content: response.content,
        };
        await updateMemoryWithChatMessage(assistantChatMessage);

        // Handle voice output
        handleVoiceOutput(response.content);
      } else if (response.error) {
        setMessages((prev) => [
          ...prev,
          {
            text: `Error: ${response.error}`,
            isUser: false,
            id: generateId(),
          },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message || "Unknown error"}`,
          isUser: false,
          id: generateId(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    // Show suggestions based on input
    if (e.target.value.length > 0) {
      setShowSuggestions(true);
      setPredictiveSuggestions(predictiveText.filter(text => 
        text.toLowerCase().includes(e.target.value.toLowerCase())
      ).slice(0, 3));
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    sendMessage();
  };

  // Handle predictive text suggestion
  const usePredictiveTextSuggestion = (text: string) => {
    setInput((prev) => `${prev}${text.slice(prev.length)} `);
  };

  // Download chat history
  const downloadChatHistory = () => {
    const history = messages.map((msg) => 
      `${msg.isUser ? 'You' : 'Assistant'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([history], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melani-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle voice button class
  const getVoiceButtonClass = () => {
    if (voiceState === 'listening') {
      return 'bg-red-500 hover:bg-red-600 animate-pulse';
    } else if (voiceState === 'processing') {
      return 'bg-yellow-500 hover:bg-yellow-600';
    }
    return 'bg-white/10 hover:bg-white/20';
  };

  // Get voice icon based on state
  const VoiceIcon = () => {
    if (voiceState === 'listening' || voiceState === 'processing') {
      return <MicOff className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  // Get provider display name
  const getProviderDisplayName = () => {
    if (llmSettings.provider === 'gemini') {
      return 'Gemini';
    } else if (llmSettings.provider === 'ollama') {
      return `Ollama (${llmSettings.ollamaModel || 'default'})`;
    }
    return llmSettings.provider;
  };

  // Handle voice toggle
  const handleVoiceToggle = () => {
    toggleVoiceInput();
  };

  // Handle send button click
  const handleSend = () => {
    sendMessage();
  };

  // Initialize on mount
  React.useEffect(() => {
    initializeLLM();
    initializeVoiceService();
    
    return () => {
      llmClientRef.current.dispose();
      voiceServiceRef.current.dispose();
    };
  }, []);

  // Render component
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-black/80 to-gray-900/80 border-white/10">
      <CardHeader className="border-b border-white/10 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-lg font-medium text-white">Melani Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={downloadChatHistory}
              title="Download chat history"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Memory-enhanced context"
              disabled={!memoryContext}
            >
              <Brain className="h-4 w-4" />
            </Button>
            {voiceSettings.autoSpeak && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Voice output enabled"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-white/60 ml-2">
              {getProviderDisplayName()}
            </span>
          </div>
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

// Using a simple UUID function since we may not have uuid package with types
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const MelaniAssistant = () => {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Array<{ text: string; isUser: boolean; id: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isModelLoaded, setIsModelLoaded] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState("");
  const [voiceState, setVoiceState] = React.useState<VoiceState>('idle');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [useMemoryContext, setUseMemoryContext] = React.useState(true);
  
  const llmClientRef = React.useRef<LLMClient | null>(null);
  const voiceServiceRef = React.useRef<VoiceService | null>(null);
  const systemMemory = useSystemMemory();
  const voiceSettings = useVoiceSettings();
  const llmSettings = useLLMSettings();
  const smartSuggestions = useSmartSuggestions();
  const predictiveText = usePredictiveText();
  
  // Memory system integration
  const memoryStore = useMemoryStore();

  React.useEffect(() => {
    systemMemory.addProcess("Melani Assistant", 256);
    return () => systemMemory.removeProcess("Melani Assistant");
  }, [systemMemory]);

  React.useEffect(() => {
    initializeLLM();
  }, [llmSettings.provider, llmSettings.geminiApiKey, llmSettings.ollamaUrl, llmSettings.ollamaModel]);

  React.useEffect(() => {
    if (!voiceServiceRef.current) {
      voiceServiceRef.current = new VoiceService();
      
      voiceServiceRef.current.onStateChange((state) => {
        setVoiceState(state);
      });

      voiceServiceRef.current.onTranscript((transcript) => {
        if (transcript.trim()) {
          setInput(transcript);
          handleSend(transcript);
        }
      });
    }

    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.stopListening();
        voiceServiceRef.current.stopSpeaking();
      }
    };
  }, []);

  const initializeLLM = async () => {
    if (!llmClientRef.current) {
      llmClientRef.current = new LLMClient();
    }

    if (!isModelLoaded) {
      try {
        setIsLoading(true);
        setLoadingProgress("Initializing LLM...");
        systemMemory.addProcess("LLM Initialization", 512);

        await llmClientRef.current.initialize({
          provider: llmSettings.provider,
          geminiApiKey: llmSettings.geminiApiKey,
          ollamaUrl: llmSettings.ollamaUrl, 
          ollamaModel: llmSettings.ollamaModel,
          progressCallback: (progress) => {
            setLoadingProgress(progress);
          }
        });

        setIsModelLoaded(true);
      } catch (error: any) {
        console.error("Error initializing LLM:", error);
        setLoadingProgress(`Error: ${error.message || 'Unknown error'}`);  
      } finally {
        setIsLoading(false);
        systemMemory.removeProcess("LLM Initialization");
      }
      
      // Error handling message
      if (!isModelLoaded) {
        setMessages([
          { text: "Oops! I had trouble loading my brain. Check your settings and try again?", isUser: false },
        ]);
      }
    }
    
    try {
      removeProcess("Model Loading");
    } catch (error) {
      console.error("Failed to initialize LLM:", error);
      setMessages([
        { text: "Oops! I had trouble loading my brain. Try refreshing the page?", isUser: false },
      ]);
      removeProcess("Model Loading");
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = () => {
    const saved = localStorage.getItem('melani-profile');
    return saved ? JSON.parse(saved) : null;
  };

  const getEnhancedContext = () => {
    const currentTime = new Date();
    const timeOfDay = currentTime.getHours() >= 5 && currentTime.getHours() < 12 ? 'morning' :
                     currentTime.getHours() >= 12 && currentTime.getHours() < 17 ? 'afternoon' :
                     currentTime.getHours() >= 17 && currentTime.getHours() < 20 ? 'evening' : 'night';
    
    const smartSuggestions = getSmartSuggestions(3);
    const mostUsedApps = getMostUsedApps(timeOfDay);
    
    return {
      timeOfDay,
      currentTime: currentTime.toLocaleString(),
      smartSuggestions,
      mostUsedApps,
      dayOfWeek: currentTime.toLocaleDateString('en-US', { weekday: 'long' })
    };
  };

  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || !isModelLoaded || !llmClientRef.current) return;
    
    // Add to predictive text learning
    addPhrase(userMessage);
    
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);
    
    try {
      addProcess("Message Processing", 64);
      
      const profile = getProfile();
      const context = getEnhancedContext();
      
      const systemPrompt = `You are Melani, a casual and slightly snarky AI assistant with enhanced contextual awareness. Keep responses conversational and brief (1-2 lines) unless a detailed explanation is needed.

Current Context:
- Time: ${context.currentTime} (${context.timeOfDay})
- Day: ${context.dayOfWeek}
- User's most used apps right now: ${context.mostUsedApps.join(', ')}
- Smart suggestions: ${context.smartSuggestions.join(', ')}

User Profile:
- Name: ${profile?.name || 'Unknown'}
- Interests: ${profile?.interests?.join(', ') || 'Unknown'}

Previous context: ${messages.slice(-3).map(m => `${m.isUser ? 'User' : 'Melani'}: ${m.text}`).join('\n')}

Use this contextual information naturally in your responses. If the user asks about productivity, reference their usage patterns. If they ask for app recommendations, use the smart suggestions. Be helpful and proactive!`;

      const response = await llmClientRef.current.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ], {
        temperature: 0.7,
        maxTokens: 200,
      });

      const responseText = response.content || response.error || "Sorry, I didn't catch that. Mind trying again?";
      
      setMessages(prev => [...prev, { text: responseText, isUser: false }]);
      
      // Speak the response if voice output is enabled
      if (voiceOutputEnabled && voiceServiceRef.current && response.content) {
        voiceServiceRef.current.speak(response.content, selectedVoice);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        text: "Oops, something went wrong. Mind trying again?",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
      removeProcess("Message Processing");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Show predictive suggestions
    if (value.length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const handleVoiceToggle = () => {
    if (!voiceServiceRef.current || !voiceInputEnabled) return;

    if (voiceState === 'idle') {
      voiceServiceRef.current.startListening();
    } else if (voiceState === 'listening') {
      voiceServiceRef.current.stopListening();
    }
  };

  const getVoiceIcon = () => {
    if (!voiceInputEnabled) return MicOff;
    if (voiceState === 'listening') return Volume2;
    return Mic;
  };

  const getVoiceButtonClass = () => {
    let baseClass = "bg-white/10 hover:bg-white/20 transition-all duration-200";
    
    if (voiceState === 'listening') {
      baseClass += " animate-pulse bg-blue-500/30 hover:bg-blue-500/40";
    } else if (voiceState === 'speaking') {
      baseClass += " bg-green-500/30 hover:bg-green-500/40";
    } else if (voiceState === 'processing') {
      baseClass += " bg-yellow-500/30 hover:bg-yellow-500/40";
    }
    
    return baseClass;
  };

  const VoiceIcon = getVoiceIcon();

  const getProviderDisplayName = () => {
    switch (provider) {
      case 'webllm': return 'TinyLlama-1.1B (Local)';
      case 'gemini': return 'Google Gemini';
      case 'ollama': return `Ollama (${ollamaModel})`;
      default: return 'Unknown';
    }
  };

  const predictiveSuggestions = showSuggestions ? getSuggestions(input, 3) : [];

  return (
    <Card className="glass-effect h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Bot className="w-5 h-5" />
        <CardTitle className="text-lg">Melani Assistant</CardTitle>
        <div title="Enhanced with AI">
          <Brain className="w-4 h-4 text-blue-400" />
        </div>
        {!isModelLoaded && (
          <Download className="w-4 h-4 animate-bounce" />
        )}
        {voiceState === 'speaking' && (
          <Volume2 className="w-4 h-4 animate-pulse text-green-400" />
        )}
        <div className="text-xs text-gray-400 ml-auto">
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
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              onFocus={() => input.length > 1 && setShowSuggestions(true)}
            />
            
            {voiceInputEnabled && voiceServiceRef.current?.isSupported() && (
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
                <VoiceIcon className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={() => handleSend()}
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
