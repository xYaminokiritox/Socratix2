
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm your Socratix learning assistant. What questions do you have about this topic?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "That's an interesting question! Let me ask you: what do you already know about this concept?",
        "Great question. To understand this better, could you explain why you think this happens?",
        "I see where you're going with this. Instead of giving you the answer directly, let's break it down. What are the key components involved?",
        "Let's approach this from a different angle. What would happen if the conditions were different?",
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Socratix Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto mb-4 space-y-4 px-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p>{message.content}</p>
              <div
                className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted max-w-[80%] rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 border-t">
        <div className="w-full flex gap-2">
          <Textarea
            placeholder="Type your question here..."
            className="resize-none flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
