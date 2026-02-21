import { Goal, GoalPeriod } from "@/lib/db/types";
import { startTransition, useOptimistic } from "react";
import {
	createGoalAction,
	deleteGoalAction,
	editGoalAction,
	toggleGoalStatusAction,
} from "../server/actions";

type OptimisticAction =
	| { type: "add"; goal: Goal }
	| { type: "update"; goal: Goal }
	| { type: "delete"; id: string }
	| { type: "replace"; id: string; goal: Goal };

export function useGoals(initialGoals: Goal[]) {
	const [goals, update] = useOptimistic(
		initialGoals,
		(state: Goal[], action: OptimisticAction) => {
			switch (action.type) {
				case "add":
					return [action.goal, ...state];

				case "delete":
					return state.filter((g) => g.id !== action.id);

				case "update":
					return state.map((g) => (g.id === action.goal.id ? action.goal : g));

				case "replace":
					return state.map((g) => (g.id === action.id ? action.goal : g));

				default:
					return state;
			}
		},
	);

	function execute<T>({
		optimistic,
		action,
		success,
		rollback,
	}: {
		optimistic: () => void;
		action: () => Promise<T>;
		success?: (result: T) => void;
		rollback?: () => void;
	}) {
		startTransition(async () => {
			optimistic();

			try {
				const result = await action();
				success?.(result);
			} catch (e) {
				rollback?.();
				console.error(e);
			}
		});
	}

	function createGoal(title: string, period: GoalPeriod) {
		const tempId = crypto.randomUUID();

		const tempGoal: Goal = {
			id: tempId,
			title,
			description: "",
			status: "todo",
			period,
			owner_id: "temp",
			created_at: new Date().toISOString(),
			due_date: null,
		};

		execute({
			optimistic: () => update({ type: "add", goal: tempGoal }),
			action: () => createGoalAction(title, period),
			success: (realGoal) =>
				update({ type: "replace", id: tempId, goal: realGoal }),
			rollback: () => update({ type: "delete", id: tempId }),
		});
	}

	function deleteGoal(goal: Goal) {
		execute({
			optimistic: () => update({ type: "delete", id: goal.id }),
			action: () => deleteGoalAction(goal.id),
			rollback: () => update({ type: "add", goal }),
		});
	}

	function toggleGoalStatus(goal: Goal) {
		const optimisticGoal: Goal = {
			...goal,
			status: goal.status === "todo" ? "done" : "todo",
		};

		execute({
			optimistic: () =>
				update({
					type: "update",
					goal: optimisticGoal,
				}),

			action: () => toggleGoalStatusAction(goal.id),

			success: (realGoal) =>
				update({
					type: "replace",
					id: goal.id,
					goal: realGoal,
				}),

			rollback: () =>
				update({
					type: "update",
					goal,
				}),
		});
	}

	function editGoal(goal: Goal, updates: Partial<Goal>) {
		const optimisticGoal = { ...goal, ...updates };

		execute({
			optimistic: () => update({ type: "update", goal: optimisticGoal }),

			action: () => editGoalAction(goal.id, updates),

			success: (realGoal) =>
				update({ type: "replace", id: goal.id, goal: realGoal }),

			rollback: () => update({ type: "update", goal }),
		});
	}

	return { goals, createGoal, deleteGoal, toggleGoalStatus, editGoal };
}
