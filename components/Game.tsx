'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useGameStore } from '@/utils/game-mechaincs'
import TopInfoSection from './TopInfoSection'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from 'use-sound'
import { formatNumber } from '@/utils/ui'
import { calculateMiningRateByRank } from '@/utils/game-mechaincs'
import hourglass from '@/images/Group 111 (1).png';
import activeArrow from '@/images/active.png';
import inactiveArrow from '@/images/inactive.png';
import lion from '@/images/Group 113 (3).png';

interface GameProps {
  currentView: string
  setCurrentView: (newView: string) => void
}

const RANKS = [
  { name: "Cub Recruit", threshold: 0, ratePerMinute: 0.2 },
  { name: "Scout", threshold: 5000, ratePerMinute: 0.4 },
  { name: "Warrior", threshold: 25000, ratePerMinute: 0.6 },
  { name: "Sergeant", threshold: 100000, ratePerMinute: 0.8 },
  { name: "Captain", threshold: 1000000, ratePerMinute: 1.0 },
  { name: "Lieutenant", threshold: 2500000, ratePerMinute: 1.2 },
  { name: "Commander", threshold: 5000000, ratePerMinute: 1.4 },
  { name: "General", threshold: 10000000, ratePerMinute: 1.6 },
  { name: "Field Marshal", threshold: 30000000, ratePerMinute: 1.8 },
  { name: "Champion of Matara", threshold: 100000000, ratePerMinute: 2.0 }
]

export default function Game({ currentView, setCurrentView }: GameProps) {
  const {
    isMiningActive,
    startMining,
    stopMining,
    updateMiningRewards,
    profitPerHour,
    points,
    incrementPoints,
    miningStartTime,
    setMiningActive
  } = useGameStore()

  const [timeLeft, setTimeLeft] = useState('')
  const [arrowDirection, setArrowDirection] = useState('down')
  const [isSlashing, setIsSlashing] = useState(false)
  const [playSound] = useSound('/arrow-change.mp3')
  const [currentRank, setCurrentRank] = useState(RANKS[0])

  const miningDuration = 12 * 60 * 60 * 1000
  const slashingRate = 0.00001

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points, miningStartTime, isMiningActive }),
        })
        const data = await response.json()
        if (data.points) incrementPoints(data.points - points)
      } catch (error) {
        console.error('Sync error:', error)
      }
    }, 30000)

    return () => clearInterval(syncInterval)
  }, [points, miningStartTime, isMiningActive, incrementPoints])

  useEffect(() => {
    const newRank = RANKS.reduce((acc, rank) => {
      if (points >= rank.threshold) return rank
      return acc
    }, RANKS[0])
    setCurrentRank(newRank)
  }, [points])

  const calculateTimeLeft = useCallback((): string => {
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
    if (!isMiningActive) {
      startMining()
      setArrowDirection('up')
      playSound()
    }
  }, [isMiningActive, startMining, playSound])

  const handleStopMining = useCallback(() => {
    if (isMiningActive) {
      stopMining()
      setArrowDirection('down')
      playSound()
    }
  }, [isMiningActive, stopMining, playSound])

  const calculateMiningRate = useCallback((points: number): number => {
    const rank = RANKS.reduce((acc, rank) => {
      if (points >= rank.threshold) return rank;
      return acc;
    }, RANKS[0]);
    
    return rank.ratePerMinute / 60; // Convert to per second rate
  }, []);

  const isMiningComplete = useCallback(() => {
    if (!isMiningActive || !miningStartTime) return false;
    const timeElapsed = Date.now() - miningStartTime;
    return timeElapsed >= miningDuration;
  }, [isMiningActive, miningStartTime, miningDuration]);

  useEffect(() => {
    let timer: NodeJS.Timeout
    try {
      timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft())
        if (isSlashing) {
          incrementPoints(-slashingRate)
        } else if (isMiningActive) {
          const miningRate = calculateMiningRate(points)
          if (!isNaN(miningRate)) {
            incrementPoints(miningRate)
          }
        }
      }, 1000)
    } catch (error) {
      console.error('Error in mining calculation:', error)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isMiningActive, isSlashing, calculateTimeLeft, incrementPoints, points, calculateMiningRate])

  const earningsPerSecond = useMemo(() => {
    return calculateMiningRateByRank(points)
  }, [points])

  return (
    <div className="flex flex-col items-center justify-between max-w-[1200px] mx-auto">
      <div className="fixed w-full top-14 max-h-[80vh] text-white flex flex-col items-center justify-center">
        <TopInfoSection />
        <div className="flex items-center justify-center w-full h-full px-[10%] mt-16 lg:max-w-[300px]">
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
              {formatNumber(points)} <span className='text-semibold'>$</span>MAT
            </p>
          </div>
          <div className="relative flex items-center justify-center w-full lg:mx-0 -mx-[8%]">
            <div className="relative justify-center">
              <Image className='sm:w-[120px]' src={hourglass} alt="Hourglass" width={80} height={80} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={arrowDirection}
                  initial={{ opacity: 0, y: arrowDirection === 'up' ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: arrowDirection === 'up' ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute sm:w-[60px] top-0 mt-6 left-0 transform translate-x-1/2 translate-y-1/2 z-10"
                >
                  <Image
                    src={isMiningActive ? activeArrow : inactiveArrow}
                    alt="Mining Status Arrow"
                    width={40}
                    height={40}
                    className={`transform ${arrowDirection === 'up' ? 'rotate-180' : ''}`}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="text-xl mt-7">
            <p className='text-[#FFBF49] text-xs font-semibold'>Earning Rate</p>
            <p className='font-semibold text-2xl leading-none'>{formatNumber(earningsPerSecond)} <span className='text-lg leading-none font-base'>$MAT/Sec</span></p>
          </div>
        </div>
        {isMiningActive ? (
          <p className="mb-3 sm:py-1 pt-1 z-[9999] -mt-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #FFD683 0%, #FFB948 100%)' }}>
            Mining Resets in <span style={{ color: '#fff' }}>{timeLeft}</span>
          </p>
        ) : (
          <p className="mb-3 sm:py-1 pt-5 z-[9999] -mt-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #FFD683 0%, #FFB948 100%)' }}>
            Start your Daily Mining
          </p>
        )}
        <div className='fixed bottom-0 flex flex-col items-center'>
          <button
            onClick={handleStartMining}
            className="button lg:max-w-[200px] lg:-mt-0 relative -mb-[150px] px-8 py-3 rounded-full font-bold text-lg"
            disabled={isMiningActive && !isMiningComplete()}
          >
            Claim Daily Matara
          </button>
          <Image className='min-w-[100vw] flex bottom-0 lg:max-w-[300px]' src={lion} alt="Main Character" width={100} height={100} />
        </div>
      </div>
    </div>
  )
}

