export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          week: number;
          scheduled: string;
          home_team: string;
          away_team: string;
          winner_team: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          week: number;
          scheduled: string;
          home_team: string;
          away_team: string;
          winner_team?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          week?: number;
          scheduled?: string;
          home_team?: string;
          away_team?: string;
          winner_team?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      picks: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          week: number;
          picked_team: string;
          is_correct: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          week: number;
          picked_team: string;
          is_correct?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          week?: number;
          picked_team?: string;
          is_correct?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
