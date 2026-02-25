"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const supabase = getSupabaseBrowserClient();
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		if (error) {
			setError(error.message);
		} else {
			router.push("/dashboard/day");
		}
	};

	return (
		<main className="p-6">
			<form className="flex flex-col gap-3" onSubmit={handleLogin}>
				<h1 className="text-2xl font-bold">Login</h1>
				<input
					className="p-2 w-lg"
					type="email"
					placeholder="Email"
					onChange={(e) => setEmail(e.target.value)}
					value={email}
					required
				/>
				<input
					className="p-2 w-lg"
					type="password"
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
					value={password}
					required
				/>
				<button
					className="bg-black text-white w-fit py-1 px-3 border-2 cursor-pointer"
					type="submit"
				>
					Login
				</button>

				{error && <p className="text-2xl text-red-500">{error}</p>}
			</form>
			<p className="text-xl mt-4">
				Confirm the email if you have just registered.
			</p>
		</main>
	);
};

export default loginPage;
