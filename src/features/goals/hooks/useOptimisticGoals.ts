import { useRef, useState, useTransition } from "react";
import {
	createDayGoalAction,
	deleteGoalAction,
	setGoalOccurrenceStatusAction,
	updateGoalAction,
} from "../server/actions";
import { GoalStatus } from "../model/types";
import { DayEvent } from "../day/DayClient";

export function useOptimisticGoals(initialEvents: DayEvent[], date: string) {
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
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
	}) => {
		const id = crypto.randomUUID();

		const optimistic: DayEvent = {
			id,
			title: data.title,
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
				await createDayGoalAction(id, date, data);

				requestVersion.current.delete(id);
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
				await setGoalOccurrenceStatusAction(goalId, date, newStatus);
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
