"use client";

import { RECURRENCE_TYPES, RecurrenceType } from "@/features/goals/model/types";
import TimeWheel from "./time-wheel";
import { useRef, useState } from "react";
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
				<input
					id="goal-date"
					className="goal-time-input"
					type="date"
					value={date}
					onChange={(e) => onDateChange(e.target.value)}
				/>

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

				{recurrence === "weekly" && (
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

				<Button onClick={onSavePanel}>Save</Button>
			</div>
		</div>
	);
}
