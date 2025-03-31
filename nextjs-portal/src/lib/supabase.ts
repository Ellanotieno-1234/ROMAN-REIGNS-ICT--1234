import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !anonKey) {
  throw new Error('Missing Supabase configuration')
}

// Regular client for frontend use
export const supabase = createClient(supabaseUrl, anonKey)

// Admin client for server-side/admin operations
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || anonKey)

export async function insertData(table: string, data: any) {
  const { data: insertedData, error } = await supabase
    .from(table)
    .insert([data])
    .select()
  
  if (error) throw error
  return insertedData
}

export async function getData(table: string) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
  
  if (error) throw error
  return data
}
