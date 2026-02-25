import { redirect } from "next/navigation";

const DashboardPage = async () => {
	redirect("/dashboard/day");
};

export default DashboardPage;
