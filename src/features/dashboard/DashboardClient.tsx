"use client";

import { useState } from "react";
import TimeColumn from "./components/TimeColumn";
import WeekGrid from "./components/WeekGrid";
import WeekHeader from "./components/WeekHeader";
import CreateGoalModal from "./components/CreateGoalModal";
import { SelectedSlot } from "../goals/model/types";

export default function DashboardClient() {
	const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>(null);

	return (
		<div className="flex flex-col bg-background">
			<WeekHeader />
			<div className="flex flex-1">
				<TimeColumn />
				<WeekGrid onCellClick={setSelectedSlot} />
			</div>

			{selectedSlot && (
				<CreateGoalModal
					slot={selectedSlot}
					onClose={() => setSelectedSlot(null)}
				/>
			)}
		</div>
	);
}
