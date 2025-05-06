
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Book } from "lucide-react";

const demoFlashcards = [
  {
    id: 1,
    question: "What is the Socratic method?",
    answer: "The Socratic method is a form of cooperative argumentative dialogue between individuals, based on asking and answering questions to stimulate critical thinking and to draw out ideas and underlying presuppositions."
  },
  {
    id: 2,
    question: "Why is active learning more effective than passive learning?",
    answer: "Active learning engages students in the learning process through activities, discussions, and reflections, resulting in better retention and understanding compared to passive learning, which is primarily one-way transmission of information."
  },
  {
    id: 3,
    question: "What are the key components of effective questioning?",
    answer: "The key components include open-ended questions, wait time for reflection, follow-up questions, and questions that promote critical thinking rather than simple recall."
  }
];

const Flashcard = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentCard = demoFlashcards[currentCardIndex];
  
  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % demoFlashcards.length);
    }, 200);
  };
  
  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + demoFlashcards.length) % demoFlashcards.length);
    }, 200);
  };
  
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 py-3">
        <CardTitle className="flex items-center text-base">
          <Book className="mr-2 h-4 w-4 text-primary" />
          Flashcards
        </CardTitle>
      </CardHeader>
      
      <div className="px-4 py-2 text-xs text-muted-foreground flex justify-between">
        <span>Card {currentCardIndex + 1} of {demoFlashcards.length}</span>
        <span>Tap card to flip</span>
      </div>
      
      <CardContent className="p-4">
        <div 
          className="h-[200px] cursor-pointer"
          onClick={toggleFlip}
        >
          <div
            className="relative w-full h-full transition-transform duration-500 transform-style-3d"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front side - Question */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 backface-hidden rounded-lg border bg-card"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              <p className="text-center font-medium">{currentCard.question}</p>
            </div>
            
            {/* Back side - Answer */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 backface-hidden rounded-lg border bg-primary/5"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-center text-sm">{currentCard.answer}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button
          variant="outline" 
          size="sm"
          onClick={handleNext}
        >
          Next <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Flashcard;
