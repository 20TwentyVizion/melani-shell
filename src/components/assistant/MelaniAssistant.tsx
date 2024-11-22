import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";
import { useSystemMemory } from "@/lib/systemMemory";
import { GoogleGenerativeAI } from "@google/generative-ai";

const MelaniAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hey there! I'm Melani. What's on your mind?", isUser: false },
  ]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');
  const { addProcess, removeProcess } = useSystemMemory();

  useEffect(() => {
    addProcess("Melani Assistant", 256);
    return () => removeProcess("Melani Assistant");
  }, []);

  const getProfile = () => {
    const saved = localStorage.getItem('melani-profile');
    return saved ? JSON.parse(saved) : null;
  };

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    
    try {
      addProcess("Message Processing", 64);
      
      const profile = getProfile();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are Melani, a casual and slightly snarky AI assistant. Keep responses conversational and brief (1-2 lines) unless a detailed explanation is needed.
        User's name: ${profile?.name || 'Unknown'}
        User's interests: ${profile?.interests?.join(', ') || 'Unknown'}
        
        Previous context: ${messages.slice(-3).map(m => `${m.isUser ? 'User' : 'Melani'}: ${m.text}`).join('\n')}
        
        User's message: ${userMessage}
        
        Respond naturally without directly mentioning the user's profile information unless relevant to the conversation.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Oops, something went wrong. Mind trying again?",
        isUser: false
      }]);
    } finally {
      removeProcess("Message Processing");
    }
  };

  return (
    <Card className="glass-effect h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Bot className="w-5 h-5" />
        <CardTitle className="text-lg">Melani Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
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
        </div>
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="glass-effect"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button
            onClick={handleSend}
            className="bg-white/10 hover:bg-white/20"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MelaniAssistant;