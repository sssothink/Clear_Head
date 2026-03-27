import { DashboardScreen } from "@/features/dashboard";
import { getWeekGoals } from "@/lib/week/get-week-goals";
import { formatISODate } from "@/shared/lib/date";

const DashboardPage = async () => {
	const { goals, weekStart, occurrences } = await getWeekGoals(new Date());

	return (
		<DashboardScreen
			initialGoals={goals}
			initialOccurrences={occurrences}
			weekStart={formatISODate(weekStart)}
		/>
	);
};

export default DashboardPage;
