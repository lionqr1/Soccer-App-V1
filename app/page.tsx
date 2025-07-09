"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./components/login-form"
import { AdminDashboard } from "./components/admin-dashboard"
import { PlayerDashboard } from "./components/player-dashboard"
import { Settings } from "./components/settings"
import { DatabaseService } from "../lib/database"
import type { Player } from "../lib/supabase"

export default function SoccerApp() {
  const [currentUser, setCurrentUser] = useState<Player | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // Check for saved user session on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("soccer-app-user")
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem("soccer-app-user")
      }
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [playersData, matchesData] = await Promise.all([
        DatabaseService.getPlayers(),
        DatabaseService.getMatchesWithAttendance(),
      ])
      setPlayers(playersData)
      setMatches(matchesData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (username: string, password: string) => {
    try {
      const user = await DatabaseService.authenticatePlayer(username, password)
      if (user) {
        setCurrentUser(user)
        localStorage.setItem("soccer-app-user", JSON.stringify(user))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem("soccer-app-user")
    setShowSettings(false)
  }

  const handleRSVP = async (matchId: string, attending: boolean) => {
    if (!currentUser) return

    try {
      await DatabaseService.updateAttendance(matchId, currentUser.id, attending)
      await loadData()
    } catch (error) {
      console.error("RSVP error:", error)
    }
  }

  const addPlayer = async (playerData: any) => {
    try {
      await DatabaseService.createPlayer({
        ...playerData,
        role: "player" as const,
      })
      await loadData()
    } catch (error) {
      console.error("Add player error:", error)
    }
  }

  const updatePlayer = async (playerId: string, updates: any) => {
    try {
      const updatedPlayer = await DatabaseService.updatePlayer(playerId, updates)

      // If the updated player is the current user, update the current user state
      if (currentUser && currentUser.id === playerId) {
        setCurrentUser(updatedPlayer)
        localStorage.setItem("soccer-app-user", JSON.stringify(updatedPlayer))
      }

      await loadData()
    } catch (error) {
      console.error("Update player error:", error)
    }
  }

  const addMatch = async (matchData: any) => {
    try {
      await DatabaseService.createMatch({
        ...matchData,
        full_time: false,
        status: "upcoming" as const,
      })
      await loadData()
    } catch (error) {
      console.error("Add match error:", error)
    }
  }

  const updateMatch = async (matchId: string, updates: any) => {
    try {
      await DatabaseService.updateMatch(matchId, updates)
      await loadData()
    } catch (error) {
      console.error("Update match error:", error)
    }
  }

  // Add the onDeleteMatch function
  const deleteMatch = async (matchId: string) => {
    try {
      await DatabaseService.deleteMatch(matchId)
      await loadData()
    } catch (error) {
      console.error("Delete match error:", error)
    }
  }

  const deletePlayer = async (playerId: string) => {
    try {
      await DatabaseService.deletePlayer(playerId)
      await loadData()
    } catch (error) {
      console.error("Delete player error:", error)
      alert(error.message || "Error deleting player")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />
  }

  if (showSettings) {
    return (
      <Settings
        currentUser={currentUser}
        players={players}
        matches={matches}
        onBack={() => setShowSettings(false)}
        onLogout={handleLogout}
        onUpdateProfile={updatePlayer}
        onSelectMatch={(match) => {
          setShowSettings(false)
          // We need to add selectedMatch state to main app
          // For now, we'll handle this in the Settings component
        }}
      />
    )
  }

  // Route to appropriate dashboard based on user role
  if (currentUser.role === "admin") {
    return (
      <AdminDashboard
        currentUser={currentUser}
        matches={matches}
        players={players}
        onLogout={handleLogout}
        onAddPlayer={addPlayer}
        onUpdatePlayer={updatePlayer}
        onDeletePlayer={deletePlayer}
        onAddMatch={addMatch}
        onUpdateMatch={updateMatch}
        onDeleteMatch={deleteMatch}
        onRefreshData={loadData}
      />
    )
  }

  return (
    <PlayerDashboard
      currentUser={currentUser}
      matches={matches}
      players={players}
      onLogout={handleLogout}
      onRSVP={handleRSVP}
      onRefreshData={loadData}
      onShowSettings={() => setShowSettings(true)}
    />
  )
}
