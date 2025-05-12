
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, BookOpen, ArrowUp, Timer } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ChatInterface from "@/components/ChatInterface";
import Flashcard from "@/components/Flashcard";
import SummarizedNotes from "@/components/SummarizedNotes";
import UserProgress from "@/components/UserProgress";
import ChallengeQuiz from "@/components/ChallengeQuiz";
import { 
  createSession, 
  getSession, 
  getSessionMessages, 
  updateSessionEvaluation,
  deleteSession
} from "@/services/socraticService";

const Learning = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
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
        
        // Generate or load summarized notes
        const notesContent = sessionData.summary || 
          `Here are your summarized notes on ${sessionData.topic}:\n\n` +
          `• ${sessionData.topic} is a fascinating subject with many applications\n\n` +
          `• Learning about ${sessionData.topic} involves understanding key concepts and principles\n\n` +
          `• The foundations of ${sessionData.topic} were established through rigorous research and study\n\n` +
          `• Modern applications of ${sessionData.topic} include technological advancements and practical implementations\n\n` +
          `• Several theories exist to explain the foundational mechanisms of ${sessionData.topic}\n\n` +
          `• Understanding ${sessionData.topic} requires both theoretical knowledge and practical application\n\n` +
          `• Recent developments in ${sessionData.topic} have opened new avenues for exploration and discovery`;
        
        setSummarizedNotes(notesContent);
        
        // Set learning progress
        if (sessionData.completed) {
          setEvaluation({
            completed: sessionData.completed,
            confidence_score: sessionData.confidence_score || 0,
            summary: sessionData.summary || ""
          });
          setLearningProgress(sessionData.confidence_score || 0);
        } else {
          setLearningProgress(30); // Default progress for ongoing sessions
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

      // Generate initial summary for new topic
      setSummarizedNotes(
        `Here are your summarized notes on ${topic}:\n\n` +
        `• ${topic} is a fascinating subject with many applications\n\n` +
        `• Learning about ${topic} involves understanding key concepts and principles\n\n` +
        `• The foundations of ${topic} were established through rigorous research and study\n\n` +
        `• Modern applications of ${topic} include technological advancements and practical implementations\n\n` +
        `• Several theories exist to explain the foundational mechanisms of ${topic}\n\n` +
        `• Understanding ${topic} requires both theoretical knowledge and practical application\n\n` +
        `• Recent developments in ${topic} have opened new avenues for exploration and discovery`
      );

      setActiveSession(newSession.id);
      
      // Start with initial progress
      setLearningProgress(5);
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start learning session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationComplete = (result: {
    completed: boolean;
    confidence_score: number;
    summary: string;
  }) => {
    setEvaluation(result);
    
    // Update summarized notes with evaluation summary
    if (result.summary) {
      setSummarizedNotes(result.summary);
    }
    
    // Set final progress based on evaluation
    if (result.confidence_score) {
      setLearningProgress(result.confidence_score);
    }
  };
  
  const handleChallengeComplete = (score: number) => {
    setShowChallengeMode(false);
    toast.success(`Challenge completed with ${score}% score!`);
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
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full"
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
                <p className="text-xs text-muted-foreground">
                  {evaluation?.completed 
                    ? "Session completed! Check your achievements below." 
                    : "Keep learning to improve your understanding and earn badges!"}
                </p>
              </div>
            </Card>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {showChallengeMode ? (
                  <ChallengeQuiz 
                    topic={topic} 
                    onComplete={handleChallengeComplete} 
                  />
                ) : (
                  <ChatInterface 
                    sessionId={activeSession}
                    topic={topic}
                    onEvaluationComplete={handleEvaluationComplete}
                  />
                )}
                
                {/* Challenge Mode Button */}
                {evaluation?.completed && !showChallengeMode && (
                  <div className="mt-4 flex justify-center">
                    <Button 
                      onClick={() => setShowChallengeMode(true)}
                      variant="outline"
                      className="group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                      <span className="relative flex items-center">
                        <Timer className="mr-2 h-4 w-4" />
                        Challenge Me!
                      </span>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <UserProgress />
                
                <Flashcard topic={topic} />
                
                <SummarizedNotes notes={summarizedNotes} />
                
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
