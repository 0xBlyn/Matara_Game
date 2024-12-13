'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Anchor } from 'lucide-react'
import { useGameStore } from '@/utils/game-mechaincs'
import TopSection from '@/components/TopSection'

interface CompletedTask {
  type: string
  earnings: number
  timestamp: Date
}

interface UserProfile {
  displayName: string
  username: string
  photoUrl: string
  points: number
  rank: string
  completedTasks: CompletedTask[]
}

export default function ProfilePage() {
  const { userTelegramInitData } = useGameStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userTelegramInitData) {
        setError('No Telegram data available')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/profile?initData=${encodeURIComponent(userTelegramInitData)}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch profile')
        }
        
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userTelegramInitData])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001428]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00ff9d]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001428]">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
          <p className="text-sm text-gray-400 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const hasCompletedTasks = profile?.completedTasks && profile.completedTasks.length > 0

  return (
    <div className="min-h-screen bg-[#001428] text-white">
      <TopSection />
      <div className="max-w-xl mx-auto px-6 pt-20">
        <div className="flex items-center gap-6 mb-8 pt-6">
          <div className="relative">
            <Image
              src={profile?.photoUrl || '/placeholder.svg'}
              alt={profile?.displayName || 'Profile'}
              width={80}
              height={80}
              className="rounded-full border-2 border-[#00ff9d] object-cover"
            />
          </div>
          <div>
            <h1 style={{
                background: 'linear-gradient(92.78deg, #44F58E 12.41%, #FAFAFA 81.56%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily:  'var(--font-gill-sans), sans-serif'
              }} className="text-[#00ff9d] text-3xl font-bold mb-1">{profile?.displayName}</h1>
            <div className="flex items-center gap-2 text-gray-400">
              @{profile?.username}
              <Anchor className="w-4 h-4 text-[#00ff9d]" />
            </div>
          </div>
        </div>

        <div className="relative mb-12 p-4 rounded-lg border border-[#00ff9d]/20 bg-[#002038]">
          <div className="flex items-center justify-between">
            <div className="text-[#00ff9d] font-bold text-2xl">2,500 $MAT</div>
            <div className="text-[#ffd700] font-bold text-2xl">WARRIOR</div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-6">
            <Anchor className="w-12 h-12 text-[#00ff9d]" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#ffd700] mb-6">My Earnings</h2>
          <div className="grid grid-cols-2 text-sm text-gray-400 mb-4 px-4">
            <div>Task Details</div>
            <div className="text-right">Earnings</div>
          </div>
          
          {hasCompletedTasks ? (
            <div className="space-y-2">
              {profile.completedTasks.map((task, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-white/5"
                >
                  <div className="text-gray-300">{task.type}</div>
                  <div
                    className={`text-right ${
                      task.type.includes('Referral') 
                        ? 'text-[#00ff9d]' 
                        : 'text-gray-300'
                    }`}
                  >
                    {task.type.includes('Referral') ? '+' : ''}{task.earnings} $MAT
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8 px-4">
              <p>No tasks completed yet. Start earning by completing tasks or inviting referrals!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

