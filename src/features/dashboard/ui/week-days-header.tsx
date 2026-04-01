"use client";

import { getWeekDates, isSameISODate } from "@/shared/lib/date";
import { format } from "date-fns";
import { useDashboard } from "../model";

export default function WeekDaysHeader() {
	const { weekStart } = useDashboard();
	const today = new Date();
	const weekDates = getWeekDates(new Date(weekStart));

	return (
		<div className="sticky top-3 z-100 mb-3 flex overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
			<div className="w-12 border-r border-border border-b border-border bg-[var(--panel-subtle)] p-4 font-medium"></div>
			<div className="grid flex-1 grid-cols-7 border-b border-border">
				{weekDates.map((date) => {
					const isToday = isSameISODate(date, today);

					return (
						<div
							key={date.toISOString()}
							className={`border-r border-border p-3 text-center ${
								isToday ? "bg-[var(--panel-strong)]" : "bg-transparent"
							}`}
						>
							<div
								className={`text-sm ${
									isToday
										? "font-semibold text-primary"
										: "text-muted-foreground"
								}`}
							>
								{format(date, "EEE")}
							</div>

							<div
								className={`text-lg ${isToday ? "font-bold text-primary" : ""}`}
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
