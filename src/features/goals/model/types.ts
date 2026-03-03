export type RecurrenceType = "none" | "daily" | "weekly";
export type GoalStatus = "planned" | "completed";
export type ISODate = string;

export type SelectedSlot = {
	dayIndex: number;
	hourIndex: number;
	date: string;
};

export type DayEvent = {
	id: string;
	title: string;
	dayIndex: number;
	start_time: string;
	end_time: string;
	start_date?: string | null;
	status: GoalStatus;
};

export type Goal = {
	id: string;
	owner_id: string;

	title: string;

	start_time: string;
	end_time: string;

	start_date: string | null;

	recurrence_type: RecurrenceType;
	recurrence_days: number[] | null;
	recurrence_end: string | null;

	parent_id: string | null;

	created_at: string;
};
