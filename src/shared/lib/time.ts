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
