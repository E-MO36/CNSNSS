import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tacapgkketetebhjfwou.supabase.co'
const supabaseAnonKey = 'sb_publishable_UUgfwEcmScz8FATOFjY4-w_wjm3jtdT'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
