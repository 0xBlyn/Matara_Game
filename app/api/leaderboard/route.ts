import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const leaderboard = await prisma.user.findMany({
      select: {
        telegramId: true,
        pointsBalance: true,
      },
      orderBy: {
        pointsBalance: 'desc',
      },
      take: 50,
    });

    const getRankFromPoints = (points: number) => {
      if (points >= 100000000) return 'Champion of Matara';
      if (points >= 30000000) return 'Field Marshal';
      if (points >= 10000000) return 'General';
      if (points >= 5000000) return 'Commander';
      if (points >= 2500000) return 'Lieutenant';
      if (points >= 1000000) return 'Captain';
      if (points >= 100000) return 'Sergeant';
      if (points >= 25000) return 'Warrior';
      if (points >= 5000) return 'Scout';
      return 'Cub Recruit';
    };

    const formattedLeaderboard = leaderboard.map(entry => ({
      username: entry.telegramId.slice(-8),
      rank: getRankFromPoints(entry.pointsBalance),
      earnings: entry.pointsBalance,
    }));

    return NextResponse.json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

