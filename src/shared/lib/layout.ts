import {
	durationMinutes as getDurationMinutes,
	minutesToTime,
	timeToMinutes,
} from "./time";

export const HOUR_HEIGHT = 60;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const MIN_EVENT_HEIGHT = 15;

export function getCurrentTimeTop(now: Date) {
	return now.getHours() * HOUR_HEIGHT + now.getMinutes() + MINUTE_HEIGHT;
}

export function getEventLayout(startTime: string, endTime: string) {
	const startMinutes = timeToMinutes(startTime);
	const durationMinutes = getDurationMinutes(startTime, endTime);

	const snappedDurationMinutes = Math.max(
		MIN_EVENT_HEIGHT,
		Math.round(durationMinutes / 15) * 15,
	);

	return {
		top: startMinutes * MINUTE_HEIGHT,
		height: snappedDurationMinutes * MINUTE_HEIGHT,
		durationMinutes,
	};
}

export function getHourLabel(hour: number) {
	return minutesToTime(hour * 60);
}
