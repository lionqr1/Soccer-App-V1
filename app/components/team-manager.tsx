"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Edit, Trash2, Shield } from "lucide-react"

interface TeamManagerProps {
  teams: any[]
  players: any[]
  onCreateTeam: (team: any) => void
  onUpdateTeam: (teamId: string, updates: any) => void
  onDeleteTeam: (teamId: string) => void
  onAddPlayerToTeam: (teamId: string, playerId: string, position: string, jerseyNumber: number) => void
  onRemovePlayerFromTeam: (teamId: string, playerId: string) => void
}

export function TeamManager({
  teams,
  players,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAddPlayerToTeam,
  onRemovePlayerFromTeam,
}: TeamManagerProps) {
  const [newTeam, setNewTeam] = useState({
    name: "",
    logo_url: "",
    color: "#000000",
  })
  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [newPlayer, setNewPlayer] = useState({
    playerId: "",
    position: "",
    jerseyNumber: 1,
  })

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onCreateTeam(newTeam)
      setNewTeam({ name: "", logo_url: "", color: "#000000" })
      alert("Team created successfully!")
    } catch (error) {
      console.error("Error creating team:", error)
      alert("Error creating team. Please try again.")
    }
  }

  const handleUpdateTeam = async () => {
    if (!editingTeam) return
    try {
      await onUpdateTeam(editingTeam.id, {
        name: editingTeam.name,
        logo_url: editingTeam.logo_url,
        color: editingTeam.color,
      })
      setEditingTeam(null)
      alert("Team updated successfully!")
    } catch (error) {
      console.error("Error updating team:", error)
      alert("Error updating team. Please try again.")
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      try {
        await onDeleteTeam(teamId)
      } catch (error) {
        console.error("Error deleting team:", error)
      }
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam || !newPlayer.playerId) return

    try {
      await onAddPlayerToTeam(selectedTeam.id, newPlayer.playerId, newPlayer.position, newPlayer.jerseyNumber)
      setNewPlayer({ playerId: "", position: "", jerseyNumber: 1 })
      alert("Player added to team!")
    } catch (error) {
      console.error("Error adding player to team:", error)
      alert("Error adding player to team. Please try again.")
    }
  }

  const availablePlayers = players.filter((player) => !selectedTeam?.players?.some((tp: any) => tp.id === player.id))

  if (editingTeam) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Team Name</Label>
              <Input
                id="edit-name"
                value={editingTeam.name}
                onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-logo">Logo URL</Label>
              <Input
                id="edit-logo"
                value={editingTeam.logo_url}
                onChange={(e) => setEditingTeam({ ...editingTeam, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Team Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="edit-color"
                  value={editingTeam.color}
                  onChange={(e) => setEditingTeam({ ...editingTeam, color: e.target.value })}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={editingTeam.color}
                  onChange={(e) => setEditingTeam({ ...editingTeam, color: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleUpdateTeam} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingTeam(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedTeam) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedTeam.logo_url || "/placeholder.svg"} />
                  <AvatarFallback style={{ backgroundColor: selectedTeam.color, color: "white" }}>
                    {selectedTeam.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
                  <p className="text-sm text-gray-600">{selectedTeam.players?.length || 0} players</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                Back to Teams
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Add Player to Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Player</Label>
                  <Select onValueChange={(value) => setNewPlayer({ ...newPlayer, playerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} {player.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                    placeholder="e.g., Forward, Midfielder"
                  />
                </div>
                <div>
                  <Label htmlFor="jersey">Jersey Number</Label>
                  <Input
                    id="jersey"
                    type="number"
                    min="1"
                    max="99"
                    value={newPlayer.jerseyNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button type="submit" disabled={!newPlayer.playerId}>
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </form>

            {/* Team Players */}
            <div className="space-y-3">
              <h3 className="font-semibold">Team Roster</h3>
              {selectedTeam.players?.length > 0 ? (
                selectedTeam.players.map((player: any) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                        {player.jersey_number || "?"}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.profile_image || "/placeholder.svg"} />
                        <AvatarFallback>
                          {player.name[0]}
                          {player.surname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {player.name} {player.surname}
                        </div>
                        <div className="text-sm text-gray-600">{player.position || "No position"}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemovePlayerFromTeam(selectedTeam.id, player.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No players in this team yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Team Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Create New Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
                required
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={newTeam.logo_url}
                onChange={(e) => setNewTeam({ ...newTeam, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="color">Team Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="color"
                  value={newTeam.color}
                  onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={newTeam.color}
                  onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span>All Teams ({teams.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length > 0 ? (
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                    onClick={() => setSelectedTeam(team)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={team.logo_url || "/placeholder.svg"} />
                      <AvatarFallback style={{ backgroundColor: team.color, color: "white" }}>
                        {team.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">{team.name}</div>
                      <div className="text-sm text-gray-600">{team.players?.length || 0} players</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingTeam(team)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No teams created yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
