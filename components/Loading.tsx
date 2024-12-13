declare global {
  interface Window {
    Telegram: any;
  }
}

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import mainCharacter from '@/images/main-character.png';
import { calculateEnergyLimit, calculateLevel, calculatePointsPerClick, calculateProfitPerHour, GameState, InitialGameState, useGameStore } from '@/utils/game-mechaincs';
import WebApp from '@twa-dev/sdk';

const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <h1 className="text-3xl font-bold mb-4">
      {displayText}
      <span className="animate-pulse">|</span>
    </h1>
  );
};

interface LoadingProps {
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentView: (view: string) => void;
}

export default function Loading({ setIsInitialized, setCurrentView }: LoadingProps) {
  const initializeState = useGameStore((state: GameState) => state.initializeState);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const openTimestampRef = useRef(Date.now());
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const fetchOrCreateUser = useCallback(async (initData: string, telegramName: string) => {
    try {
      let url = `/api/user?initData=${encodeURIComponent(initData)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      const userData = await response.json();
      
      const initialState: InitialGameState = {
        userTelegramInitData: initData,
        userTelegramName: telegramName,
        lastClickTimestamp: userData.lastPointsUpdateTimestamp || Date.now(),
        gameLevelIndex: calculateLevel(userData.points || 0),
        points: userData.points || 10000,
        pointsBalance: userData.pointsBalance || 10000,
        unsynchronizedPoints: 0,
        multitapLevelIndex: userData.multitapLevelIndex || 0,
        pointsPerClick: calculatePointsPerClick(userData.multitapLevelIndex || 0),
        energy: userData.energy || 100,
        maxEnergy: calculateEnergyLimit(userData.energyLimitLevelIndex || 0),
        energyRefillsLeft: userData.energyRefillsLeft || 6,
        energyLimitLevelIndex: userData.energyLimitLevelIndex || 0,
        lastEnergyRefillTimestamp: userData.lastEnergyRefillsTimestamp || Date.now(),
        mineLevelIndex: userData.mineLevelIndex || 0,
        profitPerHour: calculateProfitPerHour(userData.mineLevelIndex || 0),
        isMiningActive: false,
        miningStartTime: 0,
        totalMined: 0
      };

      initializeState(initialState);
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error in fetchOrCreateUser:', error);
      setLoadingError('Failed to initialize user data');
    }
  }, [initializeState]);

  useEffect(() => {
    const initializeGame = async () => {
      if (typeof window === 'undefined') return;

      try {
        if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
          await fetchOrCreateUser('temp', 'Developer');
          return;
        }

        const WebAppModule = await import('@twa-dev/sdk');
        const WebApp = WebAppModule.default;
        await WebApp.ready();
        
        const initData = WebApp.initData;
        const telegramName = WebApp.initDataUnsafe?.user?.first_name || 'Unknown User';
        
        await fetchOrCreateUser(initData, telegramName);
      } catch (error) {
        console.error('Loading error:', error);
        setLoadingError('Failed to initialize game');
      }
    };

    initializeGame();
  }, [fetchOrCreateUser]);

  useEffect(() => {
    if (isDataLoaded) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - openTimestampRef.current;
      const remainingTime = Math.max(3000 - elapsedTime, 0);

      const timer = setTimeout(() => {
        setCurrentView('game');
        setIsInitialized(true);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, setIsInitialized, setCurrentView]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-xl text-white flex flex-col items-center">
        <div className="w-64 h-64 rounded-full circle-outer p-2 mb-8">
          <div className="w-full h-full rounded-full circle-inner overflow-hidden relative">
            <Image
              src={mainCharacter}
              alt="Main Character"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                transform: 'scale(1.25) translateY(10%)'
              }}
            />
          </div>
        </div>

        <TypewriterText text="Loading Matara" />
        
        {loadingError && (
          <div className="text-red-500 mt-4">
            {loadingError}
          </div>
        )}
        
        {process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true' && (
          <div className="text-yellow-500 mt-4">
            Running in development mode
          </div>
        )}
      </div>
    </div>
  );
}
