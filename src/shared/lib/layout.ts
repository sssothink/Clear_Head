import {
	durationMinutes as getDurationMinutes,
	minutesToTime,
	timeToMinutes,
} from "./time";

export const DEFAULT_HOUR_HEIGHT = 60;
export const MIN_EVENT_HEIGHT = 15;

export function getCurrentTimeTop(now: Date, hourHeight = DEFAULT_HOUR_HEIGHT) {
	const minuteHeight = hourHeight / 60;
	return now.getHours() * hourHeight + now.getMinutes() + minuteHeight;
}

export function getEventLayout(
	startTime: string,
	endTime: string,
	hourHeight = DEFAULT_HOUR_HEIGHT,
) {
	const minuteHeight = hourHeight / 60;
	const startMinutes = timeToMinutes(startTime);
	const durationMinutes = getDurationMinutes(startTime, endTime);

	const snappedDurationMinutes = Math.max(
		MIN_EVENT_HEIGHT,
		Math.round(durationMinutes / 15) * 15,
	);

	return {
		top: startMinutes * minuteHeight,
		height: snappedDurationMinutes * minuteHeight,
		durationMinutes,
	};
}

export function getHourLabel(hour: number) {
	return minutesToTime(hour * 60);
}
