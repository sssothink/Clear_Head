import DashboardClient from "@/features/dashboard/DashboardClient";

import { getWeekGoals } from "@/lib/week/get-week-goals";

const DashboardPage = async () => {
	const { goals, weekStart } = await getWeekGoals(new Date());

	return (
		<DashboardClient initialGoals={goals} weekStart={weekStart.toISOString()} />
	);
};

export default DashboardPage;
