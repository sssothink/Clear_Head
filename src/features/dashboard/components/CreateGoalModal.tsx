"use client";

import DayForm from "@/features/goals/day/DayForm";
import { SelectedSlot } from "@/features/goals/model/types";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";

export default function CreateGoalModal({
	slot,
	onClose,
}: {
	slot: SelectedSlot;
	onClose: () => void;
}) {
	const startHour = slot?.hourIndex.toString().padStart(2, "0") + ":00";
	const endHour =
		((slot?.hourIndex ?? 0) + 1).toString().padStart(2, "0") + ":00";

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogTitle>Create Goal</DialogTitle>
				<DayForm
					defaultStartTime={startHour}
					defaultEndTime={endHour}
					onCreateGoal={(data) => {
						console.log("Creating:", {
							...data,
							dayIndex: slot?.dayIndex,
						});

						onClose();
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
