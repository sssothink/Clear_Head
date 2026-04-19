import { RefObject, useEffect } from "react";

export function useOutsideClick<T extends HTMLElement>(
	ref: RefObject<T | null>,
	onOutside: () => void,
	enabled = true,
	ignoreRefs: Array<RefObject<HTMLElement | null>> = [],
) {
	useEffect(() => {
		if (!enabled) return;

		const handlePointerDown = (event: MouseEvent | TouchEvent) => {
			const node = ref.current;
			if (!node) return;

			if (node.contains(event.target as Node)) return;

			const clickedIgnoredNode = ignoreRefs.some((ignoredRef) => {
				const ignoredNode = ignoredRef.current;
				return ignoredNode ? ignoredNode.contains(event.target as Node) : false;
			});

			if (clickedIgnoredNode) return;

			onOutside();
		};

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("touchstart", handlePointerDown);

		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("touchstart", handlePointerDown);
		};
	}, [enabled, ref, onOutside, ignoreRefs]);
}
