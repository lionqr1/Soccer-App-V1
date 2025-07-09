import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://vhdhbpvzckbaxxmlcxjm.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZGhicHZ6Y2tiYXh4bWxjeGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTMyNTEsImV4cCI6MjA2NTQ4OTI1MX0.gBhg_5YcJTHzMNVeF-4lZ9TVpYRYqeUU8y_OAfotUaM"

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Player {
  id: string
  username: string
  password: string
  name: string
  surname: string
  role: "admin" | "player"
  profile_image?: string
  injured?: boolean
  injury_date?: string
  created_at: string
}

export interface Match {
  id: string
  date: string
  time: string
  location: string
  location_image?: string
  location_address?: string
  day: string
  recurring: boolean
  score?: string
  full_time: boolean
  video_highlight?: string
  mvp_player_id?: string
  status: "upcoming" | "completed"
  created_at: string
}

export interface MatchAttendance {
  id: string
  match_id: string
  player_id: string
  attending: boolean
  created_at: string
}

export interface InjuredPlayer {
  id: string
  player_id: string
  injury_date: string
  recovery_date?: string
  description?: string
  created_at: string
}
