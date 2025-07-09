import { supabase, type Player, type Match, type InjuredPlayer } from "./supabase"

export class DatabaseService {
  // Player operations
  static async getPlayers(): Promise<Player[]> {
    const { data, error } = await supabase.from("players").select("*").order("name")

    if (error) throw error
    return data || []
  }

  static async createPlayer(player: Omit<Player, "id" | "created_at">): Promise<Player> {
    const playerData = {
      ...player,
      injured: player.injured || false,
      injury_date: player.injured ? new Date().toISOString() : null,
      profile_image: player.profile_image || "",
    }

    console.log("Creating player with data:", playerData)

    const { data, error } = await supabase.from("players").insert([playerData]).select().single()

    if (error) {
      console.error("Database error creating player:", error)
      throw error
    }

    // If player is marked as injured during creation, add to injury history
    if (playerData.injured) {
      await this.addInjuryRecord(data.id, "Initial injury status")
    }

    return data
  }

  static async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    const currentPlayer = await this.getPlayerById(id)
    if (!currentPlayer) throw new Error("Player not found")

    // Handle injury status changes
    const playerUpdates: any = { ...updates }

    if (updates.injured !== undefined) {
      playerUpdates.injured = updates.injured
      if (updates.injured && !currentPlayer.injured) {
        // Player is being marked as injured
        playerUpdates.injury_date = new Date().toISOString()
        // Add injury record
        await this.addInjuryRecord(id, "Marked as injured by admin")
      } else if (!updates.injured && currentPlayer.injured) {
        // Player is recovering
        playerUpdates.injury_date = null
        // Mark recovery in injury history
        await this.markRecovery(id)
      }
    }

    console.log("Updating player with data:", playerUpdates)

    const { data, error } = await supabase.from("players").update(playerUpdates).eq("id", id).select().single()

