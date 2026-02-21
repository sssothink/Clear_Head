import { Goal } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getGoals(): Promise<Goal[]> {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from("goals")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching goals:", error);
		throw new Error("Failed to fetch goals");
	}

	return data ?? [];
}
