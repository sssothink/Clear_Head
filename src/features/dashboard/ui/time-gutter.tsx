import { getHourLabel } from "@/shared/lib/layout";

export default function TimeGutter() {
	const hours = Array.from({ length: 24 }, (_, i) => getHourLabel(i));

	return (
		<div className="w-12 border-r border-border bg-background/70">
			{hours.map((hour) => (
				<div
					key={hour}
					className="h-15 flex items-start justify-end pr-2 text-[11px] text-muted-foreground border-b border-border"
				>
					{hour}
				</div>
			))}
		</div>
	);
}
