"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Users, MessageCircle, Send, StopCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface LiveStreamProps {
  match: any
  currentUser: any
  players: any[]
  onBack: () => void
  onUpdateScore: (homeScore: number, awayScore: number) => void
  onEndMatch: (finalScore: string) => void
  isAdmin: boolean
}

interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: Date
}

export function LiveStream({
  match,
  currentUser,
  players,
  onBack,
  onUpdateScore,
  onEndMatch,
  isAdmin,
}: LiveStreamProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [selectedScorer, setSelectedScorer] = useState("")
  const [selectedAssist, setSelectedAssist] = useState("")
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [scoringTeam, setScoringTeam] = useState<"home" | "away">("home")
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Parse current score if exists
  useEffect(() => {
    if (match.score) {
      const [home, away] = match.score.split("-").map(Number)
      setHomeScore(home || 0)
      setAwayScore(away || 0)
    }
  }, [match.score])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Simulate viewer count
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setViewerCount(Math.floor(Math.random() * 20) + 5)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isStreaming])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "environment" },
        audio: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      streamRef.current = stream
      setIsStreaming(true)

      // Start recording automatically
      startRecording(stream)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access camera. Please check permissions.")
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    stopRecording()
    setIsStreaming(false)
    setViewerCount(0)
  }

  const startRecording = (stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        downloadRecording()
      }

      mediaRecorder.start(1000) // Record in 1-second chunks
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const downloadRecording = () => {
    if (recordedChunksRef.current.length === 0) return

    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${match.day}-match-${new Date().toISOString().split("T")[0]}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Clear recorded chunks
    recordedChunksRef.current = []
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const handleScoreUpdate = (team: "home" | "away") => {
    setScoringTeam(team)
    setShowScoreDialog(true)
  }

  const confirmScore = () => {
    const newHomeScore = scoringTeam === "home" ? homeScore + 1 : homeScore
    const newAwayScore = scoringTeam === "away" ? awayScore + 1 : awayScore

    setHomeScore(newHomeScore)
    setAwayScore(newAwayScore)
    onUpdateScore(newHomeScore, newAwayScore)

    // Reset dialog
    setShowScoreDialog(false)
    setSelectedScorer("")
    setSelectedAssist("")
  }

  const handleEndMatch = () => {
    if (confirm("Are you sure you want to end the match and stop streaming?")) {
      const finalScore = `${homeScore}-${awayScore}`
      stopStream()
      onEndMatch(finalScore)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      playerId: currentUser.id,
      playerName: `${currentUser.name} ${currentUser.surname}`,
      message: newMessage.trim(),
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{match.day} Match - LIVE</h1>
                <p className="text-sm text-gray-300">{match.location}</p>
              </div>
            </div>

            {isStreaming && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{viewerCount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Scoreboard - Top Left */}
          <div className="absolute top-4 left-4 z-10">
            <Card className="bg-black/70 backdrop-blur-sm border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{homeScore}</div>
                    <div className="text-sm text-gray-300">Home</div>
                  </div>
                  <div className="text-white font-bold">-</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{awayScore}</div>
                    <div className="text-sm text-gray-300">Away</div>
                  </div>
                </div>

                {isAdmin && isStreaming && (
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleScoreUpdate("home")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Home +1
                    </Button>
                    <Button size="sm" onClick={() => handleScoreUpdate("away")} className="bg-red-600 hover:bg-red-700">
                      Away +1
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-red-600 px-3 py-2 rounded-lg flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
              </div>
            </div>
          )}

          {/* Video Stream */}
          <div className="w-full h-full bg-black flex items-center justify-center">
            {isStreaming ? (
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            ) : (
              <div className="text-center">
                <VideoOff className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h2 className="text-xl font-semibold mb-2">Stream Offline</h2>
                <p className="text-gray-400 mb-6">The live stream is not currently active</p>
                {isAdmin && (
                  <Button onClick={startStream} className="bg-red-600 hover:bg-red-700">
                    <Video className="w-4 h-4 mr-2" />
                    Start Live Stream
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Admin Controls */}
          {isAdmin && isStreaming && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVideo}
                  className={`${videoEnabled ? "text-white hover:bg-white/10" : "text-red-500 bg-red-500/20"}`}
                >
                  {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAudio}
                  className={`${audioEnabled ? "text-white hover:bg-white/10" : "text-red-500 bg-red-500/20"}`}
                >
                  {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button onClick={handleEndMatch} className="bg-red-600 hover:bg-red-700">
                  <StopCircle className="w-4 h-4 mr-2" />
                  End Match & Stop Stream
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Live Chat
            </h3>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6 ring-2 ring-white">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-xs bg-white">
                        {msg.playerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-300">{msg.playerName}</span>
                    <span className="text-xs text-gray-500">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-white ml-8">{msg.message}</p>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-h-[40px] max-h-[80px] bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="icon"
                className="self-end bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Dialog */}
      {showScoreDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white text-black">
            <CardHeader>
              <CardTitle>Goal Scored - {scoringTeam === "home" ? "Home" : "Away"} Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Who scored?</label>
                <Select value={selectedScorer} onValueChange={setSelectedScorer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scorer" />
                  </SelectTrigger>
                  <SelectContent>
                    {players
                      .filter((p) => p.role === "player")
                      .map((player) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.name} {player.surname}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Who assisted? (Optional)</label>
                <Select value={selectedAssist} onValueChange={setSelectedAssist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assist or leave empty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No assist</SelectItem>
                    {players
                      .filter((p) => p.role === "player" && p.id.toString() !== selectedScorer)
                      .map((player) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.name} {player.surname}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={confirmScore} disabled={!selectedScorer} className="flex-1">
                  Confirm Goal
                </Button>
                <Button variant="outline" onClick={() => setShowScoreDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
