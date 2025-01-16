export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          email: string | null;
          role: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          email?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          email?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      ip_sessions: {
        Row: {
          id: string;
          user_id: string;
          ip_address: string;
          created_at: string;
          last_activity: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ip_address: string;
          created_at?: string;
          last_activity?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ip_address?: string;
          created_at?: string;
          last_activity?: string;
        };
      };
    };
  };
};