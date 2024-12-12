'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useGameStore } from '@/utils/game-mechaincs'
import TopInfoSection from './TopInfoSection'
import activeArrow from '@/images/active.png'
import inactiveArrow from '@/images/inactive.png'
import lion from '@/images/Group 113 (1).png'
import hourglass from '@/images/image 27 (1).png'
import hourglassBW from '@/images/image 27.png'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from 'use-sound'

interface GameProps {
  currentView: string
  setCurrentView: (newView: string) => void
}

// Add rank calculations
const RANKS = [
  { name: "Novice Miner", threshold: 0 },
  { name: "Bronze Miner", threshold: 1000 },
  { name: "Silver Miner", threshold: 5000 },
  { name: "Gold Miner", threshold: 10000 },
  { name: "Diamond Miner", threshold: 50000 }
];

export default function Game({ currentView, setCurrentView }: GameProps) {
  const {
    isMiningActive,
    miningStartTime,
    setMiningActive,
    setMiningStartTime,
    profitPerHour,
    points,
    incrementPoints,
  } = useGameStore()

  const [timeLeft, setTimeLeft] = useState('')
  const [arrowDirection, setArrowDirection] = useState('down')
  const [isSlashing, setIsSlashing] = useState(false)
  const [playSound] = useSound('/arrow-change.mp3')

  const miningDuration = 12 * 60 * 60 * 1000 // 12 hours in milliseconds
  const slashingRate = 0.00001 // Points lost per second during slashing mode

  // Add new state for rank
  const [currentRank, setCurrentRank] = useState(RANKS[0]);

  // Sync with backend every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points, miningStartTime, isMiningActive })
        });
        const data = await response.json();
        // Update local state with server data
        if (data.points) incrementPoints(data.points - points);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [points, miningStartTime, isMiningActive]);

  // Update rank based on points
  useEffect(() => {
    const newRank = RANKS.reduce((acc, rank) => {
      if (points >= rank.threshold) return rank;
      return acc;
    }, RANKS[0]);
    setCurrentRank(newRank);
  }, [points]);

  const calculateTimeLeft = useCallback(() => {
    if (isMiningActive) {
      const currentTime = Date.now()
      const timeElapsed = currentTime - miningStartTime
      const timeRemaining = miningDuration - timeElapsed

      if (timeRemaining <= 0) {
        setMiningActive(false)
        setIsSlashing(true)
        return '00:00:00'
      }

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return '12:00:00'
  }, [isMiningActive, miningStartTime, setMiningActive])

  const handleStartMining = useCallback(() => {
    try {
      if (!isMiningActive) {
        setMiningActive(true)
        setMiningStartTime(Date.now())
        setArrowDirection('up')
        setIsSlashing(false)
        playSound()
      }
    } catch (error) {
      console.error('Error starting mining:', error)
    }
  }, [isMiningActive, setMiningActive, setMiningStartTime, playSound])

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    try {
      timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft())
        
        if (isSlashing) {
          incrementPoints(-slashingRate)
        } else if (isMiningActive) {
          const increase = profitPerHour / 3600
          if (!isNaN(increase)) {
            incrementPoints(increase)
          }
        }
      }, 1000)
    } catch (error) {
      console.error('Error in mining calculation:', error)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isMiningActive, isSlashing, calculateTimeLeft, incrementPoints, profitPerHour])

  const earningsPerSecond = useMemo(() => {
    const earnings = profitPerHour / 3600
    return isNaN(earnings) ? 0 : earnings
  }, [profitPerHour])

  return (
    <div className="fixed w-full h-screen flex flex-col items-center justify-between">
      <div className="w-full flex-1 flex flex-col items-center pt-20">
        <TopInfoSection rank={currentRank.name} />
        
        <div className="flex items-center justify-center w-full px-[10%] mt-16 lg:max-w-[300px]">
          <div className="text-2xl font-bold text-right mt-7">
            <p className='text-[#4BF693] text-xs font-semibold'>Mining Mode</p>
            <p
              className="font-black leading-none text-2xl text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(92.78deg, #44F58E 12.41%, #FAFAFA 81.56%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text'
              }}
            >
              {points.toFixed(3)} <span className='text-semibold'>$MAT</span>
            </p>
          </div>
          <div className="relative flex items-center justify-center w-full lg:mx-0 -mx-[8%]">
            <div className="relative justify-center">
              <Image 
                className='sm:w-[120px]' 
                src={isSlashing ? hourglassBW : hourglass} 
                alt="Hourglass" 
                width={80} 
                height={80} 
              />
              <AnimatePresence>
                <motion.div
                  key={arrowDirection}
                  initial={{ opacity: 0, y: arrowDirection === 'up' ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: arrowDirection === 'up' ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 mt-6 left-0 transform translate-x-1/2 translate-y-1/2 z-10"
                >
                  <Image
                    src={isMiningActive ? activeArrow : inactiveArrow}
                    alt="Mining Status Arrow"
                    width={40}
                    height={40}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="text-xl mt-7">
            <p className='text-[#FFBF49] text-xs font-semibold'>Earning Rate</p>
            <p className='font-semibold text-2xl leading-none'>{earningsPerSecond.toFixed(4)} <span className='text-lg leading-none font-base'>points/Sec</span></p>
          </div>
        </div>
        
        <div className="relative w-full flex flex-col items-center mt-auto">
          <button
            onClick={handleStartMining}
            disabled={isMiningActive}
            className="button lg:max-w-[200px] z-10 transform translate-y-1/2"
          >
            Claim Daily Matara
          </button>
          <div className="w-full">
            <Image 
              src={lion} 
              alt="Main Character" 
              className="w-full object-cover mx-auto"
              width={300}
              height={300}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

