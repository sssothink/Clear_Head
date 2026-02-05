"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
	const supabase = getSupabaseBrowserClient();
	const router = useRouter();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/auth/login");
	};

	return (
		<button onClick={handleLogout} className="text-white bg-black m-2">
			Log out
		</button>
	);
};

export default LogoutButton;
