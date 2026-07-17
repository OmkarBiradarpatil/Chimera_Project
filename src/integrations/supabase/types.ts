export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          owner_id: string
          priority: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          priority?: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          priority?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          case_id: string | null
          citations: Json
          confidence: number | null
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          citations?: Json
          confidence?: number | null
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          citations?: Json
          confidence?: number | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      contradictions: {
        Row: {
          case_id: string
          confidence: number
          description: string | null
          detected_at: string
          evidence_a_excerpt: string | null
          evidence_a_id: string | null
          evidence_b_excerpt: string | null
          evidence_b_id: string | null
          id: string
          severity: string
          status: string
          title: string
        }
        Insert: {
          case_id: string
          confidence?: number
          description?: string | null
          detected_at?: string
          evidence_a_excerpt?: string | null
          evidence_a_id?: string | null
          evidence_b_excerpt?: string | null
          evidence_b_id?: string | null
          id?: string
          severity?: string
          status?: string
          title: string
        }
        Update: {
          case_id?: string
          confidence?: number
          description?: string | null
          detected_at?: string
          evidence_a_excerpt?: string | null
          evidence_a_id?: string | null
          evidence_b_excerpt?: string | null
          evidence_b_id?: string | null
          id?: string
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contradictions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contradictions_evidence_a_id_fkey"
            columns: ["evidence_a_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contradictions_evidence_b_id_fkey"
            columns: ["evidence_b_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          case_id: string
          confidence: number
          created_at: string
          description: string | null
          id: string
          kind: string
          mentions: number
          name: string
        }
        Insert: {
          case_id: string
          confidence?: number
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          mentions?: number
          name: string
        }
        Update: {
          case_id?: string
          confidence?: number
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          mentions?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "entities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          case_id: string
          confidence: number | null
          created_at: string
          entities: string[]
          extracted_text: string | null
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          status: string
          storage_path: string | null
          summary: string | null
          tags: string[]
          type: string
          updated_at: string
          uploader_id: string
        }
        Insert: {
          case_id: string
          confidence?: number | null
          created_at?: string
          entities?: string[]
          extracted_text?: string | null
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          summary?: string | null
          tags?: string[]
          type?: string
          updated_at?: string
          uploader_id: string
        }
        Update: {
          case_id?: string
          confidence?: number | null
          created_at?: string
          entities?: string[]
          extracted_text?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          summary?: string | null
          tags?: string[]
          type?: string
          updated_at?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_chunks: {
        Row: {
          case_id: string
          chunk_index: number
          content: string
          created_at: string
          embedding: unknown
          evidence_id: string
          id: string
        }
        Insert: {
          case_id: string
          chunk_index: number
          content: string
          created_at?: string
          embedding?: unknown
          evidence_id: string
          id?: string
        }
        Update: {
          case_id?: string
          chunk_index?: number
          content?: string
          created_at?: string
          embedding?: unknown
          evidence_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_chunks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_chunks_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          case_id: string
          category: string
          confidence: number
          created_at: string
          description: string | null
          entities: string[]
          evidence_id: string | null
          id: string
          occurred_at: string
          title: string
        }
        Insert: {
          case_id: string
          category?: string
          confidence?: number
          created_at?: string
          description?: string | null
          entities?: string[]
          evidence_id?: string | null
          id?: string
          occurred_at: string
          title: string
        }
        Update: {
          case_id?: string
          category?: string
          confidence?: number
          created_at?: string
          description?: string | null
          entities?: string[]
          evidence_id?: string | null
          id?: string
          occurred_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_evidence_chunks: {
        Args: {
          filter_case_id?: string
          match_count?: number
          query_embedding: unknown
        }
        Returns: {
          case_id: string
          content: string
          evidence_id: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
