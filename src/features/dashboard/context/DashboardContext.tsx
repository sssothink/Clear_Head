import React, {
	createContext,
	useContext,
	useMemo,
	useState,
	useCallback,
} from "react";
import { DayEvent, Goal, SelectedSlot } from "../../goals/model/types";
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
	weekStart,
	children,
}: {
	initialGoals: Goal[];
	weekStart: string;
	children: React.ReactNode;
}) {
	const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
	const [editingEvent, setEditingEvent] = useState<DayEvent | null>(null);

	const baseEvents = useMemo(
		() => buildWeekEvents(initialGoals, weekStart),
		[initialGoals, weekStart],
	);

	const {
		events,
		isPending,
		createGoal,
		toggleComplete,
		deleteGoal,
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

	const handleClose = useCallback(() => {
		setSelectedSlot(null);
		setEditingEvent(null);
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

			updateGoal(eventId, {
				dayIndex: newDayIndex,
				start_time: newStartTime,
				end_time: newEndTime,
				start_date: newDateStr,
				title: event.title,
			});
		},
		[events, updateGoal, weekStart],
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
		],
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
}
