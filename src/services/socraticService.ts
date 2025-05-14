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
  error?: string;
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

// Function to start a new learning session
export const createSession = async (topic: string): Promise<LearningSession | null> => {
  try {
    // Get the user ID first, then use it in the insert operation
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
      throw error;
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
  } catch (error) {
    console.error("Error in createSession:", error);
    throw error;
  }
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
  try {
    console.log(`Adding message - type: ${messageType}, sender: ${sender}, content: ${content.substring(0, 30)}...`);
    
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
      throw new Error(`Failed to add message: ${error.message}`);
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
  } catch (error) {
    console.error("Error in addMessage:", error);
    throw error;
  }
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
  try {
    console.log("Calling Socratic tutor with action:", action, "and params:", params);
    
    const { data, error } = await supabase.functions.invoke('socratic-tutor', {
      body: {
        action,
        ...params
      }
    });

    if (error) {
      console.error("Error calling Socratic tutor:", error);
      return { result: "Sorry, I encountered an error. Please try again.", error: error.message };
    }

    return data || { result: "Sorry, I received an empty response. Please try again." };
  } catch (error) {
    console.error("Error in callSocraticTutor:", error);
    return { 
      result: "Sorry, I encountered a technical issue. Please try again.", 
      error: error instanceof Error ? error.message : String(error) 
    };
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

// Function to generate flashcards for a topic
export const generateFlashcards = async (
  topic: string,
  numberOfCards: number = 5
): Promise<{ question: string; answer: string }[]> => {
  try {
    // In a real app, we would call an AI service to generate these
    // For the demo, we'll return some hardcoded flashcards based on the topic
    const genericFlashcards = [
      { question: `What is the main concept of ${topic}?`, answer: `${topic} is a field that focuses on understanding and application of key principles.` },
      { question: `Who is considered the founder of ${topic}?`, answer: `While many contributed to ${topic}, it was formalized in the early studies.` },
      { question: `When did ${topic} first become widely recognized?`, answer: `${topic} gained significant attention in the academic community in recent decades.` },
      { question: `Why is ${topic} important?`, answer: `${topic} provides foundational understanding for many applications in related fields.` },
      { question: `What are the key components of ${topic}?`, answer: `The key components include theoretical frameworks, practical applications, and analytical methods.` },
    ];
    
    return genericFlashcards.slice(0, numberOfCards);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
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
    // In a real app, we would call an AI service to generate these
    // For the demo, we'll return some hardcoded questions based on the topic
    const genericQuestions = [
      {
        question: `Which of the following best describes ${topic}?`,
        options: [
          `A systematic approach to understanding ${topic.toLowerCase()}`,
          `A random collection of facts about ${topic.toLowerCase()}`,
          `A philosophy opposed to ${topic.toLowerCase()}`,
          `A mathematical model unrelated to ${topic.toLowerCase()}`
        ],
        correctAnswer: 0
      },
      {
        question: `What is a key principle of ${topic}?`,
        options: [
          `Avoiding all practical applications`,
          `Focusing only on theoretical frameworks`,
          `Integration of theory and practice`,
          `Rejecting established knowledge`
        ],
        correctAnswer: 2
      },
      {
        question: `Which field is most closely related to ${topic}?`,
        options: [
          `Ancient literature`,
          `Modern applications of ${topic.toLowerCase()}`,
          `Unrelated scientific disciplines`,
          `Purely fictional concepts`
        ],
        correctAnswer: 1
      },
      {
        question: `What approach is typically used when studying ${topic}?`,
        options: [
          `Random guessing`,
          `Memorization without understanding`,
          `Analytical thinking and critical analysis`,
          `Avoiding all theoretical frameworks`
        ],
        correctAnswer: 2
      },
      {
        question: `Which of the following is NOT typically associated with ${topic}?`,
        options: [
          `Systematic research`,
          `Thoughtful analysis`,
          `Evidence-based conclusions`,
          `Arbitrary assumptions without evidence`
        ],
        correctAnswer: 3
      }
    ];
    
    // Set a time limit of 30 seconds per question
    const timeLimit = numberOfQuestions * 30;
    
    return {
      questions: genericQuestions.slice(0, numberOfQuestions),
      timeLimit
    };
  } catch (error) {
    console.error("Error generating challenge quiz:", error);
    return {
      questions: [],
      timeLimit: 0
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
