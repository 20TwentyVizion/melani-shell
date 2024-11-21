import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const MelaniAssistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! I'm Melani, your personal assistant. How can I help you today?", isUser: false },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { text: input, isUser: true }]);
    setInput("");
    
    // Placeholder response (replace with actual API integration)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "I'm still being configured. Please try again later!",
        isUser: false
      }]);
    }, 1000);
  };

  return (
    <Card className="glass-effect h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg text-neon-cyan">Melani Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.isUser
                    ? 'bg-neon-cyan/20 text-white'
                    : 'bg-neon-magenta/20 text-white'
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
            className="bg-neon-cyan/20 hover:bg-neon-cyan/30"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MelaniAssistant;