"use client";

import { Goal } from "@/lib/db/types";
import { useState } from "react";

const GoalsList = ({
	goals,
	onToggleGoalStatus,
	onDeleteGoal,
	onEditGoal,
	isPending,
}: {
	goals: Goal[];
	onToggleGoalStatus: (goal: Goal) => void;
	onDeleteGoal: (id: string) => void;
	onEditGoal: (goal: Goal, title: string) => void;
	isPending: boolean;
}) => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState("");

	return (
		<ul className="flex flex-col gap-3 mt-5 w-lg">
			{goals.map((goal) => (
				<li key={goal.id} className="flex items-center gap-4 justify-between">
					{editingId === goal.id ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								onEditGoal(goal, editValue);
								setEditingId(null);
							}}
						>
							<input
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								className="border px-2"
							/>
							<button
								type="submit"
								className="ml-2 px-3 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
							>
								Save
							</button>
						</form>
					) : (
						<div className="flex items-center justify-between gap-4 w-full">
							<p className="text-lime-100">{goal.title}</p>

							<div className="flex gap-2">
								<button
									className="cursor-pointer px-5 py-1 border-2"
									onClick={() => onToggleGoalStatus(goal)}
									disabled={isPending}
								>
									{goal.status === "todo" ? "Done" : "Undo"}
								</button>

								<button
									className="cursor-pointer px-5 py-1 border-2"
									onClick={() => {
										setEditingId(goal.id);
										setEditValue(goal.title);
									}}
									disabled={isPending}
								>
									Edit
								</button>

								<button
									className="cursor-pointer px-5 py-1 border-2 bg-red-500 text-white hover:bg-red-600"
									onClick={() => onDeleteGoal(goal.id)}
									disabled={isPending}
								>
									Delete
								</button>
							</div>
						</div>
					)}
				</li>
			))}
		</ul>
	);
};

export default GoalsList;
