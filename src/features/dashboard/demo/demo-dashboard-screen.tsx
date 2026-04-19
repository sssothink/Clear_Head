"use client";

import { Goal, GoalOccurrence } from "@/features/goals/model/types";
import { DemoDashboardProvider } from "../model/dashboard-context";
import { DashboardContent } from "../ui/dashboard-screen";

export default function DemoDashboardScreen({
	initialGoals,
	initialOccurrences,
	weekStart,
}: {
	initialGoals: Goal[];
	initialOccurrences: GoalOccurrence[];
	weekStart: string;
}) {
	return (
		<DemoDashboardProvider
			initialGoals={initialGoals}
			initialOccurrences={initialOccurrences}
			weekStart={weekStart}
		>
			<DashboardContent />
		</DemoDashboardProvider>
	);
}
