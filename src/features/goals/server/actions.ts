"use server";

import { setGoalOccurrenceStatus } from "@/lib/goals/occurrence-service";
import { getCurrentUser } from "@/lib/goals/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { GoalStatus, RecurrenceType } from "../model/types";

export async function createDayGoalAction(data: {
	title: string;
	description?: string;
	date: string;
	start_time: string;
	end_time: string;
	recurrence_type: RecurrenceType;
	recurrence_days?: number[];
}) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { data: created, error } = await supabase
		.from("goals")
		.insert({
			title: data.title,
			description: data.description,
			owner_id: user.id,
			start_time: data.start_time,
			end_time: data.end_time,
			recurrence_type: data.recurrence_type,
			recurrence_days: data.recurrence_days ?? null,
			start_date: data.date,
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
		description?: string;
		start_time?: string;
		end_time?: string;
		start_date?: string | null;
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

export async function deleteGoalOccurrenceAction(goalId: string, date: string) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { error } = await supabase.from("goal_occurrences").upsert(
		{
			goal_id: goalId,
			owner_id: user.id,
			date,
			is_deleted: true,
		},
		{ onConflict: "goal_id,date" },
	);

	if (error) throw error;
}

export async function updateGoalOccurrenceAction(
	goalId: string,
	date: string,
	updates: {
		title?: string;
		description?: string;
		start_time?: string;
		end_time?: string;
	},
) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { error } = await supabase.from("goal_occurrences").upsert(
		{
			goal_id: goalId,
			owner_id: user.id,
			date,
			...updates,
		},
		{ onConflict: "goal_id,date" },
	);

	if (error) throw error;
}

export async function detachGoalOccurrenceAction(params: {
	goalId: string;
	oldDate: string;
	newDate: string;
	title: string;
	description?: string;
	start_time?: string;
	end_time?: string;
}) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { data: created, error: createError } = await supabase
		.from("goals")
		.insert({
			title: params.title,
			owner_id: user.id,
			start_date: params.newDate,
			description: params.description,
			recurrence_type: "none",
			recurrence_days: null,
			start_time: params.start_time,
			end_time: params.end_time,
		})
		.select("id")
		.single();

	if (createError) {
		console.error("SUPABASE INSERT ERROR:", createError);
		throw createError;
	}

	const { error: occError } = await supabase.from("goal_occurrences").upsert(
		{
			goal_id: params.goalId,
			owner_id: user.id,
			date: params.oldDate,
			is_deleted: true,
		},
		{
			onConflict: "goal_id,date",
		},
	);

	if (occError) {
		console.error("SUPABASE STATUS UPDATE ERROR:", occError);
		await supabase
			.from("goals")
			.update({ is_deleted: true })
			.eq("id", created.id)
			.eq("owner_id", user.id);
		throw new Error("Failed to update goal status");
	}

	return created;
}

export async function splitGoalSeriesFromDateAction(params: {
	goalId: string;
	fromDate: string;
	updates: {
		title?: string;
		description?: string;
		start_time?: string;
		end_time?: string;
		recurrence_type: RecurrenceType;
		recurrence_days?: number[] | null;
	};
}) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const { data: goal, error: loadError } = await supabase
		.from("goals")
		.select(
			"id, owner_id, title, description, start_time, end_time, recurrence_type, recurrence_days, recurrence_end, parent_id",
		)
		.eq("id", params.goalId)
		.eq("owner_id", user.id)
		.single();

	if (loadError) throw loadError;

	const [year, month, day] = params.fromDate.split("-").map(Number);
	if (!year || !month || !day) {
		throw new Error("Invalid fromDate");
	}

	const prevDateObj = new Date(Date.UTC(year, month - 1, day));
	prevDateObj.setUTCDate(prevDateObj.getUTCDate() - 1);
	const prevDate = [
		prevDateObj.getUTCFullYear(),
		String(prevDateObj.getUTCMonth() + 1).padStart(2, "0"),
		String(prevDateObj.getUTCDate()).padStart(2, "0"),
	].join("-");

	const { error: trimError } = await supabase
		.from("goals")
		.update({ recurrence_end: prevDate })
		.eq("id", goal.id)
		.eq("owner_id", user.id);

	if (trimError) throw trimError;

	const { data: created, error: createError } = await supabase
		.from("goals")
		.insert({
			owner_id: user.id,
			title: params.updates.title ?? goal.title,
			description: params.updates.description ?? goal.description,
			start_time: params.updates.start_time ?? goal.start_time,
			end_time: params.updates.end_time ?? goal.end_time,
			start_date: params.fromDate,
			recurrence_type: params.updates.recurrence_type,
			recurrence_days: params.updates.recurrence_days ?? null,
			recurrence_end: goal.recurrence_end,
			parent_id: goal.parent_id ?? goal.id,
		})
		.select("id")
		.single();

	if (createError) {
		await supabase
			.from("goals")
			.update({ recurrence_end: goal.recurrence_end })
			.eq("id", goal.id)
			.eq("owner_id", user.id);
		throw createError;
	}

	// Carry forward per-occurrence overrides/deletions for the future segment.
	// Without this, previously deleted/moved occurrences may reappear in the new series.
	const { data: oldOccurrences, error: occLoadError } = await supabase
		.from("goal_occurrences")
		.select(
			"date, status, title, description, start_time, end_time, is_deleted",
		)
		.eq("goal_id", goal.id)
		.eq("owner_id", user.id)
		.gte("date", params.fromDate);

	if (occLoadError) {
		await supabase
			.from("goals")
			.update({ is_deleted: true })
			.eq("id", created.id)
			.eq("owner_id", user.id);
		await supabase
			.from("goals")
			.update({ recurrence_end: goal.recurrence_end })
			.eq("id", goal.id)
			.eq("owner_id", user.id);
		throw occLoadError;
	}

	if (oldOccurrences && oldOccurrences.length > 0) {
		const clonedOccurrences = oldOccurrences.map((row) => ({
			goal_id: created.id,
			owner_id: user.id,
			date: row.date,
			status: row.status,
			title: row.title,
			description: row.description,
			start_time: row.start_time,
			end_time: row.end_time,
			is_deleted: row.is_deleted,
		}));

		const { error: occCopyError } = await supabase
			.from("goal_occurrences")
			.upsert(clonedOccurrences, { onConflict: "goal_id,date" });

		if (occCopyError) {
			await supabase
				.from("goals")
				.update({ is_deleted: true })
				.eq("id", created.id)
				.eq("owner_id", user.id);
			await supabase
				.from("goals")
				.update({ recurrence_end: goal.recurrence_end })
				.eq("id", goal.id)
				.eq("owner_id", user.id);
			throw occCopyError;
		}
	}

	return created;
}
