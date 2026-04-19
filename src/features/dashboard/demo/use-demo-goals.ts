"use client";

import { useMemo, useState } from "react";
import type {
	Goal,
	GoalOccurrence,
	GoalStatus,
	RecurrenceType,
} from "@/features/goals/model/types";
import { buildWeekEvents } from "@/lib/week/build-week-events";
import { saveDemoState } from "./demo-storage";
import type { DashboardGoalState } from "../model/dashboard-goal-state";

type DemoState = {
	goals: Goal[];
	occurrences: GoalOccurrence[];
};

function createGoalId() {
	return `demo-${crypto.randomUUID()}`;
}

function createGoalFromInput(data: {
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	date: string;
	recurrence_type: RecurrenceType;
	recurrence_days?: number[];
}): Goal {
	const now = new Date().toISOString();

	return {
		id: createGoalId(),
		owner_id: "demo-user",
		title: data.title,
		description: data.description,
		start_time: data.start_time,
		end_time: data.end_time,
		start_date: data.date,
		recurrence_type: data.recurrence_type,
		recurrence_days: data.recurrence_days ?? null,
		recurrence_end: null,
		parent_id: null,
		created_at: now,
	};
}

export function useDemoGoals(
	initialGoals: Goal[],
	initialOccurrences: GoalOccurrence[],
	weekStart: string,
): DashboardGoalState {
	const [state, setState] = useState<DemoState>(() => ({
		goals: initialGoals,
		occurrences: initialOccurrences,
	}));

	const events = useMemo(
		() => buildWeekEvents(state.goals, weekStart, state.occurrences),
		[state.goals, state.occurrences, weekStart],
	);

	const commit = (updater: (prev: DemoState) => DemoState) => {
		setState((prev) => {
			const next = updater(prev);
			saveDemoState(next);
			return next;
		});
	};

	const createGoal: DashboardGoalState["createGoal"] = (data) => {
		const goal = createGoalFromInput(data);

		commit((prev) => ({
			...prev,
			goals: [...prev.goals, goal],
		}));
	};

	const updateGoal: DashboardGoalState["updateGoal"] = (goalId, data) => {
		commit((prev) => ({
			...prev,
			goals: prev.goals.map((goal) =>
				goal.id === goalId
					? {
							...goal,
							...data,
							start_date: data.start_date ?? goal.start_date,
							recurrence_days:
								data.recurrence_days === undefined
									? goal.recurrence_days
									: data.recurrence_days,
						}
					: goal,
			),
		}));
	};

	const toggleComplete: DashboardGoalState["toggleComplete"] = (eventId) => {
		const event = events.find((item) => item.id === eventId);
		if (!event) return;

		const nextStatus: GoalStatus =
			event.status === "completed" ? "planned" : "completed";

		commit((prev) => {
			const withoutExisting = prev.occurrences.filter(
				(item) =>
					!(
						item.goal_id === event.goal_id &&
						item.date === event.occurrence_date
					),
			);

			return {
				...prev,
				occurrences: [
					...withoutExisting,
					{
						goal_id: event.goal_id,
						date: event.occurrence_date,
						status: nextStatus,
					},
				],
			};
		});
	};

	const deleteGoal: DashboardGoalState["deleteGoal"] = (goalId) => {
		commit((prev) => ({
			goals: prev.goals.filter((goal) => goal.id !== goalId),
			occurrences: prev.occurrences.filter(
				(occurrence) => occurrence.goal_id !== goalId,
			),
		}));
	};

	const deleteGoalOccurrence: DashboardGoalState["deleteGoalOccurrence"] = (
		goalId,
		date,
	) => {
		commit((prev) => {
			const withoutExisting = prev.occurrences.filter(
				(item) => !(item.goal_id === goalId && item.date === date),
			);

			return {
				...prev,
				occurrences: [
					...withoutExisting,
					{
						goal_id: goalId,
						date,
						status: "planned",
						is_deleted: true,
					},
				],
			};
		});
	};

	const detachOccurrence: DashboardGoalState["detachOccurrence"] = ({
		event,
		newDate,
		patch,
	}) => {
		const detachedGoal: Goal = {
			id: createGoalId(),
			owner_id: "demo-user",
			title: patch.title,
			description: patch.description,
			start_time: patch.start_time,
			end_time: patch.end_time,
			start_date: newDate,
			recurrence_type: "none",
			recurrence_days: null,
			recurrence_end: null,
			parent_id: event.goal_id,
			created_at: new Date().toISOString(),
		};

		commit((prev) => {
			const withoutExisting = prev.occurrences.filter(
				(item) =>
					!(
						item.goal_id === event.goal_id &&
						item.date === event.occurrence_date
					),
			);

			return {
				goals: [...prev.goals, detachedGoal],
				occurrences: [
					...withoutExisting,
					{
						goal_id: event.goal_id,
						date: event.occurrence_date,
						status: event.status,
						is_deleted: true,
					},
				],
			};
		});
	};

	const updateGoalFromDate: DashboardGoalState["updateGoalFromDate"] = (
		event,
		fromDate,
		data,
	) => {
		const newGoal: Goal = {
			id: createGoalId(),
			owner_id: "demo-user",
			title: data.title ?? event.title,
			description: data.description,
			start_time: data.start_time ?? event.start_time,
			end_time: data.end_time ?? event.end_time,
			start_date: fromDate,
			recurrence_type: data.recurrence_type,
			recurrence_days: data.recurrence_days ?? null,
			recurrence_end: null,
			parent_id: event.goal_id,
			created_at: new Date().toISOString(),
		};

		commit((prev) => ({
			goals: [...prev.goals, newGoal],
			occurrences: prev.occurrences,
		}));
	};

	return {
		events,
		isPending: false,
		createGoal,
		toggleComplete,
		deleteGoal,
		deleteGoalOccurrence,
		detachOccurrence,
		updateGoal,
		updateGoalFromDate,
	};
}
