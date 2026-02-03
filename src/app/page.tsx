import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	return (
		<main className="p-6">
			<h1 className="text-2xl font-bold">Clear Head</h1>

			{user ? (
				<p className="mt-4">Welcome back, {user.email}!</p>
			) : (
				<p className="mt-4">Please log in to continue.</p>
			)}
		</main>
	);
}
