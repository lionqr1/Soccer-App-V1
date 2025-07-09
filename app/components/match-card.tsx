"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Calendar, Clock, Users, Check, Star, Trophy, AlertTriangle } from "lucide-react"

interface MatchCardProps {
  match: any
  currentUser: any
  onRSVP: (matchId: string, attending: boolean) => void
  isNext?: boolean
}

// Add this helper function at the top of the component
const formatTime = (time: string) => {
  if (!time) return ""

  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function MatchCard({ match, currentUser, onRSVP, isNext = false }: MatchCardProps) {
  const isAttending = match.attendees?.some((a: any) => a.id === currentUser.id)
  const attendeeCount = match.attendees?.length || 0
  const playingCount = match.attendees?.filter((a) => !a.injured).length || 0
  const watchingCount = match.attendees?.filter((a) => a.injured).length || 0

  return (
    <Card
      className={`overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
        isNext ? "ring-2 ring-green-500 bg-gradient-to-r from-green-50 to-white" : "bg-white"
      }`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{match.day} Match</h3>
              {match.recurring && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Weekly
                </Badge>
              )}
              {isNext && <Badge className="bg-green-600 text-xs font-semibold">Next Match</Badge>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-medium">
                  {new Date(match.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{formatTime(match.time)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="truncate font-medium">{match.location}</span>
              </div>
            </div>
          </div>

          {/* Score Section */}
          {match.status === "completed" && match.score && (
            <div className="text-center bg-gray-50 rounded-lg p-3 min-w-[80px]">
              <div className="text-2xl font-bold text-gray-900 mb-1">{match.score}</div>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Trophy className="w-3 h-3 mr-1" />
                Full Time
              </div>
            </div>
          )}
        </div>

        {/* MVP Badge */}
        {match.mvp && (
          <div className="flex items-center space-x-2 mb-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">
              MVP: {match.mvp.name} {match.mvp.surname}
            </span>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {playingCount} playing
                {watchingCount > 0 && `, ${watchingCount} watching`}
              </span>
            </div>

            {attendeeCount > 0 && (
              <div className="flex -space-x-1">
                {match.attendees?.slice(0, 3).map((attendee: any) => (
                  <div key={attendee.id} className="relative">
                    <Avatar className="w-6 h-6 border-2 border-white">
                      <AvatarImage src={attendee.profile_image || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100">
                        {attendee.name[0]}
                        {attendee.surname[0]}
                      </AvatarFallback>
                    </Avatar>
                    {attendee.injured && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-1.5 h-1.5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {attendeeCount > 3 && (
                  <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">+{attendeeCount - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RSVP Button */}
          {match.status === "upcoming" && (
            <Button
              variant={isAttending ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRSVP(match.id, !isAttending)
              }}
              className={`h-8 px-4 font-medium ${
                isAttending
                  ? currentUser.injured
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                  : "border-green-600 text-green-600 hover:bg-green-50"
              }`}
            >
              <Check className="w-3 h-3 mr-1" />
              {isAttending ? (currentUser.injured ? "Watching" : "Playing") : "Join"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
