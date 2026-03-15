"use client";

import { useState } from "react";
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
import { format } from "date-fns";

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
		recurrence_type: "none" | "daily" | "weekly";
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
	const date = defaultDate ?? format(new Date(), "yyyy-MM-dd");
	const [startTime, setStartTime] = useState(defaultStartTime ?? "09:00");
	const [endTime, setEndTime] = useState(defaultEndTime ?? "10:00");
	const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly">(
		"none",
	);
	const [days, setDays] = useState<number[]>([]);

	const toggleDay = (day: number) => {
		setDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		onSubmit({
			title,
			start_time: startTime,
			end_time: endTime,
			date,
			recurrence_type: recurrence,
			recurrence_days: recurrence === "weekly" ? days : undefined,
		});

		setTitle("");
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
					onChange={(e) => setStartTime(e.target.value)}
				/>
				<Input
					type="time"
					value={endTime}
					onChange={(e) => setEndTime(e.target.value)}
				/>
			</div>

			<Select
				value={recurrence}
				onValueChange={(v) => setRecurrence(v as "none" | "daily" | "weekly")}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="none">Do not repeat</SelectItem>
					<SelectItem value="daily">Daily</SelectItem>
					<SelectItem value="weekly">Weekly</SelectItem>
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
		</form>
	);
}
