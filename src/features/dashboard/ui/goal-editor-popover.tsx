"use client";
import { RecurrenceType, SelectedSlot } from "@/features/goals/model/types";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useDashboard } from "../model";
import { useOutsideClick } from "@/features/goals/hooks/useOutsideClick";
import { createPortal } from "react-dom";
import {
	addMinutesToTime,
	isQuarterHour,
	timeToMinutes,
	toEndOfDayAwareMinutes,
	toComparableEndMinutes,
} from "@/shared/lib/time";
import {
	GoalActions,
	GoalDateTimeButton,
	GoalTextFields,
	GoalTimePanel,
} from "./goal-editor";
import GoalScopeConfirm from "./goal-editor/goal-editor-scope-confirm";
import type { SubmitResult } from "../model/use-dashboard-interactions";

function clamp(value: number, min: number, max: number) {
	if (max < min) return min;
	return Math.min(Math.max(value, min), max);
}

function normalizeText(value?: string | null) {
	return (value ?? "").trim();
}

function sortedNumbers(value?: number[] | null) {
	return [...(value ?? [])].sort((a, b) => a - b);
}

function sameNumberArray(a?: number[] | null, b?: number[] | null) {
	const left = sortedNumbers(a);
	const right = sortedNumbers(b);
	if (left.length !== right.length) return false;
	return left.every((v, i) => v === right[i]);
}

type GoalModalProps = {
	slot?: SelectedSlot;
	onClose: () => void;
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
	onDelete?: () => void;
	onDeleteOnly?: () => void;
	onDeleteAll?: () => void;
	initialData?: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type?: RecurrenceType;
		recurrence_days?: number[] | null;
	};
	panelAnchor?: DOMRect | null;
};

