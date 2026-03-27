import { useRef, useState } from "react";
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
		isCollapsed,
		setIsCollapsedManual,
		hasEarlyTasks,
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
	const cellRef = useRef<HTMLDivElement | null>(null);

	const toggleCollapseKeepingCellPosition = (
		applyToggle: () => void,
		onAfterLayout?: () => void,
	) => {
		const el = cellRef.current;
		if (!el) {
			applyToggle();
			onAfterLayout?.();
			return;
		}

		const beforeTop = el.getBoundingClientRect().top;
		applyToggle();

		requestAnimationFrame(() => {
			const afterEl = cellRef.current;
			if (!afterEl) {
				onAfterLayout?.();
				return;
			}

			const afterTop = afterEl.getBoundingClientRect().top;
			const delta = afterTop - beforeTop;

			if (Math.abs(delta) > 0.5) {
				window.scrollBy({ top: delta, left: 0, behavior: "auto" });
			}

			requestAnimationFrame(() => {
				onAfterLayout?.();
			});
		});
	};

	return (
		<div
			ref={cellRef}
			className={`border-r border-b border-border bg-background hover:bg-muted/60 transition-colors
				${isDragOver ? "bg-primary/15" : ""}
			`}
			onClick={(e) => {
				if (suppressNextOpenRef.current) {
					suppressNextOpenRef.current = false;
					return;
				}

				const shouldExpand = isCollapsed && hourIndex < 8;
				const shouldCollapse = !isCollapsed && !hasEarlyTasks && hourIndex >= 8;

				if (selectedSlot || editingEvent) {
					if (shouldExpand) {
						toggleCollapseKeepingCellPosition(() => setIsCollapsedManual(false));
					} else if (shouldCollapse) {
						toggleCollapseKeepingCellPosition(() => setIsCollapsedManual(true));
					}
					onClose();
					setPanelAnchor(null);
					return;
				}

				const clickedCell = e.currentTarget as HTMLElement;

				const openFromCurrentCell = () => {
					setPanelAnchor(clickedCell.getBoundingClientRect());
					onClick();
				};

				if (shouldExpand) {
					toggleCollapseKeepingCellPosition(
						() => setIsCollapsedManual(false),
						openFromCurrentCell,
					);
					return;
				}

				if (shouldCollapse) {
					toggleCollapseKeepingCellPosition(
						() => setIsCollapsedManual(true),
						openFromCurrentCell,
					);
					return;
				}

				openFromCurrentCell();
			}}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		></div>
	);
}
