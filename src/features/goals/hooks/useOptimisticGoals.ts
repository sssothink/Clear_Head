import { DayEvent } from "../model/types";
import { useGoalEvents } from "./useGoalEvents";
import { useGoalActions } from "./useGoalActions";

/**
 * Комбинирует логику управления событиями целей и действий над ними с оптимистичным обновлением.
 * Предоставляет единый интерфейс для компонентов, работающих с целями.
 *
 * - useGoalEvents: управление состоянием событий
 * - useGoalActions: CRUD операции с откатами
 * - useRequestTracking: отслеживание версий для откатов (внутри useGoalActions)
 */
export function useOptimisticGoals(
	initialEvents: DayEvent[],
	weekStart: string,
) {
	const {
		events,
		addEvent,
		updateEvent,
		deleteEvent,
		deleteEventsByGoalId,
		replaceEvent,
		replaceGoalId,
		restoreEvent,
	} = useGoalEvents(initialEvents);

	const {
		isPending,
		createGoal,
		toggleComplete,
		updateGoal,
		updateGoalOccurrence,
		updateGoalSeries,
		deleteGoalOccurrence,
		deleteGoal,
	} = useGoalActions(
		events,
		{
			addEvent,
			updateEvent,
			deleteEvent,
			deleteEventsByGoalId,
			replaceEvent,
			replaceGoalId,
			restoreEvent,
		},
		weekStart,
	);

	return {
		events,
		isPending,
		createGoal,
		toggleComplete,
		updateGoal,
		updateGoalOccurrence,
		updateGoalSeries,
		deleteGoalOccurrence,
		replaceGoalId,
		deleteGoal,
	};
}
