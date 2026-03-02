"use client";

import { useEffect, useRef, useState } from "react";

// 15-minute countdown timer with full-screen overlay and end sound
export default function Timer() {
	const [remaining, setRemaining] = useState(0); // seconds
	const [running, setRunning] = useState(false);
	const intervalRef = useRef<number | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// initialize audio once
	useEffect(() => {
		// simple beep sound hosted externally or data URI
		audioRef.current = new Audio(
			"/assets/audio/electronic-alarm-ring-for-traditional-electronic-alarm-clock.mp3",
		);
	}, []);

	// start / stop timer
	useEffect(() => {
		if (running && remaining > 0) {
			// tick every second
			intervalRef.current = window.setInterval(() => {
				setRemaining((r) => r - 1);
			}, 1000);
		}

		if (!running && intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [running]);

	// play sound when timer finishes
	useEffect(() => {
		if (running && remaining <= 0) {
			setRunning(false);
			audioRef.current?.play();
		}
	}, [remaining, running]);

	const startTimer = () => {
		setRemaining(15 * 60);
		setRunning(true);
	};

	const cancel = () => {
		setRunning(false);
		setRemaining(0);
	};

	const formatTime = (sec: number) => {
		const m = Math.floor(sec / 60)
			.toString()
			.padStart(2, "0");
		const s = (sec % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	};

	return (
		<>
			<button
				onClick={startTimer}
				className="px-4 py-2 bg-blue-600 text-white rounded-md"
			>
				Start 15‑minute timer
			</button>

			{running && (
				<div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
					<div className="text-white text-8xl font-bold">
						{formatTime(remaining)}
					</div>
					<button
						onClick={cancel}
						className="mt-8 px-6 py-2 bg-red-500 text-white rounded-md"
					>
						Cancel
					</button>
				</div>
			)}
		</>
	);
}
