import { endOfWeek, startOfWeek } from "date-fns";
import { getCurrentUser } from "../goals/queries";
import { createSupabaseServerClient } from "../supabase/server-client";

export async function getWeekGoals(currentDate: Date) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
	const weekStartStr = weekStart.toISOString().slice(0, 10);
	const weekEndStr = weekEnd.toISOString().slice(0, 10);

	const { data, error } = await supabase
		.from("goals")
		.select("*")
		.eq("owner_id", user.id)
		.eq("is_deleted", false);

	const { data: occurrences, error: occError } = await supabase
		.from("goal_occurrences")
		.select(
			"goal_id, date, status, title, description, start_time, end_time, is_deleted",
		)
		.eq("owner_id", user.id)
		.gte("date", weekStartStr)
		.lte("date", weekEndStr);

	if (error) throw error;
	if (occError) throw occError;

	return {
		goals: data,
		occurrences: occurrences ?? [],
		weekStart,
		weekEnd,
	};
}