export default function GoalEditorPopover({
	slot,
	onClose,
	onSubmit,
	onDelete,
	onDeleteOnly,
	onDeleteAll,
	initialData,
	panelAnchor,
}: GoalModalProps) {
	const isEdit = Boolean(initialData);
	const startHour =
		initialData?.start_time ||
		slot?.hourIndex.toString().padStart(2, "0") + ":00";
	const endHour =
		initialData?.end_time ||
		((slot?.hourIndex ?? 0) + 1).toString().padStart(2, "0") + ":00";
	const dateDefault = initialData?.date || slot?.date;
	const titleDefault = initialData?.title;
	const descriptionDefault = initialData?.description;
	const popoverRef = useRef<HTMLDivElement | null>(null);
	const { suppressNextOpenRef } = useDashboard();

	type PanelPosition = { top: number; left: number };
	const [date, setDate] = useState(dateDefault ?? "");
	const [title, setTitle] = useState(titleDefault ?? "");
	const [description, setDescription] = useState(descriptionDefault ?? "");
	const [startTime, setStartTime] = useState(startHour);
	const [endTime, setEndTime] = useState(endHour);
	const [recurrence, setRecurrence] = useState<RecurrenceType>(
		initialData?.recurrence_type ?? "none",
	);
	const [recurrenceDays, setRecurrenceDays] = useState<number[]>(
		initialData?.recurrence_days ?? [],
	);
	const [error, setError] = useState<string | null>(null);

	const [timePanelOpen, setTimePanelOpen] = useState(false);
	const [timePanelPos, setTimePanelPos] = useState<PanelPosition>({
		top: 0,
		left: 0,
	});
	const [pos, setPos] = useState<PanelPosition>({ top: 100, left: 100 });
	const [isPositioned, setIsPositioned] = useState(false);

	const timePanelRef = useRef<HTMLDivElement | null>(null);

	type ScopePromptAction = "update" | "delete" | null;
	const [scopePrompt, setScopePrompt] = useState<ScopePromptAction>(null);
	const scopeModalRef = useRef<HTMLDivElement | null>(null);

	const isRecurringEdit = Boolean(
		initialData &&
		initialData.recurrence_type &&
		initialData.recurrence_type !== "none",
	);
	const isRecurringDateChanged = Boolean(
		isRecurringEdit && initialData?.date && date !== initialData.date,
	);
	const isSingleEdit = Boolean(
		initialData && initialData.recurrence_type === "none",
	);
	const currentRecurrence = initialData?.recurrence_type;

	const recurrenceOptions: RecurrenceType[] = !isEdit
		? ["none", "daily", "weekly"]
		: isRecurringEdit && currentRecurrence
			? currentRecurrence === "weekly"
				? ["none"]
				: Array.from(new Set<RecurrenceType>(["none", currentRecurrence]))
			: ["none"];
	const isTitleEmpty = normalizeText(title).length === 0;

	const isDirty = !isEdit
		? true
		: (() => {
				if (!initialData) return false;
				return (
					normalizeText(title) !== normalizeText(initialData.title) ||
					normalizeText(description) !==
						normalizeText(initialData.description) ||
					date !== initialData.date ||
					startTime !== initialData.start_time ||
					endTime !== initialData.end_time ||
					recurrence !== (initialData.recurrence_type ?? "none") ||
					!sameNumberArray(
						recurrence === "weekly" ? recurrenceDays : [],
						(initialData.recurrence_type ?? "none") === "weekly"
							? (initialData.recurrence_days ?? [])
							: [],
					)
				);
			})();

	const handlePrimaryUpdate = () => {
		if (isTitleEmpty) {
			setError("Title is required.");
			return;
		}
		if (isEdit && !isDirty) return;
		if (!isRecurringEdit) {
			handleSubmitClick();
			return;
		}
		// For recurring tasks, changing the date means "move only this occurrence"
		// and detach it to a one-time task without additional scope prompt.
		if (isRecurringDateChanged) {
			handleSubmitClick("single");
			return;
		}
		setScopePrompt("update");
	};

	const handlePrimaryDelete = () => {
		if (!isRecurringEdit) {
			onDelete?.();
			return;
		}
		setScopePrompt("delete");
	};

	// Keep editor visible within viewport near clicked anchor.
	useLayoutEffect(() => {
		if (!panelAnchor || !popoverRef.current) return;

		const panelWidth = 320;
		const panelHeight = popoverRef.current.offsetHeight;

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const rightCandidate = panelAnchor.right + 12;
		const leftCandidate = panelAnchor.left - panelWidth - 12;

		const left =
			rightCandidate + panelWidth <= viewportWidth
				? rightCandidate
				: Math.max(16, leftCandidate);

		const rawTop = panelAnchor.top;
		const minTop = 16;
		const maxTop = viewportHeight - panelHeight - 16;
		const top = Math.min(Math.max(rawTop, minTop), maxTop);

		setPos({ top, left });
		setIsPositioned(true);
	}, [panelAnchor]);

	const handlePopoverOutside = useCallback(() => {
		suppressNextOpenRef.current = true;
		onClose();
	}, [onClose, suppressNextOpenRef]);

	const handleTimePanelOutside = useCallback(() => {
		setTimePanelOpen(false);
	}, []);

	const handleDateTimeToggle = (rect: DOMRect) => {
		const popoverRect = popoverRef.current?.getBoundingClientRect();
		if (!popoverRect) return;

		const panelWidth = 260;
		const panelHeight = timePanelRef.current?.offsetHeight ?? 330;
		const gap = 8;
		const viewportPadding = 8;

		const leftWithinPopover = rect.left - popoverRect.left;
		const maxLeft = Math.max(8, popoverRect.width - panelWidth - 8);
		const minLeftByViewport = viewportPadding - popoverRect.left;
		const maxLeftByViewport =
			window.innerWidth - viewportPadding - panelWidth - popoverRect.left;

		const left = clamp(
			Math.min(Math.max(8, leftWithinPopover), maxLeft),
			minLeftByViewport,
			maxLeftByViewport,
		);

		const downTop = rect.bottom - popoverRect.top + gap;
		const minTopByViewport = viewportPadding - popoverRect.top;
		const maxTopByViewport =
			window.innerHeight - viewportPadding - panelHeight - popoverRect.top;
		const top = clamp(downTop, minTopByViewport, maxTopByViewport);

		setTimePanelPos({ top, left });
		setTimePanelOpen((v) => !v);
	};

	useLayoutEffect(() => {
		if (!timePanelOpen) return;
		const panelEl = timePanelRef.current;
		const popoverRect = popoverRef.current?.getBoundingClientRect();
		if (!panelEl || !popoverRect) return;

		const viewportPadding = 8;
		const panelWidth = panelEl.offsetWidth;
		const panelHeight = panelEl.offsetHeight;

		setTimePanelPos((prev) => {
			const minLeft = viewportPadding - popoverRect.left;
			const maxLeft =
				window.innerWidth - viewportPadding - panelWidth - popoverRect.left;
			const minTop = viewportPadding - popoverRect.top;
			const maxTop =
				window.innerHeight - viewportPadding - panelHeight - popoverRect.top;

			const nextLeft = clamp(prev.left, minLeft, maxLeft);
			const nextTop = clamp(prev.top, minTop, maxTop);

			if (nextLeft === prev.left && nextTop === prev.top) return prev;
			return { left: nextLeft, top: nextTop };
		});
	}, [timePanelOpen]);

	const handleToggleRecurrenceDay = (dayValue: number) => {
		setRecurrenceDays((prev) =>
			prev.includes(dayValue)
				? prev.filter((day) => day !== dayValue)
				: [...prev, dayValue],
		);
	};

	const handleRecurrenceChange = (value: RecurrenceType) => {
		setRecurrence(value);

		if (value !== "weekly") {
			setRecurrenceDays([]);
		}
	};

	const handleSubmitClick = (scope?: "single" | "future") => {
		if (!date) return;
		setError(null);
		if (isTitleEmpty) {
			setError("Title is required.");
			return;
		}

		if (!isQuarterHour(startTime) || !isQuarterHour(endTime)) {
			setError("Time must be in 15-minute increments.");
			return;
		}

		const startM = timeToMinutes(startTime);
		const endM = toEndOfDayAwareMinutes(startTime, endTime);

		if (endM < startM + 15 || endM > 24 * 60) {
			setError("End time must be between start + 15 minutes and 00:00.");
			return;
		}

		const result = onSubmit({
			title,
			description,
			start_time: startTime,
			end_time: endTime,
			date,
			recurrence_type: recurrence,
			recurrence_days: recurrence === "weekly" ? recurrenceDays : undefined,
			edit_scope: scope,
		});

		if (!result.ok) {
			setError(result.message);
			return;
		}

		onClose();
	};

	useOutsideClick(popoverRef, handlePopoverOutside, !scopePrompt, [
		timePanelRef,
		scopeModalRef,
	]);
	useOutsideClick(timePanelRef, handleTimePanelOutside, timePanelOpen);

	if (typeof document === "undefined") return null;

	return createPortal(
		<div
			ref={popoverRef}
			className="goal-popover"
			style={{
				position: "fixed",
				top: pos.top,
				left: pos.left,
				visibility: isPositioned ? "visible" : "hidden",
			}}
		>
			<GoalDateTimeButton
				date={date}
				startTime={startTime}
				endTime={endTime}
				recurrence={recurrence}
				onToggle={handleDateTimeToggle}
			/>

			<GoalTextFields
				defaultTitle={titleDefault}
				defaultDescription={descriptionDefault}
				onTitleChange={(value) => {
					setTitle(value);
					if (error && normalizeText(value).length > 0) {
						setError(null);
					}
				}}
				onDescriptionChange={setDescription}
			/>

			<GoalActions
				isEdit={isEdit}
				onSubmit={handlePrimaryUpdate}
				onDelete={isEdit ? handlePrimaryDelete : undefined}
				disableSubmit={isTitleEmpty || (isEdit && !isDirty)}
			/>

			{scopePrompt && (
				<GoalScopeConfirm
					scopePrompt={scopePrompt}
					handleSubmitClick={handleSubmitClick}
					onDeleteOnly={onDeleteOnly}
					setScopePrompt={setScopePrompt}
					onDeleteAll={onDeleteAll}
					modalRef={scopeModalRef}
				/>
			)}

			<GoalTimePanel
				key={timePanelOpen ? "time-panel-open" : "time-panel-closed"}
				open={timePanelOpen}
				panelRef={timePanelRef}
				pos={timePanelPos}
				date={date}
				startTime={startTime}
				endTime={endTime}
				recurrence={recurrence}
				recurrenceOptions={recurrenceOptions}
				showRecurrenceControls={!isSingleEdit}
				allowWeeklyDayEditing={!isEdit}
				recurrenceDays={recurrenceDays}
				onDateChange={setDate}
				onStartTimeChange={(value) => {
					setStartTime(value);
					const nextMinEnd = addMinutesToTime(value, 15);

					if (
						nextMinEnd &&
						toComparableEndMinutes(endTime) < toComparableEndMinutes(nextMinEnd)
					) {
						setEndTime(nextMinEnd);
					}
				}}
				onEndTimeChange={setEndTime}
				onRecurrenceChange={handleRecurrenceChange}
				onToggleRecurrenceDay={handleToggleRecurrenceDay}
				onSavePanel={() => setTimePanelOpen(false)}
			/>
			{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
		</div>,
		document.body,
	);
}
