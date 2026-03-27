"use client";

import { useCallback } from "react";
import { addDays } from "date-fns";
import { formatISODate } from "@/shared/lib/date";
import { DAY_MINUTES, minutesToTime, timeToMinutes } from "@/shared/lib/time";
import {
	DayEvent,
	RecurrenceType,
	SelectedSlot,
} from "@/features/goals/model/types";
import type { useOptimisticGoals } from "@/features/goals/hooks/useOptimisticGoals";

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

type GoalOperations = Pick<
	ReturnType<typeof useOptimisticGoals>,
	| "createGoal"
	| "updateGoal"
	| "detachOccurrence"
	| "updateGoalFromDate"
>;

type UseDashboardInteractionsParams = {
	events: DayEvent[];
	weekStart: string;
	selectedSlot: SelectedSlot | null;
	setSelectedSlot: React.Dispatch<React.SetStateAction<SelectedSlot | null>>;
	editingEvent: DayEvent | null;
	setEditingEvent: React.Dispatch<React.SetStateAction<DayEvent | null>>;
	goalOperations: GoalOperations;
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

export function useDashboardInteractions({
	events,
	weekStart,
	selectedSlot,
	setSelectedSlot,
	editingEvent,
	setEditingEvent,
	goalOperations,
}: UseDashboardInteractionsParams) {
	const {
		createGoal,
		updateGoal,
		detachOccurrence,
		updateGoalFromDate,
	} =
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
		(data: SubmitPayload) => {
			if (editingEvent) {
				const isRecurring = editingEvent.recurrence_type !== "none";

				if (!isRecurring) {
					updateGoal(editingEvent.goal_id, {
						title: data.title,
						description: data.description,
						start_time: data.start_time,
						end_time: data.end_time,
					});
					setEditingEvent(null);
					return;
				}

				if (data.edit_scope === "future") {
					updateGoalFromDate(editingEvent, {
						title: data.title,
						description: data.description,
						start_time: data.start_time,
						end_time: data.end_time,
						recurrence_type: data.recurrence_type,
						recurrence_days: data.recurrence_days ?? null,
					});
				} else {
					detachOccurrence({
						event: editingEvent,
						newDate: editingEvent.occurrence_date,
						patch: {
							title: data.title,
							description: data.description,
							start_time: data.start_time,
							end_time: data.end_time,
						},
					});
				}

				setEditingEvent(null);
				return;
			}

			if (!selectedSlot) return;
			createGoal({
				title: data.title,
				description: data.description,
				start_time: data.start_time,
				end_time: data.end_time,
				date: selectedSlot.date,
				recurrence_type: data.recurrence_type,
				recurrence_days: data.recurrence_days,
			});
			setSelectedSlot(null);
		},
		[
			createGoal,
			detachOccurrence,
			editingEvent,
			selectedSlot,
			setEditingEvent,
			setSelectedSlot,
			updateGoal,
			updateGoalFromDate,
		],
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
		[detachOccurrence, events, updateGoal, weekStart],
	);

	return {
		onEdit,
		onSubmit,
		onEventDrop,
	};
}
