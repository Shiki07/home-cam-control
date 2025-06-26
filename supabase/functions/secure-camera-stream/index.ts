
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Verify the user is authenticated
    const { data: { user }, error } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (error || !user) {
      // Log unauthorized access attempt
      await supabaseClient.rpc('log_security_event', {
        p_action: 'unauthorized_camera_access',
        p_device_id: 'camera_001',
        p_success: false,
        p_details: { 
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        }
      })

      return new Response(
        JSON.stringify({ error: 'Unauthorized access to camera stream' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user owns the camera device
    const { data: deviceCheck } = await supabaseClient
      .from('user_devices')
      .select('id, device_name')
      .eq('device_id', 'camera_001')
      .eq('user_id', user.id)
      .eq('device_type', 'camera')
      .eq('is_active', true)
      .maybeSingle()

    if (!deviceCheck) {
      // Log unauthorized device access
      await supabaseClient.rpc('log_security_event', {
        p_action: 'unauthorized_camera_device_access',
        p_device_id: 'camera_001',
        p_success: false,
        p_details: { 
          user_id: user.id,
          reason: 'device_not_owned_or_inactive'
        }
      })

      return new Response(
        JSON.stringify({ error: 'Access denied: Camera not found or inactive' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful camera access
    await supabaseClient.rpc('log_security_event', {
      p_action: 'camera_stream_accessed',
      p_device_id: 'camera_001',
      p_success: true,
      p_details: { 
        device_name: deviceCheck.device_name,
        user_id: user.id
      }
    })

    // In a real implementation, this would proxy to your Pi camera stream
    // For now, return success with stream info
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Camera stream authorized',
        stream_url: 'http://your-pi-ip:8000/stream.mjpg', // Replace with actual Pi IP
        device_name: deviceCheck.device_name
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Camera stream error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
