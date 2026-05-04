"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters long")
		.regex(/[A-Za-z]/, "Password must contain at least one letter")
		.regex(/\d/, "Password must contain at least one number"),
});

const RegisterPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
	const supabase = getSupabaseBrowserClient();
	const router = useRouter();

	const valideteEmail = (email: string) => {
		const result = registerSchema.shape.email.safeParse(email);

		if (!result.success) {
			setEmailError(result.error.issues[0].message);
		} else {
			setEmailError(null);
		}
	};
	const validetePassword = (password: string) => {
		const result = registerSchema.shape.password.safeParse(password);

		if (!result.success) {
			setPasswordErrors(result.error.issues.map((i) => i.message));
		} else {
			setPasswordErrors([]);
		}
	};

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setError(null);

		const result = registerSchema.safeParse({ email, password });

		if (!result.success) {
			const messages = result.error.issues.map((i) => i.message).join(", ");
			setError(messages);
			return;
		}

		const { data, error } = await supabase.auth.signUp({
			email: email,
			password: password,
			options: {
				emailRedirectTo: `${window.location.origin}/dashboard/day`,
			},
		});

		if (error) {
			setError(error.message);
			return;
		}

		if (data.user?.identities?.length === 0) {
			setError("This email is already registered. Try logging in instead.");
			return;
		}

		router.push("/auth/login");
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
						onChange={(e) => {
							const value = e.target.value;
							setEmail(value);
							valideteEmail(value);
						}}
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
						onChange={(e) => {
							const value = e.target.value;
							setPassword(value);
							validetePassword(value);
						}}
						value={password}
						required
					/>
					<button className="btn-primary" type="submit">
						Create account
					</button>

					{error && <div className="form-error">{error}</div>}
					{emailError && <div className="form-error">{emailError}</div>}
					{passwordErrors.length > 0 && (
						<div className="form-error">
							<ul>
								{passwordErrors.map((msg, index) => (
									<li key={index}>{msg}</li>
								))}
							</ul>
						</div>
					)}
				</form>
			</div>
		</main>
	);
};

export default RegisterPage;
