import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getCurrentUser } from "@/lib/goals/queries";
import { GoalStatus } from "@/features/goals/model/types";

export async function setGoalOccurrenceStatus(
	goalId: string,
	date: string,
	status: GoalStatus,
) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { error } = await supabase.from("goal_occurrences").upsert(
		{
			goal_id: goalId,
			owner_id: user.id,
			date,
			status,
		},
		{
			onConflict: "goal_id,date",
		},
	);

	if (error) {
		console.error("SUPABASE STATUS UPDATE ERROR:", error);
		throw new Error("Failed to update goal status");
	}

	return { status };
}
