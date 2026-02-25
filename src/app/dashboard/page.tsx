import WeekClient from "@/features/goals/week/WeekClient";
import { getWeekEvents } from "@/lib/goals/queries";

const DashboardPage = async ({
	searchParams,
}: {
	searchParams: { date?: string };
}) => {
	const baseDate = searchParams.date ?? new Date().toISOString().split("T")[0];

	const weekEvets = await getWeekEvents(baseDate);
	return <WeekClient baseDate={baseDate} weekEvents={weekEvets} />;
};

export default DashboardPage;
