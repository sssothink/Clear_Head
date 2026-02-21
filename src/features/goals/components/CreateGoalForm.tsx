"use client";

import { useState } from "react";
import { GoalPeriod } from "@/lib/db/types";

const CreateGoalForm = ({
	onCreateGoal,
}: {
	onCreateGoal: (title: string, period: GoalPeriod) => void;
}) => {
	const [title, setTitle] = useState("");
	const [period, setPeriod] = useState<GoalPeriod>("day");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		onCreateGoal(title, period);
		setTitle("");
	};

	return (
		<form className="flex flex-col gap-2 w-lg" onSubmit={handleSubmit}>
			<input
				onChange={(e) => setTitle(e.target.value)}
				type="text"
				value={title}
				placeholder="goal title"
				className="p-2 w-lg"
				required
			/>

			<select
				value={period}
				onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
				className="border px-2 bg-black"
			>
				<option value="day">Today</option>
				<option value="week">This Week</option>
				<option value="month">This Month</option>
				<option value="year">This Year</option>
				<option value="someday">Someday</option>
			</select>

			<button className="px-5 py-1 border-2 w-fit cursor-pointer">add</button>
		</form>
	);
};

export default CreateGoalForm;
