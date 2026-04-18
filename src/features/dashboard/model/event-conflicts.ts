import type { DayEvent } from "@/features/goals/model/types";
import { durationMinutes, timeToMinutes } from "@/shared/lib/time";

export const MAX_CONCURRENT_EVENTS = 3;

type EventConflictInput = Pick<
	DayEvent,
	"id" | "dayIndex" | "start_time" | "end_time"
>;

function getRange(event: EventConflictInput) {
	const start = timeToMinutes(event.start_time);
	const duration = durationMinutes(event.start_time, event.end_time);

	return {
		start,
		end: Math.min(start + duration, 24 * 60),
	};
}

function getMaxConcurrentEvents(events: EventConflictInput[]) {
	const points: { minute: number; delta: number }[] = [];

	for (const event of events) {
		const range = getRange(event);

		points.push({ minute: range.start, delta: 1 });
		points.push({ minute: range.end, delta: -1 });
	}

	points.sort((a, b) => {
		if (a.minute !== b.minute) return a.minute - b.minute;

		return a.delta - b.delta;
	});

	let active = 0;
	let maxActive = 0;

	for (const point of points) {
		active += point.delta;
		maxActive = Math.max(maxActive, active);
	}

	return maxActive;
}

export function exceedsMaxConcurrentEvents(
	events: EventConflictInput[],
	candidate: EventConflictInput,
	maxConcurrentEvents = MAX_CONCURRENT_EVENTS,
) {
	const dayEvents = events.filter(
		(event) => event.dayIndex === candidate.dayIndex,
	);
	const eventsWithoutCandidate = dayEvents.filter(
		(event) => event.id !== candidate.id,
	);

	return (
		getMaxConcurrentEvents([...eventsWithoutCandidate, candidate]) >
		maxConcurrentEvents
	);
}
