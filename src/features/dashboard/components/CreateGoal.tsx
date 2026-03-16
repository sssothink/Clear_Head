"use client";
import { SelectedSlot } from "@/features/goals/model/types";
import { Button } from "@/shared/ui/button";
import { useEffect, useRef, useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { toHHMM } from "@/lib/utils";

type GoalModalProps = {
	slot?: SelectedSlot;
	onClose: () => void;
	onSubmit: (data: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
	}) => void;
	onDelete?: () => void;
	onDeleteOnly?: () => void;
	onDeleteAll?: () => void;
	initialData?: {
		title: string;
		description?: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type?: "none" | "daily" | "weekly";
		recurrence_days?: number[] | null;
	};
	panelAnchor?: DOMRect | null;
};

export default function CreateGoal({
	slot,
	onClose,
	onSubmit,
	onDelete,
	onDeleteOnly,
	onDeleteAll,
	initialData,
	panelAnchor,
}: GoalModalProps) {
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
	const [title, setTitle] = useState(titleDefault ?? "");
	const [description, setDescription] = useState(descriptionDefault ?? "");
	const [date, setDate] = useState(dateDefault ?? "");
	const [startTime, setStartTime] = useState(startHour);
	const [endTime, setEndTime] = useState(endHour);
	const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly">(
		initialData?.recurrence_type ?? "none",
	);
	const [recurrenceDays, setRecurrenceDays] = useState<number[]>(
		initialData?.recurrence_days ?? [],
	);

	const [timePanelOpen, setTimePanelOpen] = useState(false);
	const [timePanelPos, setTimePanelPos] = useState({ top: 0, left: 0 });
	const timePanelRef = useRef<HTMLDivElement | null>(null);

	const [pos, setPos] = useState({ top: 100, left: 100 });

	useEffect(() => {
		if (!panelAnchor || !popoverRef.current) return;

		const panelWidth = 320;
		const panelHeight = popoverRef.current.offsetHeight;

		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		const rightCandidate = panelAnchor.right + 12 + scrollX;
		const leftCandidate = panelAnchor.left - panelWidth - 12 + scrollX;

		const left =
			rightCandidate + panelWidth <= viewportWidth + scrollX
				? rightCandidate
				: Math.max(16 + scrollX, leftCandidate);

		const rawTop = panelAnchor.top + scrollY;
		const minTop = 16 + scrollY;
		const maxTop = viewportHeight + scrollY - panelHeight - 16;
		const top = Math.min(Math.max(rawTop, minTop), maxTop);

		setPos({ top, left });
	}, [panelAnchor]);

	useEffect(() => {
		const handleOutside = (e: MouseEvent) => {
			const el = popoverRef.current;

			if (!el) return;
			if (!el.contains(e.target as Node)) {
				suppressNextOpenRef.current = true;
				onClose();
			}
		};

		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, [onClose]);

	useEffect(() => {
		if (!timePanelOpen) return;

		const handleOutside = (e: MouseEvent) => {
			const el = timePanelRef.current;
			if (!el) return;
			if (!el.contains(e.target as Node)) {
				setTimePanelOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutside);
		return () => document.removeEventListener("mousedown", handleOutside);
	}, [timePanelOpen]);

	return (
		<div
			ref={popoverRef}
			className="goal-popover"
			style={{ top: pos.top, left: pos.left }}
		>
			<div className="goal-header">
				<button
					className="goal-datetime"
					type="button"
					onClick={(e) => {
						const rect = (
							e.currentTarget as HTMLElement
						).getBoundingClientRect();

						const panelWidth = 260;
						const panelHeight = 240;

						const viewportWidth = window.innerWidth;
						const viewportHeight = window.innerHeight;

						const left = Math.min(rect.left, viewportWidth - panelWidth - 16);

						const top = Math.min(
							rect.bottom + 8,
							viewportHeight - panelHeight - 16,
						);

						setTimePanelPos({ top, left });
						setTimePanelOpen((v) => !v);
					}}
				>
					{date || "Pick date"} • {toHHMM(startTime)} - {toHHMM(endTime)}
					<span className="goal-repeat">{recurrence}</span>
				</button>
			</div>

			<div className="goal-body">
				<input
					type="text"
					className="goal-title-input"
					placeholder="Task title"
					defaultValue={titleDefault}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<textarea
					className="goal-desc-input"
					placeholder="Description"
					defaultValue={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={6}
				></textarea>
			</div>

			<div className="goal-actions">
				<Button
					className="goal-primary"
					type="button"
					onClick={() => {
						if (!date) return;
						onSubmit({
							title,
							description,
							start_time: startTime,
							end_time: endTime,
							date,
							recurrence_type: recurrence,
							recurrence_days:
								recurrence === "weekly" ? recurrenceDays : undefined,
						});
						onClose();
					}}
				>
					{initialData ? "Update" : "Create"}
				</Button>
				{onDeleteOnly && onDeleteAll ? (
					<div className="goal-delete-group">
						<Button
							className="goal-delete"
							type="button"
							onClick={onDeleteOnly}
						>
							Delete only this
						</Button>
						<Button className="goal-delete" type="button" onClick={onDeleteAll}>
							Delete all
						</Button>
					</div>
				) : (
					onDelete && (
						<Button className="goal-delete" type="button" onClick={onDelete}>
							Delete
						</Button>
					)
				)}
			</div>
			{timePanelOpen && (
				<div
					ref={timePanelRef}
					className="goal-time-popover"
					style={{ top: timePanelPos.top, left: timePanelPos.left }}
				>
					<div className="goal-time-panel">
						<label htmlFor="goal-date" className="goal-time-label">
							Date
						</label>
						<input
							id="goal-date"
							className="goal-time-input"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
						/>
						<div className="goal-time-row">
							<div className="goal-time-col">
								<label htmlFor="goal-start" className="goal-time-label">
									Start
								</label>
								<input
									id="goal-start"
									type="time"
									className="goal-time-input"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
								/>
							</div>
							<div className="goal-time-col">
								<label htmlFor="goal-end" className="goal-time-label">
									End
								</label>
								<input
									id="goal-end"
									type="time"
									className="goal-time-input"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
								/>
							</div>
						</div>

						<label htmlFor="goal-repeat" className="goal-time-label">
							Repeat
						</label>
						<select
							id="goal-repeat"
							className="goal-time-input"
							value={recurrence}
							onChange={(e) => {
								const value = e.target.value as "none" | "daily" | "weekly";
								setRecurrence(value);
								if (value !== "weekly") {
									setRecurrenceDays([]);
								}
							}}
						>
							<option value="none">Does not repeat</option>
							<option value="daily">Daily</option>
							<option value="weekly">Weekly</option>
						</select>

						{recurrence === "weekly" && (
							<div className="goal-weekdays">
							{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
								(label, i) => {
									const dayValue = i + 1;
									return (
									<label key={label} className="goal-weekday">
										<input
											type="checkbox"
											checked={recurrenceDays.includes(dayValue)}
											onChange={() =>
												setRecurrenceDays((prev) =>
													prev.includes(dayValue)
														? prev.filter((day) => day !== dayValue)
														: [...prev, dayValue],
												)
											}
										/>
										<span>{label}</span>
									</label>
									);
								},
							)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
