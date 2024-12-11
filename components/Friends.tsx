'use client'

import { useState, useCallback, useEffect } from 'react';
import { useGameStore } from '@/utils/game-mechaincs';
import { Copy, ChevronDown } from 'lucide-react';
import { showErrorMessage, showSuccessMessage } from '@/utils/ui';
import { motion, AnimatePresence } from 'framer-motion';
import copyicon from '@/images/Group.png'
import gradeffect from '@/images/Group 103 (1).png'
import Image from 'next/image';

interface Referral {
  username: string;
  earnings: string;
}

export default function Friends() {
  const { userTelegramInitData } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [showAllReferrals, setShowAllReferrals] = useState(false);

  const fetchReferrals = useCallback(async () => {
    setIsLoadingReferrals(true);
    try {
      const response = await fetch(`/api/user/referrals?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      const data = await response.json();
      setReferrals(data.referrals);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      showErrorMessage('Failed to fetch referrals. Please try again later.');
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleCopyInviteLink = useCallback(() => {
    navigator.clipboard.writeText(`https://t.me/your_bot_username/start?startapp=kentId`)
      .then(() => {
        showSuccessMessage("Invite link copied to clipboard!");
      })
      .catch(() => {
        showErrorMessage("Failed to copy link. Please try again.");
      });
  }, []);

  const handleShareStory = useCallback(() => {
    window.open('https://t.me/share/url?url=Check%20out%20this%20awesome%20app!&text=Join%20me%20on%20TonIce!');
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto flex items-center flex-col">
      <h1 className='heading mb-6'>Referrals</h1>
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="balance pages font-['Gill_Sans',sans-serif] text-lg"
            onClick={handleCopyInviteLink}
          >
            Invite Friends <span className="ml-2"><Image src={copyicon} width={20} height={20} alt="Copy icon" /></span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative inline-flex items-center justify-center px-5 py-3 min-w-[60%] text-black text-lg font-extrabold font-['Gill_Sans'] leading-[18px] rounded-lg before:absolute before:inset-0 before:rounded-lg before:p-[3px] before:bg-gradient-to-r before:from-[#FFD683] before:to-[#FFB948] before:-z-10 after:absolute after:inset-[3px] after:rounded-[5px] after:bg-gradient-to-r after:from-[#FFB939] after:to-[#FFD683] after:-z-10 shadow-[0px_0px_40px_0px_#FFC36940] hover:opacity-90 transition-opacity my-3"
            onClick={handleShareStory}
          >
            Share Story
          </motion.button>

          <p className="text-sm text-gray-400 text-center">
            Share story to earn more Matara Tokens ($MAT)
          </p>
        </div>

        <div className="mt-8 w-full">
          <div className="flex justify-between text-sm text-white mb-2 px-2">
            <span>User Name</span>
            <span>Earnings</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {isLoadingReferrals ? (
                // Skeleton loading animation
                [...Array(6)].map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-10 bg-gray-800/50 rounded-lg animate-pulse"
                  />
                ))
              ) : referrals.length > 0 ? (
                referrals
                  .slice(0, showAllReferrals ? undefined : 6)
                  .map((referral, index) => (
                    <motion.div
                      key={referral.username}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-gray-300">{referral.username}</span>
                      <span className="text-emerald-400">{referral.earnings}</span>
                    </motion.div>
                  ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 py-4"
                >
                  You haven&apos;t invited anyone yet.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {referrals.length > 6 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllReferrals(!showAllReferrals)}
              className="mt-4 mx-auto block text-gray-400 hover:text-gray-300"
            >
              <ChevronDown className={`w-6 h-6 transform transition-transform ${showAllReferrals ? 'rotate-180' : ''}`} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

