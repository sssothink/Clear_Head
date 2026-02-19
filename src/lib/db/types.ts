export type GoalStatus = "todo" | "done";
export type GoalPeriod = "day" | "week" | "month" | "year" | "someday";

export type Goal = {
	id: string;
	title: string;
	description: string;
	status: GoalStatus;
	period: GoalPeriod;
	owner_id: string;
	created_at: string;
	due_date: string | null;
};
