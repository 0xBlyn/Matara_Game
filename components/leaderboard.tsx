'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useGameStore } from '@/utils/game-mechaincs'

interface LeaderboardEntry {
  username: string
  rank: string
  earnings: number
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { userTelegramInitData } = useGameStore()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/leaderboard?initData=${encodeURIComponent(userTelegramInitData)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
        const data = await response.json()
        setLeaderboardData(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userTelegramInitData) {
      fetchLeaderboard()
    }
  }, [userTelegramInitData])

  return (
    <div className="w-full max-w-xl mx-auto bg-[#0a0e12] text-white p-4">
      <h1 className="text-4xl font-bold text-center text-[#f3ba2f] mb-2">Ranking</h1>
      <p className="text-center text-sm text-gray-400 mb-4">
        Strive to be among Top 100,000 members<br />
        to be eligible for Matara Community<br />
        Airdrop.
      </p>
      
      <button className="w-full bg-[#1d2025] rounded-lg p-3 mb-6 flex items-center justify-center gap-2 text-[#f3ba2f] border border-[#f3ba2f]/20">
        See all Ranks 👑🎮
        <ChevronDown className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-3 text-sm text-gray-400 mb-2 px-2">
        <div>User Name</div>
        <div>Rank</div>
        <div className="text-right">Earnings</div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f3ba2f]"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboardData.map((entry, index) => (
            <div key={index} className="grid grid-cols-3 items-center bg-[#1d2025] rounded-lg p-3">
              <div className="text-gray-300">@{entry.username}</div>
              <div className="text-[#f3ba2f]">{entry.rank}</div>
              <div className="text-right text-green-500">{entry.earnings.toLocaleString()} $MAT</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

