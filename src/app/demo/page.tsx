import DemoPageClient from "@/features/dashboard/demo/demo-page-client";
import { Suspense } from "react";

export default function DemoPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 sm:py-6">
					<div className="text-sm font-semibold text-muted-foreground">
						Loading demo...
					</div>
				</div>
			}
		>
			<DemoPageClient />
		</Suspense>
	);
}
