
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ArrowUp, Book, BookOpen, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import NotesUploader from "@/components/NotesUploader";
import ChatInterface from "@/components/ChatInterface";
import Flashcard from "@/components/Flashcard";
import SummarizedNotes from "@/components/SummarizedNotes";
import UserProgress from "@/components/UserProgress";
import { createSession, getUserBadges, getUserAchievements, Badge, Achievement } from "@/services/socraticService";
import AchievementShare from "@/components/AchievementShare";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Demo = () => {
  const { toast: hookToast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState<"input" | "learning">("input");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [summarizedNotes, setSummarizedNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<{
    completed: boolean;
    confidence_score: number;
    summary: string;
  } | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [newAchievement, setNewAchievement] = useState<(Achievement & {topic: string}) | null>(null);
  
  const [initialBadgeCount, setInitialBadgeCount] = useState(0);
  const [initialAchievementCount, setInitialAchievementCount] = useState(0);
  
  // Load user's initial badge and achievement counts
  useEffect(() => {
    if (session?.user) {
      loadUserStats(session.user.id);
    }
  }, [session]);
  
  const loadUserStats = async (userId: string) => {
    try {
      const [badges, achievements] = await Promise.all([
        getUserBadges(userId),
        getUserAchievements(userId)
      ]);
      
      setInitialBadgeCount(badges.length);
      setInitialAchievementCount(achievements.length);
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };
  
  // Check for new badges or achievements when the user completes a session
  useEffect(() => {
    if (!session?.user || !evaluation?.completed) return;
    
    const checkNewRewards = async () => {
      const [badges, achievements] = await Promise.all([
        getUserBadges(session.user.id),
        getUserAchievements(session.user.id)
      ]);
      
      // Check if we have new badges
      if (badges.length > initialBadgeCount) {
        setNewBadge(badges[badges.length - 1]);
      }
      
      // Check if we have new achievements
      if (achievements.length > initialAchievementCount) {
        setNewAchievement(achievements[achievements.length - 1]);
      }
      
      // Update counts for future checks
      setInitialBadgeCount(badges.length);
      setInitialAchievementCount(achievements.length);
    };
    
    checkNewRewards();
  }, [evaluation, session, initialBadgeCount, initialAchievementCount]);
  
  const handleStart = async () => {
    if (!topic && !notes) {
      hookToast({
        title: "Please enter a topic or upload notes",
        description: "We need something to work with!",
        variant: "destructive",
      });
      return;
    }
    
    if (!session?.user) {
      toast.error("Please sign in to start a learning session");
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a new session in the database
      const actualTopic = topic || "Notes Analysis";
      const newSession = await createSession(actualTopic);
      
      if (!newSession) {
        throw new Error("Failed to create learning session");
      }
      
      setSessionId(newSession.id);
      
      // Generate fake summarized notes if we have a topic or notes
      if (notes) {
        setSummarizedNotes(notes);
      } else {
        setSummarizedNotes(
          `Here are your summarized notes on ${actualTopic}:\n\n` +
          `• ${actualTopic} is a fascinating subject with many applications\n` +
          `• Learning about ${actualTopic} involves understanding key concepts\n` +
          `• The principles of ${actualTopic} were first established in the early studies\n` +
          `• Modern applications of ${actualTopic} include various technological advancements\n` +
          `• Several theories exist to explain the foundation of ${actualTopic}`
        );
      }
      
      setActiveStep("learning");
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
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <div className="container px-4 mx-auto mt-32">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          <span className="gradient-text">Socratix</span> Demo
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience how Socratix helps you learn through discovery. Enter a topic you want to explore
          or upload your notes to get started.
        </p>
        
        {activeStep === "input" ? (
          <Card className="max-w-2xl mx-auto p-6 shadow-lg">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  What would you like to learn?
                </h2>
                
                <Input
                  placeholder="Enter a topic (e.g. Photosynthesis, American Civil War, Quantum Physics)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mb-4"
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                  </div>
                </div>
              </div>
              
              <NotesUploader onNotesUploaded={setNotes} />
              
              <Button 
                onClick={handleStart} 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Start Learning"}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ChatInterface 
                sessionId={sessionId}
                topic={topic || "Notes Analysis"}
                onEvaluationComplete={handleEvaluationComplete}
              />
            </div>
            
            <div className="space-y-6">
              <UserProgress />
              
              <Flashcard />
              
              <SummarizedNotes notes={summarizedNotes} />
              
              {evaluation && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setActiveStep("input");
                    setTopic("");
                    setNotes("");
                    setSummarizedNotes("");
                    setSessionId(null);
                    setEvaluation(null);
                  }}
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Start New Session
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Display badge/achievement notifications */}
      {newBadge && (
        <AchievementShare 
          badge={newBadge}
          onClose={() => setNewBadge(null)}
        />
      )}
      
      {newAchievement && (
        <AchievementShare 
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />
      )}
    </div>
  );
};

export default Demo;
