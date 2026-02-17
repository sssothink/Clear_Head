"use client";

import { Goal } from "@/lib/db/types";
import { useOptimistic, useTransition } from "react";
import { createGoalAction, toggleGoalStatusAction } from "./actions";
import CreateGoalForm from "./CreateGoalForm";
import GoalsList from "./GoalsList";

export default function GoalsClient({
	initialGoals,
}: {
	initialGoals: Goal[];
}) {
	const [isPending, startTransition] = useTransition();

	const [optimisticGoals, updateOptimisticGoals] = useOptimistic(
		initialGoals,
		(state, action: any) => {
			switch (action.type) {
				case "add":
					return [action.goal, ...state];
				case "update":
					return state.map((goal) =>
						goal.id === action.goal.id ? action.goal : goal,
					);
				default:
					return state;
			}
		},
	);

	const handleCreateGoal = (title: string) => {
		const tempGoal: Goal = {
			id: crypto.randomUUID(),
			title,
			description: "",
			status: "todo",
			owner_id: "",
			created_at: new Date().toISOString(),
			due_date: null,
		};

		startTransition(async () => {
			updateOptimisticGoals({ type: "add", goal: tempGoal });
			await createGoalAction(title);
		});
	};

	const handleToggleGoalStatus = (goal: Goal) => {
		const newStatus = goal.status === "todo" ? "done" : "todo";

		startTransition(async () => {
			updateOptimisticGoals({
				type: "update",
				goal: { ...goal, status: newStatus },
			});

			await toggleGoalStatusAction(goal.id, newStatus);
		});
	};

	return (
		<div>
			<CreateGoalForm onCreateGoal={handleCreateGoal} isPending={isPending} />
			<GoalsList
				goals={optimisticGoals}
				onToggleGoalStatus={handleToggleGoalStatus}
				isPending={isPending}
			/>
		</div>
	);
}
