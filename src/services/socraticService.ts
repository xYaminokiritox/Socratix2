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
    feedback?: string; // Added feedback field for user response evaluation
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
  },
  {
    id: "focused_learner",
    name: "Focused Learner",
    description: "Answered 5 questions in a row correctly",
    image: "🎯",
    criteria: "Answer 5 questions correctly in a single session"
  },
  {
    id: "critical_thinker",
    name: "Critical Thinker",
    description: "Used higher-order thinking in your answers",
    image: "💭",
    criteria: "Demonstrate critical thinking skills in your responses"
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Performed well in Challenge Mode quizzes",
    image: "🏆",
    criteria: "Get 90%+ score on a Challenge Mode quiz"
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
  },
  {
    id: "speed_learner",
    name: "Speed Learner",
    description: "Mastered a topic in record time",
    image: "⏱️",
    linkedinTitle: "Speed Learner Achievement on Socratix",
    linkedinDescription: "Demonstrated exceptional ability to quickly master complex topics."
  },
  {
    id: "challenge_champion",
    name: "Challenge Champion",
    description: "Completed 10 Challenge Mode quizzes with perfect scores",
    image: "🎮",
    linkedinTitle: "Challenge Champion on Socratix",
    linkedinDescription: "Demonstrated mastery by completing 10 timed quizzes with perfect scores."
  }
];

// Function to extract clean topic name from user prompt
export const extractTopicFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('socratic-tutor', {
      body: {
        action: 'extract_topic',
        prompt
      }
    });

    if (error) {
      console.error("Error extracting topic:", error);
      // If extraction fails, use the prompt as is but truncate if needed
      return prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;
    }

    // If result is empty or not a string, use the original prompt
    if (!data.result || typeof data.result !== 'string') {
      return prompt;
    }

    return data.result.trim();
  } catch (error) {
    console.error("Error extracting topic:", error);
    return prompt;
  }
};

