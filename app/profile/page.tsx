'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Shield } from 'lucide-react'

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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#0a1118] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff9d]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1118] text-white p-4">
      <div className="max-w-xl mx-auto pt-20">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src={profile.photoUrl}
              alt={profile.displayName}
              fill
              className="rounded-full object-cover border-2 border-[#00ff9d]"
            />
          </div>
          <h1 className="text-[#00ff9d] text-3xl font-bold mb-1">{profile.displayName}</h1>
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <span>@{profile.username}</span>
            <Shield className="w-4 h-4 text-[#00ff9d]" />
          </div>
          
          {/* Points and Rank Bar */}
          <div className="w-full max-w-md relative h-12 bg-[#1a2028] rounded-lg overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00ff9d] to-[#00ff9d]/50"
              style={{ width: '60%' }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="text-white font-bold">{profile.points.toLocaleString()} $MAT</span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-white font-bold">{profile.rank}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div>
          <h2 className="text-xl font-bold text-[#ffd700] mb-6">My Earnings</h2>
          <div className="grid grid-cols-2 text-sm text-gray-400 mb-4 px-4">
            <div>Task Details</div>
            <div className="text-right">Earnings</div>
          </div>
          <div className="space-y-4">
            {profile.completedTasks.map((task, index) => (
              <div
                key={index}
                className="grid grid-cols-2 items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-white/5"
              >
                <div className="text-gray-300">{task.type}</div>
                <div className={`text-right ${task.type.includes('Referral') ? 'text-[#00ff9d]' : 'text-gray-300'}`}>
                  {task.type.includes('Referral') ? '+' : ''}{task.earnings} $MAT
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

