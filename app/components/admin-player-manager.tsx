"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageCropper } from "./image-cropper"
import { UserPlus, Users, Search, Edit, Trash2, AlertTriangle, Crop } from "lucide-react"

interface AdminPlayerManagerProps {
  players: any[]
  onAddPlayer: (player: any) => void
  onUpdatePlayer: (playerId: string, updates: any) => void
  onDeletePlayer?: (playerId: string) => void
  onSelectPlayer: (player: any) => void
  onRefreshData: () => void
}

export function AdminPlayerManager({
  players,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onSelectPlayer,
  onRefreshData,
}: AdminPlayerManagerProps) {
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
    profile_image: "",
    injured: false,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url")
  const [editUploadMethod, setEditUploadMethod] = useState<"url" | "file">("url")
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [showEditCropper, setShowEditCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState("")

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const playerData = {
        name: newPlayer.name.trim(),
        surname: newPlayer.surname.trim(),
        username: newPlayer.username.trim(),
        password: newPlayer.password,
        profile_image: newPlayer.profile_image || "",
        injured: newPlayer.injured || false,
        role: "player" as const,
      }

      console.log("Adding player with data:", playerData)
      await onAddPlayer(playerData)

      setNewPlayer({
        name: "",
        surname: "",
        username: "",
        password: "",
        profile_image: "",
        injured: false,
      })

      alert("Player added successfully!")
    } catch (error) {
      console.error("Error adding player:", error)
      alert(`Error adding player: ${error.message || "Please try again."}`)
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
        setTempImageUrl(result)
        setShowCropper(true)
      }
      reader.onerror = () => {
        alert("Error reading file. Please try again.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditPlayer = (player: any) => {
    setEditingPlayer({ ...player })
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
        setTempImageUrl(result)
        setShowEditCropper(true)
      }
      reader.onerror = () => {
        alert("Error reading file. Please try again.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setNewPlayer({ ...newPlayer, profile_image: croppedImage })
    setShowCropper(false)
    setTempImageUrl("")
  }

  const handleEditCropComplete = (croppedImage: string) => {
    setEditingPlayer({ ...editingPlayer, profile_image: croppedImage })
    setShowEditCropper(false)
    setTempImageUrl("")
  }

  const handleSaveEdit = async () => {
    if (editingPlayer && !isSubmitting) {
      setIsSubmitting(true)
      try {
        const updateData = {
          name: editingPlayer.name?.trim() || "",
          surname: editingPlayer.surname?.trim() || "",
          username: editingPlayer.username?.trim() || "",
          profile_image: editingPlayer.profile_image || "",
          injured: editingPlayer.injured || false,
        }

        console.log("Updating player with data:", updateData)
        await onUpdatePlayer(editingPlayer.id, updateData)
        setEditingPlayer(null)
        alert("Player updated successfully!")
      } catch (error) {
        console.error("Error updating player:", error)
        alert(`Error updating player: ${error.message || "Please try again."}`)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDeletePlayer = (playerId: string, playerRole: string) => {
    if (playerRole === "admin") {
      alert("Admin accounts cannot be deleted for security reasons.")
      return
    }

    if (confirm("Are you sure you want to delete this player?")) {
      onDeletePlayer?.(playerId)
    }
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const regularPlayers = filteredPlayers.filter((p) => !p.injured)
  const injuredPlayers = filteredPlayers.filter((p) => p.injured)

  // Show image cropper
  if (showCropper) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/50 fixed inset-0 z-50">
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false)
            setTempImageUrl("")
          }}
        />
      </div>
    )
  }

  if (showEditCropper) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black/50 fixed inset-0 z-50">
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleEditCropComplete}
          onCancel={() => {
            setShowEditCropper(false)
            setTempImageUrl("")
          }}
        />
      </div>
    )
  }

  if (editingPlayer) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={editingPlayer.profile_image || "/placeholder.svg"}
                  alt={`${editingPlayer.name} ${editingPlayer.surname}`}
                  onError={(e) => {
                    console.log("Image failed to load:", editingPlayer.profile_image)
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <AvatarFallback className="text-2xl font-bold">
                  {editingPlayer.name?.[0] || "?"}
                  {editingPlayer.surname?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">First Name</Label>
                <Input
                  id="edit-name"
                  value={editingPlayer.name || ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-surname">Last Name</Label>
                <Input
                  id="edit-surname"
                  value={editingPlayer.surname || ""}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, surname: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editingPlayer.username || ""}
                onChange={(e) => setEditingPlayer({ ...editingPlayer, username: e.target.value })}
              />
            </div>

            {/* Profile Picture Upload for Edit */}
            <div>
              <Label>Profile Picture</Label>
              <Tabs value={editUploadMethod} onValueChange={(value) => setEditUploadMethod(value as "url" | "file")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="file">Upload & Crop</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <Input
                    value={editingPlayer.profile_image || ""}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, profile_image: e.target.value })}
                    placeholder="https://example.com/profile.jpg"
                  />
                </TabsContent>
                <TabsContent value="file">
                  <div className="flex items-center space-x-2">
                    <Input type="file" accept="image/*" onChange={handleEditFileUpload} key={editingPlayer.id} />
                    <Crop className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload an image to crop and resize</p>
                </TabsContent>
              </Tabs>

              {/* Profile Picture Preview for Edit */}
              {editingPlayer.profile_image && (
                <div className="mt-3">
                  <Label className="text-sm text-gray-600">Preview:</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={editingPlayer.profile_image || "/placeholder.svg"}
                        alt="Profile preview"
                        onError={(e) => {
                          console.log("Preview image failed to load:", editingPlayer.profile_image)
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      <AvatarFallback>
                        {editingPlayer.name?.[0] || "?"}
                        {editingPlayer.surname?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">Profile picture preview</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-injured"
                checked={editingPlayer.injured || false}
                onCheckedChange={(checked) => setEditingPlayer({ ...editingPlayer, injured: checked })}
              />
              <Label htmlFor="edit-injured" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Mark as injured</span>
              </Label>
            </div>

            {editingPlayer.injured && editingPlayer.injury_date && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Injured since:</strong> {new Date(editingPlayer.injury_date).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSaveEdit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingPlayer(null)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Player Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>Add New Player</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPlayer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  value={newPlayer.surname}
                  onChange={(e) => setNewPlayer({ ...newPlayer, surname: e.target.value })}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newPlayer.username}
                  onChange={(e) => setNewPlayer({ ...newPlayer, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPlayer.password}
                  onChange={(e) => setNewPlayer({ ...newPlayer, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <Label>Profile Picture</Label>
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "url" | "file")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="file">Upload & Crop</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <Input
                    value={newPlayer.profile_image}
                    onChange={(e) => setNewPlayer({ ...newPlayer, profile_image: e.target.value })}
                    placeholder="https://example.com/profile.jpg"
                  />
                </TabsContent>
                <TabsContent value="file">
                  <div className="flex items-center space-x-2">
                    <Input type="file" accept="image/*" onChange={handleFileUpload} />
                    <Crop className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload an image to crop and resize</p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="injured"
                checked={newPlayer.injured}
                onCheckedChange={(checked) => setNewPlayer({ ...newPlayer, injured: checked })}
              />
              <Label htmlFor="injured" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Mark as injured</span>
              </Label>
            </div>

            {/* Profile Picture Preview */}
            {newPlayer.profile_image && (
              <div className="mt-3">
                <Label className="text-sm text-gray-600">Preview:</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={newPlayer.profile_image || "/placeholder.svg"}
                      alt="Profile preview"
                      onError={(e) => {
                        console.log("Preview image failed to load:", newPlayer.profile_image)
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <AvatarFallback>
                      {newPlayer.name[0] || "?"}
                      {newPlayer.surname[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">Profile picture preview</span>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <UserPlus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Adding Player..." : "Add Player"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>All Players ({players.length})</span>
            </div>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Players ({regularPlayers.length})</TabsTrigger>
              <TabsTrigger value="injured">Injured Players ({injuredPlayers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-4">
              {regularPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectPlayer(player)}>
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={player.profile_image || "/placeholder.svg"}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      <AvatarFallback>
                        {player.name?.[0] || "?"}
                        {player.surname?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {player.name} {player.surname}
                      </div>
                      <div className="text-sm text-gray-600">@{player.username}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={player.role === "admin" ? "default" : "secondary"}>{player.role}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEditPlayer(player)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {player.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlayer(player.id, player.role)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="injured" className="space-y-3 mt-4">
              {injuredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectPlayer(player)}>
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={player.profile_image || "/placeholder.svg"}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <AvatarFallback>
                          {player.name?.[0] || "?"}
                          {player.surname?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {player.name} {player.surname}
                      </div>
                      <div className="text-sm text-red-600">
                        @{player.username} • Injured
                        {player.injury_date && (
                          <span className="text-xs block text-red-500">
                            Since {new Date(player.injury_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={player.role === "admin" ? "default" : "secondary"}>{player.role}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEditPlayer(player)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {player.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlayer(player.id, player.role)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No players found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
