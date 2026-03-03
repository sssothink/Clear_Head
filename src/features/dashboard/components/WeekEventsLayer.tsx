"use client";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Check, Pen, Trash, X } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useState } from "react";

const HOUR_HEIGHT = 60;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export default function WeekEventsLayer() {
	const { events, onToggle, onDelete, onEdit } = useDashboard();
	const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, eventId: string) => {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("eventId", eventId);
		setDraggedEventId(eventId);
	};

	const handleDragEnd = () => {
		setDraggedEventId(null);
	};
	return (
		<div className="absolute inset-0 pointer-events-none">
			{events.map((event) => {
				const [startHour, startMinute] = event.start_time
					.split(":")
					.map(Number);
				const [endHour, endMinute] = event.end_time.split(":").map(Number);

				const top = startHour * HOUR_HEIGHT + startMinute * MINUTE_HEIGHT;

				const durationMinutes =
					endHour * 60 + endMinute - (startHour * 60 + startMinute);

				const height = durationMinutes * MINUTE_HEIGHT;

				return (
					<div
						key={event.id}
						draggable
						onDragStart={(e) => handleDragStart(e, event.id)}
						onDragEnd={handleDragEnd}
						className={cn(
							"event absolute pointer-events-auto justify-between p-3 transition-all group cursor-move",
							event.status === "completed" && "opacity-60",
							draggedEventId === event.id && "opacity-40 scale-95",
						)}
						style={{
							top,
							height,
							left: `${(100 / 7) * event.dayIndex}%`,
							width: `${100 / 7}%`,
						}}
					>
						<div className="flex gap-1">
							<Button
								size="xs"
								variant="ghost"
								onClick={() => onToggle(event.id)}
								className="border-2 rounded-[0.6em] cursor-pointer active:scale-97"
							>
								{event.status === "planned" ? (
									<Check size={10} />
								) : (
									<X size={10} />
								)}
							</Button>
							<div className="p-1 text-xs text-white truncate">
								{event.title}
							</div>
							<Button
								size="xs"
								variant="ghost"
								onClick={() => onEdit(event.id)}
								className="border-2 rounded-[0.6em] cursor-pointer active:scale-97"
							>
								<Pen size={10}></Pen>
							</Button>
							<Button
								size="xs"
								variant="ghost"
								onClick={() => onDelete(event.id)}
								className="border-2 rounded-[0.6em] cursor-pointer active:scale-97"
							>
								<Trash size={10}></Trash>
							</Button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
