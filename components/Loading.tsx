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

  useEffect(() => {
    const loadWebApp = async () => {
      if (typeof window !== 'undefined') {
        try {
          const WebAppModule = await import('@twa-dev/sdk');
          setWebApp(WebAppModule.default);
        } catch (error) {
          console.error('Error loading WebApp:', error);
        }
      }
    };
    loadWebApp();
  }, []);

  const fetchOrCreateUser = useCallback(async () => {
    if (!WebApp) return;

    try {
      await WebApp.ready();
      let initData = WebApp.initData;
      let telegramId = WebApp.initDataUnsafe.user?.id.toString() || '';
      let username = WebApp.initDataUnsafe.user?.username || 'Unknown User';
      let telegramName = WebApp.initDataUnsafe.user?.first_name || 'Unknown User';

      // Extract referrer from start parameter
      const startParam = new URLSearchParams(WebApp.initDataUnsafe.start_param || '').get('startapp');
      const referrerTelegramId = startParam ? startParam.replace('kentId', '') : null;

      if (process.env.NEXT_PUBLIC_BYPASS_TELEGRAM_AUTH === 'true') {
        initData = "temp";
      }
      let url = `/api/user?initData=${encodeURIComponent(initData)}`;
      if (referrerTelegramId) {
        url += `&referrer=${referrerTelegramId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch or create user');
      }
      const userData = await response.json();

      // Create the game store with fetched data
      const initialState: InitialGameState = {
        userTelegramInitData: initData,
        userTelegramName: telegramName,
        lastClickTimestamp: userData.lastPointsUpdateTimestamp,
        gameLevelIndex: calculateLevel(userData.points),
        points: userData.points,
        pointsBalance: userData.pointsBalance,
        unsynchronizedPoints: 0,
        multitapLevelIndex: userData.multitapLevelIndex,
        pointsPerClick: calculatePointsPerClick(userData.multitapLevelIndex),
        energy: userData.energy,
        maxEnergy: calculateEnergyLimit(userData.energyLimitLevelIndex),
        energyRefillsLeft: userData.energyRefillsLeft,
        energyLimitLevelIndex: userData.energyLimitLevelIndex,
        lastEnergyRefillTimestamp: userData.lastEnergyRefillsTimestamp,
        mineLevelIndex: userData.mineLevelIndex,
        profitPerHour: calculateProfitPerHour(userData.mineLevelIndex),
        isMiningActive: false,
        miningStartTime: 0,
        totalMined: 0
      };

      initializeState(initialState);
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
      </div>
    </div>
  );
}
