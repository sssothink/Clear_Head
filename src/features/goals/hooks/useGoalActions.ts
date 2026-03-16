import { useTransition } from "react";
import { differenceInDays, format } from "date-fns";
import {
	createDayGoalAction,
	deleteGoalOccurrenceAction,
	deleteGoalAction,
	setGoalOccurrenceStatusAction,
	updateGoalAction,
	updateGoalOccurrenceAction,
	detachGoalOccurrenceAction,
} from "../server/actions";
import { DayEvent, GoalStatus } from "../model/types";
import { useRequestTracking } from "./useRequestTracking";

export function useGoalActions(
	events: DayEvent[],
	onEventsChange: {
		addEvent: (event: DayEvent) => void;
		updateEvent: (id: string, updates: Partial<Omit<DayEvent, "id">>) => void;
		deleteEvent: (id: string) => void;
		deleteEventsByGoalId: (goalId: string) => void;
		replaceEvent: (oldId: string, newId: string) => void;
		replaceGoalId: (oldGoalId: string, newGoalId: string) => void;
		replaceEventAndGoalId: (oldId: string, newId: string) => void;

		restoreEvent: (event: DayEvent) => void;
	},
	weekStart: string,
) {
	const [isPending, startTransition] = useTransition();
	const { bumpVersion, isLatest, clear } = useRequestTracking();

	const createGoal = (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
	}) => {
		const optimisticIds: string[] = [];

		const getWeekDates = (weekStart: string) => {
			const base = new Date(weekStart);
			const dates: string[] = [];
			for (let i = 0; i < 7; i++) {
				const d = new Date(base);
				d.setDate(base.getDate() + i);
				dates.push(format(d, "yyyy-MM-dd"));
			}
			return dates;
		};

		const tempGoalId = crypto.randomUUID();
		const weekDates = getWeekDates(weekStart);

		const addOptimisticEvent = (date: string, dayIndex: number) => {
			const optimistic: DayEvent = {
				id: `${tempGoalId}_${date}`,
				goal_id: tempGoalId,
				occurrence_date: date,
				title: data.title,
				description: data.description,
				dayIndex,
				start_time: data.start_time,
				end_time: data.end_time,
				status: "planned",
				recurrence_type: data.recurrence_type,
				recurrence_days: data.recurrence_days ?? null,
			};

			bumpVersion(optimistic.id);
			optimisticIds.push(optimistic.id);
			onEventsChange.addEvent(optimistic);
		};

		if (data.recurrence_type === "none") {
			const dayIndex = differenceInDays(
				new Date(data.date),
				new Date(weekStart),
			);
			addOptimisticEvent(data.date, Math.max(0, Math.min(6, dayIndex)));
		} else if (data.recurrence_type === "daily") {
			weekDates.forEach((date, dayIndex) => {
				addOptimisticEvent(date, dayIndex);
			});
		} else if (data.recurrence_type === "weekly") {
			weekDates.forEach((date, dayIndex) => {
				const d = new Date(date);
				const weekDay = d.getDay();
				const normalized = weekDay === 0 ? 7 : weekDay;
				if (data.recurrence_days?.includes(normalized)) {
					addOptimisticEvent(date, dayIndex);
				}
			});
		}

		startTransition(async () => {
			try {
				const created = await createDayGoalAction(data);
				onEventsChange.replaceGoalId(tempGoalId, created.id);
				optimisticIds.forEach((oldId) => clear(oldId));
			} catch {
				onEventsChange.deleteEventsByGoalId(tempGoalId);
				optimisticIds.forEach((oldId) => clear(oldId));
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

				await setGoalOccurrenceStatusAction(
					target.goal_id,
					formattedDate,
					newStatus,
				);
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
		const target = events.find((e) => e.goal_id === goalId || e.id === goalId);
		if (!target) return;

		const previous = { ...target };
		const version = bumpVersion(target.id);

		onEventsChange.updateEvent(target.id, data);

		startTransition(async () => {
			try {
				const dataForServer = { ...data };
				delete dataForServer.dayIndex;
				delete dataForServer.goal_id;
				delete dataForServer.occurrence_date;

				await updateGoalAction(target.goal_id, dataForServer);
			} catch {
				if (isLatest(target.id, version)) {
					onEventsChange.updateEvent(target.id, {
						title: previous.title,
						description: previous.description,
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

	const updateGoalOccurrence = (
		goalId: string,
		date: string,
		data: Partial<Omit<DayEvent, "id" | "status">>,
	) => {
		const target = events.find(
			(e) => e.goal_id === goalId && e.occurrence_date === date,
		);
		if (!target) return;

		const previous = { ...target };
		const version = bumpVersion(target.id);

		onEventsChange.updateEvent(target.id, data);

		startTransition(async () => {
			try {
				const dataForServer = { ...data };
				delete dataForServer.dayIndex;
				delete dataForServer.goal_id;
				delete dataForServer.start_date;
				delete dataForServer.occurrence_date;

				await updateGoalOccurrenceAction(goalId, date, dataForServer);
			} catch {
				if (isLatest(target.id, version)) {
					onEventsChange.updateEvent(target.id, {
						title: previous.title,
						description: previous.description,
						dayIndex: previous.dayIndex,
						start_time: previous.start_time,
						end_time: previous.end_time,
						start_date: previous.start_date,
					});
				}
			}
		});
	};

	const updateGoalSeries = (
		goalId: string,
		data: Partial<Omit<DayEvent, "id" | "status">>,
	) => {
		const targets = events.filter((e) => e.goal_id === goalId);
		if (targets.length === 0) return;

		const previous = targets.map((e) => ({ ...e }));
		targets.forEach((e) => onEventsChange.updateEvent(e.id, data));

		startTransition(async () => {
			try {
				const dataForServer = { ...data };
				delete dataForServer.dayIndex;
				delete dataForServer.goal_id;
				delete dataForServer.occurrence_date;
				await updateGoalAction(goalId, dataForServer);
			} catch {
				previous.forEach((prev) => {
					onEventsChange.updateEvent(prev.id, {
						title: prev.title,
						description: prev.description,
						dayIndex: prev.dayIndex,
						start_time: prev.start_time,
						end_time: prev.end_time,
						start_date: prev.start_date,
					});
				});
			}
		});
	};

	const detachGoalOccurrence = (
		goalId: string,
		newDate: string,
		oldDate: string,
		data: {
			title: string;
			description?: string;
			start_time: string;
			end_time: string;
		},
	) => {
		const target = events.find(
			(e) => e.goal_id === goalId && e.occurrence_date === oldDate,
		);
		if (!target) return;

		onEventsChange.deleteEvent(target.id);

		const tempId = crypto.randomUUID();
		const detached: DayEvent = {
			...target,
			id: tempId,
			goal_id: tempId,
			occurrence_date: newDate,
			recurrence_type: "none",
			recurrence_days: null,
			start_date: newDate,
			title: data.title,
			description: data.description,
			start_time: data.start_time,
			end_time: data.end_time,
		};

		onEventsChange.addEvent(detached);

		startTransition(async () => {
			try {
				const created = await detachGoalOccurrenceAction({
					goalId,
					newDate,
					oldDate,
					...data,
				});

				onEventsChange.replaceEventAndGoalId(tempId, created.id);
			} catch {
				onEventsChange.restoreEvent(target);
				onEventsChange.deleteEvent(tempId);
			}
		});
	};

	const detachGoalOccurrenceWithMove = (
		goalId: string,
		oldDate: string,
		newDate: string,
		newDayIndex: number,
		data: {
			title: string;
			description?: string;
			start_time: string;
			end_time: string;
		},
	) => {
		const target = events.find(
			(e) => e.goal_id === goalId && e.occurrence_date === oldDate,
		);
		if (!target) return;

		onEventsChange.deleteEvent(target.id);

		const tempId = crypto.randomUUID();
		const detached: DayEvent = {
			...target,
			id: tempId,
			goal_id: tempId,
			occurrence_date: newDate,
			recurrence_type: "none",
			recurrence_days: null,
			start_date: newDate,
			dayIndex: newDayIndex,
			title: data.title,
			description: data.description,
			start_time: data.start_time,
			end_time: data.end_time,
		};

		onEventsChange.addEvent(detached);

		startTransition(async () => {
			try {
				const created = await detachGoalOccurrenceAction({
					goalId,
					newDate,
					oldDate,
					...data,
				});

				onEventsChange.replaceEventAndGoalId(tempId, created.id);
			} catch {
				onEventsChange.restoreEvent(target);
				onEventsChange.deleteEvent(tempId);
			}
		});
	};

	const deleteGoal = (goalId: string) => {
		const backup = events.find((e) => e.goal_id === goalId || e.id === goalId);
		if (!backup) return;

		const version = bumpVersion(backup.id);

		onEventsChange.deleteEventsByGoalId(backup.goal_id);

		startTransition(async () => {
			try {
				await deleteGoalAction(backup.goal_id);
			} catch {
				if (isLatest(backup.id, version)) {
					onEventsChange.restoreEvent(backup);
				}
			}
		});
	};

	const deleteGoalOccurrence = (goalId: string, date: string) => {
		const target = events.find(
			(e) => e.goal_id === goalId && e.occurrence_date === date,
		);
		if (!target) return;

		const version = bumpVersion(target.id);

		onEventsChange.deleteEvent(target.id);

		startTransition(async () => {
			try {
				await deleteGoalOccurrenceAction(goalId, date);
			} catch {
				if (isLatest(target.id, version)) {
					onEventsChange.restoreEvent(target);
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
		updateGoalOccurrence,
		updateGoalSeries,
		detachGoalOccurrence,
		detachGoalOccurrenceWithMove,
		deleteGoalOccurrence,
		deleteGoal,
	};
}
