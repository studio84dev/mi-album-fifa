import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify the requesting user
    const {
      data: { user: targetUser },
      error: userError,
    } = await supabaseUser.auth.getUser()
    if (userError || !targetUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { sourceEmail, preview } = await req.json()
    if (!sourceEmail) {
      return new Response(JSON.stringify({ error: 'sourceEmail is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (sourceEmail.toLowerCase() === targetUser.email?.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Cannot import from your own account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look up source user by email in profiles table
    const { data: sourceProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', sourceEmail.toLowerCase())
      .single()

    if (profileError || !sourceProfile) {
      return new Response(JSON.stringify({ error: 'Source account not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sourceUserId = sourceProfile.id
    const targetUserId = targetUser.id

    // Fetch all stickers from source user
    const { data: sourceStickers, error: fetchError } = await supabaseAdmin
      .from('sticker_collection')
      .select('country_code, sticker_number, repeated')
      .eq('user_id', sourceUserId)

    if (fetchError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch source collection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (preview) {
      return new Response(JSON.stringify({ count: sourceStickers?.length ?? 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Backup current target collection before any destructive operation
    const { data: backupStickers, error: backupError } = await supabaseAdmin
      .from('sticker_collection')
      .select('country_code, sticker_number, repeated')
      .eq('user_id', targetUserId)

    if (backupError) {
      return new Response(JSON.stringify({ error: 'Failed to backup current collection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Delete all existing stickers for target user
    const { error: deleteError } = await supabaseAdmin
      .from('sticker_collection')
      .delete()
      .eq('user_id', targetUserId)

    if (deleteError) {
      return new Response(JSON.stringify({ error: 'Failed to clear target collection' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Insert source stickers with target user_id
    if (sourceStickers && sourceStickers.length > 0) {
      const rowsToInsert = sourceStickers.map(({ country_code, sticker_number, repeated }) => ({
        user_id: targetUserId,
        country_code,
        sticker_number,
        repeated,
        updated_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabaseAdmin
        .from('sticker_collection')
        .insert(rowsToInsert)

      if (insertError) {
        // Attempt to restore backup
        let restored = false
        if (backupStickers && backupStickers.length > 0) {
          const restoreRows = backupStickers.map(({ country_code, sticker_number, repeated }) => ({
            user_id: targetUserId,
            country_code,
            sticker_number,
            repeated,
            updated_at: new Date().toISOString(),
          }))
          const { error: restoreError } = await supabaseAdmin
            .from('sticker_collection')
            .insert(restoreRows)
          restored = !restoreError
        }
        return new Response(
          JSON.stringify({
            error: 'import_failed',
            restored,
            backupCount: backupStickers?.length ?? 0,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(JSON.stringify({ success: true, imported: sourceStickers?.length ?? 0 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
