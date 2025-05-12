
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, Copy, Check, ArrowDownToLine, ArrowUpToLine, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateSummary } from "@/services/socraticService";

interface SummarizedNotesProps {
  topic?: string;
  notes?: string;
  refreshable?: boolean;
}

const SummarizedNotes = ({ topic = "", notes = "", refreshable = true }: SummarizedNotesProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryContent, setSummaryContent] = useState(notes);
  
  useEffect(() => {
    if (topic && !notes) {
      generateNotesForTopic();
    } else if (notes) {
      setSummaryContent(notes);
    }
  }, [topic, notes]);
  
  const generateNotesForTopic = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    try {
      const summary = await generateSummary(topic);
      setSummaryContent(summary);
    } catch (error) {
      console.error("Error generating summary notes:", error);
      toast({
        title: "Failed to generate notes",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryContent);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Your notes have been copied to the clipboard.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const formatNotes = (notes: string) => {
    // If notes doesn't have bullet points, add them for better readability
    if (!notes.includes('•')) {
      const paragraphs = notes.split('\n\n').filter(p => p.trim());
      if (paragraphs.length > 1) {
        return paragraphs.map(p => `• ${p}`).join('\n\n');
      }
    }
    return notes;
  };
  
  const formattedNotes = formatNotes(summaryContent);
  
  const handleRefresh = () => {
    if (topic) {
      generateNotesForTopic();
    }
  };
  
  return (
    <Card>
      <CardHeader className="bg-primary/5 py-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-base">
          <BookText className="mr-2 h-4 w-4 text-primary" />
          Summarized Notes
        </CardTitle>
        <div className="flex items-center space-x-1">
          {refreshable && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh notes"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ArrowUpToLine className="h-4 w-4" />
            ) : (
              <ArrowDownToLine className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={`p-4 ${expanded ? 'max-h-[600px]' : 'max-h-[250px]'} overflow-y-auto transition-all duration-300`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {formattedNotes.split('\n').map((line, index) => (
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
        )}
      </CardContent>
    </Card>
  );
};

export default SummarizedNotes;
