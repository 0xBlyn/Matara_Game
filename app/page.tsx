'use client'

import Image from 'next/image';
import mainCharacter from '@/images/main-character.png';
import Link from 'next/link';
import ClaimButton from './ui/claim-button';
import { useEffect, useState } from 'react';
import TelegramAuth from '@/components/telegramAuth'

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
  return (
    <main>
      <TelegramAuth />
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
          <TypewriterText text="Welcome to Matara" />
          <Link href="/clicker" className="underline"><ClaimButton content="Get Started" /></Link>
        </div>
      </div>
    </main>
  );
}