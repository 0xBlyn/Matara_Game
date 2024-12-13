import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No referral code provided' }, { status: 400 });
    }

    const referrer = await prisma.user.findFirst({
      where: { referralCode: { equals: code } },
      select: {
        id: true,
        telegramId: true,
      }
    });

    return NextResponse.json({
      valid: !!referrer,
      referrerId: referrer?.id || null,
    });
  } catch (error) {
    console.error('Error verifying referral:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 