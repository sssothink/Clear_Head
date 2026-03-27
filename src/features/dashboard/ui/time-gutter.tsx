import { getHourLabel, hourToVisualHeight } from "@/shared/lib/layout";
import { useDashboard } from "../model";

export default function TimeGutter() {
	const hours = Array.from({ length: 24 }, (_, i) => getHourLabel(i));
	const { hourHeight, isCollapsed } = useDashboard();

	return (
		<div className="w-12 border-r border-border bg-background/70">
			{hours.map((hour, i) => {
				const h = hourToVisualHeight(i, hourHeight, isCollapsed);
				return (
					<div
						key={hour}
						style={{ height: h }}
						className="flex items-start justify-end pr-2 text-[11px] text-muted-foreground border-b border-border"
					>
						{hour}
					</div>
				);
			})}
		</div>
	);
}
