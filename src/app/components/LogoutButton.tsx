"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
	const supabase = getSupabaseBrowserClient();
	const router = useRouter();

	return (
		<Link
			onClick={async () => await supabase.auth.signOut()}
			className="rounded-lg px-3 py-2 text-sm cursor-pointer"
			href="/auth/login"
		>
			Log out
		</Link>
	);
};

export default LogoutButton;
