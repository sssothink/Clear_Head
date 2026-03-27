import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

type TimeWheelProps = {
	value: string;
	options: string[];
	onChange: (value: string, source: "click" | "wheel") => void;
	isDisabledOption?: (value: string) => boolean;
	restrictWheelToEnabled?: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(" ");
}

export default function TimeWheel({
	value,
	onChange,
	options,
	isDisabledOption,
	restrictWheelToEnabled,
}: TimeWheelProps) {
	const trackRef = useRef<HTMLDivElement | null>(null);

	const safeOptions = useMemo(
		() => (options.length ? options : ["00:00"]),
		[options],
	);

	useLayoutEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		const selected = track.querySelector<HTMLButtonElement>(
			`button[data-value='${value}']`,
		);
		if (!selected) return;

		// Scroll only inside the wheel container; never affect page scroll.
		const targetScrollTop =
			selected.offsetTop - (track.clientHeight - selected.clientHeight) / 2;
		const maxScrollTop = Math.max(0, track.scrollHeight - track.clientHeight);
		track.scrollTop = Math.min(Math.max(0, targetScrollTop), maxScrollTop);
	}, [value, safeOptions]);

	const handleSelect = (next: string, disabled: boolean) => {
		if (disabled) return;
		onChange(next, "click");
	};

	useEffect(() => {
		if (!restrictWheelToEnabled) return;
		const node = trackRef.current;
		if (!node) return;

		const onNativeWheel = (event: WheelEvent) => {
			event.preventDefault();
			event.stopPropagation();

			const enabledOptions = safeOptions.filter(
				(item) => !(isDisabledOption?.(item) ?? false),
			);

			if (enabledOptions.length === 0) return;

			const currentIndex = enabledOptions.indexOf(value);
			const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
			const nextIndex =
				event.deltaY > 0
					? Math.min(fallbackIndex + 1, enabledOptions.length - 1)
					: Math.max(fallbackIndex - 1, 0);

			const nextValue = enabledOptions[nextIndex];
			if (nextValue && nextValue !== value) {
				onChange(nextValue, "wheel");
			}
		};

		node.addEventListener("wheel", onNativeWheel, { passive: false });
		return () => node.removeEventListener("wheel", onNativeWheel);
	}, [restrictWheelToEnabled, safeOptions, isDisabledOption, value, onChange]);

	return (
		<div className="w-full">
			<div className="wheel">
				<div className="wheel-center" />
				<div
					ref={trackRef}
					className={cn(
						"wheel-track",
						restrictWheelToEnabled && "wheel-track--locked",
					)}
				>
					{safeOptions.map((time) => {
						const selected = time === value;
						const disabled = isDisabledOption?.(time) ?? false;

						return (
							<button
								key={time}
								type="button"
								data-value={time}
								disabled={disabled}
								className={cn(
									"wheel-item",
									selected && "wheel-item--selected",
									disabled && "wheel-item--disabled",
								)}
								onClick={() => handleSelect(time, disabled)}
							>
								{time}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
