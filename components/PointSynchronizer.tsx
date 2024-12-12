// components/PointSynchronizer.tsx
'use client'

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/utils/game-mechaincs';
import { showErrorMessage, showSuccessMessage } from '@/utils/ui';

const SYNC_DELAY = 2000; // 2 seconds
const MIN_POINTS_TO_SYNC = 1;

interface SyncPayload {
    initData: string;
    unsynchronizedPoints: number;
    currentEnergy: number;
}

export function PointSynchronizer() {
    const {
        userTelegramInitData,
        energy,
        unsynchronizedPoints,
        lastClickTimestamp
    } = useGameStore();

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const syncWithServer = useCallback(async () => {
        if (!userTelegramInitData || unsynchronizedPoints < MIN_POINTS_TO_SYNC) return;
        
        const frozenPointsToSynchronize = unsynchronizedPoints;
        
        try {
            const payload: SyncPayload = {
                initData: userTelegramInitData,
                unsynchronizedPoints,
                currentEnergy: energy
            };

            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Sync failed');
            }

            const updatedUnsynchronizedPoints = Math.max(0, unsynchronizedPoints - frozenPointsToSynchronize);
            console.log('Sync successful:', { updatedUnsynchronizedPoints });
        } catch (error) {
            console.error('Sync error:', error);
        }
    }, [userTelegramInitData, unsynchronizedPoints, energy]);

    useEffect(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        if (unsynchronizedPoints > MIN_POINTS_TO_SYNC) {
            syncTimeoutRef.current = setTimeout(syncWithServer, SYNC_DELAY);
        }

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [lastClickTimestamp, unsynchronizedPoints, syncWithServer]);

    return null;
}