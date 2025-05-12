
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocraticRequest {
  action: 'start' | 'continue' | 'evaluate' | 'challenge';
  topic?: string;
  sessionId?: string;
  userResponse?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  responseTiming?: 'normal' | 'fast' | 'slow';
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

    const { action, topic, sessionId, userResponse, conversationHistory, userLevel, responseTiming } = await req.json() as SocraticRequest;
    
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
      
      // Adapt difficulty based on user responses
      const difficultyAdjustment = userLevel ? 
        `The user appears to be at a ${userLevel} level, so adjust your questions accordingly.` : 
        'Adapt to the user\'s level of understanding based on their previous responses.';
      
      // Adjust response pacing based on user timing
      const timingAdjustment = responseTiming ? 
        `The user responds at a ${responseTiming} pace, so ${responseTiming === 'fast' ? 'increase complexity and depth' : 
          responseTiming === 'slow' ? 'simplify and provide more guidance' : 'maintain balanced complexity'}.` : 
        'Maintain a balanced pace in your responses.';
      
      messages = [
        ...conversationHistory,
        { role: 'user', content: userResponse },
        {
          role: 'system',
          content: `Based on the user's response, provide:
          1. Brief feedback on their answer (1-2 sentences evaluating their response and encouraging critical thinking)
          2. A follow-up question that builds upon their answer
          
          ${difficultyAdjustment}
          ${timingAdjustment}
          
          Your follow-up question should push them to think more deeply or consider another aspect of the topic.
          Format your response as: 
          "FEEDBACK: [Your feedback on their answer]
          
          QUESTION: [Your next question]"`
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
          3. Provide a brief summary (3-4 sentences) of what the learner appears to understand.
          4. Include a 1-2 sentence personalized feedback to help them improve further.
          
          Return your evaluation in JSON format with these fields: "completed" (boolean), "confidence_score" (number 0-100), "summary" (string), and "feedback" (string).`
        },
        ...conversationHistory
      ];
    } else if (action === 'challenge') {
      // Generate a challenge quiz
      if (!topic) {
        throw new Error('Missing topic for challenge');
      }
      
      messages = [
        {
          role: 'system',
          content: `Create a multiple-choice quiz on the topic of "${topic}" with 5 questions.
          Each question should have 4 options and exactly one correct answer.
          Make sure the questions test understanding rather than just recall.
          
          Return your response in this exact JSON format:
          {
            "questions": [
              {
                "question": "Question text here",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0
              },
              ...
            ],
            "timeLimit": 120
          }
          
          The "correctAnswer" field should be the index (0-3) of the correct option.
          Set a reasonable time limit in seconds for the entire quiz.`
        },
        {
          role: 'user',
          content: `Please create a challenge quiz about ${topic}.`
        }
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
    
    // For evaluation or challenge action, parse the response as JSON
    let parsedResult = result;
    if (action === 'evaluate' || action === 'challenge') {
      try {
        // Extract JSON from the response if it's not already valid JSON
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          parsedResult = JSON.parse(result);
        }
      } catch (e) {
        console.error(`Failed to parse ${action} result as JSON:`, e);
        // Provide a fallback structured response
        if (action === 'evaluate') {
          parsedResult = {
            completed: false,
            confidence_score: 0,
            summary: "Unable to evaluate the conversation.",
            feedback: "Please continue the conversation to receive a more accurate evaluation."
          };
        } else {
          parsedResult = {
            questions: [],
            timeLimit: 0
          };
        }
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
