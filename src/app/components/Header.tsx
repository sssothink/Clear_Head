"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const Header = () => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const supabase = getSupabaseBrowserClient();

		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	return (
		<header className="border-b" style={{ borderColor: "var(--border)" }}>
			<div className="container flex items-center justify-between py-4">
				<h1 className="text-xl font-semibold tracking-tight">
					<Link href="/">Clear Head</Link>
				</h1>
				<nav className="flex items-center gap-2">
					<Link className="rounded-lg px-3 py-2 text-sm" href="/dashboard">
						Dashboard
					</Link>

					{user ? (
						<LogoutButton />
					) : (
						<>
							<Link
								className="rounded-lg px-3 py-2 text-sm"
								href="/auth/register"
							>
								Register
							</Link>
							<Link className="rounded-lg px-3 py-2 text-sm" href="/auth/login">
								Log in
							</Link>
						</>
					)}
				</nav>
			</div>
		</header>
	);
};

export default Header;
