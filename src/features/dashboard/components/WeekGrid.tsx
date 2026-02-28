import WeekCell from "./WeekCell";

type Props = {
	onCellClick: (slot: { dayIndex: number; hourIndex: number }) => void;
};

export default function WeekGrid({ onCellClick }: Props) {
	const hours = Array.from({ length: 24 });
	const days = Array.from({ length: 7 });

	return (
		<div className="flex-1">
			<div className="grid grid-cols-7 grid-rows-24">
				{hours.map((_, hourIndex) =>
					days.map((_, dayIndex) => (
						<WeekCell
							key={`${dayIndex}-${hourIndex}`}
							dayIndex={dayIndex}
							hourIndex={hourIndex}
							onClick={onCellClick}
						/>
					)),
				)}
			</div>
		</div>
	);
}
