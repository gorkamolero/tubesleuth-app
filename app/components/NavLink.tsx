import { cn } from "~/lib/utils";

import { Button } from "./ui/button";

export const NavLink = ({
	children,
	isCollapsed,
}: {
	children: React.ReactNode;
	isCollapsed: boolean;
}) => (
		<Button
			asChild
			className={cn(
				"flex items-center gap-2",
				isCollapsed && "h-9 w-9 shrink-0 justify-center p-0",
			)}
			aria-label="Account information"
			variant="ghost"
		>
			{children}
		</Button>
	);
