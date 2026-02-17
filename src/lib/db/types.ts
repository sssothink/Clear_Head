export type GoalStatus = "todo" | "done";

export type Goal = {
	id: string;
	title: string;
	description: string;
	status: GoalStatus;
	owner_id: string;
	created_at: string;
	due_date: string | null;
};
