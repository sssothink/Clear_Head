"use client";

import { useState } from "react";

const CreateGoalForm = ({
	onCreateGoal,
	isPending,
}: {
	onCreateGoal: (title: string) => void;
	isPending: boolean;
}) => {
	const [title, setTitle] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		onCreateGoal(title);
		setTitle("");
	};

	return (
		<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
			<input
				onChange={(e) => setTitle(e.target.value)}
				type="text"
				value={title}
				placeholder="goal title"
				className="p-2 w-lg"
				required
			/>

			<button
				className="px-5 py-1 border-2 w-fit cursor-pointer"
				disabled={isPending}
			>
				add
			</button>
		</form>
	);
};

export default CreateGoalForm;
