import {
	durationMinutes as getDurationMinutes,
	minutesToTime,
	timeToMinutes,
} from "./time";

export const DEFAULT_HOUR_HEIGHT = 60;
export const MIN_EVENT_HEIGHT = 15;
export const COLLAPSE_START_MIN = 0;
export const COLLAPSE_END_MIN = 8 * 60;
export const COLLAPSE_FACTOR = 0.2;
export const DAY_END_MIN = 24 * 60;

export function minuteToY(
	minute: number,
	hourHeight: number,
	collapsed = true,
) {
	const m = Math.max(0, Math.min(24 * 60, minute));
	const minuteHeight = hourHeight / 60;

	if (!collapsed) {
		return m * minuteHeight;
	}

	const collapsedMinuteHeight = minuteHeight * COLLAPSE_FACTOR;
	if (m <= COLLAPSE_END_MIN) {
		return m * collapsedMinuteHeight;
	}

	const collapsedBlock = COLLAPSE_END_MIN * collapsedMinuteHeight;
	return collapsedBlock + (m - COLLAPSE_END_MIN) * minuteHeight;
}

export function hourToVisualHeight(
	hour: number,
	hourHeight: number,
	collapsed = true,
) {
	if (!collapsed) return hourHeight;
	return hour < 8 ? hourHeight * COLLAPSE_FACTOR : hourHeight;
}

export function getCurrentTimeTop(
	now: Date,
	hourHeight = DEFAULT_HOUR_HEIGHT,
	collapsed = true,
) {
	const minuteOfDay = now.getHours() * 60 + now.getMinutes();
	return minuteToY(minuteOfDay, hourHeight, collapsed);
}

export function getEventLayout(
	startTime: string,
	endTime: string,
	hourHeight = DEFAULT_HOUR_HEIGHT,
	collapsed = true,
) {
	const startMinutes = timeToMinutes(startTime);
	const durationMinutes = getDurationMinutes(startTime, endTime);

	const rawEndMinutes = startMinutes + durationMinutes;

	const visualStart = minuteToY(startMinutes, hourHeight, collapsed);
	const visualEnd = minuteToY(
		Math.min(rawEndMinutes, 24 * 60),
		hourHeight,
		collapsed,
	);

	const minPx = Math.max(8, hourHeight * 0.2);

	return {
		top: visualStart,
		height: Math.max(minPx, visualEnd - visualStart),
		durationMinutes,
	};
}

export function getHourLabel(hour: number) {
	return minutesToTime(hour * 60);
}

export function yToMinute(y: number, hourHeight: number, collapsed = true) {
	const clampedY = Math.max(0, y);

	if (!collapsed) {
		return Math.max(
			0,
			Math.min(24 * 60, Math.round((clampedY / hourHeight) * 60)),
		);
	}

	const minuteHeight = hourHeight / 60;
	const collapsedMinuteHeight = minuteHeight * COLLAPSE_FACTOR;
	const collapsedBlockHeight = COLLAPSE_END_MIN * collapsedMinuteHeight;

	if (clampedY <= collapsedBlockHeight) {
		return Math.max(
			0,
			Math.min(COLLAPSE_END_MIN, Math.round(clampedY / collapsedMinuteHeight)),
		);
	}

	const expendedPartY = clampedY - collapsedBlockHeight;
	const expendedMinutes = Math.round(expendedPartY / minuteHeight);

	return Math.max(0, Math.min(24 * 60, COLLAPSE_END_MIN + expendedMinutes));
}
