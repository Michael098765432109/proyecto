import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

/**

 */
const SUPABASE_URL = 'https://nkptwdzfzjoyssbfwvlh.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_0EeFLywIf5yqmqRTT8-V7A_NQKzr9sD'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
