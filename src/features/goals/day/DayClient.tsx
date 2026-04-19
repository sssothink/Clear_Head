"use client";

import DayList from "./DayList";
import DayForm from "./DayForm";

import { DayEvent } from "../model/types";
import { useOptimisticGoals } from "../hooks/useOptimisticGoals";

export default function DayClient({
	initialEvents,
	date,
}: {
	initialEvents: DayEvent[];
	date: string;
}) {
	const { events, createGoal, toggleComplete } = useOptimisticGoals(
		initialEvents,
		date,
	);

	return (
		<div className="max-w-2xl mx-auto px-6 py-8">
			<DayForm onSubmit={createGoal} />
			<DayList
				events={events}
				onToggle={toggleComplete}
			/>
		</div>
	);
}
