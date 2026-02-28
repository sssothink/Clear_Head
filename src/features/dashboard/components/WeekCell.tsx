type Props = {
	dayIndex: number;
	hourIndex: number;
	onClick: (slot: { dayIndex: number; hourIndex: number }) => void;
};
export default function WeekCell({ dayIndex, hourIndex, onClick }: Props) {
	return (
		<div
			className="h-20 border-r border-b border-border hover:bg-muted/40 transition-colors"
			onClick={() => onClick({ dayIndex, hourIndex })}
		></div>
	);
}
