// AI Generation API Route
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const result = await streamObject({
      model: google('gemini-2.5-flash'),
      system: 'You are an expert academic question setter. Generate unique exam questions based on the user\'s prompt.',
      prompt,
      schema: z.object({
        questions: z.array(z.object({
          id: z.string().describe('A unique random string ID'),
          text: z.string().describe('The question text'),
          type: z.enum(['mcq']).describe('Question type'),
          difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
          marks: z.number().default(4).describe('Marks for the question'),
          options: z.array(z.object({
            id: z.string(),
            text: z.string()
          })).length(4).describe('4 options for the MCQ')
        })).min(1).describe('Array of generated questions')
      }),
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

