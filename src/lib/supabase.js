import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sssapbbpfthwghlclodk.supabase.co';
const supabaseKey = 'sb_publishable_BVNz1656IQaV7uOfPwSYlA_iFTQr65B';

export const supabase = createClient(supabaseUrl, supabaseKey);
