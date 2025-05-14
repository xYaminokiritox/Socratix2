
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
    feedback?: string;
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
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [responseTiming, setResponseTiming] = useState<'normal' | 'fast' | 'slow'>('normal');
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
    
    const startTime = Date.now();
    
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
      
      // Analyze user response complexity to dynamically adjust difficulty
      analyzeUserResponse(userMessage);
      
      // Check if we should evaluate the conversation
      const userMessagesCount = updatedMessages.filter(msg => msg.sender === 'user').length;
      const shouldEvaluate = userMessagesCount >= 5;
      
      if (shouldEvaluate) {
        // Call AI to evaluate the conversation
        const evaluationResponse = await callSocraticTutor('evaluate', {
          topic,
          conversationHistory,
          userLevel,
          responseTiming
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
          conversationHistory,
          userLevel,
          responseTiming
        });
        
        if (typeof response.result === 'string') {
          // Parse the response - looking for feedback and question sections
          let feedbackContent = "";
          let questionContent = response.result;
          
          const feedbackMatch = response.result.match(/FEEDBACK:(.*?)(?=QUESTION:|$)/s);
          const questionMatch = response.result.match(/QUESTION:(.*?)$/s);
          
          if (feedbackMatch && questionMatch) {
            // We have both feedback and question sections
            feedbackContent = feedbackMatch[1].trim();
            questionContent = questionMatch[1].trim();
            
            // Add feedback message
            const feedbackMessage = await addMessage(
              sessionId,
              feedbackContent,
              'ai',
              'feedback',
              nextAiSeq
            );
            
            // Add question message
            const questionMessage = await addMessage(
              sessionId,
              questionContent,
              'ai',
              'question',
              nextAiSeq + 1
            );
            
            // Update local messages state with AI's feedback and next question
            if (feedbackMessage && questionMessage) {
              setMessages([...updatedMessages, feedbackMessage, questionMessage]);
            }
          } else {
            // If the response doesn't follow the expected format, just use it as-is
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
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      toast.error("Failed to process your response");
    } finally {
      setIsLoading(false);
      
      // Calculate response time and adjust timing category
      const responseTime = Date.now() - startTime;
      updateResponseTiming(responseTime);
    }
  };
  
  // Helper function to analyze user response and adjust difficulty
  const analyzeUserResponse = (userResponse: string) => {
    // Analyze complexity
    const wordCount = userResponse.split(/\s+/).length;
    const complexWords = (userResponse.match(/\b\w{7,}\b/g) || []).length;
    const sentenceCount = (userResponse.match(/[.!?]+/g) || []).length || 1;
    const conceptualTerms = (userResponse.match(/\b(therefore|however|consequently|furthermore|nevertheless|hypothesis|theory|concept|analysis)\b/gi) || []).length;
    
    // Calculate complexity metrics
    const avgWordsPerSentence = wordCount / sentenceCount;
    const complexityRatio = complexWords / wordCount;
    const conceptRatio = conceptualTerms / wordCount;
    
    // Determine user level based on multiple factors
    let newLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    
    if ((avgWordsPerSentence > 15 || complexityRatio > 0.2 || conceptRatio > 0.1) && wordCount > 20) {
      newLevel = 'advanced';
    } else if ((avgWordsPerSentence > 10 || complexityRatio > 0.15 || conceptRatio > 0.05) && wordCount > 10) {
      newLevel = 'intermediate';
    }
    
    // Only update level if it's higher than current (users can go up but not down)
    if (userLevel === 'beginner' || 
        (userLevel === 'intermediate' && newLevel === 'advanced')) {
      setUserLevel(newLevel);
    }
    
    console.log(`User response analysis - Level: ${newLevel}, Words: ${wordCount}, Complex words: ${complexWords}, Words per sentence: ${avgWordsPerSentence.toFixed(1)}, Concept ratio: ${conceptRatio.toFixed(2)}`);
  };
  
  // Update response timing based on how quickly the user responds
  const updateResponseTiming = (responseTimeMs: number) => {
    // Convert to seconds for easier reading
    const responseTimeSeconds = responseTimeMs / 1000;
    
    // Determine timing category
    let newTiming: 'fast' | 'normal' | 'slow';
    
    if (responseTimeSeconds < 10) {
      newTiming = 'fast';
    } else if (responseTimeSeconds > 45) {
      newTiming = 'slow';
    } else {
      newTiming = 'normal';
    }
    
    setResponseTiming(newTiming);
    console.log(`Response timing: ${newTiming} (${responseTimeSeconds.toFixed(1)}s)`);
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Socratic Learning: {topic || "New Session"}
          </div>
          {userLevel !== 'beginner' && (
            <Badge variant={userLevel === 'advanced' ? 'default' : 'outline'}>
              {userLevel === 'advanced' ? 'Advanced' : 'Intermediate'} Level
            </Badge>
          )}
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
                    
                    {evaluation.feedback && (
                      <div className="mt-2 pt-2 border-t border-dashed border-primary/20">
                        <p className="text-sm italic">{evaluation.feedback}</p>
                      </div>
                    )}
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
                    : message.message_type === "feedback" 
                      ? "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" 
                      : "bg-muted"
                }`}
              >
                <p className={message.message_type === "feedback" ? "italic text-sm" : ""}>
                  {message.content}
                </p>
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
