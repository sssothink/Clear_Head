export function timeToMinutes(time: string) {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
	const hours = Math.floor(minutes / 60);
	const minutesRemaining = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${minutesRemaining
		.toString()
		.padStart(2, "0")}`;
}

export function isQuarterHour(time: string) {
	return timeToMinutes(time) % 15 === 0;
}

export function addMinutesToTime(time: string, minutesToAdd: number) {
	const total = timeToMinutes(time) + minutesToAdd;
	if (total < 0 || total > 23 * 60 + 59) {
		return null;
	}

	return minutesToTime(total);
}

export const DAY_MINUTES = 24 * 60;

export function durationMinutes(start: string, end: string) {
	const s = timeToMinutes(start);
	const e = timeToMinutes(end);
	return e > s ? e - s : DAY_MINUTES - s + e;
}

export function toEndOfDayAwareMinutes(start: string, end: string) {
	if (end === "00:00" && start !== "00:00") return 24 * 60;
	return timeToMinutes(end);
}

export const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
	const h = String(Math.floor(i / 4)).padStart(2, "0");
	const m = String((i % 4) * 15).padStart(2, "0");
	return `${h}:${m}`;
});

// end wheel: 00:15 ... 23:45, 00:00
export const END_TIME_OPTIONS = [...TIME_OPTIONS.slice(1), TIME_OPTIONS[0]];

export function toComparableEndMinutes(time: string) {
	return time === "00:00" ? DAY_MINUTES : timeToMinutes(time);
}

export function minAllowedEndMinutes(startTime: string) {
	return timeToMinutes(startTime) + 15;
}

export function isEndOptionDisabled(option: string, startTime: string) {
	const minEnd = minAllowedEndMinutes(startTime);
	const optionEnd = toComparableEndMinutes(option);

	// для старта 00:00 конец 00:00 невалиден (должно быть минимум 00:15)
	if (startTime === "00:00" && option === "00:00") return true;

	return optionEnd < minEnd;
}
