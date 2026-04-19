import { Goal, GoalOccurrence } from "@/features/goals/model/types";
import { createDemoSeedData } from "./demo-seed";

const DEMO_GOALS_KEY = "clean-head-demo-goals";
const DEMO_OCCURRENCES_KEY = "clean-head-demo-occurrences";

type DemoStorageState = {
	goals: Goal[];
	occurrences: GoalOccurrence[];
};

function safeParse<T>(value: string | null): T | null {
	if (!value) return null;

	try {
		return JSON.parse(value) as T;
	} catch {
		return null;
	}
}

export function loadDemoState(): DemoStorageState {
	if (typeof window === "undefined") {
		return createDemoSeedData();
	}

	const goals = safeParse<Goal[]>(window.localStorage.getItem(DEMO_GOALS_KEY));
	const occurrence = safeParse<GoalOccurrence[]>(
		window.localStorage.getItem(DEMO_OCCURRENCES_KEY),
	);

	if (!goals) {
		const seed = createDemoSeedData();
		saveDemoState(seed);
		return seed;
	}

	return {
		goals,
		occurrences: occurrence ?? [],
	};
}

export function saveDemoState(state: DemoStorageState) {
	if (typeof window === "undefined") return;

	window.localStorage.setItem(DEMO_GOALS_KEY, JSON.stringify(state.goals));
	window.localStorage.setItem(
		DEMO_OCCURRENCES_KEY,
		JSON.stringify(state.occurrences),
	);
}

export function resetDemoState() {
	const seed = createDemoSeedData();
	saveDemoState(seed);
	return seed;
}
