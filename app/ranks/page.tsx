"use client"

import React, { useState, useCallback, ReactNode } from 'react'
import Ranks from '@/components/Ranks'

function ClickerPage() {
    const [currentView, setCurrentViewState] = useState<string>('game')

    const setCurrentView = useCallback((newView: string) => {
        console.log('Changing view to:', newView)
        setCurrentViewState(newView)
    }, [])

    const renderCurrentView = useCallback(() => {
        switch (currentView) {
            default:
                return <Ranks />
        }
    }, [currentView, setCurrentView])

    return (
        <div className="h-screen flex flex-col text-white overflow-hidden">
            <div className="flex-grow relative">
                {renderCurrentView()}
            </div>
        </div>
    )
}

interface ErrorBoundaryProps {
    children: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>
        }

        return this.props.children
    }
}

export default function MranksPageWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <Ranks />
        </ErrorBoundary>
    )
}
