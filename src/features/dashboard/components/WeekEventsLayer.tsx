"use client";

import { cn } from "@/shared/lib/cn";
import { useDashboard } from "../context/DashboardContext";
import { useState } from "react";
import { toHHMM } from "@/lib/utils";

const HOUR_HEIGHT = 60;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export default function WeekEventsLayer() {
	const {
		events,
		onToggle,
		onEdit,
		onClose,
		selectedSlot,
		editingEvent,
		setPanelAnchor,
		suppressNextOpenRef,
	} = useDashboard();
	const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

	const handleDragStart = (
		event: React.DragEvent<HTMLDivElement>,
		eventId: string,
	) => {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("eventId", eventId);
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

				const snappedDurationMinutes = Math.max(
					15,
					Math.round(durationMinutes / 15) * 15,
				);
				const height = snappedDurationMinutes * MINUTE_HEIGHT;
				const showMeta = height >= 44;
				const showStatus = height >= 64;
				const isCompact = height < 28;

				return (
					<div
						key={event.id}
						draggable
						onDragStart={(e) => handleDragStart(e, event.id)}
						onDragEnd={handleDragEnd}
						onClick={(e) => {
							if (suppressNextOpenRef.current) {
								suppressNextOpenRef.current = false;
								return;
							}

							if (selectedSlot || editingEvent) {
								onClose();
								setPanelAnchor(null);
								return;
							}

							const rect = (
								e.currentTarget as HTMLElement
							).getBoundingClientRect();
							setPanelAnchor(rect);
							onEdit(event.id);
						}}
						className={cn(
							"event absolute pointer-events-auto justify-between p-3 transition-all group",
							isCompact && "event--compact",
							event.status === "completed" && "event--completed",
							draggedEventId === event.id && "opacity-40 scale-90",
						)}
						style={{
							top,
							height,
							left: `${(100 / 7) * event.dayIndex}%`,
							width: `${100 / 7}%`,
						}}
					>
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0 flex-1">
								<div className="event-header">
									<input
										type="checkbox"
										className="event-checkbox"
										checked={event.status === "completed"}
										onChange={(e) => {
											e.stopPropagation();
											onToggle(event.id);
										}}
										onClick={(e) => e.stopPropagation()}
									/>
									<div className="event-title">{event.title}</div>
								</div>
								{showMeta && (
									<div className="event-meta">
										{toHHMM(event.start_time)}-{toHHMM(event.end_time)}
									</div>
								)}
								{showStatus && (
									<div className="event-status">
										{event.status === "planned" ? "Planned" : "Done"}
									</div>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
