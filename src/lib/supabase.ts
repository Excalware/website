import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE } from '$env/static/private';
export default createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
});