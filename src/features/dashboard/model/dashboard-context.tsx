"use client";

import React, {
	createContext,
	useContext,
	useMemo,
	useState,
	useEffect,
} from "react";
import {
	DayEvent,
	Goal,
	GoalOccurrence,
	RecurrenceType,
	SelectedSlot,
} from "../../goals/model/types";
import { useOptimisticGoals } from "../../goals/hooks/useOptimisticGoals";
import { buildWeekEvents } from "@/lib/week/build-week-events";
import { useDashboardUIState } from "./use-dashboard-ui-state";
import { useDashboardInteractions } from "./use-dashboard-interactions";

export type DashboardContextType = {
	events: DayEvent[];
	weekStart: string;
	isPending: boolean;

	selectedSlot: SelectedSlot | null;
	editingEvent: DayEvent | null;

	onCellClick: (slot: SelectedSlot | null) => void;
	onEdit: (id: string) => void;
	onSubmit: (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: RecurrenceType;
		recurrence_days?: number[];
		edit_scope?: "single" | "future";
	}) => void;

	onEventDrop: (
		eventId: string,
		newDayIndex: number,
		newHourIndex: number,
	) => void;

	onClose: () => void;

	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	onDeleteOccurrence: (goalId: string, date: string) => void;

	isCollapsed: boolean;
	setIsCollapsedManual: React.Dispatch<React.SetStateAction<boolean>>;
	hasEarlyTasks: boolean;
	hourHeight: number;
	setHourHeight: React.Dispatch<React.SetStateAction<number>>;
	panelAnchor: DOMRect | null;
	setPanelAnchor: (rect: DOMRect | null) => void;
	suppressNextOpenRef: React.MutableRefObject<boolean>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
	const ctx = useContext(DashboardContext);
	if (!ctx) {
		throw new Error("useDashboard must be used within a DashboardProvider");
	}
	return ctx;
}

export function DashboardProvider({
	initialGoals,
	initialOccurrences,
	weekStart,
	children,
}: {
	initialGoals: Goal[];
	initialOccurrences: GoalOccurrence[];
	weekStart: string;
	children: React.ReactNode;
}) {
	const [hourHeight, setHourHeight] = useState(() => {
		if (typeof window === "undefined") return 60;
		const raw = window.localStorage.getItem("calendar-hour-height");
		if (!raw) return 60;
		const n = Number(raw);
		return Number.isFinite(n) ? n : 60;
	});

	useEffect(() => {
		window.localStorage.setItem("calendar-hour-height", String(hourHeight));
	}, [hourHeight]);

	const {
		selectedSlot,
		setSelectedSlot,
		editingEvent,
		setEditingEvent,
		panelAnchor,
		setPanelAnchor,
		suppressNextOpenRef,
		onCellClick,
		onClose,
	} = useDashboardUIState();

	const baseEvents = useMemo(
		() => buildWeekEvents(initialGoals, weekStart, initialOccurrences),
		[initialGoals, weekStart, initialOccurrences],
	);

	const {
		events,
		isPending,
		createGoal,
		toggleComplete,
		deleteGoal,
		deleteGoalOccurrence,
		detachOccurrence,
		updateGoal,
		updateGoalFromDate,
	} = useOptimisticGoals(baseEvents, weekStart);

	const [isCollapsedManual, setIsCollapsedManual] = useState(true);

	const hasEarlyTasks = events.some((event) => {
		const [h, m] = event.start_time.split(":").map(Number);
		return h * 60 + m < 8 * 60;
	});

	const isCollapsed = isCollapsedManual && !hasEarlyTasks;

	const { onEdit, onSubmit, onEventDrop } = useDashboardInteractions({
		events,
		weekStart,
		selectedSlot,
		setSelectedSlot,
		editingEvent,
		setEditingEvent,
		goalOperations: {
			createGoal,
			updateGoal,
			detachOccurrence,
			updateGoalFromDate,
		},
	});

	const value = useMemo<DashboardContextType>(
		() => ({
			events,
			weekStart,
			isPending,

			selectedSlot,
			editingEvent,

			onCellClick,
			onEdit,
			onSubmit,
			onClose,
			onEventDrop,

			onToggle: toggleComplete,
			onDelete: deleteGoal,
			onDeleteOccurrence: deleteGoalOccurrence,

			isCollapsed,
			setIsCollapsedManual,
			hasEarlyTasks,
			hourHeight,
			setHourHeight,
			panelAnchor,
			setPanelAnchor,
			suppressNextOpenRef,
		}),
		[
			events,
			weekStart,
			isPending,
			selectedSlot,
			editingEvent,
			onCellClick,
			onEdit,
			onSubmit,
			onClose,
			onEventDrop,
			toggleComplete,
			deleteGoal,
			deleteGoalOccurrence,
			panelAnchor,
			setPanelAnchor,
			suppressNextOpenRef,
			isCollapsed,
			setIsCollapsedManual,
			hasEarlyTasks,
			hourHeight,
		],
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
}
