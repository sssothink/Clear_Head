import { getDayEvents } from "@/lib/goals/day-service";
import DayClient from "@/features/goals/day/DayClient";

export default async function DayPage() {
	const today = new Date().toISOString().split("T")[0];

	const events = await getDayEvents(today);

	return <DayClient initialEvents={events} date={today} />;
}
