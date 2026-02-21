"use server";

import { GoalPeriod, GoalStatus } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";

export async function createGoalAction(title: string, period: GoalPeriod) {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("User not authenticated");
	}

	const { data, error } = await supabase
		.from("goals")
		.insert({
			title,
			period,
			owner_id: user.id,
		})
		.select()
		.single();

	if (error) {
		console.error("Error creating goal:", error);
		throw new Error("Failed to create goal");
	}

	revalidatePath("/dashboard");
	return data;
}

export async function toggleGoalStatusAction(id: string) {
	const supabase = await createSupabaseServerClient();

	const { data: existing, error: fetchError } = await supabase
		.from("goals")
		.select("status")
		.eq("id", id)
		.single();

	if (fetchError) throw new Error("Goal not found");

	const newStatus = existing.status === "todo" ? "done" : "todo";

	const { data, error } = await supabase
		.from("goals")
		.update({ status: newStatus })
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("Error updating goal status:", error);
		throw new Error("Failed to update goal status");
	}

	revalidatePath("/dashboard");

	return data;
}

export async function deleteGoalAction(id: string) {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase.from("goals").delete().eq("id", id);

	if (error) {
		console.error("Error deleting goal:", error);
		throw new Error("Failed to delete goal");
	}

	revalidatePath("/dashboard");

	return { success: true };
}

export async function editGoalAction(
	id: string,
	updates: {
		title?: string;
		description?: string;
	},
) {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from("goals")
		.update(updates)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("Error updating goal:", error);
		throw new Error("Failed to update goal");
	}

	revalidatePath("/dashboard");

	return data;
}
