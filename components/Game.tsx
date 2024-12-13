'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useGameStore } from '@/utils/game-mechaincs'
import TopInfoSection from './TopInfoSection'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from 'use-sound'
import { formatNumber } from '@/utils/ui'
import { calculateMiningRateByRank } from '@/utils/game-mechaincs'

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
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#001428] max-w-[1200px] mx-auto">
      <div className="flex flex-col items-center pt-20 w-full">
        <TopInfoSection />
        
        <div className="flex items-center justify-between w-full px-4 my-6 max-w-[600px]">
          <div className="text-right">
            <p className={`text-xs font-semibold ${isMiningActive ? 'text-[#4BF693]' : 'text-red-500'}`}>
              Mining Mode
            </p>
            <p className="font-black text-2xl">
              <span className={isMiningActive ? 'text-[#4BF693]' : 'text-red-500'}>
                {formatNumber(points)}
              </span>{' '}
              <span className="text-white font-semibold">$MAT</span>
            </p>
          </div>

          <div className="relative flex flex-col items-center justify-center">
            <div className="relative w-[200px] h-[200px] flex items-center justify-center">
              <Image
                src={`/hourglass${isSlashing || !isMiningActive ? '-bw' : ''}.png`}
                alt="Hourglass"
                width={150}
                height={150}
                className="absolute"
                priority
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={arrowDirection}
                  initial={{ opacity: 0, y: arrowDirection === 'up' ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: arrowDirection === 'up' ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute"
                >
                  <Image
                    src={`/arrow-${isMiningActive ? 'active' : 'inactive'}.png`}
                    alt="Mining Status Arrow"
                    width={60}
                    height={60}
                    className={`transform ${arrowDirection === 'up' ? 'rotate-180' : ''}`}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="text-left">
            <p className="text-[#FFBF49] text-xs font-semibold">
              Earning Rate
            </p>
            <p className="font-bold text-xl text-white">
              {formatNumber(earningsPerSecond)}{' '}
              <span className="text-sm font-normal">$MAT/Sec</span>
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 flex flex-col items-center w-full max-w-[1200px]">
          <button
            onClick={handleStartMining}
            disabled={isMiningActive && !isMiningComplete()}
            className={`
              px-8 py-3 rounded-full font-bold text-lg mb-4
              ${isMiningActive 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-[#FFBF49] hover:bg-[#FFB52E]'
              } text-white transition-colors
              max-w-[300px] w-full mx-4
            `}
          >
            {isMiningActive ? `Mining in Progress (${timeLeft})` : 'Claim Daily Matara'}
          </button>
          
          <Image
            src="/lion.png"
            alt="Main Character"
            width={400}
            height={400}
            className="w-full max-w-[600px] h-auto"
            priority
          />
          
          <nav className="flex justify-around w-full bg-[#001428] border-t border-gray-800 p-4">
            <button className="text-gray-400 hover:text-white">Ref</button>
            <button className="text-gray-400 hover:text-white">Rank</button>
            <button className="text-gray-400 hover:text-white">Tasks</button>
            <button className="text-gray-400 hover:text-white">Game</button>
          </nav>
        </div>
      </div>
    </div>
  )
}

