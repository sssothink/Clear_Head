"use client";

import { cn } from "@/shared/lib/cn";
import { useDashboard } from "../model";
import { useState } from "react";
import { toHHMM } from "@/lib/utils";
import { getEventLayout } from "@/shared/lib/layout";
import { RepeatIcon } from "lucide-react";

export default function WeekEventsOverlay() {
	const {
		events,
		onToggle,
		onEdit,
		onClose,
		selectedSlot,
		editingEvent,
		setPanelAnchor,
		suppressNextOpenRef,
		hourHeight,
		isCollapsed,
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
				const { top, height } = getEventLayout(
					event.start_time,
					event.end_time,
					hourHeight,
					isCollapsed,
				);

				const isRecurring =
					event.recurrence_type && event.recurrence_type !== "none";
				const recurrenceShort = event.recurrence_type === "weekly" ? "W" : "D";
				const recurrenceTitle =
					event.recurrence_type === "weekly"
						? "Repeats weekly"
						: "Repeats daily";
				const showMeta = height >= Math.max(34, hourHeight * 0.65);
				const showStatus = height >= Math.max(52, hourHeight * 1.0);
				const isCompact = height < Math.max(24, hourHeight * 0.42);

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
									{isRecurring && (
										<span
											className="event-repeat-mark"
											title={recurrenceTitle}
											aria-label={recurrenceTitle}
										>
											<RepeatIcon
												className="event-repeat-icon"
												size={12}
												strokeWidth={2.2}
											/>
											{recurrenceShort}
										</span>
									)}
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
