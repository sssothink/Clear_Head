"use client";

import TimeGutter from "./time-gutter";
import WeekGrid from "./week-grid";
import WeekDaysHeader from "./week-days-header";
import GoalEditorPopover from "./goal-editor-popover";
import { Goal, GoalOccurrence } from "@/features/goals/model/types";
import { DashboardProvider, useDashboard } from "../model";
import { addDays } from "date-fns";
import { formatISODate } from "@/shared/lib/date";

function DashboardContent() {
	const {
		weekStart,
		selectedSlot,
		editingEvent,
		onSubmit,
		onClose,
		onDelete,
		onDeleteOccurrence,
		panelAnchor,
	} = useDashboard();

	const isRecurring = editingEvent?.recurrence_type !== "none";

	return (
		<div className="min-h-screen bg-background text-foreground">
			<WeekDaysHeader />
			<div className="flex border border-border bg-card shadow-sm overflow-hidden">
				<TimeGutter />
				<WeekGrid />
			</div>

			{(selectedSlot || editingEvent) && (
				<GoalEditorPopover
					key={
						editingEvent
							? `edit-${editingEvent.id}`
							: `slot-${selectedSlot?.dayIndex}-${selectedSlot?.hourIndex}-${selectedSlot?.date}`
					}
					slot={selectedSlot ?? undefined}
					onClose={onClose}
					onSubmit={onSubmit}
					panelAnchor={panelAnchor}
					onDelete={
						editingEvent
							? isRecurring
								? undefined
								: () => {
										onDelete(editingEvent.goal_id);
										onClose();
									}
							: undefined
					}
					onDeleteOnly={
						editingEvent && isRecurring
							? () => {
									onDeleteOccurrence(
										editingEvent.goal_id,
										editingEvent.occurrence_date,
									);
									onClose();
								}
							: undefined
					}
					onDeleteAll={
						editingEvent && isRecurring
							? () => {
									onDelete(editingEvent.goal_id);
									onClose();
								}
							: undefined
					}
					initialData={
						editingEvent
							? {
									title: editingEvent.title,
									description: editingEvent.description,
									start_time: editingEvent.start_time,
									end_time: editingEvent.end_time,
									recurrence_type: editingEvent.recurrence_type,
									recurrence_days: editingEvent.recurrence_days,
									date: formatISODate(
										addDays(new Date(weekStart), editingEvent.dayIndex),
									),
								}
							: undefined
					}
				/>
			)}
		</div>
	);
}

export default function DashboardScreen({
	initialGoals,
	initialOccurrences,
	weekStart,
}: {
	initialGoals: Goal[];
	initialOccurrences: GoalOccurrence[];
	weekStart: string;
}) {
	return (
		<DashboardProvider
			initialGoals={initialGoals}
			initialOccurrences={initialOccurrences}
			weekStart={weekStart}
		>
			<DashboardContent />
		</DashboardProvider>
	);
}
