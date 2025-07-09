"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, User } from "lucide-react"

interface PlayerSearchProps {
  players: any[]
  onSelectPlayer: (player: any) => void
}

export function PlayerSearch({ players, onSelectPlayer }: PlayerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = players.filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPlayers(filtered)
    } else {
      setFilteredPlayers([])
    }
  }, [searchTerm, players])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-9"
          autoFocus
        />
      </div>

      {searchTerm && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-600">
            {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""} found
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                onClick={() => onSelectPlayer(player)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={player.profile_image || "/placeholder.svg"}
                    alt={`${player.name} ${player.surname}`}
                  />
                  <AvatarFallback className="text-sm">
                    {player.name[0]}
                    {player.surname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {player.name} {player.surname}
                  </div>
                  <div className="text-xs text-gray-600">@{player.username}</div>
                  <div className="flex space-x-3 text-xs text-gray-500 mt-1">
                    <span>⚽ {player.goals || 0} goals</span>
                    <span>⭐ {player.mvpCount || 0} MVPs</span>
                  </div>
                </div>
                <Badge variant={player.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {player.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && filteredPlayers.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No players found</p>
        </div>
      )}
    </div>
  )
}
