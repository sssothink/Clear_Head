"use client";

import { formatISODate, getStartOfWeek } from "@/shared/lib/date";
import { addDays, addWeeks, format, isSameWeek, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WeekSwitcher({ weekStart }: { weekStart: string }) {
	const router = useRouter();

	const start = new Date(weekStart);
	const end = addDays(start, 6);
	const todayWeekStart = getStartOfWeek(new Date());

	const previousWeek = subWeeks(start, 1);
	const nextWeek = addWeeks(start, 1);

	const previousWeekUrl = `/dashboard?week=${formatISODate(previousWeek)}`;
	const nextWeekUrl = `/dashboard?week=${formatISODate(nextWeek)}`;
	const todayWeekUrl = `/dashboard?week=${formatISODate(todayWeekStart)}`;

	const isCurrentWeek = isSameWeek(start, new Date(), { weekStartsOn: 1 });

	const goToWeek = (url: string) => {
		router.push(url, { scroll: false });
	};

	useEffect(() => {
		router.prefetch(previousWeekUrl);
		router.prefetch(nextWeekUrl);
		router.prefetch(todayWeekUrl);
	}, [router, previousWeekUrl, nextWeekUrl, todayWeekUrl]);

	return (
		<div className="week-switcher" aria-label="Week navigation">
			<button
				type="button"
				className="week-switcher-button"
				aria-label="Previous week"
				onClick={() => goToWeek(previousWeekUrl)}
			>
				<ChevronLeft size={16} />
			</button>

			<div className="week-switcher-range" aria-live="polite">
				{format(start, "MMM d")} - {format(end, "MMM d")}
			</div>

			<button
				type="button"
				className="week-switcher-today"
				disabled={isCurrentWeek}
				onClick={() => goToWeek(todayWeekUrl)}
			>
				Today
			</button>

			<button
				type="button"
				className="week-switcher-button"
				aria-label="Next week"
				onClick={() => goToWeek(nextWeekUrl)}
			>
				<ChevronRight size={16} />
			</button>
		</div>
	);
}
