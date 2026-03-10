import { getDayEvents } from "@/lib/goals/day-service";
import DayClient from "@/features/goals/day/DayClient";
import { format } from "date-fns";

export default async function DayPage() {
	const today = format(new Date(), "yyyy-MM-dd");

	const events = await getDayEvents(today);

	return <DayClient initialEvents={events} date={today} />;
}
