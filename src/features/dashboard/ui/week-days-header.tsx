"use client";

import { getWeekDates, isSameISODate } from "@/shared/lib/date";
import { format } from "date-fns";
import { useDashboard } from "../model";

export default function WeekDaysHeader() {
	const { weekStart } = useDashboard();
	const today = new Date();
	const weekDates = getWeekDates(new Date(weekStart));

	return (
		<div className="flex sticky top-0 z-100 backdrop-blur border border-border overflow-hidden text-foreground">
			<div className="w-12 p-4 font-medium border-r border-b border-border"></div>
			<div className="flex-1 grid grid-cols-7 border-b border-border">
				{weekDates.map((date) => {
					const isToday = isSameISODate(date, today);

					return (
						<div
							key={date.toISOString()}
							className={`p-3 text-center border-r border-border ${
								isToday ? "bg-primary/10" : "bg-background/70"
							}`}
						>
							<div
								className={`text-sm ${
									isToday
										? "text-primary font-semibold"
										: "text-muted-foreground"
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
