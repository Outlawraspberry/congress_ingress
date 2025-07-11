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
      fraction: {
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
      point: {
        Row: {
          created_at: string
          id: string
          max_health: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_health?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          max_health?: number
          name?: string
        }
        Relationships: []
      }
      public: {
        Row: {
          state: Database["public"]["Enums"]["game-state"]
          tick: number
        }
        Insert: {
          state?: Database["public"]["Enums"]["game-state"]
          tick: number
        }
        Update: {
          state?: Database["public"]["Enums"]["game-state"]
          tick?: number
        }
        Relationships: []
      }
      tick_point: {
        Row: {
          acquired_by: string
          created_at: string
          health: number
          point_id: string
          tick: number
        }
        Insert: {
          acquired_by: string
          created_at?: string
          health: number
          point_id: string
          tick: number
        }
        Update: {
          acquired_by?: string
          created_at?: string
          health?: number
          point_id?: string
          tick?: number
        }
        Relationships: [
          {
            foreignKeyName: "tick_point_acquired_by_fkey"
            columns: ["acquired_by"]
            isOneToOne: false
            referencedRelation: "fraction"
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
      tick_task: {
        Row: {
          created_at: string
          created_by: string
          point: string
          tick: number
          type: Database["public"]["Enums"]["task_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string
          point: string
          tick: number
          type: Database["public"]["Enums"]["task_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          point?: string
          tick?: number
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
      user: {
        Row: {
          fraction: string
          id: string
          name: string
        }
        Insert: {
          fraction: string
          id: string
          name?: string
        }
        Update: {
          fraction?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_fraction_fkey"
            columns: ["fraction"]
            isOneToOne: false
            referencedRelation: "fraction"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      "game-state": "playing" | "paused"
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
      task_type: ["attack", "attack_and_claim", "repair", "claim"],
    },
  },
} as const

