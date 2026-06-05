import { createSupabaseClient, createInvokeFunction } from '@mi-album-fifa/shared'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createSupabaseClient({ url: supabaseUrl, anonKey: supabaseAnonKey })

export const invokeFunction = createInvokeFunction(supabaseUrl, supabaseAnonKey)
