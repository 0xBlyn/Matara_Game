import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useGameStore, levelNames, levelMinPoints } from '@/utils/game-mechaincs';
import activeArrow from '@/images/active.png';
import inactiveArrow from '@/images/inactive.png';
import hourglass from '@/images/Group 111 (1).png';
import IceCubes from '@/icons/IceCubes';
import lion from '@/images/Group 113 (1).png'; // Example import for lion image

interface GameProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Game({ currentView, setCurrentView }: GameProps) {
  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

  const {
    points,
    pointsBalance,
    pointsPerClick,
    energy,
    maxEnergy,
    gameLevelIndex,
    clickTriggered,
    updateLastClickTimestamp,
    isMiningActive,
    miningStartTime,
    setMiningActive,
    setMiningStartTime,
    totalMined,
  } = useGameStore();

  const [timeLeft, setTimeLeft] = useState('');
  const [isMiningEnabled, setIsMiningEnabled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const earningsPerSecond = 0.018;

  // Mining Timer Effect
  useEffect(() => {
    if (isMiningActive) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const timeElapsed = currentTime - miningStartTime;
        const timeRemaining = 24 * 60 * 60 * 1000 - timeElapsed;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}hrs ${minutes}mins`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isMiningActive, miningStartTime]);

  const handleViewChange = (view: string) => {
    console.log('Attempting to change view to:', view);
    if (typeof setCurrentView === 'function') {
      try {
        setCurrentView(view);
        console.log('View change successful');
      } catch (error) {
        console.error('Error occurred while changing view:', error);
      }
    } else {
      console.error('setCurrentView is not a function:', setCurrentView);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
    setTimeout(() => {
      card.style.transform = '';
    }, 100);
    updateLastClickTimestamp();
    clickTriggered();
    setClicks([...clicks, { id: Date.now(), x: e.pageX, y: e.pageY }]);
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
  };

  const handleStartMining = () => {
    if (!isMiningActive) {
      setMiningActive(true);
      setMiningStartTime(Date.now());
      setIsMiningEnabled(true);
    }
  };

  const handleStopMining = () => {
    setMiningActive(false);
    setIsMiningEnabled(false);
  };

  const handleButtonClick = () => {
    if (isMiningActive) {
      setShowPopup(true);
    } else {
      handleStartMining();
    }
  };

  const calculateProgress = () => {
    if (gameLevelIndex >= levelNames.length - 1) {
      return 100;
    }
    const currentLevelMin = levelMinPoints[gameLevelIndex];
    const nextLevelMin = levelMinPoints[gameLevelIndex + 1];
    const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="fixed top-20 max-h-[80vh] text-white flex flex-col items-center w-full">
      <div className="flex items-center justify-center w-full px-[10%] lg:max-w-[300px]">
        {/* Mining Mode Section */}
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
            {totalMined.toFixed(3)} <span className='text-semibold'>$</span>MAT
          </p>
        </div>

        {/* Hourglass with Mining Status Arrow */}
        <div className="relative flex items-center justify-center w-full lg:mx-0 -mx-[8%]">
          <div className="relative justify-center">
            <Image className='sm:w-[120px]' src={hourglass} alt="Hourglass" width={80} height={80} />
            <Image
              src={isMiningActive ? activeArrow : inactiveArrow}
              alt="Mining Status Arrow"
              width={40}
              height={40}
              className="absolute sm:w-[60px] top-0 mt-6 left-0 transform translate-x-1/2 translate-y-1/2 z-10"
            />
          </div>
        </div>

        {/* Earning Rate Section */}
        <div className="text-xl mt-7">
          <p className='text-[#FFBF49] text-xs font-semibold'>Earning Rate</p>
          <p className='font-semibold text-2xl leading-none'>{earningsPerSecond.toFixed(4)} <span className='text-lg leading-none font-base'>$MAT/Sec</span></p>
        </div>
      </div>

      {/* Mining Reset Timer */}
      <p className="mb-3 sm:py-1 pt-1 z-[9999] -mt-2 text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #FFD683 0%, #FFB948 100%)' }}>
        Mining Resets in <span style={{ color: '#fff' }}>{timeLeft}</span>
      </p>

      {/* Claim Button */}
      <button
        onClick={handleButtonClick}
        className="button lg:max-w-[200px] lg:-mt-0"
        disabled={isMiningActive}
      >
        {isMiningActive ? 'Mining in Progress' : 'Claim Daily Matara'}
      </button>

      {/* Lion Image at Bottom */}
      <div className='fixed bottom-0'>
        <Image className='min-w-[100vw] flex  bottom-0 lg:max-w-[300px]' src={lion} alt="Main Character" width={100} height={100} />
      </div>

      {/* Click Effects */}
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-5xl font-bold opacity-0 text-white pointer-events-none flex justify-center"
          style={{
            top: `${click.y - 42}px`,
            left: `${click.x - 28}px`,
            animation: `float 1s ease-out`
          }}
          onAnimationEnd={() => handleAnimationEnd(click.id)}
        >
          {pointsPerClick}<IceCubes className="w-12 h-12 mx-auto" />
        </div>
      ))}
    </div>
  );
}
