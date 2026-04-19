"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/shared/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
	isRecurrenceType,
	RECURRENCE_TYPES,
	RecurrenceType,
} from "../model/types";
import { formatISODate } from "@/shared/lib/date";
import { addMinutesToTime, isQuarterHour } from "@/shared/lib/time";
const recurrenceLabels: Record<RecurrenceType, string> = {
	none: "Do not repeat",
	daily: "Daily",
	weekly: "Weekly",
};

type DayFormProps = {
	defaultTitle?: string;
	defaultStartTime?: string;
	defaultEndTime?: string;
	defaultDate?: string;
	onSubmit: (data: {
		title: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: RecurrenceType;
		recurrence_days?: number[];
	}) => void;
};

export default function DayForm({
	defaultTitle,
	defaultStartTime,
	defaultEndTime,
	defaultDate,
	onSubmit,
}: DayFormProps) {
	const [title, setTitle] = useState(defaultTitle ?? "");
	const date = defaultDate ?? formatISODate(new Date());
	const [startTime, setStartTime] = useState(defaultStartTime ?? "09:00");
	const [endTime, setEndTime] = useState(defaultEndTime ?? "10:00");
	const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
	const [days, setDays] = useState<number[]>([]);
	const [error, setError] = useState<string | null>(null);
	const minEndTime = useMemo(() => addMinutesToTime(startTime, 15), [startTime]);

	const toggleDay = (day: number) => {
		setDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (endTime <= startTime) {
			setError("End time must be later than start time.");
			return;
		}

		if (!isQuarterHour(startTime) || !isQuarterHour(endTime)) {
			setError("Time must be in 15-minute increments.");
			return;
		}

		if (!minEndTime || endTime < minEndTime) {
			setError("End time must be at least 15 minutes after start time.");
			return;
		}

		if (recurrence === "weekly" && days.length === 0) {
			setError("Choose at least one weekday for weekly recurrence.");
			return;
		}

		onSubmit({
			title,
			start_time: startTime,
			end_time: endTime,
			date,
			recurrence_type: recurrence,
			recurrence_days: recurrence === "weekly" ? days : undefined,
		});

		setTitle("");
		setError(null);
	};

	return (
		<form onSubmit={handleSubmit} className="card p-4 flex flex-col gap-3 mb-3">
			<Input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="New task..."
				required
			/>

			<div className="flex gap-2">
				<Input
					type="time"
					value={startTime}
					step={900}
					onChange={(e) => {
						const nextStart = e.target.value;
						setStartTime(nextStart);

						const nextMinEnd = addMinutesToTime(nextStart, 15);
						if (nextMinEnd && endTime < nextMinEnd) {
							setEndTime(nextMinEnd);
						}
					}}
				/>
				<Input
					type="time"
					value={endTime}
					step={900}
					min={minEndTime ?? undefined}
					disabled={!minEndTime}
					onChange={(e) => setEndTime(e.target.value)}
				/>
			</div>

			<Select
				value={recurrence}
				onValueChange={(v) => {
					if (isRecurrenceType(v)) setRecurrence(v);
				}}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{RECURRENCE_TYPES.map((type) => (
						<SelectItem key={type} value={type}>
							{recurrenceLabels[type]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<AnimatePresence>
				{recurrence === "weekly" && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="flex gap-2 flex-wrap"
					>
						{[1, 2, 3, 4, 5, 6, 7].map((d) => (
							<Button
								key={d}
								type="button"
								size="sm"
								variant={days.includes(d) ? "default" : "ghost"}
								onClick={() => toggleDay(d)}
							>
								{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d - 1]}
							</Button>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			<Button type="submit">Add task</Button>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</form>
	);
}
