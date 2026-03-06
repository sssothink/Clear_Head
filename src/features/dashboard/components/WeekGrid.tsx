import WeekCell from "./WeekCell";
import WeekEventsLayer from "./WeekEventsLayer";
import { addDays } from "date-fns";
import { useDashboard } from "../context/DashboardContext";

const HOUR_HEIGHT = 60;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export default function WeekGrid() {
	const { events, weekStart, onCellClick, onToggle, onDelete, onEdit } =
		useDashboard();
	const hours = Array.from({ length: 24 });
	const days = Array.from({ length: 7 });
	const now = new Date();
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();
	const currentTimeTop =
		currentHour * HOUR_HEIGHT + currentMinute + MINUTE_HEIGHT;

	return (
		<div className="flex-1">
			<div className="relative">
				<div className="grid grid-cols-7 grid-rows-24">
					{hours.map((_, hourIndex) =>
						days.map((_, dayIndex) => (
							<WeekCell
								key={`${dayIndex}-${hourIndex}`}
								dayIndex={dayIndex}
								hourIndex={hourIndex}
								onClick={() =>
									onCellClick({
										dayIndex,
										hourIndex,
										date: addDays(new Date(weekStart), dayIndex)
											.toISOString()
											.split("T")[0],
									})
								}
							/>
						)),
					)}
				</div>

				<div
					style={{ top: `${currentTimeTop}px` }}
					className="absolute -left-10 transform -translate-y-1/2 bg-red-500 text-white text-xs px-1 py-0.5 rounded z-10 pointer-events-none"
				>
					{`${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`}
				</div>

				<div
					style={{ top: `${currentTimeTop}px` }}
					className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 poiner-events-none"
				></div>

				<WeekEventsLayer />
			</div>
		</div>
	);
}
