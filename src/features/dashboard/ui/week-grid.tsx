"use client";

import WeekGridCell from "./week-grid-cell";
import WeekEventsOverlay from "./week-events-overlay";
import { addDays } from "date-fns";
import { useDashboard } from "../model";
import { useEffect, useRef, useState } from "react";
import { formatISODate } from "@/shared/lib/date";
import {
	getCurrentTimeTop,
	hourToVisualHeight,
	minuteToY,
} from "@/shared/lib/layout";

export default function WeekGrid() {
	const {
		weekStart,
		onCellClick,
		hourHeight,
		setHourHeight,
		isCollapsed,
		setIsCollapsedManual,
		hasEarlyTasks,
	} = useDashboard();
	const MIN_HOUR_HEIGHT = 40;
	const MAX_HOUR_HEIGHT = 120;
	const ZOOM_STEP = 4;
	const [now, setNow] = useState(new Date());
	const hours = Array.from({ length: 24 });
	const days = Array.from({ length: 7 });
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();
	const currentTimeTop = getCurrentTimeTop(now, hourHeight, isCollapsed);
	const gridRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const node = gridRef.current;
		if (!node) return;

		const onWheel = (e: WheelEvent) => {
			// ctrl (Windows/Linux) + wheel, meta как fallback для некоторых устройств
			if (!(e.ctrlKey || e.metaKey)) return;

			e.preventDefault();
			e.stopPropagation();

			setHourHeight((prev) => {
				const next = prev + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
				return Math.min(MAX_HOUR_HEIGHT, Math.max(MIN_HOUR_HEIGHT, next));
			});
		};

		node.addEventListener("wheel", onWheel, { passive: false });
		return () => node.removeEventListener("wheel", onWheel);
	}, [setHourHeight]);

	useEffect(() => {
		const tick = () => setNow(new Date());
		const id = setInterval(tick, 60000);
		return () => clearInterval(id);
	}, []);

	const hourHeights = Array.from({ length: 24 }, (_, h) =>
		hourToVisualHeight(h, hourHeight, isCollapsed),
	);

	const gridTemplateRows = hourHeights.map((h) => `${h}px`).join(" ");

	const collapseBoundaryTop = minuteToY(8 * 60, hourHeight, isCollapsed);

	const collapseDisabled = !isCollapsed && hasEarlyTasks;

	return (
		<div ref={gridRef} className="flex-1">
			<div className="relative bg-transparent">
				<div className="grid grid-cols-7" style={{ gridTemplateRows }}>
					{hours.map((_, hourIndex) =>
						days.map((_, dayIndex) => (
							<WeekGridCell
								key={`${dayIndex}-${hourIndex}`}
								dayIndex={dayIndex}
								hourIndex={hourIndex}
								onClick={() =>
									onCellClick({
										dayIndex,
										hourIndex,
										date: formatISODate(addDays(new Date(weekStart), dayIndex)),
									})
								}
							/>
						)),
					)}
				</div>

				<div
					style={{ top: `${currentTimeTop}px` }}
					className="pointer-events-none absolute -left-10 z-10 -translate-y-1/2 rounded-full border border-border bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground shadow-sm"
				>
					{`${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`}
				</div>

				<div
					className="collapse-toggle-wrap"
					style={{ top: collapseBoundaryTop + 6 }}
				>
					<button
						type="button"
						className="collapse-toggle"
						disabled={collapseDisabled}
						aria-disabled={collapseDisabled}
						aria-describedby={collapseDisabled ? "collapse-tooltip" : undefined}
						onClick={() => {
							if (collapseDisabled) return;
							setIsCollapsedManual((v) => !v);
						}}
					>
						{isCollapsed ? "Expand 00-08" : "Collapse 00-08"}
					</button>

					{collapseDisabled && (
						<div
							id="collapse-tooltip"
							role="tooltip"
							className="collapse-tooltip"
						>
							Сжать зону нельзя: в диапазоне 00:00-08:00 есть задачи.
						</div>
					)}
				</div>

				<div
					style={{ top: `${currentTimeTop}px` }}
					className="pointer-events-none absolute left-0 right-0 z-10 h-px bg-[var(--event-border)]"
				></div>

				<WeekEventsOverlay />
			</div>
		</div>
	);
}
