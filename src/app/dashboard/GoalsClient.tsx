"use client";

import { Goal } from "@/lib/db/types";
import { useOptimistic, useTransition } from "react";
import {
	createGoalAction,
	deleteGoalAction,
	toggleGoalStatusAction,
	updateGoalAction,
} from "./actions";
import CreateGoalForm from "./CreateGoalForm";
import GoalsList from "./GoalsList";

type OptymisticAction =
	| { type: "add"; goal: Goal }
	| { type: "update"; goal: Goal }
	| { type: "delete"; id: string }
	| { type: "edit"; goal: Goal };

export default function GoalsClient({
	initialGoals,
}: {
	initialGoals: Goal[];
}) {
	const [isPending, startTransition] = useTransition();

	const [optimisticGoals, updateOptimisticGoals] = useOptimistic(
		initialGoals,
		(state: Goal[], action: OptymisticAction) => {
			switch (action.type) {
				case "add":
					return [action.goal, ...state];

				case "update":
					return state.map((goal) =>
						goal.id === action.goal.id ? action.goal : goal,
					);

				case "delete":
					return state.filter((goal) => goal.id !== action.id);

				case "edit":
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

	const handleDeleteGoal = (id: string) => {
		startTransition(async () => {
			updateOptimisticGoals({ type: "delete", id });
			await deleteGoalAction(id);
		});
	};

	const handleEditGoal = (goal: Goal, newTitle: string) => {
		const updatedGoal = { ...goal, title: newTitle };

		startTransition(async () => {
			updateOptimisticGoals({ type: "edit", goal: updatedGoal });
			await updateGoalAction(
				updatedGoal.id,
				updatedGoal.title,
				updatedGoal.description,
				updatedGoal.due_date,
			);
		});
	};

	return (
		<div>
			<CreateGoalForm onCreateGoal={handleCreateGoal} isPending={isPending} />
			<GoalsList
				goals={optimisticGoals}
				onToggleGoalStatus={handleToggleGoalStatus}
				onDeleteGoal={handleDeleteGoal}
				onEditGoal={handleEditGoal}
				isPending={isPending}
			/>
		</div>
	);
}
