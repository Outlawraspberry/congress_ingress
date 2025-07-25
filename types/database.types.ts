export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      actions: {
        Row: {
          created_at: string
          created_by: string
          point: string
          type: Database["public"]["Enums"]["task_type"]
        }
        Insert: {
          created_at?: string
          created_by: string
          point: string
          type: Database["public"]["Enums"]["task_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          point?: string
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
      game: {
        Row: {
          id: number
          state: Database["public"]["Enums"]["game-state"]
        }
        Insert: {
          id?: number
          state?: Database["public"]["Enums"]["game-state"]
        }
        Update: {
          id?: number
          state?: Database["public"]["Enums"]["game-state"]
        }
        Relationships: []
      }
      point: {
        Row: {
          acquired_by: string | null
          created_at: string
          health: number
          id: string
          max_health: number
          name: string
        }
        Insert: {
          acquired_by?: string | null
          created_at?: string
          health?: number
          id?: string
          max_health?: number
          name: string
        }
        Update: {
          acquired_by?: string | null
          created_at?: string
          health?: number
          id?: string
          max_health?: number
          name?: string
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
          faction_id: string | null
          last_action: string | null
          user_id: string
        }
        Insert: {
          faction_id?: string | null
          last_action?: string | null
          user_id?: string
        }
        Update: {
          faction_id?: string | null
          last_action?: string | null
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
      check_if_user_already_added_a_task_for_current_tick: {
        Args: { a_user_id: string }
        Returns: boolean
      }
      does_point_exists: {
        Args: { a_point_id: string }
        Returns: boolean
      }
      get_all_points_for_current_tick: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      get_all_users_for_current_tick: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      get_current_tick: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      select_point_at_current_tick: {
        Args: { p_point_id: string }
        Returns: Record<string, unknown>
      }
      select_point_states_of_current_tick: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      select_point_states_of_tick: {
        Args: { a_tick: number }
        Returns: Record<string, unknown>[]
      }
      select_task_of_current_tick: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
    }
    Enums: {
      "game-state": "playing" | "paused"
      "puzzle-type": "math"
      role: "user" | "admin"
      task_type: "attack" | "attack_and_claim" | "repair" | "claim"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      "game-state": ["playing", "paused"],
      "puzzle-type": ["math"],
      role: ["user", "admin"],
      task_type: ["attack", "attack_and_claim", "repair", "claim"],
    },
  },
} as const

