
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "./ui/badge";
import { Share, Trophy, Award } from "lucide-react";
import { Achievement, Badge as BadgeType } from "@/services/socraticService";
import { useState } from "react";

interface AchievementShareProps {
  achievement?: Achievement & { topic: string };
  badge?: BadgeType;
  onClose?: () => void;
}

const AchievementShare = ({ achievement, badge, onClose }: AchievementShareProps) => {
  const [copied, setCopied] = useState(false);
  
  const item = achievement || badge;
  if (!item) return null;
  
  const isAchievement = achievement !== undefined;
  
  const handleShareLinkedIn = () => {
    if (!achievement) return;
    
    const text = `I just earned the "${achievement.name}" achievement on Socratix after mastering the topic of ${achievement.topic}!`;
    const url = window.location.origin;
    
    // Create LinkedIn share URL
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(achievement.linkedinTitle)}&summary=${encodeURIComponent(achievement.linkedinDescription)}`;
    
    // Open LinkedIn share dialog
    window.open(linkedInUrl, '_blank');
  };
  
  const copyToClipboard = () => {
    const text = isAchievement
      ? `I just earned the "${item.name}" achievement on Socratix after mastering the topic of ${(item as any).topic}!`
      : `I just earned the "${item.name}" badge on Socratix for ${item.description}!`;
      
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Dialog defaultOpen onOpenChange={open => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            {isAchievement ? (
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            ) : (
              <Award className="h-5 w-5 text-primary mr-2" />
            )}
            New {isAchievement ? "Achievement" : "Badge"} Unlocked!
          </DialogTitle>
          <DialogDescription>
            Congratulations on your learning progress
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center py-4">
          <Card className="w-full">
            <CardHeader className="text-center pb-2">
              <div className="text-4xl mb-2">{item.image}</div>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {isAchievement && (
                <Badge className="w-full justify-center mb-4" variant="secondary">
                  Topic: {(item as any).topic}
                </Badge>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center"
                >
                  {copied ? "Copied!" : "Copy"} 
                </Button>
                
                {isAchievement && (
                  <Button
                    onClick={handleShareLinkedIn}
                    className="flex items-center"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share to LinkedIn
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementShare;
