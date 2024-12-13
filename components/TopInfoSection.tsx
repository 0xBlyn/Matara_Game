"use client"

import { useState } from "react"
import { useGameStore } from "@/utils/game-mechaincs"
import Image from "next/image"
import Link from "next/link"
import { Menu } from "@/components/Menu"
import badge from '@/images/+Layer 1.png'
import dehaze from '@/images/Frame 2191.png'
import { formatNumber } from '@/utils/ui'


export default function TopInfoSection() {
  const { points } = useGameStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="text-center left-0 fixed">
      <div className="w-full top-0 px-4 lg:max-w-[500px] sm:py-[3%] flex mt-4 z-50 fixed justify-between items-center">
        <div className="flex items-center">
          <Link href='/clicker'>
            <Image src={badge} width={40} height={40} alt='Badge' />
          </Link>
          <div className="balance ml-[5%]">
            {formatNumber(points)}<span className="ml-1">$MAT</span>
          </div>
        </div>
        <div className="flex items-center">
          <button className="connect-btn rounded-sm mr-2 bg-blue-500 text-white px-3 py-1 text-sm font-medium hover:bg-blue-600 transition-colors">
            Connect
          </button>
          <button onClick={() => setIsMenuOpen(true)}>
            <Image src={dehaze} alt="Menu" height={50} width={40} />
          </button>
        </div>
      </div>
      <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}

