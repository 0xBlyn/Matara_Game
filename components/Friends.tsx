'use client'

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/utils/game-mechaincs';
import { showErrorMessage, showSuccessMessage } from '@/utils/ui';
import { motion, AnimatePresence } from 'framer-motion';
import copyicon from '@/images/Layer_1.png';
import gradeffect from '@/images/Group 103 (4).png';
import TopInfoSection from './TopInfoSection';

interface Referral {
  username: string;
  earnings: string;
}

export default function Friends() {
  const { userTelegramInitData } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Share Story");
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
    setButtonText("Sharing...");
    window.open('https://t.me/share/url?url=Check%20out%20this%20awesome%20app!&text=Join%20me%20on%20TonIce!');
    setTimeout(() => {
      setButtonText("Share Story");
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen text-white -z-50">
      <TopInfoSection />
      <div className='top-20 fixed w-full'>
        <div className='flex flex-col items-center w-full pt-7'>
          <h1 className='heading mb-6'>Referrals</h1>
          <div onClick={handleCopyInviteLink} className="balance pages font-['Gill_Sans',sans-serif] text-lg cursor-pointer">
            Invite Friends <span className='ml-2'><Image src={copyicon} width={20} height={20} alt='Copy icon' /></span>
          </div>
          <button
            onClick={handleShareStory}
            className="relative inline-flex items-center justify-center px-5 py-3 min-w-[60%] text-black text-lg font-extrabold font-['Gill_Sans'] leading-[18px] rounded-lg before:absolute before:inset-0 before:rounded-lg before:p-[3px] before:bg-gradient-to-r before:from-[#FFD683] before:to-[#FFB948] before:-z-10 after:absolute after:inset-[3px] after:rounded-[5px] after:bg-gradient-to-r after:from-[#FFB939] after:to-[#FFD683] after:-z-10 shadow-[0px_0px_40px_0px_#FFC36940] hover:opacity-90 transition-opacity my-3"
          >
            {buttonText}
          </button>
          <h3 className='text-white text-[14px] font-medium text-center'>Share story to earn more Matara<br/> Tokens ($MAT)</h3>
        </div>
        <div className="w-full px-[5%] pt-7">
          <div className="flex justify-between items-center border-b border-gray-600 text-[15px] pb-3 px-4">
            <div className="headtext">User Name</div>
            <div className="headtext">Earnings</div>
          </div>
          <div className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <AnimatePresence>
              {isLoadingReferrals ? (
                [...Array(5)].map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-between items-center bg-gray-800 p-3 rounded my-2 animate-pulse"
                  >
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  </motion.div>
                ))
              ) : referrals.length > 0 ? (
                referrals.map((referral, index) => (
                  <motion.div
                    key={referral.username}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center bg-gray-800 p-3 rounded my-2"
                  >
                    <div className="text-white">{referral.username}</div>
                    <div className="text-[#f3ba2f]">{referral.earnings}</div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 mt-4"
                >
                  You haven&apos;t invited anyone yet.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={fetchReferrals}
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Referrals
          </button>
        </div>
        <Image className='fixed bottom-0 left-0 right-0 mx-auto' src={gradeffect} width={400} height={100} alt='Gradient effect' />
      </div>
    </div>
  );
}

