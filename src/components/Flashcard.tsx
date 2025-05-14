
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { generateFlashcards } from "@/services/socraticService";
import { toast } from "sonner";

interface FlashcardProps {
  topic?: string;
  numberOfCards?: number;
  loadOnMount?: boolean;
}

const Flashcard = ({ topic = "General Knowledge", numberOfCards = 6, loadOnMount = true }: FlashcardProps) => {
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(loadOnMount);
  
  useEffect(() => {
    if (topic && loadOnMount) {
      loadFlashcards();
    }
  }, [topic, loadOnMount]);
  
  const loadFlashcards = async () => {
    // Prevent rapid reloading (throttle to once every 10 seconds)
    const now = Date.now();
    if (now - lastLoadTime < 5000 && loadAttempts > 0) {
      toast.warning("Please wait a few seconds before refreshing");
      return;
    }
    
    setIsLoading(true);
    setLastLoadTime(now);
    setLoadAttempts(prev => prev + 1);
    
    try {
      console.log("Generating flashcards for topic:", topic);
      const cards = await generateFlashcards(topic, numberOfCards);
      
      if (cards && Array.isArray(cards) && cards.length > 0) {
        setFlashcards(cards);
        setCurrentCard(0);
        setIsFlipped(false);
        console.log("Successfully loaded flashcards:", cards.length);
        setInitialLoadComplete(true);
      } else {
        throw new Error("Received invalid flashcard data");
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
      toast.error("Couldn't load flashcards. Please try again in a moment.");
      
      // Provide generic flashcards as fallback
      setFlashcards([
        { 
          question: `What is ${topic}?`, 
          answer: `${topic} is an important subject with many concepts to learn.` 
        },
        { 
          question: `Why is studying ${topic} valuable?`, 
          answer: `Understanding ${topic} can help you develop critical thinking skills.` 
        }
      ]);
      setInitialLoadComplete(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };
  
  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleRefresh = () => {
    loadFlashcards();
  };
  
  if (!initialLoadComplete && !isLoading) {
    return (
      <Card className="relative flex flex-col items-center justify-center h-[200px] p-8 text-center">
        <div className="mb-4">
          <RefreshCw className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Create Flashcards</h3>
        <p className="text-muted-foreground mb-4">
          Generate flashcards to test your knowledge of {topic}.
        </p>
        <Button onClick={loadFlashcards}>
          Generate Flashcards
        </Button>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card className="relative h-[200px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Generating flashcards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (flashcards.length === 0) {
    return (
      <Card className="relative h-[200px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="mb-2">No flashcards available.</p>
            <Button size="sm" onClick={handleRefresh}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="relative h-[240px]">
      <CardContent className="p-0 h-full">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm font-medium flex items-center">
            Flashcards: <span className="ml-1 text-muted-foreground">{topic}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="text-xs text-muted-foreground">
              {currentCard + 1}/{flashcards.length}
            </div>
          </div>
        </div>
        
        <div 
          className="p-5 h-[150px] flex items-center justify-center cursor-pointer"
          onClick={handleFlip}
        >
          <div 
            className="w-full h-full flex items-center justify-center transition-all duration-300"
            style={{ transform: isFlipped ? "rotateX(180deg)" : "rotateX(0)" }}
          >
            <div className={`absolute w-full text-center transition-opacity duration-300 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
              <p className="text-lg font-medium">{flashcards[currentCard].question}</p>
              <p className="text-xs text-muted-foreground mt-2">Click to reveal answer</p>
            </div>
            <div className={`absolute w-full text-center transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0'}`} 
                 style={{ transform: "rotateX(180deg)" }}>
              <p className="text-lg">{flashcards[currentCard].answer}</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-between p-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrev}
            disabled={currentCard === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNext}
            disabled={currentCard === flashcards.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Flashcard;
