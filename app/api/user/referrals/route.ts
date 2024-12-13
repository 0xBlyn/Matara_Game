import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateInitData } from '@/utils/telegram';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const initData = searchParams.get('initData');

    if (!initData) {
      return NextResponse.json({ error: 'No init data provided' }, { status: 400 });
    }

    const telegramId = await validateInitData(initData);
    
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        referrals: {
          select: {
            telegramId: true,
            points: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referrals = user.referrals.map(referral => ({
      username: `user_${referral.telegramId.slice(0, 6)}`,
      earnings: referral.points.toFixed(2)
    }));

    return NextResponse.json({
      referrals,
      referralCode: user.referralCode || uuidv4()
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}