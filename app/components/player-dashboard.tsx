"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Trophy, Settings, Calendar, Clock, MapPin } from "lucide-react"
import { MatchDetail } from "./match-detail"
import { PlayerSearch } from "./player-search"
import { PlayerProfile } from "./player-profile"

interface PlayerDashboardProps {
  currentUser: any
  matches: any[]
  players: any[]
  onLogout: () => void
  onRSVP: (matchId: string, attending: boolean) => void
  onRefreshData: () => void
  onShowSettings: () => void
}

// Helper function to format time to 12-hour format
const formatTime = (time: string) => {
  if (!time) return ""

  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function PlayerDashboard({
  currentUser,
  matches,
  players,
  onLogout,
  onRSVP,
  onRefreshData,
  onShowSettings,
}: PlayerDashboardProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const upcomingMatches = matches.filter((match) => match.status === "upcoming")
  const completedMatches = matches.filter((match) => match.status === "completed")

  if (selectedMatch) {
    return (
      <MatchDetail
        match={selectedMatch}
        currentUser={currentUser}
        players={players}
        onBack={() => setSelectedMatch(null)}
        onRSVP={onRSVP}
        onUpdateMatch={() => {}}
        onSelectPlayer={setSelectedPlayer}
        isAdmin={false}
      />
    )
  }

  if (selectedPlayer) {
    return <PlayerProfile player={selectedPlayer} matches={matches} onBack={() => setSelectedPlayer(null)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Soccer Squad</h1>
                <p className="text-xs text-gray-600">Your team, your game</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
                <Search className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" onClick={onShowSettings}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-6">
        {showSearch && (
          <div className="p-4 bg-white border-b">
            <PlayerSearch players={players} onSelectPlayer={setSelectedPlayer} />
          </div>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
            <div className="space-y-3">
              {upcomingMatches.map((match) => {
                const playingCount = match.attendees?.filter((a) => !a.injured).length || 0
                const watchingCount = match.attendees?.filter((a) => a.injured).length || 0
                const totalCount = match.attendees?.length || 0

                return (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{match.day} Match</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(match.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(match.time)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{match.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{playingCount}</div>
                        <div className="text-xs text-gray-500">Playing</div>
                        {watchingCount > 0 && (
                          <>
                            <div className="text-sm font-medium text-orange-600">{watchingCount}</div>
                            <div className="text-xs text-orange-500">Watching</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h2>
            <div className="space-y-3">
              {completedMatches.slice(0, 5).map((match) => (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{match.day} Match</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(match.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(match.time)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{match.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{match.score || "0-0"}</div>
                      <div className="text-xs text-gray-500">Full Time</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
