import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON } from '$env/static/public';

import type { Database } from '../app';
import type { LayoutLoad } from './$types';
export const load = (async ({ data, fetch, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient<Database>({
		event: { fetch },
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON,
		serverSession: data.session
	});

	const session = supabase.auth.getSession().then(response => response.data.session);
	return {
		user: data.user,
		session,
		supabase,
		analyticsId: data.analyticsId,
		notifications: data.notifications
	};
}) satisfies LayoutLoad;