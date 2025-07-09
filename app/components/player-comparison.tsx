"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Trophy, Target, Users, Calendar, TrendingUp, Crown } from "lucide-react"

interface PlayerComparisonProps {
  currentUser: any
  players: any[]
  matches: any[]
  onBack: () => void
}

export function PlayerComparison({ currentUser, players, matches, onBack }: PlayerComparisonProps) {
  const [searchUsername, setSearchUsername] = useState("")
  const [comparedPlayer, setComparedPlayer] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = () => {
    if (!searchUsername.trim()) return

    const results = players.filter(
      (player) =>
        player.username.toLowerCase().includes(searchUsername.toLowerCase()) ||
        `${player.name} ${player.surname}`.toLowerCase().includes(searchUsername.toLowerCase()),
    )
    setSearchResults(results)
  }

  const selectPlayer = (player: any) => {
    setComparedPlayer(player)
    setSearchResults([])
    setSearchUsername("")
  }

  const calculateStats = (player: any) => {
    const playerMatches = matches.filter((match) => match.attendees?.some((attendee) => attendee.id === player.id))

    const completedMatches = playerMatches.filter((match) => match.status === "completed")
    const totalMatches = playerMatches.length
    const attendanceRate = totalMatches > 0 ? (completedMatches.length / totalMatches) * 100 : 0

    // Calculate goals from all matches
    let totalGoals = 0
    matches.forEach((match) => {
      if (match.goalScorers) {
        const playerGoals = match.goalScorers.find((scorer) => scorer.playerId === player.id)
        if (playerGoals) {
          totalGoals += playerGoals.goals
        }
      }
    })

    // Calculate assists from all matches
    let totalAssists = 0
    matches.forEach((match) => {
      if (match.assists) {
        const playerAssists = match.assists.find((assist) => assist.playerId === player.id)
        if (playerAssists) {
          totalAssists += playerAssists.assists
        }
      }
    })

    // Calculate MVP awards
    const mvpAwards = matches.filter((match) => match.mvp?.id === player.id).length

    return {
      goals: totalGoals,
      assists: totalAssists,
      mvpAwards,
      matchesPlayed: completedMatches.length,
      attendanceRate: Math.round(attendanceRate),
    }
  }

  const currentUserStats = calculateStats(currentUser)
  const comparedPlayerStats = comparedPlayer ? calculateStats(comparedPlayer) : null

  const getWinner = (stat1: number, stat2: number) => {
    if (stat1 > stat2) return "current"
    if (stat2 > stat1) return "compared"
    return "tie"
  }

  const calculateOverallWinner = () => {
    if (!comparedPlayerStats) return null

    let currentUserWins = 0
    let comparedPlayerWins = 0

    const comparisons = [
      getWinner(currentUserStats.goals, comparedPlayerStats.goals),
      getWinner(currentUserStats.assists, comparedPlayerStats.assists),
      getWinner(currentUserStats.mvpAwards, comparedPlayerStats.mvpAwards),
      getWinner(currentUserStats.matchesPlayed, comparedPlayerStats.matchesPlayed),
      getWinner(currentUserStats.attendanceRate, comparedPlayerStats.attendanceRate),
    ]

    comparisons.forEach((result) => {
      if (result === "current") currentUserWins++
      if (result === "compared") comparedPlayerWins++
    })

    if (currentUserWins > comparedPlayerWins) return "current"
    if (comparedPlayerWins > currentUserWins) return "compared"
    return "tie"
  }

  const overallWinner = calculateOverallWinner()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Player Comparison</h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Find Player to Compare</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Enter username or player name..."
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-gray-900">Search Results:</h3>
                {searchResults.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => selectPlayer(player)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10 ring-2 ring-white">
                        <AvatarImage src={player.profile_image || "/placeholder.svg"} />
                        <AvatarFallback className="bg-white">
                          {player.name[0]}
                          {player.surname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {player.name} {player.surname}
                        </div>
                        <div className="text-sm text-gray-600">@{player.username}</div>
                      </div>
                    </div>
                    <Button size="sm">Compare</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Results */}
        {comparedPlayer && (
          <div className="space-y-6">
            {/* Overall Winner */}
            {overallWinner && (
              <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {overallWinner === "current"
                      ? `${currentUser.name} ${currentUser.surname} Wins!`
                      : overallWinner === "compared"
                        ? `${comparedPlayer.name} ${comparedPlayer.surname} Wins!`
                        : "It's a Tie!"}
                  </h2>
                  <p className="text-gray-600">Overall Performance Champion</p>
                </CardContent>
              </Card>
            )}

            {/* Player Headers */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-white">
                    <AvatarImage src={currentUser.profile_image || "/placeholder.svg"} />
                    <AvatarFallback className="bg-white text-lg">
                      {currentUser.name[0]}
                      {currentUser.surname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">
                    {currentUser.name} {currentUser.surname}
                  </h3>
                  <p className="text-sm text-gray-600">@{currentUser.username}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-white">
                    <AvatarImage src={comparedPlayer.profile_image || "/placeholder.svg"} />
                    <AvatarFallback className="bg-white text-lg">
                      {comparedPlayer.name[0]}
                      {comparedPlayer.surname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">
                    {comparedPlayer.name} {comparedPlayer.surname}
                  </h3>
                  <p className="text-sm text-gray-600">@{comparedPlayer.username}</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Comparison */}
            <div className="space-y-4">
              {/* Goals */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Goals</span>
                    </div>
                    {getWinner(currentUserStats.goals, comparedPlayerStats.goals) !== "tie" && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.goals, comparedPlayerStats.goals) === "current"
                          ? "bg-green-100 border-2 border-green-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-green-600">{currentUserStats.goals}</div>
                    </div>
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.goals, comparedPlayerStats.goals) === "compared"
                          ? "bg-green-100 border-2 border-green-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-green-600">{comparedPlayerStats.goals}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assists */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Assists</span>
                    </div>
                    {getWinner(currentUserStats.assists, comparedPlayerStats.assists) !== "tie" && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.assists, comparedPlayerStats.assists) === "current"
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-blue-600">{currentUserStats.assists}</div>
                    </div>
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.assists, comparedPlayerStats.assists) === "compared"
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-blue-600">{comparedPlayerStats.assists}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MVP Awards */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold">MVP Awards</span>
                    </div>
                    {getWinner(currentUserStats.mvpAwards, comparedPlayerStats.mvpAwards) !== "tie" && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.mvpAwards, comparedPlayerStats.mvpAwards) === "current"
                          ? "bg-yellow-100 border-2 border-yellow-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-yellow-600">{currentUserStats.mvpAwards}</div>
                    </div>
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.mvpAwards, comparedPlayerStats.mvpAwards) === "compared"
                          ? "bg-yellow-100 border-2 border-yellow-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-yellow-600">{comparedPlayerStats.mvpAwards}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matches Played */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">Matches Played</span>
                    </div>
                    {getWinner(currentUserStats.matchesPlayed, comparedPlayerStats.matchesPlayed) !== "tie" && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.matchesPlayed, comparedPlayerStats.matchesPlayed) === "current"
                          ? "bg-purple-100 border-2 border-purple-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-purple-600">{currentUserStats.matchesPlayed}</div>
                    </div>
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.matchesPlayed, comparedPlayerStats.matchesPlayed) === "compared"
                          ? "bg-purple-100 border-2 border-purple-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-purple-600">{comparedPlayerStats.matchesPlayed}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Rate */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold">Attendance Rate</span>
                    </div>
                    {getWinner(currentUserStats.attendanceRate, comparedPlayerStats.attendanceRate) !== "tie" && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.attendanceRate, comparedPlayerStats.attendanceRate) === "current"
                          ? "bg-orange-100 border-2 border-orange-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-orange-600">{currentUserStats.attendanceRate}%</div>
                    </div>
                    <div
                      className={`text-center p-3 rounded-lg ${
                        getWinner(currentUserStats.attendanceRate, comparedPlayerStats.attendanceRate) === "compared"
                          ? "bg-orange-100 border-2 border-orange-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="text-2xl font-bold text-orange-600">{comparedPlayerStats.attendanceRate}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
