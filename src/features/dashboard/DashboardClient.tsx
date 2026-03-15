"use client";

import TimeColumn from "./components/TimeColumn";
import WeekGrid from "./components/WeekGrid";
import WeekHeader from "./components/WeekHeader";
import CreateGoal from "./components/CreateGoal";
import { Goal, GoalOccurrence } from "../goals/model/types";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import { addDays, format } from "date-fns";

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

	return (
		<div className="min-h-screen bg-background text-foreground">
			<WeekHeader />
			<div className="flex border border-border bg-card shadow-sm overflow-hidden">
				<TimeColumn />
				<WeekGrid />
			</div>

			{(selectedSlot || editingEvent) && (
				<CreateGoal
					slot={selectedSlot ?? undefined}
					onClose={onClose}
					onSubmit={onSubmit}
					panelAnchor={panelAnchor}
					onDelete={
						editingEvent
							? editingEvent.recurrence_type !== "none"
								? undefined
								: () => {
										onDelete(editingEvent.goal_id);
										onClose();
									}
							: undefined
					}
					onDeleteOnly={
						editingEvent && editingEvent.recurrence_type !== "none"
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
						editingEvent && editingEvent.recurrence_type !== "none"
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
									date: format(
										addDays(new Date(weekStart), editingEvent.dayIndex),
										"yyyy-MM-dd",
									),
								}
							: undefined
					}
				/>
			)}
		</div>
	);
}

export default function DashboardClient({
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
