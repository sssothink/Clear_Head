"use client";

import { useCallback } from "react";
import { addDays, differenceInDays } from "date-fns";
import { formatISODate } from "@/shared/lib/date";
import { DAY_MINUTES, minutesToTime, timeToMinutes } from "@/shared/lib/time";
import {
	DayEvent,
	RecurrenceType,
	SelectedSlot,
} from "@/features/goals/model/types";
import type { useOptimisticGoals } from "@/features/goals/hooks/useOptimisticGoals";
import { exceedsMaxConcurrentEvents } from "./event-conflicts";

type SubmitPayload = {
	title: string;
	description?: string;
	start_time: string;
	end_time: string;
	date: string;
	recurrence_type: RecurrenceType;
	recurrence_days?: number[];
	edit_scope?: "single" | "future";
};

export type SubmitResult = { ok: true } | { ok: false; message: string };

const MAX_CONCURRENT_MESSAGE = "You can place up to 3 tasks at the same time.";

type GoalOperations = Pick<
	ReturnType<typeof useOptimisticGoals>,
	"createGoal" | "updateGoal" | "detachOccurrence" | "updateGoalFromDate"
>;

type UseDashboardInteractionsParams = {
	events: DayEvent[];
	weekStart: string;
	selectedSlot: SelectedSlot | null;
	setSelectedSlot: React.Dispatch<React.SetStateAction<SelectedSlot | null>>;
	editingEvent: DayEvent | null;
	setEditingEvent: React.Dispatch<React.SetStateAction<DayEvent | null>>;
	goalOperations: GoalOperations;
	onScheduleNotice: (message: string) => void;
};

function buildMovedTimeRange(
	startTime: string,
	endTime: string,
	newHourIndex: number,
) {
	const startM = timeToMinutes(startTime);
	const endM =
		endTime === "00:00" && startTime !== "00:00"
			? 1440
			: timeToMinutes(endTime);
	const duration = endM - startM;
	const newStartTotalMinutes = newHourIndex * 60;
	const newEndTotalMinutes = (newStartTotalMinutes + duration) % DAY_MINUTES;

	return {
		newStartTime: minutesToTime(newStartTotalMinutes),
		newEndTime: minutesToTime(newEndTotalMinutes),
	};
}

function getDateByDayIndex(weekStartDate: string, dayIndex: number) {
	return formatISODate(addDays(new Date(weekStartDate), dayIndex));
}

function getNormalizedWeekday(date: Date) {
	const day = date.getDay();
	return day === 0 ? 7 : day;
}

function buildSubmitCandidates(
	data: SubmitPayload,
	weekStart: string,
	baseEvent?: DayEvent,
) {
	const weekStartDate = new Date(weekStart);
	const candidates: Array<
		Pick<DayEvent, "id" | "dayIndex" | "start_time" | "end_time">
	> = [];

	for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
		const currentDate = addDays(weekStartDate, dayIndex);
		const currentDateIso = formatISODate(currentDate);

		if (currentDateIso < data.date) {
			continue;
		}

		if (
			(data.recurrence_type === "none" || data.edit_scope === "single") &&
			currentDateIso !== data.date
		) {
			continue;
		}

		if (
			data.recurrence_type === "weekly" &&
			!data.recurrence_days?.includes(getNormalizedWeekday(currentDate))
		) {
			continue;
		}

		const id = baseEvent
			? data.recurrence_type === "none" || data.edit_scope === "single"
				? baseEvent.id
				: `${baseEvent.goal_id}_${currentDateIso}`
			: `new-${currentDateIso}`;

		candidates.push({
			id,
			dayIndex,
			start_time: data.start_time,
			end_time: data.end_time,
		});
	}

	return candidates;
}

