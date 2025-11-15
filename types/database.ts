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
          email: string;
          sleeper_username: string | null;
          created_at: string;
          last_sync_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          sleeper_username?: string | null;
          created_at?: string;
          last_sync_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          sleeper_username?: string | null;
          created_at?: string;
          last_sync_at?: string | null;
        };
      };
    };
  };
}

