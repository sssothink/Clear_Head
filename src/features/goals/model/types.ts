export const PERIOD_ORDER = [
	"day",
	"week",
	"month",
	"year",
	"someday",
] as const;

export const PERIOD_LABEL: Record<string, string> = {
	day: "Today",
	week: "This Week",
	month: "This Month",
	year: "This Year",
	someday: "Someday",
};
