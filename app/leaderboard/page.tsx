'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface LeaderboardEntry {
  username: string
  rank: string
  earnings: number
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a1118] text-white p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#ffd700] mb-4">Ranking</h1>
        <p className="text-center text-gray-400 mb-6 leading-relaxed text-sm">
          Strive to be among Top100,000 members<br />
          to be eligible for Matara Community<br />
          Airdrop.
        </p>

        <button
          onClick={() => router.push('/ranks')}
          className="w-full bg-[#1a2028] border border-[#00ff9d] rounded-lg p-3 mb-8 flex items-center justify-center gap-2 text-[#00ff9d] hover:bg-[#1a2028]/80 transition-all duration-300"
        >
          See all Ranks
          <span className="flex gap-1">👑🎮</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-3 text-sm text-gray-400 mb-4 px-4 border-b border-gray-800 pb-2">
          <div>User Name</div>
          <div>Rank</div>
          <div className="text-right">Earnings</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff9d]" />
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {leaderboardData.map((entry, index) => (
              <div
                key={index}
                className="grid grid-cols-3 items-center px-4 py-3"
              >
                <div className="text-gray-300">@{entry.username}</div>
                <div className="text-[#00ff9d]">{entry.rank}</div>
                <div className="text-right text-[#00ff9d]">{entry.earnings.toLocaleString()} $MAT</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

