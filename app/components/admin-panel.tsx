"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Calendar } from "lucide-react"

interface AdminPanelProps {
  players: any[]
  matches: any[]
  onAddPlayer: (player: any) => void
  onAddMatch: (match: any) => void
  onUpdateMatch: (matchId: string, updates: any) => void
}

export function AdminPanel({ players, matches, onAddPlayer, onAddMatch, onUpdateMatch }: AdminPanelProps) {
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    surname: "",
    username: "",
    password: "",
  })

  const [newMatch, setNewMatch] = useState({
    date: "",
    time: "",
    location: "",
    locationImage: "/placeholder.svg?height=200&width=400",
    day: "",
    recurring: false,
  })

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault()
    onAddPlayer(newPlayer)
    setNewPlayer({
      name: "",
      surname: "",
      username: "",
      password: "",
    })
  }

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault()
    onAddMatch(newMatch)
    setNewMatch({
      date: "",
      time: "",
      location: "",
      locationImage: "/placeholder.svg?height=200&width=400",
      day: "",
      recurring: false,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Admin Panel</h3>
      </div>

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <UserPlus className="w-4 h-4" />
                <span>Add Player</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPlayer} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">
                      First Name
                    </Label>
                    <Input
                      id="name"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname" className="text-sm">
                      Surname
                    </Label>
                    <Input
                      id="surname"
                      value={newPlayer.surname}
                      onChange={(e) => setNewPlayer({ ...newPlayer, surname: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username" className="text-sm">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={newPlayer.username}
                    onChange={(e) => setNewPlayer({ ...newPlayer, username: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newPlayer.password}
                    onChange={(e) => setNewPlayer({ ...newPlayer, password: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>
                <Button type="submit" size="sm" className="w-full">
                  Add Player
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Players ({players.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {players.map((player) => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span>
                      {player.name} {player.surname}
                    </span>
                    <span className="text-xs text-gray-600">@{player.username}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Calendar className="w-4 h-4" />
                <span>Add Match</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMatch} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="date" className="text-sm">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMatch.date}
                      onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time" className="text-sm">
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={newMatch.time}
                      onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                      className="h-9"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={newMatch.location}
                    onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                    placeholder="Enter match location"
                    className="h-9"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="day" className="text-sm">
                    Day of Week
                  </Label>
                  <Select onValueChange={(value) => setNewMatch({ ...newMatch, day: value })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={newMatch.recurring}
                    onCheckedChange={(checked) => setNewMatch({ ...newMatch, recurring: checked })}
                  />
                  <Label htmlFor="recurring" className="text-sm">
                    Recurring match
                  </Label>
                </div>
                <Button type="submit" size="sm" className="w-full">
                  Add Match
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
