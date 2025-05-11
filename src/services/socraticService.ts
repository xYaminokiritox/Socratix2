
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// Type definitions for our learning system
export type LearningSession = Tables<"learning_sessions">;
export type ConversationMessage = Tables<"conversation_messages">;

export interface SocraticResponse {
  result: string | {
    completed: boolean;
    confidence_score: number;
    summary: string;
  };
}

// Gamification types
export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  criteria: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
  linkedinTitle: string;
  linkedinDescription: string;
}

// Available badges
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first_session",
    name: "First Steps",
    description: "Started your first learning session",
    image: "🔰",
    criteria: "Complete 1 learning session"
  },
  {
    id: "deep_learner",
    name: "Deep Learner",
    description: "Achieved a high understanding score",
    image: "🧠",
    criteria: "Get 80% or higher on a learning evaluation"
  },
  {
    id: "quick_study",
    name: "Quick Study",
    description: "Completed a session in record time",
    image: "⚡",
    criteria: "Complete a session in under 5 minutes"
  },
  {
    id: "curious_mind",
    name: "Curious Mind",
    description: "Asked a lot of great questions",
    image: "❓",
    criteria: "Send 10+ messages in a single session"
  },
  {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Explored multiple topics",
    image: "🔍",
    criteria: "Study 3 different topics"
  }
];

// Available achievements
export const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "topic_mastery",
    name: "Topic Mastery",
    description: "Achieved complete understanding of a topic",
    image: "🏆",
    linkedinTitle: "Achieved Topic Mastery on Socratix",
    linkedinDescription: "Demonstrated comprehensive understanding of a complex topic through Socratic dialogue."
  },
  {
    id: "consistent_learner",
    name: "Consistent Learner",
    description: "Completed learning sessions on 5 consecutive days",
    image: "📚",
    linkedinTitle: "Consistent Learner Achievement on Socratix",
    linkedinDescription: "Demonstrated dedication to continuous learning through daily study sessions."
  }
];

// Function to start a new learning session
export const createSession = async (topic: string): Promise<LearningSession | null> => {
  // Fix: Get the user ID first, then use it in the insert operation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .from("learning_sessions")
    .insert([{ topic, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return null;
  }

  // Award the "first_session" badge if this is their first session
  const { data: sessions } = await supabase
    .from("learning_sessions")
    .select("id")
    .eq("user_id", user.id);
    
  if (sessions && sessions.length === 1) {
    await awardBadge(user.id, "first_session");
  }

  return data;
};

// Function to get a session by ID
export const getSession = async (sessionId: string): Promise<LearningSession | null> => {
  const { data, error } = await supabase
    .from("learning_sessions")
    .select()
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error retrieving session:", error);
    return null;
  }

  return data;
};

// Function to get all sessions for the current user
export const getUserSessions = async (): Promise<LearningSession[] | null> => {
  const { data, error } = await supabase
    .from("learning_sessions")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error retrieving user sessions:", error);
    return null;
  }

  return data;
};

// Function to get messages for a session
export const getSessionMessages = async (sessionId: string): Promise<ConversationMessage[] | null> => {
  const { data, error } = await supabase
    .from("conversation_messages")
    .select()
    .eq("session_id", sessionId)
    .order("sequence_number", { ascending: true });

  if (error) {
    console.error("Error retrieving session messages:", error);
    return null;
  }

  return data;
};

// Function to add a message to a session
export const addMessage = async (
  sessionId: string, 
  content: string, 
  sender: 'ai' | 'user', 
  messageType: 'question' | 'answer' | 'evaluation',
  sequenceNumber: number
): Promise<ConversationMessage | null> => {
  const { data, error } = await supabase
    .from("conversation_messages")
    .insert([{
      session_id: sessionId,
      content,
      sender,
      message_type: messageType,
      sequence_number: sequenceNumber
    }])
    .select()
    .single();

  if (error) {
    console.error("Error adding message:", error);
    return null;
  }

  // If user sends a lot of messages in one session, award the curious_mind badge
  if (sender === 'user') {
    const { data: messages } = await supabase
      .from("conversation_messages")
      .select("id")
      .eq("session_id", sessionId)
      .eq("sender", "user");
    
    if (messages && messages.length >= 10) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await awardBadge(user.id, "curious_mind");
      }
    }
  }

  return data;
};

// Function to update session with evaluation results
export const updateSessionEvaluation = async (
  sessionId: string,
  completed: boolean,
  confidenceScore: number,
  summary: string
): Promise<LearningSession | null> => {
  const { data, error } = await supabase
    .from("learning_sessions")
    .update({
      completed,
      confidence_score: confidenceScore,
      summary,
      updated_at: new Date().toISOString()
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating session:", error);
    return null;
  }

  // Award badges based on confidence score
  if (completed && data) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (confidenceScore >= 80) {
        await awardBadge(user.id, "deep_learner");
        await awardAchievement(user.id, "topic_mastery", data.topic);
      }
      
      // Check for multiple topics studied
      const { data: sessions } = await supabase
        .from("learning_sessions")
        .select("topic")
        .eq("user_id", user.id)
        .eq("completed", true);
      
      if (sessions) {
        // Count unique topics
        const uniqueTopics = new Set(sessions.map(s => s.topic));
        if (uniqueTopics.size >= 3) {
          await awardBadge(user.id, "knowledge_seeker");
        }
      }
    }
  }

  return data;
};

