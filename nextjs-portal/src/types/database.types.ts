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
  }
  }
}
