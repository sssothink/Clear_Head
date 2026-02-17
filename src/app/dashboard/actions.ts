"use server";

import { GoalStatus } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export async function createGoalAction(title: string) {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const { error } = await supabase.from("goals").insert({
		title,
		owner_id: user.id,
	});

	if (error) {
		console.error("Error creating goal:", error);
		throw new Error("Failed to create goal");
	}

	revalidatePath("/dashboard");
}

export async function toggleGoalStatusAction(id: string, status: GoalStatus) {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase
		.from("goals")
		.update({ status })
		.eq("id", id);

	if (error) {
		console.error("Error updating goal status:", error);
		throw new Error("Failed to update goal status");
	}

	revalidatePath("/dashboard");
}

// export async function deleteGoal(id: string) {
// 	const supabase = await createSupabaseServerClient();
// }
