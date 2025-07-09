"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Trophy,
  Target,
  Heart,
  Edit,
  Upload,
  FileVideo,
  X,
  Check,
} from "lucide-react"
import { DatabaseService } from "../../lib/database"
import type { Player } from "../../lib/supabase"

interface MatchDetailProps {
  match: any
  currentUser: Player
  players: Player[]
  onBack: () => void
  onUpdateMatch: (matchId: string, updates: any) => void
  onRSVP: (matchId: string, attending: boolean) => void
  onRefreshData: () => void
}

export function MatchDetail({
  match,
  currentUser,
  players,
  onBack,
  onUpdateMatch,
  onRSVP,
  onRefreshData,
}: MatchDetailProps) {
  const [activeTab, setActiveTab] = useState("facts")
  const [showRSVPDialog, setShowRSVPDialog] = useState(false)
  const [rsvpStatus, setRsvpStatus] = useState<boolean | null>(null)
  const [isUpdatingRSVP, setIsUpdatingRSVP] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMatch, setEditingMatch] = useState<any>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check current user's RSVP status
  useEffect(() => {
    const checkRSVPStatus = async () => {
      try {
        const attendance = await DatabaseService.getMatchAttendance(match.id)
        const userAttendance = attendance.find((a) => a.player_id === currentUser.id)
        setRsvpStatus(userAttendance ? userAttendance.attending : null)
      } catch (error) {
        console.error("Error checking RSVP status:", error)
      }
    }

    checkRSVPStatus()
  }, [match.id, currentUser.id])

  const handleRSVPChange = async (attending: boolean) => {
    setIsUpdatingRSVP(true)
    try {
      await onRSVP(match.id, attending)
      setRsvpStatus(attending)
      setShowRSVPDialog(false)
      await onRefreshData()
    } catch (error) {
      console.error("RSVP error:", error)
      alert("Failed to update RSVP. Please try again.")
    } finally {
      setIsUpdatingRSVP(false)
    }
  }

  const handleEditMatch = () => {
    setEditingMatch({
      ...match,
      mvp: match.mvp?.id || "",
      goalScorers: match.goalScorers?.map((p: any) => p.id) || [],
      assists: match.assists?.map((p: any) => p.id) || [],
    })
    setVideoUrl(match.video_highlight || "")
    setShowEditDialog(true)
  }

  const handleSaveMatch = async () => {
    if (!editingMatch) return

    try {
      const updates: any = {
        score: editingMatch.score,
        status: editingMatch.status,
        mvp: editingMatch.mvp || null,
        goal_scorers: editingMatch.goalScorers || [],
        assists: editingMatch.assists || [],
      }

      // Handle video highlight
      if (videoFile) {
        setIsUploading(true)
        // In a real app, you'd upload to a storage service
        // For now, we'll use a placeholder URL
        updates.video_highlight = `video_${Date.now()}.mp4`
      } else if (videoUrl) {
        updates.video_highlight = videoUrl
      }

      await onUpdateMatch(match.id, updates)
      setShowEditDialog(false)
      setEditingMatch(null)
      setVideoFile(null)
      setVideoUrl("")
      await onRefreshData()
    } catch (error) {
      console.error("Error updating match:", error)
      alert("Failed to update match. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        alert("File size must be less than 100MB")
        return
      }
      setVideoFile(file)
      setVideoUrl("") // Clear URL if file is selected
    }
  }

  const getRSVPButtonText = () => {
    if (rsvpStatus === true) return "Going ✓"
    if (rsvpStatus === false) return "Can't Make It"
    return "RSVP"
  }

  const getRSVPButtonVariant = () => {
    if (rsvpStatus === true) return "default"
    if (rsvpStatus === false) return "destructive"
    return "outline"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {currentUser.role === "admin" && (
              <Button onClick={handleEditMatch} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Match
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Match Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Location Image */}
              <div className="md:w-1/3">
                <img
                  src={match.location_image || "/placeholder.svg?height=200&width=300"}
                  alt={match.location}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Match Info */}
              <div className="md:w-2/3 space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Match Details</h1>
                  <Badge variant={match.status === "completed" ? "default" : "secondary"}>{match.status}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(match.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{match.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{match.attendees?.length || 0} attending</span>
                  </div>
                </div>

                {match.score && (
                  <div className="text-3xl font-bold text-center py-4 bg-gray-50 rounded-lg">{match.score}</div>
                )}

                {/* RSVP Button */}
                <Dialog open={showRSVPDialog} onOpenChange={setShowRSVPDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant={getRSVPButtonVariant()}>
                      {getRSVPButtonText()}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>RSVP for Match</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>Will you be attending this match?</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRSVPChange(true)}
                          disabled={isUpdatingRSVP}
                          className="flex-1"
                          variant={rsvpStatus === true ? "default" : "outline"}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Going
                        </Button>
                        <Button
                          onClick={() => handleRSVPChange(false)}
                          disabled={isUpdatingRSVP}
                          className="flex-1"
                          variant={rsvpStatus === false ? "destructive" : "outline"}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Can't Make It
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="facts">Facts</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>

          <TabsContent value="facts" className="space-y-6">
            {/* Video Highlights */}
            {match.video_highlight && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    Video Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {match.video_highlight.startsWith("http") ? (
                    <video controls className="w-full rounded-lg">
                      <source src={match.video_highlight} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <FileVideo className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Video: {match.video_highlight}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* MVP */}
            {match.mvp && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    MVP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                      {match.mvp.profile_image ? (
                        <img
                          src={match.mvp.profile_image || "/placeholder.svg"}
                          alt={match.mvp.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">{match.mvp.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {match.mvp.name} {match.mvp.surname}
                      </p>
                      <p className="text-sm text-gray-600">Most Valuable Player</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goal Scorers */}
            {match.goalScorers && match.goalScorers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Goal Scorers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {match.goalScorers.map((player: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                          {player.profile_image ? (
                            <img
                              src={player.profile_image || "/placeholder.svg"}
                              alt={player.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-gray-600">{player.name.charAt(0)}</span>
                          )}
                        </div>
                        <span>
                          {player.name} {player.surname}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assists */}
            {match.assists && match.assists.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Assists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {match.assists.map((player: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                          {player.profile_image ? (
                            <img
                              src={player.profile_image || "/placeholder.svg"}
                              alt={player.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-gray-600">{player.name.charAt(0)}</span>
                          )}
                        </div>
                        <span>
                          {player.name} {player.surname}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            {/* Attendees */}
            <Card>
              <CardHeader>
                <CardTitle>Attendees ({match.attendees?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {match.attendees && match.attendees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {match.attendees.map((player: any) => (
                      <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                          {player.profile_image ? (
                            <img
                              src={player.profile_image || "/placeholder.svg"}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-600">{player.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {player.name} {player.surname}
                          </p>
                          <p className="text-sm text-gray-600">{player.position}</p>
                        </div>
                        {player.injured && (
                          <Badge variant="destructive" className="ml-auto">
                            Injured
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No players have RSVP'd yet</p>
                )}
              </CardContent>
            </Card>

            {/* Injured Players */}
            {match.injuredPlayers && match.injuredPlayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Injured Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {match.injuredPlayers.map((player: any) => (
                      <div key={player.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-red-200">
                          {player.profile_image ? (
                            <img
                              src={player.profile_image || "/placeholder.svg"}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-red-600">{player.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {player.name} {player.surname}
                          </p>
                          <p className="text-sm text-red-600">
                            Injured since {new Date(player.injury_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Match Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
          </DialogHeader>
          {editingMatch && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  value={editingMatch.score || ""}
                  onChange={(e) => setEditingMatch({ ...editingMatch, score: e.target.value })}
                  placeholder="e.g., 2-1"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingMatch.status || "upcoming"}
                  onValueChange={(value) => setEditingMatch({ ...editingMatch, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mvp">MVP</Label>
                <Select
                  value={editingMatch.mvp || "none"}
                  onValueChange={(value) => setEditingMatch({ ...editingMatch, mvp: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No MVP</SelectItem>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} {player.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Goal Scorers</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`goal-${player.id}`}
                        checked={editingMatch.goalScorers?.includes(player.id) || false}
                        onChange={(e) => {
                          const goalScorers = editingMatch.goalScorers || []
                          if (e.target.checked) {
                            setEditingMatch({
                              ...editingMatch,
                              goalScorers: [...goalScorers, player.id],
                            })
                          } else {
                            setEditingMatch({
                              ...editingMatch,
                              goalScorers: goalScorers.filter((id: string) => id !== player.id),
                            })
                          }
                        }}
                      />
                      <label htmlFor={`goal-${player.id}`} className="text-sm">
                        {player.name} {player.surname}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Assists</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`assist-${player.id}`}
                        checked={editingMatch.assists?.includes(player.id) || false}
                        onChange={(e) => {
                          const assists = editingMatch.assists || []
                          if (e.target.checked) {
                            setEditingMatch({
                              ...editingMatch,
                              assists: [...assists, player.id],
                            })
                          } else {
                            setEditingMatch({
                              ...editingMatch,
                              assists: assists.filter((id: string) => id !== player.id),
                            })
                          }
                        }}
                      />
                      <label htmlFor={`assist-${player.id}`} className="text-sm">
                        {player.name} {player.surname}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Video Highlights</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={!!videoFile}
                  />
                  <div className="text-center text-gray-500">or</div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!!videoUrl}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Video
                    </Button>
                    {videoFile && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{videoFile.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setVideoFile(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500">Max file size: 100MB</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMatch} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
