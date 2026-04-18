import { DashboardScreen } from "@/features/dashboard";
import { getWeekGoals } from "@/lib/week/get-week-goals";
import { formatISODate } from "@/shared/lib/date";
import { isValid, parseISO } from "date-fns";

type DashboardPageProps = {
	searchParams?: Promise<{ week?: string | string[] }>;
};

function getDashboardDate(weekParam?: string | string[]) {
	const rawWeek = Array.isArray(weekParam) ? weekParam[0] : weekParam;

	if (!rawWeek) {
		return new Date();
	}

	const parsedDate = parseISO(rawWeek);

	if (!isValid(parsedDate)) {
		return new Date();
	}

	return parsedDate;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
	const params = await searchParams;
	const dashboardDate = getDashboardDate(params?.week);

	const { goals, weekStart, occurrences } = await getWeekGoals(dashboardDate);

	return (
		<DashboardScreen
			initialGoals={goals}
			initialOccurrences={occurrences}
			weekStart={formatISODate(weekStart)}
		/>
	);
};

export default DashboardPage;
