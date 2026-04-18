import { useRef, useState } from "react";
import { useDashboard } from "../model";

type Props = {
	onClick: () => void;
	dayIndex: number;
	hourIndex: number;
};

export default function WeekGridCell({ onClick, dayIndex, hourIndex }: Props) {
	const [isDragOver, setIsDragOver] = useState(false);
	const [isInvalidDrop, setIsInvalidDrop] = useState(false);
	const {
		onEventDrop,
		canEventDrop,
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
		const eventId = e.dataTransfer.getData("eventId");
		const isAllowed = eventId ? canEventDrop(eventId, dayIndex, hourIndex) : true;

		e.dataTransfer.dropEffect = isAllowed ? "move" : "none";
		setIsDragOver(true);
		setIsInvalidDrop(!isAllowed);
	};

	const handleDragLeave = () => {
		setIsDragOver(false);
		setIsInvalidDrop(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);
		setIsInvalidDrop(false);

		const eventId = e.dataTransfer.getData("eventId");
		if (eventId) {
			onEventDrop(eventId, dayIndex, hourIndex);
		}
	};
	const cellRef = useRef<HTMLDivElement | null>(null);
	const isPreviewSelected =
		selectedSlot?.dayIndex === dayIndex &&
		selectedSlot?.hourIndex === hourIndex;

	const toggleCollapseKeepingCellPosition = (
		applyToggle: () => void,
		onAfterLayout?: () => void,
		keepViewport = true,
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

			if (Math.abs(delta) > 0.5 && keepViewport) {
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
			className={`border-r border-b border-border bg-transparent transition-colors hover:bg-[var(--panel-subtle)]
				${isPreviewSelected ? "cell-preview-selected" : ""}
				${isDragOver ? (isInvalidDrop ? "cell-drop-target-invalid" : "cell-drop-target") : ""}
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
						toggleCollapseKeepingCellPosition(() =>
							setIsCollapsedManual(false),
						);
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
						false,
					);
					return;
				}

				if (shouldCollapse) {
					toggleCollapseKeepingCellPosition(
						() => setIsCollapsedManual(true),
						openFromCurrentCell,
						false,
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
