export function getStartOfWeek(date: Date) {
	const day = date.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	const monday = new Date(date);
	monday.setDate(date.getDate() + diff);
	monday.setHours(0, 0, 0, 0);
	return monday;
}

export function getWeekDates(baseDate: Date) {
	const start = getStartOfWeek(baseDate);

	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(start);
		d.setDate(start.getDate() + i);
		return d;
	});
}
