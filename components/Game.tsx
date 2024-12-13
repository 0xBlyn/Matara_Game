import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/utils/game-mechaincs';
import TopInfoSection from './TopInfoSection';
import activeArrow from '@/images/active.png';
import inactiveArrow from '@/images/inactive.png';
import lion from '@/images/Group 113 (1).png';
import hourglass from '@/images/image 27 (1).png';
import hourglassBW from '@/images/image 27.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from 'use-sound';
import { formatNumber } from '@/utils/ui';
import { calculateMiningRateByRank } from '@/utils/game-mechaincs';

interface GameProps {
  currentView: string;
  setCurrentView: (newView: string) => void;
}

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
    startMining,
    stopMining,
    updateMiningRewards,
    profitPerHour,
    points,
    incrementPoints,
    miningStartTime,
    setMiningActive
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState('');
  const [arrowDirection, setArrowDirection] = useState('down');
  const [isSlashing, setIsSlashing] = useState(false);
  const [playSound] = useSound('/arrow-change.mp3');
  const [currentRank, setCurrentRank] = useState(RANKS[0]);

  const miningDuration = 12 * 60 * 60 * 1000;
  const slashingRate = 0.00001;

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points, miningStartTime, isMiningActive }),
        });
        const data = await response.json();
        if (data.points) incrementPoints(data.points - points);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [points, miningStartTime, isMiningActive, incrementPoints]);

  useEffect(() => {
    const newRank = RANKS.reduce((acc, rank) => {
      if (points >= rank.threshold) return rank;
      return acc;
    }, RANKS[0]);
    setCurrentRank(newRank);
  }, [points]);

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
      startMining();
    }
  }, [isMiningActive, startMining]);

  const handleStopMining = useCallback(() => {
    if (isMiningActive) {
      stopMining();
    }
  }, [isMiningActive, stopMining]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    try {
      timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
        if (isSlashing) {
          incrementPoints(-slashingRate);
        } else if (isMiningActive) {
          const miningRate = calculateMiningRateByRank(points);
          if (!isNaN(miningRate)) {
            incrementPoints(miningRate);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Error in mining calculation:', error);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMiningActive, isSlashing, calculateTimeLeft, incrementPoints, points]);

  const earningsPerSecond = useMemo(() => {
    return calculateMiningRateByRank(points);
  }, [points]);

  return (
    <div className="flex flex-col items-center justify-between h-screen">
      <div className="flex flex-col items-center pt-20 w-full">
        <TopInfoSection />
        <div className="flex items-center justify-center my-6 w-full px-4 lg:max-w-[300px]">
          <div className="text-2xl font-bold text-right mt-7">
            <p className="text-[#4BF693] text-xs font-semibold">Mining Mode</p>
            <p
              className="font-black leading-none text-2xl text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(92.78deg, #44F58E 12.41%, #FAFAFA 81.56%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              {formatNumber(points)} <span className="text-semibold">$MAT</span>
            </p>
          </div>
          <div className="relative flex items-center justify-center w-full -mx-[14%] lg:mx-0">
            <div className="fixed justify-center -z-30">
              <Image
                className={`${isMiningActive ? '' : 'grayscale'}`}
                src={isSlashing ? hourglassBW : hourglass}
                alt="Hourglass"
                style={{
                  height: '25vh',
                  width: 'auto',
                  maxHeight: '150px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
                priority
              />
              <AnimatePresence>
                <motion.div
                  key={arrowDirection}
                  initial={{ opacity: 0, y: arrowDirection === 'up' ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: arrowDirection === 'up' ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-9 mt-6 left-7 transform translate-x-1/2 translate-y-1/2 z-10"
                >
                  <Image
                    src={isMiningActive ? activeArrow : inactiveArrow}
                    alt="Mining Status Arrow"
                    width={60}
                    height={60}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="text-xl mt-7">
            <p className="text-[rgb(255,191,73)] text-xs pb-[2px] font-semibold">
              Earning Rate
            </p>
            <p className="font-bold text-xl leading-none">
              {formatNumber(earningsPerSecond)} <span className="text-sm leading-none font-base">$MAT/Sec</span>
            </p>
          </div>
        </div>
        <div className="fixed max-h-[65vh] bottom-0 flex flex-col items-center w-full">
          <button
            onClick={isMiningActive ? handleStopMining : handleStartMining}
            className="button lg:max-w-[200px] lg:-mt-0 relative -mb-5 w-full"
          >
            {isMiningActive ? 'Stop Mining' : 'Claim Daily Matara'}
          </button>
          <Image
            className="min-w-[100vw] flex bottom-0 lg:max-w-[300px]"
            src={lion}
            alt="Main Character"
            width={100}
            height={100}
          />
        </div>
      </div>
    </div>
  );
}