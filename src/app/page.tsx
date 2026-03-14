export default function HomePage() {
	return (
		<main>
			<section className="section">
				<div className="container">
					<div className="card p-8">
						<div className="badge">Focus & Flow</div>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight">
							Сосредоточься на важном
						</h2>
						<p className="mt-2 text-base" style={{ color: "var(--muted)" }}>
							Планируй задачи, отслеживай прогресс и освобождай голову от
							лишнего.
						</p>

						<div className="mt-6 flex gap-3">
							<button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-white text-sm">
								Начать
							</button>
							<button className="rounded-lg border px-4 py-2 text-sm">
								Посмотреть демо
							</button>
						</div>
					</div>
				</div>
			</section>
			<section className="section">
				<div className="container grid gap-4 md:grid-cols-3">
					<div className="fade-up card p-6">
						<h3 className="text-lg font-semibold">Ясные приоритеты</h3>
						<p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
							Фильтрация и статус‑метки для контроля нагрузки.
						</p>
					</div>
					<div className="fade-up card p-6">
						<h3 className="text-lg font-semibold">Контроль времени</h3>
						<p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
							Планируй прогресс и отслеживай время, чтобы получить больше.
						</p>
					</div>
					<div className="fade-up card p-6">
						<h3 className="text-lg font-semibold">Отслеживание финансов</h3>
						<p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
							Контролируй расходы и планируй важные покупки.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
