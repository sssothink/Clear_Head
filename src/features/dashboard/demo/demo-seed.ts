import { Goal, GoalOccurrence } from "@/features/goals/model/types";
import { formatISODate, getStartOfWeek } from "@/shared/lib/date";
import { addDays } from "date-fns";

function createDemoGoal(params: {
	id: string;
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	start_date: string;
	recurrence_type?: Goal["recurrence_type"];
	recurrence_days?: number[] | null;
}): Goal {
	return {
		id: params.id,
		owner_id: "demo-user",
		title: params.title,
		description: params.description,
		start_time: params.start_time,
		end_time: params.end_time,
		start_date: params.start_date,
		recurrence_type: params.recurrence_type ?? "none",
		recurrence_days: params.recurrence_days ?? null,
		recurrence_end: null,
		parent_id: null,
		created_at: "2026-01-01T00:00:00.000Z",
	};
}

export function createDemoSeedData(baseDate = new Date()): {
	goals: Goal[];
	occurrences: GoalOccurrence[];
} {
	const weekStart = getStartOfWeek(baseDate);

	const monday = formatISODate(weekStart);
	const tuesday = formatISODate(addDays(weekStart, 1));
	const wednesday = formatISODate(addDays(weekStart, 2));
	const thursday = formatISODate(addDays(weekStart, 3));

	return {
		goals: [
			createDemoGoal({
				id: "demo-morning-plan",
				title: "Morning planning",
				description: "Review the day and choose the top 3 priorities.",
				start_date: monday,
				start_time: "09:00",
				end_time: "09:30",
			}),
			createDemoGoal({
				id: "demo-deep-work",
				title: "Deep work",
				description: "Focus block for the most important task.",
				start_date: monday,
				start_time: "10:00",
				end_time: "12:00",
			}),
			createDemoGoal({
				id: "demo-design-review",
				title: "Design review",
				start_date: monday,
				start_time: "10:30",
				end_time: "11:30",
			}),
			createDemoGoal({
				id: "demo-workout",
				title: "Workout",
				start_date: tuesday,
				start_time: "18:00",
				end_time: "19:00",
			}),
			createDemoGoal({
				id: "demo-daily-review",
				title: "Daily review",
				description: "A tiny recurring habit.",
				start_date: monday,
				start_time: "17:00",
				end_time: "17:20",
				recurrence_type: "daily",
			}),
			createDemoGoal({
				id: "demo-weekly-sync",
				title: "Weekly sync",
				start_date: wednesday,
				start_time: "14:00",
				end_time: "15:00",
				recurrence_type: "weekly",
				recurrence_days: [3],
			}),
			createDemoGoal({
				id: "demo-evening-reading",
				title: "Reading",
				start_date: thursday,
				start_time: "21:00",
				end_time: "21:45",
			}),
		],
		occurrences: [],
	};
}
