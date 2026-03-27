"use client";

import { useCallback, useRef, useState } from "react";
import { DayEvent, SelectedSlot } from "@/features/goals/model/types";

export function useDashboardUIState() {
	const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
	const [editingEvent, setEditingEvent] = useState<DayEvent | null>(null);
	const [panelAnchor, setPanelAnchor] = useState<DOMRect | null>(null);
	const suppressNextOpenRef = useRef(false);

	const onCellClick = useCallback((slot: SelectedSlot | null) => {
		setEditingEvent(null);
		setSelectedSlot(slot);
	}, []);

	const onClose = useCallback(() => {
		setSelectedSlot(null);
		setEditingEvent(null);
		setPanelAnchor(null);
	}, []);

	return {
		selectedSlot,
		setSelectedSlot,
		editingEvent,
		setEditingEvent,
		panelAnchor,
		setPanelAnchor,
		suppressNextOpenRef,
		onCellClick,
		onClose,
	};
}
