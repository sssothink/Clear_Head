import { useState } from "react";
import { DayEvent } from "../model/types";

export function useGoalEvents(initialEvents: DayEvent[]) {
	const [events, setEvents] = useState<DayEvent[]>(initialEvents);

	const addEvent = (event: DayEvent) => {
		setEvents((prev) =>
			[...prev, event].sort((a, b) => a.start_time.localeCompare(b.start_time)),
		);
	};

	const updateEvent = (id: string, updates: Partial<Omit<DayEvent, "id">>) => {
		setEvents((prev) =>
			prev
				.map((e) => (e.id === id ? { ...e, ...updates } : e))
				.sort((a, b) => a.start_time.localeCompare(b.start_time)),
		);
	};

	const deleteEvent = (id: string) => {
		setEvents((prev) => prev.filter((e) => e.id !== id));
	};

	const deleteEventsByGoalId = (goalId: string) => {
		setEvents((prev) => prev.filter((e) => e.goal_id !== goalId));
	};

	const replaceEvent = (oldId: string, newId: string) => {
		setEvents((prev) =>
			prev.map((e) => (e.id === oldId ? { ...e, id: newId } : e)),
		);
	};

	const replaceGoalId = (oldGoalId: string, newGoalId: string) => {
		setEvents((prev) =>
			prev.map((e) =>
				e.goal_id === oldGoalId
					? {
							...e,
							goal_id: newGoalId,
							id: `${newGoalId}_${e.occurrence_date}`,
						}
					: e,
			),
		);
	};

	const replaceEventAndGoalId = (oldId: string, newId: string) => {
		setEvents((prev) =>
			prev.map((e) =>
				e.id === oldId
					? {
							...e,
							id: newId,
							goal_id: newId,
						}
					: e,
			),
		);
	};

	const restoreEvent = (event: DayEvent) => {
		setEvents((prev) =>
			[...prev, event].sort((a, b) => a.start_time.localeCompare(b.start_time)),
		);
	};

	return {
		events,
		setEvents,
		addEvent,
		updateEvent,
		deleteEvent,
		deleteEventsByGoalId,
		replaceEventAndGoalId,
		replaceEvent,
		replaceGoalId,
		restoreEvent,
	};
}
