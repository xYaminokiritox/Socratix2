import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Book } from "lucide-react";

interface NotesUploaderProps {
  onNotesUploaded: (notes: string) => void;
}

const NotesUploader = ({ onNotesUploaded }: NotesUploaderProps) => {
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onNotesUploaded(e.target.value);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setNotes(content);
          onNotesUploaded(content);
        };
        reader.readAsText(file);
      }
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Book className="mr-2 h-5 w-5 text-primary" />
        Upload or paste your notes
      </h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          placeholder="Paste your notes here or drag and drop a text file..."
          className="min-h-[150px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 placeholder:text-muted-foreground/50"
          value={notes}
          onChange={handleNotesChange}
        />
        
        <div className="mt-2 flex items-center justify-center">
          <Button variant="outline" className="text-xs flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <span>Upload text file</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesUploader;
