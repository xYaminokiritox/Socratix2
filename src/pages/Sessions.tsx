import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Clock, BarChart, CheckCircle, Circle, ChevronRight, Plus } from "lucide-react";
import Header from "@/components/Header";
import { getUserSessions, LearningSession } from "@/services/socraticService";
import { format } from "date-fns";

const Sessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const sessionsData = await getUserSessions();
      if (sessionsData) {
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 mx-auto mt-32 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Learning</span> Sessions
          </h1>
          
          <Button onClick={() => navigate("/learning")}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No learning sessions yet</h2>
              <p className="text-muted-foreground mb-6">
                Start a new Socratic learning session to begin your journey
              </p>
              <Button onClick={() => navigate("/learning")}>
                <Plus className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Link to={`/learning/${session.id}`} key={session.id}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="line-clamp-1">{session.topic}</span>
                      {session.completed ? (
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {format(new Date(session.created_at), "PPP")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {session.completed && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1 flex items-center">
                          <BarChart className="h-3.5 w-3.5 mr-1" />
                          Understanding: {session.confidence_score}%
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${session.confidence_score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {session.completed 
                        ? session.summary || "Session completed."
                        : "Learning in progress..."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between">
                      {session.completed ? "Review Session" : "Continue Learning"}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;
