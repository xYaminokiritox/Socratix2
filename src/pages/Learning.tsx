
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Brain, BookOpen, GraduationCap } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  callSocraticTutor, 
  createSession, 
  getSession, 
  getSessionMessages, 
  addMessage, 
  updateSessionEvaluation,
  ConversationMessage
} from "@/services/socraticService";

const Learning = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(sessionId || null);
  const [evaluation, setEvaluation] = useState<{
    completed: boolean;
    confidence_score: number;
    summary: string;
  } | null>(null);

  // Load existing session if sessionId is provided
  useEffect(() => {
    if (activeSession) {
      loadSession(activeSession);
    }
  }, [activeSession]);

  const loadSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const sessionData = await getSession(sessionId);
      if (sessionData) {
        setTopic(sessionData.topic);
        
        const messagesData = await getSessionMessages(sessionId);
        if (messagesData) {
          setMessages(messagesData);
          
          if (sessionData.completed) {
            setEvaluation({
              completed: sessionData.completed,
              confidence_score: sessionData.confidence_score || 0,
              summary: sessionData.summary || ""
            });
          }
        }
      } else {
        toast.error("Session not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading session:", error);
      toast.error("Failed to load learning session");
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic to start learning");
      return;
    }

    setIsLoading(true);
    try {
      // Create a new session in the database
      const newSession = await createSession(topic);
      if (!newSession) {
        toast.error("Failed to create learning session");
        return;
      }

      setActiveSession(newSession.id);

      // Get first question from AI
      const response = await callSocraticTutor('start', { topic });
      if (typeof response.result === 'string') {
        // Add AI's first question to the conversation
        await addMessage(
          newSession.id,
          response.result,
          'ai',
          'question',
          1
        );

        // Update local messages state
        setMessages([{
          id: crypto.randomUUID(),
          session_id: newSession.id,
          content: response.result,
          sender: 'ai',
          message_type: 'question',
          sequence_number: 1,
          created_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start learning session");
    } finally {
      setIsLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!userInput.trim() || !activeSession) return;

    const userMessage = userInput.trim();
    setUserInput("");
    setIsLoading(true);

    try {
      // Calculate the next sequence numbers
      const nextUserSeq = messages.length + 1;
      const nextAiSeq = nextUserSeq + 1;

      // Save user's response to the database
      await addMessage(
        activeSession,
        userMessage,
        'user',
        'answer',
        nextUserSeq
      );

      // Update local messages state with user's message
      const updatedMessages = [...messages, {
        id: crypto.randomUUID(),
        session_id: activeSession,
        content: userMessage,
        sender: 'user',
        message_type: 'answer',
        sequence_number: nextUserSeq,
        created_at: new Date().toISOString()
      }];
      setMessages(updatedMessages);

      // Prepare conversation history for the AI
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Check if we should evaluate the conversation
      const shouldEvaluate = updatedMessages.filter(msg => msg.sender === 'user').length >= 5;
      
      if (shouldEvaluate) {
        // Call AI to evaluate the conversation
        const evaluationResponse = await callSocraticTutor('evaluate', {
          topic,
          conversationHistory
        });
        
        if (typeof evaluationResponse.result !== 'string') {
          // Save evaluation results
          await updateSessionEvaluation(
            activeSession,
            evaluationResponse.result.completed,
            evaluationResponse.result.confidence_score,
            evaluationResponse.result.summary
          );
          
          // Update local state with evaluation
          setEvaluation(evaluationResponse.result);
          
          // Add evaluation message
          await addMessage(
            activeSession,
            JSON.stringify(evaluationResponse.result),
            'ai',
            'evaluation',
            nextAiSeq
          );
        }
      } else {
        // Continue the conversation with next AI question
        const response = await callSocraticTutor('continue', {
          userResponse: userMessage,
          conversationHistory
        });
        
        if (typeof response.result === 'string') {
          // Save AI's response to the database
          await addMessage(
            activeSession,
            response.result,
            'ai',
            'question',
            nextAiSeq
          );
          
          // Update local messages state with AI's response
          setMessages([...updatedMessages, {
            id: crypto.randomUUID(),
            session_id: activeSession,
            content: response.result,
            sender: 'ai',
            message_type: 'question',
            sequence_number: nextAiSeq,
            created_at: new Date().toISOString()
          }]);
        }
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      toast.error("Failed to process your response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeSession) {
        sendResponse();
      } else {
        startSession();
      }
    }
  };

  const startNewSession = () => {
    setActiveSession(null);
    setTopic("");
    setMessages([]);
    setEvaluation(null);
    navigate("/learning");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 mx-auto mt-32 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          <span className="gradient-text">Socratic</span> Learning
        </h1>
        
        {!activeSession ? (
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>Start Learning</CardTitle>
              <CardDescription>
                Enter a topic you want to explore through guided Socratic questioning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="topic" className="text-sm font-medium block mb-1">
                    Learning Topic
                  </label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis, American Revolution, Neural Networks..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full"
                    onKeyDown={handleKeyPress}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={startSession} 
                disabled={isLoading || !topic.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                Start Socratic Dialogue
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{topic}</h2>
                <p className="text-sm text-muted-foreground">
                  {evaluation ? "Session completed" : "Learning in progress..."}
                </p>
              </div>
              <Button variant="outline" onClick={startNewSession}>
                <BookOpen className="h-4 w-4 mr-2" />
                New Topic
              </Button>
            </div>
            
            {/* Chat messages */}
            <div className="bg-card border rounded-lg p-4 mb-4 h-[50vh] overflow-y-auto space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            
            {/* Evaluation results */}
            {evaluation && (
              <Card className="mb-6">
                <CardHeader className="py-4">
                  <CardTitle className="flex items-center text-xl">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Learning Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Understanding Level</h3>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${evaluation.confidence_score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-right mt-1">{evaluation.confidence_score}%</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Summary</h3>
                      <p className="text-muted-foreground">{evaluation.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Input area - disabled if evaluation is complete */}
            {!evaluation && (
              <div className="flex items-end space-x-2">
                <Textarea
                  placeholder="Type your response here..."
                  className="flex-1"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={handleKeyPress}
                  rows={3}
                />
                <Button 
                  onClick={sendResponse} 
                  disabled={isLoading || !userInput.trim()}
                  className="h-12 px-4"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
