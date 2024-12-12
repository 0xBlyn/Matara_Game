import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

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
      if (points >= 10000) return 'Sergeant';
      if (points >= 1000) return 'Warrior';
      if (points >= 500) return 'Scout';
      return 'Cub Recruit';
    };

    const formattedLeaderboard = leaderboard.map(entry => ({
      username: `${entry.telegramId.slice(-8)}`,
      rank: getRankFromPoints(entry.pointsBalance),
      earnings: entry.pointsBalance,
    }));

    return NextResponse.json(formattedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

