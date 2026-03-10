"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RegisterPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseBrowserClient();
	const router = useRouter();

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const { error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				emailRedirectTo: `${window.location.origin}/dashboard/day`,
			},
		});

		if (error) {
			setError(error.message);
		} else {
			router.push("/auth/login");
		}
	};

	return (
		<main className="p-6">
			<form className="flex flex-col gap-1" onSubmit={handleRegister}>
				<h1 className="text-2xl font-bold">Register form</h1>
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
					type="Password"
					placeholder="Password"
					onChange={(e) => setPassword(e.target.value)}
					value={password}
					required
				/>
				<button className="bg-black text-white w-fit p-2" type="submit">
					Register
				</button>

				{error && <p className="text-2xl text-red-500">{error}</p>}
			</form>
		</main>
	);
};

export default RegisterPage;
