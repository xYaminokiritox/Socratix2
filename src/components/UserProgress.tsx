
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Award, Star } from "lucide-react";
import { 
  getUserBadges, 
  getUserAchievements, 
  getUserPoints,
  Badge as BadgeType,
  Achievement
} from "@/services/socraticService";
import { useAuth } from "@/hooks/useAuth";
import AchievementShare from "./AchievementShare";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const UserProgress = () => {
  const { session } = useAuth();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [achievements, setAchievements] = useState<(Achievement & {topic: string})[]>([]);
  const [points, setPoints] = useState(0);
  const [selectedItem, setSelectedItem] = useState<
    { type: 'badge', item: BadgeType } | 
    { type: 'achievement', item: Achievement & {topic: string} } | 
    null
  >(null);
  
  useEffect(() => {
    if (session?.user) {
      loadUserProgress(session.user.id);
    }
  }, [session]);
  
  const loadUserProgress = async (userId: string) => {
    try {
      const [userBadges, userAchievements, userPoints] = await Promise.all([
        getUserBadges(userId),
        getUserAchievements(userId),
        getUserPoints(userId)
      ]);
      
      setBadges(userBadges);
      setAchievements(userAchievements);
      setPoints(userPoints);
    } catch (error) {
      console.error("Error loading user progress:", error);
    }
  };
  
  const getLevelInfo = (points: number) => {
    const levels = [
      { min: 0, level: 1, title: "Beginner" },
      { min: 50, level: 2, title: "Learner" },
      { min: 100, level: 3, title: "Thinker" },
      { min: 200, level: 4, title: "Scholar" },
      { min: 350, level: 5, title: "Expert" }
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].min) {
        const nextLevel = i < levels.length - 1 ? levels[i + 1] : null;
        const progress = nextLevel 
          ? Math.round(((points - levels[i].min) / (nextLevel.min - levels[i].min)) * 100) 
          : 100;
        
        return {
          level: levels[i].level,
          title: levels[i].title,
          progress,
          nextLevel: nextLevel ? {
            level: nextLevel.level,
            pointsNeeded: nextLevel.min - points
          } : null
        };
      }
    }
    
    return { level: 1, title: "Beginner", progress: 0, nextLevel: { level: 2, pointsNeeded: 50 } };
  };
  
  const levelInfo = getLevelInfo(points);
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Your Learning Progress
          </CardTitle>
          <CardDescription>
            Track your learning journey on Socratix
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session?.user ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src={session.user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {session.user.email?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{session.user.email}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-primary to-purple-500">
                      Level {levelInfo.level} {levelInfo.title}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {points} Points
                    </span>
                  </div>
                </div>
              </div>
              
              {levelInfo.nextLevel && (
                <div className="space-y-1">
                  <div className="text-sm flex justify-between">
                    <span>Progress to Level {levelInfo.nextLevel.level}</span>
                    <span>{levelInfo.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-purple-500" 
                      style={{ width: `${levelInfo.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {levelInfo.nextLevel.pointsNeeded} more points to reach Level {levelInfo.nextLevel.level}
                  </p>
                </div>
              )}
              
              {badges.length > 0 && (
                <div>
                  <h3 className="flex items-center font-medium text-sm mb-2">
                    <Award className="h-4 w-4 mr-1" />
                    Badges ({badges.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map(badge => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center justify-center w-16 h-16 border rounded-lg bg-background hover:bg-accent cursor-pointer transition-colors text-center p-1"
                        onClick={() => setSelectedItem({ type: 'badge', item: badge })}
                        title={badge.name}
                      >
                        <div className="text-xl">{badge.image}</div>
                        <div className="text-xs truncate w-full">{badge.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {achievements.length > 0 && (
                <div>
                  <h3 className="flex items-center font-medium text-sm mb-2">
                    <Trophy className="h-4 w-4 mr-1" />
                    Achievements ({achievements.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {achievements.map(achievement => (
                      <div
                        key={achievement.id}
                        className="flex flex-col items-center justify-center w-16 h-16 border rounded-lg bg-background hover:bg-accent cursor-pointer transition-colors text-center p-1"
                        onClick={() => setSelectedItem({ type: 'achievement', item: achievement })}
                        title={`${achievement.name} - ${achievement.topic}`}
                      >
                        <div className="text-xl">{achievement.image}</div>
                        <div className="text-xs truncate w-full">{achievement.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {badges.length === 0 && achievements.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  <p>Start learning to earn badges and achievements!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              <p>Sign in to track your learning progress</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedItem && (
        selectedItem.type === 'badge' ? (
          <AchievementShare 
            badge={selectedItem.item} 
            onClose={() => setSelectedItem(null)}
          />
        ) : (
          <AchievementShare 
            achievement={selectedItem.item} 
            onClose={() => setSelectedItem(null)}
          />
        )
      )}
    </>
  );
};

export default UserProgress;
