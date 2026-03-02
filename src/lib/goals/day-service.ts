import { getCurrentUser, getUserDayGoals, getGoalOverrides } from "./queries";

export async function getDayEvents(date: string) {
	const user = await getCurrentUser();

	const { data: goals, error: goalsError } = await getUserDayGoals(user.id);

	goalsError && console.error("Failed to get goals", goalsError);

	const { data: overrides } = await getGoalOverrides(user.id, date);

	const overrideMap = new Map(overrides?.map((o) => [o.goal_id, o]) ?? []);

	const jsDay = new Date(date).getDay();
	const normalizedDay = jsDay === 0 ? 7 : jsDay;

	const events =
		goals
			?.filter((goal) => {
			if (goal.is_deleted) return false;
				if (goal.recurrence_type === "none") {
					return goal.start_date === date;
				}

				if (goal.recurrence_type === "daily") {
					if (goal.start_date && date < goal.start_date) return false;

					if (goal.recurrence_end && date > goal.recurrence_end) return false;

					return true;
				}

				if (goal.recurrence_type === "weekly") {
					if (!goal.recurrence_days) return false;

					if (!goal.recurrence_days.includes(normalizedDay)) return false;

					if (goal.recurrence_end && date > goal.recurrence_end) return false;

					return true;
				}

				return false;
			})
			.map((goal) => {
				const override = overrideMap.get(goal.id);

				return {
					id: goal.id,
					title: goal.title,
					dayIndex: 0,
					start_time: goal.start_time,
					end_time: goal.end_time,
					status: override?.status ?? "planned",
				};
			})
			.sort((a, b) => a.start_time.localeCompare(b.start_time)) ?? [];

	return events;
}
