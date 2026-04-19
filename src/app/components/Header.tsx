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
		<header className="site-header">
			<div className="container site-header-inner">
				<h1 className="site-brand">
					<Link href="/">
						<span>Clear Head</span>
					</Link>
				</h1>
				<nav className="site-nav">
					<Link className="site-nav-link" href="/dashboard">
						Dashboard
					</Link>

					{user ? (
						<LogoutButton />
					) : (
						<>
							<Link
								className="site-nav-link site-nav-link-primary"
								href="/auth/register"
							>
								Register
							</Link>
							<Link className="site-nav-link" href="/auth/login">
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
