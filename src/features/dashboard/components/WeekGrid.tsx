import WeekCell from "./WeekCell";
import WeekEventsLayer from "./WeekEventsLayer";
import { addDays } from "date-fns";
import { useDashboard } from "../context/DashboardContext";

export default function WeekGrid() {
	const { events, weekStart, onCellClick, onToggle, onDelete, onEdit } = useDashboard();
	const hours = Array.from({ length: 24 });
	const days = Array.from({ length: 7 });

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

				<WeekEventsLayer />
			</div>
		</div>
	);
}
