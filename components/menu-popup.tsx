'use client'

import { Dialog, DialogContent } from "@/app/ui/dialog"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { User, Trophy, FileText, MessageCircle, HelpCircle } from 'lucide-react'

interface MenuPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MenuPopup({ open, onOpenChange }: MenuPopupProps) {
  const router = useRouter()

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: 'User Profile', href: '/profile' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Matara Ranks', href: '/ranks' },
    { icon: <FileText className="w-5 h-5" />, label: 'Documentation', href: '#' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Our TG Channel', href: '#' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'FAQ', href: '#' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="relative">
          <Image
            src="/trophy.png"
            width={300}
            height={400}
            alt="Trophy"
            className="w-full h-auto opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1118] to-transparent" />
          <div className="absolute inset-0">
            <div className="p-4 space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onOpenChange(false)
                    if (item.href) router.push(item.href)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-200 hover:bg-white/5 transition-colors"
                >
                  <span className="text-[#00ff9d]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

