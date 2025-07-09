"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarPlus, Calendar, MapPin, Clock, Users, Trophy, Trash2, Edit, Upload } from "lucide-react"

interface AdminMatchManagerProps {
  matches: any[]
  players: any[]
  onAddMatch: (match: any) => void
  onSelectMatch: (match: any) => void
  onUpdateMatch: (matchId: string, updates: any) => void
  onDeleteMatch?: (matchId: string) => void
  onRefreshData: () => void
}

export function AdminMatchManager({
  matches,
  players,
  onAddMatch,
  onSelectMatch,
  onUpdateMatch,
  onDeleteMatch,
  onRefreshData,
}: AdminMatchManagerProps) {
  const [newMatch, setNewMatch] = useState({
    date: "",
    time: "",
    location: "",
    location_address: "",
    location_image: "",
    day: "",
    recurring: false,
  })

  const [editingMatch, setEditingMatch] = useState<any>(null)
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url")
  const [editUploadMethod, setEditUploadMethod] = useState<"url" | "file">("url")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const matchData = {
        ...newMatch,
        location_image: newMatch.location_image || "/placeholder.svg?height=200&width=400",
      }
      await onAddMatch(matchData)
      setNewMatch({
        date: "",
        time: "",
        location: "",
        location_address: "",
        location_image: "",
        day: "",
        recurring: false,
      })
      alert("Match scheduled successfully!")
    } catch (error) {
      console.error("Error adding match:", error)
      alert("Error scheduling match. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setNewMatch({ ...newMatch, location_image: result })
      }
      reader.onerror = () => {
        alert("Error reading file. Please try again.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setEditingMatch({ ...editingMatch, location_image: result })
      }
      reader.onerror = () => {
        alert("Error reading file. Please try again.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditMatch = (match: any) => {
    setEditingMatch({
      ...match,
      date: match.date ? new Date(match.date).toISOString().split("T")[0] : "",
      time: match.time || "",
      location: match.location || "",
      location_address: match.location_address || "",
      location_image: match.location_image || "",
      day: match.day || "",
      recurring: match.recurring || false,
    })
  }

  const handleSaveEdit = async () => {
    if (editingMatch && !isSubmitting) {
      setIsSubmitting(true)
      try {
        const updateData = {
          date: editingMatch.date,
          time: editingMatch.time,
          location: editingMatch.location,
          location_address: editingMatch.location_address,
          location_image: editingMatch.location_image || "/placeholder.svg?height=200&width=400",
          day: editingMatch.day,
          recurring: editingMatch.recurring,
        }

        await onUpdateMatch(editingMatch.id, updateData)
        setEditingMatch(null)
        alert("Match updated successfully!")
      } catch (error) {
        console.error("Error updating match:", error)
        alert("Error updating match. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const upcomingMatches = matches.filter((match) => match.status === "upcoming")
  const completedMatches = matches.filter((match) => match.status === "completed")

  const handleDeleteMatch = async (matchId: string) => {
    if (confirm("Are you sure you want to delete this match? This action cannot be undone.")) {
      try {
        await onDeleteMatch?.(matchId)
      } catch (error) {
        console.error("Error deleting match:", error)
      }
    }
  }

  const formatTime = (time: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (editingMatch) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>Edit Match</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editingMatch.date}
                    onChange={(e) => setEditingMatch({ ...editingMatch, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editingMatch.time}
                    onChange={(e) => setEditingMatch({ ...editingMatch, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-location">Location Name</Label>
                <Input
                  id="edit-location"
                  value={editingMatch.location}
                  onChange={(e) => setEditingMatch({ ...editingMatch, location: e.target.value })}
                  placeholder="e.g., Central Park Soccer Field"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-location_address">Location Address/URL</Label>
                <Input
                  id="edit-location_address"
                  value={editingMatch.location_address}
                  onChange={(e) => setEditingMatch({ ...editingMatch, location_address: e.target.value })}
                  placeholder="Full address or Google Maps URL"
                />
              </div>

              <div>
                <Label>Location Image</Label>
                <Tabs value={editUploadMethod} onValueChange={(value) => setEditUploadMethod(value as "url" | "file")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url">
                    <Input
                      value={editingMatch.location_image}
                      onChange={(e) => setEditingMatch({ ...editingMatch, location_image: e.target.value })}
                      placeholder="https://example.com/field.jpg"
                    />
                  </TabsContent>
                  <TabsContent value="file">
                    <div className="flex items-center space-x-2">
                      <Input type="file" accept="image/*" onChange={handleEditFileUpload} key={editingMatch.id} />
                      <Upload className="w-4 h-4 text-gray-500" />
                    </div>
                  </TabsContent>
                </Tabs>

                {editingMatch.location_image && (
                  <div className="mt-3">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-2">
                      <img
                        src={editingMatch.location_image || "/placeholder.svg"}
                        alt="Location preview"
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          console.log("Location image failed to load:", editingMatch.location_image)
                          e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="edit-day">Day of Week</Label>
                <Select
                  onValueChange={(value) => setEditingMatch({ ...editingMatch, day: value })}
                  value={editingMatch.day}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-recurring"
                  checked={editingMatch.recurring}
                  onCheckedChange={(checked) => setEditingMatch({ ...editingMatch, recurring: checked })}
                />
                <Label htmlFor="edit-recurring">Recurring weekly match</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingMatch(null)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Match Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarPlus className="w-5 h-5 text-green-600" />
            <span>Schedule New Match</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMatch.date}
                  onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMatch.time}
                  onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location Name</Label>
              <Input
                id="location"
                value={newMatch.location}
                onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                placeholder="e.g., Central Park Soccer Field"
                required
              />
            </div>

            <div>
              <Label htmlFor="location_address">Location Address/URL</Label>
              <Input
                id="location_address"
                value={newMatch.location_address}
                onChange={(e) => setNewMatch({ ...newMatch, location_address: e.target.value })}
                placeholder="Full address or Google Maps URL"
              />
            </div>

            <div>
              <Label>Location Image</Label>
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "url" | "file")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <Input
                    value={newMatch.location_image}
                    onChange={(e) => setNewMatch({ ...newMatch, location_image: e.target.value })}
                    placeholder="https://example.com/field.jpg"
                  />
                </TabsContent>
                <TabsContent value="file">
                  <div className="flex items-center space-x-2">
                    <Input type="file" accept="image/*" onChange={handleFileUpload} />
                    <Upload className="w-4 h-4 text-gray-500" />
                  </div>
                </TabsContent>
              </Tabs>

              {newMatch.location_image && (
                <div className="mt-3">
                  <Label className="text-sm text-gray-600">Preview:</Label>
                  <div className="mt-2">
                    <img
                      src={newMatch.location_image || "/placeholder.svg"}
                      alt="Location preview"
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        console.log("Location image failed to load:", newMatch.location_image)
                        e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="day">Day of Week</Label>
              <Select onValueChange={(value) => setNewMatch({ ...newMatch, day: value })} value={newMatch.day}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monday">Monday</SelectItem>
                  <SelectItem value="Tuesday">Tuesday</SelectItem>
                  <SelectItem value="Wednesday">Wednesday</SelectItem>
                  <SelectItem value="Thursday">Thursday</SelectItem>
                  <SelectItem value="Friday">Friday</SelectItem>
                  <SelectItem value="Saturday">Saturday</SelectItem>
                  <SelectItem value="Sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={newMatch.recurring}
                onCheckedChange={(checked) => setNewMatch({ ...newMatch, recurring: checked })}
              />
              <Label htmlFor="recurring">Recurring weekly match</Label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <CalendarPlus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Scheduling..." : "Schedule Match"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span>Upcoming Matches ({upcomingMatches.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="flex items-center space-x-4 cursor-pointer flex-1"
                    onClick={() => onSelectMatch(match)}
                  >
                    {/* Location Image Thumbnail */}
                    <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={match.location_image || "/placeholder.svg?height=200&width=400"}
                        alt={match.location}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{match.day} Match</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(match.date).toLocaleDateString()}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{formatTime(match.time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3" />
                          <span>{match.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{match.attendees?.length || 0} going</span>
                      </div>
                      {match.recurring && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Weekly
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditMatch(match)
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMatch(match.id)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span>Completed Matches ({completedMatches.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {completedMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="flex items-center space-x-4 cursor-pointer flex-1"
                    onClick={() => onSelectMatch(match)}
                  >
                    {/* Location Image Thumbnail */}
                    <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={match.location_image || "/placeholder.svg?height=200&width=400"}
                        alt={match.location}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{match.day} Match</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(match.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3 h-3" />
                          <span>{match.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      {match.score && <div className="text-lg font-bold text-gray-900 mb-1">{match.score}</div>}
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditMatch(match)
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMatch(match.id)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
