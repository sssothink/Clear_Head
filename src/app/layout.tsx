import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-brand",
});

export const metadata: Metadata = {
	title: "Clear Head",
	description: "A fast weekly planner for tasks, routines, and focused work.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${spaceGrotesk.variable} antialiased`}>
				<Header />
				{children}
			</body>
		</html>
	);
}
