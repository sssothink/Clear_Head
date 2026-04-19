import { RecurrenceType } from "@/features/goals/model/types";
import { toHHMM } from "@/lib/utils";

type GoalDateTimeButtonProps = {
	date: string;
	startTime: string;
	endTime: string;
	recurrence: RecurrenceType;
	onToggle: (targetRect: DOMRect) => void;
};

export function GoalDateTimeButton({
	date,
	startTime,
	endTime,
	recurrence,
	onToggle,
}: GoalDateTimeButtonProps) {
	return (
		<div className="goal-header">
			<button
				className="goal-datetime"
				type="button"
				onClick={(e) => {
					const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
					onToggle(rect);
				}}
			>
				{date || "Pick date"} - {toHHMM(startTime)} - {toHHMM(endTime)}
				<span className="goal-repeat">{recurrence}</span>
			</button>
		</div>
	);
}
