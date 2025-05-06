
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface SummarizedNotesProps {
  notes: string;
}

const SummarizedNotes = ({ notes }: SummarizedNotesProps) => {
  if (!notes) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 py-3">
        <CardTitle className="flex items-center text-base">
          <BookOpen className="mr-2 h-4 w-4 text-primary" />
          Summarized Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="prose prose-sm max-w-none">
          {notes.split('\n').map((line, index) => {
            if (line.trim().startsWith('•')) {
              return (
                <div key={index} className="flex items-start mb-2">
                  <span className="text-primary mr-2">•</span>
                  <p className="m-0">{line.trim().substring(1).trim()}</p>
                </div>
              );
            }
            return line ? <p key={index} className="mb-2">{line}</p> : <br key={index} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummarizedNotes;
