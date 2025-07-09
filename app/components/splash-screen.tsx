"use client"

import { useEffect, useState } from "react"
import { Trophy, Users, Target } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-blue-600 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 border-2 border-white rounded-full"></div>
      </div>

      <div className="text-center text-white z-10">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Soccer Squad</h1>
          <p className="text-green-100 text-lg">Your Team, Your Game</p>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center space-x-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm text-green-100">Team</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-sm text-green-100">Matches</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-sm text-green-100">Stats</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-green-100 text-sm">Loading your squad...</p>
        </div>
      </div>
    </div>
  )
}
