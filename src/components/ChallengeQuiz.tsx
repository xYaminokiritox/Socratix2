
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateChallengeQuiz, awardBadge, awardPoints } from "@/services/socraticService";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ChallengeQuizProps {
  topic: string;
  onComplete: (score: number) => void;
}

const ChallengeQuiz = ({ topic, onComplete }: ChallengeQuizProps) => {
  const { session } = useAuth();
  const [questions, setQuestions] = useState<{
    question: string;
    options: string[];
    correctAnswer: number;
  }[]>([]);
  
  const [timeLimit, setTimeLimit] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const quiz = await generateChallengeQuiz(topic);
        setQuestions(quiz.questions);
        setTimeLimit(quiz.timeLimit);
        setTimeLeft(quiz.timeLimit);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading challenge quiz:", error);
        toast.error("Failed to load challenge quiz");
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [topic]);
  
  // Timer effect
  useEffect(() => {
    if (isLoading || isCompleted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isCompleted) {
            handleQuizComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, isCompleted, timeLeft]);
  
  const handleSelectAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleQuizComplete();
    }
  };
  
  const handleQuizComplete = async () => {
    setIsCompleted(true);
    
    // Calculate score as a percentage
    const scorePercent = Math.round((score / questions.length) * 100);
    
    // Award points based on score
    if (session?.user) {
      await awardPoints(session.user.id, scorePercent);
      
      // Award badge if score is excellent
      if (scorePercent >= 90) {
        await awardBadge(session.user.id, "quiz_master");
      }
    }
    
    onComplete(scorePercent);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading challenge questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isCompleted) {
    const scorePercent = Math.round((score / questions.length) * 100);
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Challenge Complete!</CardTitle>
          <CardDescription>You've completed the {topic} challenge quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="text-4xl font-bold mb-2">{scorePercent}%</div>
            <p>{score} out of {questions.length} questions correct</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score</span>
              <span>{scorePercent}%</span>
            </div>
            <Progress value={scorePercent} className="h-2" />
            <p className="text-sm text-muted-foreground pt-2">
              {scorePercent >= 90 
                ? "Excellent! You've mastered this topic!" 
                : scorePercent >= 70 
                ? "Good job! You have a solid understanding of this topic." 
                : "Keep practicing to improve your understanding."}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => onComplete(scorePercent)}>
            Continue Learning
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const currentQ = questions[currentQuestion];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Challenge Mode</CardTitle>
            <CardDescription>{topic} Quiz</CardDescription>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className={`font-mono ${timeLeft < 10 ? "text-red-500 animate-pulse" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}/{currentQuestion}</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-1" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">{currentQ.question}</div>
        
        <div className="space-y-2">
          {currentQ.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedAnswer === null ? "outline" : 
                selectedAnswer === index ? 
                  index === currentQ.correctAnswer ? "default" : "destructive" :
                  index === currentQ.correctAnswer && isAnswered ? "default" : "outline"
              }
              className={`w-full justify-start text-left ${
                selectedAnswer === null ? "" :
                selectedAnswer === index ? 
                  index === currentQ.correctAnswer ? "border-green-500" : "border-red-500" :
                  index === currentQ.correctAnswer && isAnswered ? "border-green-500" : ""
              }`}
              onClick={() => handleSelectAnswer(index)}
              disabled={isAnswered}
            >
              <div className="flex items-center w-full">
                <span className="flex-1">{option}</span>
                {isAnswered && index === currentQ.correctAnswer && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                )}
                {isAnswered && selectedAnswer === index && index !== currentQ.correctAnswer && (
                  <XCircle className="h-4 w-4 text-red-500 ml-2" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {isAnswered && (
          <Button className="w-full" onClick={handleNextQuestion}>
            {currentQuestion + 1 < questions.length ? "Next Question" : "Complete Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChallengeQuiz;
