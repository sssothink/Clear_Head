type Props = {
	onClick: () => void;
};
export default function WeekCell({ onClick }: Props) {
	return (
		<div
			className="h-15 border-r border-b border-border hover:bg-muted/40 transition-colors"
			onClick={onClick}
		></div>
	);
}
