import { createUseGlobalCollection } from '@mi-album-fifa/shared'
import { supabase } from '../lib/supabaseClient'

export const useGlobalCollection = createUseGlobalCollection(supabase)
