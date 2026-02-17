import { getGoals } from "@/lib/db/goals";
import GoalsClient from "./GoalsClient";

const DashboardPage = async () => {
	const goals = await getGoals();

	return (
		<main className="p-6">
			<h1 className="text-2xl font-bold">Your goals</h1>
			<GoalsClient initialGoals={goals} />
		</main>
	);
};

export default DashboardPage;
