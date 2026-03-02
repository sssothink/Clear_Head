"use client";

import { useState } from "react";
import TimeColumn from "./components/TimeColumn";
import WeekGrid from "./components/WeekGrid";
import WeekHeader from "./components/WeekHeader";
import CreateGoal from "./components/CreateGoal";
import { DayEvent, Goal, SelectedSlot } from "../goals/model/types";
import { useOptimisticGoals } from "../goals/hooks/useOptimisticGoals";
import { useCallback, useMemo } from "react";
import { addDays } from "date-fns";
import { buildWeekEvents } from "@/lib/week/build-week-events";

export default function DashboardClient({
	initialGoals,
	weekStart,
}: {
	initialGoals: Goal[];
	weekStart: string;
}) {
	const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);
	const [editingEvent, setEditingEvent] = useState<DayEvent | null>(null);

	const baseEvents = useMemo(
		() => buildWeekEvents(initialGoals, weekStart),
		[initialGoals, weekStart],
	);

	const {
		events: optimisticEvents,
		createGoal,
		toggleComplete,
		deleteGoal,
		updateGoal,
	} = useOptimisticGoals(baseEvents, weekStart);

	const handleCellClick = useCallback(
		(slot: { dayIndex: number; hourIndex: number; date: string }) => {
			setEditingEvent(null);
			setSelectedSlot(slot);
		},
		[],
	);

	const handleEdit = useCallback(
		(id: string) => {
			const ev = optimisticEvents.find((e) => e.id === id);
			if (ev) {
				setEditingEvent(ev);
				setSelectedSlot(null);
			}
		},
		[optimisticEvents],
	);

	const handleSubmit = useCallback(
		(data: {
			title: string;
			start_time: string;
			end_time: string;
			date: string;
			recurrence_type: "none" | "daily" | "weekly";
			recurrence_days?: number[];
		}) => {
			if (editingEvent) {
				updateGoal(editingEvent.id, {
					title: data.title,
					start_time: data.start_time,
					end_time: data.end_time,
				});
				setEditingEvent(null);
			} else {
				if (!selectedSlot) return;
				createGoal({ ...data, date: selectedSlot.date });
				setSelectedSlot(null);
			}
		},
		[createGoal, selectedSlot, editingEvent, updateGoal],
	);

	return (
		<div className="flex flex-col bg-background">
			<WeekHeader />
			<div className="flex flex-1">
				<TimeColumn />
				<WeekGrid
					onCellClick={handleCellClick}
					events={optimisticEvents}
					weekStart={weekStart}
					onToggle={toggleComplete}
					onDeleteGoal={deleteGoal}
					onEditGoal={handleEdit}
				/>
			</div>

			{(selectedSlot || editingEvent) && (
				<CreateGoal
					slot={selectedSlot ?? undefined}
					onClose={() => {
						setSelectedSlot(null);
						setEditingEvent(null);
					}}
					onSubmit={handleSubmit}
					initialData={
						editingEvent
							? {
								  title: editingEvent.title,
								  start_time: editingEvent.start_time,
								  end_time: editingEvent.end_time,
								  date: addDays(new Date(weekStart), editingEvent.dayIndex)
									  .toISOString()
									  .split("T")[0],
							  }
							: undefined
					}
				/>
			)}
		</div>
	);
}
