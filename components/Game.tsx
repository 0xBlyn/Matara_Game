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
    <div className="fixed w-full top-20 max-h-[80vh] text-white flex flex-col items-center justify-center">
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
            {points.toFixed(3)} <span className='text-semibold'>points</span>
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
                className="absolute sm:w-[60px] top-0 mt-6 left-0 transform translate-x-1/2 translate-y-1/2 z-10"
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
      {isMiningActive ? (
        <p className="mb-3 sm:py-1 pt-1 z-[9999] -mt-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #FFD683 0%, #FFB948 100%)' }}>
          Mining Resets in <span style={{ color: '#fff' }}>{timeLeft}</span>
        </p>
      ) : isSlashing ? (
        <p className="mb-3 sm:py-1 pt-1 z-[9999] -mt-2 text-red-500">
          Slashing Mode Active! Claim to stop losing points
        </p>
      ) : (
        <p className="mb-3 sm:py-1 pt-5 z-[9999] -mt-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #FFD683 0%, #FFB948 100%)' }}>
          Start your Daily Mining
        </p>
      )}
      <div className='fixed bottom-0 flex flex-col items-center'>
        <button
          onClick={handleStartMining}
          className="button lg:max-w-[200px] lg:-mt-0 relative -top-5"
          disabled={isMiningActive}
        >
          Claim Daily Matara
        </button>
        <Image className='min-w-[100vw] flex bottom-0 lg:max-w-[300px]' src={lion} alt="Main Character" width={100} height={100} />
      </div>
    </div>
  )
}

