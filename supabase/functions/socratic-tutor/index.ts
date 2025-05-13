
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocraticRequest {
  action: 'start' | 'continue' | 'evaluate' | 'challenge' | 'extract_topic' | 'generate_flashcards' | 'generate_summary';
  topic?: string;
  sessionId?: string;
  userResponse?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  responseTiming?: 'normal' | 'fast' | 'slow';
  conversationHistory?: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  prompt?: string; // Raw user input for topic extraction
  numberOfCards?: number; // For flashcard generation
}

// Simple delay function to implement retries
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper for OpenAI calls to handle rate limits
async function callOpenAIWithRetry(url: string, body: any, maxRetries = 3): Promise<Response> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }
  
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '2';
        const waitTime = parseInt(retryAfter) * 1000 || 2000 * Math.pow(2, attempt);
        console.log(`Rate limited. Retrying after ${waitTime}ms. Attempt ${attempt + 1}/${maxRetries}`);
        await delay(waitTime);
        continue;
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      // Exponential backoff
      await delay(1000 * Math.pow(2, attempt));
    }
  }
  
  throw lastError || new Error('Max retries reached');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, topic, sessionId, userResponse, conversationHistory, userLevel, responseTiming, prompt, numberOfCards } = await req.json() as SocraticRequest;
    
    let messages: { role: string; content: string }[] = [];
    let model = 'gpt-4o-mini'; // Default model, more affordable and still powerful
    
    if (action === 'extract_topic') {
      // Extract clean topic name from user prompt
      messages = [
        {
          role: 'system',
          content: `Extract the main topic the user wants to learn about from this sentence. Return ONLY the topic name, capitalized appropriately, with no explanation or additional text.`
        },
        {
          role: 'user',
          content: prompt || ""
        }
      ];
    } else if (action === 'generate_flashcards') {
      // Generate flashcards for the topic
      messages = [
        {
          role: 'system',
          content: `Create ${numberOfCards || 8} specific and informative flashcards about "${topic}". Focus on key concepts, definitions, and important facts.
          Each flashcard should have a clear question on the front and a concise, accurate answer on the back.
          Return your response in this exact JSON format:
          [
            {
              "question": "Question on front of card",
              "answer": "Concise answer on back of card"
            },
            ...
          ]
          
          Make questions focused and specific to the topic "${topic}". Answers should be brief but informative.`
        },
        {
          role: 'user',
          content: `Generate ${numberOfCards || 8} flashcards specifically about ${topic}. Cover the most important concepts and facts.`
        }
      ];
    } else if (action === 'generate_summary') {
      // Generate summarized notes
      messages = [
        {
          role: 'system',
          content: `Create comprehensive but concise summarized notes specifically about "${topic}" for a student. 
          Structure the notes with bullet points, focusing on key concepts, definitions, and important relationships.
          Include 6-8 main points that would help someone quickly review and understand ${topic}.
          Format each point with a bullet (•) and make sure the notes are informative yet concise.
          Be specific to the topic "${topic}" and include factual information.`
        },
        {
          role: 'user',
          content: `Create summarized notes about ${topic}. Include the most important facts and concepts.`
        }
      ];
    } else if (action === 'start') {
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
      throw new Error(`Invalid action specified: ${action}`);
    }

    // Call OpenAI API with retry logic
    const response = await callOpenAIWithRetry('https://api.openai.com/v1/chat/completions', {
      model,
      messages,
      temperature: 0.7,  // Slightly reduce randomness for more consistent outputs
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    // For evaluation, challenge, or flashcards action, parse the response as JSON
    let parsedResult = result;
    if (action === 'evaluate' || action === 'challenge' || action === 'generate_flashcards') {
      try {
        // Extract JSON from the response if it's not already valid JSON
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        const arrayMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else if (arrayMatch) {
          parsedResult = JSON.parse(arrayMatch[0]);
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
        } else if (action === 'challenge') {
          parsedResult = {
            questions: [
              {
                question: `What is a key concept in ${topic}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0
              }
            ],
            timeLimit: 60
          };
        } else if (action === 'generate_flashcards') {
          parsedResult = [
            { 
              question: `What is ${topic}?`, 
              answer: `${topic} is an important subject with key concepts and principles.` 
            },
            { 
              question: `Why is ${topic} important?`, 
              answer: `${topic} has significant applications in many fields.` 
            }
          ];
        }
      }
    }

    return new Response(JSON.stringify({ result: parsedResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in socratic-tutor function:', error);
    
    // Create a more helpful error response based on the type of error
    let errorMessage = error.message;
    let statusCode = 500;
    
    // Handle specific error cases
    if (error.message.includes('rate limit')) {
      errorMessage = "OpenAI rate limit reached. Please try again in a few moments.";
      statusCode = 429;
    } else if (error.message.includes('API key')) {
      errorMessage = "API key configuration issue. Please check server configuration.";
      statusCode = 401;
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
