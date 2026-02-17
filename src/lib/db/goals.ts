import { createSupabaseServerClient } from "../supabase/server-client";
import { Goal } from "./types";

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

export async function createGoal(title: string) {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase
		.from("goals")
		.insert({ title, owner_id: (await supabase.auth.getUser()).data.user?.id })
		.select("*")
		.single();

	if (error) {
		console.error("Error creating goal:", error);
		throw new Error("Failed to create goal");
	}
}

export async function toggleGoalStatus(id: string, status: "todo" | "done") {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase
		.from("goals")
		.update({ status })
		.eq("id", id);

	if (error) {
		console.error("Error updating goal status:", error);
		throw new Error("Failed to update goal status");
	}
}
