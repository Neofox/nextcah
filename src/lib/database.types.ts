export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          color: string
          deck_id: number
          id: number
          pick: number | null
          text: string
        }
        Insert: {
          color?: string
          deck_id: number
          id?: number
          pick?: number | null
          text: string
        }
        Update: {
          color?: string
          deck_id?: number
          id?: number
          pick?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          }
        ]
      }
      decks: {
        Row: {
          description: string | null
          id: number
          name: string
          official: boolean
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
          official?: boolean
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
          official?: boolean
        }
        Relationships: []
      }
      games: {
        Row: {
          cards_per_round: number
          created_at: string
          current_round: number | null
          id: number
          password: string | null
          player_count: number
          score_goal: number
          time_per_round: number
        }
        Insert: {
          cards_per_round?: number
          created_at?: string
          current_round?: number | null
          id?: number
          password?: string | null
          player_count?: number
          score_goal?: number
          time_per_round?: number
        }
        Update: {
          cards_per_round?: number
          created_at?: string
          current_round?: number | null
          id?: number
          password?: string | null
          player_count?: number
          score_goal?: number
          time_per_round?: number
        }
        Relationships: [
          {
            foreignKeyName: "games_current_round_fkey"
            columns: ["current_round"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          }
        ]
      }
      games_decks: {
        Row: {
          deck_id: number
          game_id: number
        }
        Insert: {
          deck_id: number
          game_id: number
        }
        Update: {
          deck_id?: number
          game_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "games_decks_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_decks_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      games_users: {
        Row: {
          created_at: string
          game_id: number
          id: number
          is_ready: boolean
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: number
          id?: number
          is_ready?: boolean
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: number
          id?: number
          is_ready?: boolean
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_users_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      games_users_cards: {
        Row: {
          card_id: number
          game_user_id: number
        }
        Insert: {
          card_id: number
          game_user_id: number
        }
        Update: {
          card_id?: number
          game_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "games_users_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_users_cards_game_user_id_fkey"
            columns: ["game_user_id"]
            isOneToOne: false
            referencedRelation: "games_users"
            referencedColumns: ["id"]
          }
        ]
      }
      rounds: {
        Row: {
          black_card: number
          created_at: string
          game_id: number
          id: number
        }
        Insert: {
          black_card: number
          created_at?: string
          game_id: number
          id?: number
        }
        Update: {
          black_card?: number
          created_at?: string
          game_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "rounds_black_card_fkey"
            columns: ["black_card"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      rounds_users: {
        Row: {
          has_played: boolean
          id: number
          is_tzar: boolean
          is_winner: boolean
          round_id: number
          user_id: string
        }
        Insert: {
          has_played?: boolean
          id?: number
          is_tzar?: boolean
          is_winner?: boolean
          round_id: number
          user_id: string
        }
        Update: {
          has_played?: boolean
          id?: number
          is_tzar?: boolean
          is_winner?: boolean
          round_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_users_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rounds_users_cards: {
        Row: {
          card_id: number
          rounds_user_id: number
        }
        Insert: {
          card_id: number
          rounds_user_id: number
        }
        Update: {
          card_id?: number
          rounds_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "rounds_users_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_users_cards_rounds_user_id_fkey"
            columns: ["rounds_user_id"]
            isOneToOne: false
            referencedRelation: "rounds_users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_colors: "WHITE" | "BLACK"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
