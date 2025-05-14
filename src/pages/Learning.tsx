import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, BookOpen, ArrowUp, Timer, MessageSquare, BookText, Zap } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/ChatInterface";
import Flashcard from "@/components/Flashcard";
import SummarizedNotes from "@/components/SummarizedNotes";
import UserProgress from "@/components/UserProgress";
import ChallengeQuiz from "@/components/ChallengeQuiz";
import { 
  createSession, 
  getSession, 
  updateSessionEvaluation,
  deleteSession,
  getTopicProgress,
  updateTopicProgress,
  extractTopicFromPrompt,
  generateSummary,
  awardBadge
} from "@/services/socraticService";

const Learning = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [topic, setTopic] = useState("");
  const [activeSession, setActiveSession] = useState<string | null>(sessionId || null);
  const [summarizedNotes, setSummarizedNotes] = useState("");
  const [evaluation, setEvaluation] = useState<{
    completed: boolean;
    confidence_score: number;
    summary: string;
  } | null>(null);
  const [showChallengeMode, setShowChallengeMode] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("chat");
  
  // Track which resources have been loaded
  const [notesGenerated, setNotesGenerated] = useState(false);

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
        
        if (session?.user) {
          // Get topic-specific progress
          const savedProgress = await getTopicProgress(session.user.id, sessionData.topic);
          if (savedProgress > 0) {
            setLearningProgress(savedProgress);
          } else if (sessionData.confidence_score) {
            setLearningProgress(sessionData.confidence_score);
            // Save progress for this topic
            await updateTopicProgress(session.user.id, sessionData.topic, sessionData.confidence_score);
          } else {
            setLearningProgress(5); // Default progress for ongoing sessions
          }
        }
        
        // Only load summary if it exists already
        if (sessionData.summary) {
          setSummarizedNotes(sessionData.summary);
          setNotesGenerated(true);
        }
        
        // Set evaluation if session is completed
        if (sessionData.completed) {
          setEvaluation({
            completed: sessionData.completed,
            confidence_score: sessionData.confidence_score || 0,
            summary: sessionData.summary || ""
          });
        }
      } else {
        toast.error("Session not found");
        navigate("/sessions");
      }
    } catch (error) {
      console.error("Error loading session:", error);
      toast.error("Failed to load learning session");
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    if (!topicInput.trim()) {
      toast.error("Please enter a topic to start learning");
      return;
    }

    setIsLoading(true);
    try {
      // Create a new session in the database with cleaned topic
      console.log("Starting new session with topic:", topicInput);
      const newSession = await createSession(topicInput);
      if (!newSession) {
        console.error("Failed to create learning session");
        toast.error("Failed to create learning session. Please try again.");
        return;
      }
      
      console.log("Session created successfully:", newSession);
      
      // Set the cleaned topic
      setTopic(newSession.topic);
      setActiveSession(newSession.id);
      
      // Start with initial progress
      setLearningProgress(5);
      if (session?.user) {
        await updateTopicProgress(session.user.id, newSession.topic, 5);
      }
      
      // Always set active tab to chat when starting a new session
      setActiveTab("chat");
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to create learning session. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationComplete = async (result: {
    completed: boolean;
    confidence_score: number;
    summary: string;
  }) => {
    setEvaluation(result);
    
    // Update summarized notes with evaluation summary
    if (result.summary) {
      setSummarizedNotes(result.summary);
      setNotesGenerated(true);
    }
    
    // Set final progress based on evaluation
    if (result.confidence_score) {
      setLearningProgress(result.confidence_score);
      
      // Save topic-specific progress
      if (session?.user && topic) {
        await updateTopicProgress(session.user.id, topic, result.confidence_score);
      }
    }
  };
  
  const handleChallengeComplete = async (score: number) => {
    // Update progress if the score is higher
    if (score > learningProgress && session?.user && topic) {
      setLearningProgress(score);
      await updateTopicProgress(session.user.id, topic, score);
    }
    
    toast.success(`Challenge completed with ${score}% score!`);
    
    // Award quiz_master badge if score is very high
    if (score >= 90 && session?.user) {
      await awardBadge(session.user.id, "quiz_master");
    }
    
    // Return to the chat tab after quiz is complete
    setActiveTab("chat");
  };
  
  const handleDeleteSession = async () => {
    if (!activeSession) return;
    
    if (confirm("Are you sure you want to delete this learning session? This action cannot be undone.")) {
      try {
        await deleteSession(activeSession);
        toast.success("Session deleted successfully");
        navigate("/sessions");
      } catch (error) {
        console.error("Error deleting session:", error);
        toast.error("Failed to delete session");
      }
    }
  };

  // Handle tab change to generate content when tabs are first accessed
  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    // Generate notes on first notes tab access if they don't exist
    if (value === "notes" && !notesGenerated && topic) {
      try {
        setIsLoading(true);
        const summary = await generateSummary(topic);
        if (summary) {
          setSummarizedNotes(summary);
          setNotesGenerated(true);
        }
      } catch (err) {
        console.error("Error generating summary:", err);
        setSummarizedNotes(`• ${topic} has key concepts to understand\n\n• ${topic} applies to various fields and disciplines\n\n• Learning ${topic} builds critical thinking skills`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 mx-auto mt-32 pb-20">
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
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={startSession} 
                disabled={isLoading || !topicInput.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                Start Socratic Dialogue
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  <span className="gradient-text">Learning:</span> {topic}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {evaluation ? "Session completed" : "Learning in progress..."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDeleteSession} className="text-destructive hover:bg-destructive/10">
                  Delete Session
                </Button>
                <Button variant="outline" onClick={() => navigate("/sessions")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  All Sessions
                </Button>
              </div>
            </div>
            
            {/* Learning Progress Bar */}
            <Card className="mb-4 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Learning Progress</span>
                  <span>{learningProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${learningProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  {evaluation?.completed 
                    ? "Session completed! Check your achievements below." 
                    : "Keep learning to improve your understanding and earn badges!"}
                </p>
              </div>
            </Card>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="chat" className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-1">
                      <BookText className="h-4 w-4" />
                      <span className="hidden sm:inline">Notes</span>
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Flashcards</span>
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      <span className="hidden sm:inline">Quiz Me</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat">
                    <ChatInterface 
                      sessionId={activeSession}
                      topic={topic}
                      onEvaluationComplete={handleEvaluationComplete}
                    />
                  </TabsContent>
                  
                  <TabsContent value="notes">
                    <Card>
                      <CardHeader>
                        <CardTitle>Learning Notes</CardTitle>
                        <CardDescription>Summarized information about {topic}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SummarizedNotes 
                          topic={topic} 
                          notes={summarizedNotes} 
                          refreshable={true} 
                          isGenerated={notesGenerated}
                          onNotesGenerated={() => setNotesGenerated(true)}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="flashcards">
                    <Card>
                      <CardHeader>
                        <CardTitle>Flashcards</CardTitle>
                        <CardDescription>Test your knowledge on {topic}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Flashcard 
                          topic={topic} 
                          loadOnMount={false} 
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="quiz">
                    {evaluation?.completed ? (
                      <ChallengeQuiz 
                        topic={topic} 
                        onComplete={handleChallengeComplete} 
                      />
                    ) : (
                      <Card>
                        <CardContent className="pt-6 py-10 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Timer className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Quiz not available yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Complete your learning session in the Chat tab first to unlock the quiz challenge.
                          </p>
                          <Button onClick={() => setActiveTab("chat")} variant="outline">
                            Go to Chat
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="space-y-6">
                <UserProgress />
                
                {evaluation && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate("/learning")}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Start New Session
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Learning;
