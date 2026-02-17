import { Goal } from "@/lib/db/types";

const GoalsList = ({
	goals,
	onToggleGoalStatus,
	isPending,
}: {
	goals: Goal[];
	onToggleGoalStatus: (goal: Goal) => void;
	isPending: boolean;
}) => {
	return (
		<ul className="flex flex-col gap-3 mt-5 w-lg">
			{goals.map((goal) => (
				<li key={goal.id} className="flex items-center gap-4 justify-between">
					<p>{goal.title}</p>
					<button
						className="cursor-pointer px-5 py-1 border-2"
						onClick={() => onToggleGoalStatus(goal)}
						disabled={isPending}
					>
						{goal.status === "todo" ? "Done" : "Undo"}
					</button>
				</li>
			))}
		</ul>
	);
};

export default GoalsList;
