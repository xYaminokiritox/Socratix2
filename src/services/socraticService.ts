export interface ConversationMessage {
  id?: string;
  session_id: string;
  content: string;
  sender: 'user' | 'ai';
  message_type: 'answer' | 'question' | 'evaluation' | 'feedback';
  sequence_number: number;
  created_at?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string; // emoji or icon representation
  created_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string; // emoji or icon representation
  linkedinTitle?: string;
  linkedinDescription?: string;
  created_at?: string;
}

export interface LearningSession {
  id: string;
  topic: string;
  completed: boolean;
  confidence_score: number;
  summary: string;
  created_at: string;
  user_id?: string;
}

// Mock data for badges
const BADGES = [
  { id: 'quiz_master', name: 'Quiz Master', description: 'Scored 90% or higher on a challenge quiz', image: '🏆' },
  { id: 'first_session', name: 'First Steps', description: 'Completed your first learning session', image: '🌱' },
  { id: 'streak_3', name: 'Learning Streak', description: 'Learned for 3 days in a row', image: '🔥' },
  { id: 'question_asker', name: 'Curious Mind', description: 'Asked 10 questions in learning sessions', image: '❓' },
];

// Mock data for flashcards
const MOCK_FLASHCARDS = {
  "JavaScript": [
    { question: "What is a closure in JavaScript?", answer: "A closure is the combination of a function and the lexical environment within which that function was declared." },
    { question: "What is the difference between == and === in JavaScript?", answer: "== compares values with type coercion, while === compares both values and types without coercion." },
  ],
  "Python": [
    { question: "What are Python decorators?", answer: "Decorators are functions that modify the functionality of another function." },
    { question: "What is the difference between a list and a tuple in Python?", answer: "Lists are mutable, while tuples are immutable." },
  ],
};

// Mock data for learning sessions
const MOCK_SESSIONS = [
  { 
    id: '1', 
    topic: 'JavaScript Basics', 
    completed: true, 
    confidence_score: 85,
    summary: 'JavaScript is a high-level programming language used for web development.',
    created_at: '2023-03-15T10:30:00Z',
  },
  { 
    id: '2', 
    topic: 'React Hooks', 
    completed: false, 
    confidence_score: 0,
    summary: '',
    created_at: '2023-03-16T14:45:00Z',
  },
];

// For Vite, we use import.meta.env instead of process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL and key not provided. Using mock data only.');
}

const createSupabaseClient = () => {
  return {
    from: (table: string) => {
      return {
        select: (columns?: string) => {
          return {
            eq: (column: string, value: any) => {
              return {
                order: (column: string, options?: { ascending: boolean }) => {
                  return {
                    returns: async (): Promise<{ data: any[] | null; error: any }> => {
                      // Mocked data for demonstration
                      return new Promise((resolve) => {
                        setTimeout(() => {
                          resolve({ data: [], error: null });
                        }, 500);
                      });
                    },
                  };
                },
                returns: async (): Promise<{ data: any[] | null; error: any }> => {
                  // Mocked data for demonstration
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ data: [], error: null });
                    }, 500);
                  });
                },
              };
            },
            returns: async (): Promise<{ data: any[] | null; error: any }> => {
              // Mocked data for demonstration
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve({ data: [], error: null });
                }, 500);
              });
            },
          };
        },
        insert: (payload: any) => {
          return {
            select: () => {
              return {
                single: () => {
                  return {
                    returns: async (): Promise<{ data: any | null; error: any }> => {
                      // Mocked data for demonstration
                      return new Promise((resolve) => {
                        setTimeout(() => {
                          resolve({ data: {}, error: null });
                        }, 500);
                      });
                    },
                  };
                },
                returns: async (): Promise<{ data: any | null; error: any }> => {
                  // Mocked data for demonstration
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ data: {}, error: null });
                    }, 500);
                  });
                },
              };
            },
            returns: async (): Promise<{ data: any | null; error: any }> => {
              // Mocked data for demonstration
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve({ data: {}, error: null });
                }, 500);
              });
            },
          };
        },
        update: (payload: any) => {
          return {
            eq: (column: string, value: any) => {
              return {
                returns: async (): Promise<{ data: any | null; error: any }> => {
                  // Mocked data for demonstration
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ data: {}, error: null });
                    }, 500);
                  });
                },
              };
            },
          };
        },
        delete: () => {
          return {
            eq: (column: string, value: any) => {
              return {
                returns: async (): Promise<{ data: any | null; error: any }> => {
                  // Mocked data for demonstration
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ data: {}, error: null });
                    }, 500);
                  });
                },
              };
            },
          };
        },
      };
    },
  };
};

const supabase = createSupabaseClient();

// Function to extract topic from prompt
export const extractTopicFromPrompt = async (prompt: string): Promise<string | null> => {
  try {
    const response = await callSocraticTutor('extract_topic', { prompt });
    if (response && typeof response.result === 'string') {
      return response.result.trim();
    }
    return null;
  } catch (error) {
    console.error("Error extracting topic:", error);
    return null;
  }
};

