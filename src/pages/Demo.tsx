
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, Book, BookOpen, MessageSquare, Send } from "lucide-react";
import Header from "@/components/Header";
import NotesUploader from "@/components/NotesUploader";
import ChatInterface from "@/components/ChatInterface";
import Flashcard from "@/components/Flashcard";
import SummarizedNotes from "@/components/SummarizedNotes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Reflection from "@/components/Reflection";

const Demo = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState<"input" | "learning">("input");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [summarizedNotes, setSummarizedNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"chat" | "flashcards" | "reflection">("chat");
  
  const handleStart = () => {
    if (!topic && !notes) {
      toast({
        title: "Please enter a topic or upload notes",
        description: "We need something to work with!",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      setActiveStep("learning");
      
      // Generate fake summarized notes if we have a topic or notes
      if (topic || notes) {
        setSummarizedNotes(
          notes || 
          `Here are your summarized notes on ${topic}:\n\n` +
          `• ${topic} is a fascinating subject with many applications\n` +
          `• Learning about ${topic} involves understanding key concepts\n` +
          `• The principles of ${topic} were first established in the early studies\n` +
          `• Modern applications of ${topic} include various technological advancements\n` +
          `• Several theories exist to explain the foundation of ${topic}`
        );
      }
    }, 1500);
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
          <div className="space-y-6">
            <div className="flex justify-center mb-6">
              <ToggleGroup type="single" value={activeMode} onValueChange={(value) => value && setActiveMode(value as "chat" | "flashcards" | "reflection")}>
                <ToggleGroupItem value="chat" aria-label="Chat mode">
                  <MessageSquare className="mr-1 h-4 w-4" /> Chat
                </ToggleGroupItem>
                <ToggleGroupItem value="flashcards" aria-label="Flashcard mode">
                  <Book className="mr-1 h-4 w-4" /> Flashcards
                </ToggleGroupItem>
                <ToggleGroupItem value="reflection" aria-label="Reflection mode">
                  <ArrowUp className="mr-1 h-4 w-4" /> Reflection
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {activeMode === "chat" && <ChatInterface />}
                {activeMode === "flashcards" && <Flashcard />}
                {activeMode === "reflection" && <Reflection topic={topic || "your uploaded notes"} />}
              </div>
              
              <div className="space-y-6">
                {activeMode !== "flashcards" && <Flashcard />}
                <SummarizedNotes notes={summarizedNotes} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Demo;
