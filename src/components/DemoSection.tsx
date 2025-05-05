
import { Button } from "@/components/ui/button";
import { useState } from "react";

const DemoSection = () => {
  const [activeDemo, setActiveDemo] = useState<number>(1);
  const [userMessage, setUserMessage] = useState("");
  const [conversation, setConversation] = useState([
    {
      role: "ai",
      message: "Hi there! I'm Socratix, your AI tutor. Let's explore a topic together. What would you like to understand better today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userMessage.trim()) return;
    
    // Add user message to conversation
    setConversation([
      ...conversation,
      { role: "user", message: userMessage },
    ]);
    
    // Clear input
    setUserMessage("");
    
    // Simulate AI typing
    setIsTyping(true);
    
    // Simulate AI response after delay
    setTimeout(() => {
      setIsTyping(false);
      
      let response;
      if (conversation.length === 1) {
        response = "Let's explore that topic. What's your current understanding of it?";
      } else if (conversation.length === 3) {
        response = "That's a good starting point. I'm curious—why do you think that's the case? What principles might govern this?";
      } else if (conversation.length === 5) {
        response = "Interesting perspective. Consider this scenario: [example scenario]. How might your understanding apply here?";
      } else {
        response = "You're making great connections. This relates to several key principles. What questions do you still have about this topic?";
      }
      
      setConversation((prev) => [
        ...prev,
        { role: "ai", message: response },
      ]);
    }, 1500);
  };

  const demoTabs = [
    { id: 1, title: "Physics" },
    { id: 2, title: "Literature" },
    { id: 3, title: "Mathematics" },
  ];

  return (
    <section id="demo" className="py-20 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Try <span className="gradient-text">Socratix</span> Demo
          </h2>

          <div className="glass-card p-6 md:p-8 overflow-hidden">
            {/* Demo Navigation Tabs */}
            <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
              {demoTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDemo(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeDemo === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Demo Chat Interface */}
            <div className="bg-background rounded-lg border border-border h-[400px] md:h-[500px] flex flex-col">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span className="font-medium">Socratix AI Tutor</span>
                <span className="text-xs text-muted-foreground ml-2">Online</span>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      entry.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-2 ${
                        entry.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                      }`}
                    >
                      {entry.message}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg rounded-tl-none px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question about your topic..."
                    className="flex-1 px-4 py-2 rounded-full bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    value={userMessage}
                    onChange={handleInputChange}
                  />
                  <Button type="submit" size="sm" className="rounded-full">
                    Send
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              This is a demo simulation. The full version offers more advanced features and real-time responses.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
