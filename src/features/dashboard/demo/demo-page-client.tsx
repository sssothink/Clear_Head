"use client";

import { useEffect, useMemo, useState } from "react";
import { isValid, parseISO, startOfWeek } from "date-fns";
import { useSearchParams } from "next/navigation";
import { formatISODate } from "@/shared/lib/date";
import { loadDemoState, resetDemoState } from "./demo-storage";
import DemoDashboardScreen from "./demo-dashboard-screen";
import type { Goal, GoalOccurrence } from "@/features/goals/model/types";

type DemoState = {
	goals: Goal[];
	occurrences: GoalOccurrence[];
};

function getDashboardDate(weekParam: string | null) {
	if (!weekParam) return new Date();

	const parsed = parseISO(weekParam);
	return isValid(parsed) ? parsed : new Date();
}

export default function DemoPageClient() {
	const searchParams = useSearchParams();
	const weekParam = searchParams.get("week");

	const weekStart = useMemo(() => {
		const date = getDashboardDate(weekParam);
		return formatISODate(startOfWeek(date, { weekStartsOn: 1 }));
	}, [weekParam]);

	const [demoState, setDemoState] = useState<DemoState | null>(null);
	const [demoRevision, setDemoRevision] = useState(0);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDemoState(loadDemoState());
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, []);

	const resetDemo = () => {
		setDemoState(resetDemoState());
		setDemoRevision((revision) => revision + 1);
	};

	if (!demoState) {
		return (
			<div className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6">
				<div className="text-sm font-semibold text-muted-foreground">
					Loading demo...
				</div>
			</div>
		);
	}

	return (
		<>
			<DemoDashboardScreen
				key={`${weekStart}-${demoRevision}`}
				initialGoals={demoState.goals}
				initialOccurrences={demoState.occurrences}
				weekStart={weekStart}
			/>

			<button type="button" className="demo-reset-button" onClick={resetDemo}>
				Reset demo
			</button>
		</>
	);
}
