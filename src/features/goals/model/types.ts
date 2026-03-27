export const RECURRENCE_TYPES = ["none", "daily", "weekly"] as const;
export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export const GOAL_STATUSES = ["planned", "completed"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export function isRecurrenceType(value: string): value is RecurrenceType {
	return RECURRENCE_TYPES.includes(value as RecurrenceType);
}

export type GoalOccurrence = {
	goal_id: string;
	date: string;
	status: GoalStatus;
	title?: string | null;
	description?: string | null;
	start_time?: string | null;
	end_time?: string | null;
	is_deleted?: boolean | null;
};

export type SelectedSlot = {
	dayIndex: number;
	hourIndex: number;
	date: string;
};

export type DayEvent = {
	id: string;
	goal_id: string;
	occurrence_date: string;
	title: string;
	description?: string;
	dayIndex: number;
	start_time: string;
	end_time: string;
	start_date?: string | null;
	status: GoalStatus;
	recurrence_type?: RecurrenceType;
	recurrence_days?: number[] | null;
};

export type Goal = {
	id: string;
	owner_id: string;

	title: string;
	description?: string;

	start_time: string;
	end_time: string;

	start_date: string | null;

	recurrence_type: RecurrenceType;
	recurrence_days: number[] | null;
	recurrence_end: string | null;

	parent_id: string | null;

	created_at: string;
};
