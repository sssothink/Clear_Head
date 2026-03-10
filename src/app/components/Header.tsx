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
		<header className="flex justify-between p-4">
			<h1 className="text-2xl font-bold">Clear Head</h1>
			<nav>
				<Link className="text-white bg-black m-2" href="/dashboard">
					Dashboard
				</Link>

				{user ? (
					<LogoutButton />
				) : (
					<>
						<Link className="text-white bg-black m-2" href="/auth/register">
							Register
						</Link>
						<Link className="text-white bg-black m-2" href="/auth/login">
							Log in
						</Link>
					</>
				)}
			</nav>
		</header>
	);
};

export default Header;
