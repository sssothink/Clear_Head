import { DAY_MINUTES, minutesToTime, timeToMinutes } from "@/shared/lib/time";

export type ResizeEdge = "top" | "bottom";

export type TaskRangeMinutes = {
	startMinutes: number;
	endMinutes: number;
};

export type ResizeOptions = {
	minDurationMinutes: number;
	snapMinutes: number;
	dayStartMinutes: number;
	dayEndMinutes: number;
};

export const RESIZE_DEFAULTS: ResizeOptions = {
	minDurationMinutes: 15,
	snapMinutes: 15,
	dayStartMinutes: 0,
	dayEndMinutes: DAY_MINUTES,
};

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function snapToGrid(minutes: number, snapMinutes: number): number {
	if (snapMinutes <= 1) return minutes;
	return Math.round(minutes / snapMinutes) * snapMinutes;
}

export function toRangeMinutes(
	startTime: string,
	endTime: string,
): TaskRangeMinutes {
	const startMinutes = timeToMinutes(startTime);
	const endMinutes =
		endTime === "00:00" && startTime !== "00:00"
			? DAY_MINUTES
			: timeToMinutes(endTime);

	return { startMinutes, endMinutes };
}

export function fromRangeMinutes(range: TaskRangeMinutes): {
	start_time: string;
	end_time: string;
} {
	return {
		start_time: minutesToTime(range.startMinutes),
		end_time:
			range.endMinutes === DAY_MINUTES
				? "00:00"
				: minutesToTime(range.endMinutes),
	};
}

export function resizeTaskRange(
	range: TaskRangeMinutes,
	edge: ResizeEdge,
	deltaMinutes: number,
	options?: Partial<ResizeOptions>,
): TaskRangeMinutes {
	const cfg: ResizeOptions = { ...RESIZE_DEFAULTS, ...options };

	let nextStart = range.startMinutes;
	let nextEnd = range.endMinutes;

	if (edge === "top") {
		const raw = range.startMinutes + deltaMinutes;
		const snapped = snapToGrid(raw, cfg.snapMinutes);
		const maxStart = range.endMinutes - cfg.minDurationMinutes;
		nextStart = clamp(snapped, cfg.dayStartMinutes, maxStart);
	} else {
		const raw = range.endMinutes + deltaMinutes;
		const snapped = snapToGrid(raw, cfg.snapMinutes);
		const minEnd = range.startMinutes + cfg.minDurationMinutes;
		nextEnd = clamp(snapped, minEnd, cfg.dayEndMinutes);
	}

	return { startMinutes: nextStart, endMinutes: nextEnd };
}
