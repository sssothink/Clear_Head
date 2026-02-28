import { cn } from "@/shared/lib/cn";
import { getWeekDates } from "@/shared/lib/date";
import { format } from "date-fns";

export default function WeekHeader() {
	const today = new Date();
	const weekDates = getWeekDates(today);

	return (
		<div className="flex sticky top-0 bg-background z-10">
			<div className="w-10 p-4 font-medium border-r border-b border-border"></div>
			<div className="flex-1 grid grid-cols-7 border-b border-border">
				{weekDates.map((date) => {
					const isToday =
						format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

					return (
						<div
							key={date.toISOString()}
							className="p-4 text-center border-r border-border"
						>
							<div
								className={`text-sm ${
									isToday ? "text-primary font-semibold" : ""
								}`}
							>
								{format(date, "EEE")}
							</div>

							<div
								className={`text-lg ${isToday ? "text-primary font-bold" : ""}`}
							>
								{format(date, "d")}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
