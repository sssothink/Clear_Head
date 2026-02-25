"use client";

import DayList from "./DayList";
import DayForm from "./DayForm";

import { GoalStatus } from "../model/types";
import { useOptimisticGoals } from "../hooks/useOptimisticGoals";

export type DayEvent = {
	id: string;
	title: string;
	start_time: string;
	end_time: string;
	status: GoalStatus;
};

export default function DayClient({
	initialEvents,
	date,
}: {
	initialEvents: DayEvent[];
	date: string;
}) {
	const { events, createGoal, toggleComplete, updateGoal, deleteGoal } =
		useOptimisticGoals(initialEvents, date);

	return (
		<div className="max-w-2xl mx-auto px-6 py-8">
			<DayForm onCreateGoal={createGoal} />
			<DayList
				events={events}
				onToggle={toggleComplete}
				onEditGoal={updateGoal}
				onDeleteGoal={deleteGoal}
			/>
		</div>
	);
}
