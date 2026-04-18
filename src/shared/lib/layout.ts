import {
	durationMinutes as getDurationMinutes,
	minutesToTime,
	timeToMinutes,
} from "./time";
import type { DayEvent } from "@/features/goals/model/types";

export const DEFAULT_HOUR_HEIGHT = 60;
export const MIN_EVENT_HEIGHT = 15;
export const COLLAPSE_START_MIN = 0;
export const COLLAPSE_END_MIN = 8 * 60;
export const COLLAPSE_FACTOR = 0.2;
export const DAY_END_MIN = 24 * 60;

export function minuteToY(
	minute: number,
	hourHeight: number,
	collapsed = true,
) {
	const m = Math.max(0, Math.min(24 * 60, minute));
	const minuteHeight = hourHeight / 60;

	if (!collapsed) {
		return m * minuteHeight;
	}

	const collapsedMinuteHeight = minuteHeight * COLLAPSE_FACTOR;
	if (m <= COLLAPSE_END_MIN) {
		return m * collapsedMinuteHeight;
	}

	const collapsedBlock = COLLAPSE_END_MIN * collapsedMinuteHeight;
	return collapsedBlock + (m - COLLAPSE_END_MIN) * minuteHeight;
}

export function hourToVisualHeight(
	hour: number,
	hourHeight: number,
	collapsed = true,
) {
	if (!collapsed) return hourHeight;
	return hour < 8 ? hourHeight * COLLAPSE_FACTOR : hourHeight;
}

export function getCurrentTimeTop(
	now: Date,
	hourHeight = DEFAULT_HOUR_HEIGHT,
	collapsed = true,
) {
	const minuteOfDay = now.getHours() * 60 + now.getMinutes();
	return minuteToY(minuteOfDay, hourHeight, collapsed);
}

export function getEventLayout(
	startTime: string,
	endTime: string,
	hourHeight = DEFAULT_HOUR_HEIGHT,
	collapsed = true,
) {
	const startMinutes = timeToMinutes(startTime);
	const durationMinutes = getDurationMinutes(startTime, endTime);

	const rawEndMinutes = startMinutes + durationMinutes;

	const visualStart = minuteToY(startMinutes, hourHeight, collapsed);
	const visualEnd = minuteToY(
		Math.min(rawEndMinutes, 24 * 60),
		hourHeight,
		collapsed,
	);

	const minPx = Math.max(8, hourHeight * 0.2);

	return {
		top: visualStart,
		height: Math.max(minPx, visualEnd - visualStart),
		durationMinutes,
	};
}

export function getHourLabel(hour: number) {
	return minutesToTime(hour * 60);
}

export function yToMinute(y: number, hourHeight: number, collapsed = true) {
	const clampedY = Math.max(0, y);

	if (!collapsed) {
		return Math.max(
			0,
			Math.min(24 * 60, Math.round((clampedY / hourHeight) * 60)),
		);
	}

	const minuteHeight = hourHeight / 60;
	const collapsedMinuteHeight = minuteHeight * COLLAPSE_FACTOR;
	const collapsedBlockHeight = COLLAPSE_END_MIN * collapsedMinuteHeight;

	if (clampedY <= collapsedBlockHeight) {
		return Math.max(
			0,
			Math.min(COLLAPSE_END_MIN, Math.round(clampedY / collapsedMinuteHeight)),
		);
	}

	const expendedPartY = clampedY - collapsedBlockHeight;
	const expendedMinutes = Math.round(expendedPartY / minuteHeight);

	return Math.max(0, Math.min(24 * 60, COLLAPSE_END_MIN + expendedMinutes));
}

type EventLayoutInput = Pick<
	DayEvent,
	"id" | "dayIndex" | "start_time" | "end_time"
>;

export type WeekEventLayout = {
	top: number;
	height: number;
	left: string;
	width: string;
	hasOverlap: boolean;
	overlapColumn: number;
	overlapColumnCount: number;
};

