"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
	const supabase = getSupabaseBrowserClient();
	const router = useRouter();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.replace("/auth/login");
	};

	return (
		<button onClick={handleLogout} className="site-nav-link" type="button">
			Log out
		</button>
	);
};

export default LogoutButton;
