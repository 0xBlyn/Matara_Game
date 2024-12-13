import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateInitData } from '@/utils/telegram';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { initData, referralCode } = await request.json();
    const telegramId = await validateInitData(initData);

    let referrerId: string | null = null;
    
    if (referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: { equals: referralCode } }
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const user = await prisma.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        referralCode: uuidv4(),
        referredById: referrerId,
      },
      update: {
        referredById: referrerId || undefined,
      }
    });

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    console.error('Error registering referral:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 