import { Goal, DayEvent } from "@/features/goals/model/types";
import { addDays, format } from "date-fns";

export function buildWeekEvents(goals: Goal[], weekStart: string): DayEvent[] {
	const weekStartDate = new Date(weekStart);
	const events: DayEvent[] = [];

	for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
		const currentDate = addDays(weekStartDate, dayIndex);
		const formatted = format(currentDate, "yyyy-MM-dd");

		goals.forEach((goal) => {
			if (goal.recurrence_type === "none") {
				if (goal.start_date === formatted) {
					events.push({ ...goal, dayIndex, status: "planned" });
				}
			}

			if (goal.recurrence_type === "daily") {
				events.push({ ...goal, dayIndex, status: "planned" });
			}

			if (goal.recurrence_type === "weekly") {
				const weekDay = currentDate.getDay();
				const normalizedWeekDay = weekDay === 0 ? 7 : weekDay;

				if (goal.recurrence_days?.includes(normalizedWeekDay)) {
					events.push({ ...goal, dayIndex, status: "planned" });
				}
			}
		});
	}

	return events;
}