// Function to create a new learning session
export const createSession = async (topicInput: string): Promise<{ id: string; topic: string } | null> => {
  try {
    // Extract clean topic name from user prompt
    const topic = await extractTopicFromPrompt(topicInput);
    if (!topic) {
      console.error("Could not extract topic from prompt.");
      return null;
    }

    const { data, error } = await supabase
      .from('learning_sessions')
      .insert([{ topic: topic }])
      .select()
      .single()
      .returns();

    if (error) {
      console.error("Error creating session:", error);
      return null;
    }

    return { id: data.id, topic: data.topic };
  } catch (error) {
    console.error("Error in createSession:", error);
    return null;
  }
};

// Function to get an existing learning session
export const getSession = async (sessionId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('id', sessionId)
      .returns()

    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }

    return data ? data[0] : null;
  } catch (error) {
    console.error("Error in getSession:", error);
    return null;
  }
};

// Function to get all learning sessions for a user
export const getUserSessions = async (userId?: string): Promise<LearningSession[]> => {
  try {
    // For mock data, just return the mock sessions
    return MOCK_SESSIONS;
  } catch (error) {
    console.error("Error in getUserSessions:", error);
    return [];
  }
};

// Function to add a message to a learning session
export const addMessage = async (
  sessionId: string,
  content: string,
  sender: 'user' | 'ai',
  message_type: 'answer' | 'question' | 'evaluation' | 'feedback',
  sequence_number: number
): Promise<ConversationMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert([{ session_id: sessionId, content, sender, message_type, sequence_number }])
      .select()
      .single()
      .returns();

    if (error) {
      console.error("Error adding message:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in addMessage:", error);
    return null;
  }
};

// Function to call the Socratic Tutor Edge Function
export const callSocraticTutor = async (action: string, payload: any): Promise<any> => {
  try {
    const res = await fetch('/api/socratic-tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Socratic Tutor API error:", errorData);
      throw new Error(`Socratic Tutor API error: ${errorData.error || 'Unknown error'}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error calling Socratic Tutor:", error);
    return { error: error.message || 'Failed to call Socratic Tutor' };
  }
};

// Function to update session evaluation
export const updateSessionEvaluation = async (
  sessionId: string,
  completed: boolean,
  confidence_score: number,
  summary: string
): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('learning_sessions')
      .update({ completed, confidence_score, summary })
      .eq('id', sessionId)
      .returns();

    if (error) {
      console.error("Error updating session evaluation:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateSessionEvaluation:", error);
    return null;
  }
};

// Function to delete a learning session
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    // First, delete all associated conversation messages
    const { error: messagesError } = await supabase
      .from('conversation_messages')
      .delete()
      .eq('session_id', sessionId)
      .returns();

    if (messagesError) {
      console.error("Error deleting conversation messages:", messagesError);
      return false;
    }

    // Then, delete the learning session
    const { error: sessionError } = await supabase
      .from('learning_sessions')
      .delete()
      .eq('id', sessionId)
      .returns();

    if (sessionError) {
      console.error("Error deleting learning session:", sessionError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteSession:", error);
    return false;
  }
};

// Function to get topic-specific progress
export const getTopicProgress = async (userId: string, topic: string): Promise<number> => {
  try {
    const progressData = localStorage.getItem(`topic_progress_${userId}_${topic}`);
    return progressData ? parseInt(progressData, 10) : 0;
  } catch (error) {
    console.error("Error getting topic progress from storage:", error);
    return 0;
  }
};

// Function to update topic-specific progress
export const updateTopicProgress = async (userId: string, topic: string, progress: number): Promise<void> => {
  try {
    localStorage.setItem(`topic_progress_${userId}_${topic}`, progress.toString());
  } catch (error) {
    console.error("Error saving topic progress to storage:", error);
  }
};

// Function to generate summarized notes
export const generateSummary = async (topic: string): Promise<string> => {
  try {
    const response = await callSocraticTutor('generate_summary', { topic });
    if (response && typeof response.result === 'string') {
      return response.result;
    } else {
      console.error("Unexpected response format for summary:", response);
      throw new Error("Failed to generate summary due to unexpected response format.");
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

// Function to generate flashcards
export const generateFlashcards = async (topic: string, numberOfCards: number = 8): Promise<{ question: string; answer: string }[]> => {
  try {
    const response = await callSocraticTutor('generate_flashcards', { topic, numberOfCards });
    if (response && Array.isArray(response.result)) {
      return response.result;
    } else {
      console.error("Unexpected response format for flashcards:", response);
      throw new Error("Failed to generate flashcards due to unexpected response format.");
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
};

// Function to generate challenge quiz
export const generateChallengeQuiz = async (topic: string): Promise<{ 
  questions: { question: string; options: string[]; correctAnswer: number }[];
  timeLimit: number;
}> => {
  try {
    // In a real application, this would call the socratic tutor
    // For now, return a mock quiz
    return {
      questions: [
        {
          question: `What is a key concept in ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 1
        },
        {
          question: `How would you apply ${topic} in a real-world scenario?`,
          options: ["Method 1", "Method 2", "Method 3", "Method 4"],
          correctAnswer: 2
        },
        {
          question: `Which statement about ${topic} is false?`,
          options: ["Statement A", "Statement B", "Statement C", "Statement D"],
          correctAnswer: 3
        }
      ],
      timeLimit: 60 // seconds
    };
  } catch (error) {
    console.error("Error generating challenge quiz:", error);
    throw new Error(`Failed to generate challenge quiz: ${error.message}`);
  }
};

