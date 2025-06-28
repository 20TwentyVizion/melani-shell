
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, Download, Mic, MicOff, Volume2 } from "lucide-react";
import { useSystemMemory } from "@/lib/systemMemory";
import { useVoiceSettings } from "@/lib/voiceSettings";
import { useLLMSettings } from "@/lib/llmSettings";
import { VoiceService, VoiceState } from "@/lib/voiceService";
import { LLMClient } from "@/lib/llmClient";

const MelaniAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hey there! I'm Melani. I'm loading up my brain... give me a moment!", isUser: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  
  const llmClientRef = useRef<LLMClient | null>(null);
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const { addProcess, removeProcess } = useSystemMemory();
  const { voiceInputEnabled, voiceOutputEnabled, selectedVoice } = useVoiceSettings();
  const { provider, geminiApiKey, ollamaUrl, ollamaModel } = useLLMSettings();

  useEffect(() => {
    addProcess("Melani Assistant", 256);
    return () => removeProcess("Melani Assistant");
  }, []);

  useEffect(() => {
    initializeLLM();
  }, [provider, geminiApiKey, ollamaUrl, ollamaModel]);

  useEffect(() => {
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
    try {
      setIsLoading(true);
      setIsModelLoaded(false);
      addProcess("Model Loading", 512);
      
      // Create new LLM client with current settings
      llmClientRef.current = new LLMClient({
        provider,
        apiKey: geminiApiKey,
        ollamaUrl,
        model: ollamaModel,
      });

      const onProgress = (progress: string) => {
        setLoadingProgress(progress);
      };

      const success = await llmClientRef.current.initialize(onProgress);
      
      if (success) {
        setIsModelLoaded(true);
        setLoadingProgress("");
        
        // Update the welcome message based on provider
        const welcomeMessages = {
          webllm: "Hey there! I'm Melani, now running locally on your device. What's on your mind?",
          gemini: "Hey there! I'm Melani, powered by Google Gemini. What can I help you with?",
          ollama: "Hey there! I'm Melani, running on your local Ollama instance. How can I assist you?"
        };
        
        setMessages([
          { text: welcomeMessages[provider], isUser: false },
        ]);
      } else {
        setMessages([
          { text: "Oops! I had trouble loading my brain. Check your settings and try again?", isUser: false },
        ]);
      }
      
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

  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || !isModelLoaded || !llmClientRef.current) return;
    
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    setIsLoading(true);
    
    try {
      addProcess("Message Processing", 64);
      
      const profile = getProfile();
      const systemPrompt = `You are Melani, a casual and slightly snarky AI assistant. Keep responses conversational and brief (1-2 lines) unless a detailed explanation is needed.
User's name: ${profile?.name || 'Unknown'}
User's interests: ${profile?.interests?.join(', ') || 'Unknown'}

Previous context: ${messages.slice(-3).map(m => `${m.isUser ? 'User' : 'Melani'}: ${m.text}`).join('\n')}

Respond naturally without directly mentioning the user's profile information unless relevant to the conversation.`;

      const response = await llmClientRef.current.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ], {
        temperature: 0.7,
        maxTokens: 150,
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

  return (
    <Card className="glass-effect h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Bot className="w-5 h-5" />
        <CardTitle className="text-lg">Melani Assistant</CardTitle>
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
        
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              voiceState === 'listening' ? "Listening..." :
              voiceState === 'processing' ? "Processing..." :
              isModelLoaded ? "Type your message..." : "Loading model..."
            }
            className="glass-effect"
            disabled={!isModelLoaded || isLoading || voiceState === 'listening'}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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
      </CardContent>
    </Card>
  );
};

export default MelaniAssistant;
