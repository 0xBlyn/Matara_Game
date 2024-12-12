'use client'

import { useState, useEffect } from 'react'
import { calculateMineUpgradeCost, calculateProfitPerHour, useGameStore } from '@/utils/game-mechaincs'
import TopInfoSection from '@/components/TopInfoSection'
import { formatNumber, showErrorMessage, showSuccessMessage } from '@/utils/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import copyicon from '@/images/Group.png'

interface LeaderboardEntry {
  username: string
  rank: string
  earnings: number
}

export default function Mine() {
  const {
    userTelegramInitData,
    pointsBalance,
    profitPerHour,
    mineLevelIndex,
    upgradeMineLevelIndex
  } = useGameStore()
  const [isLoading, setIsLoading] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true)
  const router = useRouter()

  const upgradeCost = calculateMineUpgradeCost(mineLevelIndex)
  const upgradeIncrease = calculateProfitPerHour(mineLevelIndex + 1) - calculateProfitPerHour(mineLevelIndex)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) throw new Error('Failed to fetch leaderboard')
        const data = await response.json()
        setLeaderboardData(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLeaderboardLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const handleUpgrade = async () => {
    if (pointsBalance >= upgradeCost && !isLoading) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/upgrade/mine', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: userTelegramInitData,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to upgrade mine')
        }

        const result = await response.json()
        upgradeMineLevelIndex()
        showSuccessMessage('Mine Upgrade Successful!')
      } catch (error) {
        console.error('Error upgrading mine:', error)
        showErrorMessage('Failed to upgrade mine. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex justify-center">
    <TopInfoSection />
    <div className="flex flex-col justify-center top-20 fixed">
    <div className='flex flex-col items-center w-full pt-7'>
        <h1 className='heading mb-4'>Ranking</h1>
        <h3 className='text-white text-[16px] font-medium text-center max-w-[80%]'>Strive to be among Top 100,000 members to be eligible for Matara Community Airdrop.</h3>
        <Link href="/ranks">
            <div className="balance pages mt-4">
             See all Ranks <span className='ml-2'><Image src={copyicon} width={20} height={20} alt='' /> </span>
            </div>
        </Link>
    </div>
    <div className="w-full px-[5%] flex items-center justify-center flex-col pt-[8%]">
        <div className="grid grid-cols-3 gap-14 w-full mb-2 text-left border-gradient pb-3">
        <div className="headtext">User Name</div>
        <div className="headtext">Rank</div>
        <div className="headtext">Earnings</div>
    </div>
            {isLeaderboardLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff9d]" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {leaderboardData.map((entry, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-14 items-centers py-3"
                  >
                    <div className="text-gray-300">@{entry.username}</div>
                    <div className="text-gray-300">{entry.rank}</div>
                    <div className="text-right text-[#44F58E]">{entry.earnings.toLocaleString()} $MAT</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  )
}

