import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

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
