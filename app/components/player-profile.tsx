"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Trophy,
  Target,
  Star,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Edit2,
  AlertTriangle,
  Users,
} from "lucide-react"

interface PlayerProfileProps {
  player: any
  matches: any[]
  currentUser?: any
  onBack: () => void
  onUpdatePlayer?: (playerId: string, updates: any) => void
  isAdmin?: boolean
}

export function PlayerProfile({
  player,
  matches,
  currentUser,
  onBack,
  onUpdatePlayer,
  isAdmin = false,
}: PlayerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: player.name,
    surname: player.surname,
    username: player.username,
    profile_image: player.profile_image || "",
    injured: player.injured || false,
  })

  // Calculate stats - only count matches where player actually played (not injured watching)
  const playerMatches = matches.filter((match) => match.attendees?.some((attendee) => attendee.id === player.id))

  // Only count as "played" if they attended and weren't injured
  const playedMatches = playerMatches.filter((match) => {
    const attendee = match.attendees?.find((a) => a.id === player.id)
    return attendee && !attendee.injured && match.status === "completed"
  })

  const mvpMatches = matches.filter((match) => match.mvp?.id === player.id)
  const goalScoringMatches = matches.filter((match) =>
    match.goalScorers?.some((scorer) => scorer.playerId === player.id),
  )

  const totalGoals = matches.reduce((total, match) => {
    const scorer = match.goalScorers?.find((s) => s.playerId === player.id)
    return total + (scorer?.goals || 0)
  }, 0)

  const totalAssists = matches.reduce((total, match) => {
    const assist = match.assists?.find((a) => a.playerId === player.id)
    return total + (assist?.assists || 0)
  }, 0)

  const attendanceRate = playerMatches.length > 0 ? Math.round((playerMatches.length / matches.length) * 100) : 0

  const handleSaveEdit = async () => {
    if (onUpdatePlayer) {
      await onUpdatePlayer(player.id, editData)
      setIsEditing(false)
    }
  }

  if (isEditing && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Edit Player</h1>
            </div>
          </div>
        </header>

        <main className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Player Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={editData.profile_image || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl font-bold">
                    {editData.name[0]}
                    {editData.surname[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Last Name</Label>
                  <Input
                    id="surname"
                    value={editData.surname}
                    onChange={(e) => setEditData({ ...editData, surname: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="profile_image">Profile Picture URL</Label>
                <Input
                  id="profile_image"
                  value={editData.profile_image}
                  onChange={(e) => setEditData({ ...editData, profile_image: e.target.value })}
                  placeholder="https://example.com/profile.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="injured"
                  checked={editData.injured}
                  onCheckedChange={(checked) => setEditData({ ...editData, injured: checked })}
                />
                <Label htmlFor="injured" className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Mark as injured</span>
                </Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900">Player Profile</h1>
            </div>
            {isAdmin && onUpdatePlayer && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20 ring-4 ring-white/30">
                <AvatarImage
                  src={player.profile_image || "/placeholder.svg"}
                  alt={`${player.name} ${player.surname}`}
                />
                <AvatarFallback className="text-2xl font-bold bg-white/20">
                  {player.name[0]}
                  {player.surname[0]}
                </AvatarFallback>
              </Avatar>
              {player.injured && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <AlertTriangle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {player.name} {player.surname}
              </h2>
              <p className="text-green-100 mb-2">@{player.username}</p>
              <div className="flex space-x-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {player.role === "admin" ? "Team Admin" : "Player"}
                </Badge>
                {player.injured && (
                  <Badge variant="destructive" className="bg-red-500/80 text-white">
                    Injured
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{totalGoals}</div>
              <div className="text-sm text-green-100">Goals</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{totalAssists}</div>
              <div className="text-sm text-green-100">Assists</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{mvpMatches.length}</div>
              <div className="text-sm text-green-100">MVP Awards</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{playedMatches.length}</div>
              <div className="text-sm text-green-100">Played</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="achievements">Awards</TabsTrigger>
            </TabsList>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>Performance Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Total Goals</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{totalGoals}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Total Assists</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{totalAssists}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">MVP Awards</span>
                      </div>
                      <span className="text-xl font-bold text-yellow-600">{mvpMatches.length}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Matches Played</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{playedMatches.length}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Attendance Rate</span>
                      </div>
                      <span className="text-xl font-bold text-purple-600">{attendanceRate}%</span>
                    </div>

                    {totalGoals > 0 && playedMatches.length > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Trophy className="w-5 h-5 text-orange-600" />
                          <span className="font-medium">Goals per Match</span>
                        </div>
                        <span className="text-xl font-bold text-orange-600">
                          {(totalGoals / playedMatches.length).toFixed(1)}
                        </span>
                      </div>
                    )}

                    {player.injured && player.injury_date && (
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-800">Injured Since</span>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          {new Date(player.injury_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Matches Tab */}
            <TabsContent value="matches" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>All Matches</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {playerMatches.length > 0 ? (
                    <div className="space-y-3">
                      {playerMatches.map((match) => {
                        const scorer = match.goalScorers?.find((s) => s.playerId === player.id)
                        const assist = match.assists?.find((a) => a.playerId === player.id)
                        const isMVP = match.mvp?.id === player.id
                        const attendee = match.attendees?.find((a) => a.id === player.id)
                        const wasInjured = attendee?.injured

                        return (
                          <div key={match.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{match.day} Match</h4>
                                <p className="text-sm text-gray-600">{match.location}</p>
                                <p className="text-xs text-gray-500">{new Date(match.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                {match.status === "completed" ? (
                                  <div className="text-lg font-bold text-gray-900">{match.score}</div>
                                ) : (
                                  <Badge variant="outline">Upcoming</Badge>
                                )}
                              </div>
                            </div>

                            {wasInjured && (
                              <div className="mb-2">
                                <Badge variant="destructive" className="text-xs">
                                  Watched (Injured) - Not counted as played
                                </Badge>
                              </div>
                            )}

                            {(scorer || assist || isMVP) && (
                              <div className="flex space-x-2 mt-2">
                                {scorer && scorer.goals > 0 && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    ⚽ {scorer.goals} goal{scorer.goals !== 1 ? "s" : ""}
                                  </Badge>
                                )}
                                {assist && assist.assists > 0 && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    🅰️ {assist.assists} assist{assist.assists !== 1 ? "s" : ""}
                                  </Badge>
                                )}
                                {isMVP && (
                                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    ⭐ MVP
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No matches found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4 mt-4">
              {/* MVP Awards */}
              {mvpMatches.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span>MVP Performances</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mvpMatches.map((match) => (
                        <div key={match.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{match.day} Match</div>
                            <div className="text-sm text-gray-600">{match.location}</div>
                            <div className="text-sm text-gray-600">{new Date(match.date).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{match.score}</div>
                            <Star className="w-4 h-4 text-yellow-600 mx-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Goal Scoring Record */}
              {goalScoringMatches.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Target className="w-5 h-5 text-green-600" />
                      <span>Goal Scoring Record</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {goalScoringMatches.map((match) => {
                        const scorer = match.goalScorers?.find((s) => s.playerId === player.id)
                        return (
                          <div key={match.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{match.day} Match</div>
                              <div className="text-sm text-gray-600">{match.location}</div>
                              <div className="text-sm text-gray-600">{new Date(match.date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {scorer?.goals} goal{scorer?.goals !== 1 ? "s" : ""}
                              </div>
                              <div className="text-sm text-gray-600">{match.score}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {mvpMatches.length === 0 && goalScoringMatches.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No achievements yet</p>
                    <p className="text-sm">Keep playing to earn awards!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
