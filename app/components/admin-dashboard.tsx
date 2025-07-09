"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Settings, Trophy, BarChart3, MapPin, Clock, UserPlus, CalendarPlus } from "lucide-react"
import { AdminPlayerManager } from "./admin-player-manager"
import { AdminMatchManager } from "./admin-match-manager"
import { MatchDetail } from "./match-detail"
import { PlayerProfile } from "./player-profile"

interface AdminDashboardProps {
  currentUser: any
  matches: any[]
  players: any[]
  onLogout: () => void
  onAddPlayer: (player: any) => void
  onUpdatePlayer: (playerId: string, updates: any) => void
  onDeletePlayer: (playerId: string) => void
  onAddMatch: (match: any) => void
  onUpdateMatch: (matchId: string, updates: any) => void
  onDeleteMatch: (matchId: string) => void
  onRefreshData: () => void
}

export function AdminDashboard({
  currentUser,
  matches,
  players,
  onLogout,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  onRefreshData,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const upcomingMatches = matches.filter((match) => match.status === "upcoming")
  const completedMatches = matches.filter((match) => match.status === "completed")
  const activePlayers = players.filter((player) => player.role === "player")

  if (selectedMatch) {
    return (
      <MatchDetail
        match={selectedMatch}
        currentUser={currentUser}
        players={players}
        onBack={() => setSelectedMatch(null)}
        onRSVP={() => {}} // Admin doesn't need RSVP
        onUpdateMatch={onUpdateMatch}
        onDeleteMatch={onDeleteMatch}
        onSelectPlayer={setSelectedPlayer}
        isAdmin={true}
      />
    )
  }

  if (selectedPlayer) {
    return (
      <PlayerProfile
        player={selectedPlayer}
        matches={matches}
        currentUser={currentUser}
        onBack={() => setSelectedPlayer(null)}
        onUpdatePlayer={onUpdatePlayer}
        isAdmin={true}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-600">Soccer Squad Management</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="hidden md:flex space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("overview")}
                  className="h-8"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === "players" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("players")}
                  className="h-8"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Players
                </Button>
                <Button
                  variant={activeTab === "matches" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("matches")}
                  className="h-8"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Matches
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Avatar className="w-9 h-9 ring-2 ring-blue-200">
                <AvatarImage src={currentUser.profile_image || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 font-semibold">
                  {currentUser.name[0]}
                  {currentUser.surname[0]}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-red-600">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("overview")}
              className="flex-1 h-8"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "players" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("players")}
              className="flex-1 h-8"
            >
              Players
            </Button>
            <Button
              variant={activeTab === "matches" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("matches")}
              className="flex-1 h-8"
            >
              Matches
            </Button>
          </div>
        </div>
      </nav>

      <main className="p-4 pb-20">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{activePlayers.length}</div>
                  <div className="text-sm text-gray-600">Active Players</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{upcomingMatches.length}</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{completedMatches.length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
                  <div className="text-sm text-gray-600">Total Matches</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => setActiveTab("players")} className="w-full justify-start" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New Player
                  </Button>
                  <Button onClick={() => setActiveTab("matches")} className="w-full justify-start" variant="outline">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Schedule Match
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {matches.slice(0, 3).map((match) => (
                      <div key={match.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">{match.day} Match</p>
                          <p className="text-gray-600 text-xs">{match.location}</p>
                        </div>
                        <Badge variant={match.status === "completed" ? "default" : "secondary"}>{match.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span>Upcoming Matches</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingMatches.slice(0, 3).map((match) => {
                      const playingCount = match.attendees?.filter((a) => !a.injured).length || 0
                      const watchingCount = match.attendees?.filter((a) => a.injured).length || 0

                      return (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{match.day} Match</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{match.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{match.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{playingCount}</div>
                            <div className="text-xs text-gray-600">Playing</div>
                            {watchingCount > 0 && (
                              <>
                                <div className="text-sm font-medium text-orange-600">{watchingCount}</div>
                                <div className="text-xs text-orange-500">Watching</div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Players Tab */}
        {activeTab === "players" && (
          <AdminPlayerManager
            players={players}
            onAddPlayer={onAddPlayer}
            onUpdatePlayer={onUpdatePlayer}
            onDeletePlayer={onDeletePlayer}
            onSelectPlayer={setSelectedPlayer}
            onRefreshData={onRefreshData}
          />
        )}

        {/* Matches Tab */}
        {activeTab === "matches" && (
          <AdminMatchManager
            matches={matches}
            players={players}
            onAddMatch={onAddMatch}
            onSelectMatch={setSelectedMatch}
            onUpdateMatch={onUpdateMatch}
            onDeleteMatch={onDeleteMatch}
            onRefreshData={onRefreshData}
          />
        )}
      </main>
    </div>
  )
}
