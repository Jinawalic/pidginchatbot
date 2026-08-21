import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const responses = await prisma.response.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error fetching canned responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
