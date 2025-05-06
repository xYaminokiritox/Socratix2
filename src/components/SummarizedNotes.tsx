
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText } from "lucide-react";

interface SummarizedNotesProps {
  notes: string;
}

const SummarizedNotes = ({ notes }: SummarizedNotesProps) => {
  return (
    <Card>
      <CardHeader className="bg-primary/5 py-3">
        <CardTitle className="flex items-center text-base">
          <BookText className="mr-2 h-4 w-4 text-primary" />
          Summarized Notes
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
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
