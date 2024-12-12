"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Shield } from 'lucide-react';
import { useGameStore } from '@/utils/game-mechaincs';
import TopSection from '@/components/TopSection';

interface CompletedTask {
  type: string;
  earnings: number;
  timestamp: Date;
}

interface UserProfile {
  displayName: string;
  username: string;
  photoUrl: string;
  points: number;
  rank: string;
  completedTasks: CompletedTask[];
}

export default function ProfilePage() {
  const { userTelegramInitData } = useGameStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile with initData:', userTelegramInitData);
        const response = await fetch(`/api/profile?initData=${encodeURIComponent(userTelegramInitData)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Profile fetch error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch profile');
        }
        
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userTelegramInitData) {
      fetchProfile();
    } else {
      console.log('No userTelegramInitData available');
      setIsLoading(false);
    }
  }, [userTelegramInitData]);

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#0a1118] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ff9d]" />
      </div>
    );
  }

  const hasCompletedTasks = profile.completedTasks && profile.completedTasks.length > 0;

  return (
    <div className="min-h-screen bg-[#0a1118] text-white p-4">
      <TopSection />
      <div className="max-w-xl mx-auto pt-20">
        <div className="flex items-center mb-8">
          <div className="mr-4">
            <Image
              src={profile.photoUrl}
              alt={profile.displayName}
              width={64}
              height={64}
              className="rounded-full object-cover border-2 border-[#00ff9d]"
            />
          </div>
          <div>
            <h1 className="text-[#00ff9d] text-3xl font-bold mb-1">{profile.displayName}</h1>
            <span>@{profile.username}</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00ff9d]" />
              <span className="text-white font-bold">{profile.rank}</span>
            </div>
          </div>
        </div>
        {/* Points and Rank Bar */}
        <div className="w-full max-w-md relative h-12 bg-[#1a2028] rounded-lg overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00ff9d] to-[#00ff9d]/50"
            style={{ width: `${Math.min(100, (profile.points / 5000) * 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <span className="text-white font-bold">{profile.points.toLocaleString()} $MAT</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-white font-bold">{profile.rank}</span>
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
          {hasCompletedTasks ? (
            <div className="space-y-4">
              {profile.completedTasks.map((task, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-white/5"
                >
                  <div className="text-gray-300">{task.type}</div>
                  <div
                    className={`text-right ${task.type.includes('Referral') ? 'text-[#00ff9d]' : 'text-gray-300'}`}
                  >
                    {task.type.includes('Referral') ? '+' : ''}{task.earnings} $MAT
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-6">
              <p>No tasks completed yet. Start earning by completing tasks or inviting referrals!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}