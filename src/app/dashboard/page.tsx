import { getGoals, GoalsClient } from "@/features/goals";

const DashboardPage = async () => {
	const goals = await getGoals();

	return <GoalsClient initialGoals={goals} />;
};

export default DashboardPage;
