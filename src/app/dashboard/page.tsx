import DashboardClient from "@/features/dashboard/DashboardClient";

import { getWeekGoals } from "@/lib/week/get-week-goals";
import { format } from "date-fns";

const DashboardPage = async () => {
	const { goals, weekStart } = await getWeekGoals(new Date());

	return (
		<DashboardClient
			initialGoals={goals}
			weekStart={format(weekStart, "yyyy-MM-dd")}
		/>
	);
};

export default DashboardPage;
