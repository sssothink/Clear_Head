import { Goal, DayEvent, GoalOccurrence } from "@/features/goals/model/types";
import { addDays, format } from "date-fns";

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
		const formatted = format(currentDate, "yyyy-MM-dd");

		goals.forEach((goal) => {
			if (goal.recurrence_type === "none") {
				if (goal.start_date === formatted) {
					const key = `${goal.id}_${formatted}`;
					const occurrence = occurrenceMap.get(key);

					if (occurrence?.is_deleted) return; // пропустить

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
				}
			}

			if (goal.recurrence_type === "daily") {
				const key = `${goal.id}_${formatted}`;
				const occurrence = occurrenceMap.get(key);

				if (occurrence?.is_deleted) return; // пропустить

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
			}

			if (goal.recurrence_type === "weekly") {
				const weekDay = currentDate.getDay();
				const normalizedWeekDay = weekDay === 0 ? 7 : weekDay;

				if (!goal.recurrence_days?.includes(normalizedWeekDay)) {
					return;
				}

				const key = `${goal.id}_${formatted}`;
				const occurrence = occurrenceMap.get(key);

				if (occurrence?.is_deleted) return; // пропустить

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
			}
		});
	}

	return events;
}
