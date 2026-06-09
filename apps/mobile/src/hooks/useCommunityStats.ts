import { createUseCommunityStats } from '@mi-album-fifa/shared'
import { supabase } from '../lib/supabaseClient'

export const useCommunityStats = createUseCommunityStats(supabase)
