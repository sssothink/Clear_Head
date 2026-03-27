import { useState } from "react";
import { useDashboard } from "../model";

type Props = {
	onClick: () => void;
	dayIndex: number;
	hourIndex: number;
};

export default function WeekGridCell({ onClick, dayIndex, hourIndex }: Props) {
	const [isDragOver, setIsDragOver] = useState(false);
	const {
		onEventDrop,
		setPanelAnchor,
		selectedSlot,
		editingEvent,
		onClose,
		suppressNextOpenRef,
	} = useDashboard();

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => {
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);

		const eventId = e.dataTransfer.getData("eventId");
		if (eventId) {
			onEventDrop(eventId, dayIndex, hourIndex);
		}
	};

	return (
		<div
			className={`h-15 border-r border-b border-border bg-background hover:bg-muted/60 transition-colors
	${isDragOver ? "bg-primary/15" : ""}
`}
			onClick={(e) => {
				if (suppressNextOpenRef.current) {
					suppressNextOpenRef.current = false;
					return;
				}
				if (selectedSlot || editingEvent) {
					onClose();
					setPanelAnchor(null);
					return;
				}
				const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
				setPanelAnchor(rect);
				onClick();
			}}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		></div>
	);
}
