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

  return data;
};

// Function to call the Socratic tutor edge function
export const callSocraticTutor = async (
  action: 'start' | 'continue' | 'evaluate',
  params: {
    topic?: string;
    sessionId?: string;
    userResponse?: string;
    conversationHistory?: { role: 'system' | 'user' | 'assistant', content: string }[];
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
