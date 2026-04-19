"use client";

import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { motion } from "framer-motion";
import { DayEvent } from "../model/types";
import { toHHMM } from "@/lib/utils";

type DayListProps = {
	events: DayEvent[];
	onToggle: (id: string) => void;
};

export default function DayList({ events, onToggle }: DayListProps) {
	return (
		<ul className="flex flex-col gap-3">
			{events.map((event) => (
				<motion.div
					key={event.id}
					layout
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<Card
						className={cn(
							"glass flex items-center justify-between p-3 transition-all group",
							event.status === "completed" && "opacity-60",
						)}
					>
						<div>
							<p
								className={cn(
									"text-sm",
									event.status === "completed" &&
										"line-through text-muted-foreground",
								)}
							>
								{event.title}
							</p>
							<p className="text-xs text-muted-foreground">
								{toHHMM(event.start_time)} - {toHHMM(event.end_time)}
							</p>
						</div>

						<div className="flex gap-1">
							<Button
								size="sm"
								variant="ghost"
								onClick={() => onToggle(event.id)}
								className="border-2 rounded-[0.6em] cursor-pointer active:scale-97"
							>
								{event.status === "planned" ? (
									<Check size={20} />
								) : (
									<X size={20} />
								)}
							</Button>
						</div>
					</Card>
				</motion.div>
			))}
		</ul>
	);
}