export function useDashboardInteractions({
	events,
	weekStart,
	selectedSlot,
	setSelectedSlot,
	editingEvent,
	setEditingEvent,
	goalOperations,
	onScheduleNotice,
}: UseDashboardInteractionsParams) {
	const { createGoal, updateGoal, detachOccurrence, updateGoalFromDate } =
		goalOperations;

	const onEdit = useCallback(
		(id: string) => {
			const event = events.find((item) => item.id === id);
			if (!event) return;

			setEditingEvent(event);
			setSelectedSlot(null);
		},
		[events, setEditingEvent, setSelectedSlot],
	);

	const onSubmit = useCallback(
		(data: SubmitPayload): SubmitResult => {
			const candidates = buildSubmitCandidates(
				data,
				weekStart,
				editingEvent ?? undefined,
			);

			const hasConflict = candidates.some((candidate) =>
				exceedsMaxConcurrentEvents(events, candidate),
			);

			if (hasConflict) {
				return {
					ok: false,
					message: MAX_CONCURRENT_MESSAGE,
				};
			}

			if (editingEvent) {
				const isRecurring = editingEvent.recurrence_type !== "none";

				if (!isRecurring) {
					const nextDayIndex = differenceInDays(
						new Date(data.date),
						new Date(weekStart),
					);

					const isInCurrentWeek = nextDayIndex >= 0 && nextDayIndex <= 6;
					updateGoal(editingEvent.goal_id, {
						title: data.title,
						description: data.description,
						start_time: data.start_time,
						end_time: data.end_time,
						start_date: data.date,
						...(isInCurrentWeek ? { dayIndex: nextDayIndex } : {}),
					});
					setEditingEvent(null);
					return { ok: true };
				}

				if (data.edit_scope === "future") {
					updateGoalFromDate(editingEvent, data.date, {
						title: data.title,
						description: data.description,
						start_time: data.start_time,
						end_time: data.end_time,
						recurrence_type: data.recurrence_type,
						recurrence_days: data.recurrence_days ?? null,
					});
				} else {
					const newDayIndex = differenceInDays(
						new Date(data.date),
						new Date(weekStart),
					);
					const isInCurrentWeek = newDayIndex >= 0 && newDayIndex <= 6;
					detachOccurrence({
						event: editingEvent,
						newDate: editingEvent.occurrence_date,
						newDayIndex: isInCurrentWeek ? newDayIndex : undefined,
						patch: {
							title: data.title,
							description: data.description,
							start_time: data.start_time,
							end_time: data.end_time,
						},
					});
				}

				setEditingEvent(null);
				return { ok: true };
			}

			if (!selectedSlot) {
				return { ok: false, message: "Select a time slot first." };
			}
			createGoal({
				title: data.title,
				description: data.description,
				start_time: data.start_time,
				end_time: data.end_time,
				date: data.date,
				recurrence_type: data.recurrence_type,
				recurrence_days: data.recurrence_days,
			});
			setSelectedSlot(null);
			return { ok: true };
		},
		[
			createGoal,
			detachOccurrence,
			editingEvent,
			events,
			selectedSlot,
			setEditingEvent,
			setSelectedSlot,
			updateGoal,
			updateGoalFromDate,
			weekStart,
		],
	);

	const canEventDrop = useCallback(
		(eventId: string, newDayIndex: number, newHourIndex: number) => {
			const event = events.find((item) => item.id === eventId);
			if (!event) return false;

			const { newStartTime, newEndTime } = buildMovedTimeRange(
				event.start_time,
				event.end_time,
				newHourIndex,
			);

			const candidateEvent = {
				...event,
				dayIndex: newDayIndex,
				start_time: newStartTime,
				end_time: newEndTime,
			};

			return !exceedsMaxConcurrentEvents(events, candidateEvent);
		},
		[events],
	);

	const onEventDrop = useCallback(
		(eventId: string, newDayIndex: number, newHourIndex: number) => {
			const event = events.find((item) => item.id === eventId);
			if (!event) return;

			const { newStartTime, newEndTime } = buildMovedTimeRange(
				event.start_time,
				event.end_time,
				newHourIndex,
			);

			if (!canEventDrop(eventId, newDayIndex, newHourIndex)) {
				onScheduleNotice(MAX_CONCURRENT_MESSAGE);
				return;
			}

			const newDate = getDateByDayIndex(weekStart, newDayIndex);
			const isRecurring = event.recurrence_type !== "none";

			if (isRecurring) {
				detachOccurrence({
					event,
					newDate,
					newDayIndex,
					patch: {
						title: event.title,
						description: event.description,
						start_time: newStartTime,
						end_time: newEndTime,
					},
				});
				return;
			}

			updateGoal(event.goal_id, {
				dayIndex: newDayIndex,
				start_time: newStartTime,
				end_time: newEndTime,
				start_date: newDate,
				title: event.title,
			});
		},
		[
			canEventDrop,
			detachOccurrence,
			events,
			onScheduleNotice,
			updateGoal,
			weekStart,
		],
	);

	const onEventResize = useCallback(
		(eventId: string, nextStartTime: string, nextEndTime: string) => {
			const event = events.find((item) => item.id === eventId);
			if (!event) return;

			if (event.start_time === nextStartTime && event.end_time === nextEndTime)
				return;

			const candidateEvent = {
				...event,
				start_time: nextStartTime,
				end_time: nextEndTime,
			};

			if (exceedsMaxConcurrentEvents(events, candidateEvent)) {
				onScheduleNotice(MAX_CONCURRENT_MESSAGE);
				return;
			}

			const isRecurring = event.recurrence_type !== "none";

			if (isRecurring) {
				detachOccurrence({
					event,
					newDate: event.occurrence_date,
					patch: {
						title: event.title,
						description: event.description,
						start_time: nextStartTime,
						end_time: nextEndTime,
					},
				});
				return;
			}

			updateGoal(event.goal_id, {
				start_time: nextStartTime,
				end_time: nextEndTime,
				title: event.title,
			});
		},
		[detachOccurrence, events, onScheduleNotice, updateGoal],
	);

	return {
		canEventDrop,
		onEdit,
		onSubmit,
		onEventDrop,
		onEventResize,
	};
}
