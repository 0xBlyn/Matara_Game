import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { validateTelegramWebAppData } from '@/utils/server-checks';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const telegramInitData = url.searchParams.get('initData');

  if (!telegramInitData) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { validatedData, user } = validateTelegramWebAppData(telegramInitData);

  if (!validatedData) {
    return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
  }

  const telegramId = user.id?.toString();

  if (!telegramId) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }

  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        telegramId: true,
        pointsBalance: true,
      },
      orderBy: {
        pointsBalance: 'desc',
      },
      take: 10,
    });

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      username: `User${entry.telegramId.slice(-4)}`,
      rank: getRank(index + 1),
      earnings: entry.pointsBalance,
    }));

    return NextResponse.json(formattedLeaderboard, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

function getRank(position: number): string {
  if (position === 1) return 'Gold';
  if (position === 2) return 'Silver';
  if (position === 3) return 'Bronze';
  return 'Member';
}

