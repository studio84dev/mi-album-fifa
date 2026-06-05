import { createClient, type SupportedStorage } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
  storage?: SupportedStorage
}

export function createSupabaseClient({ url, anonKey, storage }: SupabaseConfig) {
  return createClient(url, anonKey, {
    auth: {
      flowType: 'pkce',
      ...(storage ? { storage } : {}),
    },
  })
}

export function createInvokeFunction(supabaseUrl: string, supabaseAnonKey: string) {
  return async (
    functionName: string,
    body: unknown,
    accessToken?: string
  ): Promise<Response> => {
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken || supabaseAnonKey}`,
      },
      body: JSON.stringify(body),
    })
    return response
  }
}
