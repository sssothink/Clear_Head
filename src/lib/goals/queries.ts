import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getWeekDates } from "@/shared/lib/date";
import { DayEvent } from "@/features/goals/day/DayClient";
import { getDayEvents } from "./day-service";

export async function getCurrentUser() {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user) {
		throw new Error("Unauthorized");
	}

	return data.user;
}

export async function getUserDayGoals(userId: string) {
	const supabase = await createSupabaseServerClient();

	return supabase.from("goals").select("*").eq("owner_id", userId);
}

export async function getGoalOverrides(userId: string, date: string) {
	const supabase = await createSupabaseServerClient();

	return supabase
		.from("goal_occurrences")
		.select("*")
		.eq("owner_id", userId)
		.eq("date", date)
		.eq("is_deleted", false);
}

// export async function getWeekEvents(baseDate: string) {
// 	const dates = getWeekDates(baseDate);

// 	const result: Record<string, DayEvent[]> = {};

// 	for (const date of dates) {
// 		result[date] = await getDayEvents(date);
// 	}

// 	return result;
// }
