"use client";

import { Goal, GoalPeriod } from "@/lib/db/types";
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
	| { type: "edit"; goal: Goal }
	| { type: "replace"; tempId: string; realGoal: Goal };

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

				case "replace":
					return state.map((goal) =>
						goal.id === action.tempId ? action.realGoal : goal,
					);

				case "delete":
					return state.filter((goal) => goal.id !== action.id);

				case "update":
				case "edit":
					return state.map((goal) =>
						goal.id === action.goal.id ? action.goal : goal,
					);

				default:
					return state;
			}
		},
	);

	const handleCreateGoal = (title: string, period: GoalPeriod) => {
		const tempGoal: Goal = {
			id: crypto.randomUUID(),
			title,
			description: "",
			status: "todo",
			period,
			owner_id: "",
			created_at: new Date().toISOString(),
			due_date: null,
		};

		startTransition(async () => {
			updateOptimisticGoals({ type: "add", goal: tempGoal });

			try {
				const realGoal = await createGoalAction(title, period);

				updateOptimisticGoals({
					type: "replace",
					tempId: tempGoal.id,
					realGoal,
				});
			} catch (error) {
				updateOptimisticGoals({ type: "delete", id: tempGoal.id });
				console.error("Error creating goal: ", error);
			}
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

	const groupedGoals = optimisticGoals.reduce(
		(acc, goal) => {
			if (!acc[goal.period]) acc[goal.period] = [];
			acc[goal.period].push(goal);
			return acc;
		},
		{} as Record<GoalPeriod, Goal[]>,
	);

	return (
		<div className="flex flex-col gap-6">
			<CreateGoalForm onCreateGoal={handleCreateGoal} isPending={isPending} />
			{(["day", "week", "month", "year", "someday"] as GoalPeriod[]).map(
				(period) => (
					<div key={period} className="mb-6">
						<h2 className="text-xl font-bold capitalize">{period}</h2>

						{groupedGoals[period]?.length ? (
							<GoalsList
								goals={groupedGoals[period]}
								onToggleGoalStatus={handleToggleGoalStatus}
								onDeleteGoal={handleDeleteGoal}
								onEditGoal={handleEditGoal}
								isPending={isPending}
							/>
						) : (
							<p className="text-gray-400">No goals</p>
						)}
					</div>
				),
			)}
		</div>
	);
}
