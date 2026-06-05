import { createUseCommunityStats } from '@mi-album-fifa/shared'
import { supabase } from '../lib/supabaseClient.ts'

export const useCommunityStats = createUseCommunityStats(supabase)
