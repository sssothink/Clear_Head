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
		<main className="auth-shell">
			<div className="auth-card container">
				<div className="auth-head">
					<div className="badge">Get started</div>
					<h1>Create account</h1>
				</div>

				<form className="auth-form" onSubmit={handleRegister}>
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
					<label htmlFor="password" className="form-label">
						Password
					</label>
					<input
						id="password"
						className="form-input"
						type="Password"
						placeholder="minimum 8 characters"
						onChange={(e) => setPassword(e.target.value)}
						value={password}
						required
					/>
					<button className="btn-primary" type="submit">
						Create account
					</button>

					{error && <div className="form-error">{error}</div>}
				</form>
			</div>
		</main>
	);
};

export default RegisterPage;
