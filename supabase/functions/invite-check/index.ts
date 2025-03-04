import { createClient } from 'jsr:@supabase/supabase-js@2';

// // Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify(
        { error: "Token is required" }), 
        { status: 400, headers: { ...corsHeaders } }
      );
    }

    console.log("got a token");

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the invitation
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();

      if(error) console.log("error", error);

    if (error || !invitation) {
      return new Response(JSON.stringify(
        { error: "Invalid token" }), 
        { status: 400, headers: { ...corsHeaders } }
      );
    }

    // Check if the invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
        return new Response(JSON.stringify(
        { error: "Invitation expired" }), 
        { status: 400, headers: { ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Valid invite",
        group_id: invitation.group_id,
        group_name: invitation.group_name,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }, 
        status: 200 
      }
    );

  } catch (err) {
    console.log("error", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders } }
    );
  }
});


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/invite-check' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
