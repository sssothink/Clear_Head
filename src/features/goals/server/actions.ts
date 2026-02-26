"use server";

import { setGoalOccurrenceStatus } from "@/lib/goals/occurrence-service";
import { getCurrentUser } from "@/lib/goals/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { GoalStatus } from "../model/types";

export async function createDayGoalAction(
	id: string,
	date: string,
	data: {
		title: string;
		start_time: string;
		end_time: string;
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
	},
) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { data: created, error } = await supabase
		.from("goals")
		.insert({
			id,
			owner_id: user.id,
			...data,
			start_date: data.recurrence_type === "none" ? date : null,
		})
		.select("id")
		.single();

	if (error) {
		console.error("SUPABASE INSERT ERROR:", error);
		throw error;
	}

	return created;
}

export async function setGoalOccurrenceStatusAction(
	goalId: string,
	date: string,
	status: GoalStatus,
) {
	const result = await setGoalOccurrenceStatus(goalId, date, status);

	return result;
}

export async function deleteGoalAction(id: string) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { error } = await supabase
		.from("goals")
		.update({ is_deleted: true })
		.eq("id", id)
		.eq("owner_id", user.id);

	if (error) throw error;
}

export async function updateGoalAction(
	id: string,
	updates: {
		title?: string;
		start_time?: string;
		end_time?: string;
	},
) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { error } = await supabase
		.from("goals")
		.update(updates)
		.eq("id", id)
		.eq("owner_id", user.id);

	if (error) throw error;
}
