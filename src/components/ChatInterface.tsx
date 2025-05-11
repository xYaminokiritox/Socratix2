
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { ConversationMessage, addMessage, callSocraticTutor, updateSessionEvaluation } from "@/services/socraticService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ChatInterfaceProps {
  sessionId: string | null;
  topic: string;
  onSessionCreated?: (sessionId: string) => void;
  onEvaluationComplete?: (evaluation: {
    completed: boolean;
    confidence_score: number;
    summary: string;
  }) => void;
  initialMessages?: ConversationMessage[];
}

const ChatInterface = ({
  sessionId,
  topic,
  onSessionCreated,
  onEvaluationComplete,
  initialMessages = []
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Start session if we have a topic but no messages yet
  useEffect(() => {
    if (sessionId && topic && messages.length === 0) {
      startConversation();
    }
  }, [sessionId, topic, messages.length]);
  
  const startConversation = async () => {
    if (!sessionId || !topic) return;
    
    setIsLoading(true);
    try {
      // Get first question from AI
      const response = await callSocraticTutor('start', { topic });
      if (typeof response.result === 'string') {
        // Add AI's first question to the conversation
        const aiMessage = await addMessage(
          sessionId,
          response.result,
          'ai',
          'question',
          1
        );

        // Update local messages state if we got a valid response
        if (aiMessage) {
          setMessages([aiMessage]);
        }
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start the conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    
    try {
      // Calculate the next sequence numbers
      const nextUserSeq = messages.length + 1;
      const nextAiSeq = nextUserSeq + 1;
      
      // Save user's response to the database
      const savedUserMsg = await addMessage(
        sessionId,
        userMessage,
        'user',
        'answer',
        nextUserSeq
      );
      
      if (!savedUserMsg) throw new Error("Failed to save user message");
      
      // Update local messages state with user's message
      const updatedMessages = [...messages, savedUserMsg];
      setMessages(updatedMessages);
      
      // Prepare conversation history for the AI
      const conversationHistory: { role: "system" | "user" | "assistant"; content: string }[] = updatedMessages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      // Check if we should evaluate the conversation
      const userMessagesCount = updatedMessages.filter(msg => msg.sender === 'user').length;
      const shouldEvaluate = userMessagesCount >= 5;
      
      if (shouldEvaluate) {
        // Call AI to evaluate the conversation
        const evaluationResponse = await callSocraticTutor('evaluate', {
          topic,
          conversationHistory
        });
        
        if (typeof evaluationResponse.result !== 'string') {
          // Save evaluation results
          await updateSessionEvaluation(
            sessionId,
            evaluationResponse.result.completed,
            evaluationResponse.result.confidence_score,
            evaluationResponse.result.summary
          );
          
          // Add evaluation message
          const evalMessage = await addMessage(
            sessionId,
            JSON.stringify(evaluationResponse.result),
            'ai',
            'evaluation',
            nextAiSeq
          );
          
          if (evalMessage) {
            setMessages([...updatedMessages, evalMessage]);
          }
          
          // Call the callback if provided
          if (onEvaluationComplete) {
            onEvaluationComplete(evaluationResponse.result);
          }
          
          toast.success("Learning session completed!");
        }
      } else {
        // Continue the conversation with next AI question
        const response = await callSocraticTutor('continue', {
          userResponse: userMessage,
          conversationHistory
        });
        
        if (typeof response.result === 'string') {
          // Save AI's response to the database
          const aiMessage = await addMessage(
            sessionId,
            response.result,
            'ai',
            'question',
            nextAiSeq
          );
          
          // Update local messages state with AI's response
          if (aiMessage) {
            setMessages([...updatedMessages, aiMessage]);
          }
        }
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      toast.error("Failed to process your response");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Socratic Learning: {topic || "New Session"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto mb-4 space-y-4 px-4">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 mb-2 opacity-50" />
            <p>Start your learning journey with Socratic questioning</p>
          </div>
        )}
        
        {messages.map((message, index) => {
          if (message.message_type === 'evaluation') {
            try {
              const evaluation = JSON.parse(message.content);
              return (
                <Card key={message.id || index} className="bg-primary/5 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-primary">Learning Complete!</h4>
                      <Badge variant="secondary">
                        {evaluation.confidence_score}% Understanding
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={evaluation.confidence_score} 
                      className="h-2"
                    />
                    
                    <p className="text-sm">{evaluation.summary}</p>
                  </div>
                </Card>
              );
            } catch (e) {
              // If can't parse as JSON, display as normal message
              return (
                <div
                  key={message.id || index}
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
                  </div>
                </div>
              );
            }
          }
          
          return (
            <div
              key={message.id || index}
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
              </div>
            </div>
          );
        })}
        
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
        <div ref={messagesEndRef} />
      </CardContent>
      
      <CardFooter className="pt-4 border-t">
        <div className="w-full flex gap-2">
          <Textarea
            placeholder="Type your response here..."
            className="resize-none flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || !sessionId}
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading || !sessionId}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
