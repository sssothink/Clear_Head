"use client";

import DayForm from "@/features/goals/day/DayForm";
import { SelectedSlot } from "@/features/goals/model/types";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";

type GoalModalProps = {
	slot?: SelectedSlot;
	onClose: () => void;
	onSubmit: (data: {
		title: string;
		start_time: string;
		end_time: string;
		date: string;
		recurrence_type: "none" | "daily" | "weekly";
		recurrence_days?: number[];
	}) => void;
	initialData?: {
		title: string;
		start_time: string;
		end_time: string;
		date: string;
	};
};

export default function CreateGoal({
	slot,
	onClose,
	onSubmit,
	initialData,
}: GoalModalProps) {
	const startHour =
		initialData?.start_time ||
		slot?.hourIndex.toString().padStart(2, "0") + ":00";
	const endHour =
		initialData?.end_time ||
		((slot?.hourIndex ?? 0) + 1).toString().padStart(2, "0") + ":00";
	const dateDefault = initialData?.date || slot?.date;
	const titleDefault = initialData?.title;

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogTitle>{initialData ? "Edit Goal" : "Create Goal"}</DialogTitle>
				<DayForm
					defaultTitle={titleDefault}
					defaultStartTime={startHour}
					defaultEndTime={endHour}
					defaultDate={dateDefault}
					onSubmit={(data) => {
						onSubmit({
							title: data.title,
							start_time: data.start_time,
							end_time: data.end_time,
							date: data.date,
							recurrence_type: data.recurrence_type,
							recurrence_days: data.recurrence_days,
						});
						onClose();
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
