import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
	const supabase = await createSupabaseServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login");
	}

	return (
		<>
			<main className="p-6">
				<h1 className="text-2xl font-bold">HELLO IN DASHBOARD</h1>
				{user && <p>{user.email}</p>}
			</main>
		</>
	);
};

export default DashboardPage;
