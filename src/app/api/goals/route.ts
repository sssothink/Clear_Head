import { createGoal, toggleGoalStatus } from "@/lib/db/goals";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { title } = await req.json();

	await createGoal(title);

	return NextResponse.json({ message: "Goal created successfully" });
}
export async function PATCH(req: Request) {
	const { id, status } = await req.json();

	await toggleGoalStatus(id, status);

	return NextResponse.json({ ok: true });
}
