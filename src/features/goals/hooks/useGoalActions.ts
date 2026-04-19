import { useTransition } from "react";
import { differenceInDays } from "date-fns";
import {
	createDayGoalAction,
	deleteGoalOccurrenceAction,
	deleteGoalAction,
	setGoalOccurrenceStatusAction,
	updateGoalAction,
	updateGoalOccurrenceAction,
	detachGoalOccurrenceAction,
	splitGoalSeriesFromDateAction,
} from "../server/actions";
import { DayEvent, GoalStatus, RecurrenceType } from "../model/types";
import { useRequestTracking } from "./useRequestTracking";
import { formatISODate } from "@/shared/lib/date";
import { toNormalizedWeekday } from "@/shared/lib/recurrence";
import { useRouter } from "next/navigation";

export function useGoalActions(
	events: DayEvent[],
	onEventsChange: {
		addEvent: (event: DayEvent) => void;
		updateEvent: (id: string, updates: Partial<Omit<DayEvent, "id">>) => void;
		deleteEvent: (id: string) => void;
		deleteEventsByGoalId: (goalId: string) => void;
		replaceGoalId: (oldGoalId: string, newGoalId: string) => void;
		replaceEventAndGoalId: (oldId: string, newId: string) => void;
		restoreEvent: (event: DayEvent) => void;
	},
	weekStart: string,
) {
	const [isPending, startTransition] = useTransition();
	const { bumpVersion, isLatest, clear } = useRequestTracking();
	const router = useRouter();

	type EventUpdateInput = Partial<Omit<DayEvent, "id" | "status">>;

	type DetachPatch = {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
	};

	type DetachOccurrenceParams = {
		event: DayEvent;
		newDate: string;
		patch: DetachPatch;
		newDayIndex?: number;
	};

	const omitKeys = <T extends Record<string, unknown>>(
		value: T,
		keysToOmit: readonly string[],
	) =>
		Object.fromEntries(
			Object.entries(value).filter(([key]) => !keysToOmit.includes(key)),
		);

	const toGoalUpdatePayload = (data: EventUpdateInput) => {
		return omitKeys(data, ["dayIndex", "goal_id", "occurrence_date"]);
	};

	const toOccurrenceUpdatePayload = (data: EventUpdateInput) => {
		return omitKeys(data, [
			"dayIndex",
			"goal_id",
			"start_date",
			"occurrence_date",
		]);
	};

	const buildRollbackPatch = (prev: DayEvent, includeStatus = false) => {
		const base = {
			title: prev.title,
			description: prev.description,
			dayIndex: prev.dayIndex,
			start_time: prev.start_time,
			end_time: prev.end_time,
			start_date: prev.start_date,
		};
		return includeStatus ? { ...base, status: prev.status } : base;
	};

	const createGoal = (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: RecurrenceType;
		recurrence_days?: number[];
	}) => {
		const optimisticIds: string[] = [];

		const getWeekDates = (weekStart: string) => {
			const base = new Date(weekStart);
			const dates: string[] = [];
			for (let i = 0; i < 7; i++) {
				const d = new Date(base);
				d.setDate(base.getDate() + i);
				dates.push(formatISODate(d));
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
				if (date < data.date) return;
				addOptimisticEvent(date, dayIndex);
			});
		} else if (data.recurrence_type === "weekly") {
			weekDates.forEach((date, dayIndex) => {
				if (date < data.date) return;
				const normalized = toNormalizedWeekday(new Date(date));
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
				const formattedDate = formatISODate(goalDate);

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

	const updateGoal = (goalId: string, data: EventUpdateInput) => {
		const target = events.find((e) => e.goal_id === goalId || e.id === goalId);
		if (!target) return;

		const previous = { ...target };
		const version = bumpVersion(target.id);

		onEventsChange.updateEvent(target.id, data);

		startTransition(async () => {
			try {
				await updateGoalAction(target.goal_id, toGoalUpdatePayload(data));
			} catch {
				if (isLatest(target.id, version)) {
					onEventsChange.updateEvent(
						target.id,
						buildRollbackPatch(previous, true),
					);
				}
			}
		});
	};

	const updateGoalOccurrence = (
		goalId: string,
		date: string,
		data: EventUpdateInput,
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
				await updateGoalOccurrenceAction(
					goalId,
					date,
					toOccurrenceUpdatePayload(data),
				);
			} catch {
				if (isLatest(target.id, version)) {
					onEventsChange.updateEvent(target.id, buildRollbackPatch(previous));
				}
			}
		});
	};

	const updateGoalSeries = (goalId: string, data: EventUpdateInput) => {
		const targets = events.filter((e) => e.goal_id === goalId);
		if (targets.length === 0) return;

		const previous = targets.map((e) => ({ ...e }));
		targets.forEach((e) => onEventsChange.updateEvent(e.id, data));

		startTransition(async () => {
			try {
				await updateGoalAction(goalId, toGoalUpdatePayload(data));
			} catch {
				previous.forEach((prev) => {
					onEventsChange.updateEvent(prev.id, buildRollbackPatch(prev));
				});
			}
		});
	};

	const detachOccurrence = ({
		event,
		newDate,
		patch,
		newDayIndex,
	}: DetachOccurrenceParams) => {
		const goalId = event.goal_id;
		const oldDate = event.occurrence_date;
		onEventsChange.deleteEvent(event.id);

		const tempId = crypto.randomUUID();
		const detached: DayEvent = {
			...event,
			id: tempId,
			goal_id: tempId,
			occurrence_date: newDate,
			recurrence_type: "none",
			recurrence_days: null,
			start_date: newDate,
			dayIndex: newDayIndex ?? event.dayIndex,
			title: patch.title,
			description: patch.description,
			start_time: patch.start_time,
			end_time: patch.end_time,
		};

		onEventsChange.addEvent(detached);

		startTransition(async () => {
			try {
				const created = await detachGoalOccurrenceAction({
					goalId,
					newDate,
					oldDate,
					...patch,
				});
				onEventsChange.replaceEventAndGoalId(tempId, created.id);
			} catch {
				onEventsChange.restoreEvent(event);
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

	const updateGoalFromDate = (
		event: DayEvent,
		fromDate: string,
		data: EventUpdateInput & {
			recurrence_type: RecurrenceType;
			recurrence_days?: number[] | null;
		},
	) => {
		startTransition(async () => {
			try {
				await splitGoalSeriesFromDateAction({
					goalId: event.goal_id,
					fromDate,
					updates: {
						title: data.title,
						description: data.description,
						start_time: data.start_time,
						end_time: data.end_time,
						recurrence_type: data.recurrence_type,
						recurrence_days: data.recurrence_days ?? null,
					},
				});
				router.refresh();
			} catch {
				// no-op: keep current local state until next successful refresh
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
		detachOccurrence,
		updateGoalFromDate,
		deleteGoalOccurrence,
		deleteGoal,
	};
}