// Function to call the Socratic tutor edge function
export const callSocraticTutor = async (
  action: 'start' | 'continue' | 'evaluate',
  params: {
    topic?: string;
    sessionId?: string;
    userResponse?: string;
    conversationHistory?: { role: 'system' | 'user' | 'assistant'; content: string }[];
  }
): Promise<SocraticResponse> => {
  const { data, error } = await supabase.functions.invoke('socratic-tutor', {
    body: {
      action,
      ...params
    }
  });

  if (error) {
    console.error("Error calling Socratic tutor:", error);
    throw new Error(`Error calling Socratic tutor: ${error.message}`);
  }

  return data;
};

// Gamification functions

// Helper function to get user's badges from localStorage
const getUserBadgesFromStorage = (userId: string): string[] => {
  const key = `user_badges_${userId}`;
  const storedBadges = localStorage.getItem(key);
  return storedBadges ? JSON.parse(storedBadges) : [];
};

// Helper function to save user's badges to localStorage
const saveUserBadgesToStorage = (userId: string, badges: string[]) => {
  const key = `user_badges_${userId}`;
  localStorage.setItem(key, JSON.stringify(badges));
};

// Helper function to get user's achievements from localStorage
const getUserAchievementsFromStorage = (userId: string): {id: string, topic: string}[] => {
  const key = `user_achievements_${userId}`;
  const storedAchievements = localStorage.getItem(key);
  return storedAchievements ? JSON.parse(storedAchievements) : [];
};

// Helper function to save user's achievements to localStorage
const saveUserAchievementsToStorage = (userId: string, achievements: {id: string, topic: string}[]) => {
  const key = `user_achievements_${userId}`;
  localStorage.setItem(key, JSON.stringify(achievements));
};

// Function to award a badge to a user
export const awardBadge = async (userId: string, badgeId: string): Promise<boolean> => {
  try {
    // Get current badges
    const userBadges = getUserBadgesFromStorage(userId);
    
    // Check if the user already has this badge
    if (userBadges.includes(badgeId)) {
      return false;
    }
    
    // Award the new badge
    userBadges.push(badgeId);
    saveUserBadgesToStorage(userId, userBadges);
    
    console.log(`Badge ${badgeId} awarded to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
};

// Function to award an achievement to a user
export const awardAchievement = async (userId: string, achievementId: string, topic: string): Promise<boolean> => {
  try {
    // Get current achievements
    const userAchievements = getUserAchievementsFromStorage(userId);
    
    // Check if the user already has this achievement
    if (userAchievements.some(a => a.id === achievementId)) {
      return false;
    }
    
    // Award the new achievement
    userAchievements.push({ id: achievementId, topic });
    saveUserAchievementsToStorage(userId, userAchievements);
    
    console.log(`Achievement ${achievementId} awarded to user ${userId} for topic ${topic}`);
    return true;
  } catch (error) {
    console.error("Error awarding achievement:", error);
    return false;
  }
};

// Function to get user's badges
export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const badgeIds = getUserBadgesFromStorage(userId);
    
    // Map badge IDs to actual badge objects
    return badgeIds
      .map(badgeId => AVAILABLE_BADGES.find(badge => badge.id === badgeId))
      .filter((badge): badge is Badge => badge !== undefined);
  } catch (error) {
    console.error("Error retrieving user badges:", error);
    return [];
  }
};

// Function to get user's achievements
export const getUserAchievements = async (userId: string): Promise<(Achievement & {topic: string})[]> => {
  try {
    const userAchievements = getUserAchievementsFromStorage(userId);
    
    // Map achievement IDs to actual achievement objects
    return userAchievements
      .map(item => {
        const achievement = AVAILABLE_ACHIEVEMENTS.find(a => a.id === item.id);
        if (achievement) {
          return {
            ...achievement,
            topic: item.topic
          };
        }
        return undefined;
      })
      .filter((achievement): achievement is (Achievement & {topic: string}) => achievement !== undefined);
  } catch (error) {
    console.error("Error retrieving user achievements:", error);
    return [];
  }
};

// Function to get user's points
export const getUserPoints = async (userId: string): Promise<number> => {
  try {
    const { data: sessions } = await supabase
      .from("learning_sessions")
      .select("confidence_score")
      .eq("user_id", userId)
      .eq("completed", true);
    
    if (!sessions) return 0;
    
    // Calculate points: 10 points per completed session plus bonus points based on confidence score
    return sessions.reduce((total, session) => {
      const basePoints = 10;
      const confidenceBonus = session.confidence_score ? Math.floor(session.confidence_score / 10) : 0;
      return total + basePoints + confidenceBonus;
    }, 0);
  } catch (error) {
    console.error("Error calculating user points:", error);
    return 0;
  }
};
