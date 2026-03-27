import * as React from "react";

import { cn } from "@/shared/lib/cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"text-text placeholder:text-muted-foreground border-input w-full min-h-24 rounded-md border bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				"focus-visible:border-ring focus-visible:ring-ring/10 focus-visible:ring-[1px]",
				"resize-none overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
				"aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
