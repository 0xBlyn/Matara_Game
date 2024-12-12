'use client'

import Link from 'next/link'
import Image from 'next/image'
import User from '@/images/Layer_2.png'
import Award from '@/images/Layer_1 (1).png'
import FileText from '@/images/Layer_2 (1).png'
import MessageCircle from '@/images/Frame.png'
import HelpCircle from '@/images/Layer_2 (2).png'

interface MenuProps {
  isOpen: boolean
  onClose: () => void
}

export function Menu({ isOpen, onClose }: MenuProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[9999]"
      onClick={onClose}
    >
      <div 
        className="absolute top-16 right-4 w-50 z-[10000] rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(338.21deg, #000F15 46.74%, #02354C 120.56%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-4">
          <div 
            className="absolute inset-0 rounded-lg z-[10001]"
            style={{
              content: '""',
              background: 'linear-gradient(92.78deg, #000F15 12.41%, #02354C 81.56%)',
              padding: '3px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
          <nav className="flex flex-col space-y-1 relative z-[10002]">
            {[
              { href: '/profile', label: 'User Profile', icon: User },
              { href: '/ranks', label: 'Matara Ranks', icon: Award },
              { href: '/docs', label: 'Documentation', icon: FileText },
              { href: '/channel', label: 'Our TG Channel', icon: MessageCircle },
              { href: '/faq', label: 'FAQ', icon: HelpCircle },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <Image 
                  src={icon}
                  alt={label}
                  width={24}
                  height={24}
                />
                <span 
                  className="font-['Montserrat'] text-base font-normal text-left bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(0deg, #8F7C64 0%, #FAEBD4 100%)',
                  }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

