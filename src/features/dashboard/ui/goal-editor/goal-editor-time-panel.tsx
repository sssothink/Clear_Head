"use client";

import { RECURRENCE_TYPES, RecurrenceType } from "@/features/goals/model/types";
import TimeWheel from "./time-wheel";
import { useRef, useState } from "react";
import {
	addDays,
	addMonths,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	parseISO,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import {
	END_TIME_OPTIONS,
	isEndOptionDisabled,
	TIME_OPTIONS,
} from "@/shared/lib/time";
import { Button } from "@/shared/ui";
import { useOutsideClick } from "@/features/goals/hooks/useOutsideClick";

type GoalTimePanelProps = {
	open: boolean;
	panelRef: React.RefObject<HTMLDivElement | null>;
	pos: { top: number; left: number };
	date: string;
	onDateChange: (value: string) => void;
	startTime: string;
	endTime: string;
	recurrence: RecurrenceType;
	recurrenceOptions?: readonly RecurrenceType[];
	showRecurrenceControls?: boolean;
	allowWeeklyDayEditing?: boolean;
	recurrenceDays: number[];
	onStartTimeChange: (value: string) => void;
	onEndTimeChange: (value: string) => void;
	onRecurrenceChange: (value: RecurrenceType) => void;
	onToggleRecurrenceDay: (day: number) => void;
	onSavePanel: () => void;
};

const recurrenceLabels: Record<RecurrenceType, string> = {
	none: "Does not repeat",
	daily: "Daily",
	weekly: "Weekly",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function parseDateOrToday(isoDate: string) {
	if (!isoDate) return new Date();
	const parsed = parseISO(isoDate);
	return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function GoalTimePanel({
	open,
	panelRef,
	pos,
	date,
	startTime,
	endTime,
	recurrence,
	recurrenceOptions = RECURRENCE_TYPES,
	showRecurrenceControls = true,
	allowWeeklyDayEditing = true,
	recurrenceDays,
	onDateChange,
	onStartTimeChange,
	onEndTimeChange,
	onRecurrenceChange,
	onToggleRecurrenceDay,
	onSavePanel,
}: GoalTimePanelProps) {
	const [activePicker, setActivePicker] = useState<"start" | "end" | null>(
		null,
	);
	const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
	const [visibleMonth, setVisibleMonth] = useState(() =>
		startOfMonth(parseDateOrToday(date)),
	);
	const [pickerPos, setPickerPos] = useState<{
		top: number;
		left: number;
		width: number;
	} | null>(null);
	const panelBodyRef = useRef<HTMLDivElement | null>(null);
	const quickRowRef = useRef<HTMLDivElement | null>(null);
	const wheelRef = useRef<HTMLDivElement | null>(null);
	const recurrenceRef = useRef<HTMLDivElement | null>(null);
	const recurrenceButtonRef = useRef<HTMLButtonElement | null>(null);
	const datePickerRef = useRef<HTMLDivElement | null>(null);
	const dateButtonRef = useRef<HTMLButtonElement | null>(null);
	const startRef = useRef<HTMLButtonElement | null>(null);
	const endRef = useRef<HTMLButtonElement | null>(null);

	const openPicker = (type: "start" | "end") => {
		const el = type === "start" ? startRef.current : endRef.current;
		const panelEl = panelBodyRef.current;
		if (!el || !panelEl) return;

		const chipRect = el.getBoundingClientRect();
		const panelRect = panelEl.getBoundingClientRect();

		const localTop = chipRect.top - panelRect.top;
		const localLeft = chipRect.left - panelRect.left;

		setPickerPos({
			top: localTop + chipRect.height / 2 - WHEEL_SELECTED_CENTER_Y,
			left: localLeft + chipRect.width / 2 - WHEEL_WIDTH / 2,
			width: chipRect.width,
		});
		setActivePicker(type);
	};

	const WHEEL_WIDTH = 88;
	const WHEEL_SELECTED_CENTER_Y = 88; // 72 padding + 16 half of 32px row
	const wheelTop = pickerPos ? pickerPos.top : 0;
	const wheelLeft = pickerPos ? pickerPos.left : 0;

	useOutsideClick(
		wheelRef,
		() => setActivePicker(null),
		Boolean(activePicker),
		[quickRowRef],
	);
	useOutsideClick(
		recurrenceRef,
		() => setIsRecurrenceOpen(false),
		isRecurrenceOpen,
		[recurrenceButtonRef],
	);
	useOutsideClick(
		datePickerRef,
		() => setIsDatePickerOpen(false),
		isDatePickerOpen,
		[dateButtonRef],
	);

	const selectedDate = parseDateOrToday(date);
	const monthStart = startOfMonth(visibleMonth);
	const monthEnd = endOfMonth(visibleMonth);
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
	const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

	const days: Date[] = [];
	let dayCursor = calendarStart;
	while (dayCursor <= calendarEnd) {
		days.push(dayCursor);
		dayCursor = addDays(dayCursor, 1);
	}
	const weeklyDayLabels = recurrenceDays
		.filter((day) => day >= 1 && day <= 7)
		.sort((a, b) => a - b)
		.map((day) => weekDays[day - 1]);

	if (!open) return null;

	return (
		<div
			ref={panelRef}
			className="goal-time-popover"
			style={{ top: pos.top, left: pos.left }}
		>
			<div className="goal-time-panel" ref={panelBodyRef}>
				<label htmlFor="goal-date" className="goal-time-label">
					Date
				</label>
				<div className="goal-date-wrap">
					<button
						ref={dateButtonRef}
						type="button"
						id="goal-date"
						className={`goal-date-trigger ${isDatePickerOpen ? "goal-date-trigger--open" : ""}`}
						onClick={() => {
							setVisibleMonth(startOfMonth(selectedDate));
							setIsDatePickerOpen((prev) => !prev);
						}}
						aria-haspopup="dialog"
						aria-expanded={isDatePickerOpen}
					>
						<span>{format(selectedDate, "EEE, MMM d, yyyy")}</span>
						<span className="goal-date-icon" aria-hidden="true">
							<svg viewBox="0 0 20 20" width="14" height="14">
								<path d="M6 2v3M14 2v3M3 8h14M4 4h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
							</svg>
						</span>
					</button>

					{isDatePickerOpen ? (
						<div ref={datePickerRef} className="goal-date-pop" role="dialog">
							<div className="goal-date-head">
								<button
									type="button"
									className="goal-date-nav"
									onClick={() => setVisibleMonth((prev) => subMonths(prev, 1))}
									aria-label="Previous month"
								>
									‹
								</button>
								<div className="goal-date-month">
									{format(visibleMonth, "MMMM yyyy")}
								</div>
								<button
									type="button"
									className="goal-date-nav"
									onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
									aria-label="Next month"
								>
									›
								</button>
							</div>

							<div className="goal-date-weekdays">
								{weekDays.map((label) => (
									<div key={label} className="goal-date-weekday-label">
										{label}
									</div>
								))}
							</div>

							<div className="goal-date-grid">
								{days.map((day) => {
									const inCurrentMonth = isSameMonth(day, visibleMonth);
									const selected = isSameDay(day, selectedDate);
									const today = isSameDay(day, new Date());

									return (
										<button
											key={day.toISOString()}
											type="button"
											className={`goal-date-day ${selected ? "goal-date-day--selected" : ""} ${
												today ? "goal-date-day--today" : ""
											} ${!inCurrentMonth ? "goal-date-day--outside" : ""}`}
											onClick={() => {
												onDateChange(format(day, "yyyy-MM-dd"));
												setIsDatePickerOpen(false);
											}}
										>
											{format(day, "d")}
										</button>
									);
								})}
							</div>
						</div>
					) : null}
				</div>

				<label className="goal-time-label">Time</label>
				<div className="goal-time-quick" ref={quickRowRef}>
					<button
						ref={startRef}
						type="button"
						className={`goal-time-chip ${activePicker === "start" ? "goal-time-chip--active" : ""}`}
						onClick={() => openPicker("start")}
					>
						{startTime}
					</button>
					-
					<button
						ref={endRef}
						type="button"
						className={`goal-time-chip ${activePicker === "end" ? "goal-time-chip--active" : ""}`}
						onClick={() => openPicker("end")}
					>
						{endTime}
					</button>
				</div>

				{activePicker && pickerPos ? (
					<div
						ref={wheelRef}
						className="goal-time-wheel-pop"
						style={{
							top: wheelTop,
							left: wheelLeft,
							width: WHEEL_WIDTH,
							minWidth: Math.min(WHEEL_WIDTH, pickerPos.width),
						}}
					>
						{activePicker === "start" ? (
							<TimeWheel
								value={startTime}
								options={TIME_OPTIONS}
								onChange={(value, source) => {
									onStartTimeChange(value);
									if (source === "click") {
										setActivePicker(null);
									}
								}}
							/>
						) : (
							<TimeWheel
								value={endTime}
								options={END_TIME_OPTIONS}
								onChange={(value, source) => {
									onEndTimeChange(value);
									if (source === "click") {
										setActivePicker(null);
									}
								}}
								isDisabledOption={(t) => isEndOptionDisabled(t, startTime)}
								restrictWheelToEnabled
							/>
						)}
					</div>
				) : null}

				{showRecurrenceControls ? (
					<>
						<label className="goal-time-label">Repeat</label>
						<div className="goal-repeat-wrap">
							<button
								ref={recurrenceButtonRef}
								type="button"
								id="goal-repeat"
								className={`goal-repeat-field ${isRecurrenceOpen ? "goal-repeat-field--open" : ""}`}
								onClick={() => setIsRecurrenceOpen((prev) => !prev)}
								aria-haspopup="listbox"
								aria-expanded={isRecurrenceOpen}
								aria-controls="goal-repeat-list"
							>
								<span className="goal-repeat-value">
									{recurrenceLabels[recurrence]}
								</span>
							</button>
							<span className="goal-repeat-caret" aria-hidden="true">
								<svg viewBox="0 0 12 8" width="12" height="8">
									<path d="M1 1.5 6 6.5l5-5" />
								</svg>
							</span>

							{isRecurrenceOpen ? (
								<div ref={recurrenceRef} className="goal-repeat-menu-wrap">
									<ul
										id="goal-repeat-list"
										className="goal-repeat-menu"
										role="listbox"
									>
										{recurrenceOptions.map((type) => {
											const selected = type === recurrence;
											return (
												<li key={type}>
													<button
														type="button"
														role="option"
														aria-selected={selected}
														className={`goal-repeat-option ${selected ? "goal-repeat-option--selected" : ""}`}
														onClick={() => {
															onRecurrenceChange(type);
															setIsRecurrenceOpen(false);
														}}
													>
														{recurrenceLabels[type]}
													</button>
												</li>
											);
										})}
									</ul>
								</div>
							) : null}
						</div>
					</>
				) : null}

				{recurrence === "weekly" && allowWeeklyDayEditing && (
					<div className="goal-weekdays">
						{weekDays.map((label, i) => {
							const dayValue = i + 1;
							return (
								<label key={label} className="goal-weekday">
									<input
										type="checkbox"
										checked={recurrenceDays.includes(dayValue)}
										onChange={() => onToggleRecurrenceDay(dayValue)}
									/>
									<span>{label}</span>
								</label>
							);
						})}
					</div>
				)}
				{recurrence === "weekly" && !allowWeeklyDayEditing && (
					<div className="goal-weekdays-readonly">
						<div className="goal-weekdays-readonly-label">Repeats on</div>
						<div className="goal-weekdays-readonly-list">
							{weeklyDayLabels.length > 0 ? (
								weeklyDayLabels.map((label) => (
									<span key={label} className="goal-weekday-chip">
										{label}
									</span>
								))
							) : (
								<span className="goal-weekdays-readonly-empty">
									No weekdays configured
								</span>
							)}
						</div>
					</div>
				)}

				<Button onClick={onSavePanel}>Save</Button>
			</div>
		</div>
	);
}
