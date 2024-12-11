"use client"

import Image, { StaticImageData } from 'next/image';
import { FC } from 'react';
import { IconProps } from '@/utils/types';
import circlelion from '@/images/Group 103.png'

type NavItem = {
    name: string;
    icon?: FC<IconProps> | null;
    image?: StaticImageData | null;
    view: string;
};

const navItems: NavItem[] = [
    { name: 'Ref', view: 'friends' },
    { name: 'Rank', view: 'mine' },
    { name: 'Tasks', view: 'earn' },
    { name: 'Game', view: 'game' },
];

interface NavigationProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

export default function Navigation({ currentView, setCurrentView }: NavigationProps) {
    const handleViewChange = (view: string) => {
        if (typeof setCurrentView === 'function') {
            setCurrentView(view);
        }
    };

    return (
        <nav className="fixed lg:max-w-[300px] bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-full flex justify-around items-center z-50 rounded-3xl text-xs">
            <div className="absolute -mt-[22%] -ml-[1.5%] flex w-full justify-center">
                <Image 
                    src={circlelion} 
                    width={130} 
                    height={50} 
                    alt="Circle Lion"
                    className="z-[60]" 
                />
            </div>
            {navItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => handleViewChange(item.view)}
                    className={`
                        footer-btn flex-[0.245]
                        ${currentView === item.view ? 'active' : ''}
                    `}
                >
                    <div className="flex flex-col items-center justify-center h-16">
                        <span 
                            className={`
                                text-base font-black leading-[13px] font-['Gill_Sans']
                                bg-gradient-to-r from-[#FFB939] to-[#FFD683] bg-clip-text text-transparent
                                ${currentView === item.view 
                                    ? 'bg-gradient-to-r from-[#44F58E] to-[#FAFAFA]'
                                    : 'bg-black'
                                }
                            `}
                            style={{
                                textShadow: currentView === item.view ? '0px 0.2px 0.5px rgba(255, 255, 255, 0.5)' : 'none'
                            }}
                        >
                            {item.name}
                        </span>
                    </div>
                </button>
            ))}
        </nav>
    );
}