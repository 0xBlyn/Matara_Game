import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { mainCharacter } from '@/images';
import IceCube from '@/icons/IceCube';
import { calculateEnergyLimit, calculateLevel, calculatePointsPerClick, calculateProfitPerHour, GameState, InitialGameState, useGameStore } from '@/utils/game-mechaincs';
import dynamic from 'next/dynamic';

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
  const [WebApp, setWebApp] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const loadWebApp = async () => {
      if (typeof window !== 'undefined') {
        try {
          if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
            console.log('Development mode: Bypassing Telegram WebApp');
            setWebApp({});
            return;
          }
          const WebAppModule = await import('@twa-dev/sdk');
          setWebApp(WebAppModule.default);
        } catch (error) {
          console.error('Error loading WebApp:', error);
          setLoadingError('Failed to load Telegram WebApp');
          // In development, continue anyway
          if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
            setWebApp({});
          }
        }
      }
    };
    loadWebApp();
  }, []);

  const fetchOrCreateUser = useCallback(async () => {
    try {
      let initData = "temp";
      let telegramName = "Developer";

      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH !== 'true') {
        await WebApp?.ready?.();
        initData = WebApp?.initData || "temp";
        telegramName = WebApp?.initDataUnsafe?.user?.first_name || 'Unknown User';
      }

      let url = `/api/user?initData=${encodeURIComponent(initData)}`;
      
      console.log('Fetching user data from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log('Received user data:', userData);

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

      console.log('Initializing game state with:', initialState);
      initializeState(initialState);
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error in fetchOrCreateUser:', error);
      // In development, initialize with default state
      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
        const defaultState: InitialGameState = {
          userTelegramInitData: "temp",
          userTelegramName: "Developer",
          lastClickTimestamp: Date.now(),
          gameLevelIndex: 0,
          points: 10000,
          pointsBalance: 10000,
          unsynchronizedPoints: 0,
          multitapLevelIndex: 0,
          pointsPerClick: 1,
          energy: 100,
          maxEnergy: 100,
          energyRefillsLeft: 6,
          energyLimitLevelIndex: 0,
          lastEnergyRefillTimestamp: Date.now(),
          mineLevelIndex: 0,
          profitPerHour: 0,
          isMiningActive: false,
          miningStartTime: 0,
          totalMined: 0
        };
        console.log('Using default state in development:', defaultState);
        initializeState(defaultState);
        setIsDataLoaded(true);
      }
    }
  }, [WebApp, initializeState]);

  useEffect(() => {
    if (WebApp) {
      fetchOrCreateUser();
    }
  }, [WebApp, fetchOrCreateUser]);

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
