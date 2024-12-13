'use client'

import Image from 'next/image'
import { useState } from 'react'
import chevronleft from '@/images/Group 90.png'
import { motion, AnimatePresence } from 'framer-motion';
import chevronright from '@/images/Group 91.png'
import cubrecruit from '@/images/cubrecruit.png'
import scout from '@/images/scout.png'
import warrior from '@/images/+Layer 1.png'
import sergeant from '@/images/sergeant.png'
import captain from '@/images/captain.png'
import lieutenant from '@/images/lieutenant.png'
import commander from  '@/images/commander.png'
import general from '@/images/general.png'
import fieldmarshal from '@/images/marshal.png'
import championofmatara from '@/images/champ.png'
import rankbtn from '@/images/15.png'
import TopSection from './TopSection';


// Define the ranks data
const ranks = [
  {
    id: 1,
    name: "Cub Recruit",
    range: "0 - 4999 $MAT",
    image: cubrecruit,
  },
  {
    id: 2,
    name: "Scout",
    range: "5000 - 24999 $MAT",
    image: scout,
  },
  {
    id: 3,
    name: "Warrior",
    range: "25000 - 99999 $MAT",
    image: warrior,
  },
  {
    id: 4,
    name: "Sergeant",
    range: "100000 - 999999 $MAT",
    image: sergeant,
  },
  {
    id: 5,
    name: "Captain",
    range: "1000000 - 2249999 $MAT",
    image: captain,
  },
  {
    id: 6,
    name: "Lieutenant",
    range: "25000000 - 49999999 $MAT",
    image: lieutenant,
  },
  {
    id: 7,
    name: "Commander",
    range: "5000000 - 9999999 $MAT",
    image: commander,
  },
  {
    id: 8,
    name: "General",
    range: "100000000+ $MAT",
    image: general,
  },
  {
    id: 9,
    name: "Field Marshal",
    range: "30000000+ $MAT",
    image: fieldmarshal,
  },
  {
    id: 10,
    name: "Champion of Matara",
    range: "100000000+ $MAT",
    image: championofmatara,
  }
]

export default function Ranks() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? ranks.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === ranks.length - 1 ? 0 : prev + 1))
  }

  return (
    <div>
      <TopSection />
      <div className="flex items-center justify-center pt-[5vh] h-full p-4 px-[15%]">
      <div className='fixed z-[99] flex items-center justify-between w-full px-[8%] top-60'>
      <button
          onClick={handleNext}
          className=""
          aria-label="Next rank"
        >
          <Image src={chevronright} width={50} height={50} alt='' />
        </button>
        <button
          onClick={handlePrevious}
          className=""
          aria-label="Previous rank"
        >
          <Image src={chevronleft} width={50} height={50} alt='' />
        </button>
      </div>
      <div className="relative w-full max-w-sm flex flex-col items-center">
        <AnimatePresence mode="wait">
        <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col top-40 w-full fixed items-center space-y-1 p-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={ranks[currentIndex].image}
                alt={`${ranks[currentIndex].name} rank badge`}
                width={150}
                height={150}
                className="object-contain"
              />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center font-[1000] text-[28px] pt-2 underline max-w-[80%] leading-[30px] underline-offset-[0.35em] decoration-skip-ink-none"
              style={{
                background: 'linear-gradient(92.78deg, #44F58E 12.41%, #FAFAFA 81.56%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {ranks[currentIndex].name}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-['Montserrat',_sans-serif] text-[20px] font-normal text-center underline underline-offset-[0.35em] decoration-skip-ink-none "
              style={{
                background: 'linear-gradient(360deg, #CDCBC8 0%, #88837B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {ranks[currentIndex].range}
            </motion.p>

            </motion.div>
            <h1
      className="
        fixed bottom-24 w-full
        font-['Montserrat',_sans-serif] text-[16px] font-normal text-center
        underline underline-offset-[0.35em] decoration-skip-ink-none pb-3 z-10
        bg-gradient-to-t from-[#CDCBC8] to-[#88837B] text-transparent bg-clip-text
      "
    >Your Current $MAT and Rank</h1>
            <div className='w-full flex-col flex items-center justify-center fixed bottom-20'>
                <Image src={rankbtn} alt='' width={300} height={50} />
              </div>
        </AnimatePresence>
      </div>
    </div>
    </div>

  )
}
