
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Send } from "lucide-react";

interface ReflectionProps {
  topic: string;
}

const Reflection = ({ topic }: ReflectionProps) => {
  const [reflections, setReflections] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState<string>(
    `Take a moment to reflect on what you've learned about ${topic}. What are the key concepts that stood out to you?`
  );
  
  const handleSubmit = () => {
    if (!input.trim()) return;
    
    setReflections([...reflections, input]);
    setInput("");
    
    // Generate a new reflection prompt
    const nextPrompts = [
      `How would you explain ${topic} to someone who has never heard of it before?`,
      `What connections can you make between ${topic} and other subjects you already know?`,
      `What questions do you still have about ${topic}?`,
      `How might you apply what you've learned about ${topic} in a practical situation?`,
      `What was the most surprising thing you learned about ${topic}?`,
    ];
    
    const newPrompt = nextPrompts[Math.floor(Math.random() * nextPrompts.length)];
    setCurrentPrompt(newPrompt);
  };
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-primary/5 py-3">
        <CardTitle className="flex items-center text-base">
          <ArrowUp className="mr-2 h-4 w-4 text-primary" />
          Learning Reflections
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto mb-4 space-y-6 px-4 py-6">
        <div className="bg-muted/50 p-4 rounded-lg border border-muted">
          <p className="text-muted-foreground italic">{currentPrompt}</p>
        </div>
        
        {reflections.length > 0 && (
          <div className="space-y-4">
            {reflections.map((reflection, index) => (
              <div key={index} className="bg-primary/5 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Previous reflection:</p>
                <p>{reflection}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 border-t">
        <div className="w-full flex gap-2">
          <Textarea
            placeholder="Type your reflection here..."
            className="resize-none flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button onClick={handleSubmit} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Reflection;
