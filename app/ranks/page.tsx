'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const ranks = [
  { name: 'Cub Recruit', range: '0 - 99 $MAT', image: '/ranks/cub-recruit.png' },
  { name: 'Scout', range: '100 - 499 $MAT', image: '/ranks/scout.png' },
  { name: 'Warrior', range: '500 - 999 $MAT', image: '/ranks/warrior.png' },
  { name: 'Sergeant', range: '1,000 - 4,999 $MAT', image: '/ranks/sergeant.png' },
]

export default function RanksPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + ranks.length) % ranks.length)
  }

  return (
    <div className="min-h-screen bg-[#0a1118] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-xl aspect-square">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            className="absolute w-full h-full flex flex-col items-center justify-center"
          >
            <div className="relative w-48 h-48 mb-8">
              <Image
                src={ranks[currentIndex].image}
                alt={ranks[currentIndex].name}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-[#00ff9d] text-4xl font-game mb-4">{ranks[currentIndex].name}</h2>
            <p className="text-white text-xl mb-12">{ranks[currentIndex].range}</p>
          </motion.div>
        </AnimatePresence>

        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#00ff9d] bg-opacity-10 border border-[#00ff9d] flex items-center justify-center text-[#00ff9d] hover:bg-opacity-20 transition-all duration-300"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#00ff9d] bg-opacity-10 border border-[#00ff9d] flex items-center justify-center text-[#00ff9d] hover:bg-opacity-20 transition-all duration-300"
          onClick={() => paginate(1)}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="mt-8 w-full max-w-xl">
        <p className="text-gray-400 text-center mb-4">Your Current $MAT and Rank</p>
        <div className="relative h-12 bg-[#1a2028] rounded-lg overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00ff9d] to-[#00ff9d]/50"
            style={{ width: '60%' }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <span className="text-white font-bold">2,500 $MAT</span>
            <span className="text-white font-bold">WARRIOR</span>
          </div>
        </div>
      </div>
    </div>
  )
}

