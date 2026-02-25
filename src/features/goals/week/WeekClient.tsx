"use client";

import { getWeekDates } from "@/lib/utils";
import DayClient, { DayEvent } from "../day/DayClient";

type WeekClientProps = {
	baseDate: string;
	weekEvents: Record<string, DayEvent[]>;
};

export default function WeekClient({ baseDate, weekEvents }: WeekClientProps) {
	const dates = getWeekDates(baseDate);

	return (
		<div className="grid grid-cols-7 gap-4">
			{dates.map((date) => (
				<DayClient
					key={date}
					initialEvents={weekEvents[date] ?? []}
					date={date}
				/>
			))}
		</div>
	);
}
