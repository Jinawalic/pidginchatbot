import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const history = [];
    for (const session of sessions) {
      for (const msg of session.messages) {
        history.push({
          id: msg.id,
          userId: session.userId,
          sessionId: session.id,
          title: session.title,
          question: msg.question,
          answer: msg.answer,
          timestamp: msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
