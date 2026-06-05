import { createUseGlobalCollection } from '@mi-album-fifa/shared'
import { supabase } from '../lib/supabaseClient.ts'

export const useGlobalCollection = createUseGlobalCollection(supabase)
