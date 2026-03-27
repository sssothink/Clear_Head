import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/shared/lib/cn";

const buttonVariants = cva(
	"inline-flex items-center hover:bg-primary-foreground justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium select-none transition-colors duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "text-btn-text hover:text-primary active:brightness-95",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
				ghost:
					"text-foreground hover:bg-muted hover:text-accent active:bg-muted/80",
				outline:
					"bg-transparent text-foreground hover:bg-muted hover:border-muted-foreground/40",
				destructive:
					"text-destructive hover:text-destructive-foreground active:brightness-95",
				link: "text-accent underline-offset-4 hover:underline",
			},
			size: {
				xs: "h-7 px-2.5 text-xs",
				sm: "h-8 px-3 text-sm",
				default: "h-9 px-4 text-base",
				lg: "h-10 px-5 text-base",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
