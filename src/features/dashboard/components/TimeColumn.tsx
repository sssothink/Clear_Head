export default function TimeColumn() {
	const hours = Array.from(
		{ length: 24 },
		(_, i) => i.toString().padStart(2, "0") + ":00",
	);

	return (
		<div className="w-10 border-r border-border">
			{hours.map((hour) => (
				<div
					key={hour}
					className="h-20 flex items-start justify-end pr-1 text-xs text-muted-foreground border-b border-border"
				>
					{hour}
				</div>
			))}
		</div>
	);
}
