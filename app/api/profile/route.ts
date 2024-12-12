import { NextResponse } from 'next/server'
import prisma from '@/utils/prisma'
import { validateTelegramWebAppData } from '@/utils/server-checks'

interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface ValidatedData {
  validatedData: boolean | null;
  user: TelegramUser;
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const telegramInitData = url.searchParams.get('initData')

  if (!telegramInitData) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const validationResult = validateTelegramWebAppData(telegramInitData)
  const { validatedData, user } = validationResult as ValidatedData

  if (!validatedData) {
    return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 })
  }

  const telegramId = user.id?.toString()

  if (!telegramId) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        completedTasks: {
          orderBy: {
            completed: 'desc'
          },
          take: 10,
          include: {
            task: true
          }
        }
      }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const getRankFromPoints = (points: number) => {
      if (points >= 1000) return 'Sergeant'
      if (points >= 500) return 'Warrior'
      if (points >= 100) return 'Scout'
      return 'Cub Recruit'
    }

    return NextResponse.json({
      displayName: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
      username: user.username || `user${telegramId.slice(-4)}`,
      photoUrl: user.photo_url || '/placeholder-avatar.png',
      points: userProfile.pointsBalance,
      rank: getRankFromPoints(userProfile.pointsBalance),
      completedTasks: userProfile.completedTasks.map((userTask) => ({
        type: userTask.task.type,
        earnings: userTask.task.tokens,
        timestamp: userTask.completed
      }))
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

