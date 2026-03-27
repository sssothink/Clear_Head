import { Goal } from "@/features/goals/model/types";
import { formatISODate } from "./date";

type RecurrenceGoal = Pick<
	Goal,
	"recurrence_type" | "recurrence_days" | "start_date" | "recurrence_end"
>;

export function toNormalizedWeekday(date: Date) {
	const day = date.getDay();
	return day === 0 ? 7 : day;
}

export function matchesRecurrenceOnDate(goal: RecurrenceGoal, date: Date) {
	const iso = formatISODate(date);

	if (goal.recurrence_type === "none") {
		return goal.start_date === iso;
	}

	if (goal.start_date && iso < goal.start_date) {
		return false;
	}

	if (goal.recurrence_end && iso > goal.recurrence_end) {
		return false;
	}

	if (goal.recurrence_type === "daily") {
		return true;
	}

	if (goal.recurrence_type === "weekly") {
		const weekday = toNormalizedWeekday(date);
		return goal.recurrence_days?.includes(weekday) ?? false;
	}

	return false;
}
