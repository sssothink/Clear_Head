import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

async function getLandingUser() {
	try {
		const supabase = await createSupabaseServerClient();
		const { data } = await supabase.auth.getUser();
		return data.user;
	} catch {
		return null;
	}
}

export default async function HomePage() {
	const user = await getLandingUser();
	const isLoggedIn = Boolean(user);

	return (
		<main className="landing-shell">
			<section className="landing-hero">
				<div className="container">
					<div className="landing-hero-inner">
						<div className="landing-copy">
							<div className="landing-badge">Focus & Flow</div>
							<h1>Clear Head</h1>
							<p className="landing-lead">
								A weekly planner for tasks that need time, attention, and a
								clear place in your day.
							</p>
							<p className="landing-subcopy">
								Create tasks, resize time blocks, drag plans between days, handle
								recurring routines, and keep overlapping work readable with smart
								calendar columns.
							</p>

							<div className="landing-actions">
								<Link
									className="landing-button landing-button-primary"
									href={isLoggedIn ? "/dashboard" : "/auth/register"}
								>
									{isLoggedIn ? "Open dashboard" : "Start"}
								</Link>

								{!isLoggedIn && (
									<Link
										className="landing-button landing-button-secondary"
										href="/demo"
									>
										View demo
									</Link>
								)}
							</div>
						</div>

						<div className="landing-preview" aria-hidden="true">
							<div className="landing-preview-top">
								<span>Mon</span>
								<span>Tue</span>
								<span>Wed</span>
							</div>
							<div className="landing-preview-grid">
								<div className="landing-preview-task landing-preview-task-a">
									Deep work
								</div>
								<div className="landing-preview-task landing-preview-task-b">
									Design review
								</div>
								<div className="landing-preview-task landing-preview-task-c">
									Daily review
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="landing-section">
				<div className="container landing-feature-grid">
					<div className="landing-feature">
						<h2>Full planner after registration</h2>
						<p>
							Your account unlocks persistent tasks, weekly navigation,
							recurring schedules, completion state, editing, deletion, drag and
							drop, resize, and all conflict protection.
						</p>
					</div>
					<div className="landing-feature">
						<h2>Built for speed</h2>
						<p>
							The registered dashboard uses optimistic updates, so creating,
							moving, resizing, and deleting tasks feels instant while changes
							sync safely in the background.
						</p>
					</div>
					<div className="landing-feature">
						<h2>Try before signing up</h2>
						<p>
							The demo lets guests explore the full interaction model in this
							browser. Registration removes demo limits and saves your real
							workspace.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
