import { DayEvent, Goal } from "@/features/goals/model/types";
import WeekCell from "./WeekCell";
import WeekEventsLayer from "./WeekEventsLayer";
import { addDays } from "date-fns";

type Props = {
	onCellClick: (slot: {
		dayIndex: number;
		hourIndex: number;
		date: string;
	}) => void;
	events: DayEvent[];
	weekStart: string;
	onToggle: (id: string) => void;
	onDeleteGoal: (id: string) => void;
	onEditGoal: (id: string) => void;
};

export default function WeekGrid({
	onCellClick,
	events,
	weekStart,
	onToggle,
	onDeleteGoal,
	onEditGoal,
}: Props) {
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
								onClick={() =>
									onCellClick({
										dayIndex,
										hourIndex,
										date: addDays(new Date(weekStart), dayIndex + 1)
											.toISOString()
											.split("T")[0],
									})
								}
							/>
						)),
					)}
				</div>

				<WeekEventsLayer
					events={events}
					onToggle={onToggle}
					onDeleteGoal={onDeleteGoal}
					onEditGoal={onEditGoal}
				/>
			</div>
		</div>
	);
}