// Function to award a badge to a user
export const awardBadge = async (userId: string, badgeId: string): Promise<void> => {
  try {
    // Get existing badges
    const existingBadges = getUserBadgesFromStorage(userId);

    // Check if badge already exists
    if (existingBadges.some(badge => badge.id === badgeId)) {
      console.log(`User ${userId} already has badge ${badgeId}`);
      return;
    }

    // Find the badge to add
    const badgeToAdd = BADGES.find(badge => badge.id === badgeId);
    if (!badgeToAdd) {
      console.error(`Badge ${badgeId} not found`);
      return;
    }

    // Add the new badge
    const updatedBadges = [...existingBadges, badgeToAdd];

    // Save updated badges
    saveUserBadgesToStorage(userId, updatedBadges);

    console.log(`Awarded badge ${badgeId} to user ${userId}`);
  } catch (error) {
    console.error("Error awarding badge:", error);
  }
};

// Function to award points to a user
export const awardPoints = async (userId: string, points: number): Promise<void> => {
  try {
    // Get current points
    const currentPoints = getUserPointsFromStorage(userId);
    
    // Add new points
    const updatedPoints = currentPoints + points;
    
    // Save updated points
    saveUserPointsToStorage(userId, updatedPoints);
    
    console.log(`Awarded ${points} points to user ${userId}, total: ${updatedPoints}`);
  } catch (error) {
    console.error("Error awarding points:", error);
  }
};

// User points storage
export const getUserPointsFromStorage = (userId: string): number => {
  try {
    const pointsData = localStorage.getItem(`user_points_${userId}`);
    return pointsData ? parseInt(pointsData, 10) : 0;
  } catch (error) {
    console.error("Error getting user points from storage:", error);
    return 0;
  }
};

// Function to get user points
export const getUserPoints = (userId: string): number => {
  return getUserPointsFromStorage(userId);
};

export const saveUserPointsToStorage = (userId: string, points: number): void => {
  try {
    localStorage.setItem(`user_points_${userId}`, points.toString());
  } catch (error) {
    console.error("Error saving user points to storage:", error);
  }
};

// User badges storage
export const getUserBadgesFromStorage = (userId: string): Badge[] => {
  try {
    const badgesData = localStorage.getItem(`user_badges_${userId}`);
    if (badgesData) {
      // Parse the stored badge IDs
      const badgeIds: string[] = JSON.parse(badgesData);
      // Return the full badge objects
      return badgeIds.map(id => {
        const badge = BADGES.find(b => b.id === id);
        return badge || { id: 'unknown', name: 'Unknown Badge', description: 'Badge not found', image: '❓' };
      });
    }
    return [BADGES[1]]; // Return first badge for demo purposes
  } catch (error) {
    console.error("Error getting user badges from storage:", error);
    return [];
  }
};

// Function to get user badges
export const getUserBadges = (userId: string): Badge[] => {
  return getUserBadgesFromStorage(userId);
};

export const saveUserBadgesToStorage = (userId: string, badges: Badge[]): void => {
  try {
    // Store just the badge IDs
    const badgeIds = badges.map(badge => badge.id);
    localStorage.setItem(`user_badges_${userId}`, JSON.stringify(badgeIds));
  } catch (error) {
    console.error("Error saving user badges to storage:", error);
  }
};

// User achievements storage
export const getUserAchievementsFromStorage = (userId: string): (Achievement & {topic: string})[] => {
  try {
    const achievementsData = localStorage.getItem(`user_achievements_${userId}`);
    if (achievementsData) {
      return JSON.parse(achievementsData);
    }
    // Return a demo achievement
    return [{ 
      id: 'a1', 
      name: 'Python Master', 
      description: 'Completed Python learning path with 90% mastery', 
      image: '🐍',
      topic: 'Python',
      linkedinTitle: 'Python Mastery Achievement',
      linkedinDescription: 'I completed the Python learning path on Socratix with 90% understanding!'
    }];
  } catch (error) {
    console.error("Error getting user achievements from storage:", error);
    return [];
  }
};

// Function to get user achievements
export const getUserAchievements = (userId: string): (Achievement & {topic: string})[] => {
  return getUserAchievementsFromStorage(userId);
};

export const saveUserAchievementsToStorage = (userId: string, achievements: (Achievement & {topic: string})[]): void => {
  try {
    localStorage.setItem(`user_achievements_${userId}`, JSON.stringify(achievements));
  } catch (error) {
    console.error("Error saving user achievements to storage:", error);
  }
};
