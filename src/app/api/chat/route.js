import { NextResponse } from 'next/server';
import anthropic from '@/lib/anthropic';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are AgricBot, a friendly, knowledgeable, and experienced Nigerian agricultural advisor and AI assistant.
Your goal is to help Nigerian farmers, agricultural students, and agribusiness enthusiasts with clear, practical, and accurate farming advice.

GUIDELINES:
1. Always respond naturally, warmly, and fluently in Nigerian Pidgin English (e.g. "How you dey?", "Make I explain am for you", "Wetin you need do be say...", "No worry at all").
2. Answer questions covering crops (cassava, yam, maize, tomato, pepper, rice, plantain, etc.), poultry/livestock, fertilizer application, weed/pest control, irrigation, soil health, and farm economics.
3. Keep answers concise, actionable, structured with clear steps where helpful, and easy to read.
4. If a question is not related to agriculture or farming, politely redirect the user in Pidgin to ask about farming, crops, or livestock.

CRITICAL FORMATTING INSTRUCTION:
- DO NOT use markdown symbols or markdown formatting.
- DO NOT use hashtags (# or ##) for headers.
- DO NOT use double asterisks (**) or single asterisks (*) for bold/italics.
- Write in clean, normal conversational plain text with natural spacing and simple numbers (1., 2., 3.) or hyphens (-) for lists.`;

function stripMarkdown(text) {
  if (!text) return '';
  return text
    // Remove markdown headers: #, ##, ### at the beginning of lines
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold & italics markers: **text**, *text*, __text__, _text_
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove inline code ticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Clean excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-5',
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();

    // 1. Check if there is an exact or closely matched canned response in Prisma DB
    try {
      const cannedResponse = await prisma.response.findFirst({
        where: {
          question: {
            equals: trimmedQuestion,
            mode: 'insensitive',
          },
        },
      });

      if (cannedResponse && cannedResponse.answer) {
        return NextResponse.json({ answer: stripMarkdown(cannedResponse.answer) });
      }
    } catch (dbErr) {
      console.warn('Could not query canned responses from DB:', dbErr.message);
    }

    // 2. Query Claude AI using available models
    let answerText = null;
    let lastError = null;

    for (const model of MODELS) {
      try {
        const message = await anthropic.messages.create({
          model: model,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: trimmedQuestion,
            },
          ],
        });

        const rawAnswer = message.content
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('\n');

        if (rawAnswer) {
          answerText = stripMarkdown(rawAnswer);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next:`, err.message);
      }
    }

    if (answerText) {
      return NextResponse.json({ answer: answerText });
    }

    console.error('All Claude models failed:', lastError);
    return NextResponse.json(
      { error: lastError?.message || 'Failed to generate response' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error generating chat response:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    );
  }
}
