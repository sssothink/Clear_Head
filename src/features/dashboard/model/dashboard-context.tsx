"use client";

import React, {
	createContext,
	useContext,
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
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
import type { SubmitResult } from "./use-dashboard-interactions";
import { DashboardGoalState } from "./dashboard-goal-state";
import { useDemoGoals } from "../demo/use-demo-goals";

type ScheduleNotice = {
	message: string;
	visible: boolean;
};

export type DashboardContextType = {
	events: DayEvent[];
	weekStart: string;
	isPending: boolean;

	selectedSlot: SelectedSlot | null;
	editingEvent: DayEvent | null;

	scheduleNotice: ScheduleNotice | null;
	clearScheduleNotice: () => void;

	draggedEventId: string | null;
	startEventDrag: (eventId: string) => void;
	finishEventDrag: () => void;

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
	}) => SubmitResult;

	onEventDrop: (
		eventId: string,
		newDayIndex: number,
		newHourIndex: number,
	) => void;
	canEventDrop: (
		eventId: string,
		newDayIndex: number,
		newHourIndex: number,
	) => boolean;

	onEventResize: (
		eventId: string,
		nextStartTime: string,
		nextEndTime: string,
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

function DashboardCoreProvider({
	goalState,
	weekStart,
	children,
}: {
	goalState: DashboardGoalState;
	weekStart: string;
	children: React.ReactNode;
}) {
	const [hourHeight, setHourHeight] = useState(60);

	useEffect(() => {
		window.localStorage.setItem("calendar-hour-height", String(hourHeight));
	}, [hourHeight]);

	const [scheduleNotice, setScheduleNotice] = useState<ScheduleNotice | null>(
		null,
	);
	const scheduleNoticeHideTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);
	const scheduleNoticeClearTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);

	const clearScheduleNotice = useCallback(() => {
		if (scheduleNoticeHideTimeoutRef.current) {
			clearTimeout(scheduleNoticeHideTimeoutRef.current);
			scheduleNoticeHideTimeoutRef.current = null;
		}

		if (scheduleNoticeClearTimeoutRef.current) {
			clearTimeout(scheduleNoticeClearTimeoutRef.current);
			scheduleNoticeClearTimeoutRef.current = null;
		}

		setScheduleNotice(null);
	}, []);

	const showScheduleNotice = useCallback((message: string) => {
		if (scheduleNoticeHideTimeoutRef.current) {
			clearTimeout(scheduleNoticeHideTimeoutRef.current);
		}

		if (scheduleNoticeClearTimeoutRef.current) {
			clearTimeout(scheduleNoticeClearTimeoutRef.current);
		}

		setScheduleNotice({ message, visible: true });

		scheduleNoticeHideTimeoutRef.current = setTimeout(() => {
			setScheduleNotice((current) =>
				current ? { ...current, visible: false } : current,
			);
			scheduleNoticeHideTimeoutRef.current = null;
		}, 2400);

		scheduleNoticeClearTimeoutRef.current = setTimeout(() => {
			setScheduleNotice(null);
			scheduleNoticeClearTimeoutRef.current = null;
		}, 2800);
	}, []);

	useEffect(() => {
		return () => {
			if (scheduleNoticeHideTimeoutRef.current) {
				clearTimeout(scheduleNoticeHideTimeoutRef.current);
			}

			if (scheduleNoticeClearTimeoutRef.current) {
				clearTimeout(scheduleNoticeClearTimeoutRef.current);
			}
		};
	}, []);

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

	const [isCollapsedManual, setIsCollapsedManual] = useState(true);
	const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

	const startEventDrag = useCallback((eventId: string) => {
		setDraggedEventId(eventId);
	}, []);

	const finishEventDrag = useCallback(() => {
		setDraggedEventId(null);
	}, []);

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
	} = goalState;

	const hasEarlyTasks = events.some((event) => {
		const [h, m] = event.start_time.split(":").map(Number);
		return h * 60 + m < 8 * 60;
	});

	const isCollapsed = isCollapsedManual && !hasEarlyTasks;

	const { canEventDrop, onEdit, onSubmit, onEventDrop, onEventResize } =
		useDashboardInteractions({
			events,
			weekStart,
			selectedSlot,
			setSelectedSlot,
			editingEvent,
			setEditingEvent,
			onScheduleNotice: showScheduleNotice,
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

			scheduleNotice,
			clearScheduleNotice,

			draggedEventId,
			startEventDrag,
			finishEventDrag,

			onCellClick,
			onEdit,
			onSubmit,
			onClose,
			onEventDrop,
			canEventDrop,
			onEventResize,

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
			draggedEventId,
			startEventDrag,
			finishEventDrag,
			onCellClick,
			onEdit,
			onSubmit,
			onClose,
			onEventDrop,
			canEventDrop,
			onEventResize,
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
			scheduleNotice,
			clearScheduleNotice,
		],
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
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
	const baseEvents = useMemo(
		() => buildWeekEvents(initialGoals, weekStart, initialOccurrences),
		[initialGoals, weekStart, initialOccurrences],
	);

	const goalState = useOptimisticGoals(baseEvents, weekStart);

	return (
		<DashboardCoreProvider goalState={goalState} weekStart={weekStart}>
			{children}
		</DashboardCoreProvider>
	);
}

export function DemoDashboardProvider({
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
	const goalState = useDemoGoals(initialGoals, initialOccurrences, weekStart);

	return (
		<DashboardCoreProvider goalState={goalState} weekStart={weekStart}>
			{children}
		</DashboardCoreProvider>
	);
}
