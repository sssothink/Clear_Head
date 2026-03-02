import { useRef, useState, useTransition } from "react";
import {
	createDayGoalAction,
	deleteGoalAction,
	setGoalOccurrenceStatusAction,
	updateGoalAction,
} from "../server/actions";
import { DayEvent, GoalStatus } from "../model/types";
import { differenceInDays } from "date-fns";

export function useOptimisticGoals(
	initialEvents: DayEvent[],
	weekStart: string,
) {
	const [events, setEvents] = useState<DayEvent[]>(initialEvents);
	const [isPending, startTransition] = useTransition();

	const requestVersion = useRef(new Map<string, number>());

	const bumpVersion = (id: string) => {
		const next = (requestVersion.current.get(id) ?? 0) + 1;
		requestVersion.current.set(id, next);
		return next;
	};

	const isLatest = (id: string, version: number) =>
		requestVersion.current.get(id) === version;

	// ------------------------
	// CREATE
	// ------------------------

	const createGoal = (data: {
		title: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
	}) => {
		const id = crypto.randomUUID();

		// Calculate dayIndex from weekStart
		const weekStartDate = new Date(weekStart);
		const goalDate = new Date(data.date);
		const dayIndex = differenceInDays(goalDate, weekStartDate);

		const optimistic: DayEvent = {
			id,
			title: data.title,
			dayIndex: Math.max(0, Math.min(6, dayIndex)),
			start_time: data.start_time,
			end_time: data.end_time,
			status: "planned",
		};

		requestVersion.current.set(id, 1);
		setEvents((prev) =>
			[...prev, optimistic].sort((a, b) =>
				a.start_time.localeCompare(b.start_time),
			),
		);

		startTransition(async () => {
			try {
				const created = await createDayGoalAction(data);

				// Replace temporary ID with real ID from server
				setEvents((prev) =>
					prev.map((e) => (e.id === id ? { ...e, id: created.id } : e)),
				);

				requestVersion.current.delete(id);
				requestVersion.current.set(created.id, 0); // Mark real ID as final
			} catch {
				setEvents((prev) => prev.filter((e) => e.id !== id));
			}
		});
	};

	// ------------------------
	// STATUS
	// ------------------------

	const setStatus = (goalId: string, newStatus: GoalStatus) => {
		const target = events.find((e) => e.id === goalId);
		if (!target) return;

		const previous = target.status;
		const version = bumpVersion(goalId);

		setEvents((prev) =>
			prev.map((e) => (e.id === goalId ? { ...e, status: newStatus } : e)),
		);

		startTransition(async () => {
			try {
				// Calculate date from dayIndex and weekStart
				const goalDate = new Date(weekStart);
				goalDate.setDate(goalDate.getDate() + target.dayIndex);
				const formattedDate = goalDate.toISOString().split("T")[0];

				await setGoalOccurrenceStatusAction(goalId, formattedDate, newStatus);
			} catch {
				if (isLatest(goalId, version)) {
					setEvents((prev) =>
						prev.map((e) => (e.id === goalId ? { ...e, status: previous } : e)),
					);
				}
			}
		});
	};

	const toggleComplete = (goalId: string) => {
		const target = events.find((e) => e.id === goalId);
		if (!target) return;

		const nextStatus: GoalStatus =
			target.status === "completed" ? "planned" : "completed";

		setStatus(goalId, nextStatus);
	};

	// ------------------------
	// UPDATE
	// ------------------------

	const updateGoal = (
		goalId: string,
		data: Partial<Omit<DayEvent, "id" | "status">>,
	) => {
		const target = events.find((e) => e.id === goalId);
		if (!target) return;

		const previous = { ...target };
		const version = bumpVersion(goalId);

		setEvents((prev) =>
			prev
				.map((e) => (e.id === goalId ? { ...e, ...data } : e))
				.sort((a, b) => a.start_time.localeCompare(b.start_time)),
		);

		startTransition(async () => {
			try {
				await updateGoalAction(goalId, data);
			} catch {
				if (isLatest(goalId, version)) {
					setEvents((prev) =>
						prev.map((e) => (e.id === goalId ? previous : e)),
					);
				}
			}
		});
	};

	// ------------------------
	// DELETE
	// ------------------------

	const deleteGoal = (goalId: string) => {
		const index = events.findIndex((e) => e.id === goalId);
		if (index === -1) return;

		const backup = events[index];
		const version = bumpVersion(goalId);

		setEvents((prev) => prev.filter((e) => e.id !== goalId));

		startTransition(async () => {
			try {
				await deleteGoalAction(goalId);
			} catch {
				if (isLatest(goalId, version)) {
					setEvents((prev) =>
						[...prev, backup].sort((a, b) =>
							a.start_time.localeCompare(b.start_time),
						),
					);
				}
			}
		});
	};

	return {
		events,
		isPending,
		createGoal,
		setStatus,
		toggleComplete,
		updateGoal,
		deleteGoal,
	};
}
