
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocraticRequest {
  action: 'start' | 'continue' | 'evaluate';
  topic?: string;
  sessionId?: string;
  userResponse?: string;
  conversationHistory?: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const { action, topic, sessionId, userResponse, conversationHistory } = await req.json() as SocraticRequest;
    
    let messages: { role: string; content: string }[] = [];
    
    if (action === 'start') {
      // Starting a new Socratic session
      messages = [
        {
          role: 'system',
          content: `You are an AI Socratic tutor. Your goal is to guide the learner through a series of thought-provoking questions about ${topic}.
          Ask open-ended questions to stimulate critical thinking. Your first question should be accessible but challenging.
          Be encouraging and supportive. Focus on the Socratic method where you guide through questions, not direct teaching.
          Keep your responses focused only on asking one question at a time. Do not provide answers or lengthy explanations.
          Return only your question, nothing else.`
        },
        {
          role: 'user',
          content: `I want to learn about ${topic} through the Socratic method. Please ask me your first question.`
        }
      ];
    } else if (action === 'continue') {
      // Continue an existing conversation
      if (!conversationHistory || !userResponse) {
        throw new Error('Missing conversation history or user response');
      }
      
      messages = [
        ...conversationHistory,
        { role: 'user', content: userResponse },
        {
          role: 'system',
          content: `Based on the user's response, ask a follow-up question that builds upon their answer. 
          Your question should push them to think more deeply or consider another aspect of the topic.
          Keep your response focused only on asking one question. Do not provide answers or lengthy explanations.
          Return only your question, nothing else.`
        }
      ];
    } else if (action === 'evaluate') {
      // Evaluate the user's progress
      if (!conversationHistory || !topic) {
        throw new Error('Missing conversation history or topic');
      }
      
      messages = [
        {
          role: 'system',
          content: `You are evaluating a student's understanding of ${topic} based on a Socratic dialogue.
          Analyze the conversation history and determine:
          1. Has the learner demonstrated a good understanding of ${topic}?
          2. Assign a confidence score from 0-100 indicating how well they've grasped the topic.
          3. Provide a brief summary (2-3 sentences) of what the learner appears to understand.
          Return your evaluation in JSON format with three fields: "completed" (boolean), "confidence_score" (number 0-100), and "summary" (string).`
        },
        ...conversationHistory
      ];
    } else {
      throw new Error('Invalid action specified');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const result = data.choices[0].message.content;
    
    // For evaluation action, parse the response as JSON
    let parsedResult = result;
    if (action === 'evaluate') {
      try {
        // Extract JSON from the response if it's not already valid JSON
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          parsedResult = JSON.parse(result);
        }
      } catch (e) {
        console.error('Failed to parse evaluation result as JSON:', e);
        // Provide a fallback structured response
        parsedResult = {
          completed: false,
          confidence_score: 0,
          summary: "Unable to evaluate the conversation."
        };
      }
    }

    return new Response(JSON.stringify({ result: parsedResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in socratic-tutor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
