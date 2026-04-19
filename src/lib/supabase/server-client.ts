import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnvironmentVariables() {
	const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseURL || !supabaseKey) {
		throw new Error(
			"Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
		);
	}

	return { supabaseURL, supabaseKey };
}

export async function createSupabaseServerClient() {
	const { supabaseURL, supabaseKey } = getEnvironmentVariables();

	const cookieStore = await cookies();

	return createServerClient(supabaseURL, supabaseKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options),
					);
				} catch (err) {
					console.log(err);
				}
			},
		},
	});
}
