"use client";

import TimeColumn from "./components/TimeColumn";
import WeekGrid from "./components/WeekGrid";
import WeekHeader from "./components/WeekHeader";
import CreateGoal from "./components/CreateGoal";
import { Goal } from "../goals/model/types";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import { addDays, format } from "date-fns";

function DashboardContent() {
	const {
		weekStart,
		selectedSlot,
		editingEvent,
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
