import { Goal, DayEvent, GoalOccurrence } from "@/features/goals/model/types";
import { formatISODate } from "@/shared/lib/date";
import { addDays } from "date-fns";
import { matchesRecurrenceOnDate } from "@/shared/lib/recurrence";

export function buildWeekEvents(
	goals: Goal[],
	weekStart: string,
	occurrences: GoalOccurrence[],
): DayEvent[] {
	const weekStartDate = new Date(weekStart);
	const events: DayEvent[] = [];
	const occurrenceMap = new Map(
		occurrences.map((o) => [`${o.goal_id}_${o.date}`, o]),
	);

	for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
		const currentDate = addDays(weekStartDate, dayIndex);
		const formatted = formatISODate(currentDate);

		goals.forEach((goal) => {
			if (!matchesRecurrenceOnDate(goal, currentDate)) return;

			const key = `${goal.id}_${formatted}`;
			const occurrence = occurrenceMap.get(key);

			if (occurrence?.is_deleted) return;

			const status = occurrence?.status ?? "planned";

			events.push({
				...goal,
				id: key,
				goal_id: goal.id,
				occurrence_date: formatted,
				dayIndex,
				status,
				title: occurrence?.title ?? goal.title,
				description: occurrence?.description ?? goal.description,
				start_time: occurrence?.start_time ?? goal.start_time,
				end_time: occurrence?.end_time ?? goal.end_time,
			});
		});
	}

	return events;
}
