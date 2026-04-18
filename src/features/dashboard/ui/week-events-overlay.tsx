"use client";

import { cn } from "@/shared/lib/cn";
import { useDashboard } from "../model";
import { useEffect, useRef, useState } from "react";
import { toHHMM } from "@/lib/utils";
import { getEventLayout, yToMinute } from "@/shared/lib/layout";
import { RepeatIcon } from "lucide-react";
import {
	fromRangeMinutes,
	resizeTaskRange,
	toRangeMinutes,
} from "../model/event-resize";

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
		onEventResize,
	} = useDashboard();
	const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
	const isResizingRef = useRef(false);
	const [resizePreview, setResizePreview] = useState<
		Record<string, { start_time: string; end_time: string }>
	>({});
	const overlayRef = useRef<HTMLDivElement | null>(null);

	type ActiveResize = {
		eventId: string;
		edge: "top" | "bottom";
		initialStartTime: string;
		initialEndTime: string;
		startPointerMinute: number;
		pointerId: number;
	} | null;

	const [activeResize, setActiveResize] = useState<ActiveResize>(null);

	const handleResizePointerDown = (
		e: React.PointerEvent<HTMLDivElement>,
		eventItem: (typeof events)[number],
		edge: "top" | "bottom",
	) => {
		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.setPointerCapture(e.pointerId);

		suppressNextOpenRef.current = true;
		isResizingRef.current = true;

		const overlayRect = overlayRef.current?.getBoundingClientRect();
		if (!overlayRect) return;

		const pointerY = e.clientY - overlayRect.top;
		const startPointerMinute = yToMinute(pointerY, hourHeight, isCollapsed);

		setActiveResize({
			eventId: eventItem.id,
			edge,
			initialStartTime: eventItem.start_time,
			initialEndTime: eventItem.end_time,
			startPointerMinute,
			pointerId: e.pointerId,
		});
	};

	const handleDragStart = (
		event: React.DragEvent<HTMLDivElement>,
		eventId: string,
	) => {
		if (isResizingRef.current) {
			event.preventDefault();
			return;
		}

		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("eventId", eventId);

		const source = event.currentTarget.closest(".event") as HTMLElement | null;

		if (source) {
			const dragPreview = source.cloneNode(true) as HTMLElement;

			dragPreview.style.position = "fixed";
			dragPreview.style.top = "-1000px";
			dragPreview.style.left = "-1000px";
			dragPreview.style.width = `${source.offsetWidth}px`;
			dragPreview.style.height = `${source.offsetHeight}px`;
			dragPreview.style.opacity = "0.98";
			dragPreview.style.transform = "scale(1.03)";
			dragPreview.style.boxShadow = "0 18px 44px rgba(0, 0, 0, 0.32)";
			dragPreview.style.pointerEvents = "none";
			dragPreview.style.zIndex = "9999";

			document.body.appendChild(dragPreview);
			event.dataTransfer.setDragImage(
				dragPreview,
				source.offsetWidth / 2,
				Math.min(28, source.offsetHeight / 2),
			);

			requestAnimationFrame(() => {
				dragPreview.remove();
			});
		}

		setDraggedEventId(eventId);
	};

	const handleDragEnd = () => {
		setDraggedEventId(null);
	};

	useEffect(() => {
		if (!activeResize) return;

		const handlePointerMove = (e: PointerEvent) => {
			const overlayRect = overlayRef.current?.getBoundingClientRect();
			if (!overlayRect) return;

			const pointerY = e.clientY - overlayRect.top;
			const currentPointerMinute = yToMinute(pointerY, hourHeight, isCollapsed);
			const deltaMinutes =
				currentPointerMinute - activeResize.startPointerMinute;

			const initialRange = toRangeMinutes(
				activeResize.initialStartTime,
				activeResize.initialEndTime,
			);

			const nextRange = resizeTaskRange(
				initialRange,
				activeResize.edge,
				deltaMinutes,
			);

			setResizePreview((prev) => ({
				...prev,
				[activeResize.eventId]: fromRangeMinutes(nextRange),
			}));
		};

		const finishResize = () => {
			if (activeResize) {
				const finalPreview = resizePreview[activeResize.eventId];
				if (finalPreview) {
					onEventResize(
						activeResize.eventId,
						finalPreview.start_time,
						finalPreview.end_time,
					);
				}

				setResizePreview((prev) => {
					const next = { ...prev };
					delete next[activeResize.eventId];
					return next;
				});
			}

			isResizingRef.current = false;
			setActiveResize(null);
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", finishResize);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", finishResize);
		};
	}, [activeResize, hourHeight, isCollapsed, resizePreview, onEventResize]);

	return (
		<div ref={overlayRef} className="absolute inset-0 pointer-events-none">
			{events.map((event) => {
				const preview = resizePreview[event.id];
				const displayStartTime = preview?.start_time || event.start_time;
				const displayEndTime = preview?.end_time || event.end_time;

				const { top, height } = getEventLayout(
					displayStartTime,
					displayEndTime,
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
							"event absolute pointer-events-auto justify-between p-3 transition-all duration-150",
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
						<div
							onPointerDown={(e) => handleResizePointerDown(e, event, "top")}
							className="absolute inset-x-0 top-0 z-10 h-2 cursor-ns-resize pointer-events-auto"
						/>
						<div
							draggable
							onDragStart={(e) => handleDragStart(e, event.id)}
							onDragEnd={handleDragEnd}
							className="flex h-full items-start justify-between gap-2"
						>
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
										{toHHMM(displayStartTime)}-{toHHMM(displayEndTime)}
									</div>
								)}
								{showStatus && (
									<div className="event-status">
										{event.status === "planned" ? "Planned" : "Done"}
									</div>
								)}
							</div>
						</div>
						<div
							onPointerDown={(e) => handleResizePointerDown(e, event, "bottom")}
							className="absolute inset-x-0 bottom-0 z-10 h-2 cursor-ns-resize pointer-events-auto"
						/>
					</div>
				);
			})}
		</div>
	);
}
