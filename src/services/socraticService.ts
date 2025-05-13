export interface ConversationMessage {
  id?: string;
  session_id: string;
  content: string;
  sender: 'user' | 'ai';
  message_type: 'answer' | 'question' | 'evaluation' | 'feedback';
  sequence_number: number;
  created_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key must be provided.');
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

// Function to award a badge to a user
export const awardBadge = async (userId: string, badgeName: string): Promise<void> => {
  try {
    // Get existing badges
    const existingBadges = getUserBadgesFromStorage(userId);

    // Check if badge already exists
    if (existingBadges.includes(badgeName)) {
      console.log(`User ${userId} already has badge ${badgeName}`);
      return;
    }

    // Add the new badge
    const updatedBadges = [...existingBadges, badgeName];

    // Save updated badges
    saveUserBadgesToStorage(userId, updatedBadges);

    console.log(`Awarded badge ${badgeName} to user ${userId}`);
  } catch (error) {
    console.error("Error awarding badge:", error);
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

export const saveUserPointsToStorage = (userId: string, points: number): void => {
  try {
    localStorage.setItem(`user_points_${userId}`, points.toString());
  } catch (error) {
    console.error("Error saving user points to storage:", error);
  }
};

// User badges storage
export const getUserBadgesFromStorage = (userId: string): string[] => {
  try {
    const badgesData = localStorage.getItem(`user_badges_${userId}`);
    return badgesData ? JSON.parse(badgesData) : [];
  } catch (error) {
    console.error("Error getting user badges from storage:", error);
    return [];
  }
};

export const saveUserBadgesToStorage = (userId: string, badges: string[]): void => {
  try {
    localStorage.setItem(`user_badges_${userId}`, JSON.stringify(badges));
  } catch (error) {
    console.error("Error saving user badges to storage:", error);
  }
};

// User achievements storage
export const getUserAchievementsFromStorage = (userId: string): string[] => {
  try {
    const achievementsData = localStorage.getItem(`user_achievements_${userId}`);
    return achievementsData ? JSON.parse(achievementsData) : [];
  } catch (error) {
    console.error("Error getting user achievements from storage:", error);
    return [];
  }
};

export const saveUserAchievementsToStorage = (userId: string, achievements: string[]): void => {
  try {
    localStorage.setItem(`user_achievements_${userId}`, JSON.stringify(achievements));
  } catch (error) {
    console.error("Error saving user achievements to storage:", error);
  }
};
