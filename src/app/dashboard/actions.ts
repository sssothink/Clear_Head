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

export async function deleteGoalAction(id: string) {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase.from("goals").delete().eq("id", id);

	if (error) {
		console.error("Error deleting goal:", error);
		throw new Error("Failed to delete goal");
	}
	revalidatePath("/dashboard");
}

export async function updateGoalAction(
	id: string,
	title: string,
	description: string,
	due_date: string | null,
) {
	const supabase = await createSupabaseServerClient();

	const { error } = await supabase
		.from("goals")
		.update({
			title,
			description,
			due_date,
		})
		.eq("id", id);

	if (error) {
		console.error("Error updating goal:", error);
		throw new Error("Failed to update goal");
	}

	revalidatePath("/dashboard");
}