// Function to start a new learning session
export const createSession = async (topicPrompt: string): Promise<LearningSession | null> => {
  // First, extract a clean topic name from the user prompt
  const cleanTopic = await extractTopicFromPrompt(topicPrompt);
  
  // Fix: Get the user ID first, then use it in the insert operation
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("No authenticated user found");
    return null;
  }

  const { data, error } = await supabase
    .from("learning_sessions")
    .insert([{ topic: cleanTopic, user_id: user.id }])
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
  messageType: 'question' | 'answer' | 'evaluation' | 'feedback',
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
  action: 'start' | 'continue' | 'evaluate' | 'challenge',
  params: {
    topic?: string;
    sessionId?: string;
    userResponse?: string;
    conversationHistory?: { role: 'system' | 'user' | 'assistant'; content: string }[];
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
    responseTiming?: 'normal' | 'fast' | 'slow';
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

// Function to generate flashcards for a topic using AI
export const generateFlashcards = async (
  topic: string,
  numberOfCards: number = 8
): Promise<{ question: string; answer: string }[]> => {
  try {
    console.log(`Generating ${numberOfCards} flashcards for ${topic}`);
    const { data, error } = await supabase.functions.invoke('socratic-tutor', {
      body: {
        action: 'generate_flashcards',
        topic,
        numberOfCards
      }
    });

    if (error) {
      console.error("Error generating flashcards:", error);
      throw new Error(`Error generating flashcards: ${error.message}`);
    }

    if (Array.isArray(data.result) && data.result.length > 0) {
      return data.result;
    }
    
    // Fallback if we don't get a proper array
    return [
      { question: `What is ${topic}?`, answer: `${topic} is a subject of study with many important concepts.` },
      { question: `Why is ${topic} important?`, answer: `${topic} has significant applications in various fields.` },
      { question: `How can learning about ${topic} benefit someone?`, answer: `Understanding ${topic} can improve critical thinking and problem-solving skills.` }
    ];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    // Return fallback content
    return [
      { question: `What is ${topic}?`, answer: `${topic} is a subject of study with many important concepts.` },
      { question: `Why is ${topic} important?`, answer: `${topic} has significant applications in various fields.` },
      { question: `How can learning about ${topic} benefit someone?`, answer: `Understanding ${topic} can improve critical thinking and problem-solving skills.` }
    ];
  }
};

// Function to generate summarized notes for a topic
export const generateSummary = async (topic: string): Promise<string> => {
  try {
    console.log(`Generating summary for ${topic}`);
    const { data, error } = await supabase.functions.invoke('socratic-tutor', {
      body: {
        action: 'generate_summary',
        topic
      }
    });

    if (error) {
      console.error("Error generating summary:", error);
      throw new Error(`Error generating summary: ${error.message}`);
    }

    if (typeof data.result === 'string' && data.result.trim().length > 0) {
      return data.result;
    }
    
    // Fallback
    return `• ${topic} is an important field of study with various applications\n\n• Understanding ${topic} requires knowledge of fundamental principles and concepts\n\n• ${topic} has practical applications in many professional fields\n\n• Learning ${topic} develops critical thinking and analytical skills\n\n• ${topic} continues to evolve with new research and discoveries`;
  } catch (error) {
    console.error("Error generating summary:", error);
    return `• ${topic} is an important field of study with various applications\n\n• Understanding ${topic} requires knowledge of fundamental principles and concepts\n\n• ${topic} has practical applications in many professional fields\n\n• Learning ${topic} develops critical thinking and analytical skills\n\n• ${topic} continues to evolve with new research and discoveries`;
  }
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

// Helper function to get user's points from localStorage
const getUserPointsFromStorage = (userId: string): number => {
  const key = `user_points_${userId}`;
  const storedPoints = localStorage.getItem(key);
  return storedPoints ? parseInt(storedPoints) : 0;
};

// Helper function to save user's points to localStorage
const saveUserPointsToStorage = (userId: string, points: number) => {
  const key = `user_points_${userId}`;
  localStorage.setItem(key, points.toString());
};

// Helper function to get topic-specific progress from localStorage
const getTopicProgressFromStorage = (userId: string, topic: string): number => {
  const key = `topic_progress_${userId}_${topic.replace(/\s+/g, '_').toLowerCase()}`;
  const storedProgress = localStorage.getItem(key);
  return storedProgress ? parseInt(storedProgress) : 0;
};

// Helper function to save topic-specific progress to localStorage
const saveTopicProgressToStorage = (userId: string, topic: string, progress: number) => {
  const key = `topic_progress_${userId}_${topic.replace(/\s+/g, '_').toLowerCase()}`;
  localStorage.setItem(key, progress.toString());
};

// Function to award points to a user
export const awardPoints = async (userId: string, points: number): Promise<boolean> => {
  try {
    const currentPoints = getUserPointsFromStorage(userId);
    const newPoints = currentPoints + points;
    saveUserPointsToStorage(userId, newPoints);
    
    console.log(`Awarded ${points} points to user ${userId}, total now: ${newPoints}`);
    return true;
  } catch (error) {
    console.error("Error awarding points:", error);
    return false;
  }
};

// Function to update topic progress
export const updateTopicProgress = async (userId: string, topic: string, progress: number): Promise<boolean> => {
  try {
    // Get current progress (use the highest value)
    const currentProgress = getTopicProgressFromStorage(userId, topic);
    const newProgress = Math.max(currentProgress, progress);
    saveTopicProgressToStorage(userId, topic, newProgress);
    
    console.log(`Updated progress for ${topic} to ${newProgress}% for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error updating topic progress:", error);
    return false;
  }
};

// Function to get topic progress
export const getTopicProgress = async (userId: string, topic: string): Promise<number> => {
  try {
    return getTopicProgressFromStorage(userId, topic);
  } catch (error) {
    console.error("Error getting topic progress:", error);
    return 0;
  }
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
    
    // Award points for getting a badge
    await awardPoints(userId, 25);
    
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
    
    // Award points for getting an achievement
    await awardPoints(userId, 100);
    
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
    return getUserPointsFromStorage(userId);
  } catch (error) {
    console.error("Error retrieving user points:", error);
    return 0;
  }
};

// Function to generate a challenge quiz
export const generateChallengeQuiz = async (
  topic: string,
  numberOfQuestions: number = 5
): Promise<{
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  timeLimit: number;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('socratic-tutor', {
      body: {
        action: 'challenge',
        topic,
        numberOfQuestions
      }
    });

    if (error) {
      throw error;
    }

    if (typeof data.result === 'object' && data.result.questions) {
      return data.result;
    }
    
    throw new Error("Invalid response format from AI");
  } catch (error) {
    console.error("Error generating challenge quiz:", error);
    // Fallback
    return {
      questions: [
        {
          question: `Which of the following best describes ${topic}?`,
          options: [
            `A systematic approach to understanding ${topic.toLowerCase()}`,
            `A random collection of facts about ${topic.toLowerCase()}`,
            `A philosophy opposed to ${topic.toLowerCase()}`,
            `A mathematical model unrelated to ${topic.toLowerCase()}`
          ],
          correctAnswer: 0
        }
      ],
      timeLimit: 30
    };
  }
};

// Add deleteSession function
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('learning_sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
};
