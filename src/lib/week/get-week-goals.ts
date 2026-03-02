import { endOfWeek, startOfWeek } from "date-fns";
import { getCurrentUser } from "../goals/queries";
import { createSupabaseServerClient } from "../supabase/server-client";

export async function getWeekGoals(currentDate: Date) {
	const supabase = await createSupabaseServerClient();
	const user = await getCurrentUser();

	const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

	const { data, error } = await supabase
		.from("goals")
		.select("*")
		.eq("owner_id", user.id)
		.eq("is_deleted", false);

	if (error) throw error;

	return {
		goals: data,
		weekStart,
		weekEnd,
	};
}
