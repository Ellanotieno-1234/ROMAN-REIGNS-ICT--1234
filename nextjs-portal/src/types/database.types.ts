type Json = Record<string, unknown> | null

export interface Database {
  public: {
    Tables: {
      analysis_results: {
        Row: {
          id: number
          file_name: string
          data: Json
          created_at: string
          updated_at: string
          session_date: string | null
          present_students: number | null
          total_students: number | null
          attendance_rate: number | null
          completed_assignments: number | null
          total_assignments: number | null
          completion_rate: number | null
        }
        Insert: {
          id?: number
          file_name: string
          data?: Json
          created_at?: string
          updated_at?: string
          session_date?: string | null
          present_students?: number | null
          total_students?: number | null
          attendance_rate?: number | null
          completed_assignments?: number | null
          total_assignments?: number | null
          completion_rate?: number | null
        }
        Update: {
          id?: number
          file_name?: string
          data?: Json
          created_at?: string
          updated_at?: string
          session_date?: string | null
          present_students?: number | null
          total_students?: number | null
          attendance_rate?: number | null
          completed_assignments?: number | null
          total_assignments?: number | null
          completion_rate?: number | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'student' | 'instructor' | 'admin'
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'student' | 'instructor' | 'admin'
          assigned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'student' | 'instructor' | 'admin'
          assigned_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          details?: Json
          created_at?: string
        }
      }
      auth_logs: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          ip_address: string
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          ip_address: string
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          ip_address?: string
          user_agent?: string | null
          created_at?: string
        }
      }
      security_events: {
        Row: {
          id: string
          event_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          source_ip: string | null
          affected_user_id: string | null
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string
          source_ip?: string | null
          affected_user_id?: string | null
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description?: string
          source_ip?: string | null
          affected_user_id?: string | null
          resolved?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