function getEventRangeMinutes(event: EventLayoutInput) {
	const start = timeToMinutes(event.start_time);
	const duration = getDurationMinutes(event.start_time, event.end_time);

	return {
		start,
		end: Math.min(start + duration, DAY_END_MIN),
	};
}

function doEventsOverlap(a: EventLayoutInput, b: EventLayoutInput) {
	const rangeA = getEventRangeMinutes(a);
	const rangeB = getEventRangeMinutes(b);

	return rangeA.start < rangeB.end && rangeB.start < rangeA.end;
}

function getOverlapGroups(dayEvents: EventLayoutInput[]) {
	// Группируем события по пересечению во времени

	const sortedEvents = [...dayEvents].sort((a, b) => {
		const rangeA = getEventRangeMinutes(a);
		const rangeB = getEventRangeMinutes(b);

		return rangeA.start - rangeB.start || rangeA.end - rangeB.end; // сортировка событий в хронологическом порядке
	});

	const groups: EventLayoutInput[][] = [];
	let currentGroup: EventLayoutInput[] = [];
	let currentGroupEnd = -1;

	for (const event of sortedEvents) {
		const range = getEventRangeMinutes(event);

		if (currentGroup.length === 0 || range.start < currentGroupEnd) {
			currentGroup.push(event);
			currentGroupEnd = Math.max(currentGroupEnd, range.end);
			continue;
		}

		groups.push(currentGroup);
		currentGroup = [event];
		currentGroupEnd = range.end;
	}

	if (currentGroup.length > 0) {
		groups.push(currentGroup);
	}

	return groups;
}

function assignOverlapColumns(group: EventLayoutInput[]) {
	const sortedEvents = [...group].sort((a, b) => {
		const rangeA = getEventRangeMinutes(a);
		const rangeB = getEventRangeMinutes(b);

		return rangeA.start - rangeB.start || rangeA.end - rangeB.end; // сортировка групп в хронологическом порядке
	});

	const columnEndMinutes: number[] = [];
	const columnsByEventId: Record<string, number> = {};

	for (const event of sortedEvents) {
		const range = getEventRangeMinutes(event);

		const availableColumn = columnEndMinutes.findIndex(
			(endMinute) => endMinute <= range.start,
		);

		const column =
			availableColumn === -1 ? columnEndMinutes.length : availableColumn;

		columnEndMinutes[column] = range.end;
		columnsByEventId[event.id] = column;
	}

	return {
		columnsByEventId,
		columnCount: Math.max(1, columnEndMinutes.length),
	};
}

export function getWeekEventLayouts(
	events: EventLayoutInput[],
	hourHeight = DEFAULT_HOUR_HEIGHT,
	collapsed = true,
) {
	const layouts: Record<string, WeekEventLayout> = {};
	const eventsByDay = new Map<number, EventLayoutInput[]>();

	for (const event of events) {
		const dayEvents = eventsByDay.get(event.dayIndex) ?? [];
		dayEvents.push(event);
		eventsByDay.set(event.dayIndex, dayEvents);
	}

	for (const [dayIndex, dayEvents] of eventsByDay) {
		const groups = getOverlapGroups(dayEvents);

		for (const group of groups) {
			const { columnsByEventId, columnCount } = assignOverlapColumns(group);
			const dayWidthPercent = 100 / 7;
			const columnWidthPercent = dayWidthPercent / columnCount;
			const gapPx = columnCount > 1 ? 3 : 0;
			for (const event of group) {
				const column = columnsByEventId[event.id] ?? 0;
				const { top, height } = getEventLayout(
					event.start_time,
					event.end_time,
					hourHeight,
					collapsed,
				);

				layouts[event.id] = {
					top,
					height,
					left: `calc(${dayWidthPercent * dayIndex + columnWidthPercent * column}% + ${
						column > 0 ? gapPx / 3 : 0
					}px)`,
					width: `calc(${columnWidthPercent}% - ${gapPx}px)`,
					hasOverlap: group.some(
						(item) => item.id !== event.id && doEventsOverlap(event, item),
					),
					overlapColumn: column,
					overlapColumnCount: columnCount,
				};
			}
		}
	}

	return layouts;
}
