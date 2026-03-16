import React, {
	createContext,
	useContext,
	useMemo,
	useState,
	useCallback,
	useRef,
} from "react";
import {
	DayEvent,
	Goal,
	GoalOccurrence,
	GoalStatus,
	SelectedSlot,
} from "../../goals/model/types";
import { useOptimisticGoals } from "../../goals/hooks/useOptimisticGoals";
import { buildWeekEvents } from "@/lib/week/build-week-events";
import { addDays, format } from "date-fns";

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
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
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
	const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
	const [editingEvent, setEditingEvent] = useState<DayEvent | null>(null);
	const [panelAnchor, setPanelAnchor] = useState<DOMRect | null>(null);
	const suppressNextOpenRef = useRef(false);

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
		updateGoalSeries,
		detachGoalOccurrence,
		detachGoalOccurrenceWithMove,
		updateGoal,
	} = useOptimisticGoals(baseEvents, weekStart);

	const handleCellClick = useCallback((slot: SelectedSlot | null) => {
		setEditingEvent(null);
		setSelectedSlot(slot);
	}, []);

	const handleEdit = useCallback(
		(id: string) => {
			const ev = events.find((e: DayEvent) => e.id === id);
			if (ev) {
				setEditingEvent(ev);
				setSelectedSlot(null);
			}
		},
		[events],
	);

	const handleSubmit = useCallback(
		(data: {
			title: string;
			description?: string;
			start_time: string;
			end_time: string;
			date: string;
			recurrence_type: "none" | "daily" | "weekly";
			recurrence_days?: number[];
		}) => {
			if (editingEvent) {
				const isRecurring = editingEvent.recurrence_type !== "none";

				if (!isRecurring) {
					updateGoal(editingEvent.goal_id, {
						title: data.title,
						description: data.description,
						start_time: data.start_time,
						end_time: data.end_time,
					});
					setEditingEvent(null);
					return;
				}

				const updateAll = window.confirm("Update all occurrences?");
				if (updateAll) {
					updateGoalSeries(editingEvent.goal_id, {
						title: data.title,
						description: data.description,
						start_time: data.start_time,
						end_time: data.end_time,
					});
				} else {
					detachGoalOccurrence(
						editingEvent.goal_id,
						editingEvent.occurrence_date,
						editingEvent.occurrence_date,
						{
							title: data.title,
							description: data.description,
							start_time: data.start_time,
							end_time: data.end_time,
						},
					);
				}

				setEditingEvent(null);
				return;
			} else {
				if (!selectedSlot) return;
				createGoal({ ...data, date: selectedSlot.date });
				setSelectedSlot(null);
			}
		},
		[
			createGoal,
			selectedSlot,
			editingEvent,
			updateGoal,
			updateGoalSeries,
			detachGoalOccurrence,
		],
	);

	const handleClose = useCallback(() => {
		setSelectedSlot(null);
		setEditingEvent(null);
		setPanelAnchor(null);
	}, []);

	const handleEventDrop = useCallback(
		(eventId: string, newDayIndex: number, newHourIndex: number) => {
			const event = events.find((e) => e.id === eventId);

			if (!event) return;

			const [startHour, startMinute] = event.start_time.split(":").map(Number);
			const [endHour, endMinute] = event.end_time.split(":").map(Number);
			const durationMinutes =
				endHour * 60 + endMinute - (startHour * 60 + startMinute);

			const newStartHour = newHourIndex;
			const newStartMinute = 0;
			const newStartTime = `${String(newStartHour).padStart(2, "0")}:${String(newStartMinute).padStart(2, "0")}`;

			const totalEndMinut =
				newStartHour * 60 + newStartMinute + durationMinutes;
			const newEndHour = Math.floor(totalEndMinut / 60);
			const newEndMinute = totalEndMinut % 60;
			const newEndTime = `${String(newEndHour).padStart(2, "0")}:${String(newEndMinute).padStart(2, "0")}`;

			const weekStartDate = new Date(weekStart);
			const newDate = addDays(weekStartDate, newDayIndex);
			const newDateStr = format(newDate, "yyyy-MM-dd");

			const isRecurring = event.recurrence_type !== "none";

			if (isRecurring) {
				detachGoalOccurrenceWithMove(
					event.goal_id,
					event.occurrence_date,
					newDateStr,
					newDayIndex,
					{
						title: event.title,
						description: event.description,
						start_time: newStartTime,
						end_time: newEndTime,
					},
				);
				return;
			}
			updateGoal(event.goal_id, {
				dayIndex: newDayIndex,
				start_time: newStartTime,
				end_time: newEndTime,
				start_date: newDateStr,
				title: event.title,
			});
		},
		[events, updateGoal, weekStart, detachGoalOccurrenceWithMove],
	);

	const value = useMemo<DashboardContextType>(
		() => ({
			events,
			weekStart,
			isPending,

			selectedSlot,
			editingEvent,

			onCellClick: handleCellClick,
			onEdit: handleEdit,
			onSubmit: handleSubmit,
			onClose: handleClose,
			onEventDrop: handleEventDrop,

			onToggle: toggleComplete,
			onDelete: deleteGoal,
			onDeleteOccurrence: deleteGoalOccurrence,

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
			handleCellClick,
			handleEdit,
			handleSubmit,
			handleClose,
			handleEventDrop,
			toggleComplete,
			deleteGoal,
			deleteGoalOccurrence,
			panelAnchor,
			setPanelAnchor,
			suppressNextOpenRef,
		],
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
}
