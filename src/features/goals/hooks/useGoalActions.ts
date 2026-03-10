import { useTransition } from "react";
import { differenceInDays, format } from "date-fns";
import {
	createDayGoalAction,
	deleteGoalAction,
	setGoalOccurrenceStatusAction,
	updateGoalAction,
} from "../server/actions";
import { DayEvent, GoalStatus } from "../model/types";
import { useRequestTracking } from "./useRequestTracking";

export function useGoalActions(
	events: DayEvent[],
	onEventsChange: {
		addEvent: (event: DayEvent) => void;
		updateEvent: (id: string, updates: Partial<Omit<DayEvent, "id">>) => void;
		deleteEvent: (id: string) => void;
		replaceEvent: (oldId: string, newId: string) => void;
		restoreEvent: (event: DayEvent) => void;
	},
	weekStart: string,
) {
	const [isPending, startTransition] = useTransition();
	const { bumpVersion, isLatest, clear } = useRequestTracking();

	const createGoal = (data: {
		title: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
	}) => {
		const id = crypto.randomUUID();
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

		bumpVersion(id);
		onEventsChange.addEvent(optimistic);

		startTransition(async () => {
			try {
				const created = await createDayGoalAction(data);
				onEventsChange.replaceEvent(id, created.id);
				clear(id);
				bumpVersion(created.id);
			} catch {
				onEventsChange.deleteEvent(id);
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

	const setStatus = (goalId: string, newStatus: GoalStatus) => {
		const target = events.find((e) => e.id === goalId);
		if (!target) return;

		const previous = target.status ?? "planned";
		const version = bumpVersion(goalId);

		onEventsChange.updateEvent(goalId, { status: newStatus });

		startTransition(async () => {
			try {
				const goalDate = new Date(weekStart);
				goalDate.setDate(goalDate.getDate() + target.dayIndex);
				const formattedDate = format(goalDate, "yyyy-MM-dd");

				await setGoalOccurrenceStatusAction(goalId, formattedDate, newStatus);
			} catch {
				if (isLatest(goalId, version)) {
					onEventsChange.updateEvent(goalId, { status: previous });
				}
			}
		});
	};

	const updateGoal = (
		goalId: string,
		data: Partial<Omit<DayEvent, "id" | "status">>,
	) => {
		const target = events.find((e) => e.id === goalId);
		if (!target) return;

		const previous = { ...target };
		const version = bumpVersion(goalId);

		onEventsChange.updateEvent(goalId, data);

		startTransition(async () => {
			try {
				const dataForServer = { ...data };
				delete dataForServer.dayIndex;
				await updateGoalAction(goalId, dataForServer);
			} catch {
				if (isLatest(goalId, version)) {
					onEventsChange.updateEvent(goalId, {
						title: previous.title,
						dayIndex: previous.dayIndex,
						start_time: previous.start_time,
						end_time: previous.end_time,
						start_date: previous.start_date,
						status: previous.status,
					});
				}
			}
		});
	};

	const deleteGoal = (goalId: string) => {
		const backup = events.find((e) => e.id === goalId);
		if (!backup) return;

		const version = bumpVersion(goalId);

		onEventsChange.deleteEvent(goalId);

		startTransition(async () => {
			try {
				await deleteGoalAction(goalId);
			} catch {
				if (isLatest(goalId, version)) {
					onEventsChange.restoreEvent(backup);
				}
			}
		});
	};

	return {
		isPending,
		createGoal,
		toggleComplete,
		setStatus,
		updateGoal,
		deleteGoal,
	};
}
