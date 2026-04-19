import { useOptimisticGoals } from "@/features/goals/hooks/useOptimisticGoals";

export type DashboardGoalState = Pick<
	ReturnType<typeof useOptimisticGoals>,
	| "events"
	| "isPending"
	| "createGoal"
	| "toggleComplete"
	| "deleteGoal"
	| "deleteGoalOccurrence"
	| "detachOccurrence"
	| "updateGoal"
	| "updateGoalFromDate"
>;
