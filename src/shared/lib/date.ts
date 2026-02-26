export function getWeekDates(baseDate: string) {
	const date = new Date(baseDate);
	const day = date.getDay();

	const mondayOffset = day === 0 ? -6 : 1 - day;
	const monday = new Date(date);
	monday.setDate(date.getDate() + mondayOffset);

	return Array.from({ length: 7 }).map((_, i) => {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		return d.toISOString().split("T")[0];
	});
}