    if (error) {
      console.error("Database error updating player:", error)
      throw error
    }
    return data
  }

  static async getPlayerById(id: string): Promise<Player | null> {
    const { data, error } = await supabase.from("players").select("*").eq("id", id).single()

    if (error) return null
    return data
  }

  static async deletePlayer(id: string): Promise<void> {
    // First check if the player is an admin
    const player = await this.getPlayerById(id)
    if (player?.role === "admin") {
      throw new Error("Admin accounts cannot be deleted for security reasons.")
    }

    const { error } = await supabase.from("players").delete().eq("id", id)

    if (error) throw error
  }

  static async authenticatePlayer(username: string, password: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    if (error) return null
    return data
  }

  // Team operations
  static async getTeams(): Promise<any[]> {
    const { data, error } = await supabase
      .from("teams")
      .select(`
        *,
        players:team_players(
          id,
          position,
          jersey_number,
          player:players(*)
        )
      `)
      .order("name")

    if (error) throw error

    // Transform the data to flatten player information
    return (data || []).map((team) => ({
      ...team,
      players:
        team.players?.map((tp: any) => ({
          ...tp.player,
          position: tp.position,
          jersey_number: tp.jersey_number,
          team_player_id: tp.id,
        })) || [],
    }))
  }

  static async createTeam(team: any): Promise<any> {
    const { data, error } = await supabase.from("teams").insert([team]).select().single()

    if (error) throw error
    return data
  }

  static async updateTeam(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase.from("teams").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase.from("teams").delete().eq("id", id)

    if (error) throw error
  }

  static async addPlayerToTeam(
    teamId: string,
    playerId: string,
    position: string,
    jerseyNumber: number,
  ): Promise<void> {
    const { error } = await supabase.from("team_players").insert([
      {
        team_id: teamId,
        player_id: playerId,
        position,
        jersey_number: jerseyNumber,
      },
    ])

    if (error) throw error
  }

  static async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    const { error } = await supabase.from("team_players").delete().eq("team_id", teamId).eq("player_id", playerId)

    if (error) throw error
  }

  // Injury management
  static async addInjuryRecord(playerId: string, description?: string): Promise<InjuredPlayer> {
    const { data, error } = await supabase
      .from("injured_players")
      .insert([
        {
          player_id: playerId,
          description: description || "No description provided",
          injury_date: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async markRecovery(playerId: string): Promise<void> {
    // Find the most recent injury record without recovery date
    const { data: injuryRecord, error: findError } = await supabase
      .from("injured_players")
      .select("*")
      .eq("player_id", playerId)
      .is("recovery_date", null)
      .order("injury_date", { ascending: false })
      .limit(1)
      .single()

    if (findError || !injuryRecord) return

    // Mark recovery
    const { error } = await supabase
      .from("injured_players")
      .update({ recovery_date: new Date().toISOString() })
      .eq("id", injuryRecord.id)

    if (error) throw error
  }

  static async getInjuryHistory(playerId: string): Promise<InjuredPlayer[]> {
    const { data, error } = await supabase
      .from("injured_players")
      .select("*")
      .eq("player_id", playerId)
      .order("injury_date", { ascending: false })

    if (error) throw error
    return data || []
  }

  // Match operations
  static async getMatches(): Promise<Match[]> {
    const { data, error } = await supabase.from("matches").select("*").order("date", { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createMatch(match: Omit<Match, "id" | "created_at">): Promise<Match> {
    const matchData = {
      ...match,
      location_image: match.location_image || "/placeholder.svg?height=200&width=400",
      location_address: match.location_address || "",
    }

    console.log("Creating match with data:", matchData)

    const { data, error } = await supabase.from("matches").insert([matchData]).select().single()

    if (error) {
      console.error("Database error creating match:", error)
      throw error
    }
    return data
  }

  static async updateMatch(id: string, updates: any): Promise<Match> {
    // Handle complex updates that might include nested objects
    const matchUpdates: any = {}

    // Handle basic fields
    if (updates.score !== undefined) matchUpdates.score = updates.score
    if (updates.status !== undefined) matchUpdates.status = updates.status
    if (updates.full_time !== undefined) matchUpdates.full_time = updates.full_time
    if (updates.video_highlight !== undefined) matchUpdates.video_highlight = updates.video_highlight
    if (updates.location_image !== undefined) matchUpdates.location_image = updates.location_image
    if (updates.location_address !== undefined) matchUpdates.location_address = updates.location_address
    if (updates.date !== undefined) matchUpdates.date = updates.date
    if (updates.time !== undefined) matchUpdates.time = updates.time
    if (updates.location !== undefined) matchUpdates.location = updates.location
    if (updates.day !== undefined) matchUpdates.day = updates.day
    if (updates.recurring !== undefined) matchUpdates.recurring = updates.recurring
    if (updates.is_live !== undefined) matchUpdates.is_live = updates.is_live
    if (updates.home_team_id !== undefined) matchUpdates.home_team_id = updates.home_team_id
    if (updates.away_team_id !== undefined) matchUpdates.away_team_id = updates.away_team_id

    // Handle stream viewers (store as JSON)
    if (updates.stream_viewers !== undefined) {
      matchUpdates.stream_viewers = JSON.stringify(updates.stream_viewers)
    }

    // Handle MVP - extract just the ID if it's an object
    if (updates.mvp !== undefined) {
      matchUpdates.mvp_player_id = updates.mvp?.id || updates.mvp || null
    }

    // Handle goal scorers
    if (updates.goal_scorers !== undefined) {
      matchUpdates.goal_scorers = JSON.stringify(updates.goal_scorers.map((scorer: any) => scorer.id))
    }

    const { data, error } = await supabase.from("matches").update(matchUpdates).eq("id", id).select().single()

    if (error) {
      console.error("Database error updating match:", error)
      throw error
    }
    return data
  }

  static async deleteMatch(id: string): Promise<void> {
    // First delete all attendance records for this match
    await supabase.from("match_attendance").delete().eq("match_id", id)

    // Then delete the match
    const { error } = await supabase.from("matches").delete().eq("id", id)

    if (error) throw error
  }

  // Match attendance operations
  static async getMatchAttendance(matchId: string): Promise<any[]> {
    const { data, error } = await supabase.from("match_attendance").select("*").eq("match_id", matchId)

    if (error) throw error
    return data || []
  }

  static async updateAttendance(matchId: string, playerId: string, attending: boolean): Promise<void> {
    // First, try to update existing record
    const { data: existingRecord, error: selectError } = await supabase
      .from("match_attendance")
      .select("*")
      .eq("match_id", matchId)
      .eq("player_id", playerId)
      .single()

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new records
      throw selectError
    }

    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from("match_attendance")
        .update({ attending })
        .eq("match_id", matchId)
        .eq("player_id", playerId)

      if (error) throw error
    } else {
      // Insert new record
      const { error } = await supabase.from("match_attendance").insert({
        match_id: matchId,
        player_id: playerId,
        attending,
      })

      if (error) throw error
    }
  }

  // Get matches with attendance - FIXED VERSION
  static async getMatchesWithAttendance(): Promise<any[]> {
    // Get matches first
    const matches = await this.getMatches()
    const players = await this.getPlayers()
    const teams = await this.getTeams()

    // Process each match individually
    const matchesWithAttendance = await Promise.all(
      matches.map(async (match) => {
        // Get attendance for this match
        const attendance = await this.getMatchAttendance(match.id)

        // Get attendees by filtering attendance and mapping to players
        const attendees = attendance
          .filter((a) => a.attending)
          .map((a) => {
            const player = players.find((p) => p.id === a.player_id)
            return player ? { ...player } : null
          })
          .filter(Boolean)

        // Get MVP player if exists
        const mvp = match.mvp_player_id ? players.find((p) => p.id === match.mvp_player_id) : null

        // Get injured players for this match
        const injuredPlayers = players.filter((p) => p.injured)

        // Parse goal scorers and assists from JSON
        let goalScorers = []
        let assists = []

        try {
          if (match.goal_scorers) {
            const goalScorerIds = JSON.parse(match.goal_scorers)
            goalScorers = goalScorerIds.map((id: string) => players.find((p) => p.id === id)).filter(Boolean)
          }
        } catch (e) {
          goalScorers = []
        }

        try {
          if (match.assists) {
            const assistIds = JSON.parse(match.assists)
            assists = assistIds.map((id: string) => players.find((p) => p.id === id)).filter(Boolean)
          }
        } catch (e) {
          assists = []
        }

        // Parse stream viewers
        let streamViewers = []
        try {
          streamViewers = match.stream_viewers ? JSON.parse(match.stream_viewers) : []
        } catch (e) {
          streamViewers = []
        }

        // Get team information
        const homeTeam = match.home_team_id ? teams.find((t) => t.id === match.home_team_id) : null
        const awayTeam = match.away_team_id ? teams.find((t) => t.id === match.away_team_id) : null

        return {
          ...match,
          attendees,
          mvp,
          goalScorers,
          assists,
          injuredPlayers,
          streamViewers,
          home_team: homeTeam,
          away_team: awayTeam,
        }
      }),
    )

    return matchesWithAttendance
  }
}
