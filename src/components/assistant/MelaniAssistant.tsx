
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, Download } from "lucide-react";
import { useSystemMemory } from "@/lib/systemMemory";
import * as webllm from "@mlc-ai/web-llm";

const MelaniAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hey there! I'm Melani. I'm loading up my brain... give me a moment!", isUser: false },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState("");
  const engineRef = useRef<webllm.MLCEngineInterface | null>(null);
  const { addProcess, removeProcess } = useSystemMemory();

  useEffect(() => {
    addProcess("Melani Assistant", 256);
    return () => removeProcess("Melani Assistant");
  }, []);

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    try {
      setIsLoading(true);
      addProcess("Model Loading", 512);
      
      const initProgressCallback = (report: webllm.InitProgressReport) => {
        setLoadingProgress(`${report.text} (${(report.progress * 100).toFixed(1)}%)`);
      };

      const engine = await webllm.CreateMLCEngine(
        "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
        {
          initProgressCallback,
        }
      );

      engineRef.current = engine;
      setIsModelLoaded(true);
      setLoadingProgress("");
      
      // Update the welcome message
      setMessages([
        { text: "Hey there! I'm Melani, now running locally on your device. What's on your mind?", isUser: false },
      ]);
      
      removeProcess("Model Loading");
    } catch (error) {
      console.error("Failed to initialize WebLLM:", error);
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

  const handleSend = async () => {
    if (!input.trim() || !isModelLoaded || !engineRef.current) return;
    
    const userMessage = input.trim();
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

      const completion = await engineRef.current.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const response = completion.choices[0]?.message?.content || "Sorry, I didn't catch that. Mind trying again?";
      
      setMessages(prev => [...prev, { text: response, isUser: false }]);
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

  return (
    <Card className="glass-effect h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Bot className="w-5 h-5" />
        <CardTitle className="text-lg">Melani Assistant</CardTitle>
        {!isModelLoaded && (
          <Download className="w-4 h-4 animate-bounce" />
        )}
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
            placeholder={isModelLoaded ? "Type your message..." : "Loading model..."}
            className="glass-effect"
            disabled={!isModelLoaded || isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            onClick={handleSend}
            className="bg-white/10 hover:bg-white/20"
            disabled={!isModelLoaded || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MelaniAssistant;
