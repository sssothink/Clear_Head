import { useRef } from "react";

/**
 * Отслеживает версии запросов для деталей откатов.
 * Используется для проверки, насколько актуально значение при обработке ошибок.
 */
export function useRequestTracking() {
	const requestVersion = useRef(new Map<string, number>());

	const bumpVersion = (id: string) => {
		const next = (requestVersion.current.get(id) ?? 0) + 1;
		requestVersion.current.set(id, next);
		return next;
	};

	const isLatest = (id: string, version: number) =>
		requestVersion.current.get(id) === version;

	const clear = (id: string) => {
		requestVersion.current.delete(id);
	};

	return {
		bumpVersion,
		isLatest,
		clear,
	};
}
