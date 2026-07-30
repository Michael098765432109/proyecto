import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://nkptwdzfzjoyssbfwvlh.supabase.co'

// Pega la clave "anon public" que acabas de copiar:
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcHR3ZHpmempveXNzYmZ3dmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODY1NzQsImV4cCI6MjA5MzY2MjU3NH0.P4bOS0PdwpDSdePHHnxPI_IKlgs4P4hFJmwGnO0h3hE' // Tu token completo aquí

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)