import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";

type Props = {
	onClick: () => void;
	dayIndex: number;
	hourIndex: number;
};

export default function WeekCell({ onClick, dayIndex, hourIndex }: Props) {
	const [isDragOver, setIsDragOver] = useState(false);
	const { onEventDrop } = useDashboard();

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
			className={`h-15 border-r border-b border-border hover:bg-muted/40 transition-colors ${
				isDragOver ? "bg-blue-100/50" : ""
			}`}
			onClick={onClick}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		></div>
	);
}

