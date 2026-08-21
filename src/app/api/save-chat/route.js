import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, sessionId, title, question, answer } = body;

    if (!userId || !sessionId || !question || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, sessionId, question, answer' },
        { status: 400 }
      );
    }

    // 1. Ensure user exists
    await prisma.user.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // 2. Ensure session exists
    await prisma.chatSession.upsert({
      where: { id: sessionId },
      update: {
        ...(title ? { title } : {}),
      },
      create: {
        id: sessionId,
        userId: userId,
        title: title || 'New Chat',
      },
    });

    // 3. Create message
    const createdMessage = await prisma.chatMessage.create({
      data: {
        sessionId: sessionId,
        question: question,
        answer: answer,
        role: 'assistant',
      },
    });

    return NextResponse.json({
      success: true,
      message: createdMessage,
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save chat message' },
      { status: 500 }
    );
  }
}
