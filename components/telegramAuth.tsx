'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/utils/game-mechaincs'
import ClaimButton from '@/app/ui/claim-button'

export default function TelegramAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const setUserTelegramInitData = useGameStore(state => state.setUserTelegramInitData)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const response = await fetch('/api/session')
        if (response.ok) {
            setIsAuthenticated(true)
            const WebApp = (await import('@twa-dev/sdk')).default
            console.log('WebApp loaded:', WebApp)
            WebApp.ready()
            console.log('WebApp initData:', WebApp.initData)
            setUserTelegramInitData(WebApp.initData)
            router.push('/clicker')
        }
    }

    const authenticateUser = async () => {
        try {
            const WebApp = (await import('@twa-dev/sdk')).default
            console.log('WebApp loaded:', WebApp)
            WebApp.ready()
            const initData = WebApp.initData
            console.log('WebApp initData:', initData)

            if (!initData) {
                console.error('No initData available')
                return
            }

            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initData }),
            })

            const data = await response.json()
            console.log('Auth response:', data)

            if (response.ok) {
                setIsAuthenticated(true)
                setUserTelegramInitData(initData)
                router.push('/clicker')
            } else {
                console.error('Authentication failed:', data.message)
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.error('Error during authentication:', error)
            setIsAuthenticated(false)
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            {isAuthenticated ? (
                <p>Redirecting to game...</p>
            ) : (
                <div>
                    <ClaimButton
                        onClick={authenticateUser}
                        content="Get Started"
                    />
                </div>
            )}
        </div>
    )
}