"use client";

import WeekGridCell from "./week-grid-cell";
import WeekEventsOverlay from "./week-events-overlay";
import { addDays } from "date-fns";
import { useDashboard } from "../model";
import { useEffect, useRef, useState } from "react";
import { formatISODate } from "@/shared/lib/date";
import { getCurrentTimeTop } from "@/shared/lib/layout";

export default function WeekGrid() {
	const { weekStart, onCellClick, hourHeight, setHourHeight } = useDashboard();
	const MIN_HOUR_HEIGHT = 32;
	const MAX_HOUR_HEIGHT = 120;
	const ZOOM_STEP = 4;
	const [now, setNow] = useState(new Date());
	const hours = Array.from({ length: 24 });
	const days = Array.from({ length: 7 });
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();
	const currentTimeTop = getCurrentTimeTop(now, hourHeight);
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

	return (
		<div ref={gridRef} className="flex-1">
			<div className="relative bg-background">
				<div
					className="grid grid-cols-7"
					style={{ gridTemplateRows: `repeat(24, ${hourHeight}px)` }}
				>
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
					className="absolute -left-10 transform -translate-y-1/2 bg-primary text-black text-[11px] px-2 py-0.5 rounded-full z-10 pointer-events-none shadow"
				>
					{`${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`}
				</div>

				<div
					style={{ top: `${currentTimeTop}px` }}
					className="absolute left-0 right-0 h-0.5 bg-primary/70 z-10 pointer-events-none"
				></div>

				<WeekEventsOverlay />
			</div>
		</div>
	);
}
