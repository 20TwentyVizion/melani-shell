import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";
import { useSystemMemory } from "@/lib/systemMemory";

const MelaniAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! I'm Melani, your personal assistant. How can I help you today?", isUser: false },
  ]);
  
  const { addProcess, removeProcess } = useSystemMemory();

  useEffect(() => {
    // Register Melani as a process
    addProcess("Melani Assistant", 256); // Allocate 256MB
    
    return () => {
      removeProcess("melani-assistant");
    };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { text: input, isUser: true }]);
    setInput("");
    
    // Simulate memory usage for each message
    addProcess(`Message Processing`, 1);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "I'm still being configured. Please try again later!",
        isUser: false
      }]);
      removeProcess(`Message Processing`);
    }, 1000);
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