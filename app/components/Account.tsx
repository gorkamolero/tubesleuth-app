"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

import { Button } from "./ui/button";

interface AccountProps {
	isCollapsed: boolean;
}

export function Account({ isCollapsed }: AccountProps) {
	const placeholderAccount = {
		icon: (
			<svg
				role="img"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>iCloud</title>
				<path
					d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"
					fill="currentColor"
				/>
			</svg>
		),
		label: "Random User",
		email: "random@example.com",
	};

	return (
		<Button
			className={cn(
				"flex items-center gap-2",
				isCollapsed && "h-9 w-9 shrink-0 justify-center",
			)}
			aria-label="Account information"
			variant="outline"
		>
			{placeholderAccount.icon}
			<span className={cn("ml-2", isCollapsed && "hidden")}>
				{placeholderAccount.label}
			</span>
		</Button>
	);
}
