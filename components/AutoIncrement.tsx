// components/AutoIncrement.tsx
'use client'

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/utils/game-mechaincs';

interface AutoIncrementState {
    profitPerHour: number;
    pointsPerClick: number;
    lastClickTimestamp: number | null;
}

export function AutoIncrement() {
    const {
        lastClickTimestamp,
        profitPerHour,
        pointsPerClick,
        incrementPoints,
        incrementEnergy
    } = useGameStore();

    const stateRef = useRef<AutoIncrementState>({
        profitPerHour,
        pointsPerClick,
        lastClickTimestamp
    });

    useEffect(() => {
        stateRef.current = {
            profitPerHour,
            pointsPerClick,
            lastClickTimestamp
        };
    }, [profitPerHour, pointsPerClick, lastClickTimestamp]);

    const autoIncrement = useCallback(() => {
        const { profitPerHour, pointsPerClick, lastClickTimestamp } = stateRef.current;
        const pointsPerSecond = profitPerHour / 3600;
        const currentTime = Date.now();
        const ENERGY_COOLDOWN = 2000; // 2 seconds cooldown

        incrementPoints(pointsPerSecond);

        const canIncrementEnergy = !lastClickTimestamp || 
            (currentTime - lastClickTimestamp) >= ENERGY_COOLDOWN;

        if (canIncrementEnergy) {
            incrementEnergy(pointsPerClick);
        }
    }, [incrementPoints, incrementEnergy]);

    useEffect(() => {
        const INTERVAL_DELAY = 1000; // 1 second interval
        const interval = setInterval(autoIncrement, INTERVAL_DELAY);
        return () => clearInterval(interval);
    }, [autoIncrement]);

    return null;
}