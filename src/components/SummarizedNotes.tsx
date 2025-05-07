
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SummarizedNotesProps {
  notes: string;
}

const SummarizedNotes = ({ notes }: SummarizedNotesProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Your notes have been copied to the clipboard.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <Card>
      <CardHeader className="bg-primary/5 py-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-base">
          <BookText className="mr-2 h-4 w-4 text-primary" />
          Summarized Notes
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 max-h-[350px] overflow-y-auto">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {notes.split('\n').map((line, index) => (
            line.trim() ? (
              <p key={index} className="mb-2 last:mb-0 text-sm">
                {line.startsWith('•') ? (
                  <span>
                    <span className="text-primary font-medium">•</span> {line.substring(1).trim()}
                  </span>
                ) : line}
              </p>
            ) : <br key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummarizedNotes;
