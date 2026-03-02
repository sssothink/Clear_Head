"use client";
import { useOptimisticGoals } from "@/features/goals/hooks/useOptimisticGoals";
import { DayEvent as Event } from "@/features/goals/model/types";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Check, Pen, Trash, X } from "lucide-react";

// const mockEvents: Event[] = [
// 	{
// 		id: "1",
// 		title: "Morning Jog",
// 		dayIndex: 6,
// 		start_time: "09:30",
// 		end_time: "11:00",
// 	},
// 	{
// 		id: "2",
// 		title: "Afternoon Yoga",
// 		dayIndex: 6,
// 		start_time: "14:00",
// 		end_time: "15:30",
// 	},
// ];

const HOUR_HEIGHT = 60;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export default function WeekEventsLayer({
	events,
	onToggle,
	onDeleteGoal,
	onEditGoal,
}: {
	events: Event[];
	onToggle: (id: string) => void;
	onDeleteGoal: (id: string) => void;
	onEditGoal: (id: string) => void;
}) {
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
						className={cn(
							"event absolute pointer-events-auto justify-between p-3 transition-all group",
							event.status === "completed" && "opacity-60",
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
								onClick={() => onEditGoal(event.id)}
								className="border-2 rounded-[0.6em] cursor-pointer active:scale-97"
							>
								<Pen size={10}></Pen>
							</Button>
							<Button
								size="xs"
								variant="ghost"
								onClick={() => onDeleteGoal(event.id)}
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
