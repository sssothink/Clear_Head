"use client";

import { Goal } from "@/lib/db/types";

import CreateGoalForm from "./CreateGoalForm";
import GoalsList from "./GoalsList";
import { useGoals } from "../hooks/useGoals";
import { PERIOD_LABEL, PERIOD_ORDER } from "../model/types";

export function GoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
	const { goals, createGoal, editGoal, toggleGoalStatus, deleteGoal } =
		useGoals(initialGoals);

	const groupedGoals = goals.reduce(
		(acc, goal) => {
			if (!acc[goal.period]) acc[goal.period] = [];
			acc[goal.period].push(goal);
			return acc;
		},
		{} as Record<string, Goal[]>,
	);

	return (
		<>
			<CreateGoalForm onCreateGoal={createGoal} />

			<div className="mt-8 flex flex-col gap-8">
				{PERIOD_ORDER.map((period) => (
					<div key={period}>
						<h2 className="text-xl font-semibold text-white mb-2">
							{PERIOD_LABEL[period]}
						</h2>

						<GoalsList
							goals={groupedGoals[period] ?? []}
							onToggleGoalStatus={toggleGoalStatus}
							onDeleteGoal={deleteGoal}
							onEditGoal={editGoal}
						/>
					</div>
				))}
			</div>
		</>
	);
}
