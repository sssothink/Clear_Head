"use client";

import TimeColumn from "./components/TimeColumn";
import WeekGrid from "./components/WeekGrid";
import WeekHeader from "./components/WeekHeader";
import CreateGoal from "./components/CreateGoal";
import { Goal } from "../goals/model/types";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import { addDays } from "date-fns";

function DashboardContent() {
	const {
		events,
		weekStart,
		selectedSlot,
		editingEvent,
		onToggle,
		onDelete,
		onCellClick,
		onEdit,
		onSubmit,
		onClose,
	} = useDashboard();

	return (
		<div className="flex flex-col bg-background">
			<WeekHeader />
			<div className="flex flex-1">
				<TimeColumn />
				<WeekGrid />
			</div>

			{(selectedSlot || editingEvent) && (
				<CreateGoal
					slot={selectedSlot ?? undefined}
					onClose={onClose}
					onSubmit={onSubmit}
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

export default function DashboardClient({
	initialGoals,
	weekStart,
}: {
	initialGoals: Goal[];
	weekStart: string;
}) {
	return (
		<DashboardProvider initialGoals={initialGoals} weekStart={weekStart}>
			<DashboardContent />
		</DashboardProvider>
	);
}
