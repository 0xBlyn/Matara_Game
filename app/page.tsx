'use client'

import Image from 'next/image';
import mainCharacter from '@/images/main-character.png';
import Link from 'next/link';
import ClaimButton from './ui/claim-button';
import { useEffect, useState } from 'react';
import TelegramAuth from '@/components/telegramAuth'
import { checkEnvironment } from '@/utils/env-check';

const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100); // Adjust speed here (lower number = faster)

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <h1 className="text-3xl font-bold mb-3">
      {displayText}
      <span className="animate-pulse">|</span>
    </h1>
  );
};

export default function Home() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      checkEnvironment();
    }
  }, []);

  return (
    <main>
      <div className="flex justify-center items-center h-screen">
        <div className="w-full text-white flex flex-col items-center">
          <div className="w-64 h-64 rounded-full circle-outer p-2 mb-5">
            <div className="w-full h-full font-['Gill Sans',_sans-serif] rounded-full circle-inner overflow-hidden relative">
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
          <TypewriterText  text="Welcome to Matara" />
         <TelegramAuth />
        </div>
      </div>
    </main>
  );
}