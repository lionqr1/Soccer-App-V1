"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ImageCropper } from "./image-cropper"
import { PlayerComparison } from "./player-comparison"
import {
  ArrowLeft,
  User,
  Camera,
  LogOut,
  Calendar,
  Trophy,
  Target,
  Users,
  TrendingUp,
  Edit2,
  Save,
  X,
  UserCheck,
  UserX,
  AlertTriangle,
  ContrastIcon as Versus,
} from "lucide-react"

interface SettingsProps {
  currentUser: any
  players: any[]
  matches: any[]
  onBack: () => void
  onLogout: () => void
  onUpdateProfile: (playerId: string, updates: any) => void
  onSelectMatch: (match: any) => void
}

export function Settings({
  currentUser,
  players,
  matches,
  onBack,
  onLogout,
  onUpdateProfile,
  onSelectMatch,
}: SettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    surname: currentUser.surname || "",
    username: currentUser.username || "",
    password: "",
    confirmPassword: "",
  })

  // Calculate user statistics
  const userMatches = matches.filter((match) => match.attendees?.some((attendee) => attendee.id === currentUser.id))

  const completedMatches = userMatches.filter((match) => match.status === "completed")
  const totalMatches = userMatches.length
  const attendanceRate = totalMatches > 0 ? (completedMatches.length / totalMatches) * 100 : 0

  // Calculate goals from all matches
  let totalGoals = 0
  matches.forEach((match) => {
    if (match.goalScorers) {
      const playerGoals = match.goalScorers.find((scorer) => scorer.playerId === currentUser.id)
      if (playerGoals) {
        totalGoals += playerGoals.goals
      }
    }
  })

  // Calculate assists from all matches
  let totalAssists = 0
  matches.forEach((match) => {
    if (match.assists) {
      const playerAssists = match.assists.find((assist) => assist.playerId === currentUser.id)
      if (playerAssists) {
        totalAssists += playerAssists.assists
      }
    }
  })

  // Calculate MVP awards
  const mvpAwards = matches.filter((match) => match.mvp?.id === currentUser.id).length

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setShowImageCropper(true)
    }
  }

  const handleImageCrop = async (croppedImageBlob: Blob) => {
    try {
      // Convert blob to base64 for storage
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        await onUpdateProfile(currentUser.id, {
          profile_image: base64String,
        })
        setShowImageCropper(false)
        setSelectedImage(null)
      }
      reader.readAsDataURL(croppedImageBlob)
    } catch (error) {
      console.error("Error updating profile image:", error)
      alert("Error updating profile image. Please try again.")
    }
  }

  const handleSaveProfile = async () => {
    try {
      const updates: any = {
        name: formData.name,
        surname: formData.surname,
        username: formData.username,
      }

      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match!")
          return
        }
        updates.password = formData.password
      }

      await onUpdateProfile(currentUser.id, updates)
      setIsEditing(false)
      setFormData({ ...formData, password: "", confirmPassword: "" })
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setFormData({
      name: currentUser.name || "",
      surname: currentUser.surname || "",
      username: currentUser.username || "",
      password: "",
      confirmPassword: "",
    })
  }

  if (showComparison) {
    return (
      <PlayerComparison
        currentUser={currentUser}
        players={players}
        matches={matches}
        onBack={() => setShowComparison(false)}
      />
    )
  }

  if (showImageCropper && selectedImage) {
    return (
      <ImageCropper
        image={selectedImage}
        onCrop={handleImageCrop}
        onCancel={() => {
          setShowImageCropper(false)
          setSelectedImage(null)
        }}
      />
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
              <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(true)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Versus className="w-4 h-4 mr-2" />
                Compare Players
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-2 ring-white">
                    <AvatarImage
                      src={currentUser.profile_image || "/placeholder.svg"}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <AvatarFallback className="text-2xl font-semibold bg-white">
                      {currentUser.name?.[0] || "?"}
                      {currentUser.surname?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => document.getElementById("profile-image-input")?.click()}
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
                {currentUser.injured && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Injured
                  </Badge>
                )}
              </div>

              {/* Profile Form */}
              <div className="flex-1 space-y-4">
                {!isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="text-lg font-semibold">
                        {currentUser.name} {currentUser.surname}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Username</Label>
                      <p className="text-lg">@{currentUser.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Role</Label>
                      <Badge variant={currentUser.role === "admin" ? "default" : "secondary"}>
                        {currentUser.role === "admin" ? "Administrator" : "Player"}
                      </Badge>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="mt-4">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">First Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="surname">Last Name</Label>
                        <Input
                          id="surname"
                          value={formData.surname}
                          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">New Password (Optional)</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Leave blank to keep current"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{totalGoals}</div>
                <div className="text-sm text-gray-600">Goals</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{totalAssists}</div>
                <div className="text-sm text-gray-600">Assists</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">{mvpAwards}</div>
                <div className="text-sm text-gray-600">MVP Awards</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{completedMatches.length}</div>
                <div className="text-sm text-gray-600">Matches Played</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{Math.round(attendanceRate)}%</div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {userMatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No matches attended yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userMatches.slice(0, 5).map((match) => {
                  const userAttended = match.attendees?.some((attendee) => attendee.id === currentUser.id)
                  return (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => onSelectMatch(match)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${userAttended ? "bg-green-500" : "bg-red-500"}`} />
                        <div>
                          <div className="font-medium">{match.day} Match</div>
                          <div className="text-sm text-gray-600">
                            {new Date(match.date).toLocaleDateString()} • {match.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {match.score && (
                          <Badge variant="secondary" className="text-xs">
                            {match.score}
                          </Badge>
                        )}
                        {userAttended ? (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <UserX className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
