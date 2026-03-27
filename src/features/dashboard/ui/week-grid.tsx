"use client";

import WeekGridCell from "./week-grid-cell";
import WeekEventsOverlay from "./week-events-overlay";
import { addDays } from "date-fns";
import { useDashboard } from "../model";
import { useEffect, useState } from "react";
import { formatISODate } from "@/shared/lib/date";
import { getCurrentTimeTop } from "@/shared/lib/layout";

export default function WeekGrid() {
	const { weekStart, onCellClick } = useDashboard();
	const [now, setNow] = useState(new Date());
	const hours = Array.from({ length: 24 });
	const days = Array.from({ length: 7 });
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();
	const currentTimeTop = getCurrentTimeTop(now);

	useEffect(() => {
		const tick = () => setNow(new Date());
		const id = setInterval(tick, 60000);
		return () => clearInterval(id);
	}, []);

	return (
		<div className="flex-1">
			<div className="relative bg-background">
				<div className="grid grid-cols-7 grid-rows-24">
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
