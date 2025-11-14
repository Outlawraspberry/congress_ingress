export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      actions: {
        Row: {
          created_at: string
          created_by: string
          point: string
          rewarded_experience: number
          strength: number
          type: Database["public"]["Enums"]["task_type"]
        }
        Insert: {
          created_at?: string
          created_by: string
          point: string
          rewarded_experience?: number
          strength?: number
          type: Database["public"]["Enums"]["task_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          point?: string
          rewarded_experience?: number
          strength?: number
          type?: Database["public"]["Enums"]["task_type"]
        }
        Relationships: [
          {
            foreignKeyName: "tick_task_point_fkey"
            columns: ["point"]
            isOneToOne: false
            referencedRelation: "point"
            referencedColumns: ["id"]
          },
        ]
      }
      faction: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      floors: {
        Row: {
          building_name: string | null
          created_at: string | null
          display_order: number
          id: number
          image_height: number | null
          image_width: number | null
          is_active: boolean | null
          map_image_url: string
          name: string
          updated_at: string | null
        }
        Insert: {
          building_name?: string | null
          created_at?: string | null
          display_order?: number
          id?: number
          image_height?: number | null
          image_width?: number | null
          is_active?: boolean | null
          map_image_url: string
          name: string
          updated_at?: string | null
        }
        Update: {
          building_name?: string | null
          created_at?: string | null
          display_order?: number
          id?: number
          image_height?: number | null
          image_width?: number | null
          is_active?: boolean | null
          map_image_url?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      game: {
        Row: {
          attack_ap_cost: number
          claim_ap_cost: number
          group_attack_multiplier_per_user: number
          group_repair_multiplier_per_user: number
          health_per_point_level: number
          id: number
          max_ap: number
          max_point_level: number
          point_user_kick_timeout_seconds: number
          repair_ap_cost: number
          state: Database["public"]["Enums"]["game-state"]
          upgrade_point_ap_cost: number
          user_base_damage: number
          user_base_repair: number
          user_last_action_timeout_in_seconds: number
          user_max_damage: number
        }
        Insert: {
          attack_ap_cost?: number
          claim_ap_cost?: number
          group_attack_multiplier_per_user?: number
          group_repair_multiplier_per_user?: number
          health_per_point_level?: number
          id?: number
          max_ap?: number
          max_point_level?: number
          point_user_kick_timeout_seconds?: number
          repair_ap_cost?: number
          state?: Database["public"]["Enums"]["game-state"]
          upgrade_point_ap_cost?: number
          user_base_damage?: number
          user_base_repair?: number
          user_last_action_timeout_in_seconds?: number
          user_max_damage?: number
        }
        Update: {
          attack_ap_cost?: number
          claim_ap_cost?: number
          group_attack_multiplier_per_user?: number
          group_repair_multiplier_per_user?: number
          health_per_point_level?: number
          id?: number
          max_ap?: number
          max_point_level?: number
          point_user_kick_timeout_seconds?: number
          repair_ap_cost?: number
          state?: Database["public"]["Enums"]["game-state"]
          upgrade_point_ap_cost?: number
          user_base_damage?: number
          user_base_repair?: number
          user_last_action_timeout_in_seconds?: number
          user_max_damage?: number
        }
        Relationships: []
      }
      point: {
        Row: {
          acquired_by: string | null
          created_at: string
          health: number
          id: string
          level: number
          max_health: number
          name: string
          type: Database["public"]["Enums"]["point_type"]
        }
        Insert: {
          acquired_by?: string | null
          created_at?: string
          health?: number
          id?: string
          level?: number
          max_health?: number
          name: string
          type?: Database["public"]["Enums"]["point_type"]
        }
        Update: {
          acquired_by?: string | null
          created_at?: string
          health?: number
          id?: string
          level?: number
          max_health?: number
          name?: string
          type?: Database["public"]["Enums"]["point_type"]
        }
        Relationships: [
          {
            foreignKeyName: "point_acquired_by_fkey"
            columns: ["acquired_by"]
            isOneToOne: false
            referencedRelation: "faction"
            referencedColumns: ["id"]
          },
        ]
      }
      point_discoveries: {
        Row: {
          discovered_at: string | null
          id: string
          point_id: string
          user_id: string
        }
        Insert: {
          discovered_at?: string | null
          id?: string
          point_id: string
          user_id: string
        }
        Update: {
          discovered_at?: string | null
          id?: string
          point_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_discoveries_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "point"
            referencedColumns: ["id"]
          },
        ]
      }
      point_positions: {
        Row: {
          created_at: string | null
          floor_id: number
          id: string
          point_id: string
          updated_at: string | null
          x_coordinate: number
          y_coordinate: number
        }
        Insert: {
          created_at?: string | null
          floor_id: number
          id?: string
          point_id: string
          updated_at?: string | null
          x_coordinate: number
          y_coordinate: number
        }
        Update: {
          created_at?: string | null
          floor_id?: number
          id?: string
          point_id?: string
          updated_at?: string | null
          x_coordinate?: number
          y_coordinate?: number
        }
        Relationships: [
          {
            foreignKeyName: "point_positions_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_positions_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: true
            referencedRelation: "point"
            referencedColumns: ["id"]
          },
        ]
      }
      point_tick_archive: {
        Row: {
          acquired_by: string | null
          created_at: string
          health: number | null
          point_id: string
        }
        Insert: {
          acquired_by?: string | null
          created_at?: string
          health?: number | null
          point_id: string
        }
        Update: {
          acquired_by?: string | null
          created_at?: string
          health?: number | null
          point_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tick_point_acquired_by_fkey"
            columns: ["acquired_by"]
            isOneToOne: false
            referencedRelation: "faction"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tick_point_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "point"
            referencedColumns: ["id"]
          },
        ]
      }
      point_user: {
        Row: {
          created_at: string
          point_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          point_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          point_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_user_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "point"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_user_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          solved: boolean
          task: Json
          type: Database["public"]["Enums"]["puzzle-type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          solved?: boolean
          task: Json
          type: Database["public"]["Enums"]["puzzle-type"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          solved?: boolean
          task?: Json
          type?: Database["public"]["Enums"]["puzzle-type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      puzzle_config: {
        Row: {
          ap_gain: number
          timeout: number
          type: Database["public"]["Enums"]["puzzle-type"]
        }
        Insert: {
          ap_gain?: number
          timeout: number
          type: Database["public"]["Enums"]["puzzle-type"]
        }
        Update: {
          ap_gain?: number
          timeout?: number
          type?: Database["public"]["Enums"]["puzzle-type"]
        }
        Relationships: []
      }
      puzzle_result: {
        Row: {
          created_at: string
          id: string
          result: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          result: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          result?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_result_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "puzzle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_result_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name?: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_game_data: {
        Row: {
          action_points: number
          experience: number
          faction_id: string
          last_action: string
          user_id: string
        }
        Insert: {
          action_points?: number
          experience?: number
          faction_id: string
          last_action?: string
          user_id?: string
        }
        Update: {
          action_points?: number
          experience?: number
          faction_id?: string
          last_action?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_game_data_faction_id_fkey"
            columns: ["faction_id"]
            isOneToOne: false
            referencedRelation: "faction"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_game_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role: {
        Row: {
          role: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Insert: {
          role?: Database["public"]["Enums"]["role"]
          user_id?: string
        }
        Update: {
          role?: Database["public"]["Enums"]["role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_max_health_for_level: {
        Args: { point_level: number }
        Returns: number
      }
      can_upgrade_point: {
        Args: { p_point_id: string; p_user_id: string }
        Returns: boolean
      }
      can_user_afford_action: {
        Args: {
          a_action_type: Database["public"]["Enums"]["task_type"]
          a_user_id: string
        }
        Returns: boolean
      }
      can_user_perform_action_on_point: {
        Args: { a_poind_id: string; a_user_id: string }
        Returns: boolean
      }
      create_point_archive_snapshot: { Args: never; Returns: undefined }
      does_username_exists: { Args: { a_username: string }; Returns: boolean }
      get_all_ap_costs: {
        Args: never
        Returns: {
          attack_and_claim_cost: number
          attack_cost: number
          claim_cost: number
          repair_cost: number
        }[]
      }
      get_ap_cost_for_action: {
        Args: { a_action_type: Database["public"]["Enums"]["task_type"] }
        Returns: number
      }
      get_ap_gain_for_puzzle_type: {
        Args: { a_puzzle_type: Database["public"]["Enums"]["puzzle-type"] }
        Returns: number
      }
      get_attack_damage_for_point: {
        Args: { a_mapping_id: string }
        Returns: number
      }
      get_attack_damage_for_point_based_on_faction: {
        Args: { a_user_id: string }
        Returns: number
      }
      get_count_of_active_users_at_point: {
        Args: { a_mapping_id: string }
        Returns: number
      }
      get_count_of_active_users_at_point_and_faction: {
        Args: { a_faction_id: string; a_point_id: string }
        Returns: number
      }
      get_count_of_active_users_at_point_by_user_id: {
        Args: { a_user_id: string }
        Returns: number
      }
      get_faction_statistics: {
        Args: never
        Returns: {
          average_experience: number
          faction_id: string
          faction_name: string
          points_controlled: number
          total_experience: number
          total_historical_claims: number
          total_members: number
        }[]
      }
      get_floor_points_with_discovery: {
        Args: { p_floor_id: number; p_user_id: string }
        Returns: {
          faction_id: string
          is_discovered: boolean
          point_health: number
          point_id: string
          point_level: number
          point_max_health: number
          point_name: string
          point_type: Database["public"]["Enums"]["point_type"]
          x_coordinate: number
          y_coordinate: number
        }[]
      }
      get_health_per_point_level: { Args: never; Returns: number }
      get_max_action_points: { Args: never; Returns: number }
      get_max_point_level: { Args: never; Returns: number }
      get_point_history: {
        Args: { target_point_id: string }
        Returns: {
          created_at: string
          duration_held: unknown
          faction_id: string
          faction_name: string
          health: number
        }[]
      }
      get_points_overview: {
        Args: never
        Returns: {
          current_claim_duration: unknown
          current_faction_id: string
          current_faction_name: string
          current_health: number
          max_health: number
          point_id: string
          point_name: string
          total_claims_count: number
        }[]
      }
      get_timeout_for_puzzle: {
        Args: { a_type: Database["public"]["Enums"]["puzzle-type"] }
        Returns: number
      }
      get_top_users_by_experience: {
        Args: { limit_count?: number }
        Returns: {
          experience: number
          faction_id: string
          faction_name: string
          last_action: string
          user_id: string
          username: string
        }[]
      }
      get_upgrade_point_ap_cost: { Args: never; Returns: number }
      get_user_ap_info: {
        Args: { a_user_id: string }
        Returns: {
          current_ap: number
          max_ap: number
        }[]
      }
      get_user_current_ap: { Args: { a_user_id: string }; Returns: number }
      get_user_discoveries: {
        Args: { p_user_id: string }
        Returns: {
          discovered_at: string
          point_id: string
        }[]
      }
      has_user_discovered_point: {
        Args: { p_point_id: string; p_user_id: string }
        Returns: boolean
      }
      insert_puzzle: {
        Args: {
          a_task: Json
          a_type: Database["public"]["Enums"]["puzzle-type"]
          a_user_id: string
        }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          solved: boolean
          task: Json
          type: Database["public"]["Enums"]["puzzle-type"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "puzzle"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_puzzle_solved: { Args: { a_puzzle_id: string }; Returns: boolean }
      kick_users_from_point_user: { Args: never; Returns: undefined }
      perform_attack_on_point: {
        Args: { point_id: string }
        Returns: undefined
      }
      spend_ap_for_action: {
        Args: {
          a_action_type: Database["public"]["Enums"]["task_type"]
          a_user_id: string
        }
        Returns: undefined
      }
      upgrade_point: {
        Args: { p_point_id: string; p_user_id: string }
        Returns: Json
      }
      user_has_enough_ap: {
        Args: {
          a_action_type: Database["public"]["Enums"]["task_type"]
          a_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      "game-state": "playing" | "paused"
      point_type: "claimable" | "not_claimable" | "mini_game"
      "puzzle-type": "math" | "lights-off"
      role: "user" | "admin"
      task_type: "attack" | "attack_and_claim" | "repair" | "claim" | "upgrade"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      "game-state": ["playing", "paused"],
      point_type: ["claimable", "not_claimable", "mini_game"],
      "puzzle-type": ["math", "lights-off"],
      role: ["user", "admin"],
      task_type: ["attack", "attack_and_claim", "repair", "claim", "upgrade"],
    },
  },
} as const

