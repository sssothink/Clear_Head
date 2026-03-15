"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
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
			router.push("/");
		}
	};

	return (
		<main className="auth-shell">
			<div className="auth-card container">
				<div className="auth-head">
					<h1>Log in</h1>
					<p>Log in to continue using Clear Head</p>
				</div>

				<form className="auth-form" onSubmit={handleLogin}>
					<label htmlFor="email" className="form-label">
						Email
					</label>
					<input
						id="email"
						className="form-input"
						type="email"
						placeholder="your@email.com"
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						required
					/>
					<label className="form-label" htmlFor="password">
						Password
					</label>
					<input
						id="password"
						className="form-input"
						type="password"
						placeholder="••••••••"
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						required
					/>
					<button className="btn-primary mt-2" type="submit">
						Login
					</button>

					{error && <div className="form-error">{error}</div>}
				</form>
				<p className="form-help mt-4">
					Confirm the email if you have just registered.
				</p>
			</div>
		</main>
	);
};

export default LoginPage;
